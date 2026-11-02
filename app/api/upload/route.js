import {getUser} from '../../../lib/auth';
import {sql} from '../../../lib/db';
export const dynamic='force-dynamic';
const MAX=3*1024*1024;
function kind(b){
  if(b.length>12&&b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47) return 'image/png';
  if(b.length>3&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff) return 'image/jpeg';
  if(b.length>6&&b.slice(0,4).toString()==='GIF8') return 'image/gif';
  if(b.length>12&&b.slice(0,4).toString()==='RIFF'&&b.slice(8,12).toString()==='WEBP') return 'image/webp';
  return null;
}
export async function POST(req){
  const u=await getUser(); if(!u) return Response.json({error:'Connexion requise.'},{status:401});
  let f;try{f=(await req.formData()).get('file')}catch{return Response.json({error:'Requête invalide.'},{status:400})}
  if(!f||typeof f==='string') return Response.json({error:'Aucun fichier.'},{status:400});
  if(f.size>MAX) return Response.json({error:'Image trop lourde (3 Mo maximum).'},{status:413});
  const buf=Buffer.from(await f.arrayBuffer()),mime=kind(buf);
  if(!mime) return Response.json({error:'Format non pris en charge (PNG, JPG, GIF, WebP).'},{status:415});
  const [r]=await sql`select count(*) n from images where user_id=${u.id} and created_at>now()-interval '1 minute'`;
  if(Number(r.n)>=6) return Response.json({error:'Trop d’envois, patientez une minute.'},{status:429});
  const [img]=await sql`insert into images(user_id,mime,data) values(${u.id},${mime},${buf.toString('base64')}) returning id`;
  return Response.json({url:`/img/${img.id}`});
}
