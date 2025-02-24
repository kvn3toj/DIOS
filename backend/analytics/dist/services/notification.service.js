"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async create(dto) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: dto.userId,
                    type: dto.type,
                    title: dto.title,
                    content: dto.content,
                    data: dto.data,
                    priority: dto.priority || client_1.NotificationPriority.LOW,
                    expiresAt: dto.expiresAt
                },
                include: {
                    user: true
                }
            });
            this.eventEmitter.emit('notification.created', notification);
            this.server.to(dto.userId).emit('notification', {
                type: 'NEW_NOTIFICATION',
                data: notification
            });
            return notification;
        }
        catch (error) {
            this.logger.error('Failed to create notification:', error);
            throw error;
        }
    }
    async update(id, dto) {
        try {
            const notification = await this.prisma.notification.update({
                where: { id },
                data: {
                    status: dto.status,
                    readAt: dto.status === client_1.NotificationStatus.READ ? new Date() : dto.readAt
                },
                include: {
                    user: true
                }
            });
            this.eventEmitter.emit('notification.updated', notification);
            return notification;
        }
        catch (error) {
            this.logger.error('Failed to update notification:', error);
            throw error;
        }
    }
    async markAsRead(userId, ids) {
        try {
            await this.prisma.notification.updateMany({
                where: {
                    id: { in: ids },
                    userId
                },
                data: {
                    status: client_1.NotificationStatus.READ,
                    readAt: new Date()
                }
            });
            this.eventEmitter.emit('notification.read', { userId, ids });
            this.server.to(userId).emit('notification', {
                type: 'NOTIFICATIONS_READ',
                data: { ids }
            });
        }
        catch (error) {
            this.logger.error('Failed to mark notifications as read:', error);
            throw error;
        }
    }
    async delete(userId, ids) {
        try {
            await this.prisma.notification.updateMany({
                where: {
                    id: { in: ids },
                    userId
                },
                data: {
                    status: client_1.NotificationStatus.DELETED
                }
            });
            this.eventEmitter.emit('notification.deleted', { userId, ids });
            this.server.to(userId).emit('notification', {
                type: 'NOTIFICATIONS_DELETED',
                data: { ids }
            });
        }
        catch (error) {
            this.logger.error('Failed to delete notifications:', error);
            throw error;
        }
    }
    async findById(id) {
        return this.prisma.notification.findUnique({
            where: { id },
            include: {
                user: true
            }
        });
    }
    async findAll(query) {
        try {
            const where = {
                userId: query.userId,
                type: query.type ? { in: query.type } : undefined,
                status: query.status ? { in: query.status } : undefined,
                priority: query.priority ? { in: query.priority } : undefined,
                createdAt: {
                    gte: query.from,
                    lte: query.to
                }
            };
            const [items, total] = await Promise.all([
                this.prisma.notification.findMany({
                    where,
                    include: {
                        user: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: query.limit || 50,
                    skip: query.offset || 0
                }),
                this.prisma.notification.count({ where })
            ]);
            return { items, total };
        }
        catch (error) {
            this.logger.error('Failed to fetch notifications:', error);
            throw error;
        }
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: {
                userId,
                status: client_1.NotificationStatus.UNREAD
            }
        });
    }
    async handleConnection(client, userId) {
        client.join(userId);
        const unreadCount = await this.getUnreadCount(userId);
        this.server.to(userId).emit('notification', {
            type: 'UNREAD_COUNT',
            data: { count: unreadCount }
        });
    }
    async handleDisconnection(client) {
    }
};
exports.NotificationService = NotificationService;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_c = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _c : Object)
], NotificationService.prototype, "server", void 0);
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        namespace: 'notifications',
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], NotificationService);
//# sourceMappingURL=notification.service.js.map