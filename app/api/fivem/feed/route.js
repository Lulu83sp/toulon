import {sql} from '../../../../lib/db';
import {fivemAuth,json} from '../../../../lib/fivem';
export const dynamic='force-dynamic';
// Texte brut d'un message BBCode : sans balises, sans images, sans smileys :code:, tronqué.
const plain=(b,n=260)=>{
  let t=String(b||'').replace(/\[img[^\]]*\][\s\S]*?\[\/img\]/gi,' ').replace(/\[[^\]]*\]/g,'').replace(/:[a-z0-9_+-]{2,20}:/gi,'').replace(/\s+/g,' ').trim();
  return t.length>n?t.slice(0,n-1).trimEnd()+'…':t;
};
// GET /api/fivem/feed?announce=Annonces%20officielles : annonces + derniers sujets (salons non réservés au staff) pour l'appli « Forum » du téléphone.
export async function GET(req){
  if(!fivemAuth(req)) return json({ok:false,error:'unauthorized'},401);
  const name=(new URL(req.url).searchParams.get('announce')||'Annonces officielles').slice(0,80);
  const an=await sql`select t.id,t.title,t.pinned,u.pseudo,extract(epoch from (now()-t.created_at))::int ago,
    (select body from posts p where p.topic_id=t.id order by p.id limit 1) body
    from topics t join forums f on f.id=t.forum_id join categories c on c.id=f.cat_id join users u on u.id=t.user_id
    where f.name=${name} and not c.staff order by t.pinned desc,t.created_at desc limit 8`;
  const tp=await sql`select t.id,t.title,f.name forum,u.pseudo,extract(epoch from (now()-t.last_post_at))::int ago,
    (select count(*)-1 from posts p where p.topic_id=t.id)::int r
    from topics t join forums f on f.id=t.forum_id join categories c on c.id=f.cat_id join users u on u.id=t.user_id
    where not c.staff and f.name<>${name} order by t.last_post_at desc limit 15`;
  return json({ok:true,
    announces:an.map(r=>({id:r.id,title:r.title,pinned:r.pinned,author:r.pseudo,ago:r.ago,excerpt:plain(r.body)})),
    topics:tp.map(r=>({id:r.id,title:r.title,forum:r.forum,author:r.pseudo,ago:r.ago,replies:Math.max(0,r.r)}))});
}
