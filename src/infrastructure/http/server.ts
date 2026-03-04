import express, { Application } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import cors from 'cors';
import path from 'path';
import { config } from '@config/index';
import { initDatabase } from '@infrastructure/database/connection';
import { initializeWebSocket } from '@infrastructure/websocket/socket';
import routes from '@infrastructure/http/routes';
import { errorHandler } from '@shared/middlewares/error-handler';
import { logger } from '@shared/utils/logger';

class Server {
  private app: Application;
  private httpServer: HTTPServer;
  private port: number;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.port = config.server.port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Servir archivos estáticos desde la carpeta uploads
    const uploadsPath = path.join(__dirname, '../../../uploads');
    this.app.use('/uploads', express.static(uploadsPath));
    logger.info(`Serving static files from: ${uploadsPath}`);
    
    // Logging middleware
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    this.app.use(`/api/${config.server.apiVersion}`, routes);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Conectar a la base de datos
      await initDatabase();

      // Inicializar WebSocket
      initializeWebSocket(this.httpServer);

      // Iniciar servidor
      this.httpServer.listen(this.port, () => {
        logger.info(`Server running on port ${this.port}`);
        logger.info(`Environment: ${config.server.nodeEnv}`);
        logger.info(`API: http://localhost:${this.port}/api/${config.server.apiVersion}`);
        logger.info(`WebSocket: ws://localhost:${this.port}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

export default Server;
