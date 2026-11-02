import {sql} from '../lib/db';
export const dynamic='force-dynamic';
export default async function Home(){
  const [st]=await sql`select (select count(*) from users) m,(select count(*) from topics) t,(select count(*) from posts) p,(select count(*) from users where last_seen>now()-interval '5 minutes') o`;
  const online=await sql`select id,pseudo from users where last_seen>now()-interval '5 minutes' order by pseudo`;
  const cats=await sql`select c.id cid,c.name cname,f.id,f.name,(select count(*) from topics t where t.forum_id=f.id) n from categories c join forums f on f.cat_id=c.id order by c.pos,f.pos`;
  const g={};cats.forEach(r=>(g[r.cname]??=[]).push(r));
  return(<>
    <section className="hero card"><h1>Simulation policière française</h1>
      <p className="mu">Le forum officiel du serveur FiveM LSPDFR Toulon Simulation.</p>
      <div className="stats"><div><b>{st.m}</b>Membres</div><div><b>{st.t}</b>Sujets</div><div><b>{st.p}</b>Messages</div><div><b>{st.o}</b>En ligne</div></div>
      {online.length>0&&<p className="mu">En ligne : {online.map((o,i)=><a key={o.id} href={`/u/${o.id}`}>{i?', ':''}{o.pseudo}</a>)}</p>}
    </section>
    <div className="grid">{Object.entries(g).map(([name,fs])=>(
      <section className="card h" key={name}><h3 style={{margin:'0 0 8px'}}>{name}</h3>
        {fs.map(f=><a className="row" key={f.id} href={`/f/${f.id}`}><span>{f.name}</span><span className="mu">{f.n} sujets</span></a>)}
      </section>))}</div>
  </>);
}
