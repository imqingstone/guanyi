const trigrams={乾:['111','天'],兌:['110','澤'],離:['101','火'],震:['100','雷'],巽:['011','風'],坎:['010','水'],艮:['001','山'],坤:['000','地']};
const bits=h=>trigrams[h.lower][0]+trigrams[h.upper][0];
const types={6:'老陰',7:'少陽',8:'少陰',9:'老陽'};
const topicNames={study:'學業考試',work:'工作事業',love:'感情關係',people:'人際相處',wellbeing:'身心狀態',decide:'做決定'};
const validTopic=t=>t===undefined||t===''||Object.prototype.hasOwnProperty.call(topicNames,t);
const validLines=a=>Array.isArray(a)&&a.length===6&&a.every(n=>[6,7,8,9].includes(n));
function interpret(a,book){
 if(!validLines(a))throw Error('請填妥六爻');
 const find=s=>book.find(h=>bits(h)===s);
 return {base:find(a.map(n=>n%2).join('')),changed:find(a.map(n=>Number(n===6||n===7)).join('')),moving:a.flatMap((n,i)=>n===6||n===9?[i]:[])};
}
// 依朱熹《易學啟蒙・考變占》決定占辭：回傳要讀的經文與主次。
function focus(a){
 if(!validLines(a))throw Error('請填妥六爻');
 const moving=a.flatMap((n,i)=>n===6||n===9?[i]:[]),still=[0,1,2,3,4,5].filter(i=>!moving.includes(i));
 const J=(hex,main)=>({hex,kind:'judgment',main}),L=(hex,index,main)=>({hex,kind:'line',index,main});
 switch(moving.length){
  case 0:return {rule:'六爻皆靜，看本卦卦辭。',items:[J('base',true)]};
  case 1:return {rule:'一爻動，看本卦這一爻的爻辭。',items:[L('base',moving[0],true)]};
  case 2:return {rule:'二爻動，看本卦這兩爻的爻辭，以上面那一爻為主。',items:[L('base',moving[1],true),L('base',moving[0],false)]};
  case 3:return {rule:'三爻動，看本卦與變卦的卦辭，以本卦為主、變卦為輔。',items:[J('base',true),J('changed',false)]};
  case 4:return {rule:'四爻動，看變卦兩個不變爻的爻辭，以下面那一爻為主。',items:[L('changed',still[0],true),L('changed',still[1],false)]};
  case 5:return {rule:'五爻動，看變卦唯一不變那一爻的爻辭。',items:[L('changed',still[0],true)]};
  default:{const qiankun=a.every(n=>n===9)||a.every(n=>n===6);
   return qiankun?{rule:'六爻皆動，乾坤兩卦看用九、用六。',items:[{hex:'base',kind:'special',main:true}]}
   :{rule:'六爻皆動，看變卦卦辭。',items:[J('changed',true)]}}
 }
}
function fresh(){return {format:'guanyi',version:1,favorites:[],completed:[],records:[]}}
function validate(s){
 const ids=(v,n)=>Array.isArray(v)&&v.length<=n&&v.every(i=>Number.isInteger(i)&&i>=1&&i<=n)&&new Set(v).size===v.length;
 if(!s||s.format!=='guanyi'||s.version!==1||!ids(s.favorites,64)||!ids(s.completed,10)||!Array.isArray(s.records)||s.records.length>5000)throw Error('格式不符');
 const seen=new Set();
 for(const r of s.records){if(!r||typeof r.id!=='string'||!/^[-0-9a-z]{1,100}$/i.test(r.id)||seen.has(r.id)||!validLines(r.lines)||!validTopic(r.topic)||typeof r.question!=='string'||r.question.length>300||typeof r.note!=='string'||r.note.length>3000||typeof r.date!=='string'||!Number.isFinite(Date.parse(r.date)))throw Error('紀錄不完整');seen.add(r.id)}
 return s;
}
if(typeof module!=='undefined')module.exports={trigrams,bits,interpret,focus,fresh,validate,topicNames};
