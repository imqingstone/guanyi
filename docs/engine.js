const trigrams={乾:['111','天'],兌:['110','澤'],離:['101','火'],震:['100','雷'],巽:['011','風'],坎:['010','水'],艮:['001','山'],坤:['000','地']};
const bits=h=>trigrams[h.lower][0]+trigrams[h.upper][0];
const types={6:'老陰',7:'少陽',8:'少陰',9:'老陽'};
const validLines=a=>Array.isArray(a)&&a.length===6&&a.every(n=>[6,7,8,9].includes(n));
function interpret(a,book){
 if(!validLines(a))throw Error('請填妥六爻');
 const find=s=>book.find(h=>bits(h)===s);
 return {base:find(a.map(n=>n%2).join('')),changed:find(a.map(n=>Number(n===6||n===7)).join('')),moving:a.flatMap((n,i)=>n===6||n===9?[i]:[])};
}
function fresh(){return {format:'guanyi',version:1,favorites:[],completed:[],records:[]}}
function validate(s){
 const ids=(v,n)=>Array.isArray(v)&&v.length<=n&&v.every(i=>Number.isInteger(i)&&i>=1&&i<=n)&&new Set(v).size===v.length;
 if(!s||s.format!=='guanyi'||s.version!==1||!ids(s.favorites,64)||!ids(s.completed,10)||!Array.isArray(s.records)||s.records.length>5000)throw Error('格式不符');
 const seen=new Set();
 for(const r of s.records){if(!r||typeof r.id!=='string'||!/^[-0-9a-z]{1,100}$/i.test(r.id)||seen.has(r.id)||!validLines(r.lines)||typeof r.question!=='string'||r.question.length>300||typeof r.note!=='string'||r.note.length>3000||typeof r.date!=='string'||!Number.isFinite(Date.parse(r.date)))throw Error('紀錄不完整');seen.add(r.id)}
 return s;
}
if(typeof module!=='undefined')module.exports={trigrams,bits,interpret,fresh,validate};
