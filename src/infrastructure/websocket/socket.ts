import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { logger } from '@shared/utils/logger';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class WebSocketServer {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map(); 

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*', // En producción, especifica los orígenes permitidos
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/socket.io/',
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
  }

  private setupMiddleware() {
    // Middleware de autenticación
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Token no proporcionado'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as { id: string; role: string };
        socket.userId = decoded.id;
        socket.userRole = decoded.role;

        logger.info(`WebSocket: Usuario ${decoded.id} autenticado`);
        next();
      } catch (error) {
        logger.error('WebSocket: Error de autenticación', error);
        next(new Error('Token inválido'));
      }
    });
  }

  private setupConnectionHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;

      logger.info(`Cliente conectado: ${socket.id} (Usuario: ${userId})`);

      // Registrar socket del usuario
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Unir al room del usuario
      socket.join(`user:${userId}`);

      // Unir al room del rol
      if (socket.userRole) {
        socket.join(`role:${socket.userRole}`);
      }

      // Evento de ping/pong para mantener la conexión
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Manejador de desconexión
      socket.on('disconnect', () => {
        logger.info(`Cliente desconectado: ${socket.id} (Usuario: ${userId})`);
        
        const userSocketSet = this.userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }
      });

      // Confirmar conexión al cliente
      socket.emit('connected', {
        message: 'Conectado exitosamente',
        userId,
        socketId: socket.id,
      });
    });
  }

  // Emitir notificación a un usuario específico
  public emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
    logger.info(`Evento emitido a usuario ${userId}: ${event}`);
  }

  // Emitir notificación a múltiples usuarios
  public emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.emitToUser(userId, event, data);
    });
  }

  // Emitir a todos los usuarios con un rol específico
  public emitToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event, data);
    logger.info(`Evento emitido a rol ${role}: ${event}`);
  }

  // Emitir a todos los usuarios conectados
  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
    logger.info(`Evento emitido a todos: ${event}`);
  }

  // Obtener cantidad de usuarios conectados
  public getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Verificar si un usuario está conectado
  public isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  public getIO(): Server {
    return this.io;
  }
}

let webSocketServer: WebSocketServer | null = null;

export const initializeWebSocket = (httpServer: HTTPServer): WebSocketServer => {
  if (!webSocketServer) {
    webSocketServer = new WebSocketServer(httpServer);
    logger.info('WebSocket server initialized');
  }
  return webSocketServer;
};

export const getWebSocketServer = (): WebSocketServer => {
  if (!webSocketServer) {
    throw new Error('WebSocket server not initialized');
  }
  return webSocketServer;
};
