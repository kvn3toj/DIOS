import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { Express } from 'express';
import http from 'http';
import { schema } from './schema';
import { logger } from '../utils/logger';
import { UserService } from '../services/UserService';

const userService = new UserService();

export async function startApolloServer(app: Express, httpServer: http.Server) {
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: async ({ req }) => {
      // Get the user token from the headers
      const token = req.headers.authorization?.split(' ')[1] || '';
      
      let user = null;
      try {
        if (token) {
          // Verify the token and get user info
          const decoded = await userService.verifyToken(token);
          user = await userService.getUser(decoded.userId);
        }
      } catch (error) {
        logger.warn('Failed to authenticate user:', error);
      }

      return {
        user,
        dataSources: {
          userService,
          // Add other data sources as needed
        }
      };
    },
    formatError: (error) => {
      logger.error('GraphQL Error:', {
        message: error.message,
        locations: error.locations,
        path: error.path,
        extensions: error.extensions
      });

      // Don't expose internal errors to clients
      if (error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        return new Error('Internal server error');
      }

      return error;
    },
  });

  await server.start();

  server.applyMiddleware({
    app,
    path: '/graphql',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  });

  logger.info('🚀 Apollo Server started successfully');

  return server;
} 