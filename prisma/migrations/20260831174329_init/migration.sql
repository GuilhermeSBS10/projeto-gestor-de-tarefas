-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "created_by" UUID NOT NULL,
    "assigned_to" UUID NOT NULL,
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_history" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE INDEX "tasks_assigned_to_idx" ON "tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "tasks_created_by_idx" ON "tasks"("created_by");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_priority_idx" ON "tasks"("priority");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
