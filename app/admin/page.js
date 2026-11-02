import {sql} from '../../lib/db';
import {getUser,lv,LV} from '../../lib/auth';
import {setRole,toggleBan} from '../actions';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function A(){
  const u=await getUser(); if(lv(u)<LV['Modérateur']) redirect('/');
  const us=await sql`select id,pseudo,role,banned from users order by id`;
  return(<div className="card"><h2>Administration · membres</h2>{us.map(m=><div className="row" key={m.id}>
    <span>{m.pseudo} <span className="tag">{m.role}</span> {m.banned&&<span className="err">suspendu</span>}</span>
    <span style={{display:'flex',gap:6}}>
      {lv(u)>=LV.Administrateur&&<form action={setRole} style={{display:'flex',gap:4}}><input type="hidden" name="id" value={m.id}/>
        <select name="role" defaultValue={m.role} style={{margin:0}}>{Object.keys(LV).map(r=><option key={r}>{r}</option>)}</select><button className="btn g">OK</button></form>}
      <form action={toggleBan}><input type="hidden" name="id" value={m.id}/><button className="btn g">{m.banned?'Réactiver':'Bannir'}</button></form></span></div>)}</div>);
}
