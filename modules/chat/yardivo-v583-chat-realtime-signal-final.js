
(()=>{'use strict';
if(window.__YARDIVO_CHAT_REALTIME_SIGNAL_FINAL__)return;
window.__YARDIVO_CHAT_REALTIME_SIGNAL_FINAL__=true;
let ch=null,reconnectTimer=0,refreshTimer=0;

function scheduleRefresh(kind){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>{
    if(kind==='help'||kind==='chat'){
      try{window.YardivoHelpChatV583?.refresh?.(true)}catch(_){}
      try{window.YardivoHelpChatAdminPopupsV583?.refresh?.()}catch(_){}
    }
    if(kind==='operational'||kind==='chat'){
      try{window.YardivoOperationalChatV583?.refresh?.()}catch(_){}
    }
  },80);
}

async function connect(){
  if(ch)return ch;
  const c=await window.YardivoAuth?.client?.();
  if(!c)return null;
  try{
    const session=(await c.auth.getSession())?.data?.session;
    if(session?.access_token)await c.realtime?.setAuth?.(session.access_token);
  }catch(_){}
  const next=c.channel('yardivo-chat',{config:{private:true}});
  next.on('broadcast',{event:'changed'},payload=>{
    scheduleRefresh(String(payload?.payload?.kind||'chat'));
  });
  next.subscribe(status=>{
    const st=String(status||'').toUpperCase();
    if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED'){
      if(ch===next)ch=null;
      clearTimeout(reconnectTimer);
      reconnectTimer=setTimeout(connect,5000);
    }
  });
  ch=next;
  return ch;
}

async function disconnect(){
  const c=await window.YardivoAuth?.client?.();
  const old=ch;ch=null;
  clearTimeout(reconnectTimer);
  if(old&&c){try{await c.removeChannel(old)}catch(_){}}
}

['yardivo:login','yardivo:online-ready'].forEach(ev=>{
  window.addEventListener(ev,()=>setTimeout(connect,120));
});
window.addEventListener('focus',()=>setTimeout(connect,120));
window.addEventListener('yardivo:logout',()=>{void disconnect()});
window.addEventListener('pagehide',()=>{void disconnect()},{once:true});
setTimeout(connect,1200);

window.YardivoChatRealtimeV583={
  connect,disconnect,status:()=>ch?'ACTIVE':'OFF'
};
})();
