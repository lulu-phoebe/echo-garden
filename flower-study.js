// All geometry is generated in code; no image texture or image sampling.
let groups=[],bloom,glow,age=0,view=.35,lastView=.35,R,ox,oy;
const colors=['#123074','#174CBE','#2162E5','#367FF5','#5798FF','#86BAFF','#B2D8FF','#E6F5FF','#FFFFFF'];
function setup(){pixelDensity(1);createCanvas(windowWidth,windowHeight);randomSeed(47);noiseSeed(19);makeGeometry();configure();document.querySelector('#replay').onclick=()=>age=0;document.querySelector('#save').onclick=()=>saveCanvas('particle-flower','png');}
function add(x,y,z,c,size,birth){groups[c].push({x,y,z,size,birth,seed:random(TWO_PI)});}
function makeGeometry(){groups=colors.map(()=>[]);const angles=[-1.72,-.46,.72,2.10,3.40],lengths=[1.08,1.12,.94,.97,1.04];
 function petal(p,u,v){const a=angles[p],rad=.04+u*lengths[p],w=.54*sqrt(max(0,1-pow((u-.52)/.52,2)))*(1+.055*sin(v*22+u*18));const side=v*w;
 const fold=.045*sin(v*27+u*6)*u+.018*sin(u*24+v*4)*u;
 const z=.16*u*u+.11*pow(abs(v),2)*u+fold;
 return {x:cos(a)*rad-sin(a)*side,y:sin(a)*rad+cos(a)*side,z};}
 for(let p=0;p<5;p++){
  for(let i=0;i<12000;i++){const u=sqrt(random()),v=random(-1,1),q=petal(p,u,v),edge=abs(v)>.94||u>.97,light=noise(u*8,v*5,p*4);const c=edge?6:constrain(floor(1+light*3+pow(1-u,3)*3),0,7);add(q.x,q.y,q.z,c,random(.30,.72),.13+u*.29+p*.009);}
  for(let i=0;i<220;i++){const u=sqrt(random()),v=random(-1,1),q=petal(p,u,v);add(q.x,q.y,q.z,6,random(.6,1.1),.13+u*.29);}for(let vein=0;vein<45;vein++)for(let i=0;i<115;i++){const u=i/114,v=(vein/44*2-1)*(1-.3*(1-u)),q=petal(p,u,v);add(q.x,q.y,q.z,vein%5===0?7:5,vein%5===0?.62:.32,.13+u*.29+p*.009);}
  for(let i=0;i<250;i++){const u=i/249;for(const v of [-1,1]){const q=petal(p,u,v);add(q.x,q.y,q.z,7,.55,.13+u*.29);}}
 }
 for(let i=0;i<1200;i++){const a=random(TWO_PI),r=sqrt(random())*.08;add(cos(a)*r,sin(a)*r,random(.01,.07),7,.6,.12);}
 for(let i=0;i<42;i++){const a=i*2.3999,len=random(.18,.43),tip={x:cos(a)*len,y:sin(a)*len,z:random(.12,.24)};for(let j=0;j<55;j++){const u=j/54;add(tip.x*u,tip.y*u,tip.z*u+sin(u*PI)*.035,7,.55,.16+u*.27);}for(let j=0;j<12;j++)add(tip.x+randomGaussian()*.005,tip.y+randomGaussian()*.005,tip.z,8,1.15,.43);}
 for(let i=0;i<2800;i++){const u=random();add(.055*sin(u*3)+randomGaussian()*.002,.09+u*2.4,-.01, i%4?5:7,.45,(1-u)*.15);}
 for(let side of [-1,1])for(let i=0;i<1800;i++){const u=random(),v=random(-1,1);add(side*u*.48,1.3+(side===1?.45:0)-u*.32+v*sin(PI*u)*.08,-.03,i%4?2:5,.4,.03+u*.15);}
}
function configure(){R=min(height*.35,width*.30);ox=width*.61;oy=height*.47;bake();}
function project(p){return {x:p.x*R,y:(p.y*(1-view*.4)-p.z*view)*R};}
function bake(){if(bloom)bloom.remove();if(glow)glow.remove();bloom=createGraphics(ceil(R*2.9),ceil(R*4));bloom.pixelDensity(1);const ctx=bloom.drawingContext;ctx.translate(R*1.45,R*1.25);for(let c=0;c<groups.length;c++){ctx.fillStyle=colors[c];for(const p of groups[c]){const q=project(p),s=max(.25,p.size*R/150);ctx.fillRect(q.x,q.y,s,s);}}glow=createGraphics(bloom.width,bloom.height);glow.pixelDensity(1);glow.drawingContext.filter='blur(5px)';glow.image(bloom,0,0);}
function draw(){age+=min(deltaTime/1000,.05);background(2,4,10);view=lerp(view,constrain(mouseX/width,0,1)*.7+.05,.07);if(abs(view-lastView)>.025){lastView=view;bake();}const ctx=drawingContext;
 const h=ctx.createRadialGradient(ox,oy,0,ox,oy,R*1.4);h.addColorStop(0,'rgba(113,172,255,.25)');h.addColorStop(.14,'rgba(44,110,234,.12)');h.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=h;ctx.fillRect(ox-R*1.4,oy-R*1.4,R*2.8,R*2.8);
 if(age>.63){ctx.globalAlpha=.35;image(glow,ox-R*1.45,oy-R*1.25);ctx.globalAlpha=1;image(bloom,ox-R*1.45,oy-R*1.25);return;}
 for(let c=0;c<groups.length;c++){ctx.fillStyle=colors[c];for(const p of groups[c]){let t=constrain((age-p.birth)/.15,0,1);if(!t)continue;t=t*t*(3-2*t);const q=project(p);ctx.globalAlpha=t;const s=max(.25,p.size*R/150);ctx.fillRect(ox+q.x+sin(p.seed)*R*.13*(1-t),oy+q.y+R*.12*(1-t),s,s);}}ctx.globalAlpha=1;
}
function keyPressed(){if(key==='r'||key==='R')age=0;if(key==='s'||key==='S')saveCanvas('particle-flower','png');}
function windowResized(){resizeCanvas(windowWidth,windowHeight);configure();}

