import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { users, vms, VM, User } from './models/store';
import { startShellSession } from './services/ssh';

// Extend Express Request
interface AuthRequest extends Request {
  user?: User;
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// --- Mock Authentication Middleware ---
const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  // For prototype, any token is valid and maps to the first user
  if (!token) {
    // In a real app, strict check. Here, let's just warn or allow for easy testing?
    // Let's enforce it to be realistic.
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.user = users[0];
  next();
};

// --- API Endpoints ---

// Mock GitHub Login
app.post('/auth/github', (req: Request, res: Response) => {
  const user = users[0];
  res.json({ token: 'mock-jwt-token', user });
});

// Get Current User
app.get('/users/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

// Upgrade Plan (Demo Helper)
app.post('/users/me/upgrade', authenticate, (req: AuthRequest, res: Response) => {
  if (req.user) {
    req.user.plan = 'pro';
    res.json({ success: true, user: req.user });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Downgrade Plan (Demo Helper)
app.post('/users/me/downgrade', authenticate, (req: AuthRequest, res: Response) => {
  if (req.user) {
    req.user.plan = 'free';
    res.json({ success: true, user: req.user });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});


// List VMs
app.get('/vms', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userVms = vms.filter(v => v.userId === req.user!.id);
  res.json(userVms);
});

// Add VM
app.post('/vms', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, type, host, port, username, privateKey, password } = req.body;

  // --- PRICING LOGIC ---
  if (type === 'cloud' && req.user!.plan === 'free') {
    res.status(403).json({
      error: 'Upgrade to Pro to use Cloud VMs.',
      code: 'PLAN_LIMIT_REACHED'
    });
    return;
  }

  const newVM: VM = {
    id: Date.now().toString(),
    userId: req.user!.id,
    name,
    type, // 'local' or 'cloud'
    host,
    port: port || 22,
    username,
    privateKey,
    password
  };

  vms.push(newVM);
  res.status(201).json(newVM);
});

// --- Socket.io for Terminal ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start_session', (vmId: string) => {
    // Ideally we verify auth here too (via socket handshake auth)
    // For prototype, just find the VM
    const vm = vms.find((v) => v.id === vmId);
    if (!vm) {
      socket.emit('output', '\r\nVM not found.\r\n');
      return;
    }

    startShellSession(vm, socket);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
