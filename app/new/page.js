import {getUser,lv,LV} from '../../lib/auth';
import {sql} from '../../lib/db';
import {createTopic} from '../actions';
import Editor from '../Editor';
import {redirect,notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function N({searchParams}){
  const u=await getUser(); if(!u) redirect('/login');
  const [f]=await sql`select f.id,f.name,c.staff from forums f join categories c on c.id=f.cat_id where f.id=${Number(searchParams.f)||0}`;
  if(!f||(f.staff&&lv(u)<LV['Modérateur'])) notFound();
  const mod=lv(u)>=LV['Modérateur'];
  return(<>
    <p className="crumb"><a href="/">Accueil</a> › <a href={`/f/${f.id}`}>{f.name}</a> › Nouveau sujet</p>
    <h2 style={{margin:'6px 0 14px',fontWeight:400,fontSize:28}}>Poster un nouveau sujet</h2>
    <form action={createTopic} className="card">{searchParams.e&&<p className="err">{searchParams.e}</p>}
      <input type="hidden" name="forum" value={f.id}/>
      <input name="title" placeholder="Titre du sujet" required maxLength={140}/>
      <Editor/>
      {mod&&<p style={{display:'flex',gap:18,margin:'12px 0 0'}}>
        <label><input type="checkbox" name="pin" style={{width:'auto',margin:'0 6px 0 0'}}/>Épingler</label>
        <label><input type="checkbox" name="lock" style={{width:'auto',margin:'0 6px 0 0'}}/>Verrouiller</label></p>}
      <p style={{margin:'14px 0 0'}}><button className="btn">Publier le sujet</button></p>
    </form></>);
}
