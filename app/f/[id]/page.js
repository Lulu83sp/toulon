import {sql} from '../../../lib/db';
import {notFound} from 'next/navigation';
import {ago,Av} from '../../../lib/ui';
export const dynamic='force-dynamic';
const PER=20;
export default async function F({params,searchParams}){
  const [f]=await sql`select f.id,f.name,c.name cat from forums f join categories c on c.id=f.cat_id where f.id=${Number(params.id)||0}`;
  if(!f) notFound();
  const pg=Math.max(1,Number(searchParams.p)||1);
  const ts=await sql`select t.id,t.title,t.pinned,t.created_at,u.pseudo,u.avatar,
    (select count(*)-1 from posts p where p.topic_id=t.id) as r,
    lp.pseudo as lpseudo,lp.uid as luid,lp.avatar as lavatar,lp.at_ as lat
    from topics t join users u on u.id=t.user_id
    left join lateral (select x.pseudo,x.id uid,x.avatar,p.created_at at_ from posts p join users x on x.id=p.user_id where p.topic_id=t.id order by p.id desc limit 1) lp on true
    where t.forum_id=${f.id} order by t.pinned desc,t.last_post_at desc limit ${PER+1} offset ${(pg-1)*PER}`;
  return(<>
    <p className="crumb"><a href="/">Accueil</a> › {f.cat} › {f.name}</p>
    <div className="pagehead"><h2>{f.name}</h2><a className="btn" href={`/new?f=${f.id}`}>Nouveau sujet</a></div>
    <section className="cat">
      <div className="cat-h t3"><span className="t">Sujets</span><span className="c">Réponses</span><span className="c l" style={{textAlign:'left',paddingLeft:12}}>Dernier message</span></div>
      {ts.length===0&&<p className="mu" style={{padding:'18px'}}>Aucun sujet pour le moment.</p>}
      {ts.slice(0,PER).map(t=>(
        <div className="trow" key={t.id}>
          <div className="tsub"><Av pseudo={t.pseudo} avatar={t.avatar} size={40}/>
            <div style={{minWidth:0}}><a className="ft" href={`/t/${t.id}`}>{t.pinned&&<span className="tag">Épinglé</span>} {t.title}</a>
              <div className="mu">par <b>{t.pseudo}</b>, {ago(t.created_at)}</div></div></div>
          <div className="num"><b>{t.r}</b><span>Réponses</span></div>
          <div className="last">{t.lpseudo&&<><Av pseudo={t.lpseudo} avatar={t.lavatar} size={36}/>
            <div><a className="nm" href={`/u/${t.luid}`}>{t.lpseudo}</a><div className="mu">{ago(t.lat)}</div></div></>}</div>
        </div>))}
    </section>
    <p>{pg>1&&<a className="btn g" href={`?p=${pg-1}`}>← Précédent</a>} {ts.length>PER&&<a className="btn g" href={`?p=${pg+1}`}>Suivant →</a>}</p>
  </>);
}
