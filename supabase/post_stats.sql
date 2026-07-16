create table if not exists public.post_stats (
  slug text primary key,
  views bigint not null default 0,
  likes bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.post_stats enable row level security;

drop policy if exists "Public can read post stats" on public.post_stats;
create policy "Public can read post stats"
on public.post_stats
for select
to anon, authenticated
using (true);

create or replace function public.increment_post_view(post_slug text)
returns public.post_stats
language sql
security definer
set search_path = public
as $$
  insert into public.post_stats (slug, views, likes, updated_at)
  values (post_slug, 1, 0, now())
  on conflict (slug)
  do update set
    views = public.post_stats.views + 1,
    updated_at = now()
  returning *;
$$;

create or replace function public.increment_post_like(post_slug text)
returns public.post_stats
language sql
security definer
set search_path = public
as $$
  insert into public.post_stats (slug, views, likes, updated_at)
  values (post_slug, 0, 1, now())
  on conflict (slug)
  do update set
    likes = public.post_stats.likes + 1,
    updated_at = now()
  returning *;
$$;

grant execute on function public.increment_post_view(text) to anon, authenticated;
grant execute on function public.increment_post_like(text) to anon, authenticated;
