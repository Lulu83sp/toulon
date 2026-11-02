import {sql} from '../../../lib/db';
import {getUser,lv,LV} from '../../../lib/auth';
import {createCategory,createForum,deleteForum,deleteCategory} from '../../actions';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function S({searchParams}){
  const u=await getUser(); if(lv(u)<LV['Modérateur']) redirect('/');
  const isAdmin=lv(u)>=LV.Administrateur;
  const rows=await sql`select c.id cid,c.name cname,c.staff,f.id fid,f.name fname,(select count(*) from topics t where t.forum_id=f.id) n from categories c left join forums f on f.cat_id=c.id order by c.pos,f.pos`;
  const g=new Map();rows.forEach(r=>{if(!g.has(r.cid))g.set(r.cid,{id:r.cid,name:r.cname,staff:r.staff,fs:[]});if(r.fid)g.get(r.cid).fs.push(r)});
  const cats=[...g.values()];
  return(<>
    <p className="crumb"><a href="/">Accueil</a> › <a href="/admin">Staff</a> › Catégories et salons</p>
    <div className="pagehead"><h2>Catégories et salons</h2></div>
    {searchParams.m&&<p className="card lockbar">{searchParams.m}</p>}
    <div className="two">
      <form action={createCategory} className="card"><b>Nouvelle catégorie</b>
        <input name="name" placeholder="Nom de la catégorie" required maxLength={60} style={{marginTop:10}}/>
        <label className="chk2"><input type="checkbox" name="staff"/>Réservée au staff (invisible pour les membres)</label>
        <button className="btn">Créer la catégorie</button></form>
      <form action={createForum} className="card"><b>Nouveau salon</b>
        <select name="cat" required style={{marginTop:10}}>{cats.map(c=><option key={c.id} value={c.id}>{c.name}{c.staff?' (staff)':''}</option>)}</select>
        <input name="name" placeholder="Nom du salon" required maxLength={60}/>
        <input name="descr" placeholder="Description (facultatif)" maxLength={200}/>
        <button className="btn">Créer le salon</button></form>
    </div>
    {cats.map(c=><section className="cat" key={c.id}>
      <div className={`cat-h${c.staff?' staff':''}`} style={{gridTemplateColumns:'1fr auto'}}><span className="t">{c.staff&&'🔒 '}{c.name}</span>
        {isAdmin&&c.fs.length===0&&<form action={deleteCategory} style={{margin:0}}><input type="hidden" name="id" value={c.id}/><button className="btn g" style={{padding:'4px 10px'}}>Supprimer</button></form>}</div>
      {c.fs.length===0&&<p className="mu" style={{padding:'12px 18px',margin:0}}>Aucun salon.</p>}
      {c.fs.map(f=><div className="mrow" key={f.fid}><span><a href={`/f/${f.fid}`}><b>{f.fname}</b></a> <span className="mu">· {f.n} sujets</span></span>
        {isAdmin&&Number(f.n)===0&&<form action={deleteForum} style={{margin:0}}><input type="hidden" name="id" value={f.fid}/><button className="btn g" style={{padding:'5px 12px'}}>Supprimer</button></form>}</div>)}
    </section>)}
    {!isAdmin&&<p className="mu">La suppression est réservée aux administrateurs.</p>}
  </>);
}
