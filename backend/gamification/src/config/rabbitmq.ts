import amqp, { Channel, Connection } from 'amqplib';
import { logger } from '../utils/logger';

let connection: Connection;
let channel: Channel;

const EXCHANGE_NAME = 'superapp';
const QUEUE_NAME = 'gamification';

export const connectRabbitMQ = async () => {
  try {
    const url = process.env.RABBITMQ_URL ||
      `amqp://${process.env.RABBITMQ_USER || 'guest'}:${process.env.RABBITMQ_PASSWORD || 'guest'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;

    // Create connection
    connection = await amqp.connect(url);
    logger.info('Connected to RabbitMQ');

    // Create channel
    channel = await connection.createChannel();
    logger.info('Created RabbitMQ channel');

    // Setup exchange
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // Setup queue
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Bind queue to exchange with routing patterns
    const routingPatterns = [
      'user.#',          // All user-related events
      'achievement.#',   // All achievement events
      'quest.#',        // All quest events
      'reward.#'        // All reward events
    ];

    for (const pattern of routingPatterns) {
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, pattern);
    }

    // Setup error handling
    connection.on('error', (error) => {
      logger.error('RabbitMQ connection error:', error);
    });

    channel.on('error', (error) => {
      logger.error('RabbitMQ channel error:', error);
    });

    connection.on('close', () => {
      logger.info('RabbitMQ connection closed');
    });

  } catch (error) {
    logger.error('Error connecting to RabbitMQ:', error);
    throw error;
  }
};

export const publishEvent = async (routingKey: string, data: any) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const message = Buffer.from(JSON.stringify(data));
    channel.publish(EXCHANGE_NAME, routingKey, message, {
      persistent: true,
      timestamp: Date.now(),
      contentType: 'application/json'
    });

    logger.info(`Published event to ${routingKey}:`, { data });
  } catch (error) {
    logger.error('Error publishing event:', error);
    throw error;
  }
};

export const subscribeToEvent = async (
  routingKey: string,
  handler: (data: any) => Promise<void>
) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    await channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString());
        await handler(data);
        channel.ack(msg);
      } catch (error) {
        logger.error('Error processing message:', error);
        // Reject the message and requeue if it's a temporary failure
        channel.reject(msg, true);
      }
    });

    logger.info(`Subscribed to ${routingKey} events`);
  } catch (error) {
    logger.error('Error subscribing to event:', error);
    throw error;
  }
};

export const disconnectRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    logger.info('Disconnected from RabbitMQ');
  } catch (error) {
    logger.error('Error disconnecting from RabbitMQ:', error);
    throw error;
  }
}; 