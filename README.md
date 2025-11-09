# Supabase MCP Bridge

A lightweight serverless API bridge that enables Claude (via MCP) to query, modify, and set up Supabase databases. Deployed on Vercel.

## Features

- **CRUD Operations**: Query, insert, and update Supabase tables via REST API
- **Schema Management**: Dynamically create tables and schema
- **Serverless**: Fully compatible with Vercel serverless functions

## Project Structure

```
supabase-mcp-bridge/
 ├── api/
 │    ├── index.js      ← CRUD endpoint
 │    └── schema.js     ← Schema creation endpoint
 ├── package.json
 ├── .gitignore
 └── README.md
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Add the following environment variables in Vercel Project Settings → Environment Variables:

```
SUPABASE_URL = https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
```

**Important**: Use the Service Role Key (not the anon key) for full database access.

### 3. Deploy to Vercel

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## API Endpoints

### CRUD Endpoint: `/api`

#### GET Request
Returns health check status:

```bash
curl https://supabase-mcp-bridge.vercel.app/api
```

Response:
```json
{ "status": "Supabase MCP Bridge Active ✅" }
```

#### POST Request
Performs CRUD operations:

```bash
curl -X POST https://supabase-mcp-bridge.vercel.app/api \
  -H "Content-Type: application/json" \
  -d '{
    "action": "select|insert|update",
    "table": "<tablename>",
    "data": {},
    "query": "*"
  }'
```

**Parameters:**
- `action`: One of `select`, `insert`, or `update`
- `table`: Name of the Supabase table
- `data`: Object containing data for insert/update operations
- `query`: Column selection for select operations (default: `"*"`)

**Examples:**

Select all records:
```json
{
  "action": "select",
  "table": "bots",
  "query": "*"
}
```

Insert a record:
```json
{
  "action": "insert",
  "table": "bots",
  "data": {
    "name": "My Bot",
    "type": "chatbot",
    "model_choice": "gpt-4"
  }
}
```

Update records:
```json
{
  "action": "update",
  "table": "bots",
  "data": {
    "id": "uuid-here",
    "name": "Updated Bot Name"
  }
}
```

### Schema Endpoint: `/api/schema`

Creates tables dynamically based on requested entities:

```bash
curl -X POST https://supabase-mcp-bridge.vercel.app/api/schema \
  -H "Content-Type: application/json" \
  -d '{"entities":["organizations","members","bots","channels","leads"]}'
```

**Available Entities:**
- `organizations`: Organizations table (id, name, created_at)
- `members`: Members table (id, org_id, email, role, created_at)
- `bots`: Bots table (id, org_id, name, type, model_choice, settings, created_at)
- `channels`: Channels table (id, bot_id, type, external_id, status)
- `leads`: Leads table (id, bot_id, name, phone, email, zip, intent, confidence, created_at)

## Testing

### Test CRUD Endpoint

```bash
curl -X POST https://supabase-mcp-bridge.vercel.app/api \
  -H "Content-Type: application/json" \
  -d '{"action":"select","table":"bots","query":"*"}'
```

### Test Schema Endpoint

```bash
curl -X POST https://supabase-mcp-bridge.vercel.app/api/schema \
  -H "Content-Type: application/json" \
  -d '{"entities":["bots","leads"]}'
```

## MCP Integration

Add the bridge URL to Claude Desktop:

1. Open Claude Desktop → Settings
2. Go to Connectors → Add Custom Connector
3. Set Remote MCP Server URL to: `https://supabase-mcp-bridge.vercel.app/api`

## License

MIT
