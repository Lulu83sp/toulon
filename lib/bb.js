const TAGS='b|i|u|s|quote|code|center|url|img';
export function parse(src){
  const re=new RegExp(`\\[(\\/?)(${TAGS})(?:=([^\\]\\n]{0,300}))?\\]`,'gi');
  const low=src.toLowerCase(),root={t:'root',c:[]},st=[root];let last=0,m;
  const txt=s=>{if(s)st[st.length-1].c.push(s)};
  while((m=re.exec(src))){
    txt(src.slice(last,m.index));last=re.lastIndex;
    const close=m[1]==='/',tag=m[2].toLowerCase();
    if(!close){
      if(tag==='code'||tag==='img'){
        const end=low.indexOf(`[/${tag}]`,last);
        if(end<0){txt(m[0]);continue}
        st[st.length-1].c.push({t:tag,arg:m[3],c:[src.slice(last,end)]});
        last=re.lastIndex=end+tag.length+3;continue;
      }
      if(st.length>12){txt(m[0]);continue}
      const n={t:tag,arg:m[3],c:[]};st[st.length-1].c.push(n);st.push(n);
    }else{
      let i=st.length-1;while(i>0&&st[i].t!==tag)i--;
      if(i>0) st.length=i;else txt(m[0]);
    }
  }
  txt(src.slice(last));return root.c;
}
const SC={':)':'🙂',':(':'🙁',';)':'😉',':p':'😛',':P':'😛',':o':'😮',':O':'😮',':D':'😀','<3':'❤️',":'(":'😢',':/':'😕',xD:'😆',XD:'😆'};
const NAMED={police:'🚓',policier:'👮',pompier:'🚒',samu:'🚑',ambulance:'🚑',sirene:'🚨',gyro:'🚨',feu:'🔥',fire:'🔥',coeur:'❤️',heart:'❤️',ok:'👍',non:'👎',rire:'😂',lol:'😂',bravo:'👏',merci:'🙏',attention:'⚠️',check:'✅',croix:'❌',justice:'⚖️',cool:'😎',pense:'🤔',triste:'😢',colere:'😡',star:'⭐',gg:'🏆',salut:'👋'};
const emo=t=>t.replace(/:([a-z]{2,12}):/g,(m,k)=>NAMED[k]||m).replace(/(?<=^|[\s(])(:-?\)|;-?\)|:-?\(|:-?[pP]|:-?[oOD]|<3|:'\(|:\/|[xX]D)(?=$|[\s.,!?)])/g,m=>SC[m]||SC[m.replace('-','')]||m);
const plain=n=>n.c.map(x=>typeof x==='string'?x:plain(x)).join('');
const okUrl=u=>/^https?:\/\/[^\s"'<>]+$/i.test(u);
function r(nodes){
  return nodes.map((n,k)=>{
    if(typeof n==='string') return emo(n);
    switch(n.t){
      case 'b':return <b key={k}>{r(n.c)}</b>;
      case 'i':return <i key={k}>{r(n.c)}</i>;
      case 'u':return <u key={k}>{r(n.c)}</u>;
      case 's':return <s key={k}>{r(n.c)}</s>;
      case 'center':return <div key={k} style={{textAlign:'center'}}>{r(n.c)}</div>;
      case 'quote':return <blockquote key={k} className="quote">{n.arg&&<cite>{n.arg} a écrit :</cite>}{r(n.c)}</blockquote>;
      case 'code':return <pre key={k} className="code">{n.c[0]}</pre>;
      case 'url':{const h=(n.arg||plain(n)).trim();
        return okUrl(h)?<a key={k} href={h} target="_blank" rel="nofollow noopener noreferrer ugc">{r(n.c)}</a>:<span key={k}>{r(n.c)}</span>}
      case 'img':{const s=(n.c[0]||'').trim();
        return /^\/img\/\d+$/.test(s)||/^https:\/\/[^\s"'<>]+$/i.test(s)
          ?<a key={k} href={s} target="_blank" rel="noopener noreferrer"><img className="pimg" src={s} loading="lazy" alt=""/></a>:s}
      default:return null;
    }
  });
}
export const Bb=({text})=><div className="body">{r(parse(String(text||'')))}</div>;
