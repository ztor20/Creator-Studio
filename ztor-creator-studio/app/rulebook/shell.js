/* 規則手冊共用外殼：主題（跟隨系統／淺色／深色）＋側邊欄章節樹（章節 › 子功能頁 › 子頁）＋麵包屑。 */
(function(){
  var KEY='rb-theme', FOLD='rb-fold';
  var root=document.documentElement;
  function getTheme(){ try{ return localStorage.getItem(KEY)||'system'; }catch(e){ return 'system'; } }
  function applyTheme(t){
    if(t==='light'||t==='dark'){ root.setAttribute('data-theme',t); } else { root.removeAttribute('data-theme'); }
    document.querySelectorAll('.rb-theme .seg button').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-t')===t?'true':'false'); });
  }
  applyTheme(getTheme());

  /* 章節樹：照原型左側欄排——章節＝功能項目、第二層＝子功能頁（側欄下拉的目的地）、
     第三層＝子頁（本手冊的一頁）。沒有 h 的子頁是已規劃、尚無內容。 */
  var TREE=[
    {n:'1', t:'專案概覽', groups:[
      {t:'專案概覽', pages:[{h:'index.html', t:'專案概覽'}]},
      {t:'共同規格', pages:[{h:'taxonomy.html', t:'商品分類與模組應用'},{t:'狀態語言'},{t:'財務術語與收入事件'},{t:'語言與在地化'},{t:'定價幣別'},{t:'展示素材與年齡分級'},{t:'用詞規則'}]}
    ]},
    {n:'2', t:'總覽', groups:[
      {t:'總覽', pages:[{t:'儀表板'},{t:'Hero Banner'}]}
    ]},
    {n:'3', t:'項目', groups:[
      {t:'項目', pages:[{t:'項目列表'},{t:'建立項目'},{t:'項目詳情'},{t:'作品上架'}]}
    ]},
    {n:'4', t:'IP', groups:[
      {t:'我的 IP', pages:[{t:'我的 IP'},{t:'登錄 IP'},{t:'管理 IP'}]},
      {t:'IP 市場', pages:[{t:'IP 市場'},{t:'IP 詳情'}]}
    ]},
    {n:'5', t:'電子商店', groups:[
      {t:'電子商店', pages:[{h:'eshop-sales.html', t:'電子商店販售流程'},{h:'bundles.html', t:'組合包與票務商品'},{h:'promo-rules.html', t:'優惠規則'},{t:'建立商品與商品細節'},{t:'拍賣'},{t:'補貨與新品貼文'},{t:'商店設定'}]},
      {t:'訂單管理', pages:[{t:'訂單列表'},{t:'訂單詳情'}]},
      {t:'取貨管理', pages:[{t:'取貨場次'},{t:'手機 Scanner'}]}
    ]},
    {n:'6', t:'活動', groups:[
      {t:'活動', pages:[{h:'events.html', t:'活動總覽'},{h:'event-create.html', t:'建立活動'},{h:'event-detail.html', t:'活動詳情與編輯'},{h:'event-bookyay.html', t:'bookyay 匯入與對照'}]}
    ]},
    {n:'7', t:'粉絲', groups:[
      {t:'粉絲分析', pages:[{h:'fan-analytics.html', t:'粉絲分析'}]},
      {t:'粉絲管理', pages:[{h:'fans.html', t:'分級與分工'},{h:'fans-roster.html', t:'粉絲總覽與詳情'},{h:'fans-tiers.html', t:'分級設定與權益'},{h:'fans-broadcast.html', t:'群發訊息'}]},
      {t:'媒體庫', pages:[{h:'fans-vault.html', t:'媒體庫'}]},
      {t:'粉絲活動', pages:[{h:'fans-campaigns.html', t:'粉絲活動'}]},
      {t:'粉絲分析：含外部', pages:[{t:'保留規格，本期不建置'}]}
    ]},
    {n:'8', t:'收入管理', groups:[
      {t:'收入管理', pages:[{t:'收入總覽'},{t:'申請提款'},{t:'手動補登收入'}]}
    ]},
    {n:'9', t:'Admin', groups:[
      {t:'Creator 管理', pages:[{t:'Creator 列表'},{t:'Creator 詳情'}]},
      {t:'創作者活動管理', pages:[{h:'admin-events.html', t:'活動匯入管理'}]},
      {t:'影片上架審核', pages:[{t:'影片上架審核'}]},
      {t:'Admin IP Bank', pages:[{t:'IP Bank'},{t:'建立 IP Entry'}]},
      {t:'IP Bank Reporting', pages:[{t:'IP Bank Reporting'}]},
      {t:'平台費率設定', pages:[{t:'平台費率設定'}]},
      {t:'平台優惠設定', pages:[{t:'平台優惠設定'}]}
    ]}
  ];
  function current(){
    var p=location.pathname.split('/').pop()||'index.html';
    return p;
  }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  function build(){
    var cur=current();
    var old=document.querySelector('.topnav'); if(old) old.remove();
    var side=document.createElement('aside'); side.className='rb-side'; side.setAttribute('aria-label','章節');
    var html='<div class="head"><a class="brand" href="index.html"><b>ztor Creator Studio 規則手冊</b><span>產品規則定案與發布</span></a><button type="button" class="fold" data-act="fold" aria-label="收合側邊欄" title="收合／展開側邊欄">‹</button></div>';
    var here=null;
    TREE.forEach(function(c){ c.groups.forEach(function(g){ g.pages.forEach(function(p){ if(p.h===cur) here={c:c,g:g,p:p}; }); }); });
    html+='<div class="lbl">章節</div><ul class="rb-nav rb-tree">';
    TREE.forEach(function(c){
      var open=here&&here.c===c, filled=0, total=0;
      c.groups.forEach(function(g){ g.pages.forEach(function(p){ total++; if(p.h) filled++; }); });
      html+='<li class="rb-ch'+(open?' is-open':'')+'"><button type="button" class="rb-chb" aria-expanded="'+(open?'true':'false')+'" title="'+esc(c.t)+'"><span class="n">'+c.n+'</span><span class="rb-t">'+esc(c.t)+'</span>'+(filled?'':'<span class="rb-todo">待補</span>')+'<span class="rb-car" aria-hidden="true">›</span></button><div class="rb-chbody">';
      c.groups.forEach(function(g){
        html+='<div class="rb-grp">'+esc(g.t)+'</div><ul class="rb-pg">';
        g.pages.forEach(function(p){
          if(!p.h){ html+='<li><span class="rb-empty">'+esc(p.t)+'</span></li>'; return; }
          var on=p.h===cur;
          html+='<li><a href="'+p.h+'"'+(on?' aria-current="page"':'')+'>'+esc(p.t)+'</a>';
          if(on){
            var subs=[]; document.querySelectorAll('.wrap h2[id]').forEach(function(h){ var t=h.textContent.replace(/^\s*[\d.]+\s*/,'').trim(); if(t) subs.push({id:h.id,t:t}); });
            if(subs.length>1){ html+='<ul class="rb-sub">'; subs.forEach(function(s){ html+='<li><a href="#'+s.id+'" data-sec="'+s.id+'">'+esc(s.t)+'</a></li>'; }); html+='</ul>'; }
          }
          html+='</li>';
        });
        html+='</ul>';
      });
      html+='</div></li>';
    });
    html+='</ul><div class="spacer"></div>';
    html+='<div class="rb-theme"><div class="lbl">皮膚</div><div class="seg" role="group" aria-label="皮膚">'+
      '<button type="button" data-t="system">跟隨系統</button><button type="button" data-t="light">淺色</button><button type="button" data-t="dark">深色</button></div></div>';
    side.innerHTML=html;
    var top=document.createElement('div'); top.className='rb-top';
    top.innerHTML='<a class="brand" href="index.html">ztor Creator Studio 規則手冊</a><button type="button" data-act="menu">章節</button>';
    var back=document.createElement('div'); back.className='rb-backdrop';
    document.body.insertBefore(side, document.body.firstChild);
    document.body.insertBefore(top, side);
    document.body.appendChild(back);
    if(here){
      var parts=[here.c.t, here.g.t, here.p.t], uniq=[];
      parts.forEach(function(x){ if(uniq[uniq.length-1]!==x) uniq.push(x); });
      var wrap=document.querySelector('body>.wrap');
      if(wrap){ var bc=document.createElement('nav'); bc.className='rb-crumb'; bc.setAttribute('aria-label','所在位置');
        bc.innerHTML=uniq.map(function(x,i){ return '<span'+(i===uniq.length-1?' aria-current="page"':'')+'>'+esc(x)+'</span>'; }).join('<span class="sep" aria-hidden="true">›</span>');
        wrap.insertBefore(bc, wrap.firstChild); }
    }
    side.querySelectorAll('.rb-chb').forEach(function(b){
      b.addEventListener('click',function(){
        var li=b.parentNode;
        if(document.body.classList.contains('rb-collapsed')){ setFold(false); li.classList.add('is-open'); b.setAttribute('aria-expanded','true'); return; }
        var o=!li.classList.contains('is-open'); li.classList.toggle('is-open',o); b.setAttribute('aria-expanded',o?'true':'false');
      });
    });

    side.querySelectorAll('.rb-theme .seg button').forEach(function(b){
      b.addEventListener('click',function(){ var t=b.getAttribute('data-t'); try{ localStorage.setItem(KEY,t); }catch(e){} applyTheme(t); });
    });
    applyTheme(getTheme());
    var foldBtn=side.querySelector('[data-act="fold"]');
    function setFold(on){ document.body.classList.toggle('rb-collapsed',on); foldBtn.textContent=on?'›':'‹'; foldBtn.setAttribute('aria-label',on?'展開側邊欄':'收合側邊欄'); try{ localStorage.setItem(FOLD,on?'1':'0'); }catch(e){} }
    var f0=false; try{ f0=localStorage.getItem(FOLD)==='1'; }catch(e){}
    setFold(f0);
    foldBtn.addEventListener('click',function(){ setFold(!document.body.classList.contains('rb-collapsed')); });
    function close(){ document.body.classList.remove('rb-open'); }
    top.querySelector('[data-act="menu"]').addEventListener('click',function(){ document.body.classList.toggle('rb-open'); });
    back.addEventListener('click',close);
    side.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',close); });
    // 收合狀態下點章節不關側欄（桌機無抽屜）；close 只影響手機 class

    var links=side.querySelectorAll('.rb-sub a[data-sec]');
    if(links.length && 'IntersectionObserver' in window){
      var map={}; links.forEach(function(a){ map[a.getAttribute('data-sec')]=a; });
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ links.forEach(function(a){a.classList.remove('is-active')}); var a=map[e.target.id]; if(a) a.classList.add('is-active'); } });
      },{rootMargin:'-10% 0px -70% 0px'});
      document.querySelectorAll('h2[id], h3[id]').forEach(function(h){ io.observe(h); });
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();
