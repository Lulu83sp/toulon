import './globals.css';
import {getUser,lv,LV} from '../lib/auth';
import {logout} from './actions';
export const metadata={title:'LSPDFR Toulon Simulation',description:'Forum communautaire du serveur FiveM LSPDFR Toulon Simulation'};
export default async function L({children}){
  const u=await getUser();
  return(<html lang="fr"><body><header><div className="w">
    <a href="/" className="logo">LSPDFR <b>Toulon</b> Simulation</a>
    <form action="/search"><input name="q" placeholder="Rechercher…" style={{margin:0,width:180}}/></form>
    {u?<>{lv(u)>=LV['Modérateur']&&<a href="/admin" className="btn g">Admin</a>}
      <a href={`/u/${u.id}`}>{u.pseudo}</a><form action={logout}><button className="btn g">Déconnexion</button></form></>
     :<><a href="/login" className="btn g">Connexion</a><a href="/register" className="btn">Inscription</a></>}
  </div></header><main className="w">{children}</main>
  <footer className="w mu" style={{padding:30}}>© LSPDFR Toulon Simulation</footer></body></html>);
}
