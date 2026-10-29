import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket: Socket) => {
    // Client presence log
    socket.on('join:room', (room: string) => {
      socket.join(room);
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

// Broadcasting helpers
export function broadcastListingCreated(listing: any) {
  if (io) {
    io.emit('listing:created', listing);
  }
}

export function broadcastListingUpdated(listing: any) {
  if (io) {
    io.emit('listing:updated', listing);
  }
}

export function broadcastListingDeleted(id: string) {
  if (io) {
    io.emit('listing:deleted', { id });
  }
}

export function broadcastRequestCreated(request: any) {
  if (io) {
    io.emit('request:created', request);
  }
}

export function broadcastRequestUpdated(request: any) {
  if (io) {
    io.emit('request:updated', request);
  }
}

export function broadcastAuditLogged(auditLog: any) {
  if (io) {
    io.emit('admin:audit', auditLog);
  }
}
