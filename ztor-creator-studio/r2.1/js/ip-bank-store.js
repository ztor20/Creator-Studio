/* Prototype-only shared source for Admin IP Bank and Reporting. localStorage is
   intentionally presentation state, not a settlement or payout source of truth. */
(function () {
  'use strict';
  var KEY = 'ztor.adminIpBank.v1';
  /* Prototype directory used by the Owner lookup. Production receives only
     permissioned directory results from the Ztor user service. */
  var ownerDirectory = [
    { id:'user-denise', displayName:'Denise Wong', username:'denise', email:'denise@ztor.com' },
    { id:'user-wong', displayName:'Wong Siu-pong', username:'siupong', email:'siupong@ztor.com' },
    { id:'user-lee-estate', displayName:'Lee Estate (B. Lee)', username:'leeestate', email:'estate@lee.example' },
    { id:'user-mei', displayName:'Mei Lin', username:'meilin', email:'mei@ztor.com' },
    { id:'user-david', displayName:'David Chen', username:'davidchen', email:'david@ztor.com' }
  ];
  function linkedOwner(id) {
    var user = ownerDirectory.filter(function (candidate) { return candidate.id === id; })[0];
    return { kind:'linked', userId:user.id, displayName:user.displayName, username:user.username, email:user.email };
  }
  var seed = [
    { id:'ip-1', film:'海上霸王 - 鄭一嫂', title:'Zheng Yi Sao (lead character)', type:'Character / Likeness', owner:linkedOwner('user-denise'), status:'linked', share:20, withdrawn:2200 },
    { id:'ip-2', film:'海上霸王 - 鄭一嫂', title:'Original score', type:'Music & Score', owner:linkedOwner('user-wong'), status:'linked', share:35, withdrawn:0 },
    { id:'ip-3', film:'海上霸王 - 鄭一嫂', title:'Original screenplay', type:'Original Story / Screenplay', owner:{ kind:'invite', email:'huei-ling@example.com' }, status:'pending', invitation:{ status:'pending', email:'huei-ling@example.com', createdAt:'2026-07-14T09:00:00.000Z', delivery:'not-sent-prototype' }, share:15, withdrawn:0 },
    { id:'ip-4', film:'Fist Of Fury', title:'Bruce Lee likeness', type:'Character / Likeness', owner:linkedOwner('user-lee-estate'), status:'linked', share:50, withdrawn:0 }
  ];
  var revenues = { '海上霸王 - 鄭一嫂':79300, 'Fist Of Fury':48000 };
  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function findOwner(value) {
    var query=String(value||'').trim().toLowerCase();
    return ownerDirectory.filter(function(user){return user.id===value||user.displayName.toLowerCase()===query||user.username.toLowerCase()===query||('@'+user.username).toLowerCase()===query||user.email.toLowerCase()===query;})[0] || null;
  }
  function normalizeOwner(value, status, inviteContact) {
    if (value && typeof value === 'object' && value.kind === 'linked') {
      var known = findOwner(value.userId || value.email || value.username || value.displayName);
      return known ? linkedOwner(known.id) : { kind:'linked', userId:value.userId || '', displayName:value.displayName || value.email || '', username:value.username || '', email:value.email || '' };
    }
    if (value && typeof value === 'object' && value.kind === 'invite') return { kind:'invite', email:String(value.email || '').trim().toLowerCase() };
    if (status === 'pending' || inviteContact) return { kind:'invite', email:String(inviteContact || value || '').trim().toLowerCase() };
    var legacy = findOwner(value);
    return legacy ? linkedOwner(legacy.id) : { kind:'linked', userId:'legacy-'+String(value || '').toLowerCase(), displayName:String(value || ''), username:'', email:'' };
  }
  function createInvitation(email) { return { status:'pending', email:String(email).trim().toLowerCase(), createdAt:new Date().toISOString(), delivery:'not-sent-prototype' }; }
  function normalizeEntry(entry) {
    var row=clone(entry), owner=normalizeOwner(row.owner, row.status, row.inviteContact);
    row.owner=owner;
    row.status=owner.kind==='invite'?'pending':'linked';
    if (owner.kind==='invite') row.invitation=row.invitation || createInvitation(owner.email);
    else delete row.invitation;
    delete row.inviteContact;
    return row;
  }
  function read(){ try { var v=JSON.parse(localStorage.getItem(KEY)); return (Array.isArray(v)?v:seed).map(normalizeEntry); } catch(e){ return seed.map(normalizeEntry); } }
  function write(rows){ try{localStorage.setItem(KEY,JSON.stringify(rows));}catch(e){} return rows; }
  function list(){ return read(); }
  function films(){ var out=[]; list().forEach(function(r){if(out.indexOf(r.film)<0)out.push(r.film);}); return out; }
  function allocated(film, excludeId){ return list().filter(function(r){return r.film===film && r.id!==excludeId;}).reduce(function(s,r){return s+Number(r.share||0);},0); }
  function save(entry){ var rows=list(), row=normalizeEntry(entry), i=rows.findIndex(function(r){return r.id===row.id;}); if(row.owner.kind==='invite'&&isPendingInviteDuplicate(row.owner.email,row.id))throw new Error('duplicate-pending-invitation'); if(i>=0)rows[i]=row; else rows.push(row); return write(rows); }
  function remove(id){ return write(list().filter(function(r){return r.id!==id;})); }
  function searchOwners(query){ var normalized=String(query||'').trim().toLowerCase(); if(!normalized)return []; return ownerDirectory.filter(function(user){return [user.displayName,user.username,'@'+user.username,user.email].some(function(value){return value.toLowerCase().indexOf(normalized)!==-1;});}); }
  function emailLookup(email){ return ownerDirectory.filter(function(user){return user.email.toLowerCase()===String(email||'').trim().toLowerCase();})[0] || null; }
  function isPendingInviteDuplicate(email, excludeId){ var normalized=String(email||'').trim().toLowerCase(); return !!normalized && list().some(function(row){return row.id!==excludeId&&row.owner&&row.owner.kind==='invite'&&row.owner.email===normalized&&row.status==='pending';}); }
  function ownerLabel(entryOrOwner){ var owner=entryOrOwner&&entryOrOwner.owner?entryOrOwner.owner:entryOrOwner; return owner&&owner.kind==='invite'?owner.email:(owner&&owner.displayName)||''; }
  function acceptInvite(id){ var rows=list(), row=rows.find(function(r){return r.id===id;}); if(row && row.status==='pending'){ var email=row.owner.email, user=emailLookup(email); row.owner=user?linkedOwner(user.id):{ kind:'linked', userId:'claimed-'+email, displayName:email, username:'', email:email }; row.status='linked'; row.inviteAcceptedAt=new Date().toISOString(); delete row.invitation; write(rows); } return row; }
  function money(n){ return 'NT$ '+Math.round(n).toLocaleString('en-US'); }
  window.ztorIpBank = { list:list, films:films, allocated:allocated, save:save, remove:remove, ownerDirectory:function(){return clone(ownerDirectory);}, searchOwners:searchOwners, emailLookup:emailLookup, isPendingInviteDuplicate:isPendingInviteDuplicate, createInvitation:createInvitation, ownerLabel:ownerLabel, acceptInvite:acceptInvite, revenue:function(f){return revenues[f]||0;}, money:money, types:['Original Story / Screenplay','Character / Likeness','Music & Score','Footage / Clip','Brand / Trademark','Other'] };
}());
