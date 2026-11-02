-- Verrouillage des salons. À exécuter UNE FOIS.
alter table forums add column if not exists locked bool not null default false;
