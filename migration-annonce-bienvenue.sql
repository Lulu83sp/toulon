-- Publie l'annonce de bienvenue dans « Annonces officielles » (épinglée, auteur = Fondateur).
-- À exécuter UNE FOIS dans l'éditeur SQL Neon (ne recrée pas l'annonce si elle existe déjà).
do $$
declare fid int; uid int; tid int;
begin
  select id into fid from forums where name='Annonces officielles' order by id limit 1;
  select id into uid from users where role='Fondateur' order by id limit 1;
  if fid is null or uid is null then raise exception 'Salon « Annonces officielles » ou compte Fondateur introuvable'; end if;
  if exists(select 1 from topics where forum_id=fid and title='Bienvenue sur le forum LSPDFR Toulon !') then return; end if;
  insert into topics(forum_id,user_id,title,pinned,locked) values(fid,uid,'Bienvenue sur le forum LSPDFR Toulon !',true,false) returning id into tid;
  insert into posts(topic_id,user_id,body) values(tid,uid,$b$[center][b]🚨 BIENVENUE SUR LSPDFR TOULON 🚨[/b]
[i]Le forum de la communauté roleplay du serveur[/i][/center]

Bonjour à toutes et à tous,

Toute l'équipe est heureuse de vous accueillir sur le forum officiel de [b]LSPDFR Toulon[/b]. Ce forum est le point de rencontre de notre communauté : c'est ici que vous trouverez les annonces, que vous pourrez candidater, publier vos rapports et échanger avec les autres joueurs.

[b]🚓 Les services que vous pouvez incarner[/b]
[b]•[/b] Police Nationale
[b]•[/b] Police Municipale
[b]•[/b] Gendarmerie
[b]•[/b] Sapeurs-Pompiers
[b]•[/b] SAMU

Vous pouvez afficher plusieurs services sur votre profil : rendez-vous dans [b]Paramètres › Mes services[/b] pour choisir vos badges.

[b]🚀 Pour bien démarrer[/b]
[b]1.[/b] Lisez attentivement le [b]Règlement général[/b] : il s'applique à tous les membres.
[b]2.[/b] Présentez-vous dans [b]Présentations des membres[/b].
[b]3.[/b] Personnalisez votre profil : photo, biographie et services.
[b]4.[/b] Consultez les salons de [b]Recrutement[/b] si vous souhaitez rejoindre un service.
[b]5.[/b] Une question ou un souci ? Passez par [b]Questions et assistance[/b] ou la catégorie [b]Support[/b].

[b]🤝 L'esprit de la communauté[/b]
Respect, fair-play et bonne humeur : nous voulons un roleplay réaliste et agréable pour tout le monde. Les comportements contraires au règlement peuvent être signalés dans [b]Signaler un joueur[/b].

Bon jeu à toutes et à tous, et encore bienvenue parmi nous ! :police: :pompier: :samu:

[i]— L'équipe du staff LSPDFR Toulon[/i]$b$);
end $$;
