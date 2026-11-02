'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {cookies} from 'next/headers';
import bcrypt from 'bcryptjs';
import {sql} from '../lib/db';
import {getUser,setSession,lv,LV} from '../lib/auth';
const s=(f,k,max)=>String(f.get(k)||'').trim().slice(0,max);
const back=(p,e)=>redirect(`${p}?e=${encodeURIComponent(e)}`);
const safeNext=n=>{n=String(n||'');return /^\/(?!\/)[^\\]*$/.test(n)?n:'/'};
const loginBack=(e,next)=>redirect(`/login?e=${encodeURIComponent(e)}${next&&next!=='/'?`&next=${encodeURIComponent(next)}`:''}`);

export async function register(f){
  const pseudo=s(f,'pseudo',20),email=s(f,'email',120).toLowerCase(),pw=String(f.get('pw')||''),pw2=String(f.get('pw2')||'');
  if(!/^[\wÀ-ÿ.-]{3,20}$/.test(pseudo)) back('/register','Pseudo invalide (3 à 20 caractères : lettres, chiffres, . - _).');
  if(!/^\S+@\S+\.\S+$/.test(email)) back('/register','Email invalide.');
  if(pw.length<8) back('/register','Mot de passe : 8 caractères minimum.');
  if(pw!==pw2) back('/register','Les deux mots de passe ne correspondent pas.');
  if(f.get('rules')!=='on') back('/register','Vous devez accepter le règlement.');
  const hash=await bcrypt.hash(pw,11);
  let u;
  try{
    [u]=await sql`insert into users(pseudo,email,hash,role) values(${pseudo},${email},${hash},
      case when (select count(*) from users)=0 then 'Fondateur' else 'Membre' end) returning id`;
  }catch{back('/register','Pseudo ou email déjà utilisé.')}
  await setSession(u.id,f.get('remember')==='on'); redirect('/');
}
export async function login(f){
  const id=s(f,'email',120).toLowerCase(),next=safeNext(f.get('next'));
  const [u]=await sql`select id,hash,banned from users where email=${id} or lower(pseudo)=${id}`;
  if(!u||!(await bcrypt.compare(String(f.get('pw')||''),u.hash))) loginBack('Identifiants incorrects.',next);
  if(u.banned) loginBack('Compte suspendu.',next);
  await setSession(u.id,f.get('remember')==='on'); redirect(next);
}
export async function logout(){cookies().delete('s');redirect('/')}

export async function createTopic(f){
  const u=await getUser(); if(!u) redirect('/login');
  const fid=Number(f.get('forum')),title=s(f,'title',140),body=s(f,'body',10000);
  if(!title||!body) back(`/new?f=${fid}`,'Titre et message requis.');
  const [fo]=await sql`select f.id,f.locked,c.pos,c.staff from forums f join categories c on c.id=f.cat_id where f.id=${fid}`;
  if(!fo||(fo.staff&&lv(u)<LV['Modérateur'])) redirect('/');
  if(fo.locked&&lv(u)<LV['Modérateur']) back(`/new?f=${fid}`,'Ce salon est verrouillé.');
  if(fo.pos===1&&lv(u)<LV['Modérateur']) back(`/new?f=${fid}`,'Réservé à l’équipe.');
  const [r]=await sql`select count(*) n from posts where user_id=${u.id} and created_at>now()-interval '30 seconds'`;
  if(Number(r.n)>=3) back(`/new?f=${fid}`,'Trop rapide, patientez.');
  const mod=lv(u)>=LV['Modérateur'];
  const pin=mod&&f.get('pin')==='on',lock=mod&&f.get('lock')==='on';
  const [t]=await sql`insert into topics(forum_id,user_id,title,pinned,locked) values(${fid},${u.id},${title},${pin},${lock}) returning id`;
  await sql`insert into posts(topic_id,user_id,body) values(${t.id},${u.id},${body})`;
  redirect(`/t/${t.id}`);
}
export async function reply(f){
  const u=await getUser(); if(!u) redirect('/login');
  const tid=Number(f.get('topic')),body=s(f,'body',10000);
  if(!body) redirect(`/t/${tid}`);
  const [tp]=await sql`select t.locked,f.locked as flocked,c.staff from topics t join forums f on f.id=t.forum_id join categories c on c.id=f.cat_id where t.id=${tid}`;
  if(!tp||(tp.staff&&lv(u)<LV['Modérateur'])) redirect('/');
  if((tp.locked||tp.flocked)&&lv(u)<LV['Modérateur']) back(`/t/${tid}`,tp.flocked?'Ce salon est verrouillé.':'Ce sujet est verrouillé.');
  const [r]=await sql`select count(*) n from posts where user_id=${u.id} and created_at>now()-interval '30 seconds'`;
  if(Number(r.n)>=3) back(`/t/${tid}`,'Trop rapide, patientez.');
  await sql`insert into posts(topic_id,user_id,body) values(${tid},${u.id},${body})`;
  await sql`update topics set last_post_at=now() where id=${tid}`;
  redirect(`/t/${tid}#fin`);
}
export async function deleteTopic(f){
  const u=await getUser(); if(!u) redirect('/login');
  const id=Number(f.get('id'));
  const [t]=await sql`select user_id,forum_id from topics where id=${id}`; if(!t) redirect('/');
  if(t.user_id!==u.id&&lv(u)<LV['Modérateur']) redirect(`/t/${id}`);
  await sql`delete from topics where id=${id}`; redirect(`/f/${t.forum_id}`);
}
export async function pinTopic(f){
  const u=await getUser(); if(lv(u)<LV['Modérateur']) redirect('/');
  const id=Number(f.get('id'));
  await sql`update topics set pinned=not pinned where id=${id}`; revalidatePath(`/t/${id}`);
}
export async function lockTopic(f){
  const u=await getUser(); if(lv(u)<LV['Modérateur']) redirect('/');
  const id=Number(f.get('id'));
  await sql`update topics set locked=not locked where id=${id}`; revalidatePath(`/t/${id}`); revalidatePath('/');
}
export async function setRole(f){
  const u=await getUser(); if(lv(u)<LV.Administrateur) redirect('/');
  const id=Number(f.get('id')),role=s(f,'role',20);
  if(!(role in LV)||id===u.id) redirect('/admin');
  const [t]=await sql`select role from users where id=${id}`;
  if(LV[t.role]>=lv(u)&&u.role!=='Fondateur') redirect('/admin');
  if(LV[role]>=lv(u)&&u.role!=='Fondateur') redirect('/admin');
  await sql`update users set role=${role} where id=${id}`; revalidatePath('/admin');
}
export async function toggleBan(f){
  const u=await getUser(); if(lv(u)<LV['Modérateur']) redirect('/');
  const id=Number(f.get('id'));
  const [t]=await sql`select role from users where id=${id}`;
  if(id===u.id||LV[t.role]>=lv(u)) redirect('/admin');
  await sql`update users set banned=not banned where id=${id}`; revalidatePath('/admin');
}
export async function saveBio(f){
  const u=await getUser(); if(!u) redirect('/login');
  await sql`update users set bio=${s(f,'bio',500)} where id=${u.id}`; redirect(`/u/${u.id}`);
}

const TH=['rouge','sobre','sombre'];
export async function setTheme(){
  const c=cookies(),cur=c.get('theme')?.value,i=TH.indexOf(cur);
  c.set('theme',TH[(i+1)%TH.length],{path:'/',maxAge:31536000,sameSite:'lax'});
  revalidatePath('/','layout');
}
export async function chooseTheme(f){
  const t=String(f.get('theme')||'');
  if(TH.includes(t)) cookies().set('theme',t,{path:'/',maxAge:31536000,sameSite:'lax'});
  revalidatePath('/','layout');
}
const se=(k,m)=>redirect(`/settings?${k}=${encodeURIComponent(m)}`);
export async function saveProfile(f){
  const u=await getUser(); if(!u) redirect('/login');
  const pseudo=s(f,'pseudo',20),bio=s(f,'bio',500);
  if(!/^[\wÀ-ÿ.-]{3,20}$/.test(pseudo)) se('e','Pseudo invalide (3 à 20 caractères : lettres, chiffres, . - _).');
  try{await sql`update users set pseudo=${pseudo},bio=${bio} where id=${u.id}`}catch{se('e','Ce pseudo est déjà utilisé.')}
  revalidatePath('/','layout'); se('ok','Profil enregistré.');
}
export async function changeEmail(f){
  const u=await getUser(); if(!u) redirect('/login');
  const email=s(f,'email',120).toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email)) se('e','Email invalide.');
  const [r]=await sql`select hash from users where id=${u.id}`;
  if(!(await bcrypt.compare(String(f.get('pw')||''),r.hash))) se('e','Mot de passe incorrect.');
  try{await sql`update users set email=${email} where id=${u.id}`}catch{se('e','Cette adresse est déjà utilisée.')}
  se('ok','Adresse email modifiée.');
}
export async function changePassword(f){
  const u=await getUser(); if(!u) redirect('/login');
  const p1=String(f.get('pw1')||''),p2=String(f.get('pw2')||'');
  const [r]=await sql`select hash from users where id=${u.id}`;
  if(!(await bcrypt.compare(String(f.get('pw')||''),r.hash))) se('e','Mot de passe actuel incorrect.');
  if(p1.length<8) se('e','Nouveau mot de passe : 8 caractères minimum.');
  if(p1!==p2) se('e','Les deux nouveaux mots de passe ne correspondent pas.');
  await sql`update users set hash=${await bcrypt.hash(p1,11)} where id=${u.id}`;
  se('ok','Mot de passe modifié.');
}
export async function removeAvatar(){
  const u=await getUser(); if(!u) redirect('/login');
  const [r]=await sql`select avatar from users where id=${u.id}`;
  const m=/^\/img\/(\d+)$/.exec(r?.avatar||'');
  if(m) await sql`delete from images where id=${Number(m[1])} and user_id=${u.id}`;
  await sql`update users set avatar='' where id=${u.id}`;
  revalidatePath('/','layout'); se('ok','Photo supprimée.');
}
const sb=(m)=>redirect(`/admin/structure?m=${encodeURIComponent(m)}`);
export async function createCategory(f){
  const u=await getUser(); if(lv(u)<LV['Modérateur']) redirect('/');
  const name=s(f,'name',60),staff=f.get('staff')==='on';
  if(name.length<2) sb('Nom de catégorie trop court.');
  let np;
  if(staff){const [m]=await sql`select coalesce(max(pos),0)+1 n from categories`;np=m.n}
  else{const [m]=await sql`select coalesce(max(pos),0)+1 n from categories where not staff`;np=m.n;
    await sql`update categories set pos=pos+1 where pos>=${np}`}
  await sql`insert into categories(name,pos,staff) values(${name},${np},${staff})`;
  revalidatePath('/'); sb(`Catégorie « ${name} » créée.`);
}
export async function createForum(f){
  const u=await getUser(); if(lv(u)<LV['Modérateur']) redirect('/');
  const cid=Number(f.get('cat')),name=s(f,'name',60),descr=s(f,'descr',200);
  if(name.length<2) sb('Nom du salon trop court.');
  const [c]=await sql`select id from categories where id=${cid}`; if(!c) sb('Catégorie introuvable.');
  const [m]=await sql`select coalesce(max(pos),0)+1 n from forums where cat_id=${cid}`;
  await sql`insert into forums(cat_id,name,pos,descr) values(${cid},${name},${m.n},${descr})`;
  revalidatePath('/'); sb(`Salon « ${name} » créé.`);
}
export async function deleteForum(f){
  const u=await getUser(); if(lv(u)<LV.Administrateur) redirect('/');
  const id=Number(f.get('id'));
  const [n]=await sql`select count(*) n from topics where forum_id=${id}`;
  if(Number(n.n)>0) sb('Ce salon contient des sujets : supprimez-les ou déplacez-les d’abord.');
  await sql`delete from forums where id=${id}`; revalidatePath('/'); sb('Salon supprimé.');
}
export async function deleteCategory(f){
  const u=await getUser(); if(lv(u)<LV.Administrateur) redirect('/');
  const id=Number(f.get('id'));
  const [n]=await sql`select count(*) n from forums where cat_id=${id}`;
  if(Number(n.n)>0) sb('Cette catégorie contient encore des salons.');
  await sql`delete from categories where id=${id}`; revalidatePath('/'); sb('Catégorie supprimée.');
}

export async function lockForum(f){
  const u=await getUser(); if(lv(u)<LV['Modérateur']) redirect('/');
  const id=Number(f.get('id'));
  await sql`update forums set locked=not locked where id=${id}`;
  revalidatePath('/'); revalidatePath(`/f/${id}`); revalidatePath('/admin/structure');
}
