alter table public.users add column username text;
create unique index users_username_idx on public.users (username)
  where username is not null;
