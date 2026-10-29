import re,sys
D={'零':0,'〇':0,'一':1,'二':2,'兩':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9}
def conv(s):
    n=0;cur=0
    for ch in s:
        if ch in D: cur=D[ch]
        elif ch=='百': n+=(cur or 1)*100;cur=0
        elif ch=='十': n+=(cur or 1)*10;cur=0
        elif ch=='千': n+=(cur or 1)*1000;cur=0
    return n+cur
pat=re.compile(r'^(- )(\d{4}-\d{2}-\d{2})（([零〇一二兩三四五六七八九十百千]+)）')
for line in sys.stdin:
    line=line.rstrip('\n')
    m=pat.match(line)
    if m: line=f"- #{conv(m.group(3))} · {m.group(2)} "+line[m.end():]
    print(line)
