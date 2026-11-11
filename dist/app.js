'use strict';
const $=s=>document.querySelector(s);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages=['home','school','atlas','cast','journal'],navNames=['研習首頁','入門學堂','卦象圖鑑','互動占卦','我的手記'];
const positions=['初爻','二爻','三爻','四爻','五爻','上爻'];
const key='guanyi-notebook-v1';
let book=fresh(),warn='',timer,mode='coins',pending=null;
try{const v=localStorage.getItem(key);if(v)book=validate(JSON.parse(v))}catch{warn='未能讀取本機手記，請從備份還原。'}
const filters={text:'',upper:'',lower:''},attempts={};
const blank=()=>({rolls:[],manual:['','','','','',''],lines:null,date:null,question:'',note:'',id:null,topic:''});
let draft=blank();
function message(s){$('#status').textContent=s;clearTimeout(timer);timer=setTimeout(()=>$('#status').textContent='',3800)}
function persist(next){book=validate(next);try{localStorage.setItem(key,JSON.stringify(book));warn=''}catch{warn='無法寫入本機儲存，請匯出本次手記。'}if(warn)message(warn)}
const link=(path,label,cls='btn')=>'<a class="'+cls+'" href="#'+path+'">'+label+'</a>';
const button=(act,label,attrs='',cls='')=>'<button type="button" class="'+cls+'" data-act="'+act+'" '+attrs+'>'+label+'</button>';
const title=(s,desc='')=>'<h1>'+s+'</h1>'+(desc?'<p class="muted">'+desc+'</p>':'');
const back=(p,s)=>link(p,'← '+s,'trail');
function glyph(code,big=false,moving=[]){return '<span class="glyph '+(big?'large':'')+'" role="img" aria-label="由下往上：'+[...code].map(b=>b==='1'?'陽':'陰').join('、')+'">'+[...code].map((b,i)=>'<i class="'+(b==='0'?'yin ':'')+(moving.includes(i)?'move':'')+'"></i>').join('')+'</span>'}
const symbol=h=>'上卦'+h.upper+'為'+trigrams[h.upper][1]+'，下卦'+h.lower+'為'+trigrams[h.lower][1]+'。';
function tile(h,label='',big=false,moving=[]){return link('hex/'+h.id,glyph(bits(h),big,moving)+'<span><small>'+label+'第 '+h.id+' 卦</small><strong>'+h.name+'</strong><small>'+h.upper+'上・'+h.lower+'下</small></span>','tile')}
function home(){
 const next=lessons.find(l=>!book.completed.includes(l.id))||lessons[0];
 const cards=[['school','冊','入門學堂','用十堂課理解八卦與爻變。'],['atlas','☷','六十四卦圖鑑','對照卦象，逐句讀懂經文。'],['cast','◎','三錢起卦','從六次擲幣，看見陰陽變化。']];
 return '<section class="hero"><span class="seal">周易</span><h1>觀易・六十四卦</h1><p>觀天地之象，明進退之道。</p><div class="actions">'+link('lesson/'+next.id,book.completed.length?'繼續研習 →':'開始學習 →','btn primary')+link('cast','三錢起卦')+'</div></section><div class="heading"><h2>研習書桌</h2><small>已完成 '+book.completed.length+'／10 課</small></div><div class="cards">'+cards.map(([p,i,t,d])=>link(p,'<span class="icon">'+i+'</span><h3>'+t+'</h3><p>'+d+'</p><em>↗</em>','card')).join('')+'</div><div class="heading"><h2>初讀卦象</h2>'+link('atlas','查看全部 64 卦 →','trail')+'</div><div class="tiles">'+books.slice(0,4).map(h=>tile(h)).join('')+'</div>';
}
function school(){return title('易經入門學堂','從一條爻開始，每堂課讀一個觀念、做一道練習。')+'<section class="box">學習進度　'+book.completed.length+'／10 課<div class="progress"><i style="width:'+10*book.completed.length+'%"></i></div></section><div class="lessons">'+lessons.map(l=>link('lesson/'+l.id,'<span class="num">'+String(l.id).padStart(2,'0')+'</span><span><small>'+(book.completed.includes(l.id)?'已完成 ✓':'待研習')+'</small><strong>'+E(l.title)+'</strong></span>','lesson')).join('')+'</div>'}
function lesson(l){
 const a=attempts[l.id],answered=Number.isInteger(a);
 return '<article class="read">'+back('school','學堂目錄')+'<p class="meta">第 '+l.id+' 課／共十課</p>'+title(E(l.title))+'<section class="box"><h2>原理</h2><p>'+E(l.principle)+'</p>'+
 (l.id===4?'<div class="tiles">'+Object.entries(trigrams).map(([n,[c,v]])=>'<div class="tile">'+glyph(c)+n+'・'+v+'</div>').join('')+'</div>':'')+
 '<h3>換句話說</h3><p>'+E(l.plain)+'</p><h3>生活裡的例子</h3><p>'+E(l.example)+'</p></section><section class="box"><span class="tag">隨堂練習</span><h2>'+E(l.quiz)+'</h2><div class="answers">'+l.choices.map((s,i)=>button('answer',E(s),'data-i="'+i+'"',a===i?'primary':'')).join('')+'</div>'+(answered?'<div class="feedback" role="status"><strong>'+(a===l.correct?'答對了，已記下學習進度。':'再想一想。')+'</strong><br>'+E(l.explanation)+'</div>':'')+'</section><div class="actions">'+link(l.id>1?'lesson/'+(l.id-1):'school',l.id>1?'← 上一課':'學堂目錄')+link(l.id<10?'lesson/'+(l.id+1):'journal',l.id<10?'下一課 →':'查看手記','btn primary')+'</div></article>';
}
function selectFilter(k,t){return '<label>'+t+'<select data-filter="'+k+'"><option value="">全部</option>'+Object.keys(trigrams).map(n=>'<option '+(filters[k]===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label>'}
function atlas(){return title('六十四卦圖鑑','依通行卦序編排。點選卦象閱讀經文、白話與《大象》。')+'<div class="box filters"><label>卦名或卦序<input id="search" type="search" placeholder="例如：乾、坎、64" value="'+E(filters.text)+'"></label>'+selectFilter('upper','上卦')+selectFilter('lower','下卦')+'</div><div class="heading"><span id="count" role="status"></span>'+button('clear','清除篩選')+'</div><div class="tiles" id="results"></div>'}
function filter(){
 const norm=s=>s.replace(/恆/g,'恒').replace(/遯/g,'遁'),q=norm(filters.text.trim());
 const found=books.filter(h=>(!q||norm(h.name).includes(q)||Number(q)===h.id)&&(!filters.upper||h.upper===filters.upper)&&(!filters.lower||h.lower===filters.lower));
 $('#count').textContent='找到 '+found.length+'／64 卦';$('#results').innerHTML=found.length?found.map(h=>tile(h)).join(''):'<p>沒有符合的卦，請調整篩選。</p>';
}
function line(h,i){return '<div class="line"><h4>'+E(h.labels[i])+'</h4><p class="word">'+E(h.lines[i])+'</p><span class="tag">白話</span> '+E(h.lineGloss[i])+'</div>'}
function special(h){return '<div class="feedback"><h3>'+(h.id===1?'用九':'用六')+'・特殊用辭</h3><p>'+E(h.special)+'</p>'+E(h.specialGloss)+'</div>'}
function detail(h){
 const fav=book.favorites.includes(h.id);
 return '<article class="read">'+back('atlas','卦象圖鑑')+'<section class="box flex">'+glyph(bits(h),true)+'<div><small>第 '+h.id+' 卦</small><h1>'+h.name+'</h1>'+symbol(h)+'</div>'+button('favorite',fav?'✓ 已收藏':'＋ 收藏此卦','aria-pressed="'+fav+'"')+'</section><section class="box"><h2>卦象與義理</h2><p>'+E(h.core)+'</p><h3>卦辭原文</h3><p class="classic">'+E(h.judgment)+'</p><h3>逐句白話</h3>'+h.gloss.map(s=>{const [a,b]=s.split('｜');return '<div class="trans"><strong>'+E(a)+'</strong>'+E(b)+'</div>'}).join('')+'</section><section class="box"><span class="tag">傳文・大象</span><p class="classic">'+E(h.image)+'</p><p>'+E(h.imageGloss)+'</p></section><section class="box"><h2>六爻逐讀</h2><p class="muted">由初爻讀至上爻，圖中的初爻位於最下方。</p>'+h.lines.map((_,i)=>line(h,i)).join('')+(h.special?special(h):'')+'</section><section class="box"><span class="tag">現代生活延伸</span><h3>日常應用</h3><p>'+E(h.application)+'</p><h3>反思一問</h3><p>'+E(h.question)+'</p></section><a class="trail" href="'+E(h.source)+'" target="_blank" rel="noopener">經文版本・維基文庫 ↗</a><div class="actions">'+link(h.id>1?'hex/'+(h.id-1):'atlas',h.id>1?'← 上一卦':'圖鑑目錄')+link(h.id<64?'hex/'+(h.id+1):'atlas',h.id<64?'下一卦 →':'回圖鑑')+'</div></article>';
}
function log(){return '<div class="log">'+positions.map((p,i)=>{const r=draft.rolls[i];return '<p><span>'+p+'</span>'+(r?glyph(String(r.sum%2)):'—')+'<span>'+(r?r.faces.join('＋')+'＝'+r.sum+' '+types[r.sum]:'待擲')+'</span></p>'}).join('')+'</div>'}
function cast(){
 if(draft.lines)return reading(draft,false);
 const manual=mode==='manual',last=draft.rolls.at(-1),n=draft.rolls.length;
 return '<article class="read">'+title('互動占卦','每次擲三枚銅錢，由初爻往上記下六次結果。')+'<div class="actions">'+button('coins','逐次擲幣','',manual?'':'primary')+button('manual','手動輸入','',manual?'primary':'')+'</div><section class="box"><label>此刻想思考的問題（選填）<input id="question" maxlength="300" value="'+E(draft.question)+'"></label>'+(readyTopics.length?'<fieldset class="topic-pick"><legend>想問的方向</legend>'+[['','綜合'],...readyTopics.map(t=>[t,topicNames[t]])].map(([v,n])=>'<label><input type="radio" name="topic" value="'+v+'"'+(topicOf(draft)===v?' checked':'')+'>'+n+'</label>').join('')+'</fieldset>':'')+
 (manual?'<h2>依序填入六次結果</h2><div class="manual">'+positions.map((p,i)=>'<label>'+p+'<select data-pos="'+i+'"><option value="">請選擇</option>'+[6,7,8,9].map(n=>'<option value="'+n+'" '+(draft.manual[i]===n?'selected':'')+'>'+n+' '+types[n]+'</option>').join('')+'</select></label>').join('')+'</div>'+button('interpret','依六爻解卦 →',draft.manual.every(Boolean)?'':'disabled','primary'):
 '<div class="coins">'+[0,1,2].map(i=>'<span class="coin"><i></i>'+(last?(last.faces[i]===2?'字面 2':'背面 3'):'銅錢')+'</span>').join('')+'</div><small>第 '+(n+1)+' 次／共六次</small><h2>現在擲'+positions[n]+'</h2>'+button('toss','擲三枚銅錢','','primary'))+
 '<p class="muted">本站約定字面為 2、背面為 3。總和 6 為老陰、7 為少陽、8 為少陰、9 為老陽。老陰轉陽，老陽轉陰。</p></section>'+(!manual?'<section class="box"><h2>擲幣紀錄</h2>'+log()+'</section>':'')+'</article>';
}
function focusText(it,h,k){
 const x=it.hex==='base'?h:k,who=(it.hex==='base'?'本卦':'之卦')+'「'+x.name+'」';
 if(it.kind==='line')return {head:who+x.labels[it.index],word:x.lines[it.index],plain:x.lineGloss[it.index]};
 if(it.kind==='special')return {head:who+(x.id===1?'用九':'用六'),word:x.special,plain:x.specialGloss};
 return {head:who+'卦辭',word:x.judgment,plain:x.gloss.map(s=>s.split('｜')[1]||'').join('')};
}
function answer(r,h,k,m){
 const f=focus(r.lines),q=String(r.question||'').trim(),tp=topicOf(r)?topicData[topicOf(r)]:null;
 const items=f.items.map(it=>{const t=focusText(it,h,k);return '<div class="focus-item'+(it.main?' main':'')+'"><small>'+(it.main?'主要':'參考')+'・'+E(t.head)+'</small><p class="word">'+E(t.word)+'</p><p>'+E(t.plain)+'</p></div>'}).join('');
 return '<section class="box answer" aria-labelledby="answer-title"><span class="steps">針對你的問題'+(tp?'・'+topicNames[topicOf(r)]:'')+'</span><h2 id="answer-title">'+(q?'「'+E(q)+'」':'這一卦給你的回應')+'</h2>'+
 '<dl class="answer-grid"><dt>此刻的處境</dt><dd><strong>'+h.name+'</strong>　'+E(h.core)+'</dd>'+
 '<dt>變化的方向</dt><dd>'+(m.length?'<strong>'+k.name+'</strong>　'+E(k.core):'六爻皆靜，局勢暫時穩定，重點放在眼前的處境。')+'</dd></dl>'+
 '<h3>這一卦的重點</h3><p class="muted">'+f.rule+'</p>'+items+
 (tp?'<h3>給你的建議</h3><p>'+E(tp[h.id-1][0])+'</p>'+(m.length?'<p>往「'+k.name+'」變化時：'+E(tp[k.id-1][0])+'</p>':''):'')+'<h3>帶著問題想一想</h3><p>'+(q?'把「'+E(q)+'」放進這個提問：':'')+'<strong>'+E(tp?tp[h.id-1][1]:h.question)+'</strong></p>'+(m.length?'<p>再從「'+k.name+'」來想：'+E(tp?tp[k.id-1][1]:k.question)+'</p>':'')+
 '<p class="muted">卦象不替你做決定，只幫你換個角度看清處境。以下是完整的卦象解讀。</p></section>';
}
const topicData=typeof topics==='undefined'?{}:topics;
const readyTopics=Object.keys(topicNames).filter(t=>Array.isArray(topicData[t])&&topicData[t].length===64);
const topicOf=r=>readyTopics.includes(r.topic)?r.topic:'';
function reading(r,historic){
 const {base:h,changed:k,moving:m}=interpret(r.lines,books);
 return '<article class="read">'+(historic?back('journal','我的手記'):'')+title(historic?'占卦手記':'解卦研習',E(new Date(r.date).toLocaleString('zh-TW')))+(r.question?'<p class="box safe">'+E(r.question)+'</p>':'')+'<div class="pair">'+tile(h,'本卦・',true,m)+tile(k,'之卦・',true)+'</div><p class="meta">初至上　'+r.lines.join(' · ')+'　'+(m.length?'● 為動爻':'六爻皆靜')+'</p>'+answer(r,h,k,m)+(!historic&&mode==='coins'?'<details class="box"><summary>六次擲幣明細</summary>'+log()+'</details>':'')+
 '<section class="box"><span class="steps">一・看懂卦象</span><h2>'+h.name+'卦</h2><p>'+symbol(h)+E(h.core)+'</p><p class="classic">'+E(h.judgment)+'</p><span class="tag">傳文・大象</span><p>'+E(h.image)+'<br>'+E(h.imageGloss)+'</p></section>'+
 '<section class="box"><span class="steps">二・理解動爻</span><h2>'+(m.length?m.map(i=>h.labels[i]).join('、'):'無動爻')+'</h2><p class="muted">以下列出所有動爻供對照；上方「這一卦的重點」依朱熹《易學啟蒙》的取辭規則，標出這次主要該讀的經文。</p>'+(m.length?m.map(i=>line(h,i)).join(''):'<p>此次六爻皆靜，先讀本卦卦辭與上下卦的關係。</p>')+(m.length===6&&h.special?special(h):'')+'</section>'+
 '<section class="box"><span class="steps">三・理解變化</span><h2>'+h.name+(m.length?' 之 '+k.name:'・卦象相同')+'</h2><p>'+(m.length?'原先'+symbol(h)+'陰陽轉換後，'+symbol(k):'六爻保留原形，本卦與之卦相同。')+'</p>'+(m.length?'<p class="classic">'+E(k.judgment)+'</p>'+E(k.core):'')+'</section>'+
 '<section class="box"><span class="steps">四・反思與應用</span><h2>回到自己的處境</h2><p>'+E(h.application)+'</p><strong>'+E(h.question)+'</strong>'+(m.length?'<p>再從「'+k.name+'」來想：'+E(k.question)+'</p>':'')+'<p class="muted">這些是生活反思提示，實際決策仍應核對現實條件。</p></section><section class="box"><label>我的心得<textarea id="note" maxlength="3000">'+E(r.note)+'</textarea></label><div class="actions">'+button('save',historic||draft.id?'更新這筆手記':'儲存這筆手記','','primary')+button('restart','重新起卦')+'</div></section></article>';
}
function journal(){
 return title('我的手記','紀錄儲存在這個瀏覽器。清除網站資料或更換網址前，請先匯出。')+(warn?'<p class="feedback">'+E(warn)+'</p>':'')+'<section class="box"><h2>資料備份</h2><small>備份含提問與心得，請自行妥善保管。</small><div class="actions">'+button('export','匯出 JSON')+link('restore','匯入備份')+'</div></section><section class="box"><h2>學習進度</h2>'+book.completed.length+'／10 課　'+link('school','查看課程 →','trail')+'</section><h2>收藏的卦</h2>'+(book.favorites.length?'<div class="tiles">'+book.favorites.map(n=>tile(books[n-1])).join('')+'</div>':'<p class="muted">在卦象圖鑑點「收藏此卦」即可收錄。</p>')+'<div class="heading"><h2>占卦紀錄</h2><small>'+book.records.length+' 筆</small></div>'+(!book.records.length?'<p>完成起卦後，點選「儲存這筆手記」。</p>':book.records.map(r=>{const o=interpret(r.lines,books);return link('record/'+r.id,'<span><small>'+E(new Date(r.date).toLocaleString('zh-TW'))+'</small><strong>'+o.base.name+' → '+o.changed.name+'</strong><span class="safe">　'+E(r.question)+'</span></span>','tile')}).join(''));
}
function restore(){return '<article class="read">'+back('journal','我的手記')+title('還原備份','選取曾匯出的 JSON，檢查後再確認。還原將取代本機收藏、學習進度與占卦紀錄。')+'<section class="box"><label>選取備份檔<input type="file" id="file" accept=".json,application/json"></label><details><summary>或貼上 JSON 文字</summary><label>備份內容<textarea id="raw"></textarea></label>'+button('parse','檢查備份')+'</details><div id="review" role="status"></div></section></article>'}
function source(){return '<article class="read">'+title('版本與閱讀說明')+'<section class="box"><h2>經文與《象傳》</h2><p>卦辭、爻辭與《大象》採維基文庫繁體《周易》，各卦附固定修訂版連結。保留「无」等古字，略去異文夾註。古典經傳屬公有領域，文庫整理依姓名標示－相同方式分享 4.0 授權。</p><p>《大象》談全卦取象，本版收錄六十四則。《小象》屬逐爻傳文，未收錄。白話、現代延伸與反思題皆為本站編寫。</p><a class="trail" href="https://zh.wikisource.org/zh-hant/周易" target="_blank" rel="noopener">維基文庫《周易》 ↗</a></section><section class="box"><h2>教學讀法</h2><p>先辨上下卦，再讀動爻、比較之卦。六爻皆靜時參看卦辭。乾坤六爻皆動時，另讀用九或用六。這套並讀順序供學習與反思。</p></section></article>'}
function route(){return (location.hash.slice(1)||'home').split('/')}
function render(top=true){
 const [p,arg]=route();let body,group=p;const n=Number(arg);
 if(p==='home')body=home();else if(p==='school')body=school();
 else if(p==='lesson'&&lessons[n-1]){group='school';body=lesson(lessons[n-1])}
 else if(p==='atlas')body=atlas();else if(p==='hex'&&books[n-1]){group='atlas';body=detail(books[n-1])}
 else if(p==='cast')body=cast();else if(p==='journal')body=journal();
 else if(p==='restore'){group='journal';pending=null;body=restore()}
 else if(p==='record'&&book.records.some(r=>r.id===arg)){group='journal';body=reading(book.records.find(r=>r.id===arg),true)}
 else if(p==='sources')body=source();else body=title('找不到這頁')+link('home','回首頁');
 $('nav').innerHTML=pages.map((v,i)=>'<a href="#'+v+'" '+(v===group?'class="active" aria-current="page"':'')+'>'+navNames[i]+'</a>').join('');$('#main').innerHTML=body;if(p==='atlas')filter();
 if(top){window.scrollTo(0,0);$('#main').focus({preventScroll:true})}
}
function preview(raw){pending=null;try{if(raw.length>10000000)throw Error();pending=validate(JSON.parse(raw));$('#review').innerHTML='<div class="feedback">已完成 '+pending.completed.length+' 課、收藏 '+pending.favorites.length+' 卦、紀錄 '+pending.records.length+' 筆。<div class="actions">'+button('apply','確認取代並還原','','primary')+link('journal','取消')+'</div></div>'}catch{$('#review').textContent='備份格式不符，原手記仍保留。'}}
function finish(lines){draft.lines=[...lines];draft.date=new Date().toISOString();render()}
document.addEventListener('input',e=>{const t=e.target;if(t.id==='search'){filters.text=t.value;filter()}if(t.id==='question')draft.question=t.value;if(t.id==='note'&&route()[0]==='cast')draft.note=t.value;if(t.id==='raw'){pending=null;$('#review').textContent=''}});
document.addEventListener('change',e=>{const t=e.target;if(t.name==='topic')draft.topic=t.value;if(t.dataset.filter){filters[t.dataset.filter]=t.value;filter()}if(t.dataset.pos!==undefined){draft.manual[Number(t.dataset.pos)]=Number(t.value);$('[data-act="interpret"]').disabled=!draft.manual.every(Boolean)}if(t.id==='file'&&t.files[0]){const file=t.files[0];if(file.size>10000000){preview('');return}const reader=new FileReader();reader.onload=()=>{if(route()[0]==='restore')preview(String(reader.result))};reader.onerror=()=>preview('');reader.readAsText(file)}});
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-act]');if(!b||b.disabled)return;
 const [p,arg]=route(),n=Number(arg),act=b.dataset.act;
 if(act==='clear'){Object.assign(filters,{text:'',upper:'',lower:''});render(false)}
 if(act==='answer'){const i=Number(b.dataset.i);attempts[n]=i;if(i===lessons[n-1].correct&&!book.completed.includes(n))persist({...book,completed:[...book.completed,n]});render(false)}
 if(act==='favorite'){const has=book.favorites.includes(n);persist({...book,favorites:has?book.favorites.filter(i=>i!==n):[...book.favorites,n]});render(false);message(warn||(has?'已移除收藏':'已加入收藏'))}
 if(act==='manual'||act==='coins'){mode=act;render(false)}
 if(act==='toss'&&!draft.lines&&draft.rolls.length<6){const faces=Array.from(crypto.getRandomValues(new Uint8Array(3)),b=>2+(b&1));draft.rolls.push({faces,sum:faces.reduce((a,b)=>a+b)});if(draft.rolls.length===6)finish(draft.rolls.map(r=>r.sum));else render(false)}
 if(act==='interpret'&&validLines(draft.manual))finish(draft.manual);
 if(act==='restart'){draft=blank();if(p==='cast')render();else location.hash='cast'}
 if(act==='save'){if(p==='record')persist({...book,records:book.records.map(r=>r.id===arg?{...r,note:$('#note').value}:r)});else{if(!draft.id&&book.records.length>=5000){message('紀錄達上限，請先匯出。');return}draft.id=draft.id||crypto.getRandomValues(new Uint32Array(3)).join('-');const {id,lines,date,question,note}=draft,topic=topicOf(draft);persist({...book,records:[{id,lines,date,question,note,topic},...book.records.filter(r=>r.id!==id)]})}b.textContent='更新這筆手記';message(warn||'手記已儲存')}
 if(act==='export'){
  let out=document.querySelector('#export-panel');
  if(!out){out=document.createElement('section');out.id='export-panel';out.className='feedback';b.parentNode.after(out)}
  const raw=JSON.stringify(book,null,2);
  out.innerHTML='<p>下載備份檔，或選取下方文字另存。</p><a class="btn" id="download-json" download="guanyi-notebook.json">下載 JSON 檔案</a><label>完整備份文字<textarea readonly id="export-text"></textarea></label>';
  document.querySelector('#export-text').value=raw;
  const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));
  document.querySelector('#download-json').href=url;
 }
 if(act==='parse')preview($('#raw').value);
 if(act==='apply'&&pending){persist(pending);pending=null;draft=blank();Object.keys(attempts).forEach(k=>delete attempts[k]);location.hash='journal';message(warn||'手記已還原')}
});
window.addEventListener('hashchange',()=>render());render(false);if(warn)message(warn);
