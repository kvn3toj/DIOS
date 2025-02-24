-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL PRIMARY KEY,
    "userId" VARCHAR(255),
    "eventType" VARCHAR(100) NOT NULL,
    "resourceType" VARCHAR(100),
    "resourceId" VARCHAR(255),
    "action" VARCHAR(100),
    "status" VARCHAR(20) NOT NULL,
    "details" JSONB,
    "ip" VARCHAR(45),
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("userId")
        REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_event_type_idx" ON "audit_logs"("eventType");
CREATE INDEX "audit_logs_status_idx" ON "audit_logs"("status");
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex for security alerts
CREATE INDEX "audit_logs_security_alerts_idx" ON "audit_logs"("status", "eventType")
WHERE (status = 'failure' OR eventType LIKE 'security.%'); 