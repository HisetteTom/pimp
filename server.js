/* eslint-disable */
const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  // Production Standalone Server runner
  const { execSync } = require('child_process');
  try {
    console.log('> Running database migrations and seeding lookup tables...');
    execSync('bun src/db/migrate-and-seed.ts', { stdio: 'inherit' });
  } catch (err) {
    console.error('> Database migration/seeding failed:', err);
    process.exit(1);
  }

  const path = require('path');
  const fs = require('fs');
  const dir = path.join(__dirname);

  // Dynamically load the build configuration to avoid hardcoded absolute paths
  const requiredFilesPath = path.join(__dirname, '.next/required-server-files.json');
  let nextConfig = {};
  if (fs.existsSync(requiredFilesPath)) {
    nextConfig = JSON.parse(fs.readFileSync(requiredFilesPath, 'utf8')).config;
  }

  process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

  // Monkey-patch http.createServer to attach Socket.IO
  const originalCreateServer = http.createServer;
  http.createServer = function(...args) {
    const server = originalCreateServer.apply(this, args);

    const io = new Server(server, {
      cors: {
        origin: '*',
        credentials: true,
      },
    });

    // Share socket instance with Next.js process
    global.io = io;

    io.on('connection', (socket) => {
      setupSocketHandlers(socket, port);
    });

    // Restore createServer to keep next internals clean
    http.createServer = originalCreateServer;
    return server;
  };

  // Require next and start server using its internal bootstrapper
  require('next');
  const { startServer } = require('next/dist/server/lib/start-server');

  let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10);
  if (
    Number.isNaN(keepAliveTimeout) ||
    !Number.isFinite(keepAliveTimeout) ||
    keepAliveTimeout < 0
  ) {
    keepAliveTimeout = undefined;
  }

  startServer({
    dir,
    isDev: false,
    config: nextConfig,
    hostname: '0.0.0.0',
    port: port,
    allowRetry: false,
    keepAliveTimeout,
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  // Development runner
  const next = require('next');
  const app = next({ dev: true, hostname: 'localhost', port: 3000 });
  const handler = app.getRequestHandler();

  app.prepare().then(() => {
    // Next.js HTTP server on 3000
    const nextHttpServer = http.createServer((req, res) => {
      handler(req, res);
    });

    nextHttpServer.listen(3000, () => {
      console.log(`> Next.js dev server listening on http://localhost:3000`);
    });

    // Socket.IO HTTP server on 3001
    const socketHttpServer = http.createServer((req, res) => {
      res.writeHead(200);
      res.end('Socket.IO Dev Server');
    });

    const io = new Server(socketHttpServer, {
      cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true,
      },
    });

    // Make global for server actions
    global.io = io;

    io.on('connection', (socket) => {
      setupSocketHandlers(socket, 3000); // Check authorization against Next.js on port 3000
    });

    socketHttpServer.listen(3001, () => {
      console.log(`> Socket.IO dev server listening on http://localhost:3001`);
    });
  });
}

function setupSocketHandlers(socket, nextPort) {
  socket.on('join_team', async (teamId) => {
    try {
      const cookie = socket.handshake.headers.cookie || '';
      const url = `http://localhost:${nextPort}/api/chat/auth?teamId=${teamId}`;

      const response = await fetch(url, {
        headers: { cookie },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authorized) {
          socket.join(`team_${teamId}`);
        }
      }
    } catch (err) {
      console.error('Socket room join auth failed:', err);
    }
  });

  socket.on('disconnect', () => {
    // cleanups
  });
}
