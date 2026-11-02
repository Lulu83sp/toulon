-- Réactions (émojis) sur les messages. À exécuter UNE FOIS dans l'éditeur SQL Neon (sans risque pour les données existantes).
create table if not exists post_reactions(
  post_id int not null references posts(id) on delete cascade,
  user_id int not null references users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now(),
  primary key(post_id,user_id,emoji));
create index if not exists post_reactions_post on post_reactions(post_id);
