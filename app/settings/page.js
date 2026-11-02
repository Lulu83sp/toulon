import {sql} from '../../lib/db';
import {getUser,lv,LV} from '../../lib/auth';
import {saveProfile,changeEmail,changePassword,removeAvatar,chooseTheme,saveService} from '../actions';
import AvatarUploader from '../AvatarUploader';
import PwInput from '../PwInput';
import {cookies} from 'next/headers';
import {SERVICES} from '../../lib/services';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
const THEMES=[['rouge','Rouge','#e0151b','#ffffff'],['sobre','Sobre','#41607f','#f2f3f5'],['sombre','Sombre','#e5383b','#1c2128']];
export default async function S({searchParams}){
  const u=await getUser(); if(!u) redirect('/login?next=/settings');
  const [me]=await sql`select pseudo,email,bio,avatar,service from users where id=${u.id}`;
  const staff=lv(u)>=LV['Modérateur'],held=SERVICES[me.service],locked=held?.r&&!staff;
  const th=['rouge','sobre','sombre'].includes(cookies().get('theme')?.value)?cookies().get('theme').value:'rouge';
  return(<>
    <p className="crumb"><a href="/">Accueil</a> › Paramètres</p>
    <div className="pagehead"><h2>Paramètres</h2><a className="btn g" href={`/u/${u.id}`}>Voir mon profil</a></div>
    {searchParams.ok&&<p className="card okbar">✅ {searchParams.ok}</p>}
    {searchParams.e&&<p className="card lockbar err">{searchParams.e}</p>}

    <section className="card sf"><h3>Photo de profil</h3>
      <AvatarUploader pseudo={me.pseudo} avatar={me.avatar} removeAction={removeAvatar}/></section>

    <form action={saveProfile} className="card sf"><h3>Profil</h3>
      <label>Pseudonyme<input name="pseudo" defaultValue={me.pseudo} required minLength={3} maxLength={20}/></label>
      <label>Biographie<textarea name="bio" rows="4" maxLength={500} defaultValue={me.bio} placeholder="Présentez-vous en quelques mots…"/></label>
      <button className="btn">Enregistrer le profil</button></form>

    {locked?<section className="card sf"><h3>Mon service</h3>
      <p style={{margin:0}}>Votre badge : <span className="svc" style={{background:held.c}}>{held.i} {held.n}</span></p>
      <p className="mu" style={{margin:'8px 0 0'}}>Ce badge a été attribué par le staff. Contactez un membre du staff pour le modifier.</p></section>
    :<form action={saveService} className="card sf"><h3>Mon service</h3>
      <p className="mu" style={{margin:'-6px 0 12px'}}>Choisissez le service que vous incarnez : un badge s’affichera sur vos messages et votre profil.</p>
      <div className="svcs">
        <label className="opt"><input type="radio" name="service" value="" defaultChecked={!me.service}/><span>👤 Civil / aucun</span></label>
        {Object.entries(SERVICES).filter(([,s])=>!s.r||staff).map(([k,s])=><label className="opt" key={k}><input type="radio" name="service" value={k} defaultChecked={me.service===k}/><span style={{'--sc':s.c}}>{s.i} {s.n}{s.r&&' · staff'}</span></label>)}
      </div>
      <button className="btn" style={{marginTop:14}}>Enregistrer mon service</button></form>}

    <section className="card sf"><h3>Apparence</h3>
      <div className="themes">{THEMES.map(([k,n,a,b])=><form action={chooseTheme} key={k}><input type="hidden" name="theme" value={k}/>
        <button className={`thm${th===k?' on':''}`}><span className="sw" style={{background:b}}><i style={{background:a}}/></span><b>{n}</b>{th===k&&<span className="mu"> · actif</span>}</button></form>)}</div></section>

    <form action={changeEmail} className="card sf"><h3>Adresse email</h3>
      <label>Nouvelle adresse<input name="email" type="email" defaultValue={me.email} required/></label>
      <label>Mot de passe actuel<PwInput name="pw" placeholder="Pour confirmer le changement"/></label>
      <button className="btn">Changer l’email</button></form>

    <form action={changePassword} className="card sf"><h3>Mot de passe</h3>
      <label>Mot de passe actuel<PwInput name="pw" placeholder="Mot de passe actuel"/></label>
      <label>Nouveau mot de passe<PwInput name="pw1" placeholder="8 caractères minimum" autoComplete="new-password"/></label>
      <label>Confirmer le nouveau mot de passe<PwInput name="pw2" placeholder="Retapez le nouveau mot de passe" autoComplete="new-password"/></label>
      <button className="btn">Changer le mot de passe</button></form>
  </>);
}
