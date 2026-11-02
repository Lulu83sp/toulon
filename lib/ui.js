import {SERVICES,svcList} from './services';
export const SvcIco=({k})=>SERVICES[k]?.l?<img className="svclogo" src={SERVICES[k].l} alt="" />:<>{SERVICES[k]?.i}</>;
export const Svc=({k})=>svcList(k).map(x=><span key={x} className="svc" style={{background:SERVICES[x].c,marginRight:4}}><SvcIco k={x}/> {SERVICES[x].n}</span>);
export const DESC={
'Annonces officielles':'Les annonces importantes de l’équipe du serveur.',
'Actualités du serveur':'Toutes les nouveautés et événements du serveur.',
'Règlement général':'À lire avant toute candidature, et à relire régulièrement pour être informé des changements potentiels.',
'Mises à jour':'Les notes de version et mises à jour du serveur.',
'Discussions générales':'Toutes les discussions relatives à LSPDFR Toulon, vos idées, organisation d’événements, etc.',
'Présentations des membres':'Nouveau sur le forum ? Présentez-vous à la communauté.',
'Suggestions':'Proposez vos idées pour améliorer le serveur.',
'Questions et assistance':'Une question ? La communauté est là pour vous répondre.',
'Annonces Police Nationale':'Annonces et informations de la Police Nationale.',
'Annonces Police Municipale':'Annonces et informations de la Police Municipale.',
'Annonces Sapeurs-Pompiers':'Annonces et informations des Sapeurs-Pompiers.',
'Annonces SAMU':'Annonces et informations du SAMU.',
'Recrutement Police Nationale':'Candidatures pour la Police Nationale.',
'Recrutement Police Municipale':'Candidatures pour la Police Municipale.',
'Recrutement Gendarmerie':'Candidatures pour la Gendarmerie.',
'Recrutement Sapeurs-Pompiers':'Candidatures pour les Sapeurs-Pompiers.',
'Recrutement SAMU':'Candidatures pour le SAMU.',
'Comptes rendus d\'intervention':'Publiez vos comptes rendus d’intervention.',
'Rapports de patrouille':'Rapports de patrouille de vos services.',
'Signalements':'Signalements liés au roleplay.',
'Demandes administratives':'Vos demandes auprès de l’administration.',
'Signaler un bug':'Un bug ? Décrivez-le ici avec un maximum d’informations.',
'Signaler un joueur':'Signalez un comportement contraire au règlement.',
'Demander de l\'aide':'Besoin d’aide ? Ouvrez un sujet.',
'Discussions du staff':'Espace privé de l’équipe : discussions internes.',
'Sanctions et signalements':'Suivi des sanctions, bans et signalements.',
'Délibérations recrutement':'Discussions internes sur les candidatures.',
'Gestion des membres':'Questions et décisions concernant les membres.',
'Idées et organisation':'Idées, projets et organisation de l’équipe.',
'Problèmes techniques':'Tous les problèmes techniques rencontrés sur le serveur sont à signaler ici.'};
export function ago(d){
  if(!d) return '';
  const s=(Date.now()-new Date(d).getTime())/1000;
  const p=(n,u,f)=>n<=1?`il y a ${f}`:`il y a ${n} ${u}`;
  if(s<60) return 'à l’instant';
  const m=Math.floor(s/60); if(m<60) return p(m,'minutes','une minute');
  const h=Math.floor(m/60); if(h<24) return p(h,'heures','une heure');
  const j=Math.floor(h/24); if(j<30) return p(j,'jours','un jour');
  const mo=Math.floor(j/30); if(mo<12) return `il y a ${mo} mois`;
  const a=Math.floor(mo/12); return p(a,'ans','un an');
}
export function Av({pseudo='?',avatar='',size=44}){
  const st={width:size,height:size,fontSize:size*.42};
  if(avatar) return <img className="av" src={avatar} alt="" style={st}/>;
  let h=0;for(const c of pseudo)h=(h*31+c.charCodeAt(0))%360;
  return <span className="av" style={{...st,background:`hsl(${h} 55% 40%)`}}>{pseudo[0]?.toUpperCase()}</span>;
}
export const Ico=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M4 4h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm16 5h-1v6a3 3 0 0 1-3 3h-5l1 1h5l3 2v-2h1a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"/></svg>;
