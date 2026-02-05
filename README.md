# DocSpace - Markdown Editing System

A simple, beautiful online Markdown editor built with Next.js and Supabase.

## Features
- **File Management**: Organize documents in nested folders.
- **Markdown Editor**: Real-time split-view editor with preview.
- **Secure**: Authentication via Supabase (or simple default credentials).
- **Modern UI**: Glassmorphism, dark mode support, and smooth interactions.

## Setup

### 1. Supabase Setup
1. Create a project at [Supabase](https://supabase.com).
2. Go to the SQL Editor and run the contents of [`supabase_schema.sql`](./supabase_schema.sql).
3. Retrieve your Project URL and Anon Key from Project Settings > API.

### 2. Environment Variables
Copy `.env.local.example` (or use the one created) to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DEFAULT_EMAIL=admin@example.com
DEFAULT_PASSWORD=changeme
```

### 3. Install & Run
```bash
npm install
npm run dev
```

## Deployment on Vercel

1. Push this repository to GitHub/GitLab.
2. Log in to [Vercel](https://vercel.com) and click "Add New... Project".
3. Import your repository.
4. In "Environment Variables", add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DEFAULT_EMAIL`
   - `DEFAULT_PASSWORD`
5. Click **Deploy**.

## Usage
- Log in with the credentials set in `.env` (or sign up if you changed the logic).
- On the first login with the `DEFAULT_EMAIL` and `DEFAULT_PASSWORD`, the account will be automatically created in Supabase.
