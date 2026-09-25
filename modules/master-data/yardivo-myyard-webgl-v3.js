
(function(){
'use strict';
let engine=null,loading=null;
const CDN='https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function data(){try{return Array.isArray(announcements)?announcements:[]}catch(_){return[]}}
function warehouse(){try{return activeWarehouse&&activeWarehouse!=='ALL'?activeWarehouse:yardivoCanonicalWarehouseV583()}catch(_){return''}}
function selectedDate(){return document.querySelector('#myYard .myy-date')?.value||today()}
function rampCount(w){try{return Math.max(0,Number(YardivoRampConfig?.count?.(w)??WAREHOUSES?.[w]?.ramps??0))}catch(_){return 0}}
function phase(a,d){
 const s=String(a?.status||'').toLowerCase();
 /* Status is authoritative for the selected appointment date.
    Never force historical days back to U DOLASKU. */
 if(a?.rejectedAt||s.includes('odbij'))return'rejected';
 if(a?.gateOutAt||a?.completedAt||a?.receivedAt||s.includes('zaprim')||s.includes('završ')||s.includes('izašao')||s.includes('izasao'))return'done';
 if(a?.dockArrivalAt||s.includes('rampi')||s.includes('dock'))return'dock';
 if(a?.yardArrivalAt||s.includes('dvori')||s.includes('ček'))return'yard';
 if(a?.gateCheckedAt||a?.actualDate||a?.actualTime||s.includes('porta')||s.includes('gate')||s.includes('ulaz'))return'gate';
 return'incoming'
}
function ensureHost(){
 const stage=document.querySelector('#myYard .myy-stage');if(!stage)return null;
 let host=document.getElementById('yardivoMyYardWebGL');
 if(!host){
  host=document.createElement('div');host.id='yardivoMyYardWebGL';
  host.innerHTML='<div class="my3-load">YARDIVO · UČITAVAM WEBGL 3D ENGINE…</div><div class="my3-hud"><i></i><b>MY YARD · WEBGL DIGITAL TWIN</b><span>REAL-TIME</span></div><div class="my3-legend"><b>STATUS</b> · U DOLASKU / PORTA / DVORIŠTE / RAMPA / IZLAZ</div>';
  stage.prepend(host);
 }
 return host
}
async function loadThree(){
 if(window.__YARDIVO_THREE_MODULE__)return window.__YARDIVO_THREE_MODULE__;
 if(loading)return loading;
 loading=import(CDN).then(T=>{window.__YARDIVO_THREE_MODULE__=T;return T});
 return loading;
}
function canvasLabel(T,text,color='#eaf3ed',border='#3d9c64'){
 const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');
 x.fillStyle='rgba(5,10,7,.88)';x.roundRect(5,5,502,86,14);x.fill();
 x.strokeStyle=border;x.lineWidth=3;x.stroke();
 x.fillStyle=color;x.font='900 29px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(String(text||'').slice(0,28),256,48);
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
 const s=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));s.scale.set(9,1.7,1);return s
}
function buildEngine(T,host){
 host.querySelector('.my3-load')?.remove();
 const scene=new T.Scene();scene.background=new T.Color(0x09100c);scene.fog=new T.FogExp2(0x09100c,.0105);
 const camera=new T.PerspectiveCamera(42,1,.1,350);
 let renderer;
 try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}
 catch(e){host.insertAdjacentHTML('beforeend','<div class="my3-error">WEBGL nije dostupan u ovom browseru.<br>My Yard ostaje dostupan nakon promjene browsera/GPU postavke.</div>');return null}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 host.appendChild(renderer.domElement);

 scene.add(new T.HemisphereLight(0xe7f0ea,0x172019,1.65));
 const sun=new T.DirectionalLight(0xffffff,2.4);sun.position.set(-32,45,24);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
 sun.shadow.camera.left=-70;sun.shadow.camera.right=70;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;scene.add(sun);
 const fill=new T.DirectionalLight(0x8dc9a5,.75);fill.position.set(35,18,30);scene.add(fill);

 const mat=(color,rough=.72,metal=.06)=>new T.MeshStandardMaterial({color,roughness:rough,metalness:metal});
 function mesh(g,m,x,y,z,shadow=true){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=shadow;scene.add(o);return o}
 function box(w,h,d,color,x,y,z,rough=.72,metal=.06){return mesh(new T.BoxGeometry(w,h,d),mat(color,rough,metal),x,y,z)}

 const ground=mesh(new T.PlaneGeometry(112,72),mat(0x29332e,.98,.01),0,0,0);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;
 // asphalt circulation road
 const road=mesh(new T.PlaneGeometry(101,19),mat(0x1c2320,.96,.01),0,.018,14,false);road.rotation.x=-Math.PI/2;
 const apron=mesh(new T.PlaneGeometry(75,15),mat(0x343e39,.94,.01),7,.022,-10,false);apron.rotation.x=-Math.PI/2;
 // lane markings
 const lineMat=new T.MeshBasicMaterial({color:0xd9d8bf});
 for(let x=-47;x<49;x+=7){const l=mesh(new T.PlaneGeometry(3.2,.15),lineMat,x,.035,14,false);l.rotation.x=-Math.PI/2}
 for(let i=0;i<8;i++){const l=mesh(new T.PlaneGeometry(.14,10),lineMat,-25+i*7.5,.036,-9,false);l.rotation.x=-Math.PI/2}

 // 42 physical truck parking bays: P1-P21 left→right, then P22-P42 left→right.
 const parkingLineMat=new T.MeshBasicMaterial({color:0xe7ece8});
 for(let row=0;row<2;row++){
   const z=2+row*6.2;
   for(let col=0;col<21;col++){
     const x=-42+col*4.25;
     const left=mesh(new T.PlaneGeometry(.10,5.1),parkingLineMat,x-1.95,.041,z,false);left.rotation.x=-Math.PI/2;
     if(col===20){const right=mesh(new T.PlaneGeometry(.10,5.1),parkingLineMat,x+1.95,.041,z,false);right.rotation.x=-Math.PI/2}
     const back=mesh(new T.PlaneGeometry(3.9,.10),parkingLineMat,x,.042,z-2.55,false);back.rotation.x=-Math.PI/2;
     const lab=canvasLabel(T,'P'+(row*21+col+1),'#f2f7f3','#7f9b89');lab.scale.set(2.1,.42,1);lab.position.set(x,.12,z-2.15);lab.material.depthTest=false;scene.add(lab);
   }
 }

 // warehouse: upright detailed block
 box(70,9,14,0xd6ddda,8,4.5,-24,.68,.10);
 const roof=box(71,.35,15,0xf0f3f1,8,9.1,-24,.45,.18);
 // roof skylights
 for(let x=-20;x<=34;x+=9)box(5,.08,2.2,0x9db5b0,x,9.31,-24,.28,.28);
 // office volume
 box(13,5.5,9,0x66736c,37,2.75,-13.5,.8,.04);
 // dock bumpers / doors
 const staticObjects=[];
 function rebuildRamps(n){
   staticObjects.splice(0).forEach(o=>scene.remove(o));
   for(let i=1;i<=n;i++){
     const x=-24+(i-1)*6.0;
     const door=box(5.1,4.4,.22,0x1a201d,x,2.25,-16.9,.65,.12);staticObjects.push(door);
     const dock=box(5.5,.55,3.1,0x0d110f,x,.28,-15.3,.7,.15);staticObjects.push(dock);
     const bumper1=box(.35,.8,.5,0xc62f36,x-2.15,.55,-13.7,.6,.08),bumper2=box(.35,.8,.5,0xc62f36,x+2.15,.55,-13.7,.6,.08);staticObjects.push(bumper1,bumper2);
     const lab=canvasLabel(T,'R'+i);lab.scale.set(3.2,.64,1);lab.position.set(x,5.25,-16.6);scene.add(lab);staticObjects.push(lab);
   }
 }
 // gatehouse + barriers
 box(8,4.2,6.5,0x46524c,-39,2.1,24,.76,.06);
 box(8.5,.25,.28,0xe5e8e5,-31,1.1,21,.45,.12);
 box(8.5,.25,.28,0xe5e8e5,-31,1.1,27,.45,.12);
 const gateLab=canvasLabel(T,'PORTA','#f7e7ae','#c9a747');gateLab.scale.set(4.6,.88,1);gateLab.position.set(-39,5.2,24);scene.add(gateLab);
 const inLab=canvasLabel(T,'ULAZ','#d9efe1','#4eb47a');inLab.scale.set(4,.78,1);inLab.position.set(-48,2.4,14);scene.add(inLab);
 const outLab=canvasLabel(T,'IZLAZ','#f1d9da','#c95a60');outLab.scale.set(4,.78,1);outLab.position.set(-48,2.4,29);scene.add(outLab);
 // bollards / lamps
 for(let x=-42;x<=42;x+=12){const pole=box(.18,5,.18,0x5b6660,x,2.5,5,.55,.45);const lamp=box(1.1,.18,.5,0xe6e3c7,x,5,5,.3,.3);staticObjects.push(pole,lamp)}

 const trucks=new Map(),ray=new T.Raycaster(),mouse=new T.Vector2();
 function truck(a){
   const g=new T.Group();g.userData={a,opacity:1};
   const trailer=new T.Mesh(new T.BoxGeometry(7.4,2.6,2.55),mat(0xe8ece9,.42,.14));trailer.position.set(-1.25,1.7,0);trailer.castShadow=true;g.add(trailer);
   const side=new T.Mesh(new T.BoxGeometry(7.1,1.45,.04),mat(0xf7f8f7,.36,.12));side.position.set(-1.25,1.8,1.295);g.add(side);
   const cab=new T.Mesh(new T.BoxGeometry(2.5,2.85,2.45),mat(0xf3f5f3,.38,.17));cab.position.set(3.65,1.48,0);cab.castShadow=true;g.add(cab);
   const glass=new T.Mesh(new T.BoxGeometry(.06,1.15,1.75),mat(0x233942,.18,.3));glass.position.set(4.93,1.9,0);g.add(glass);
   const chassis=new T.Mesh(new T.BoxGeometry(8.7,.42,2.15),mat(0x151a17,.88,.16));chassis.position.set(.2,.48,0);g.add(chassis);
   const wg=new T.CylinderGeometry(.49,.49,.4,20),wm=mat(0x090b0a,.9,.04);
   [[-3.2,.5,-1.25],[-3.2,.5,1.25],[1.65,.5,-1.25],[1.65,.5,1.25],[3.7,.5,-1.25],[3.7,.5,1.25]].forEach(p=>{const w=new T.Mesh(wg,wm);w.rotation.x=Math.PI/2;w.position.set(...p);w.castShadow=true;g.add(w)});
   const label=canvasLabel(T,a.supplier||'DOBAVLJAČ');label.position.set(0,4.1,0);g.add(label);
   g.traverse(o=>{if(o.isMesh)o.userData.a=a});return g
 }
 function target(a,i,n,d){
   const q=phase(a,d),dock=Math.max(1,Math.min(n,Number(a.dock)||1)),rx=-24+(dock-1)*6.0;
   if(q==='dock')return{q,p:new T.Vector3(rx,.05,-11.9),r:-Math.PI/2,op:1};
   if(q==='yard'){const raw=String(a.yardPosition||'').toUpperCase(),m=/^P([1-9]|[1-3][0-9]|4[0-2])$/.exec(raw),pi=m?Number(m[1])-1:(i%42);return{q,p:new T.Vector3(-42+(pi%21)*4.25,.05,2+Math.floor(pi/21)*6.2),r:-Math.PI/2,op:1};}
   if(q==='gate')return{q,p:new T.Vector3(-31+(i%2)*8,.05,20+(i%2)*5.5),r:-Math.PI/2,op:1};
   if(q==='done'||q==='rejected')return{q,p:new T.Vector3(-55,.05,29-(i%3)*4),r:Math.PI,op:0};
   return{q,p:new T.Vector3(-62-(i%4)*10,.05,10+(i%5)*4.2),r:-Math.PI/2,op:1}
 }
 let currentRamps=0,currentWh='',yaw=-.64,pitch=.70,dist=82,drag=false,moved=false,px=0,py=0;
 function cameraApply(){const cp=Math.cos(pitch);camera.position.set(Math.sin(yaw)*cp*dist,Math.sin(pitch)*dist,Math.cos(yaw)*cp*dist);camera.lookAt(0,0,-2)}
 cameraApply();
 let dragPointerId=null;
 const stop=e=>{
   drag=false;
   const id=e?.pointerId??dragPointerId;
   dragPointerId=null;
   try{if(id!=null&&renderer.domElement.hasPointerCapture?.(id))renderer.domElement.releasePointerCapture(id)}catch(_){}
 };
 renderer.domElement.addEventListener('pointerdown',e=>{
   if(e.button!==0)return;
   drag=true;moved=false;dragPointerId=e.pointerId;px=e.clientX;py=e.clientY;
   try{renderer.domElement.setPointerCapture?.(e.pointerId)}catch(_){}
 });
 renderer.domElement.addEventListener('pointermove',e=>{
   if(!drag)return;
   /* If the physical left button is no longer down, terminate rotation immediately.
      This prevents a lost pointer-up from leaving the camera "stuck" to the mouse. */
   if((e.buttons&1)!==1){stop(e);return}
   const dx=e.clientX-px,dy=e.clientY-py;
   if(Math.abs(dx)+Math.abs(dy)>3)moved=true;
   /* Horizontal rotation is intentionally UNBOUNDED: My Yard can orbit full 360°
      repeatedly in either direction. Pitch alone is limited so the camera cannot flip. */
   yaw-=dx*.009;
   if(Math.abs(yaw)>Math.PI*200)yaw%=Math.PI*2;
   pitch=Math.max(.28,Math.min(1.18,pitch+dy*.005));
   px=e.clientX;py=e.clientY;cameraApply()
 });
 renderer.domElement.addEventListener('pointerup',stop);
 renderer.domElement.addEventListener('pointercancel',stop);
 renderer.domElement.addEventListener('lostpointercapture',stop);
 window.addEventListener('pointerup',stop,true);
 window.addEventListener('blur',()=>stop(),true);
 renderer.domElement.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();dist=Math.max(35,Math.min(125,dist+e.deltaY*.055));cameraApply()},{passive:false});
 renderer.domElement.addEventListener('click',e=>{
   if(moved)return;const r=renderer.domElement.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(mouse,camera);
   const objs=[];trucks.forEach(g=>g.traverse(o=>{if(o.isMesh)objs.push(o)}));const hit=ray.intersectObjects(objs,true)[0];const a=hit?.object?.userData?.a;
   if(a){const legacy=document.querySelector(`#myYard .myy-truck[data-id="${CSS.escape(String(a.id))}"]`);legacy?.click()}
 });
 const ro=new ResizeObserver(()=>{const w=Math.max(10,host.clientWidth),hh=Math.max(10,host.clientHeight);renderer.setSize(w,hh,false);camera.aspect=w/hh;camera.updateProjectionMatrix()});ro.observe(host);
 function sync(){
   const w=warehouse(),d=selectedDate(),n=rampCount(w);
   if(w!==currentWh||n!==currentRamps){rebuildRamps(n);currentWh=w;currentRamps=n}
   const list=data().filter(a=>(a.warehouse||yardivoCanonicalWarehouseV583())===w&&a.date===d).slice(-80),alive=new Set();
   list.forEach((a,i)=>{const id=String(a.id);alive.add(id);let g=trucks.get(id);const t=target(a,i,n,d);
     if(!g){g=truck(a);g.position.copy(t.q==='incoming'?t.p:t.p.clone().add(new T.Vector3(-15,0,12)));g.rotation.y=t.r;scene.add(g);trucks.set(id,g)}
     g.userData.a=a;g.userData.target=t.p;g.userData.targetRot=t.r;g.userData.targetOpacity=t.op;g.userData.phase=t.q;
     g.traverse(o=>{if(o.isMesh)o.userData.a=a});
   });
   trucks.forEach((g,id)=>{if(!alive.has(id)){scene.remove(g);trucks.delete(id)}})
 }
 function loop(){
   trucks.forEach(g=>{
     if(g.userData.target)g.position.lerp(g.userData.target,.055);
     if(g.userData.targetRot!=null){let d=g.userData.targetRot-g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));g.rotation.y+=d*.055}
     const want=g.userData.targetOpacity??1;g.userData.opacity+=(want-g.userData.opacity)*.045;
     g.visible=g.userData.opacity>.025;
     g.traverse(o=>{if(o.material){o.material.transparent=g.userData.opacity<.995;o.material.opacity=g.userData.opacity}});
   });
   renderer.render(scene,camera);requestAnimationFrame(loop)
 }
 sync();loop();
 return{sync,renderer,scene,camera}
}
async function boot(){
 const root=document.getElementById('myYard');if(!root)return;
 const host=ensureHost();if(!host)return;
 try{
   const T=await loadThree();
   if(!engine){engine=buildEngine(T,host);window.__YARDIVO_MYYARD_ENGINE__=engine}
   engine?.sync();
 }catch(err){
   console.error('YARDIVO My Yard WebGL',err);
   host.querySelector('.my3-load')?.remove();
   if(!host.querySelector('.my3-error'))host.insertAdjacentHTML('beforeend','<div class="my3-error">3D engine se nije mogao učitati.<br>Provjeri internet/CDN pristup i ponovno otvori MY YARD.</div>');
 }
}
document.addEventListener('click',e=>{if(e.target.closest('[data-view="myYard"],[data-home-target="myYard"]'))setTimeout(boot,80)},true);
window.addEventListener('load',()=>setTimeout(boot,1000));
setInterval(()=>{if(document.getElementById('myYard')?.classList.contains('active'))boot()},1200);
window.YardivoMyYardWebGL={boot,refresh:()=>engine?.sync()};
})();
