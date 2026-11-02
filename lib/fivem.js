import {createHash,timingSafeEqual} from 'node:crypto';
// Authentification du serveur FiveM : en-tête « Authorization: Bearer <FIVEM_API_KEY> » (variable d'environnement).
export function fivemAuth(req){
  const key=process.env.FIVEM_API_KEY||'';
  if(key.length<16) return false;   // clé absente ou trop courte : API désactivée
  const got=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
  const a=createHash('sha256').update(got).digest(),b=createHash('sha256').update(key).digest();
  return timingSafeEqual(a,b);
}
export const json=(o,status=200)=>Response.json(o,{status,headers:{'Cache-Control':'no-store'}});
