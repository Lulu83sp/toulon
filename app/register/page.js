import {register} from '../actions';
import PwInput from '../PwInput';
export default function P({searchParams}){
  return(<div className="auth"><div className="auth-h">Inscription</div>
    <form action={register} className="auth-b">{searchParams.e&&<p className="err authe">{searchParams.e}</p>}
      <label>Pseudonyme<input name="pseudo" placeholder="Votre pseudo" required minLength={3} maxLength={20} autoComplete="username"/></label>
      <label>Email<input name="email" type="email" placeholder="vous@exemple.fr" required autoComplete="email"/></label>
      <label>Mot de passe<PwInput name="pw" placeholder="8 caractères minimum" autoComplete="new-password"/></label>
      <label>Confirmer le mot de passe<PwInput name="pw2" placeholder="Retapez le mot de passe" autoComplete="new-password"/></label>
      <label className="chk"><input type="checkbox" name="rules" required/>J’ai lu et j’accepte le règlement du forum</label>
      <label className="chk"><input type="checkbox" name="remember" defaultChecked/>Rester connecté (30 jours)</label>
      <button className="btn" style={{width:'100%',padding:12}}>Créer mon compte</button>
      <p className="mu" style={{textAlign:'center',margin:'16px 0 0'}}>Déjà inscrit ? <a href="/login" style={{color:'var(--ac)',fontWeight:600}}>Connexion</a></p>
    </form></div>);
}
