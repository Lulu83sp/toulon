import {getUser} from '../../lib/auth';
import {createTopic} from '../actions';
import {redirect} from 'next/navigation';
export default async function N({searchParams}){
  if(!await getUser()) redirect('/login');
  return(<form action={createTopic} className="card"><h2>Nouveau sujet</h2>{searchParams.e&&<p className="err">{searchParams.e}</p>}
    <input type="hidden" name="forum" value={searchParams.f}/>
    <input name="title" placeholder="Titre" required maxLength={140}/><textarea name="body" rows="9" placeholder="Message" required maxLength={10000}/><button className="btn">Publier</button></form>);
}
