create table users(id serial primary key,pseudo text unique not null,email text unique not null,hash text not null,role text not null default 'Membre',bio text not null default '',avatar text not null default '',banned bool not null default false,created_at timestamptz default now(),last_seen timestamptz default now());
create table categories(id serial primary key,name text not null,pos int);
create table forums(id serial primary key,cat_id int references categories(id),name text not null,pos int);
create table topics(id serial primary key,forum_id int references forums(id),user_id int references users(id),title text not null,pinned bool not null default false,locked bool not null default false,created_at timestamptz default now(),last_post_at timestamptz default now());
create table posts(id serial primary key,topic_id int references topics(id) on delete cascade,user_id int references users(id),body text not null,created_at timestamptz default now());
create index on topics(forum_id,last_post_at);create index on posts(topic_id);
insert into categories(name,pos) values ('INFORMATIONS GÉNÉRALES',1),('COMMUNAUTÉ',2),('RECRUTEMENT',3),('ROLEPLAY',4),('SUPPORT',5);
insert into forums(cat_id,name,pos) select c.id,v.n,v.p from (values
(1,'Annonces officielles',1),(1,'Actualités du serveur',2),(1,'Règlement général',3),(1,'Mises à jour',4),
(2,'Discussions générales',1),(2,'Présentations des membres',2),(2,'Suggestions',3),(2,'Questions et assistance',4),
(3,'Recrutement Police Nationale',1),(3,'Recrutement Police Municipale',2),(3,'Recrutement Gendarmerie',3),(3,'Recrutement Sapeurs-Pompiers',4),(3,'Recrutement SAMU',5),
(4,'Comptes rendus d''intervention',1),(4,'Rapports de patrouille',2),(4,'Signalements',3),(4,'Demandes administratives',4),
(5,'Signaler un bug',1),(5,'Signaler un joueur',2),(5,'Demander de l''aide',3),(5,'Problèmes techniques',4)) v(c,n,p) join categories c on c.pos=v.c;

create table images(id serial primary key,user_id int references users(id) on delete set null,mime text not null,data text not null,created_at timestamptz default now());
-- Catégorie STAFF (visible uniquement par Modérateur et au-dessus). À exécuter UNE FOIS.
alter table categories add column if not exists staff bool not null default false;
insert into categories(name,pos,staff) select 'STAFF',6,true where not exists(select 1 from categories where staff);
insert into forums(cat_id,name,pos) select c.id,v.n,v.p from (values
('Discussions du staff',1),('Sanctions et signalements',2),('Délibérations recrutement',3),('Gestion des membres',4),('Idées et organisation',5)) v(n,p)
join categories c on c.staff
where not exists(select 1 from forums f where f.cat_id=c.id);
-- Crée la catégorie SERVICES PUBLICS (annonces) et garde la Gendarmerie en RECRUTEMENT. Relançable sans risque.
do $$
declare sp int; rec int;
begin
  if not exists(select 1 from categories where name='SERVICES PUBLICS') then
    select id into rec from categories where name='RECRUTEMENT' limit 1;
    update categories set pos=pos+1 where pos>=3;
    insert into categories(name,pos) values('SERVICES PUBLICS',3) returning id into sp;
    update forums set cat_id=sp,name='Annonces Police Nationale',pos=1 where name='Recrutement Police Nationale';
    update forums set cat_id=sp,name='Annonces Police Municipale',pos=2 where name='Recrutement Police Municipale';
    update forums set cat_id=sp,name='Annonces Sapeurs-Pompiers',pos=3 where name='Recrutement Sapeurs-Pompiers';
    update forums set cat_id=sp,name='Annonces SAMU',pos=4 where name='Recrutement SAMU';
    update forums set pos=1 where name='Recrutement Gendarmerie';
  end if;
end $$;
-- Descriptions personnalisées pour les salons créés par le staff. À exécuter UNE FOIS.
alter table forums add column if not exists descr text not null default '';
-- Verrouillage des salons. À exécuter UNE FOIS.
alter table forums add column if not exists locked bool not null default false;
-- Service choisi par le joueur (paramètres). À exécuter UNE FOIS.
alter table users add column if not exists service text not null default '';
