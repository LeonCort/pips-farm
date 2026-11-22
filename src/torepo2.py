import sys; src,dst,R=sys.argv[1:]
body=open(src).read().replace('<meta name="claude:viewport-fit-sides" content="cover">\n','')
body=body.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','three.min.js')
head=open(R+'/head.part').read()
i=body.index('</style>')+len('</style>')
open(dst,'w').write(head+body[:i]+'\n</head>\n<body>\n'+body[i:]+'\n</body>\n</html>\n')
