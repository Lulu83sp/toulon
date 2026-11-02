// r:true = badge réservé : seul le staff (Modérateur et au-dessus) peut l'attribuer
export const SERVICES={
  pn:{n:'Police Nationale',c:'#1d4ea1',i:'🚓',l:'/logos/pn.png'},
  pm:{n:'Police Municipale',c:'#3a6aa5',i:'👮'},
  pomp:{n:'Sapeurs-Pompiers',c:'#c8431a',i:'🚒',l:'/logos/pomp.png'},
  samu:{n:'SAMU',c:'#0e8a6d',i:'🚑'},
  gn:{n:'Gendarmerie',c:'#1b2a5c',i:'🛡️',r:true,l:'/logos/gn.png'},
  staff:{n:'Staff',c:'#7a1fa2',i:'⭐',r:true,l:'/logos/staff.png'}
};

// Un membre peut cumuler plusieurs services : la colonne users.service stocke les clés séparées par des virgules (ex: 'pn,samu').
export const svcList=v=>[...new Set(String(v||'').split(',').map(x=>x.trim()).filter(k=>Object.prototype.hasOwnProperty.call(SERVICES,k)))];
export const svcJoin=a=>svcList(Array.isArray(a)?a.join(','):a).join(',');
