import {sql} from '../../lib/db';
import {getUser,lv,LV} from '../../lib/auth';
import {setRole,toggleBan,setMemberService} from '../actions';
import {SERVICES,svcList} from '../../lib/services';
import {redirect} from 'next/navigation';
import {Av,Svc,ago} from '../../lib/ui';
export const dynamic='force-dynamic';
export default async function A({searchParams}){
  const u=await getUser(); if(lv(u)<LV['Modérateur']) redirect('/');
  const q=String(searchParams.q||'').trim().slice(0,40).replace(/[%_]/g,'');
  const isAdmin=lv(u)>=LV.Administrateur;
  const ms=await sql`select id,pseudo,email,role,banned,avatar,service,created_at,last_seen,(select count(*) from posts where user_id=users.id) n
    from users where ${q}='' or pseudo ilike ${'%'+q+'%'} order by id limit 100`;
  const [c]=await sql`select count(*) total,count(*) filter(where banned) bans,count(*) filter(where role in ('Modérateur','Administrateur','Fondateur')) staff from users`;
  const fs=await sql`select f.id,f.name from forums f join categories c on c.id=f.cat_id where c.staff order by f.pos`;
  return(<>
    <p className="crumb"><a href="/">Accueil</a> › Gestion des membres</p>
    <div className="pagehead"><h2>Gestion des membres</h2>
      <form style={{display:'flex',gap:6}}><input name="q" defaultValue={q} placeholder="Rechercher un pseudo…" style={{margin:0,width:220}}/><button className="btn">Rechercher</button></form></div>
    <div className="card"><div className="stats" style={{marginTop:0}}><div><b>{c.total}</b>Membres</div><div><b>{c.staff}</b>Staff</div><div><b>{c.bans}</b>Suspendus</div></div>
      <p style={{margin:'12px 0 0'}}><a className="btn" href="/admin/structure">🗂️ Gérer les catégories et salons</a></p>
      {fs.length>0&&<p className="mu" style={{margin:'12px 0 0'}}>Espace staff : {fs.map((f,i)=><a key={f.id} href={`/f/${f.id}`}>{i?' · ':''}<b>{f.name}</b></a>)}</p>}</div>
    <section className="cat memb">
      <div className="cat-h staff" style={{gridTemplateColumns:'1fr'}}><span className="t">Membres {q&&`· « ${q} »`}</span></div>
      {ms.length===0&&<p className="mu" style={{padding:16}}>Aucun membre trouvé.</p>}
      {ms.map(m=>{const can=m.id!==u.id&&(LV[m.role]<lv(u)||u.role==='Fondateur');const cs=can||m.id===u.id;return(
        <div className="mrow" key={m.id}>
          <div className="mid"><Av pseudo={m.pseudo} avatar={m.avatar} size={42}/>
            <div style={{minWidth:0}}><a href={`/u/${m.id}`}><b>{m.pseudo}</b></a> <span className="tag">{m.role}</span> <Svc k={m.service}/> {m.banned&&<span className="tag" style={{background:'#555'}}>Suspendu</span>}
              <div className="mu">{m.n} messages · inscrit {ago(m.created_at)} · actif {ago(m.last_seen)}{isAdmin&&<> · {m.email}</>}</div></div></div>
          <div className="mact">
            {cs&&<form action={setMemberService}><input type="hidden" name="id" value={m.id}/>
              <details className="svcpick"><summary className="btn g">Badges ({svcList(m.service).length})</summary><div className="svcpop">{Object.entries(SERVICES).map(([k,s])=><label key={k}><input type="checkbox" name="service" value={k} defaultChecked={svcList(m.service).includes(k)}/> {s.i} {s.n}</label>)}<button className="btn">Enregistrer</button></div></details></form>}
            {isAdmin&&can&&<form action={setRole}><input type="hidden" name="id" value={m.id}/>
              <select name="role" defaultValue={m.role}>{Object.keys(LV).map(r=><option key={r}>{r}</option>)}</select><button className="btn g">OK</button></form>}
            {can&&<form action={toggleBan}><input type="hidden" name="id" value={m.id}/><button className="btn g">{m.banned?'Réactiver':'Bannir'}</button></form>}
          </div></div>)})}
    </section></>);
}
