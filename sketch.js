const palettes=[{name:'冷蓝',petal:'#9DCEFF',deep:'#3479FF',core:'#DAF1B9'},{name:'薰紫',petal:'#D1BCFF',deep:'#7650D8',core:'#F4E6B4'},{name:'新绿',petal:'#C9FCA4',deep:'#488F72',core:'#F7EAB2'}];
let canvas,unit,flowers=[],backgroundFlowers=[],trail=[],dust=[],grain,clock=0,scheme=0,paused=false,lastPlant=0,lastMouse=null,lastTrail=null,hasMoved=false,toastTimer,colorTable=[];
let revealFront=0; const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
function setup(){pixelDensity(1);canvas=createCanvas(windowWidth,windowHeight);canvas.parent('poster');noiseSeed(81);resetScene();document.querySelectorAll('[data-palette]').forEach(b=>b.onclick=()=>setPalette(+b.dataset.palette));document.querySelector('#replay').onclick=replay;document.querySelector('#pause').onclick=togglePause;document.querySelector('#save').onclick=exportPoster;document.querySelector('#info').onclick=()=>showNotes(document.querySelector('#notes').hidden);document.querySelector('#close').onclick=()=>showNotes(false);}
function buildColors(){const src=['#123074','#174CBE','#2162E5','#367FF5','#5798FF','#86BAFF','#B2D8FF','#E6F5FF','#FFFFFF'];colorTable=src.map(hex=>{if(!scheme)return hex;const c=color(hex),r=red(c),g=green(c),b=blue(c);return scheme===1?color(min(255,r+(b-r)*.6),g*.85,b).toString():color(g*.82,b,r+(g-r)*.65).toString();});colorTable[13]=palettes[scheme].petal;colorTable[14]='#FFFFFF';}
function addSample(f,x,y,tone,birth,size=1){f.points.push({x,y,tone,birth,size,seed:random(TWO_PI)});}
function makeFlower(x,y,r,count,start,tilt=0){const f={x,y,r,start,points:[],sprite:null};const d=r>.10?1:r>.045?.28:.035,veinCount=Math.max(9,Math.floor(24*Math.sqrt(d))),veinSteps=Math.max(22,Math.floor(115*Math.sqrt(d))),edgeSteps=Math.max(35,Math.floor(250*Math.sqrt(d))),stamenCount=r>.045?42:16,stamenSteps=r>.045?55:18,rotation=random(-.4,.4),pitch=constrain(tilt,.35,1.2);function add(px,py,pz,c,size,birth){if(py<1){const xx=px*cos(rotation)-py*sin(rotation);py=px*sin(rotation)+py*cos(rotation);px=xx;}addSample(f,px,py*(1-pitch*.42)-pz*pitch,c,birth*3.5,size);} const angles=[-1.72,-.46,.72,2.10,3.40],lengths=[1.08,1.12,.94,.97,1.04];
 function petal(p,u,v){const a=angles[p],rad=.04+u*lengths[p],w=.54*sqrt(max(0,1-pow((u-.52)/.52,2)))*(1+.022*sin(v*22+u*18));const side=v*w;
 const fold=.045*sin(v*27+u*6)*u+.018*sin(u*24+v*4)*u;
 const z=.36*u*u+.18*pow(abs(v),2)*u+fold;
 return {x:cos(a)*rad-sin(a)*side,y:sin(a)*rad+cos(a)*side,z};}
 for(let p=0;p<5;p++){
  for(let i=0;i<Math.floor(22000*d);i++){const u=sqrt(random()),v=random(-1,1),q=petal(p,u,v),edge=abs(v)>.94||u>.97,light=noise(u*8,v*5,p*4);const c=edge?6:constrain(floor(3+light*3+pow(1-u,3)*1),0,7);add(q.x,q.y,q.z,c,random(.65,1.2),.13+u*.29+p*.009);}
  for(let i=0;i<Math.max(12,Math.floor(220*d));i++){const u=sqrt(random()),v=random(-1,1),q=petal(p,u,v);add(q.x,q.y,q.z,6,random(.6,1.1),.13+u*.29);}for(let vein=0;vein<veinCount;vein++)for(let i=0;i<veinSteps;i++){const u=i/(veinSteps-1),v=(vein/(veinCount-1)*2-1)*(1-.3*(1-u)),q=petal(p,u,v);add(q.x,q.y,q.z,vein%5===0?6:4,vein%5===0?.38:.22,.13+u*.29+p*.009);}
  for(let i=0;i<edgeSteps;i++){const u=i/(edgeSteps-1);for(const v of [-1,1]){const q=petal(p,u,v);add(q.x,q.y,q.z,6,.4,.13+u*.29);}}
 }
 for(let i=0;i<Math.max(70,Math.floor(1200*d));i++){const a=random(TWO_PI),r=sqrt(random())*.08;add(cos(a)*r,sin(a)*r,random(.01,.07),7,.6,.12);}
 for(let i=0;i<stamenCount;i++){const a=i*2.3999,len=random(.18,.43),tip={x:cos(a)*len,y:sin(a)*len,z:random(.12,.24)};for(let j=0;j<stamenSteps;j++){const u=j/(stamenSteps-1);add(tip.x*u,tip.y*u,tip.z*u+sin(u*PI)*.035,7,.55,.16+u*.27);}for(let j=0;j<4;j++)add(tip.x+randomGaussian()*.005,tip.y+randomGaussian()*.005,tip.z,8,1.15,.43);}
 for(let i=0;i<0;i++){const u=random();add(.18*sin(u*4)+randomGaussian()*.002,.09+u*2.4,-.01, i%4?5:7,.45,(1-u)*.15);}
 for(let side of [-1,1])for(let i=0;i<Math.max(90,Math.floor(1800*d));i++){const u=random(),v=random(-1,1);add(side*u*.48,1.3+(side===1?.45:0)-u*.32+v*sin(PI*u)*.08,-.03,i%4?2:5,.4,.03+u*.15);}
return f;}
function flowerSprite(f){if(f.sprite)f.sprite.remove();let R=Math.max(18,Math.min(190,f.r*unit)),g=createGraphics(Math.ceil(R*2.6),Math.ceil(R*5.6));g.pixelDensity(1);let c=g.drawingContext;c.translate(R*1.3,R*1.15);for(let tone=0;tone<9;tone++){c.fillStyle=colorTable[tone];for(const a of f.points){if(a.tone!==tone)continue;let s=Math.max(.24,a.size*R/150);c.fillRect(a.x*R,a.y*R,s,s);}}f.sprite=g;f.spriteR=R;}
function dispose(){for(let f of [...flowers,...backgroundFlowers])if(f.sprite)f.sprite.remove();if(grain)grain.remove();}
function resetScene(){dispose();randomSeed(42);unit=Math.min(height,width*.70);buildColors();flowers=[];backgroundFlowers=[];trail=[];lastMouse=null;lastTrail=null;clock=0;hasMoved=false;lastPlant=-1;revealFront=0;buildGarden();
dust=Array.from({length:650},()=>({x:random(width),y:random(height*.35,height),seed:random(TWO_PI),size:random(.5,2.1)}));grain=createGraphics(width,height);grain.pixelDensity(1);grain.strokeWeight(1);for(let i=0;i<width*height/75;i++){grain.stroke(255,random(3,14));grain.point(random(width),random(height));}}
function draw(){if(!paused)clock+=Math.min(deltaTime/1000,.08);const p=palettes[scheme],ctx=drawingContext;background(2,4,8);
for(const f of backgroundFlowers){let reveal=ease(clock/2.2);ctx.globalAlpha=f.opacity*reveal;ctx.filter=f.blur?'blur('+f.blur+'px)':'none';let R=f.spriteR,s=f.r*unit/R;image(f.sprite,f.x*width-R*1.3*s,f.y*height-R*1.15*s,f.sprite.width*s,f.sprite.height*s);}ctx.filter='none';ctx.globalAlpha=1;
for(const a of dust){let x=a.x+sin(clock*.22+a.seed)*18,y=a.y+cos(clock*.17+a.seed)*8;let c=color(p.petal);c.setAlpha(30+40*sin(a.seed+clock)*sin(a.seed+clock));noStroke();fill(c);circle(x,y,a.size);}
drawMeadow(p);drawStems(p);drawTrail(p);for(const f of flowers)renderFlower(f,p);drawBokeh(p);image(grain,0,0);typography(p);}
function renderFlower(f,p){let age=clock-f.start;if(age<0)return;let R=f.r*unit,x=f.x*width+sin(clock*.52+f.x*9)*R*.025,y=f.y*height;const ctx=drawingContext;let halo=ctx.createRadialGradient(x,y,0,x,y,R*1.4);halo.addColorStop(0,rgba(p.petal,.16*ease(age/.45)));halo.addColorStop(1,rgba(p.petal,0));ctx.fillStyle=halo;ctx.fillRect(x-R*1.4,y-R*1.4,R*2.8,R*2.8);
if(age>.64){if(!f.sprite)flowerSprite(f);let s=R/f.spriteR;if(f.r>.045){ctx.globalAlpha=.3*(f.opacity??1);ctx.filter='blur(3px)';image(f.sprite,x-R*1.3,y-R*1.15,f.sprite.width*s,f.sprite.height*s);}ctx.globalAlpha=f.opacity??1;ctx.filter=f.blur?'blur('+f.blur+'px)':'none';image(f.sprite,x-R*1.3,y-R*1.15,f.sprite.width*s,f.sprite.height*s);ctx.globalAlpha=1;ctx.filter='none';return;}
for(let tone=0;tone<9;tone++){ctx.fillStyle=colorTable[tone];for(const a of f.points){if(a.tone!==tone)continue;let g=ease((age*4.5-a.birth)/.45);if(!g)continue;ctx.globalAlpha=g*(f.opacity??1);let xx=x+(a.x+sin(a.seed)*.20*(1-g))*R,yy=y+(a.y+.22*(1-g))*R,s=Math.max(.24,a.size*R/150);ctx.fillRect(xx,yy,s,s);}}ctx.globalAlpha=1;}
function drawTrail(p){const ctx=drawingContext;let points=trail.filter(a=>clock-a.t<3.8);trail=points;ctx.save();ctx.shadowColor=p.petal;ctx.shadowBlur=8;for(let i=1;i<points.length;i++){let a=points[i-1],b=points[i],alpha=ease(1-(clock-b.t)/3.8);ctx.strokeStyle=rgba(p.petal,alpha*.75);ctx.lineWidth=1.05;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}ctx.shadowBlur=0;for(let a of points){let alpha=ease(1-(clock-a.t)/3.8);ctx.fillStyle=rgba('#FFFFFF',alpha*.9);for(let j=0;j<3;j++){let xx=a.x+sin(j*3.7+a.t*4)*5,yy=a.y+cos(j*2.6+a.t*6)*5;ctx.fillRect(xx,yy,1,1);}}ctx.restore();if(hasMoved&&mouseX>=0&&mouseX<width&&mouseY>=0&&mouseY<height){ctx.save();ctx.shadowColor=p.petal;ctx.shadowBlur=16;noStroke();fill('#F2FBFF');circle(mouseX,mouseY,5);ctx.restore();noFill();stroke(157,206,255,80);strokeWeight(.7);circle(mouseX,mouseY,22);}}
function drawBokeh(p){const ctx=drawingContext;for(let i=0;i<28;i++){let x=noise(i*9)*width,y=height*(.83+noise(i*7)*.2),r=unit*(.004+noise(i*4)*.012);let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(i%3===0?'#FFFFFF':p.deep,.5));g.addColorStop(1,rgba(p.petal,0));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}}
function typography(p){const m=width*.055,U=unit;noStroke();textAlign(LEFT,TOP);fill('#E8F1FA');textFont('SimSun');textSize(Math.min(U*.085,width*.09));text('一触即生',m,height*.10);textFont('Arial');textSize(U*.015);fill(145,182,218);text('G R O W   W H E R E   Y O U   T O U C H',m,height*.215);textSize(U*.010);fill(85,119,150);text('PARTICLES / PLANTS / POSSIBILITY',m,height*.272);textAlign(RIGHT,TOP);text('ECHO / INTERACTIVE BOTANICAL STUDY',width-m,height*.055);textAlign(LEFT,TOP);
if(!hasMoved&&clock>2){const x=width*.60,y=height*.45;stroke(174,213,244,130);strokeWeight(.6);line(x,y,x+U*.045,y-U*.045);line(x+U*.045,y-U*.045,x+U*.21,y-U*.045);noStroke();fill(172,198,218);textSize(U*.012);text('移动鼠标，种下你的花园',x+U*.055,y-U*.07);}
textAlign(RIGHT,TOP);fill(80,111,142);textSize(U*.010);text('NATURE × CODE × YOU',width-m,height*.86);textAlign(LEFT,TOP);}
function rgba(hex,a){return 'rgba('+parseInt(hex.slice(1,3),16)+','+parseInt(hex.slice(3,5),16)+','+parseInt(hex.slice(5,7),16)+','+a+')';}
function canPlant(){return !paused&&document.querySelector('#notes').hidden&&mouseX>10&&mouseX<width-10&&mouseY>10&&mouseY<height-10&&!(mouseX<width*.40&&mouseY<height*.30)&&!document.querySelector('.tools').matches(':hover');}
function placeFlower(x,y,big=false){let f=makeFlower(x/width,y/height,big?.13:random(.03,.065),big?7600:1800,clock-.1,random(.15,.7));flowers.push(f);if(flowers.length>140){let old=flowers.splice(0,1)[0];if(old?.sprite)old.sprite.remove();}}
function gardenFlower(x,y,r,depth=1,bud=false){
  const f=makeFlower(constrain(x,15,width-15)/width,constrain(y,20,height*.91)/height,r,r>.07?6000:900,clock-.13+random(0,.06),random(.7,1.2));
  f.opacity=depth;f.blur=depth<.5?1.5:0;
  const lean=random(-.26,.26),stemLength=random(.85,1.5),shape=random(.83,1.15);
  for(const a of f.points){
    if(false){a.x+=lean*a.y*a.y*.3;a.y*=stemLength;}
    else {a.x*=shape;if(bud){a.x*=.24;a.y*=.65;}}
    
  }
  f.start=Infinity;flowers.push(f);
}
function buildGarden(){
  // The final composition is predetermined. Moving the pointer only awakens it.
  for(let i=0;i<230;i++)gardenFlower(random(.02,.99)*width,random(.48,.95)*height,random(.009,.025),random(.5,.85),i%4===0);
  for(let i=0;i<70;i++)gardenFlower(random(.02,.99)*width,random(.55,.91)*height,random(.02,.04),random(.7,1),i%7===0);
  for(let i=0;i<12;i++)gardenFlower(random(.02,.99)*width,random(.91,1.0)*height,random(.03,.065),.35);const accents=[[.10,.53,.062],[.30,.64,.045],[.40,.48,.052],[.52,.37,.068],[.68,.58,.082],[.82,.28,.18],[.94,.63,.065]];
  for(const [x,y,r] of accents)gardenFlower(x*width,y*height,r,1);
  for(let i=0;i<12;i++)gardenFlower(random(.73,.97)*width,random(.29,.78)*height,random(.012,.03),.7,i%2===0);
}
function awaken(x){
  revealFront=Math.max(revealFront,constrain(x/width+.025,0,1));
  for(const f of flowers)if(f.start===Infinity&&f.x<=revealFront)f.start=clock-.12+random(0,.08);
}
function mouseMoved(){if(paused||!canPlant())return;hasMoved=true;awaken(mouseX);const here={x:mouseX,y:mouseY};if(!lastTrail||dist(here.x,here.y,lastTrail.x,lastTrail.y)>6){trail.push({...here,t:clock});lastTrail=here;}}
function mousePressed(event){if(event?.target?.closest?.('button,aside,.tools'))return;mouseMoved();}
function touchMoved(){mouseMoved();return false;}
function setPalette(i){scheme=i;buildColors();for(const f of backgroundFlowers)flowerSprite(f);for(const f of flowers){if(f.sprite){f.sprite.remove();f.sprite=null;}}document.querySelectorAll('[data-palette]').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));if(paused)redraw();}
function replay(){resetScene();if(paused){paused=false;document.querySelector('#pause').textContent='暂停 空格';loop();}}
function togglePause(){paused=!paused;document.querySelector('#pause').textContent=paused?'继续 空格':'暂停 空格';if(paused)noLoop();else loop();}
function exportPoster(){saveCanvas(canvas,'echo-touch-garden-'+(scheme+1)+'-'+Date.now(),'png');document.querySelector('#status').textContent='已保存当前帧 PNG';clearTimeout(toastTimer);toastTimer=setTimeout(()=>document.querySelector('#status').textContent='',2000);}
function showNotes(open){document.querySelector('#notes').hidden=!open;document.querySelector('#info').setAttribute('aria-expanded',String(open));}
function keyPressed(){if(key==='s'||key==='S')exportPoster();if(key==='r'||key==='R')replay();if(['1','2','3'].includes(key))setPalette(+key-1);if(key===' '){togglePause();return false;}if(keyCode===ESCAPE)showNotes(false);}
function windowResized(){resizeCanvas(windowWidth,windowHeight);resetScene();if(paused)redraw();}






function drawStems(p){const ctx=drawingContext;for(const f of flowers){const age=clock-f.start;if(age<0)continue;const grow=ease(age/.35),top=f.y*height,R=f.r*unit,bottom=min(height*1.03,top+max(R*3,height*.19)),bx=f.x*width+sin(f.x*70)*R*.8;ctx.fillStyle=rgba(p.petal,.55*(f.opacity??1));for(let i=0;i<52*grow;i++){const u=i/51,px=bx+sin(u*PI*.75)*(f.x*width-bx),py=bottom+(top-bottom)*u;ctx.fillRect(px,py,f.r>.045?.85:.5,.9);if(i>12&&i%11===0){const side=i%2?1:-1;for(let j=0;j<14;j++){const q=j/13;ctx.fillRect(px+side*q*R*.7,py-q*R*.35+sin(q*PI)*R*.05,.65,.65);}}}}}
function drawMeadow(p){const ctx=drawingContext;for(let i=0;i<320;i++){const bx=noise(i*5.7)*width,base=height*(.89+noise(i*2.1)*.17),len=unit*(.10+noise(i*7.1)*.33),bend=(noise(i*3.3)-.5)*unit*.29;if(bx/width>revealFront)continue;ctx.strokeStyle=rgba(p.petal,.20+noise(i)*.2);ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(bx,base);ctx.quadraticCurveTo(bx+bend*.4,base-len*.65,bx+bend,base-len);ctx.stroke();for(let j=0;j<25;j++){const u=j/24,px=bx+bend*u*u,py=base-len*u;ctx.fillStyle=rgba(j%4===0?'#DBF4FF':p.deep,.45);ctx.fillRect(px+sin(j*3.4)*2,py,.8,.8);if(j%6===0)for(let k=0;k<10;k++){const q=k/10;ctx.fillStyle=rgba(p.petal,.33);ctx.fillRect(px+q*(j%2?1:-1)*len*.15,py-q*len*.07,.7,.7);}}}}
