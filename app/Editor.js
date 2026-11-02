'use client';
import {useRef,useState} from 'react';
import {Bb} from '../lib/bb';
const EMO=['😀','😂','😅','😍','😎','🤔','😢','😡','😱','👍','👎','👏','🙏','🔥','❤️','✅','❌','⚠️','🚓','🚔','🚑','🚒','👮','⚖️'];
const TB=[['B','b','Gras'],['I','i','Italique'],['U','u','Souligné'],['S','s','Barré'],['❝','quote','Citation'],['</>','code','Code'],['⇔','center','Centrer']];
export default function Editor({name='body',rows=12,placeholder='Votre message…'}){
  const ref=useRef(null),file=useRef(null);
  const [v,setV]=useState(''),[prev,setPrev]=useState(false),[emo,setEmo]=useState(false),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
  const ins=(a,b='',ph='')=>{
    const el=ref.current,s=el.selectionStart,e=el.selectionEnd,sel=v.slice(s,e)||ph;
    const nv=v.slice(0,s)+a+sel+b+v.slice(e);
    if(nv.length>10000) return; setV(nv);
    requestAnimationFrame(()=>{el.focus();el.setSelectionRange(s+a.length,s+a.length+sel.length)});
  };
  const link=()=>{const u=prompt('Adresse du lien (https://…)');if(u) ins(`[url=${u}]`,'[/url]','texte du lien')};
  const imgUrl=()=>{const u=prompt('Adresse de l’image (https://…)');if(u) ins('[img]'+u+'[/img]')};
  async function up(f){
    if(!f) return; setMsg('');setBusy(true);
    try{
      const fd=new FormData();fd.append('file',f);
      const r=await fetch('/api/upload',{method:'POST',body:fd}),j=await r.json();
      if(!r.ok) setMsg(j.error||'Échec de l’envoi.'); else ins(`[img]${j.url}[/img]`);
    }catch{setMsg('Échec de l’envoi.')}
    setBusy(false);if(file.current) file.current.value='';
  }
  return(<div className="editor">
    <div className="tb">
      {TB.map(([l,t,h])=><button type="button" key={t} title={h} onClick={()=>ins(`[${t}]`,`[/${t}]`,t==='code'?'code':'texte')}><b>{l}</b></button>)}
      <span className="sep"/>
      <button type="button" title="Lien" onClick={link}>🔗</button>
      <button type="button" title="Image depuis une adresse" onClick={imgUrl}>🌐</button>
      <button type="button" title="Envoyer une image" onClick={()=>file.current.click()} disabled={busy}>{busy?'⏳':'🖼️ Image'}</button>
      <button type="button" title="Smileys" onClick={()=>setEmo(!emo)}>😀</button>
      <span className="sep"/>
      <button type="button" onClick={()=>setPrev(!prev)}>{prev?'Modifier':'Aperçu'}</button>
      <input ref={file} type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange={e=>up(e.target.files[0])}/>
    </div>
    {emo&&<div className="emo">{EMO.map(x=><button type="button" key={x} onClick={()=>ins(x)}>{x}</button>)}</div>}
    {msg&&<p className="err" style={{margin:'6px 0'}}>{msg}</p>}
    <textarea ref={ref} name={name} rows={rows} value={v} required maxLength={10000} placeholder={placeholder} style={{display:prev?'none':'block'}}
      onChange={e=>setV(e.target.value)}
      onPaste={e=>{const f=[...e.clipboardData.files].find(x=>x.type.startsWith('image/'));if(f){e.preventDefault();up(f)}}}/>
    {prev&&<div className="preview">{v.trim()?<Bb text={v}/>:<span className="mu">Rien à prévisualiser.</span>}</div>}
    <p className="mu" style={{margin:'4px 0 0'}}>BBCode activé · images : PNG, JPG, GIF, WebP (3 Mo max) · vous pouvez aussi coller une image (Ctrl+V).</p>
  </div>);
}
