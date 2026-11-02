import {login} from '../actions';
import PwInput from '../PwInput';
export default function P({searchParams}){
  return(<div className="auth"><div className="auth-h">Connexion</div>
    <form action={login} className="auth-b">{searchParams.e&&<p className="err authe">{searchParams.e}</p>}
      <input type="hidden" name="next" value={searchParams.next||'/'}/>
      <label>Email ou pseudo<input name="email" placeholder="vous@exemple.fr" required autoComplete="username" autoFocus/></label>
      <label>Mot de passe<PwInput/></label>
      <label className="chk"><input type="checkbox" name="remember" defaultChecked/>Rester connecté (30 jours)</label>
      <button className="btn" style={{width:'100%',padding:12}}>Se connecter</button>
      <p className="mu" style={{textAlign:'center',margin:'16px 0 0'}}>Pas encore de compte ? <a href="/register" style={{color:'var(--ac)',fontWeight:600}}>Inscrivez-vous</a></p>
    </form></div>);
}
