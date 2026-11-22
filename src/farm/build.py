import os
here=os.path.dirname(os.path.abspath(__file__))
r=lambda f: open(os.path.join(here,f)).read()
kit=r('../garden/soundkit.js')
head='''<meta name="claude:viewport-fit-sides" content="cover">
<title>Pips gårdsbutik</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap">
<style>
'''+r('style.css')+'</style>\n'
three='<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n'
out=head+r('body.html')+three+'<script>\n'+kit+'\n</script>\n<script>\n'+r('../sfx.js')+'\n</script>\n<script>\n'+r('game.js')+'\n</script>\n'
open(os.path.join(here,'farm-shop.html'),'w').write(out)
t=out.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','../game/vend/package/build/three.min.js').replace('rel="stylesheet"','rel="x"')
open(os.path.join(here,'test.html'),'w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+t+'</body></html>')
print(len(out))
