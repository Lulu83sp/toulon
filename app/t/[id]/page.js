import {sql} from '../../../lib/db';
import {getUser,lv,LV} from '../../../lib/auth';
import {reply,deleteTopic,pinTopic} from '../../actions';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function T({params,searchParams}){
  const id=Number(params.id)||0,u=await getUser();
  const [t]=await sql`select t.*,f.name fname from topics t join forums f on f.id=t.forum_id where t.id=${id}`;
  if(!t) notFound();
  const ps=await sql`select p.id,p.body,p.created_at,u.id uid,u.pseudo,u.role,u.created_at joined,(select count(*) from posts x where x.user_id=u.id) n from posts p join users u on u.id=p.user_id where p.topic_id=${id} order by p.id`;
  const mod=u&&(u.id===t.user_id||lv(u)>=LV['Modérateur']);
  return(<>
    <p className="mu"><a href="/">Accueil</a> / <a href={`/f/${t.forum_id}`}>{t.fname}</a> / {t.title}</p>
    <h2>{t.pinned&&<span className="tag">Épinglé</span>} {t.title}</h2>
    {mod&&<div style={{display:'flex',gap:8}}>
      <form action={deleteTopic}><input type="hidden" name="id" value={id}/><button className="btn g">Supprimer</button></form>
      {lv(u)>=LV['Modérateur']&&<form action={pinTopic}><input type="hidden" name="id" value={id}/><button className="btn g">Épingler / désépingler</button></form>}</div>}
    {ps.map(p=><article className="card post" key={p.id}>
      <div><a href={`/u/${p.uid}`}><b>{p.pseudo}</b></a><br/><span className="tag">{p.role}</span><p className="mu">{p.n} messages<br/>Depuis {new Date(p.joined).toLocaleDateString('fr-FR')}</p></div>
      <div><div className="mu">{new Date(p.created_at).toLocaleString('fr-FR')}</div><div className="body">{p.body}</div></div></article>)}
    <div id="fin"/>
    {u?<form action={reply} className="card">{searchParams.e&&<p className="err">{searchParams.e}</p>}
      <input type="hidden" name="topic" value={id}/><textarea name="body" rows="5" placeholder="Votre réponse…" required maxLength={10000}/><button className="btn">Répondre</button></form>
     :<p className="card"><a href="/login">Connectez-vous</a> pour répondre.</p>}
  </>);
}
