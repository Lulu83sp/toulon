-- À exécuter UNE FOIS dans l'éditeur SQL Neon (sans risque pour les données existantes)
alter table topics add column if not exists locked bool not null default false;
create table if not exists images(
  id serial primary key,
  user_id int references users(id) on delete set null,
  mime text not null,
  data text not null,
  created_at timestamptz default now());
