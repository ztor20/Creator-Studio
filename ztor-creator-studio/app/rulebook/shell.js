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
      {t:'取貨管理', pages:[{t:'取貨場次'},{t:'手機 Scanner'}]},
      {t:'需求看板', pages:[{h:'demand-board.html', t:'需求看板'}]}
    ]},
    {n:'6', t:'活動', groups:[
      {t:'活動規則', pages:[{h:'event-rules.html', t:'活動規則'},{h:'event-journey.html', t:'活動用戶旅程圖'},{h:'event-bookyay.html', t:'bookyay 匯入與對照'}]},
      {t:'建立活動', pages:[{h:'event-create.html', t:'建立活動'},{h:'event-create-step1.html', t:'步驟 1 活動類型與 bookyay 帶入'},{h:'event-create-step2.html', t:'步驟 2 基本資料'},{h:'event-create-step3.html', t:'步驟 3 場次'},{h:'event-create-step4.html', t:'步驟 4 票種'},{h:'event-create-step5.html', t:'步驟 5 門票與購票規則'},{h:'event-create-step6.html', t:'步驟 6 票務商品'},{h:'event-create-step7.html', t:'步驟 7 發布設定'},{h:'event-create-step8.html', t:'步驟 8 預覽與發布'},{h:'event-create-watchparty.html', t:'共看派對的建立'}]},
      {t:'活動', pages:[{h:'events.html', t:'活動總覽'},{h:'event-detail.html', t:'活動詳情與編輯'}]}
    ]},
    {n:'7', t:'粉絲', groups:[
      {t:'粉絲管理', pages:[{h:'fans-roster.html', t:'粉絲總覽與詳情'},{h:'fans-tiers.html', t:'粉絲分級'},{h:'fans-broadcast.html', t:'群發訊息'}]},
      {t:'媒體庫', pages:[{h:'fans-vault.html', t:'媒體庫'}]},
      {t:'粉絲活動', pages:[{h:'fans-campaigns.html', t:'粉絲活動'}]}
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
      {t:'平台優惠設定', pages:[{t:'平台優惠設定'}]},
      {t:'平台忠誠點數設定', pages:[{h:'admin-loyalty.html', t:'平台忠誠點數設定'}]}
    ]}
  ];
  function current(){
    var p=location.pathname.split('/').pop()||'index.html';
    return p;
  }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  /* 內容區標題加序號：h1＝頁號，h2＝頁號.節，h3＝頁號.節.小節；h4 的字母由 letterH4 另外加；頁首目錄由 buildToc 依序號重建 */
  function numberHeadings(base){
    var wrap=document.querySelector('body>.wrap'); if(!wrap) return;
    function put(h,num){ var n=h.querySelector(':scope>.n'); if(!n){ n=document.createElement('span'); n.className='n'; h.insertBefore(n,h.firstChild); } n.textContent=num; }
    var h1=wrap.querySelector(':scope>h1'); if(h1) put(h1,base);
    var i=0,j=0,map={};
    [].forEach.call(wrap.children,function(el){
      if(el.tagName==='H2' && !el.classList.contains('sr-only')){ i++; j=0; put(el,base+'.'+i); if(el.id) map[el.id]=base+'.'+i; }
      else if(el.tagName==='H3' && i>0){ j++; put(el,base+'.'+i+'.'+j); }
    });
  }
  /* h4 字母標記：只看內容區直接子元素，每個 h2／h3 重新從 a 算，超過 26 個接 aa、ab；字母放進 span.n，樣式同序號。卡片裡的 h4 不處理 */
  function letterOf(i){ var c=String.fromCharCode(97+i%26); return i<26?c:letterOf(Math.floor(i/26)-1)+c; }
  /* 內文的頁內連結指到有序號或字母的標題（h2、h3、h4）時，連結前自動帶上同一個序號或字母；作者只寫標題文字 */
  function numberLinks(){
    var wrap=document.querySelector('body>.wrap'); if(!wrap) return;
    wrap.querySelectorAll('a[href^="#"]').forEach(function(a){
      if(a.closest('.toc,.rb-subtoc')||a.querySelector('.n')) return;
      var t=document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
      var n=t&&/^H[234]$/.test(t.tagName)&&t.querySelector(':scope>.n'); if(!n||!n.textContent) return;
      var s=document.createElement('span'); s.className='n'; s.textContent=n.textContent; a.insertBefore(s,a.firstChild); a.classList.add('xref');
    });
  }
  function letterH4(){
    var wrap=document.querySelector('body>.wrap'); if(!wrap) return;
    var k=0;
    [].forEach.call(wrap.children,function(el){
      if(el.tagName==='H2'||el.tagName==='H3'){ k=0; return; }
      if(el.tagName!=='H4') return;
      var n=el.querySelector(':scope>.n'); if(!n){ n=document.createElement('span'); n.className='n'; el.insertBefore(n,el.firstChild); }
      n.textContent=letterOf(k++);
    });
  }
  /* 標題文字（扣掉序號與徽章）與穩定 id：沒有 id 的標題由文字產生，重名加 -2，不覆蓋既有 id */
  var madeId=false;
  function headText(h){ var t=''; [].forEach.call(h.childNodes,function(c){ if(c.nodeType===1&&(c.classList.contains('n')||c.classList.contains('tag'))) return; t+=c.textContent; }); return t.replace(/\s+/g,' ').trim(); }
  function autoId(h,label){
    if(h.id) return h.id;
    var base=label.replace(/[\s"'#<>&?%\/\\]+/g,'-').replace(/^-+|-+$/g,'')||'sec', id=base, n=2;
    while(document.getElementById(id)) id=base+'-'+(n++);
    h.id=id; madeId=true; return id;
  }
  /* 頁首目錄：清空 .toc 後重建成兩層清單——h2 一層、h3 縮排在所屬 h2 底下（h4 不列）；序號取自標題上自動產生的 span.n。
     只看內容區直接子元素；sr-only 的 h2 與其後的 h3 不列。項目多於 16 個時桌機分兩欄 */
  function buildToc(){
    var wrap=document.querySelector('body>.wrap'); if(!wrap) return;
    var tocs=wrap.querySelectorAll('.toc'); if(!tocs.length) return;
    var groups=[], g=null, count=0;
    [].forEach.call(wrap.children,function(el){
      if(el.tagName==='H2'){ if(el.classList.contains('sr-only')){ g=null; return; } g={h:el,subs:[]}; groups.push(g); count++; }
      else if(el.tagName==='H3' && g){ g.subs.push(el); count++; }
    });
    function item(h){ var label=headText(h), id=autoId(h,label), n=h.querySelector(':scope>.n'); return '<a href="#'+esc(id)+'">'+(n&&n.textContent?'<span class="n">'+esc(n.textContent)+'</span>':'')+'<span class="t">'+esc(label)+'</span></a>'; }
    var html='<div class="rb-toc-lbl">目錄</div><ol class="rb-toc">'+groups.map(function(x){
      return '<li class="lv2">'+item(x.h)+(x.subs.length?'<ol>'+x.subs.map(function(h){ return '<li class="lv3">'+item(h)+'</li>'; }).join('')+'</ol>':'')+'</li>';
    }).join('')+'</ol>';
    [].forEach.call(tocs,function(t){ t.innerHTML=html; t.setAttribute('role','navigation'); t.setAttribute('aria-label','本頁目錄'); t.classList.toggle('is-long',count>16); });
  }
  /* 網址帶的錨點是剛補上的 id 時，瀏覽器載入時找不到，補捲一次 */
  function fixHash(){ if(madeId && location.hash){ try{ var tg=document.getElementById(decodeURIComponent(location.hash.slice(1))); if(tg) tg.scrollIntoView(); }catch(e){} } }
  /* 子節目錄：h3 底下（到下一個 h2／h3 前）有 3 個以上 h4 時，在該 h3 下方插一排 h4 的跳轉連結。
     只看內容區的直接子元素（卡片裡的 h3 不算）；h4 沒有 id 時由標題文字產生穩定 id，不覆蓋既有 id；不動序號與頁首目錄 */
  function subToc(){
    var wrap=document.querySelector('body>.wrap'); if(!wrap) return;
    var kids=[].slice.call(wrap.children);
    kids.forEach(function(el,i){
      if(el.tagName!=='H3') return;
      var h4s=[];
      for(var k=i+1;k<kids.length;k++){ var t=kids[k].tagName; if(t==='H2'||t==='H3') break; if(t==='H4') h4s.push(kids[k]); }
      if(h4s.length<3) return;
      /* 開頭段落已經用連結帶到底下的 h4 時，不再另外產生子節目錄 */
      for(var k2=i+1;k2<kids.length&&kids[k2].tagName!=='H4';k2++){ var hit=[].some.call(kids[k2].querySelectorAll('a[href^="#"]'),function(a){ return h4s.some(function(h){ return h.id&&a.getAttribute('href')==='#'+h.id; }); }); if(hit) return; }
      var links=h4s.map(function(h){
        var nEl=h.querySelector(':scope>.n'), mark=nEl?nEl.textContent:'', label=headText(h);
        autoId(h,label);
        return '<a href="#'+esc(h.id)+'">'+(mark?'<span class="n">'+esc(mark)+'</span>':'')+esc(label)+'</a>';
      });
      var nav=document.createElement('nav'); nav.className='rb-subtoc'; nav.setAttribute('aria-label','本節子節');
      nav.innerHTML=links.join('');
      el.parentNode.insertBefore(nav, el.nextSibling);
    });
  }
  function build(){
    var cur=current();
    letterH4();
    subToc();
    var old=document.querySelector('.topnav'); if(old) old.remove();
    var side=document.createElement('aside'); side.className='rb-side'; side.setAttribute('aria-label','章節');
    var html='<div class="head"><a class="brand" href="index.html"><b>ztor Creator Studio 規則手冊</b><span>產品規則定案與發布</span></a><button type="button" class="fold" data-act="fold" aria-label="收合側邊欄" title="收合／展開側邊欄">‹</button></div>';
    var here=null;
    /* 序號＝章.頁.節.小節（例 7.1.2.3）。頁號依章節樹在該章內的順序，待補的頁也佔號，日後補上內容不會讓其他頁跳號；子功能頁只是分組、不編號 */
    TREE.forEach(function(c){ var k=0; c.groups.forEach(function(g){ g.pages.forEach(function(p){ k++; p.num=c.n+'.'+k; if(p.h===cur) here={c:c,g:g,p:p}; }); }); });
    if(here) numberHeadings(here.p.num);
    buildToc();
    numberLinks();
    fixHash();
    html+='<div class="lbl">章節</div><ul class="rb-nav rb-tree">';
    TREE.forEach(function(c){
      var open=here&&here.c===c, filled=0, total=0;
      c.groups.forEach(function(g){ g.pages.forEach(function(p){ total++; if(p.h) filled++; }); });
      html+='<li class="rb-ch'+(open?' is-open is-cur':'')+(filled?'':' is-empty')+'"><button type="button" class="rb-chb" aria-expanded="'+(open?'true':'false')+'" title="'+esc(c.t)+'"><span class="n">'+c.n+'</span><span class="rb-t">'+esc(c.t)+'</span>'+(filled?'':'<span class="rb-todo">待補</span>')+'<span class="rb-car" aria-hidden="true">›</span></button><div class="rb-chbody">';
      c.groups.forEach(function(g){
        html+='<div class="rb-grp">'+esc(g.t)+'</div><ul class="rb-pg">';
        g.pages.forEach(function(p){
          if(!p.h){ html+='<li><span class="rb-empty"><span class="pn">'+p.num+'</span>'+esc(p.t)+'</span></li>'; return; }
          var on=p.h===cur;
          html+='<li><a href="'+p.h+'"'+(on?' aria-current="page"':'')+'><span class="pn">'+p.num+'</span>'+esc(p.t)+'</a>';
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
    /* 捲動跟隨：選定「頂端已捲過的最後一個 h2」那一節；捲到頁尾選最後一節；還沒捲過任何標題時選第一節。
       選定項在側欄可見範圍外時，只捲側欄讓它露出來（不動頁面）。 */
    if(links.length){
      var map={}; links.forEach(function(a){ map[a.getAttribute('data-sec')]=a; });
      var heads=[].slice.call(document.querySelectorAll('.wrap h2[id]')).filter(function(h){ return map[h.id]; });
      var curId=null, ticking=false;
      function spy(){
        ticking=false;
        var line=Math.min(160, window.innerHeight*0.25), id=heads.length?heads[0].id:null;
        heads.forEach(function(h){ if(h.getBoundingClientRect().top<=line) id=h.id; });
        if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2 && heads.length) id=heads[heads.length-1].id;
        if(id===curId) return; curId=id;
        links.forEach(function(a){ a.classList.toggle('is-active', a.getAttribute('data-sec')===id); });
        var act=map[id]; if(!act) return;
        var sr=side.getBoundingClientRect(), ar=act.getBoundingClientRect();
        if(ar.top<sr.top+8) side.scrollTop-= (sr.top+8-ar.top);
        else if(ar.bottom>sr.bottom-8) side.scrollTop+= (ar.bottom-(sr.bottom-8));
      }
      window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; requestAnimationFrame(spy); } },{passive:true});
      window.addEventListener('resize',spy);
      spy();
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();
