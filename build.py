import json
from pathlib import Path
p=Path(__file__).parent/'dist'
data=[json.loads((p/(n+'.json')).read_text()) for n in ('hexagrams','lessons','topics')]
(p/'data.js').write_text('const books='+json.dumps(data[0],ensure_ascii=False)+';\nconst lessons='+json.dumps(data[1],ensure_ascii=False)+';\nconst topics='+json.dumps(data[2],ensure_ascii=False)+';')
