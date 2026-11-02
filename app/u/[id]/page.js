import {sql} from '../../../lib/db';
import {getUser} from '../../../lib/auth';
import {saveBio} from '../../actions';
import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function U({params}){
  const me=await getUser();
  const [u]=await sql`select id,pseudo,role,bio,created_at,last_seen,(select count(*) from posts where user_id=users.id) n,(select count(*) from topics where user_id=users.id) t from users where id=${Number(params.id)||0}`;
  if(!u) notFound();
  const rec=await sql`select distinct on (t.id) t.id,t.title from posts p join topics t on t.id=p.topic_id where p.user_id=${u.id} order by t.id desc limit 5`;
  const on=Date.now()-new Date(u.last_seen)<3e5;
  return(<div className="card"><h2>{u.pseudo} <span className="tag">{u.role}</span></h2>
    <p className="mu">{on?'En ligne':'Dernière activité : '+new Date(u.last_seen).toLocaleString('fr-FR')} · Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')} · {u.n} messages · {u.t} sujets</p>
    {me?.id===u.id?<form action={saveBio}><textarea name="bio" rows="4" maxLength={500} defaultValue={u.bio} placeholder="Biographie"/><button className="btn">Enregistrer</button></form>:<p>{u.bio}</p>}
    <h3>Publications récentes</h3>{rec.map(t=><a className="row" key={t.id} href={`/t/${t.id}`}>{t.title}</a>)}</div>);
}
