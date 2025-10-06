# Deployment Instructions

## Prerequisites
- Supabase account and project
- Supabase CLI installed

## Database Setup

The database migration is located in `supabase/migrations/20250106000000_create_safety_and_legal_tables.sql`

To apply the migration when Supabase is available:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually through Supabase Dashboard:
# 1. Go to SQL Editor in your Supabase Dashboard
# 2. Copy the contents of the migration file
# 3. Execute the SQL
```

## Edge Functions Deployment

Two Edge Functions need to be deployed:

### 1. Content Safety Scanner

```bash
# Deploy using Supabase CLI
supabase functions deploy content-safety-scanner

# Or use the MCP tool when available:
# mcp__supabase__deploy_edge_function with files from:
# supabase/functions/content-safety-scanner/index.ts
```

### 2. Document Analyzer

```bash
# Deploy using Supabase CLI
supabase functions deploy document-analyzer

# Or use the MCP tool when available:
# mcp__supabase__deploy_edge_function with files from:
# supabase/functions/document-analyzer/index.ts
```

## Environment Variables

Ensure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Frontend Integration

Once the backend is deployed, update the frontend services:

### Update `src/services/contentScanner.ts`

Replace the `saveContentScan` function to call the Edge Function:

```typescript
export async function saveContentScan(
  scanType: string,
  content: string,
  result: ScanResult
): Promise<void> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/content-safety-scanner`;

  await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: scanType, content }),
  });
}
```

### Update `src/services/documentAnalyzer.ts`

Replace the `analyzeDocument` function to call the Edge Function:

```typescript
export async function analyzeDocument(file: File): Promise<any> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-analyzer`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: formData,
  });

  return await response.json();
}
```

## Build and Deploy Frontend

```bash
npm run build
```

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

## Current Status

The application is currently running with local storage as Supabase is experiencing regional issues. Once Supabase is available:

1. Apply the database migration
2. Deploy both Edge Functions
3. Update the frontend services to call the Edge Functions
4. Rebuild and redeploy the frontend

All backend code is ready and stored in the `supabase/` directory.
