create table users(id serial primary key,pseudo text unique not null,email text unique not null,hash text not null,role text not null default 'Membre',bio text not null default '',avatar text not null default '',banned bool not null default false,created_at timestamptz default now(),last_seen timestamptz default now());
create table categories(id serial primary key,name text not null,pos int);
create table forums(id serial primary key,cat_id int references categories(id),name text not null,pos int);
create table topics(id serial primary key,forum_id int references forums(id),user_id int references users(id),title text not null,pinned bool not null default false,created_at timestamptz default now(),last_post_at timestamptz default now());
create table posts(id serial primary key,topic_id int references topics(id) on delete cascade,user_id int references users(id),body text not null,created_at timestamptz default now());
create index on topics(forum_id,last_post_at);create index on posts(topic_id);
insert into categories(name,pos) values ('INFORMATIONS GÉNÉRALES',1),('COMMUNAUTÉ',2),('RECRUTEMENT',3),('ROLEPLAY',4),('SUPPORT',5);
insert into forums(cat_id,name,pos) select c.id,v.n,v.p from (values
(1,'Annonces officielles',1),(1,'Actualités du serveur',2),(1,'Règlement général',3),(1,'Mises à jour',4),
(2,'Discussions générales',1),(2,'Présentations des membres',2),(2,'Suggestions',3),(2,'Questions et assistance',4),
(3,'Recrutement Police Nationale',1),(3,'Recrutement Police Municipale',2),(3,'Recrutement Gendarmerie',3),(3,'Recrutement Sapeurs-Pompiers',4),(3,'Recrutement SAMU',5),
(4,'Comptes rendus d''intervention',1),(4,'Rapports de patrouille',2),(4,'Signalements',3),(4,'Demandes administratives',4),
(5,'Signaler un bug',1),(5,'Signaler un joueur',2),(5,'Demander de l''aide',3),(5,'Problèmes techniques',4)) v(c,n,p) join categories c on c.pos=v.c;
