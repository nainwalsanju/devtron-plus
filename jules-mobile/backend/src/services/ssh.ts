import { Client } from 'ssh2';
import { Socket } from 'socket.io';
import { VM } from '../models/store';

export function startShellSession(vm: VM, socket: Socket) {
  if (vm.host === 'mock') {
    startMockSession(socket);
    return;
  }

  const conn = new Client();

  conn.on('ready', () => {
    socket.emit('output', `\r\nConnected to ${vm.host}...\r\n`);

    // Default to xterm
    conn.shell({ term: 'xterm-256color' }, (err, stream) => {
      if (err) {
        socket.emit('output', `\r\nShell Error: ${err.message}\r\n`);
        return conn.end();
      }

      // Relay data from SSH to Socket
      stream.on('data', (data: Buffer) => {
        socket.emit('output', data.toString('utf-8'));
      });

      stream.on('close', () => {
        socket.emit('output', '\r\nConnection closed.\r\n');
        conn.end();
      });

      // Relay data from Socket to SSH
      socket.on('input', (data: string) => {
        stream.write(data);
      });

      // Handle terminal resize
      socket.on('resize', (data: { rows: number, cols: number }) => {
        stream.setWindow(data.rows, data.cols, 0, 0);
      });

      socket.on('disconnect', () => {
        conn.end();
      });

    });
  }).on('error', (err: any) => {
    socket.emit('output', `\r\nConnection Error: ${err.message}\r\n`);
  }).connect({
    host: vm.host,
    port: vm.port,
    username: vm.username,
    privateKey: vm.privateKey,
    password: vm.password,
    tryKeyboard: true, // Try keyboard-interactive auth if needed
  });
}

function startMockSession(socket: Socket) {
  socket.emit('output', '\r\nConnected to Mock VM...\r\n$ ');

  let buffer = '';

  socket.on('input', (data: string) => {
    // Process input character by character to handle pasted commands or "line mode" inputs
    for (const char of data) {
      if (char === '\r') {
        // Echo the new line
        socket.emit('output', '\r\n');

        // Process command
        const cmd = buffer.trim();
        buffer = '';

        if (cmd === 'ls') {
          socket.emit('output', 'file1.txt  file2.js  README.md\r\n');
        } else if (cmd === 'pwd') {
          socket.emit('output', '/home/user\r\n');
        } else if (cmd === 'help') {
          socket.emit('output', 'Available commands: ls, pwd, help\r\n');
        } else if (cmd) {
           socket.emit('output', `bash: command not found: ${cmd}\r\n`);
        }

        socket.emit('output', '$ ');
      } else if (char === '\u007f') { // Backspace (DEL)
          if (buffer.length > 0) {
             buffer = buffer.slice(0, -1);
             // Send backspace sequence to terminal to erase char: Backspace, Space, Backspace
             socket.emit('output', '\b \b');
          }
      } else {
        // Normal char
        buffer += char;
        socket.emit('output', char);
      }
    }
  });
}
