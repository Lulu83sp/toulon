-- Service choisi par le joueur (paramètres). À exécuter UNE FOIS.
alter table users add column if not exists service text not null default '';
