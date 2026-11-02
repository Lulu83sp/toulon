import {sql} from '../../../lib/db';
import {getUser,lv,LV} from '../../../lib/auth';
import {reply,deleteTopic,pinTopic,lockTopic,toggleReaction} from '../../actions';
import {REACTIONS} from '../../../lib/reactions';
import {notFound} from 'next/navigation';
import {Av,Svc} from '../../../lib/ui';
import {Bb} from '../../../lib/bb';
import Editor from '../../Editor';
export const dynamic='force-dynamic';
export default async function T({params,searchParams}){
  const id=Number(params.id)||0,u=await getUser();
  const [t]=await sql`select t.*,f.name fname,f.locked flocked,c.staff from topics t join forums f on f.id=t.forum_id join categories c on c.id=f.cat_id where t.id=${id}`;
  if(!t||(t.staff&&lv(u)<LV['Modérateur'])) notFound();
  const ps=await sql`select p.id,p.body,p.created_at,u.id uid,u.pseudo,u.role,u.created_at joined,u.avatar,u.service,(select count(*) from posts x where x.user_id=u.id) n from posts p join users u on u.id=p.user_id where p.topic_id=${id} order by p.id`;
  const rx=await sql`select r.post_id,r.emoji,count(*) n,bool_or(r.user_id=${u?u.id:0}) mine,string_agg(x.pseudo,', ' order by r.created_at) who from post_reactions r join users x on x.id=r.user_id where r.post_id in (select id from posts where topic_id=${id}) group by r.post_id,r.emoji order by min(r.created_at)`;
  const RX={};for(const r of rx)(RX[r.post_id]||=[]).push(r);
  const isMod=lv(u)>=LV['Modérateur'];
  const mod=u&&(u.id===t.user_id||isMod);
  const canReply=u&&((!t.locked&&!t.flocked)||isMod);
  return(<>
    <p className="crumb"><a href="/">Accueil</a> › <a href={`/f/${t.forum_id}`}>{t.fname}</a> › {t.title}</p>
    <h2 style={{margin:'6px 0 12px'}}>{t.pinned&&<span className="tag">Épinglé</span>} {t.locked&&<span className="tag lk">🔒 Verrouillé</span>} {t.title}</h2>
    {mod&&<div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
      <form action={deleteTopic}><input type="hidden" name="id" value={id}/><button className="btn g">Supprimer</button></form>
      {isMod&&<form action={pinTopic}><input type="hidden" name="id" value={id}/><button className="btn g">Épingler / désépingler</button></form>}
      {isMod&&<form action={lockTopic}><input type="hidden" name="id" value={id}/><button className="btn g">{t.locked?'🔓 Déverrouiller':'🔒 Verrouiller'}</button></form>}</div>}
    {ps.map(p=><article className="card post" key={p.id} id={`p${p.id}`}>
      <div><Av pseudo={p.pseudo} avatar={p.avatar} size={72}/><br/><a href={`/u/${p.uid}`}><b>{p.pseudo}</b></a><br/><span className="tag">{p.role}</span><br/><span style={{display:'inline-block',marginTop:4}}><Svc k={p.service}/></span><p className="mu">{p.n} messages<br/>Depuis {new Date(p.joined).toLocaleDateString('fr-FR')}</p></div>
      <div><div className="mu" style={{marginBottom:8}}>{new Date(p.created_at).toLocaleString('fr-FR')}</div><Bb text={p.body}/>
        <div className="rx">
          {(RX[p.id]||[]).map(r=>u?<form action={toggleReaction} key={r.emoji}><input type="hidden" name="post" value={p.id}/><input type="hidden" name="emoji" value={r.emoji}/><button className={`rxb${r.mine?' on':''}`} title={r.who}>{r.emoji} <b>{Number(r.n)}</b></button></form>
            :<span className="rxb" key={r.emoji} title={r.who}>{r.emoji} <b>{Number(r.n)}</b></span>)}
          {u&&<details className="rpick"><summary className="rxb" title="Réagir">☺ ＋</summary><div className="rpop">{REACTIONS.map(e=><form action={toggleReaction} key={e}><input type="hidden" name="post" value={p.id}/><input type="hidden" name="emoji" value={e}/><button className="rxe">{e}</button></form>)}</div></details>}
        </div></div></article>)}
    <div id="fin"/>
    {(t.locked||t.flocked)&&<p className="card lockbar">🔒 {t.flocked&&!t.locked?'Ce salon est verrouillé':'Ce sujet est verrouillé'}{isMod?' (vous pouvez néanmoins répondre en tant que modérateur).':' : vous ne pouvez plus y répondre.'}</p>}
    {canReply?<form action={reply} className="card">{searchParams.e&&<p className="err">{searchParams.e}</p>}
      <input type="hidden" name="topic" value={id}/><Editor rows={8} placeholder="Votre réponse…"/><p style={{margin:'14px 0 0'}}><button className="btn">Répondre</button></p></form>
     :!u&&<p className="card"><a href={`/login?next=${encodeURIComponent(`/t/${id}`)}`}><b>Connectez-vous</b></a> pour répondre.</p>}
  </>);
}
