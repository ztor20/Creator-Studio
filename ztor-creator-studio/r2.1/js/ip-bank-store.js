/* Prototype-only shared source for Admin IP Bank and Reporting. localStorage is
   intentionally presentation state, not a settlement or payout source of truth. */
(function () {
  'use strict';
  var KEY = 'ztor.adminIpBank.v1';
  var seed = [
    { id:'ip-1', film:'海上霸王 - 鄭一嫂', title:'Zheng Yi Sao (lead character)', type:'Character / Likeness', owner:'Denise Wong', status:'linked', share:20, withdrawn:2200 },
    { id:'ip-2', film:'海上霸王 - 鄭一嫂', title:'Original score', type:'Music & Score', owner:'Wong Siu-pong', status:'linked', share:35, withdrawn:0 },
    { id:'ip-3', film:'海上霸王 - 鄭一嫂', title:'Original screenplay', type:'Original Story / Screenplay', owner:'Huei-ling C.', status:'pending', inviteContact:'huei-ling@example.com', share:15, withdrawn:0 },
    { id:'ip-4', film:'Fist Of Fury', title:'Bruce Lee likeness', type:'Character / Likeness', owner:'Lee Estate (B. Lee)', status:'linked', share:50, withdrawn:0 }
  ];
  /* Prototype directory used by the Add IP entry owner search. In production
     this is supplied by the user directory, not by the IP Bank entries. */
  var ownerDirectory = [
    'Denise Wong', 'Wong Siu-pong', 'Lee Estate (B. Lee)', 'Mei Lin', 'David Chen'
  ];
  var revenues = { '海上霸王 - 鄭一嫂':79300, 'Fist Of Fury':48000 };
  function read(){ try { var v=JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v)?v:seed.slice(); } catch(e){ return seed.slice(); } }
  function write(rows){ try{localStorage.setItem(KEY,JSON.stringify(rows));}catch(e){} return rows; }
  function list(){ return read(); }
  function films(){ var out=[]; list().forEach(function(r){if(out.indexOf(r.film)<0)out.push(r.film);}); return out; }
  function allocated(film, excludeId){ return list().filter(function(r){return r.film===film && r.id!==excludeId;}).reduce(function(s,r){return s+Number(r.share||0);},0); }
  function save(entry){ var rows=list(), i=rows.findIndex(function(r){return r.id===entry.id;}); if(i>=0)rows[i]=entry; else rows.push(entry); return write(rows); }
  function remove(id){ return write(list().filter(function(r){return r.id!==id;})); }
  function ownerExists(name){ var query=String(name||'').trim().toLowerCase(); return !!query && ownerDirectory.some(function(owner){return owner.toLowerCase()===query;}); }
  function acceptInvite(id){ var rows=list(), row=rows.find(function(r){return r.id===id;}); if(row && row.status==='pending'){ row.status='linked'; row.inviteAcceptedAt=new Date().toISOString(); write(rows); } return row; }
  function money(n){ return 'NT$ '+Math.round(n).toLocaleString('en-US'); }
  window.ztorIpBank = { list:list, films:films, allocated:allocated, save:save, remove:remove, ownerDirectory:function(){return ownerDirectory.slice();}, ownerExists:ownerExists, acceptInvite:acceptInvite, revenue:function(f){return revenues[f]||0;}, money:money, types:['Original Story / Screenplay','Character / Likeness','Music & Score','Footage / Clip','Brand / Trademark','Other'] };
}());
