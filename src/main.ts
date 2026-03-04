import Server from './infrastructure/http/server';
import { logger } from './shared/utils/logger';

const bootstrap = async () => {
  try {
    logger.info('🏁 Iniciando Sistema Municipal Backend...');
    const server = new Server();
    await server.start();
  } catch (error) {
    logger.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
};

bootstrap();
