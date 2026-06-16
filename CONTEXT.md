# Streak Counter — Ubiquitous Language

## People & Relationships

- **User**: A person with an account (auth.users + public.users row).
- **Username**: Unique, nullable slug on `users`, used in public profile URL `/u/[username]`. Fallback to UUID if null.
- **Public Profile**: Authenticated-only page at `/u/[slug]` showing a user's public streaks. User's own streaks link to here.
- **Public Streak**: A streak with `is_public = true`. Visible on the owner's public profile and to their followers.
- **Follow**: One-directional relationship. A follows B → A sees B's public streak names and counts.
- **Friend Request**: An invitation to upgrade a follow to mutual. Sender requests, receiver approves.
- **Friend**: Mutual follow relationship (both follow each other with `status = 'friends'`). Full streak history visibility.
