-- Descriptions personnalisées pour les salons créés par le staff. À exécuter UNE FOIS.
alter table forums add column if not exists descr text not null default '';
