'use client';
import {useState} from 'react';
export default function PwInput({name='pw',placeholder='Mot de passe',autoComplete='current-password'}){
  const [show,setShow]=useState(false);
  return(<div className="pwwrap"><input name={name} type={show?'text':'password'} placeholder={placeholder} autoComplete={autoComplete} required minLength={name==='pw'?undefined:8}/>
    <button type="button" className="eye" onClick={()=>setShow(!show)} aria-label="Afficher le mot de passe">{show?'🙈':'👁️'}</button></div>);
}
