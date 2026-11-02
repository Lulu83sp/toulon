import {sql} from '../../lib/db';
import {getUser,lv,LV} from '../../lib/auth';
export const dynamic='force-dynamic';
export default async function S({searchParams}){
  const staff=lv(await getUser())>=LV['Modérateur'];
  const q=String(searchParams.q||'').trim().slice(0,60);
  const r=q?await sql`select t.id,t.title from topics t join forums f on f.id=t.forum_id join categories c on c.id=f.cat_id where t.title ilike ${'%'+q.replace(/[%_]/g,'')+'%'} and (not c.staff or ${staff}::boolean) order by t.last_post_at desc limit 30`:[];
  return(<div className="card"><h2>Résultats pour « {q} »</h2>{r.length===0&&<p className="mu">Aucun résultat.</p>}
    {r.map(t=><a className="row" key={t.id} href={`/t/${t.id}`}>{t.title}</a>)}</div>);
}
