# Schema.md - Database Schema Documentation in Markdown
<!-- Document your database schema, entity relationships, API endpoints, and data validation rules -->
<!-- The single source of truth for how your data is structured, accessed, and protected -->
<!-- Last updated: 20XX-XX-XX -->

---

## What Is a Markdown Schema?

A markdown schema is a `.md` file in your code repository that documents your entire database structure in plain text. It describes every table, column, data type, constraint, relationship, index, and query pattern using standard markdown syntax - headings, tables, code blocks, and bullet lists.

Unlike auto-generated documentation or ER diagrams locked in proprietary tools, a markdown schema is intentionally authored by your team to include the business context that makes database documentation actually useful. It answers not just "what columns does this table have?" but "why does this table exist, what business rules apply, and how should I query it?"

A typical markdown schema file includes:

- **Table definitions** with CREATE TABLE statements in SQL code blocks
- **Column reference tables** with types, nullability, defaults, and business descriptions
- **Entity relationships** showing how tables connect via foreign keys
- **Business rules** that exist in application logic, not just database constraints
- **Index inventory** with the query patterns each index optimizes
- **Common queries** with working SQL examples for each table
- **API contracts** documenting how the database is exposed to clients
- **Migration history** tracking what changed, when, and why
- **Performance targets** specifying acceptable query latencies
- **Data validation rules** for input sanitization and integrity constraints

Your markdown schema file lives at the root of your repository (typically `schema.md` or `docs/schema.md`) and is updated in the same pull request as your migration scripts. It is the single source of truth for your data model - readable by every developer on the team, parseable by every AI coding assistant, and reviewable in every pull request.

---

## Why Document Your Database Schema in Markdown

### 1. Version Control and Change History

Your database schema is one of the most critical artifacts in your codebase, but most teams document it in tools that have no version history. When your schema lives in a markdown file, every change is tracked in git. You can `git blame` any line to see who documented it and when. You can `git log schema.md` to see the full history of your data model. You can diff any two commits to see exactly how the schema evolved over a release cycle.

### 2. AI Coding Assistants Parse Markdown Natively

Large language models parse markdown with fewer tokens and higher accuracy than any other documentation format. When your database schema is in a .md file, AI coding assistants like GitHub Copilot, Cursor, and Claude can read it and generate correct SQL queries, respect foreign key relationships, honor business constraints, and suggest schema optimizations. An AI assistant that has read your schema.md writes dramatically better data access code than one that has not.

### 3. Pull Request Reviews for Schema Changes

When your schema documentation lives in markdown, it gets reviewed in the same pull request as your migration scripts. Reviewers see the documentation update alongside the SQL changes and verify that the docs match reality. This eliminates the common problem of schema documentation drifting out of sync with the actual database.

### 4. No Vendor Lock-In

Markdown is plain text. It works in every text editor, every operating system, every CI/CD pipeline, and every code hosting platform. You will never lose access to your schema documentation because a SaaS tool shut down, raised prices, or changed their API. Your .md files will be readable decades from now with zero dependencies.

### 5. Developer Onboarding

New developers joining your team can read a single markdown file and understand your entire data model - table purposes, column meanings, relationship paths, business rules, and common query patterns. Without a schema.md, new developers spend days or weeks reverse-engineering the database by reading migration files, ORM models, and application code. With one, they are productive in hours.

### 6. Searchable Across Your Codebase

Your schema.md is searchable with grep, IDE search, GitHub search, and every other text search tool. Need to find which table has a `stripe_customer_id` column? Search the file. Need to understand the relationship between orders and payments? Search the file. Unlike ER diagrams or GUI-based documentation, markdown is instantly searchable without special tools.

### 7. Works Offline

No internet connection required. No expired licenses. No loading spinners. Your markdown schema is always available in your local repository clone. This matters more than most teams realize - especially during incident response when you need to understand your data model quickly and your documentation SaaS might be experiencing its own outage.

### 8. Composable and Embeddable

Markdown schema docs can be included in other documents, linked from READMEs, referenced in architecture decision records, and rendered in static site generators. They compose naturally with the rest of your markdown documentation ecosystem. You can extract sections, link between files, and build a complete knowledge base from plain text.

---

## Markdown Schema vs Other Documentation Tools

| Feature                      | Markdown (.md)        | dbdiagram.io / DrawSQL | Confluence / Notion | pgAdmin / DataGrip  | SchemaSpy / tbls       |
| ---------------------------- | --------------------- | ---------------------- | ------------------- | ------------------- | ---------------------- |
| Version controlled in git    | Yes                   | Export only            | No                  | No                  | Re-generate each time  |
| AI assistants can read it    | Natively              | No                     | Poorly              | No                  | Partially              |
| Free and open                | Yes                   | Freemium               | Paid                | Varies              | Yes                    |
| Works offline                | Yes                   | No                     | No                  | Yes                 | Yes (after generation) |
| Reviewable in pull requests  | Yes                   | No                     | No                  | No                  | Yes (if committed)     |
| Includes business context    | Yes (authored)        | No (visual only)       | Yes (if maintained) | No (structure only) | No (auto-generated)    |
| Setup required               | None                  | Account signup         | Account + setup     | Installation        | Installation + config  |
| Stays in sync with code      | Same PR as migrations | Manual export          | Manual update       | Live connection     | Re-run on each change  |
| Human-readable without tools | Yes                   | Need browser           | Need browser        | Need application    | Need browser           |
| Supports query examples      | Yes                   | No                     | Yes                 | No                  | No                     |
| Documents business rules     | Yes                   | No                     | Yes (if maintained) | No                  | No                     |
| Migration history tracking   | Yes                   | No                     | Manual              | No                  | No                     |

**The key advantage of markdown**: it is the only format that combines version control, AI readability, business context, and zero dependencies in a single file. Other tools excel at visualization or auto-generation, but none match markdown for maintaining a living, reviewed, AI-readable schema document.

---

## How to Format Database Schemas in Markdown

This section shows the markdown syntax patterns for documenting each type of schema information. Use these patterns consistently throughout your schema.md file for maximum readability.

### Table Definitions

Use fenced SQL code blocks for CREATE TABLE statements. Include constraints, defaults, and CHECK clauses inline so the full structure is visible at a glance:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
```

### Column Reference Tables

Use markdown tables to provide column-by-column documentation with business context. This is where you add the meaning that SQL alone cannot express:

| Column     | Type         | Nullable | Default           | Description                                             |
| ---------- | ------------ | -------- | ----------------- | ------------------------------------------------------- |
| id         | UUID         | No       | gen_random_uuid() | Primary key, auto-generated server-side                 |
| email      | VARCHAR(255) | No       | -                 | Login email, globally unique, case-insensitive matching |
| name       | VARCHAR(200) | No       | -                 | Display name shown in the application UI                |
| role       | VARCHAR(20)  | No       | 'member'          | Permission level: admin, member, or viewer              |
| created_at | TIMESTAMP    | No       | CURRENT_TIMESTAMP | Account creation time (stored as UTC)                   |
| deleted_at | TIMESTAMP    | Yes      | -                 | Soft delete marker (null = active record)               |

### Entity Relationship Diagrams

Use text-based diagrams to show how tables connect. Keep them simple and readable in plain text:

```
users
  |-- 1:N --> posts (author_id)
  |-- 1:N --> comments (author_id)
posts
  |-- N:1 --> users (author_id)
  |-- 1:N --> comments (post_id)
  |-- N:N --> tags (via post_tags junction table)
comments
  |-- N:1 --> users (author_id)
  |-- N:1 --> posts (post_id)
```

For more detail, add a relationship reference table documenting foreign keys and delete behavior:

| Parent | Child     | FK Column | Cardinality | ON DELETE | Notes                                |
| ------ | --------- | --------- | ----------- | --------- | ------------------------------------ |
| users  | posts     | author_id | 1:N         | CASCADE   | Deleting user deletes their posts    |
| users  | comments  | author_id | 1:N         | CASCADE   | Deleting user deletes their comments |
| posts  | comments  | post_id   | 1:N         | CASCADE   | Deleting post deletes its comments   |
| posts  | post_tags | post_id   | 1:N         | CASCADE   | Junction table for many-to-many      |
| tags   | post_tags | tag_id    | 1:N         | CASCADE   | Junction table for many-to-many      |

### Business Rules

Use bullet lists to document rules enforced in application code, not just database constraints. These are critical for AI assistants and new developers:

**Business Rules**:
- Users cannot delete their account if they have published posts with comments from other users
- Email addresses are matched case-insensitively (stored as lowercase)
- The 'admin' role can only be assigned by another admin
- Soft-deleted records are excluded from all API responses but retained for 90 days
- Posts with status 'published' cannot be moved back to 'draft'

### Common Query Examples

Include working SQL for the most important access patterns. Comment each query with its purpose:

```sql
-- Find active user by email (used during login)
SELECT id, email, name, password_hash
FROM users
WHERE email = LOWER($1) AND deleted_at IS NULL;

-- List published posts with author names, paginated
SELECT p.id, p.title, p.published_at, u.name AS author_name
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.status = 'published' AND p.deleted_at IS NULL
ORDER BY p.published_at DESC
LIMIT $1 OFFSET $2;
```

### Index Documentation

Use markdown tables to document indexes alongside the query patterns they optimize:

| Index Name          | Table    | Columns             | Type            | Optimizes                     |
| ------------------- | -------- | ------------------- | --------------- | ----------------------------- |
| idx_users_email     | users    | email               | B-tree (unique) | Login by email                |
| idx_posts_author    | posts    | author_id, status   | B-tree          | List user's published posts   |
| idx_posts_published | posts    | published_at        | B-tree          | Homepage feed, sorted by date |
| idx_comments_post   | comments | post_id, created_at | B-tree          | Load comment threads in order |

### Migration History

Track schema changes in a table with context about what changed and why:

| Version | Date       | Description                                | Reversible                 |
| ------- | ---------- | ------------------------------------------ | -------------------------- |
| 005     | 20XX-XX-XX | Add full-text search index on posts.title  | Yes                        |
| 004     | 20XX-XX-XX | Add soft delete (deleted_at) to all tables | Yes                        |
| 003     | 20XX-XX-XX | Add tags and post_tags tables              | No (data loss on rollback) |
| 002     | 20XX-XX-XX | Add comments table with foreign keys       | Yes                        |
| 001     | 20XX-XX-XX | Initial schema - users and posts tables    | No (initial creation)      |

---

## Database Engine Examples

The following examples show how to document the same basic schema (users and posts) in markdown for different database engines. Each example highlights the syntax and features specific to that engine.

### PostgreSQL Schema in Markdown

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  bio TEXT,
  tags TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial index: only index non-deleted users
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
-- Composite index for common query pattern
CREATE INDEX idx_posts_author_status ON posts(author_id, status);
-- GIN index for JSONB queries
CREATE INDEX idx_posts_metadata ON posts USING GIN(metadata);
-- GIN index for array containment queries
CREATE INDEX idx_users_tags ON users USING GIN(tags);
```

**PostgreSQL features to document in your markdown schema**: UUID generation with `gen_random_uuid()`, JSONB columns with GIN indexes, array types (`TEXT[]`), partial indexes with WHERE clauses, `TIMESTAMPTZ` for timezone-aware timestamps, CHECK constraints, and `ON DELETE CASCADE` behavior.

### MySQL Schema in Markdown

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(200) NOT NULL,
  bio TEXT,
  settings JSON,
  role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  UNIQUE INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) NOT NULL,
  body LONGTEXT NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_posts_slug (slug),
  INDEX idx_posts_author_status (author_id, status),
  FULLTEXT INDEX idx_posts_search (title, body),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**MySQL features to document in your markdown schema**: `AUTO_INCREMENT` primary keys, `ENUM` types for constrained values, `ENGINE` and `CHARSET` specifications, `ON UPDATE CURRENT_TIMESTAMP` for auto-updated timestamps, `FULLTEXT` indexes for search, `LONGTEXT` for large content, and `JSON` column type (MySQL 5.7+).

### SQL Server Schema in Markdown

```sql
CREATE TABLE users (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  email NVARCHAR(255) NOT NULL,
  name NVARCHAR(200) NOT NULL,
  bio NVARCHAR(MAX),
  settings NVARCHAR(MAX),  -- JSON stored as string, validate with ISJSON()
  role NVARCHAR(20) DEFAULT 'member',
  created_at DATETIME2 DEFAULT GETUTCDATE(),
  deleted_at DATETIME2 NULL,
  CONSTRAINT UQ_users_email UNIQUE (email),
  CONSTRAINT CK_users_role CHECK (role IN ('admin', 'member', 'viewer'))
);

CREATE TABLE posts (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  author_id UNIQUEIDENTIFIER NOT NULL,
  title NVARCHAR(300) NOT NULL,
  slug NVARCHAR(300) NOT NULL,
  body NVARCHAR(MAX) NOT NULL,
  status NVARCHAR(20) DEFAULT 'draft',
  published_at DATETIME2 NULL,
  created_at DATETIME2 DEFAULT GETUTCDATE(),
  updated_at DATETIME2 DEFAULT GETUTCDATE(),
  CONSTRAINT UQ_posts_slug UNIQUE (slug),
  CONSTRAINT CK_posts_status CHECK (status IN ('draft', 'published', 'archived')),
  CONSTRAINT FK_posts_author FOREIGN KEY (author_id)
    REFERENCES users(id) ON DELETE CASCADE
);

CREATE NONCLUSTERED INDEX idx_posts_author_status ON posts(author_id, status);
-- Filtered index (SQL Server equivalent of PostgreSQL partial index)
CREATE NONCLUSTERED INDEX idx_users_active ON users(email) WHERE deleted_at IS NULL;
```

**SQL Server features to document in your markdown schema**: `UNIQUEIDENTIFIER` with `NEWID()`, `NVARCHAR` for Unicode strings, `NVARCHAR(MAX)` instead of TEXT, `DATETIME2` for precision timestamps, `GETUTCDATE()` for UTC, named constraints (`CONSTRAINT CK_...`), filtered indexes with WHERE clauses, and `ISJSON()` for JSON validation.

### SQLite Schema in Markdown

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  settings TEXT,  -- JSON stored as TEXT, validate with json_valid()
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TEXT DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Enable foreign key enforcement (off by default in SQLite)
PRAGMA foreign_keys = ON;

CREATE INDEX idx_posts_author_status ON posts(author_id, status);
```

**SQLite features to document in your markdown schema**: `INTEGER PRIMARY KEY AUTOINCREMENT`, `TEXT` for all string types (no VARCHAR/NVARCHAR distinction), `datetime()` function for timestamps stored as TEXT, `json_valid()` for JSON validation, foreign keys disabled by default (need `PRAGMA foreign_keys = ON`), limited `ALTER TABLE` support (document migration workarounds), and no native UUID type (use TEXT with application-generated UUIDs).

### MongoDB Document Schema in Markdown

MongoDB does not enforce schemas by default, but you should document the expected document structure and use validation rules. Here is how to document a MongoDB schema in markdown:

**users collection**:
```javascript
// Expected document structure
{
  _id: ObjectId,            // Auto-generated
  email: String,            // Required, unique, stored lowercase
  name: String,             // Required, 2-200 characters
  bio: String,              // Optional
  role: String,             // "admin" | "member" | "viewer", default: "member"
  settings: {               // Embedded document (not a separate collection)
    theme: String,          // "light" | "dark", default: "light"
    notifications: Boolean  // default: true
  },
  tags: [String],           // Array of strings
  createdAt: Date,          // Auto-set via Mongoose timestamps
  updatedAt: Date,          // Auto-updated via Mongoose timestamps
  deletedAt: Date           // Null for active records (soft delete)
}

// JSON Schema validation rule
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name"],
      properties: {
        email: { bsonType: "string", pattern: "^.+@.+$" },
        name: { bsonType: "string", minLength: 2, maxLength: 200 },
        role: { enum: ["admin", "member", "viewer"] }
      }
    }
  }
});

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ deletedAt: 1 }, {
  partialFilterExpression: { deletedAt: null }
});
```

**posts collection**:
```javascript
{
  _id: ObjectId,
  authorId: ObjectId,       // References users._id
  title: String,            // Required, 1-300 characters
  slug: String,             // Required, unique, URL-friendly
  body: String,             // Required, markdown content
  status: String,           // "draft" | "published" | "archived"
  tags: [String],           // Array of tag strings
  comments: [{              // Embedded subdocuments (for small counts)
    authorId: ObjectId,
    body: String,
    createdAt: Date
  }],
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.posts.createIndex({ authorId: 1, status: 1 });
db.posts.createIndex({ slug: 1 }, { unique: true });
db.posts.createIndex({ tags: 1 });  // Multikey index for array field
db.posts.createIndex({ title: "text", body: "text" });  // Text search
```

**MongoDB features to document in your markdown schema**: Embedded documents vs references (and when to use each), array fields with multikey indexes, JSON Schema validation rules, text indexes for full-text search, no JOIN operations (document the denormalization strategy), ObjectId references between collections, and Mongoose schema definitions if your project uses Mongoose.

---

## Common Database Schema Patterns

These are the most frequently needed database schema patterns. Each includes table definitions, relationships, and key business rules. Use these as starting points and customize for your project.

### User Authentication Schema

The foundation of most applications. Handles user accounts, roles, permissions, and sessions.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),       -- Null for OAuth users
  auth_provider VARCHAR(20) DEFAULT 'email',  -- email, google, github, saml
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  failed_login_count INTEGER DEFAULT 0,
  locked_until TIMESTAMP,           -- Account lockout after failed attempts
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,  -- admin, editor, viewer
  description TEXT
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,  -- SHA-256 of session token
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,               -- Null until consumed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key business rules**: Lock account after 5 failed logins for 15 minutes. Session tokens expire after 24 hours of inactivity. Password reset tokens are single-use and expire after 1 hour. Email must be verified before accessing protected resources. Password requirements: minimum 8 characters, must include uppercase, lowercase, and digit. Store only bcrypt hashes, never plaintext.

### E-Commerce Schema

Product catalog, shopping cart, orders, and payment tracking.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),  -- Store as cents
  currency VARCHAR(3) DEFAULT 'USD',
  sku VARCHAR(100) UNIQUE,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),  -- Self-referencing hierarchy
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE product_categories (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  notes TEXT,
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL,  -- Price at time of purchase
  total_cents INTEGER NOT NULL
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  stripe_payment_id VARCHAR(255) UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  method VARCHAR(20),  -- card, bank_transfer, paypal
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key business rules**: Store all monetary values as integers in cents to avoid floating-point rounding errors. `order_items.unit_price_cents` captures the price at time of purchase - products may change price later. Decrement `stock_quantity` atomically when order status changes to 'paid'. Orders cannot be cancelled after status changes to 'shipped'. Categories support nesting via `parent_id` for hierarchical product navigation.

### Content Management Schema

Blog posts, pages, authors, categories, tags, and media assets.

```sql
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  display_name VARCHAR(200) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  social_links JSONB DEFAULT '{}'
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES authors(id),
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  excerpt TEXT,                 -- Short summary for listings and SEO
  body TEXT NOT NULL,           -- Markdown or HTML content
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived')),
  featured_image_url VARCHAR(500),
  seo_title VARCHAR(70),       -- Override for title tag (max 70 chars)
  seo_description VARCHAR(160),-- Override for meta description (max 160 chars)
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id)  -- Nested categories
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE post_categories (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(300),      -- Accessibility description for images
  width INTEGER,              -- Image dimensions (null for non-images)
  height INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key business rules**: Posts with status 'published' must have a non-null `published_at` timestamp. SEO title limited to 70 characters and meta description to 160 characters (search engine display limits). Categories support nesting via `parent_id` (max 3 levels deep). Slugs are auto-generated from titles but can be manually overridden. Media files are stored in object storage (S3/GCS); the `url` column contains the CDN URL.

### Multi-Tenant SaaS Schema

Organization-scoped data isolation with subscription billing.

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,  -- Used in subdomain: {slug}.app.com
  plan VARCHAR(20) DEFAULT 'free'
    CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, user_id)
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID UNIQUE NOT NULL REFERENCES tenants(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at TIMESTAMP,        -- Scheduled cancellation date
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  stripe_invoice_id VARCHAR(255) UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRITICAL: Row-Level Security for multi-tenant data isolation
-- Every query MUST filter by tenant_id
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenant_members
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Key business rules**: Every data table must include a `tenant_id` column and every query must filter by it - no exceptions. Row-level security (RLS) provides a database-level safety net but application code should also enforce tenant isolation. Each tenant must have exactly one owner. Plan limits: free (3 members, 1 project), starter (10 members, 5 projects), pro (50 members, unlimited), enterprise (unlimited). Subscription status 'past_due' gives a 7-day grace period before restricting access to free plan features.

---

## Full Example: Multi-Tenant Project Management Schema

The following is a complete, production-quality database schema documented in markdown. It demonstrates every documentation pattern from this template applied to a real project. Use this as a reference for documenting your own database schema.

### Schema Overview

**Project**: Ridgeline - Multi-Tenant Project Management Platform
**Database Engine**: PostgreSQL 16 (AWS RDS, Multi-AZ)
**ORM**: Prisma 5.x with TypeScript
**Schema Version**: 42 (total applied migrations)
**Last Migration**: 20XX-XX-XX
**Total Tables**: 8 core tables + 3 supporting tables
**Estimated Row Counts**: organizations ~500, users ~5,000, tasks ~250,000

### Design Principles

These principles apply to every table in this schema:

- **Multi-tenancy**: All user data is scoped by `organization_id`. Every query must include this filter. No exceptions.
- **Soft deletes**: Records are never physically deleted. Use `deleted_at` timestamp (null = active). Hard deletes require a data retention policy review.
- **Audit trail**: All tables include `created_at`, `updated_at`, `created_by`, `updated_by`. Set automatically by the ORM.
- **UUIDs**: All primary keys are UUID v4, generated server-side. Never accept client-generated UUIDs.
- **Naming conventions**: Table and column names use `snake_case`. The ORM maps to `camelCase` in TypeScript.
- **Indexes**: Every foreign key is indexed. Composite indexes on frequently queried column pairs. Partial indexes exclude soft-deleted rows.
- **Timestamps**: Stored as UTC. Client-side code converts to the user's timezone for display.
- **JSONB fields**: Validated against a JSON schema before storage. Maximum 100KB per field.

### Database Connection Configuration

```
Primary:      postgresql://app_user@primary.rds.amazonaws.com:5432/ridgeline
Read Replica: postgresql://app_reader@replica.rds.amazonaws.com:5432/ridgeline
Connection Pool: PgBouncer, max 100 connections, transaction mode
SSL: Required (verify-full)
Statement Timeout: 30 seconds (application), 5 minutes (migrations)
```

### Core Tables

#### organizations

The top-level tenant table. All data in the system is scoped to an organization.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  seat_limit INTEGER DEFAULT 5,
  settings JSONB DEFAULT '{}',
  stripe_customer_id VARCHAR(255),
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_stripe ON organizations(stripe_customer_id);
```

| Column             | Type         | Nullable | Default           | Description                                            |
| ------------------ | ------------ | -------- | ----------------- | ------------------------------------------------------ |
| id                 | UUID         | No       | gen_random_uuid() | Primary key, auto-generated                            |
| name               | VARCHAR(200) | No       | -                 | Display name of the organization                       |
| slug               | VARCHAR(100) | No       | -                 | URL-friendly identifier (lowercase, hyphens only)      |
| plan               | VARCHAR(20)  | No       | 'free'            | Subscription tier: free, pro, enterprise               |
| seat_limit         | INTEGER      | No       | 5                 | Maximum number of active members                       |
| settings           | JSONB        | No       | '{}'              | Org preferences (timezone, date format, notifications) |
| stripe_customer_id | VARCHAR(255) | Yes      | -                 | Stripe billing integration identifier                  |
| trial_ends_at      | TIMESTAMP    | Yes      | -                 | Pro trial expiration (null = no active trial)          |
| created_at         | TIMESTAMP    | No       | CURRENT_TIMESTAMP | Record creation time (UTC)                             |
| updated_at         | TIMESTAMP    | No       | CURRENT_TIMESTAMP | Last modification time (UTC)                           |
| deleted_at         | TIMESTAMP    | Yes      | -                 | Soft delete marker (null = active)                     |

**Business Rules**:
- Slug must match `^[a-z0-9-]+$`, 3-100 characters, globally unique
- Free plan: 5 seats, 10 projects. Pro: 50 seats, unlimited. Enterprise: unlimited.
- `settings` stores timezone, date format, notification defaults, feature flags
- Setting `deleted_at` disables the org and immediately revokes all member access

**Common Queries**:
```sql
-- Find active organization by slug
SELECT * FROM organizations WHERE slug = $1 AND deleted_at IS NULL;

-- List organizations on a paid plan
SELECT id, name, plan, seat_limit FROM organizations
WHERE plan != 'free' AND deleted_at IS NULL
ORDER BY created_at DESC;

-- Count active members vs seat limit
SELECT o.name, o.seat_limit, COUNT(om.id) AS active_members
FROM organizations o
LEFT JOIN organization_members om
  ON o.id = om.organization_id AND om.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id;
```

#### users

Authentication identity. A user can belong to multiple organizations.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  avatar_url VARCHAR(500),
  password_hash VARCHAR(255),
  auth_provider VARCHAR(20) DEFAULT 'email'
    CHECK (auth_provider IN ('email', 'google', 'saml')),
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_last_login ON users(last_login_at);
```

| Column            | Type         | Nullable | Default           | Description                                 |
| ----------------- | ------------ | -------- | ----------------- | ------------------------------------------- |
| id                | UUID         | No       | gen_random_uuid() | Primary key                                 |
| email             | VARCHAR(255) | No       | -                 | Globally unique, case-insensitive matching  |
| name              | VARCHAR(200) | No       | -                 | Display name                                |
| avatar_url        | VARCHAR(500) | Yes      | -                 | Profile image URL (S3 or OAuth provider)    |
| password_hash     | VARCHAR(255) | Yes      | -                 | Bcrypt hash (null for OAuth/SAML users)     |
| auth_provider     | VARCHAR(20)  | No       | 'email'           | Authentication method                       |
| email_verified_at | TIMESTAMP    | Yes      | -                 | When email was verified (null = unverified) |
| last_login_at     | TIMESTAMP    | Yes      | -                 | Most recent successful login                |

**Business Rules**:
- Email is globally unique, matched case-insensitively
- `password_hash` is null for OAuth/SAML users
- `email_verified_at` must be set before accessing any organization
- Users are never hard-deleted, only deactivated via `deleted_at`
- Password: 8-128 chars, uppercase + lowercase + digit, bcrypt cost 12

**Common Queries**:
```sql
-- Find user by email for login
SELECT id, email, name, password_hash, auth_provider, email_verified_at
FROM users WHERE email = LOWER($1) AND deleted_at IS NULL;

-- Users inactive for 90+ days
SELECT id, email, name, last_login_at FROM users
WHERE last_login_at < NOW() - INTERVAL '90 days'
AND deleted_at IS NULL ORDER BY last_login_at ASC;
```

#### organization_members

Join table mapping users to organizations with role-based access.

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'member'
    CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_org_members_user ON organization_members(user_id)
  WHERE deleted_at IS NULL;
```

**Business Rules**:
- Every organization must have exactly one owner (transfer before leaving)
- Role hierarchy: owner > admin > member > viewer
- Owner: full control including billing. Admin: manage members, projects, settings. Member: create/edit tasks, comment. Viewer: read-only access.
- `deleted_at` means removed from org, not user account deleted

#### projects

Container for tasks, scoped to a single organization.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'completed')),
  color VARCHAR(7) DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_projects_org ON projects(organization_id, status)
  WHERE deleted_at IS NULL;
```

**Business Rules**:
- Name must be unique within an organization
- Archived projects are read-only (no new tasks or edits)
- `color` is a hex code for UI identification
- Deleting a project soft-deletes all its tasks

**Common Queries**:
```sql
-- Active projects for an organization
SELECT id, name, description, color, sort_order FROM projects
WHERE organization_id = $1 AND status = 'active' AND deleted_at IS NULL
ORDER BY sort_order ASC, name ASC;

-- Projects with task counts by status
SELECT p.id, p.name,
  COUNT(*) FILTER (WHERE t.status = 'todo') AS todo_count,
  COUNT(*) FILTER (WHERE t.status = 'in_progress') AS in_progress_count,
  COUNT(*) FILTER (WHERE t.status = 'done') AS done_count
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id AND t.deleted_at IS NULL
WHERE p.organization_id = $1 AND p.deleted_at IS NULL
GROUP BY p.id ORDER BY p.sort_order;
```

#### tasks

Work items within a project. Supports subtasks, assignees, priorities, due dates, and tags.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'in_review', 'done', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  assignee_id UUID REFERENCES users(id),
  reporter_id UUID NOT NULL REFERENCES users(id),
  due_date DATE,
  completed_at TIMESTAMP,
  position INTEGER DEFAULT 0,
  parent_task_id UUID REFERENCES tasks(id),
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_tasks_project ON tasks(project_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id)
  WHERE deleted_at IS NULL AND status != 'done';
CREATE INDEX idx_tasks_org ON tasks(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due_date ON tasks(due_date)
  WHERE deleted_at IS NULL AND status NOT IN ('done', 'cancelled');
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id)
  WHERE parent_task_id IS NOT NULL;
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags) WHERE deleted_at IS NULL;
```

**Business Rules**:
- Status flow: todo -> in_progress -> in_review -> done (or cancelled from any state)
- Setting status to 'done' auto-sets `completed_at`
- `position` controls kanban column order (lower = first)
- `parent_task_id` enables subtasks (max 2 levels deep)
- `organization_id` denormalized from project for cross-project queries
- Overdue: `due_date < CURRENT_DATE AND status NOT IN ('done', 'cancelled')`
- Tags limited to 10 per task, each max 50 characters

**Common Queries**:
```sql
-- Kanban board: tasks for a project by status
SELECT id, title, status, priority, assignee_id, due_date, position
FROM tasks WHERE project_id = $1 AND deleted_at IS NULL
ORDER BY position ASC;

-- Overdue tasks across an organization
SELECT t.id, t.title, t.due_date, p.name AS project_name, u.name AS assignee
FROM tasks t
JOIN projects p ON t.project_id = p.id
LEFT JOIN users u ON t.assignee_id = u.id
WHERE t.organization_id = $1
  AND t.due_date < CURRENT_DATE
  AND t.status NOT IN ('done', 'cancelled')
  AND t.deleted_at IS NULL
ORDER BY t.due_date ASC;

-- Dashboard: task counts by status
SELECT status, COUNT(*) FROM tasks
WHERE organization_id = $1 AND deleted_at IS NULL
GROUP BY status;

-- Search tasks by tag
SELECT id, title, tags FROM tasks
WHERE organization_id = $1 AND tags @> ARRAY[$2]::TEXT[]
AND deleted_at IS NULL;
```

#### comments

Discussion threads on tasks. Supports markdown content and @mentions.

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  author_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_comments_task ON comments(task_id, created_at)
  WHERE deleted_at IS NULL;
```

**Business Rules**: Markdown formatting in body. @mentions trigger notifications. Only the author can edit (sets `edited_at`). Soft delete preserves for audit.

#### attachments

File attachments on tasks. Files stored in S3, metadata in the database.

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_attachments_task ON attachments(task_id) WHERE deleted_at IS NULL;
```

**Business Rules**: Max 25MB (free), 100MB (pro/enterprise). Allowed types: images, PDFs, docs, spreadsheets, text. No executables. S3 key format: `{org_id}/{project_id}/{task_id}/{uuid}/{filename}`. Soft delete schedules S3 cleanup after 30 days.

### Entity Relationships

```
organizations (tenant root)
  |
  |-- 1:N --> organization_members --> N:1 -- users
  |             (role, joined_at)
  |
  |-- 1:N --> projects
  |             |
  |             |-- 1:N --> tasks
  |                          |
  |                          |-- N:1 --> users (assignee_id)
  |                          |-- N:1 --> users (reporter_id)
  |                          |-- 1:N --> tasks (subtasks via parent_task_id)
  |                          |-- 1:N --> comments --> N:1 -- users (author_id)
  |                          |-- 1:N --> attachments --> N:1 -- users (uploaded_by)
```

| Parent        | Child                | FK Column       | Cardinality | ON DELETE | Notes                                 |
| ------------- | -------------------- | --------------- | ----------- | --------- | ------------------------------------- |
| organizations | organization_members | organization_id | 1:N         | RESTRICT  | Cannot delete org with members        |
| organizations | projects             | organization_id | 1:N         | RESTRICT  | Cannot delete org with projects       |
| users         | organization_members | user_id         | 1:N         | RESTRICT  | Cannot delete user with memberships   |
| users         | tasks                | assignee_id     | 1:N         | SET NULL  | Unassigns tasks if user removed       |
| users         | tasks                | reporter_id     | 1:N         | RESTRICT  | Cannot delete user who reported tasks |
| projects      | tasks                | project_id      | 1:N         | RESTRICT  | Cannot delete project with tasks      |
| tasks         | tasks                | parent_task_id  | 1:N         | SET NULL  | Subtasks become top-level             |
| tasks         | comments             | task_id         | 1:N         | CASCADE   | Deleting task deletes comments        |
| tasks         | attachments          | task_id         | 1:N         | CASCADE   | Deleting task deletes attachments     |

### Index Inventory

| Index Name               | Table                | Columns                 | Type            | Partial Filter                       | Optimizes               |
| ------------------------ | -------------------- | ----------------------- | --------------- | ------------------------------------ | ----------------------- |
| idx_organizations_slug   | organizations        | slug                    | B-tree          | deleted_at IS NULL                   | Org lookup by slug      |
| idx_organizations_stripe | organizations        | stripe_customer_id      | B-tree          | -                                    | Stripe webhooks         |
| idx_users_email          | users                | email                   | B-tree (unique) | deleted_at IS NULL                   | Login by email          |
| idx_users_last_login     | users                | last_login_at           | B-tree          | -                                    | Inactive user reports   |
| idx_org_members_org      | organization_members | organization_id         | B-tree          | deleted_at IS NULL                   | List org members        |
| idx_org_members_user     | organization_members | user_id                 | B-tree          | deleted_at IS NULL                   | List user's orgs        |
| idx_projects_org         | projects             | organization_id, status | B-tree          | deleted_at IS NULL                   | List projects by status |
| idx_tasks_project        | tasks                | project_id, status      | B-tree          | deleted_at IS NULL                   | Kanban board            |
| idx_tasks_assignee       | tasks                | assignee_id             | B-tree          | deleted_at IS NULL, status != 'done' | My active tasks         |
| idx_tasks_org            | tasks                | organization_id         | B-tree          | deleted_at IS NULL                   | Cross-project queries   |
| idx_tasks_due_date       | tasks                | due_date                | B-tree          | active, not done/cancelled           | Overdue alerts          |
| idx_tasks_parent         | tasks                | parent_task_id          | B-tree          | parent_task_id IS NOT NULL           | Subtask lookups         |
| idx_tasks_tags           | tasks                | tags                    | GIN             | deleted_at IS NULL                   | Tag search              |
| idx_comments_task        | comments             | task_id, created_at     | B-tree          | deleted_at IS NULL                   | Comment threads         |
| idx_attachments_task     | attachments          | task_id                 | B-tree          | deleted_at IS NULL                   | Task attachments        |

### Query Performance Targets

| Query Pattern                  | Target | Index Used             |
| ------------------------------ | ------ | ---------------------- |
| Get org by slug                | < 2ms  | idx_organizations_slug |
| Get user by email (login)      | < 2ms  | idx_users_email        |
| List projects by org + status  | < 5ms  | idx_projects_org       |
| List tasks by project + status | < 5ms  | idx_tasks_project      |
| List active tasks by assignee  | < 10ms | idx_tasks_assignee     |
| List overdue tasks across org  | < 20ms | idx_tasks_due_date     |
| Search tasks by tag            | < 15ms | idx_tasks_tags         |
| Load comment thread for task   | < 5ms  | idx_comments_task      |

### API Endpoints

#### Authentication

**POST /api/v1/auth/login**
```json
// Request
{ "email": "string (required)", "password": "string (required, 8-128 chars)" }

// Response 200
{
  "user": { "id": "uuid", "email": "string", "name": "string" },
  "token": "jwt-string (expires in 24 hours)",
  "expiresAt": "ISO-8601 timestamp"
}
```
Rate limit: 20/min per IP. Account locks after 10 failed attempts for 15 minutes.

**POST /api/v1/auth/register**
```json
{
  "email": "string (required, valid email format)",
  "name": "string (required, 2-200 chars)",
  "password": "string (required, 8-128 chars, uppercase + lowercase + number)",
  "organizationName": "string (optional - creates a new org if provided)"
}
```

#### Projects

**GET /api/v1/projects** - List projects. Query: `status`, `limit` (1-100), `offset`, `sort`, `order`.

**POST /api/v1/projects** - Create project. Body: `name` (required, unique in org), `description`, `color`.

**PATCH /api/v1/projects/:projectId** - Partial update. Admin+ to archive.

**DELETE /api/v1/projects/:projectId** - Soft delete project and all tasks. Admin+ only.

#### Tasks

**GET /api/v1/projects/:projectId/tasks** - List tasks. Query: `status`, `assignee`, `priority`, `due_before`, `due_after`, `search`, `tags`, `limit`, `offset`.

**POST /api/v1/projects/:projectId/tasks**
```json
{
  "title": "string (required, 1-500 chars)",
  "description": "string (optional, max 10000 chars, markdown)",
  "status": "string (optional, default: todo)",
  "priority": "string (optional, default: medium)",
  "assigneeId": "uuid (optional)",
  "dueDate": "YYYY-MM-DD (optional, today or future)",
  "parentTaskId": "uuid (optional, for subtasks)",
  "tags": ["string (max 10, each max 50 chars)"]
}
```

**PATCH /api/v1/tasks/:taskId** - Partial update. Status to 'done' auto-sets completedAt.

**DELETE /api/v1/tasks/:taskId** - Soft delete. Cascades to comments and attachments.

#### Error Response Format

```json
{
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable explanation",
    "details": {}
  }
}
```

| Code             | Status | When                             |
| ---------------- | ------ | -------------------------------- |
| AUTH_REQUIRED    | 401    | No token provided                |
| AUTH_INVALID     | 401    | Token expired or malformed       |
| FORBIDDEN        | 403    | Insufficient role/permissions    |
| NOT_FOUND        | 404    | Resource missing or no access    |
| VALIDATION_ERROR | 400    | Request failed schema validation |
| CONFLICT         | 409    | Duplicate resource               |
| RATE_LIMITED     | 429    | 100/min auth, 20/min login       |
| INTERNAL_ERROR   | 500    | Unexpected server error          |

### Data Validation Rules

```typescript
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().max(5000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}/).optional().default('#6366f1'),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500).trim(),
  description: z.string().max(10000).optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled']).optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low']).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  parentTaskId: z.string().uuid().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});
```

| Data Type   | Validation Rule                                      | Enforced In |
| ----------- | ---------------------------------------------------- | ----------- |
| Org slug    | `^[a-z0-9-]+$`, 3-100 chars, unique                  | DB + API    |
| Email       | RFC 5322, max 255 chars, case-insensitive unique     | DB + API    |
| Password    | 8-128 chars, uppercase + lowercase + digit           | API         |
| UUID        | v4 format, server-generated only                     | API         |
| Timestamps  | UTC storage, client converts for display             | DB + ORM    |
| JSONB       | Validated against JSON schema, max 100KB             | API         |
| Text fields | XSS sanitized on input, markdown whitelist on render | API + UI    |

### Migration History

| Version   | Date       | Description                                  | Reversible | Status            |
| --------- | ---------- | -------------------------------------------- | ---------- | ----------------- |
| 042       | 20XX-XX-XX | Add `tags` array column to tasks + GIN index | Yes        | Applied           |
| 041       | 20XX-XX-XX | Add partial index on tasks.due_date          | Yes        | Applied           |
| 040       | 20XX-XX-XX | Add `settings` JSONB to organizations        | Yes        | Applied           |
| 039       | 20XX-XX-XX | Add subtask support (parent_task_id)         | Yes        | Applied           |
| 038       | 20XX-XX-XX | Add comments and attachments tables          | No         | Applied           |
| 037       | 20XX-XX-XX | Add organization_members.invited_by          | Yes        | Applied           |
| 036       | 20XX-XX-XX | Add auth_provider to users, backfill 'email' | Yes        | Applied           |
| [Version] | [Date]     | [Description]                                | [Yes/No]   | [Applied/Pending] |

```bash
pnpm db:migrate:status           # Check current migration status
pnpm db:migrate:create --name X  # Create a new migration file
pnpm db:migrate                  # Apply all pending migrations
pnpm db:migrate:rollback         # Rollback the last applied migration
pnpm db:reset                    # Drop all, re-migrate, re-seed (DEV ONLY)
```

### Query Monitoring

```sql
-- Find queries slower than 100ms (requires pg_stat_statements)
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY total_exec_time DESC
LIMIT 20;

-- Table sizes including indexes
SELECT
  schemaname || '.' || tablename AS table_name,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS data_size
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Active connections by state
SELECT state, COUNT(*) FROM pg_stat_activity
WHERE datname = 'ridgeline' GROUP BY state;
```

### Backup and Recovery

| Backup Type         | Schedule                | Retention | Method                         |
| ------------------- | ----------------------- | --------- | ------------------------------ |
| Automated snapshots | Daily 3 AM UTC          | 30 days   | AWS RDS automated backup       |
| Transaction logs    | Continuous              | 30 days   | Point-in-time recovery via WAL |
| Manual snapshots    | Before major migrations | 90 days   | AWS RDS manual snapshot        |
| Logical backup      | Weekly                  | 12 months | pg_dump to S3                  |

- **RPO**: < 5 minutes (continuous WAL archiving)
- **RTO**: < 30 minutes (RDS Multi-AZ automatic failover)
- **Migration rollback**: < 5 minutes (pre-tested DOWN scripts)

---

## Schema Documentation Tools and Integrations

These tools complement a markdown-based schema documentation workflow:

### Generate Markdown from an Existing Database

- **[tbls](https://github.com/k1LoW/tbls)** - Generates markdown documentation from a live database connection. Outputs table definitions, column details, relationships, and ER diagrams. Use it to bootstrap your schema.md, then customize with business context.
- **[SchemaSpy](https://schemaspy.org/)** - Generates HTML documentation with ER diagrams from a database. Export the structure and convert to your markdown format.
- **[dbdocs](https://dbdocs.io/)** - Generates documentation from DBML files. Can export to markdown.

### ER Diagrams in Markdown

- **[Mermaid](https://mermaid.js.org/)** - Write ER diagrams in markdown code blocks. GitHub, GitLab, and most markdown renderers support Mermaid natively. Embed diagrams directly in your schema.md file.

### Schema Definition Languages

- **[DBML](https://dbml.dbdiagram.io/)** - Database Markup Language. Can be converted to SQL and used alongside your markdown docs.
- **[Prisma Schema](https://www.prisma.io/)** - ORM schema definition that serves as a source of truth. Generate markdown docs from your schema.prisma file.

### Editors and Extensions

- **VS Code + Markdown Table Formatter** - Auto-formats markdown tables for consistent column alignment in your schema file.
- **VS Code + Markdown Preview** - Live preview of your schema.md while editing.
- **GitHub / GitLab** - Renders markdown schema files directly in the browser with table formatting and syntax highlighting.

---

## Using This Template

### How to Customize

1. Replace "Ridgeline" with your project name throughout the full example section
2. Update the database engine, ORM, and connection details to match your stack
3. Replace the example tables with your actual schema - keep the same documentation format
4. Update the API endpoints section to match your REST or GraphQL API
5. Fill in your actual migration history and keep it updated with every schema change
6. Adjust the indexing strategy and performance targets for your workload
7. Update the backup and recovery section to match your infrastructure
8. Keep or remove the educational sections above based on your team's needs

### Tips for Maintaining Your Markdown Schema

- Update this file in the same pull request as your migration script
- Review schema documentation changes with the same rigor as code changes
- Keep business rules next to the tables they apply to, not in a separate section
- Include common queries for each table so developers and AI have working examples
- Run `EXPLAIN ANALYZE` on common queries periodically and update performance targets
- When you add a new table, copy the format from an existing table entry for consistency
