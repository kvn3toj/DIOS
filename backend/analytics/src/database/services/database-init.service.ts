import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Connection, createConnection, getConnectionManager } from 'typeorm';
import { DatabaseMonitoringService } from '../../monitoring/services/database-monitoring.service';

@Injectable()
export class DatabaseInitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseInitService.name);
  private connection: Connection;
  private healthCheckInterval: NodeJS.Timeout;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly databaseMonitoringService: DatabaseMonitoringService,
  ) {}

  async onModuleInit() {
    await this.initializeDatabase();
    this.startHealthCheck();
  }

  async onModuleDestroy() {
    await this.closeDatabase();
  }

  private async initializeDatabase() {
    try {
      const dbConfig = this.getDatabaseConfig();
      
      // Create and validate the connection
      this.connection = await createConnection({
        ...dbConfig,
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        subscribers: ['dist/subscribers/*{.ts,.js}'],
      });

      // Run migrations if not in production
      if (process.env.NODE_ENV !== 'production') {
        await this.connection.runMigrations();
        this.logger.log('Database migrations completed');
      }

      // Initialize connection pool
      await this.initializeConnectionPool();

      this.logger.log('Database initialized successfully');
      
      // Emit database ready event
      this.eventEmitter.emit('database.ready', {
        timestamp: new Date(),
        connectionName: this.connection.name,
        isConnected: this.connection.isConnected,
      });
    } catch (error) {
      this.logger.error('Failed to initialize database', error);
      throw error;
    }
  }

  private getDatabaseConfig() {
    return {
      type: this.configService.get('database.type') || 'postgres',
      host: this.configService.get('database.host') || 'localhost',
      port: this.configService.get('database.port') || 5432,
      username: this.configService.get('database.username') || 'postgres',
      password: this.configService.get('database.password') || 'postgres',
      database: this.configService.get('database.database') || 'superapp',
      synchronize: this.configService.get('database.synchronize') || false,
      logging: this.configService.get('database.logging') || false,
      poolSize: this.configService.get('database.pool.max') || 10,
      connectTimeoutMS: this.configService.get('database.timeout.connect') || 10000,
      extra: {
        max: this.configService.get('database.pool.max') || 10,
        idleTimeoutMillis: this.configService.get('database.timeout.idle') || 30000,
        connectionTimeoutMillis: this.configService.get('database.timeout.connect') || 10000,
      },
    };
  }

  private async initializeConnectionPool() {
    const poolConfig = {
      min: this.configService.get('database.pool.min') || 2,
      max: this.configService.get('database.pool.max') || 10,
    };

    if (this.connection.driver.isConnected) {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.query(`ALTER SYSTEM SET max_connections = ${poolConfig.max * 2}`);
      await queryRunner.query('SELECT pg_reload_conf()');
      await queryRunner.release();
    }
  }

  private startHealthCheck() {
    const healthCheckInterval = this.configService.get('database.healthCheck.interval') || 30000;
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        if (this.connection && this.connection.isConnected) {
          await this.connection.query('SELECT 1');
        } else {
          this.logger.warn('Database connection lost, attempting to reconnect...');
          await this.reconnect();
        }
      } catch (error) {
        this.logger.error('Database health check failed', error);
        await this.reconnect();
      }
    }, healthCheckInterval);
  }

  private async reconnect() {
    try {
      if (this.connection) {
        await this.connection.close();
      }
      await this.initializeDatabase();
      this.logger.log('Database reconnected successfully');
    } catch (error) {
      this.logger.error('Failed to reconnect to database', error);
      // Emit database error event
      this.eventEmitter.emit('database.error', {
        timestamp: new Date(),
        error: error.message,
      });
    }
  }

  private async closeDatabase() {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      if (this.connection && this.connection.isConnected) {
        await this.connection.close();
        this.logger.log('Database connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing database connection', error);
    }
  }

  // Public methods for other services to use
  async getConnection(): Promise<Connection> {
    if (!this.connection || !this.connection.isConnected) {
      await this.reconnect();
    }
    return this.connection;
  }

  async checkConnection(): Promise<boolean> {
    try {
      if (!this.connection || !this.connection.isConnected) {
        return false;
      }
      await this.connection.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
} 