import express from 'express';
import http from 'http';
import { AppDataSource } from './config/database';
import { applyMiddleware } from './middleware';
import routes from './routes';
import { logger } from './utils/logger';
import { startApolloServer } from './graphql/server';
import { gateway } from './config/gateway';
import { eventBus } from './config/eventBus';
import { initializeMonitoring } from './config/monitoring';
import {
  monitoringMiddleware,
  resourceMonitoring,
  performanceMonitoring,
} from './middleware/monitoringMiddleware';
import { WebSocketService } from './services/WebSocketService';

export class App {
  public app: express.Application;
  private httpServer: http.Server;
  private wsService: WebSocketService;

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.wsService = new WebSocketService(this.httpServer);
    this.setupMiddleware();
    this.setupMonitoring();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    applyMiddleware(this.app);
    this.app.use(monitoringMiddleware);
  }

  private setupMonitoring(): void {
    initializeMonitoring();
    resourceMonitoring();
    performanceMonitoring();
  }

  private setupRoutes(): void {
    this.app.use('/api/v1', routes);
  }

  private setupErrorHandling(): void {
    // Handle 404
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          type: 'NotFoundError',
          message: 'Route not found',
        },
      });
    });
  }

  private async setupEventHandlers(): Promise<void> {
    // Setup achievement event handlers
    await eventBus.subscribe('achievement.*', async (event) => {
      logger.info('Achievement event received:', event);
      // Handle achievement events
    });

    // Setup quest event handlers
    await eventBus.subscribe('quest.*', async (event) => {
      logger.info('Quest event received:', event);
      // Handle quest events
    });

    // Setup reward event handlers
    await eventBus.subscribe('reward.*', async (event) => {
      logger.info('Reward event received:', event);
      // Handle reward events
    });

    // Setup notification event handlers
    await eventBus.subscribe('notification.*', async (event) => {
      logger.info('Notification event received:', event);
      // Handle notification events
    });

    // Setup analytics event handlers
    await eventBus.subscribe('analytics.*', async (event) => {
      logger.info('Analytics event received:', event);
      // Handle analytics events
    });

    // Start failed events retry process
    setInterval(async () => {
      try {
        await eventBus.retryFailedEvents();
      } catch (error) {
        logger.error('Failed to retry events:', error);
      }
    }, 60000); // Retry every minute
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await AppDataSource.initialize();
      logger.info('Database connection initialized');

      // Initialize event bus
      await eventBus.initialize();
      await this.setupEventHandlers();
      logger.info('Event bus initialized');

      // Start Apollo Server
      await startApolloServer(this.app, this.httpServer);

      // Register with API Gateway
      await gateway.registerService();
      logger.info('Service registered with API Gateway');

      // Start health check monitoring
      this.startHealthCheck();

      // Start server
      const port = process.env.PORT || 3000;
      this.httpServer.listen(port, () => {
        logger.info(`Server is running on port ${port}`);
        logger.info(`GraphQL endpoint: http://localhost:${port}/graphql`);
        logger.info(`REST endpoint: http://localhost:${port}/api/v1`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private startHealthCheck(): void {
    setInterval(async () => {
      try {
        const isGatewayHealthy = await gateway.healthCheck();
        if (!isGatewayHealthy) {
          logger.warn(
            'API Gateway health check failed, attempting to re-register service'
          );
          await gateway.registerService();
        }
      } catch (error) {
        logger.error('Health check failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  public async stop(): Promise<void> {
    try {
      // Close WebSocket connections
      await this.wsService.close();
      logger.info('WebSocket connections closed');

      // Close event bus connections
      await eventBus.close();
      logger.info('Event bus connections closed');

      // Close database connection
      await AppDataSource.destroy();
      logger.info('Database connection closed');

      // Close HTTP server
      this.httpServer.close();
      logger.info('HTTP server closed');
    } catch (error) {
      logger.error('Failed to stop server:', error);
      throw error;
    }
  }
}

// Create and export app instance
const app = new App();
export default app;
