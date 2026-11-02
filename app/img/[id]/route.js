import {sql} from '../../../lib/db';
export const dynamic='force-dynamic';
export async function GET(_,{params}){
  const [r]=await sql`select mime,data from images where id=${Number(params.id)||0}`;
  if(!r) return new Response('Introuvable',{status:404});
  return new Response(new Uint8Array(Buffer.from(r.data,'base64')),{headers:{
    'Content-Type':r.mime,'X-Content-Type-Options':'nosniff',
    'Content-Security-Policy':"default-src 'none'",
    'Cache-Control':'public, max-age=31536000, immutable'}});
}
