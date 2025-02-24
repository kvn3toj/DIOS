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
var SearchService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let SearchService = SearchService_1 = class SearchService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(SearchService_1.name);
    }
    async searchContent(query) {
        try {
            const where = {};
            if (query.query) {
                where.searchVector = {
                    matches: this.createTsQuery(query.query)
                };
            }
            if (query.type) {
                where.type = { in: query.type };
            }
            if (query.filters) {
                Object.entries(query.filters).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        where[key] = { in: value };
                    }
                    else if (typeof value === 'object') {
                        where[key] = value;
                    }
                    else {
                        where[key] = { equals: value };
                    }
                });
            }
            const total = await this.prisma.content.count({ where });
            const items = await this.prisma.content.findMany({
                where,
                take: query.limit || 50,
                skip: query.offset || 0,
                orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'desc' } : { updatedAt: 'desc' },
                include: {
                    versions: true,
                    creator: true,
                    updater: true,
                    publisher: true
                }
            });
            const facets = await this.getContentFacets(where);
            const suggestions = query.query ? await this.getSearchSuggestions(query.query) : [];
            return { total, items, facets, suggestions };
        }
        catch (error) {
            this.logger.error('Failed to search content:', error);
            throw error;
        }
    }
    async searchProfiles(query) {
        try {
            const where = {};
            if (query.query) {
                where.OR = [
                    { displayName: { contains: query.query, mode: 'insensitive' } },
                    { bio: { contains: query.query, mode: 'insensitive' } },
                    { location: { contains: query.query, mode: 'insensitive' } }
                ];
            }
            if (query.filters) {
                Object.entries(query.filters).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        where[key] = { in: value };
                    }
                    else if (typeof value === 'object') {
                        where[key] = value;
                    }
                    else {
                        where[key] = { equals: value };
                    }
                });
            }
            const total = await this.prisma.profile.count({ where });
            const items = await this.prisma.profile.findMany({
                where,
                take: query.limit || 50,
                skip: query.offset || 0,
                orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'desc' } : { createdAt: 'desc' },
                include: {
                    user: true
                }
            });
            return { total, items };
        }
        catch (error) {
            this.logger.error('Failed to search profiles:', error);
            throw error;
        }
    }
    async searchActivities(query) {
        try {
            const where = {};
            if (query.query) {
                where.OR = [
                    { 'data.text': { contains: query.query, mode: 'insensitive' } }
                ];
            }
            if (query.filters) {
                Object.entries(query.filters).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        where[key] = { in: value };
                    }
                    else if (typeof value === 'object') {
                        where[key] = value;
                    }
                    else {
                        where[key] = { equals: value };
                    }
                });
            }
            const total = await this.prisma.activity.count({ where });
            const items = await this.prisma.activity.findMany({
                where,
                take: query.limit || 50,
                skip: query.offset || 0,
                orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'desc' } : { createdAt: 'desc' },
                include: {
                    user: true
                }
            });
            return { total, items };
        }
        catch (error) {
            this.logger.error('Failed to search activities:', error);
            throw error;
        }
    }
    async searchComments(query) {
        try {
            const where = {};
            if (query.query) {
                where.text = { contains: query.query, mode: 'insensitive' };
            }
            if (query.filters) {
                Object.entries(query.filters).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        where[key] = { in: value };
                    }
                    else if (typeof value === 'object') {
                        where[key] = value;
                    }
                    else {
                        where[key] = { equals: value };
                    }
                });
            }
            const total = await this.prisma.comment.count({ where });
            const items = await this.prisma.comment.findMany({
                where,
                take: query.limit || 50,
                skip: query.offset || 0,
                orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'desc' } : { createdAt: 'desc' },
                include: {
                    user: true,
                    content: true,
                    parent: true,
                    replies: true
                }
            });
            return { total, items };
        }
        catch (error) {
            this.logger.error('Failed to search comments:', error);
            throw error;
        }
    }
    createTsQuery(query) {
        return query
            .trim()
            .split(/\s+/)
            .map(term => `${term}:*`)
            .join(' & ');
    }
    async getContentFacets(where) {
        const [types, statuses, categories, tags] = await Promise.all([
            this.prisma.content.groupBy({
                by: ['type'],
                where,
                _count: true
            }),
            this.prisma.content.groupBy({
                by: ['status'],
                where,
                _count: true
            }),
            this.prisma.content.groupBy({
                by: ['metadata'],
                where: {
                    ...where,
                    metadata: { path: ['categories'] }
                },
                _count: true
            }),
            this.prisma.content.groupBy({
                by: ['metadata'],
                where: {
                    ...where,
                    metadata: { path: ['tags'] }
                },
                _count: true
            })
        ]);
        return {
            types: types.reduce((acc, { type, _count }) => ({ ...acc, [type]: _count }), {}),
            statuses: statuses.reduce((acc, { status, _count }) => ({ ...acc, [status]: _count }), {}),
            categories: categories.reduce((acc, { metadata, _count }) => ({ ...acc, [metadata.categories]: _count }), {}),
            tags: tags.reduce((acc, { metadata, _count }) => ({ ...acc, [metadata.tags]: _count }), {})
        };
    }
    async getSearchSuggestions(query) {
        const suggestions = await this.prisma.$queryRaw `
      SELECT word, similarity(word, ${query}) as sml
      FROM ts_stat('SELECT to_tsvector(''simple'', metadata::text) FROM content')
      WHERE word % ${query}
      ORDER BY sml DESC, word
      LIMIT 5;
    `;
        return suggestions.map((s) => s.word);
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], SearchService);
//# sourceMappingURL=search.service.js.map