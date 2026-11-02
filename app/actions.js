'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {cookies} from 'next/headers';
import bcrypt from 'bcryptjs';
import {sql} from '../lib/db';
import {getUser,setSession,lv,LV} from '../lib/auth';
const s=(f,k,max)=>String(f.get(k)||'').trim().slice(0,max);
const back=(p,e)=>redirect(`${p}?e=${encodeURIComponent(e)}`);

export async function register(f){
  const pseudo=s(f,'pseudo',20),email=s(f,'email',120).toLowerCase(),pw=String(f.get('pw')||'');
  if(!/^[\wÀ-ÿ.-]{3,20}$/.test(pseudo)) back('/register','Pseudo invalide (3-20 caractères).');
  if(!/^\S+@\S+\.\S+$/.test(email)) back('/register','Email invalide.');
  if(pw.length<8) back('/register','Mot de passe : 8 caractères minimum.');
  const hash=await bcrypt.hash(pw,11);
  let u;
  try{
    [u]=await sql`insert into users(pseudo,email,hash,role) values(${pseudo},${email},${hash},
      case when (select count(*) from users)=0 then 'Fondateur' else 'Membre' end) returning id`;
  }catch{back('/register','Pseudo ou email déjà utilisé.')}
  await setSession(u.id); redirect('/');
}
export async function login(f){
  const email=s(f,'email',120).toLowerCase();
  const [u]=await sql`select id,hash,banned from users where email=${email}`;
  if(!u||!(await bcrypt.compare(String(f.get('pw')||''),u.hash))) back('/login','Identifiants incorrects.');
  if(u.banned) back('/login','Compte suspendu.');
  await setSession(u.id); redirect('/');
}
export async function logout(){cookies().delete('s');redirect('/')}

export async function createTopic(f){
  const u=await getUser(); if(!u) redirect('/login');
  const fid=Number(f.get('forum')),title=s(f,'title',140),body=s(f,'body',10000);
  if(!title||!body) back(`/new?f=${fid}`,'Titre et message requis.');
  const [fo]=await sql`select f.id,c.pos from forums f join categories c on c.id=f.cat_id where f.id=${fid}`;
  if(!fo) redirect('/');
  if(fo.pos===1&&lv(u)<LV['Modérateur']) back(`/new?f=${fid}`,'Réservé à l’équipe.');
  const [r]=await sql`select count(*) n from posts where user_id=${u.id} and created_at>now()-interval '30 seconds'`;
  if(Number(r.n)>=3) back(`/new?f=${fid}`,'Trop rapide, patientez.');
  const [t]=await sql`insert into topics(forum_id,user_id,title) values(${fid},${u.id},${title}) returning id`;
  await sql`insert into posts(topic_id,user_id,body) values(${t.id},${u.id},${body})`;
  redirect(`/t/${t.id}`);
}
export async function reply(f){
  const u=await getUser(); if(!u) redirect('/login');
  const tid=Number(f.get('topic')),body=s(f,'body',10000);
  if(!body) redirect(`/t/${tid}`);
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
