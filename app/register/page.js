import {register} from '../actions';
export default function P({searchParams}){
  return(<form action={register} className="card" style={{maxWidth:420,margin:'40px auto'}}><h2>Inscription</h2>{searchParams.e&&<p className="err">{searchParams.e}</p>}
    <input name="pseudo" placeholder="Pseudonyme" required/><input name="email" type="email" placeholder="Email" required/><input name="pw" type="password" placeholder="Mot de passe (8+ caractères)" required/><button className="btn">Inscription</button></form>);
}
