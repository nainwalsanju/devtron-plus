import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { users, vms, VM, User } from './models/store';
import { startShellSession } from './services/ssh';

// Simple .env loader for prototype (replaces dotenv dependency)
const loadEnv = () => {
  try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
    }
  } catch (err) {
    console.warn('Could not load .env file, relying on environment variables.');
  }
};

loadEnv();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
const ACTUAL_SECRET = JWT_SECRET || 'dev-secret-key-fallback';

// Simple JWT implementation using HS256
function signToken(payload: any, expiresInSeconds: number = 3600): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', ACTUAL_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', ACTUAL_SECRET).update(`${header}.${body}`).digest('base64url');

    // Constant-time comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

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
  let token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Handle Bearer token prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  const user = users.find(u => u.id === decoded.userId);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  req.user = user;
  next();
};

// --- API Endpoints ---

// Mock GitHub Login
app.post('/auth/github', (req: Request, res: Response) => {
  const user = users[0];
  const token = signToken({ userId: user.id });
  res.json({ token, user });
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
