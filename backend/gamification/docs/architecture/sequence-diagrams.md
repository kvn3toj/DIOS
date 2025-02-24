# Sequence Diagrams

## Authentication Flows

### User Authentication
```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant A as Auth Service
    participant U as User Service
    participant R as Redis Cache
    participant D as Database

    C->>G: Login Request
    G->>A: Validate Credentials
    A->>D: Query User
    D-->>A: User Data
    A->>A: Generate JWT
    A->>R: Cache Session
    A-->>G: JWT Token
    G-->>C: Auth Response
```

### Token Validation
```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant A as Auth Service
    participant R as Redis Cache

    C->>G: API Request + JWT
    G->>A: Validate Token
    A->>R: Check Session
    R-->>A: Session Status
    A-->>G: Validation Result
    G->>G: Apply RBAC
```

## Achievement System Flows

### Achievement Unlocking
```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant AS as Achievement Service
    participant US as User Service
    participant NS as Notification Service
    participant EB as Event Bus
    participant DB as Database
    participant RC as Redis Cache

    C->>G: Update Progress
    G->>AS: Process Progress
    AS->>DB: Get Current Progress
    DB-->>AS: Progress Data
    AS->>AS: Check Completion
    AS->>DB: Update Progress
    AS->>EB: Publish Achievement Event
    EB->>US: Update User Stats
    EB->>NS: Create Notification
    NS->>C: WebSocket Notification
    AS->>RC: Update Cache
    AS-->>C: Success Response
```

### Achievement Progress Tracking
```mermaid
sequenceDiagram
    participant C as Client
    participant AS as Achievement Service
    participant PR as Progress Repository
    participant EB as Event Bus
    participant RC as Redis Cache

    C->>AS: Track Progress
    AS->>PR: Get Current Progress
    PR-->>AS: Progress Data
    AS->>AS: Calculate New Progress
    AS->>PR: Save Progress
    AS->>EB: Publish Progress Event
    AS->>RC: Update Cache
    AS-->>C: Updated Progress
```

## Quest System Flows

### Quest Start Flow
```mermaid
sequenceDiagram
    participant C as Client
    participant QS as Quest Service
    participant US as User Service
    participant DB as Database
    participant EB as Event Bus

    C->>QS: Start Quest
    QS->>US: Validate User
    US-->>QS: User Status
    QS->>DB: Create Quest Progress
    QS->>EB: Publish Quest Started
    QS-->>C: Quest Started
```

### Quest Completion
```mermaid
sequenceDiagram
    participant C as Client
    participant QS as Quest Service
    participant RS as Reward Service
    participant NS as Notification Service
    participant EB as Event Bus
    participant DB as Database

    C->>QS: Submit Quest Progress
    QS->>DB: Verify Progress
    QS->>QS: Validate Completion
    QS->>DB: Update Status
    QS->>EB: Publish Completion
    EB->>RS: Process Rewards
    EB->>NS: Send Notification
    QS-->>C: Success Response
```

## Event Processing Flows

### Event Publication
```mermaid
sequenceDiagram
    participant S as Service
    participant EP as Event Publisher
    participant EB as Event Bus
    participant RC as Redis Cache
    participant DLQ as Dead Letter Queue

    S->>EP: Publish Event
    EP->>EP: Validate Event
    EP->>EB: Send to Exchange
    EB->>EB: Route Event
    alt Success
        EB->>RC: Cache Event
    else Failure
        EB->>DLQ: Move to DLQ
    end
    EP-->>S: Publication Status
```

### Event Consumption
```mermaid
sequenceDiagram
    participant EB as Event Bus
    participant EH as Event Handler
    participant S as Service
    participant DB as Database
    participant RC as Redis Cache

    EB->>EH: Consume Event
    EH->>EH: Validate Event
    EH->>S: Process Event
    S->>DB: Update State
    S->>RC: Update Cache
    EH-->>EB: Acknowledgment
```

## Error Handling Flows

### API Error Handling
```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant S as Service
    participant EH as Error Handler
    participant L as Logger

    C->>G: API Request
    G->>S: Process Request
    alt Success
        S-->>C: Success Response
    else Error
        S->>EH: Handle Error
        EH->>L: Log Error
        EH-->>G: Error Response
        G-->>C: Error Details
    end
```

### Event Error Handling
```mermaid
sequenceDiagram
    participant S as Service
    participant EB as Event Bus
    participant RM as Retry Manager
    participant DLQ as Dead Letter Queue
    participant L as Logger

    S->>EB: Publish Event
    alt Success
        EB->>EB: Process Event
    else Failure
        EB->>RM: Retry Logic
        loop Retry Attempts
            RM->>EB: Retry Event
        end
        alt Max Retries Reached
            RM->>DLQ: Move to DLQ
            RM->>L: Log Failure
        end
    end
```

## Cache Management Flows

### Cache Operations
```mermaid
sequenceDiagram
    participant S as Service
    participant CM as Cache Manager
    participant RC as Redis Cache
    participant DB as Database

    S->>CM: Get Data
    CM->>RC: Check Cache
    alt Cache Hit
        RC-->>S: Cached Data
    else Cache Miss
        CM->>DB: Query Data
        DB-->>CM: Fresh Data
        CM->>RC: Update Cache
        CM-->>S: Fresh Data
    end
```

### Cache Invalidation
```mermaid
sequenceDiagram
    participant S as Service
    participant CM as Cache Manager
    participant RC as Redis Cache
    participant EB as Event Bus

    S->>S: State Change
    S->>EB: Publish Event
    EB->>CM: Invalidation Event
    CM->>RC: Invalidate Keys
    S->>DB: Update Data
    CM->>RC: Update Cache
```

## Analytics Flows

### Event Tracking
```mermaid
sequenceDiagram
    participant C as Client
    participant AS as Analytics Service
    participant EC as Event Collector
    participant TS as Time Series DB
    participant RC as Redis Cache

    C->>AS: Track Event
    AS->>EC: Process Event
    EC->>TS: Store Event
    EC->>RC: Update Metrics
    AS-->>C: Success Response
```

### Metrics Aggregation
```mermaid
sequenceDiagram
    participant S as Service
    participant AP as Analytics Processor
    participant TS as Time Series DB
    participant RC as Redis Cache
    participant DB as Database

    S->>AP: Request Metrics
    AP->>TS: Query Raw Data
    AP->>AP: Aggregate Data
    AP->>RC: Cache Results
    AP->>DB: Store Aggregates
    AP-->>S: Metrics Response
``` 