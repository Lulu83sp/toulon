import './globals.css';
import {getUser,lv,LV} from '../lib/auth';
import {logout,setTheme} from './actions';
import {cookies} from 'next/headers';
import {Av} from '../lib/ui';
export const metadata={title:'LSPDFR Toulon Simulation',description:'Forum communautaire du serveur FiveM LSPDFR Toulon Simulation'};
const TH=['rouge','sobre','sombre'],NEXT={rouge:'Sobre',sobre:'Sombre',sombre:'Rouge'};
export default async function L({children}){
  const u=await getUser(),c=cookies().get('theme')?.value,th=TH.includes(c)?c:'rouge';
  return(<html lang="fr" data-theme={th}><body><header><div className="w">
    <input type="checkbox" id="mt" className="mt" aria-hidden="true"/>
    <a href="/" className="logo"><img src="/logo" alt="" className="sitelogo"/><span>LSPDFR <b>Toulon</b> Simulation</span></a>
    <label htmlFor="mt" className="burger" aria-label="Menu" title="Menu"><i/><i/><i/></label>
    <div className="hnav"><form action="/search"><input name="q" placeholder="Rechercher…" style={{margin:0,width:180}}/></form>
    <form action={setTheme}><button className="btn g" title="Changer de thème">🎨 Thème {NEXT[th].toLowerCase()}</button></form>
    {u?<>{lv(u)>=LV['Modérateur']&&<a href="/admin" className="btn g">Staff</a>}
      <a href={`/u/${u.id}`} className="hu"><Av pseudo={u.pseudo} avatar={u.avatar} size={30}/>{u.pseudo}</a>
      <a href="/settings" className="btn g" title="Paramètres">⚙️ Paramètres</a>
      <form action={logout}><button className="btn g">Déconnexion</button></form></>
     :<><a href="/login" className="btn g">Connexion</a><a href="/register" className="btn">Inscription</a></>}
  </div></div></header><main className="w">{children}</main>
  <footer className="w mu" style={{padding:30}}>© LSPDFR Toulon Simulation</footer></body></html>);
}
