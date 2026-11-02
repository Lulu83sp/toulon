import {sql} from '../../../lib/db';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
const PER=20;
export default async function F({params,searchParams}){
  const [f]=await sql`select f.id,f.name,c.name cat from forums f join categories c on c.id=f.cat_id where f.id=${Number(params.id)||0}`;
  if(!f) notFound();
  const pg=Math.max(1,Number(searchParams.p)||1);
  const ts=await sql`select t.id,t.title,t.pinned,t.last_post_at,u.pseudo,(select count(*)-1 from posts p where p.topic_id=t.id) r
    from topics t join users u on u.id=t.user_id where t.forum_id=${f.id} order by t.pinned desc,t.last_post_at desc limit ${PER+1} offset ${(pg-1)*PER}`;
  return(<>
    <p className="mu"><a href="/">Accueil</a> / {f.cat} / {f.name}</p>
    <div className="row" style={{border:0}}><h2 style={{margin:0}}>{f.name}</h2><a className="btn" href={`/new?f=${f.id}`}>Nouveau sujet</a></div>
    <div className="card">{ts.length===0&&<p className="mu">Aucun sujet pour le moment.</p>}
      {ts.slice(0,PER).map(t=><a className="row" key={t.id} href={`/t/${t.id}`}>
        <span>{t.pinned&&<span className="tag">Épinglé</span>} {t.title}<br/><span className="mu">par {t.pseudo}</span></span>
        <span className="mu">{t.r} rép. · {new Date(t.last_post_at).toLocaleString('fr-FR')}</span></a>)}</div>
    <p>{pg>1&&<a className="btn g" href={`?p=${pg-1}`}>← Précédent</a>} {ts.length>PER&&<a className="btn g" href={`?p=${pg+1}`}>Suivant →</a>}</p>
  </>);
}
