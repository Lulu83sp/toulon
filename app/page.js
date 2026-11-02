import {sql} from '../lib/db';
import {DESC,ago,Av,Ico} from '../lib/ui';
import {getUser,lv,LV} from '../lib/auth';
export const dynamic='force-dynamic';
export default async function Home(){
  const staff=lv(await getUser())>=LV['Modérateur'];
  const [st]=await sql`select (select count(*) from users) m,
    (select count(*) from topics t join forums f on f.id=t.forum_id join categories c on c.id=f.cat_id where (not c.staff or ${staff}::boolean)) t,
    (select count(*) from posts p join topics t on t.id=p.topic_id join forums f on f.id=t.forum_id join categories c on c.id=f.cat_id where (not c.staff or ${staff}::boolean)) p,(select count(*) from users where last_seen>now()-interval '5 minutes') o`;
  const online=await sql`select id,pseudo from users where last_seen>now()-interval '5 minutes' order by pseudo`;
  const rows=await sql`select c.name cname,c.staff,f.id,f.name,
    (select count(*) from topics t where t.forum_id=f.id) as n,
    (select count(*) from posts p join topics t on t.id=p.topic_id where t.forum_id=f.id) as m,
    lp.pseudo as lpseudo,lp.uid as luid,lp.avatar as lavatar,lp.at_ as lat,lp.tid as ltid,lp.title as ltitle
    from categories c join forums f on f.cat_id=c.id
    left join lateral (select u.pseudo,u.id uid,u.avatar,p.created_at at_,t.id tid,t.title from posts p join topics t on t.id=p.topic_id join users u on u.id=p.user_id where t.forum_id=f.id order by p.id desc limit 1) lp on true
    where (not c.staff or ${staff}::boolean)
    order by c.pos,f.pos`;
  const g={};rows.forEach(r=>(g[r.cname]??=[]).push(r));
  return(<>
    <section className="welcome"><h1>LSPDFR Toulon Simulation</h1><p>Le forum officiel du serveur FiveM de simulation policière française.</p></section>
    {Object.entries(g).map(([name,fs])=>(
      <section className="cat" key={name}>
        <div className={`cat-h${fs[0].staff?" staff":""}`}><span className="t">{fs[0].staff&&"🔒 "}{name}{fs[0].staff&&" · réservé à l’équipe"}</span><span className="c">Sujets</span><span className="c">Messages</span><span className="c l" style={{textAlign:'left',paddingLeft:12}}>Derniers messages</span></div>
        {fs[0].staff&&<a className="frow" href="/admin" style={{background:'#fff7f7'}}><div className="fi"><span className="fico" style={{background:'#e0151b'}}><Ico/></span><div><span className="ft">Panneau de gestion des membres</span><div className="fd">Rechercher, promouvoir, rétrograder ou bannir des membres.</div></div></div></a>}
        {fs.map(f=>(
          <div className="frow" key={f.id}>
            <div className="fi"><span className="fico"><Ico/></span>
              <div><a className="ft" href={`/f/${f.id}`}>{f.name}</a><div className="fd">{DESC[f.name]||''}</div></div></div>
            <div className="num"><b>{f.n}</b><span>Sujets</span></div>
            <div className="num"><b>{f.m}</b><span>Messages</span></div>
            <div className="last">{f.lpseudo?<>
              <Av pseudo={f.lpseudo} avatar={f.lavatar} size={42}/>
              <div><a className="tt" style={{display:'block'}} href={`/t/${f.ltid}#fin`}>{f.ltitle}</a>
                <a className="nm" href={`/u/${f.luid}`}>{f.lpseudo}</a><div className="mu">{ago(f.lat)}</div></div></>
              :<span className="mu">Aucun message</span>}</div>
          </div>))}
      </section>))}
    <section className="card"><b>Statistiques du forum</b>
      <div className="stats"><div><b>{st.m}</b>Membres</div><div><b>{st.t}</b>Sujets</div><div><b>{st.p}</b>Messages</div><div><b>{st.o}</b>En ligne</div></div>
      {online.length>0&&<p className="mu">En ligne : {online.map((o,i)=><a key={o.id} href={`/u/${o.id}`}>{i?', ':''}<b>{o.pseudo}</b></a>)}</p>}
    </section>
  </>);
}
