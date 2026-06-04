/* eslint-disable */
const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  // Standalone production runner
  const path = require('path');
  const NextServer = require('next/dist/server/next-server').default;

  const nextServer = new NextServer({
    hostname: '0.0.0.0',
    port: port,
    dir: path.join(__dirname),
    dev: false,
    customServer: true,
  });

  const handler = nextServer.getRequestHandler();

  const httpServer = http.createServer((req, res) => {
    handler(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  // Make global for server actions
  global.io = io;

  io.on('connection', (socket) => {
    setupSocketHandlers(socket, port);
  });

  httpServer.listen(port, () => {
    console.log(`> Standalone production server listening on port ${port}`);
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
