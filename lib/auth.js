import {cookies} from 'next/headers';
import {SignJWT,jwtVerify} from 'jose';
import {sql} from './db';
const key=()=>new TextEncoder().encode(process.env.AUTH_SECRET);
export const LV={Visiteur:0,Membre:1,VIP:2,'Modérateur':3,Administrateur:4,Fondateur:5};
export async function setSession(id,remember=true){
  const t=await new SignJWT({id}).setProtectedHeader({alg:'HS256'}).setExpirationTime(remember?'30d':'1d').sign(key());
  // Rester connecté : cookie persistant 30 jours. Sinon : cookie de session (disparaît à la fermeture du navigateur).
  cookies().set('s',t,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',...(remember?{maxAge:2592000}:{})});
}
export async function getUser(){
  const c=cookies().get('s'); if(!c) return null;
  try{
    const {payload}=await jwtVerify(c.value,key());
    const [u]=await sql`select id,pseudo,role,banned,bio,avatar from users where id=${payload.id}`;
    if(!u||u.banned) return null;
    await sql`update users set last_seen=now() where id=${u.id}`;
    return u;
  }catch{return null}
}
export const lv=u=>u?LV[u.role]??0:0;
