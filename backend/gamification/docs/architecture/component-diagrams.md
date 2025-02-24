# Component Diagrams

## System Components Overview

### Core Service Components
```mermaid
graph TB
    subgraph API_Layer
        REST[REST API]
        GraphQL[GraphQL API]
        Gateway[API Gateway]
    end

    subgraph Service_Layer
        AS[Achievement Service]
        QS[Quest Service]
        NS[Notification Service]
        RS[Reward Service]
        US[User Service]
        ANS[Analytics Service]
    end

    subgraph Data_Layer
        DB[(PostgreSQL)]
        Cache[(Redis)]
        EventBus[(RabbitMQ)]
        Analytics[(Analytics Store)]
    end

    Gateway --> REST
    Gateway --> GraphQL
    
    REST --> AS & QS & NS & RS & US & ANS
    GraphQL --> AS & QS & NS & RS & US & ANS
    
    AS & QS & NS & RS & US & ANS --> DB
    AS & QS & NS & RS & US & ANS --> Cache
    AS & QS & NS & RS & US & ANS --> EventBus
    ANS --> Analytics
```

### Achievement System Components
```mermaid
graph TB
    subgraph Achievement_Domain
        AC[Achievement Controller]
        AS[Achievement Service]
        AR[Achievement Repository]
        APR[Achievement Progress Repository]
        AM[Achievement Model]
        APM[Achievement Progress Model]
    end

    subgraph Dependencies
        US[User Service]
        NS[Notification Service]
        RS[Reward Service]
        EB[Event Bus]
        DB[(Database)]
        Cache[(Redis)]
    end

    AC --> AS
    AS --> AR & APR
    AR --> AM
    APR --> APM
    AS --> US
    AS --> NS
    AS --> RS
    AS --> EB
    AR & APR --> DB
    AS --> Cache
```

### Quest System Components
```mermaid
graph TB
    subgraph Quest_Domain
        QC[Quest Controller]
        QS[Quest Service]
        QR[Quest Repository]
        QPR[Quest Progress Repository]
        QM[Quest Model]
        QPM[Quest Progress Model]
    end

    subgraph Dependencies
        US[User Service]
        NS[Notification Service]
        RS[Reward Service]
        EB[Event Bus]
        DB[(Database)]
        Cache[(Redis)]
    end

    QC --> QS
    QS --> QR & QPR
    QR --> QM
    QPR --> QPM
    QS --> US
    QS --> NS
    QS --> RS
    QS --> EB
    QR & QPR --> DB
    QS --> Cache
```

### Event System Components
```mermaid
graph TB
    subgraph Event_Infrastructure
        EB[Event Bus]
        DLQ[Dead Letter Queue]
        EH[Event Handlers]
        EP[Event Publishers]
        RetryM[Retry Manager]
    end

    subgraph Services
        AS[Achievement Service]
        QS[Quest Service]
        NS[Notification Service]
        RS[Reward Service]
        ANS[Analytics Service]
    end

    subgraph Storage
        Redis[(Redis)]
        RMQ[(RabbitMQ)]
        DB[(Database)]
    end

    AS & QS & NS & RS & ANS --> EP
    EP --> EB
    EB --> EH
    EH --> AS & QS & NS & RS & ANS
    EB --> DLQ
    DLQ --> RetryM
    RetryM --> EB
    EB --> RMQ
    EH --> Redis
    EH --> DB
```

### Analytics System Components
```mermaid
graph TB
    subgraph Analytics_Domain
        AC[Analytics Controller]
        AS[Analytics Service]
        AR[Analytics Repository]
        AM[Analytics Model]
        AP[Analytics Processor]
    end

    subgraph Data_Pipeline
        EC[Event Collector]
        TS[Time Series DB]
        Agg[Aggregator]
        Cache[(Redis)]
    end

    subgraph Event_Sources
        AchievementE[Achievement Events]
        QuestE[Quest Events]
        UserE[User Events]
        SystemE[System Events]
    end

    AchievementE & QuestE & UserE & SystemE --> EC
    EC --> AP
    AP --> AS
    AS --> AR
    AR --> AM & TS
    Agg --> Cache
    AS --> Agg
```

### User Management Components
```mermaid
graph TB
    subgraph User_Domain
        UC[User Controller]
        US[User Service]
        UR[User Repository]
        UM[User Model]
    end

    subgraph Authentication
        Auth[Auth Service]
        JWT[JWT Manager]
        RBAC[RBAC Manager]
    end

    subgraph Progress_Tracking
        PS[Progress Service]
        PR[Progress Repository]
        PM[Progress Model]
    end

    UC --> US
    US --> UR
    UR --> UM
    US --> Auth
    Auth --> JWT
    Auth --> RBAC
    US --> PS
    PS --> PR
    PR --> PM
```

### Caching Components
```mermaid
graph TB
    subgraph Cache_Infrastructure
        CM[Cache Manager]
        RL[Rate Limiter]
        SM[Session Manager]
        LB[Leaderboard Manager]
    end

    subgraph Services
        AS[Achievement Service]
        QS[Quest Service]
        US[User Service]
        ANS[Analytics Service]
    end

    subgraph Storage
        Redis[(Redis)]
        DB[(Database)]
    end

    AS & QS & US & ANS --> CM
    CM --> Redis
    RL --> Redis
    SM --> Redis
    LB --> Redis
    CM --> DB
```

## Component Interactions

### Data Flow Patterns
```mermaid
graph LR
    subgraph Client_Layer
        Client[Client]
    end

    subgraph API_Layer
        Gateway[API Gateway]
        REST[REST API]
        GraphQL[GraphQL API]
    end

    subgraph Service_Layer
        Services[Services]
    end

    subgraph Data_Layer
        Cache[(Cache)]
        DB[(Database)]
        Events[(Event Bus)]
    end

    Client --> Gateway
    Gateway --> REST & GraphQL
    REST & GraphQL --> Services
    Services --> Cache
    Services --> DB
    Services --> Events
    Events --> Services
```

### Error Handling Flow
```mermaid
graph TB
    subgraph Error_Sources
        API[API Errors]
        Service[Service Errors]
        DB[Database Errors]
        Event[Event Errors]
    end

    subgraph Error_Handling
        Handler[Error Handler]
        Logger[Error Logger]
        Notifier[Error Notifier]
    end

    subgraph Recovery
        Retry[Retry Manager]
        Fallback[Fallback Handler]
        Circuit[Circuit Breaker]
    end

    API & Service & DB & Event --> Handler
    Handler --> Logger
    Handler --> Notifier
    Handler --> Retry
    Retry --> Fallback
    Retry --> Circuit
```

## Component Dependencies

### Service Dependencies
```mermaid
graph TB
    subgraph External_Dependencies
        Auth[Auth Service]
        User[User Service]
        Analytics[Analytics Service]
        Notification[Notification Service]
    end

    subgraph Infrastructure_Dependencies
        PG[PostgreSQL]
        Redis[Redis]
        RMQ[RabbitMQ]
        ES[Elasticsearch]
    end

    subgraph Development_Dependencies
        TS[TypeScript]
        Node[Node.js]
        Express[Express]
        TypeORM[TypeORM]
        Apollo[Apollo Server]
        Jest[Jest]
    end

    Service[Gamification Service] --> Auth & User & Analytics & Notification
    Service --> PG & Redis & RMQ & ES
    Service --> TS & Node & Express & TypeORM & Apollo & Jest
``` 