import {sql} from '../../lib/db';
export const dynamic='force-dynamic';
export default async function S({searchParams}){
  const q=String(searchParams.q||'').trim().slice(0,60);
  const r=q?await sql`select id,title from topics where title ilike ${'%'+q.replace(/[%_]/g,'')+'%'} order by last_post_at desc limit 30`:[];
  return(<div className="card"><h2>Résultats pour « {q} »</h2>{r.length===0&&<p className="mu">Aucun résultat.</p>}
    {r.map(t=><a className="row" key={t.id} href={`/t/${t.id}`}>{t.title}</a>)}</div>);
}
