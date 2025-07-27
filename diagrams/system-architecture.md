# Canopy Copilot - System Architecture

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A1[React App]
        A2[MapboxGL Maps]
        A3[GrapesJS Canvas]
        A4[AI Agent Chat]
    end

    subgraph "API Gateway & Auth"
        B1[FastAPI Gateway]
        B2[JWT Auth]
        B3[Rate Limiting]
        B4[CORS Handling]
    end

    subgraph "Core Services"
        C1[Project Service]
        C2[Upload Service]
        C3[Processing Service]
        C4[AI Agent Service]
        C5[Report Service]
    end

    subgraph "Processing Layer"
        D1[OpenDroneMap]
        D2[Raster Processing]
        D3[NDVI/GNDVI Calc]
        D4[Measurement Engine]
    end

    subgraph "AI Layer"
        E1[LangChain Orchestrator]
        E2[Tool Registry]
        E3[Workflow Engine]
        E4[Response Generator]
    end

    subgraph "Storage Layer"
        F1[MongoDB - Documents]
        F2[PostgreSQL - Spatial]
        F3[MinIO/S3 - Files]
        F4[Redis - Cache]
    end

    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1

    B1 --> C1
    B1 --> C2
    B1 --> C3
    B1 --> C4
    B1 --> C5

    C2 --> D1
    C3 --> D2
    C3 --> D3
    C4 --> E1
    C5 --> E1

    D1 --> F3
    D2 --> F3
    D3 --> F3
    E1 --> F1
    E1 --> F2
    E1 --> F3

    C1 --> F1
    C1 --> F2
    C2 --> F3
    C4 --> F4
```

## 🔄 Data Flow Diagrams

### Image Upload & Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Backend API
    participant S3 as MinIO/S3
    participant ODM as OpenDroneMap
    participant DB as Database
    participant AI as AI Agent

    U->>F: Upload drone images
    F->>API: POST /api/upload/images
    API->>S3: Store raw images
    API->>DB: Create project record
    API->>ODM: Trigger processing job
    ODM->>S3: Download images
    ODM->>ODM: Generate orthomosaic
    ODM->>S3: Upload orthomosaic
    ODM->>API: Job complete notification
    API->>DB: Update project status
    API->>AI: Trigger analysis
    AI->>S3: Process orthomosaic
    AI->>DB: Store analysis results
    API->>F: Processing complete
    F->>U: Show results
```

### AI Agent Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Backend API
    participant AI as AI Agent
    participant T as Tools
    participant DB as Database
    participant S3 as Storage

    U->>F: Send message to AI
    F->>API: POST /api/agent/chat
    API->>AI: Process message
    AI->>AI: Analyze intent
    AI->>T: Execute tool
    T->>DB: Query data
    T->>S3: Access files
    T->>AI: Return results
    AI->>AI: Generate response
    AI->>API: Return response
    API->>F: Send response
    F->>U: Display AI response
```

## 🗄️ Database Schema

### MongoDB Collections (Documents)

```mermaid
erDiagram
    USERS {
        ObjectId _id
        string email
        string username
        string full_name
        string hashed_password
        boolean is_active
        boolean is_verified
        datetime created_at
        datetime updated_at
        object preferences
        string plan
        datetime plan_expires_at
    }

    PROJECTS {
        ObjectId _id
        string name
        string description
        string status
        string created_by
        datetime created_at
        datetime updated_at
        array image_files
        string orthomosaic_file
        string ndvi_file
        string gndvi_file
        string elevation_file
        array processing_jobs
        object processing_metadata
        object settings
    }

    REPORTS {
        ObjectId _id
        string project_id
        string title
        string description
        array blocks
        object metadata
        datetime created_at
        datetime updated_at
        string created_by
        boolean is_public
    }

    USERS ||--o{ PROJECTS : creates
    PROJECTS ||--o{ REPORTS : contains
```

### PostgreSQL Tables (Spatial Data)

```mermaid
erDiagram
    POLYGONS {
        uuid id
        string project_id
        string name
        string description
        geometry geometry
        jsonb properties
        string created_by
        datetime created_at
        datetime updated_at
    }

    MEASUREMENTS {
        uuid id
        uuid polygon_id
        string measurement_type
        float value
        string unit
        jsonb metadata
        datetime created_at
    }

    LAYERS {
        uuid id
        string project_id
        string name
        string layer_type
        string file_path
        array bounds
        float resolution
        string crs
        jsonb metadata
        datetime created_at
    }

    POLYGONS ||--o{ MEASUREMENTS : has
    LAYERS ||--o{ POLYGONS : contains
```

## 🔧 Service Architecture

### Backend Service Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── api/                    # API layer
│   ├── routes/            # Route handlers
│   │   ├── auth.py        # Authentication endpoints
│   │   ├── upload.py      # File upload endpoints
│   │   ├── projects.py    # Project management
│   │   ├── maps.py        # Spatial data endpoints
│   │   ├── canvas.py      # Report canvas endpoints
│   │   └── agent.py       # AI agent endpoints
│   └── middleware/        # Custom middleware
├── agent/                  # AI agent layer
│   ├── tools.py           # Agent tools implementation
│   ├── workflow.py        # Agent workflow orchestration
│   └── prompts.py         # AI prompts and templates
├── db/                     # Database layer
│   ├── database.py        # Connection management
│   ├── models.py          # Data models
│   └── migrations/        # Database migrations
├── jobs/                   # Background processing
│   ├── celery_app.py      # Celery configuration
│   ├── odm_tasks.py       # OpenDroneMap tasks
│   └── raster_tasks.py    # Raster processing tasks
├── odm/                    # OpenDroneMap integration
│   ├── client.py          # ODM API client
│   ├── processor.py       # Processing logic
│   └── validator.py       # Input validation
├── raster/                 # Raster processing
│   ├── ndvi.py            # NDVI calculation
│   ├── gndvi.py           # GNDVI calculation
│   └── statistics.py      # Raster statistics
└── utils/                  # Utilities
    ├── config.py          # Configuration management
    ├── storage.py         # S3/MinIO utilities
    └── helpers.py         # Common helpers
```

### Frontend Component Structure

```
frontend/src/
├── components/             # Reusable components
│   ├── common/            # Common UI components
│   ├── map/               # Map-related components
│   ├── canvas/            # Canvas editor components
│   └── agent/             # AI agent components
├── pages/                  # Page components
│   ├── Dashboard.jsx      # Main dashboard
│   ├── Upload.jsx         # File upload page
│   ├── Projects.jsx       # Project listing
│   ├── ProjectDetail.jsx  # Project details
│   ├── Map.jsx            # Interactive map
│   ├── Canvas.jsx         # Report canvas
│   ├── Agent.jsx          # AI agent interface
│   ├── Login.jsx          # Authentication
│   └── Register.jsx       # User registration
├── hooks/                  # Custom React hooks
├── utils/                  # Utility functions
├── store/                  # State management
└── types/                  # TypeScript type definitions
```

## 🔐 Security Architecture

### Authentication & Authorization

```mermaid
graph LR
    subgraph "Client"
        A[Frontend App]
    end

    subgraph "API Gateway"
        B[JWT Middleware]
        C[Rate Limiter]
        D[CORS Handler]
    end

    subgraph "Auth Service"
        E[User Validation]
        F[Token Generation]
        G[Permission Check]
    end

    subgraph "Protected Resources"
        H[Project Data]
        I[User Files]
        J[AI Tools]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    G --> I
    G --> J
```

### Data Security

- **Encryption at Rest**: All sensitive data encrypted in databases
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Access Control**: Role-based access control (RBAC)
- **API Security**: JWT tokens, rate limiting, input validation
- **File Security**: Signed URLs for file access, virus scanning

## 📊 Performance Architecture

### Caching Strategy

```mermaid
graph TB
    subgraph "Application Layer"
        A[FastAPI App]
    end

    subgraph "Cache Layer"
        B[Redis Cache]
        C[CDN Cache]
    end

    subgraph "Storage Layer"
        D[Database]
        E[File Storage]
    end

    A --> B
    A --> C
    A --> D
    A --> E

    B -.->|Cache Hit| A
    C -.->|Static Assets| A
```

### Scalability Considerations

- **Horizontal Scaling**: Stateless API services
- **Database Scaling**: Read replicas, connection pooling
- **File Storage**: CDN for static assets, S3 for large files
- **Processing**: Queue-based background jobs
- **Monitoring**: Metrics collection and alerting

## 🔄 Deployment Architecture

### Development Environment

```mermaid
graph TB
    subgraph "Local Development"
        A[Docker Compose]
        B[Frontend Dev Server]
        C[Backend Dev Server]
        D[Local Databases]
    end

    A --> B
    A --> C
    A --> D
```

### Production Environment

```mermaid
graph TB
    subgraph "Load Balancer"
        A[NGINX/ALB]
    end

    subgraph "Application Servers"
        B[Frontend Containers]
        C[Backend Containers]
    end

    subgraph "Data Layer"
        D[Managed Databases]
        E[Object Storage]
        F[Cache Layer]
    end

    A --> B
    A --> C
    B --> D
    C --> D
    C --> E
    C --> F
```

## 📈 Monitoring & Observability

### Metrics Collection

- **Application Metrics**: Response times, error rates, throughput
- **Infrastructure Metrics**: CPU, memory, disk, network
- **Business Metrics**: User activity, feature usage, processing times
- **AI Metrics**: Agent interactions, tool usage, response quality

### Logging Strategy

- **Structured Logging**: JSON format for easy parsing
- **Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Log Aggregation**: Centralized log collection and analysis
- **Log Retention**: Configurable retention policies

### Alerting

- **Infrastructure Alerts**: Service health, resource usage
- **Application Alerts**: Error rates, performance degradation
- **Business Alerts**: Processing failures, user issues
- **Security Alerts**: Unusual access patterns, security events

---

**Canopy Copilot** - Intelligent photogrammetry platform architecture. 🌱