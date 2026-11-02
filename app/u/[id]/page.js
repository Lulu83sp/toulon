import {sql} from '../../../lib/db';
import {getUser,lv,LV} from '../../../lib/auth';
import {saveBio} from '../../actions';
import {notFound} from 'next/navigation';
import {Av} from '../../../lib/ui';
export const dynamic='force-dynamic';
export default async function U({params}){
  const me=await getUser();
  const [u]=await sql`select id,pseudo,role,bio,avatar,created_at,last_seen,(select count(*) from posts where user_id=users.id) n,(select count(*) from topics where user_id=users.id) t from users where id=${Number(params.id)||0}`;
  if(!u) notFound();
  const staff=lv(me)>=LV['Modérateur'];
  const rec=await sql`select distinct on (t.id) t.id,t.title from posts p join topics t on t.id=p.topic_id join forums f on f.id=t.forum_id join categories c on c.id=f.cat_id where p.user_id=${u.id} and (not c.staff or ${staff}::boolean) order by t.id desc limit 5`;
  const on=Date.now()-new Date(u.last_seen)<3e5;
  return(<div className="card"><div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}><Av pseudo={u.pseudo} avatar={u.avatar} size={84}/><h2 style={{margin:0}}>{u.pseudo} <span className="tag">{u.role}</span></h2>{me?.id===u.id&&<a className="btn g" href="/settings" style={{marginLeft:'auto'}}>⚙️ Paramètres</a>}</div>
    <p className="mu">{on?'En ligne':'Dernière activité : '+new Date(u.last_seen).toLocaleString('fr-FR')} · Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')} · {u.n} messages · {u.t} sujets</p>
    {me?.id===u.id?<form action={saveBio}><textarea name="bio" rows="4" maxLength={500} defaultValue={u.bio} placeholder="Biographie"/><button className="btn">Enregistrer</button></form>:<p>{u.bio}</p>}
    <h3>Publications récentes</h3>{rec.map(t=><a className="row" key={t.id} href={`/t/${t.id}`}>{t.title}</a>)}</div>);
}
