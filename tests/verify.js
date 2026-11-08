const assert=require('node:assert/strict');
const {interpret,validate,fresh,bits}=require('../dist/engine.js');
const books=require('../dist/hexagrams.json'), lessons=require('../dist/lessons.json');
const ref=require('./reference.json').cells;
assert.equal(books.length,64);assert.equal(ref.length,64);
const byCode=new Map();
for(const h of books){
 const row=ref.find(x=>x.id===h.id);
 for(const k of ['name','lower','upper'])assert.equal(h[k],row[k]);
 assert.equal(books[h.id-1],h);assert.equal(h.lines.length,6);assert.equal(h.lineGloss.length,6);
 const code=h.labels.map(t=>t.includes('九')?'1':'0').join('');assert.equal(bits(h),code);
 assert.equal(!!h.special,h.id<=2);assert.ok(h.source.includes('oldid='));
 for(const text of [h.image,h.judgment,h.application,h.question,...h.lines,...h.lineGloss])assert.ok(text);
 for(const s of h.gloss)assert.equal(s.split('｜').filter(Boolean).length,2);
 byCode.set(code,h.id);
}
assert.equal(byCode.size,64);
for(let n=0;n<4096;n++){
 const a=Array.from({length:6},(_,i)=>6+((n>>(2*i))&3));
 const o=interpret(a,books);
 const original=a.map(v=>(v===7||v===9)?'1':'0');
 const target=[...original];const motion=[];
 a.forEach((v,i)=>{if(v===6||v===9){motion.push(i);target[i]=original[i]==='1'?'0':'1'}});
 assert.equal(o.base.id,byCode.get(original.join('')));assert.equal(o.changed.id,byCode.get(target.join('')));assert.deepEqual(o.moving,motion);
}
for(const [lines,b,c] of [[[6,8,8,8,8,8],2,24],[Array(6).fill(9),1,2],[Array(6).fill(6),2,1],[Array(6).fill(7),1,1]]){const o=interpret(lines,books);assert.equal(o.base.id,b);assert.equal(o.changed.id,c)}
assert.equal(lessons.length,10);lessons.forEach((l,i)=>{assert.equal(l.id,i+1);assert.ok(l.choices[l.correct]&&l.explanation&&l.principle&&l.plain&&l.example)});
assert.deepEqual(validate(JSON.parse(JSON.stringify(fresh()))),fresh());assert.throws(()=>validate({...fresh(),favorites:[99]}));
console.log('PASS: 64 reference mappings; 384 line labels and translations; 4096 casts; special texts; 10 lessons; backup schema.');
