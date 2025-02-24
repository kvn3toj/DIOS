import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server } from 'http';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { createCustomMetric } from '../config/monitoring';
import { eventBus } from '../config/eventBus';

export class WebSocketService {
  private io: SocketServer;
  private pubClient: Redis;
  private subClient: Redis;

  constructor(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
      },
    });

    // Redis clients for pub/sub
    this.pubClient = new Redis(process.env.REDIS_URL);
    this.subClient = this.pubClient.duplicate();

    this.setupRedisAdapter();
    this.setupEventHandlers();
    this.setupMetrics();
  }

  private async setupRedisAdapter(): Promise<void> {
    try {
      await this.pubClient.ping();
      await this.subClient.ping();

      this.io.adapter(createAdapter(this.pubClient, this.subClient));
      logger.info('WebSocket Redis adapter initialized');
    } catch (error) {
      logger.error('Failed to initialize Redis adapter:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info('Client connected:', socket.id);
      createCustomMetric(
        'websocket.connections.active',
        this.io.engine.clientsCount
      );

      // Authentication
      socket.on('authenticate', async (token: string) => {
        try {
          // Verify token and get user info
          const user = await this.verifyToken(token);
          socket.data.user = user;

          // Join user-specific room
          socket.join(`user:${user.id}`);
          logger.info(`User ${user.id} authenticated on socket ${socket.id}`);
        } catch (error) {
          logger.error('Socket authentication failed:', error);
          socket.emit('error', { message: 'Authentication failed' });
        }
      });

      // Subscribe to achievements
      socket.on('subscribe:achievements', () => {
        if (!socket.data.user) return;
        socket.join(`achievements:${socket.data.user.id}`);
      });

      // Subscribe to quests
      socket.on('subscribe:quests', () => {
        if (!socket.data.user) return;
        socket.join(`quests:${socket.data.user.id}`);
      });

      // Subscribe to notifications
      socket.on('subscribe:notifications', () => {
        if (!socket.data.user) return;
        socket.join(`notifications:${socket.data.user.id}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info('Client disconnected:', socket.id);
        createCustomMetric(
          'websocket.connections.active',
          this.io.engine.clientsCount
        );
      });
    });

    // Subscribe to event bus events
    this.subscribeToEvents();
  }

  private async subscribeToEvents(): Promise<void> {
    // Achievement events
    await eventBus.subscribe('achievement.*', (event) => {
      const { userId } = event.metadata;
      if (userId) {
        this.io
          .to(`user:${userId}`)
          .to(`achievements:${userId}`)
          .emit('achievement:update', event);
      }
    });

    // Quest events
    await eventBus.subscribe('quest.*', (event) => {
      const { userId } = event.metadata;
      if (userId) {
        this.io
          .to(`user:${userId}`)
          .to(`quests:${userId}`)
          .emit('quest:update', event);
      }
    });

    // Notification events
    await eventBus.subscribe('notification.*', (event) => {
      const { userId } = event.metadata;
      if (userId) {
        this.io
          .to(`user:${userId}`)
          .to(`notifications:${userId}`)
          .emit('notification:new', event);
      }
    });
  }

  private setupMetrics(): void {
    // Track connection metrics
    setInterval(() => {
      const rooms = this.io.sockets.adapter.rooms.size;
      const sockets = this.io.engine.clientsCount;

      createCustomMetric('websocket.rooms.total', rooms);
      createCustomMetric('websocket.connections.total', sockets);
    }, 60000); // Every minute
  }

  private async verifyToken(token: string): Promise<any> {
    // Implement token verification logic
    // This should match your authentication service
    return {}; // Placeholder
  }

  public broadcast(event: string, data: any, room?: string): void {
    if (room) {
      this.io.to(room).emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }

  public async close(): Promise<void> {
    try {
      await this.pubClient.quit();
      await this.subClient.quit();
      await new Promise<void>((resolve) => this.io.close(() => resolve()));
      logger.info('WebSocket service closed');
    } catch (error) {
      logger.error('Error closing WebSocket service:', error);
      throw error;
    }
  }
}
