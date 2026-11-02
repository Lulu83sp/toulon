import {sql} from '../../lib/db';
import {getUser,lv,LV} from '../../lib/auth';
import {saveProfile,changeEmail,changePassword,removeAvatar,chooseTheme,saveService} from '../actions';
import AvatarUploader from '../AvatarUploader';
import PwInput from '../PwInput';
import {cookies} from 'next/headers';
import {SERVICES,svcList} from '../../lib/services';
import {redirect} from 'next/navigation';
import {SvcIco} from '../../lib/ui';
export const dynamic='force-dynamic';
const THEMES=[['rouge','Rouge','#e0151b','#ffffff'],['sobre','Sobre','#41607f','#f2f3f5'],['sombre','Sombre','#e5383b','#1c2128']];
export default async function S({searchParams}){
  const u=await getUser(); if(!u) redirect('/login?next=/settings');
  const [me]=await sql`select pseudo,email,bio,avatar,service from users where id=${u.id}`;
  const staff=lv(u)>=LV['Modérateur'],mine=svcList(me.service),lockedKeys=staff?[]:mine.filter(k=>SERVICES[k].r);
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

    <form action={saveService} className="card sf"><h3>Mes services</h3>
      <p className="mu" style={{margin:'-6px 0 12px'}}>Cochez un ou plusieurs services que vous incarnez : les badges s’afficheront sur vos messages et votre profil.</p>
      <div className="svcs">
        {Object.entries(SERVICES).filter(([k,s])=>!s.r||staff||lockedKeys.includes(k)).map(([k,s])=>{const lk=lockedKeys.includes(k);return(<label className="opt" key={k}><input type="checkbox" name="service" value={k} defaultChecked={mine.includes(k)} disabled={lk}/>{lk&&<input type="hidden" name="service" value={k}/>}<span style={{'--sc':s.c}}><SvcIco k={k}/> {s.n}{s.r&&' · staff'}{lk&&' · attribué par le staff'}</span></label>)})}
      </div>
      <button className="btn" style={{marginTop:14}}>Enregistrer mes services</button></form>

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
