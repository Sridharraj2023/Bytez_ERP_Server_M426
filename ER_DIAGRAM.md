# Digital Agency ERP - Entity Relationship Diagram

## Database Entities and Relationships

### Core Entities

#### 1. USERS
- **Primary Key:** id (SERIAL)
- **Attributes:** name, email, password, role, phone, department, status, created_at, updated_at
- **Relationships:** 
  - One-to-Many with PROJECTS (created_by)
  - One-to-Many with TASKS (assigned_to, created_by)
  - Many-to-Many with PROJECTS via PROJECT_MEMBERS

#### 2. CLIENTS
- **Primary Key:** id (SERIAL)
- **Attributes:** company_name, industry, contact_name, phone, email, address, status, project_count, created_at, updated_at
- **Relationships:**
  - One-to-Many with PROJECTS (client_id)

#### 3. PROJECTS
- **Primary Key:** id (SERIAL)
- **Foreign Keys:** client_id (CLIENTS), created_by (USERS)
- **Attributes:** project_name, description, start_date, end_date, budget, status, created_at, updated_at
- **Relationships:**
  - Many-to-One with CLIENTS
  - Many-to-One with USERS (creator)
  - One-to-Many with TASKS
  - Many-to-Many with USERS via PROJECT_MEMBERS

#### 4. TASKS
- **Primary Key:** id (SERIAL)
- **Foreign Keys:** project_id (PROJECTS), assigned_to (USERS), created_by (USERS)
- **Attributes:** title, description, status, priority, due_date, created_at, updated_at
- **Relationships:**
  - Many-to-One with PROJECTS
  - Many-to-One with USERS (assignee)
  - Many-to-One with USERS (creator)
  - One-to-Many with COMMENTS
  - One-to-Many with ATTACHMENTS

#### 5. PROJECT_MEMBERS
- **Primary Key:** id (SERIAL)
- **Foreign Keys:** project_id (PROJECTS), user_id (USERS)
- **Attributes:** role, assigned_at
- **Relationships:**
  - Many-to-One with PROJECTS
  - Many-to-One with USERS

#### 6. COMMENTS
- **Primary Key:** id (SERIAL)
- **Foreign Keys:** task_id (TASKS), user_id (USERS)
- **Attributes:** comment, created_at
- **Relationships:**
  - Many-to-One with TASKS
  - Many-to-One with USERS

#### 7. ATTACHMENTS
- **Primary Key:** id (SERIAL)
- **Foreign Keys:** task_id (TASKS), uploaded_by (USERS)
- **Attributes:** file_name, file_path, file_size, uploaded_at
- **Relationships:**
  - Many-to-One with TASKS
  - Many-to-One with USERS

#### 8. ACTIVITY_LOGS
- **Primary Key:** id (SERIAL)
- **Foreign Keys:** user_id (USERS)
- **Attributes:** action, entity_type, entity_id, details, created_at
- **Relationships:**
  - Many-to-One with USERS

## Relationship Summary

### One-to-Many Relationships
- CLIENTS → PROJECTS (1:N)
- USERS → PROJECTS (1:N) [creator]
- USERS → TASKS (1:N) [assignee]
- USERS → TASKS (1:N) [creator]
- PROJECTS → TASKS (1:N)
- TASKS → COMMENTS (1:N)
- TASKS → ATTACHMENTS (1:N)
- USERS → COMMENTS (1:N)
- USERS → ATTACHMENTS (1:N)
- USERS → ACTIVITY_LOGS (1:N)

### Many-to-Many Relationships
- USERS ↔ PROJECTS via PROJECT_MEMBERS (M:N)

## Business Rules
1. Each client can have multiple projects
2. Each project belongs to one client
3. Each project can have multiple team members
4. Each task belongs to one project
5. Each task can be assigned to one user
6. Each task can have multiple comments and attachments
7. Users can be assigned to multiple projects with different roles
8. All activities are logged for audit purposes

## Constraints
- Email addresses must be unique in USERS table
- Project-User combinations must be unique in PROJECT_MEMBERS
- All foreign key relationships enforce referential integrity
- Status fields use CHECK constraints for valid values
- Timestamps are automatically managed