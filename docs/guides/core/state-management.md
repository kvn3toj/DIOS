# State Management Guide

## Overview
The SuperApp and Gamifier 2.0 system implements a comprehensive state management strategy across both client and server components, utilizing modern tools and patterns for efficient state handling.

## Client-Side State Management

### Global State (Zustand)
```typescript
interface GlobalState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    login: (credentials: Credentials) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
  };
  theme: {
    mode: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (mode: 'light' | 'dark') => void;
  };
  notifications: {
    items: Notification[];
    unreadCount: number;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => void;
    clear: () => void;
  };
}

// Implementation example
const useStore = create<GlobalState>((set) => ({
  auth: {
    user: null,
    isAuthenticated: false,
    token: null,
    login: async (credentials) => {
      // Implementation
    },
    logout: () => set({ user: null, isAuthenticated: false, token: null }),
    refreshToken: async () => {
      // Implementation
    },
  },
  theme: {
    mode: 'light',
    toggleTheme: () => 
      set((state) => ({ 
        theme: { 
          ...state.theme, 
          mode: state.theme.mode === 'light' ? 'dark' : 'light' 
        } 
      })),
    setTheme: (mode) => 
      set((state) => ({ 
        theme: { 
          ...state.theme, 
          mode 
        } 
      })),
  },
  notifications: {
    items: [],
    unreadCount: 0,
    addNotification: (notification) =>
      set((state) => ({
        notifications: {
          ...state.notifications,
          items: [notification, ...state.notifications.items],
          unreadCount: state.notifications.unreadCount + 1,
        },
      })),
    markAsRead: (id) =>
      set((state) => ({
        notifications: {
          ...state.notifications,
          items: state.notifications.items.map((item) =>
            item.id === id ? { ...item, isRead: true } : item
          ),
          unreadCount: state.notifications.unreadCount - 1,
        },
      })),
    clear: () =>
      set((state) => ({
        notifications: {
          ...state.notifications,
          items: [],
          unreadCount: 0,
        },
      })),
  },
}));
```

### Local State (Jotai)
```typescript
interface LocalState {
  ui: {
    modals: Map<string, boolean>;
    sidebars: Map<string, boolean>;
    loading: Map<string, boolean>;
  };
  forms: {
    data: Map<string, any>;
    errors: Map<string, string[]>;
    touched: Map<string, boolean>;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

// Atom examples
const modalAtom = atom<Map<string, boolean>>(new Map());
const loadingAtom = atom<Map<string, boolean>>(new Map());
const formDataAtom = atom<Map<string, any>>(new Map());

// Derived atoms
const isModalOpenAtom = atom(
  (get) => (modalId: string) => get(modalAtom).get(modalId) ?? false
);

const isLoadingAtom = atom(
  (get) => (key: string) => get(loadingAtom).get(key) ?? false
);
```

## Server-Side State Management

### Cache Management (Redis)
```typescript
interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
  };
  ttl: {
    short: number;   // 5 minutes
    medium: number;  // 1 hour
    long: number;    // 24 hours
  };
  patterns: {
    user: string;
    profile: string;
    activity: string;
    notification: string;
  };
}

interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(pattern: string): Promise<void>;
  invalidate(tags: string[]): Promise<void>;
}
```

### Session Management
```typescript
interface SessionConfig {
  store: {
    type: 'redis';
    config: {
      host: string;
      port: number;
      password?: string;
      db: number;
    };
  };
  cookie: {
    name: string;
    maxAge: number;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  security: {
    encryption: boolean;
    encryptionKey: string;
    rolling: boolean;
    renewalThreshold: number;
  };
}

interface SessionService {
  create(userId: string, metadata: Record<string, any>): Promise<string>;
  validate(sessionId: string): Promise<boolean>;
  refresh(sessionId: string): Promise<string>;
  destroy(sessionId: string): Promise<void>;
  getMetadata(sessionId: string): Promise<Record<string, any>>;
}
```

### Event Sourcing
```typescript
interface EventStore {
  append(streamId: string, events: Event[]): Promise<void>;
  read(streamId: string, fromVersion?: number): Promise<Event[]>;
  readAll(fromPosition?: number): Promise<Event[]>;
  subscribe(streamId: string, handler: EventHandler): Promise<Subscription>;
}

interface Event {
  id: string;
  type: string;
  streamId: string;
  version: number;
  data: Record<string, any>;
  metadata: {
    timestamp: Date;
    userId?: string;
    correlationId?: string;
    causationId?: string;
  };
}

interface EventHandler {
  handle(event: Event): Promise<void>;
  onError?(error: Error, event: Event): Promise<void>;
}
```

## State Synchronization

### Real-time Updates
```typescript
interface RealtimeConfig {
  websocket: {
    path: string;
    heartbeat: number;
    reconnection: {
      attempts: number;
      delay: number;
      timeout: number;
    };
  };
  channels: {
    user: string;
    notifications: string;
    activities: string;
    system: string;
  };
  handlers: Map<string, MessageHandler>;
}

interface MessageHandler {
  handle(message: WebSocketMessage): Promise<void>;
  filter?(message: WebSocketMessage): boolean;
  transform?(message: WebSocketMessage): WebSocketMessage;
}
```

### Optimistic Updates
```typescript
interface OptimisticUpdate<T> {
  execute(): Promise<T>;
  rollback(): Promise<void>;
  retry(): Promise<T>;
  getSnapshot(): Snapshot;
}

interface Snapshot {
  timestamp: Date;
  state: Record<string, any>;
  metadata: Record<string, any>;
}

// Example implementation
class OptimisticMutation<T> implements OptimisticUpdate<T> {
  private snapshot: Snapshot;
  private retryCount: number = 0;
  private readonly maxRetries: number = 3;

  constructor(
    private readonly mutation: () => Promise<T>,
    private readonly rollbackFn: () => Promise<void>,
    private readonly getState: () => Record<string, any>
  ) {
    this.snapshot = this.createSnapshot();
  }

  async execute(): Promise<T> {
    try {
      const result = await this.mutation();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async rollback(): Promise<void> {
    await this.rollbackFn();
  }

  async retry(): Promise<T> {
    if (this.retryCount >= this.maxRetries) {
      throw new Error('Max retry attempts reached');
    }
    this.retryCount++;
    return this.execute();
  }

  getSnapshot(): Snapshot {
    return this.snapshot;
  }

  private createSnapshot(): Snapshot {
    return {
      timestamp: new Date(),
      state: this.getState(),
      metadata: {
        retryCount: this.retryCount,
        maxRetries: this.maxRetries,
      },
    };
  }
}
```

## Configuration Examples

### Development Environment
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Session Configuration
SESSION_SECRET=your-secret-key
SESSION_TTL=86400
SESSION_SECURE=false
SESSION_SAME_SITE=lax

# WebSocket Configuration
WS_PATH=/ws
WS_HEARTBEAT=30000
WS_RECONNECT_ATTEMPTS=5
WS_RECONNECT_DELAY=1000
```

### Production Environment
```env
# Redis Configuration
REDIS_HOST=redis.production.com
REDIS_PORT=6379
REDIS_PASSWORD=strong-password
REDIS_DB=0

# Session Configuration
SESSION_SECRET=production-secret-key
SESSION_TTL=86400
SESSION_SECURE=true
SESSION_SAME_SITE=strict

# WebSocket Configuration
WS_PATH=/ws
WS_HEARTBEAT=30000
WS_RECONNECT_ATTEMPTS=10
WS_RECONNECT_DELAY=2000
```

## Related Guides
- [Core Architecture](architecture.md)
- [Event System](event-system.md)
- [Caching Strategy](../performance/caching.md)
- [Real-time Features](../features/realtime.md) 