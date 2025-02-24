# Deployment Guide

## Overview

This guide outlines the procedures for deploying the SuperApp and Gamifier 2.0 platform across different environments. It covers infrastructure setup, deployment processes, and maintenance procedures.

## Prerequisites

### Required Tools
- Docker v24.0.0 or higher
- Kubernetes v1.28.0 or higher
- Helm v3.12.0 or higher
- kubectl CLI
- AWS CLI (for AWS deployments)
- Terraform v1.5.0 or higher

### Access Requirements
- Access to container registry
- Kubernetes cluster access
- Cloud platform credentials
- Database access credentials
- CI/CD platform access

## Environment Setup

### Development Environment
```bash
# Clone repository
git clone https://github.com/organization/superapp.git
cd superapp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with development credentials

# Start development services
docker-compose -f docker-compose.dev.yml up -d

# Initialize database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### Staging Environment

#### Infrastructure Setup
```bash
# Navigate to infrastructure directory
cd infrastructure/staging

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply infrastructure changes
terraform apply tfplan

# Configure Kubernetes context
aws eks update-kubeconfig --name superapp-staging
```

#### Application Deployment
```bash
# Deploy core services
helm upgrade --install superapp-core ./charts/core -f values-staging.yaml

# Deploy dependent services
helm upgrade --install superapp-services ./charts/services -f values-staging.yaml

# Verify deployment
kubectl get pods -n superapp-staging
kubectl get services -n superapp-staging
```

### Production Environment

#### Infrastructure Setup
```bash
# Navigate to infrastructure directory
cd infrastructure/production

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -out=tfplan -var-file=prod.tfvars

# Apply infrastructure changes
terraform apply tfplan

# Configure Kubernetes context
aws eks update-kubeconfig --name superapp-production
```

#### Application Deployment
```bash
# Deploy core services
helm upgrade --install superapp-core ./charts/core -f values-production.yaml

# Deploy dependent services
helm upgrade --install superapp-services ./charts/services -f values-production.yaml

# Verify deployment
kubectl get pods -n superapp-production
kubectl get services -n superapp-production
```

## Deployment Configuration

### Docker Configuration

#### Development
```dockerfile
# docker-compose.dev.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      NODE_ENV: development
      DB_HOST: postgres
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: superapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Production
```dockerfile
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
    ports:
      - "3000:3000"
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

### Kubernetes Configuration

#### Core Services
```yaml
# values-production.yaml
global:
  environment: production
  domain: superapp.com

frontend:
  replicas: 3
  resources:
    requests:
      cpu: 1
      memory: 2Gi
    limits:
      cpu: 2
      memory: 4Gi

backend:
  replicas: 5
  resources:
    requests:
      cpu: 2
      memory: 4Gi
    limits:
      cpu: 4
      memory: 8Gi

database:
  size: 100Gi
  backup:
    enabled: true
    schedule: "0 2 * * *"
    retention: 30

redis:
  replicas: 3
  persistence:
    size: 20Gi

rabbitmq:
  replicas: 3
  persistence:
    size: 10Gi
```

## Deployment Procedures

### Standard Deployment
1. Create deployment branch
2. Update version numbers
3. Run tests
4. Build artifacts
5. Deploy to staging
6. Run integration tests
7. Deploy to production
8. Monitor deployment
9. Tag release

### Hotfix Deployment
1. Create hotfix branch
2. Apply fix
3. Run tests
4. Deploy to staging
5. Verify fix
6. Deploy to production
7. Backport to develop

### Rollback Procedures
1. Identify failure point
2. Select rollback version
3. Execute rollback command
4. Verify system state
5. Notify stakeholders

## Monitoring and Maintenance

### Health Checks
```bash
# Check service health
kubectl get pods -n superapp-production
kubectl describe pod <pod-name>

# Check logs
kubectl logs -f <pod-name>

# Check metrics
kubectl top pods
kubectl top nodes
```

### Scaling
```bash
# Scale deployment
kubectl scale deployment superapp-backend --replicas=5

# Auto-scaling
kubectl autoscale deployment superapp-backend \
  --min=3 \
  --max=10 \
  --cpu-percent=80
```

### Backup and Recovery
```bash
# Database backup
kubectl exec -it <postgres-pod> -- pg_dump -U postgres superapp > backup.sql

# Database restore
kubectl exec -it <postgres-pod> -- psql -U postgres superapp < backup.sql

# Volume backup
velero backup create superapp-backup --include-namespaces superapp-production
```

## Security Procedures

### SSL/TLS Configuration
```bash
# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.12.0 \
  --set installCRDs=true

# Configure SSL
kubectl apply -f ssl-config.yaml
```

### Secret Management
```bash
# Create secret
kubectl create secret generic app-secrets \
  --from-literal=DB_PASSWORD=<password> \
  --from-literal=API_KEY=<api-key>

# Update secret
kubectl create secret generic app-secrets \
  --from-literal=DB_PASSWORD=<new-password> \
  --from-literal=API_KEY=<new-api-key> \
  -o yaml --dry-run=client | kubectl apply -f -
```

## Troubleshooting

### Common Issues

#### Pod Startup Failure
```bash
# Check pod status
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check events
kubectl get events --sort-by=.metadata.createdTimestamp
```

#### Network Issues
```bash
# Check service
kubectl get svc

# Check endpoints
kubectl get endpoints

# Test connectivity
kubectl run -it --rm debug \
  --image=nicolaka/netshoot \
  -- bash
```

#### Resource Issues
```bash
# Check resource usage
kubectl top pods
kubectl describe node <node-name>

# Check pod resources
kubectl get pod <pod-name> -o yaml
```

## Maintenance Windows

### Scheduled Maintenance
- Database maintenance: Sundays 02:00-04:00 UTC
- System updates: First Saturday of month 22:00-02:00 UTC
- Security patches: As needed, with 48h notice

### Emergency Maintenance
1. Assess impact
2. Notify stakeholders
3. Execute maintenance
4. Verify system state
5. Post-maintenance report

## Contacts and Escalation

### Primary Contacts
- DevOps Team: devops@superapp.com
- Security Team: security@superapp.com
- Database Team: dba@superapp.com

### Escalation Path
1. On-call Engineer
2. DevOps Lead
3. CTO
4. CEO 