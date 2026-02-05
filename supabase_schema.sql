-- Create folders table
create table folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  parent_id uuid references folders(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid()
);

-- Create documents table
create table documents (
  id uuid default gen_random_uuid() primary key,
  folder_id uuid references folders(id) on delete cascade,
  title text not null,
  content text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid()
);

-- Enable RLS
alter table folders enable row level security;
alter table documents enable row level security;

-- Policies for folders
create policy "Users can view their own folders"
  on folders for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own folders"
  on folders for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own folders"
  on folders for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own folders"
  on folders for delete
  using ( auth.uid() = user_id );

-- Policies for documents
create policy "Users can view their own documents"
  on documents for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own documents"
  on documents for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own documents"
  on documents for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own documents"
  on documents for delete
  using ( auth.uid() = user_id );

-- Function to handle updated_at
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on documents
  for each row execute procedure moddatetime (updated_at);
