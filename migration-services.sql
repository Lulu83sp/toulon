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
