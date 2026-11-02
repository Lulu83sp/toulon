'use client';
import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Av} from '../lib/ui';
async function square(file){
  const img=await createImageBitmap(file),s=Math.min(img.width,img.height),c=document.createElement('canvas');
  c.width=c.height=256;
  c.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,256,256);
  return new Promise(r=>c.toBlob(r,'image/webp',.88));
}
export default function AvatarUploader({pseudo,avatar,removeAction}){
  const ref=useRef(null),router=useRouter();
  const [busy,setBusy]=useState(false),[msg,setMsg]=useState('');
  async function pick(e){
    const f=e.target.files[0];if(!f) return;setMsg('');setBusy(true);
    try{
      const blob=await square(f),fd=new FormData();fd.append('file',blob,'avatar.webp');
      const r=await fetch('/api/avatar',{method:'POST',body:fd}),j=await r.json();
      if(!r.ok) setMsg(j.error||'Échec de l’envoi.'); else router.refresh();
    }catch{setMsg('Image illisible.')}
    setBusy(false);ref.current.value='';
  }
  return(<div className="avbox">
    <Av pseudo={pseudo} avatar={avatar} size={96}/>
    <div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={pick}/>
      <button type="button" className="btn" disabled={busy} onClick={()=>ref.current.click()}>{busy?'Envoi…':'Changer la photo'}</button>{' '}
      {avatar&&<form action={removeAction} style={{display:'inline'}}><button className="btn g">Supprimer</button></form>}
      <p className="mu" style={{margin:'8px 0 0'}}>PNG, JPG, WebP ou GIF. L’image est recadrée en carré automatiquement.</p>
      {msg&&<p className="err" style={{margin:'6px 0 0'}}>{msg}</p>}
    </div></div>);
}
