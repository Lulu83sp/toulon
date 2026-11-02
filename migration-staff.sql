-- Catégorie STAFF (visible uniquement par Modérateur et au-dessus). À exécuter UNE FOIS.
alter table categories add column if not exists staff bool not null default false;
insert into categories(name,pos,staff) select 'STAFF',6,true where not exists(select 1 from categories where staff);
insert into forums(cat_id,name,pos) select c.id,v.n,v.p from (values
('Discussions du staff',1),('Sanctions et signalements',2),('Délibérations recrutement',3),('Gestion des membres',4),('Idées et organisation',5)) v(n,p)
join categories c on c.staff
where not exists(select 1 from forums f where f.cat_id=c.id);
