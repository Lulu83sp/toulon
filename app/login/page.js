import {login} from '../actions';
export default function P({searchParams}){
  return(<form action={login} className="card" style={{maxWidth:420,margin:'40px auto'}}><h2>Connexion</h2>{searchParams.e&&<p className="err">{searchParams.e}</p>}
    <input name="email" type="email" placeholder="Email" required/><input name="pw" type="password" placeholder="Mot de passe" required/><button className="btn">Connexion</button></form>);
}
