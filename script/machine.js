// ═══════════════════════════════════════════════════
//  MACHINE.JS  v3.0  —  Payoo Core Engine
// ═══════════════════════════════════════════════════

// ─── Helpers ──────────────────────────────────────
function getValueFormInput(id){var e=document.getElementById(id);return e?e.value.trim():"";}

function getBalance(){var e=document.getElementById("balance");return Number(e?e.innerText.replace(/,/g,""):0);}

function setBalance(value){
  var targets=["balance","balance-card"];
  targets.forEach(function(id){
    var e=document.getElementById(id);
    if(!e)return;
    var start=Number(e.innerText.replace(/,/g,"")),end=Number(value),t0=null;
    function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/600,1);e.innerText=Math.round(start+(end-start)*p).toLocaleString();if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  });
  localStorage.setItem("payoo_balance",value);
}

var CORRECT_PIN=localStorage.getItem("payoo_pin")||"6427";
function validatePin(pin){return pin===CORRECT_PIN;}
function validateAmount(a,bal,deduct){
  var n=Number(a);
  if(!a||isNaN(n)||n<=0){showToast("Enter a valid amount > 0","error");return false;}
  if(deduct&&n>bal){showToast("Insufficient balance!","error");return false;}
  return true;
}
function validatePhone(n){if(!n||n.length!==11){showToast("Enter a valid 11-digit number","error");return false;}return true;}

// ─── Toast ────────────────────────────────────────
function showToast(msg,type){
  type=type||"success";
  var c=document.getElementById("toast-container");
  if(!c){c=document.createElement("div");c.id="toast-container";c.className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9998] flex flex-col gap-2 w-11/12 max-w-sm pointer-events-none";document.body.appendChild(c);}
  var colors={success:"bg-green-500",error:"bg-red-500",warning:"bg-yellow-500",info:"bg-blue-500"};
  var icons={success:"fa-circle-check",error:"fa-circle-xmark",warning:"fa-triangle-exclamation",info:"fa-circle-info"};
  var t=document.createElement("div");
  t.className="flex items-center gap-3 "+(colors[type]||"bg-blue-500")+" text-white px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 opacity-0 translate-y-4 pointer-events-auto";
  t.innerHTML='<i class="fa-solid '+(icons[type]||"fa-info")+'"></i><span class="text-sm font-semibold">'+msg+'</span>';
  c.appendChild(t);
  requestAnimationFrame(function(){t.classList.remove("opacity-0","translate-y-4");});
  setTimeout(function(){t.classList.add("opacity-0","translate-y-4");setTimeout(function(){t.remove();},300);},3000);
}

// ─── Confetti ─────────────────────────────────────
function fireConfetti(){
  var colors=["#3B25C1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316"];
  for(var i=0;i<70;i++){(function(i){setTimeout(function(){
    var p=document.createElement("div");p.className="confetti-piece";
    p.style.cssText="left:"+(Math.random()*100)+"vw;background:"+colors[Math.floor(Math.random()*colors.length)]+";width:"+(6+Math.random()*8)+"px;height:"+(6+Math.random()*8)+"px;border-radius:"+(Math.random()>0.5?"50%":"2px")+";animation-duration:"+(1.5+Math.random()*2)+"s;animation-delay:"+(Math.random()*0.4)+"s";
    document.body.appendChild(p);setTimeout(function(){p.remove();},3800);
  },i*15);})(i);}
}

// ─── Notifications ────────────────────────────────
function getNotifications(){try{return JSON.parse(localStorage.getItem("payoo_notifications")||"[]");}catch{return[];}}
function pushNotification(title,body,type){
  var list=getNotifications();
  list.unshift({id:Date.now(),title:title,body:body,type:type||"info",date:new Date().toLocaleString(),read:false});
  localStorage.setItem("payoo_notifications",JSON.stringify(list));
  updateNotifBadge();
}
function updateNotifBadge(){
  var list=getNotifications();
  var unread=list.filter(function(n){return!n.read;}).length;
  var b=document.getElementById("notif-badge");
  if(!b)return;
  if(unread>0){b.classList.remove("hidden");b.textContent=unread>99?"99+":unread;}
  else b.classList.add("hidden");
}
function renderNotifications(){
  var el=document.getElementById("notif-list");if(!el)return;
  var list=getNotifications();
  // mark all read
  list.forEach(function(n){n.read=true;});
  localStorage.setItem("payoo_notifications",JSON.stringify(list));
  updateNotifBadge();
  if(list.length===0){el.innerHTML='<p class="text-center text-gray-400 py-8"><i class="fa-solid fa-bell-slash mr-2"></i>No notifications yet</p>';return;}
  var icons={success:"fa-circle-check text-green-500",error:"fa-circle-xmark text-red-500",warning:"fa-triangle-exclamation text-yellow-500",info:"fa-circle-info text-blue-500"};
  el.innerHTML=list.map(function(n){
    return '<div class="card bg-base-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-fade-in">'+
      '<i class="fa-solid '+(icons[n.type]||icons.info)+' text-lg mt-0.5 shrink-0"></i>'+
      '<div class="flex-1"><p class="font-semibold text-sm">'+n.title+'</p><p class="text-xs text-gray-400">'+n.body+'</p><p class="text-xs text-gray-300 mt-1">'+n.date+'</p></div>'+
    '</div>';
  }).join("");
}
function clearNotifications(){
  localStorage.removeItem("payoo_notifications");
  renderNotifications();updateNotifBadge();
}

// ─── Transaction Storage ───────────────────────────
var CREDIT_TITLES=["Money Added","Bonus Credited"];
function saveTransaction(tx){
  var h=getTransactionHistory();tx.id=Date.now();h.unshift(tx);
  localStorage.setItem("payoo_transactions",JSON.stringify(h));
  updateBadge();checkSpendingLimit(tx);
  pushNotification(tx.title,tx.subtitle+(tx.amount?" — ৳"+Number(tx.amount).toLocaleString():""),tx.success?"success":"error");
  renderRecentTx();
}
function getTransactionHistory(){try{return JSON.parse(localStorage.getItem("payoo_transactions"))||[];}catch{return[];}}

// ─── Transaction Card ──────────────────────────────
function createTransactionCard(tx){
  var w=document.createElement("div");
  var color=tx.success?"green":"red";
  var icon=tx.success?"fa-circle-check":"fa-circle-xmark";
  var amtHTML=tx.amount?'<p class="text-sm mt-1 font-semibold">৳<span class="text-'+color+'-500 font-bold">'+Number(tx.amount).toLocaleString()+'</span> BDT</p>':"";
  var rcptBtn=(tx.success&&tx.amount)?'<button onclick="downloadReceipt('+tx.id+')" class="mt-2 text-xs text-blue-500 hover:underline flex items-center gap-1"><i class="fa-solid fa-file-arrow-down"></i> Receipt</button>':"";
  w.innerHTML='<div class="border border-'+color+'-300 rounded-2xl bg-base-100 w-full p-4 shadow-sm flex items-start gap-3 animate-fade-in">'+
    '<div class="bg-'+color+'-100 text-'+color+'-600 rounded-full p-2 mt-0.5 shrink-0"><i class="fa-solid '+icon+' text-base"></i></div>'+
    '<div class="flex-1 min-w-0"><p class="font-bold text-sm">'+tx.title+'</p><p class="text-xs text-gray-400">'+tx.subtitle+'</p>'+amtHTML+'<p class="text-xs text-gray-400 mt-1">'+(tx.date||new Date().toLocaleString())+'</p>'+rcptBtn+'</div>'+
  '</div>';
  return w;
}
function appendTransactionCard(card){var c=document.getElementById("Transaction-history");if(c)c.prepend(card);}

// ─── Recent Transactions (home) ───────────────────
function renderRecentTx(){
  var el=document.getElementById("recent-tx");if(!el)return;
  var h=getTransactionHistory().slice(0,3);
  if(h.length===0){el.innerHTML='<p class="text-xs text-gray-400 py-2">No recent transactions</p>';return;}
  el.innerHTML=h.map(function(tx){
    var color=tx.success?"green":"red";
    var sign=(tx.success&&CREDIT_TITLES.indexOf(tx.title)!==-1)?"+":"-";
    var amtStr=tx.amount?(sign+"৳"+Number(tx.amount).toLocaleString()):"—";
    return '<div class="flex items-center justify-between py-1.5 border-b border-base-200 last:border-0">'+
      '<div><p class="text-sm font-semibold">'+tx.title+'</p><p class="text-xs text-gray-400">'+tx.date+'</p></div>'+
      '<p class="font-bold text-sm text-'+color+'-500">'+amtStr+'</p>'+
    '</div>';
  }).join("");
}

// ─── Receipt ──────────────────────────────────────
function downloadReceipt(txId){
  var tx=getTransactionHistory().find(function(t){return t.id===txId;});
  if(!tx){showToast("Receipt not found","error");return;}
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payoo Receipt</title>'+
    '<style>body{font-family:Arial,sans-serif;max-width:400px;margin:40px auto;padding:20px}.hdr{text-align:center;border-bottom:2px solid #3B25C1;padding-bottom:16px;margin-bottom:20px}.logo{font-size:28px;font-weight:900;color:#3B25C1}.badge{display:inline-block;padding:4px 16px;border-radius:99px;font-size:13px;font-weight:700;margin-top:8px}.ok{background:#dcfce7;color:#16a34a}.fail{background:#fee2e2;color:#dc2626}.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px}.lbl{color:#888}.val{font-weight:600;color:#111}.amt{font-size:28px;font-weight:900;text-align:center;color:#3B25C1;margin:20px 0}.ftr{text-align:center;margin-top:24px;font-size:11px;color:#aaa}@media print{button{display:none}}</style></head><body>'+
    '<div class="hdr"><div class="logo">Payoo</div><div>Receipt</div><span class="badge '+(tx.success?'ok':'fail')+'">'+(tx.success?'✓ Successful':'✗ Failed')+'</span></div>'+
    '<div class="amt">৳'+Number(tx.amount||0).toLocaleString()+' BDT</div>'+
    '<div class="row"><span class="lbl">Type</span><span class="val">'+tx.title+'</span></div>'+
    '<div class="row"><span class="lbl">Details</span><span class="val">'+tx.subtitle+'</span></div>'+
    '<div class="row"><span class="lbl">Date</span><span class="val">'+tx.date+'</span></div>'+
    '<div class="row"><span class="lbl">Receipt ID</span><span class="val">#'+tx.id+'</span></div>'+
    '<div class="ftr">Thank you for using Payoo</div><br>'+
    '<button onclick="window.print()" style="width:100%;padding:12px;background:#3B25C1;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer">🖨 Print</button>'+
    '</body></html>';
  var w=window.open("","_blank");w.document.write(html);w.document.close();
}

// ─── CSV Export ───────────────────────────────────
function exportCSV(){
  var h=getTransactionHistory();
  if(h.length===0){showToast("No transactions to export","warning");return;}
  var rows=[["ID","Date","Type","Details","Amount","Status"]];
  h.forEach(function(tx){rows.push([tx.id,tx.date,tx.title,tx.subtitle,tx.amount||"",tx.success?"Success":"Failed"]);});
  var csv=rows.map(function(r){return r.map(function(v){return'"'+(v||"").toString().replace(/"/g,'""')+'"';}).join(",");}).join("\n");
  var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download="payoo-"+new Date().toISOString().slice(0,10)+".csv";a.click();
  showToast("Statement downloaded!","success");
}

// ─── Spending Limit ───────────────────────────────
function getSpendingLimit(){return Number(localStorage.getItem("payoo_spending_limit"))||0;}
function saveSpendingLimit(){
  var v=Number(document.getElementById("limit-input").value);
  if(!v||v<=0){showToast("Enter a valid limit","error");return;}
  localStorage.setItem("payoo_spending_limit",v);
  showToast("Limit set to ৳"+v.toLocaleString(),"success");
  updateLimitDisplay();updateLimitBar();
}
function getMonthlySpend(){
  var now=new Date(),m=now.getMonth(),y=now.getFullYear();
  return getTransactionHistory().reduce(function(s,tx){
    if(!tx.success||!tx.amount||CREDIT_TITLES.indexOf(tx.title)!==-1)return s;
    var d=new Date(tx.date);return(d.getMonth()===m&&d.getFullYear()===y)?s+Number(tx.amount):s;
  },0);
}
function checkSpendingLimit(tx){
  var limit=getSpendingLimit();if(!limit)return;
  if(!tx.success||!tx.amount||CREDIT_TITLES.indexOf(tx.title)!==-1)return;
  var pct=(getMonthlySpend()/limit)*100;
  if(pct>=100){showToast("⚠️ Monthly limit exceeded!","error");pushNotification("Limit Exceeded","You've spent over your ৳"+limit.toLocaleString()+" monthly limit","error");}
  else if(pct>=80){showToast("⚠️ "+Math.round(pct)+"% of monthly limit used","warning");pushNotification("Spending Alert","You've used "+Math.round(pct)+"% of your monthly limit","warning");}
  updateLimitBar();
}
function updateLimitBar(){
  var limit=getSpendingLimit(),wrap=document.getElementById("limit-bar-wrap"),bar=document.getElementById("limit-bar"),label=document.getElementById("limit-bar-label");
  if(!wrap)return;
  if(!limit){wrap.classList.add("hidden");return;}
  wrap.classList.remove("hidden");
  var pct=Math.min((getMonthlySpend()/limit)*100,100);
  bar.style.width=pct+"%";bar.style.background=pct>=100?"#ef4444":pct>=80?"#f59e0b":"#3B25C1";
  label.textContent="৳"+getMonthlySpend().toLocaleString()+" / ৳"+limit.toLocaleString();
}
function updateLimitDisplay(){
  var el=document.getElementById("current-limit-display"),inp=document.getElementById("limit-input"),limit=getSpendingLimit();
  if(el)el.textContent=limit?"Current: ৳"+limit.toLocaleString():"No limit set";
  if(inp&&limit)inp.value=limit;
}

// ─── Contacts ─────────────────────────────────────
function getContacts(){try{return JSON.parse(localStorage.getItem("payoo_contacts"))||[];}catch{return[];}}
function saveContacts(l){localStorage.setItem("payoo_contacts",JSON.stringify(l));}
function addContact(){
  var name=document.getElementById("contact-name").value.trim();
  var number=document.getElementById("contact-number").value.trim();
  if(!name){showToast("Enter a name","error");return;}
  if(number.length!==11){showToast("Enter valid 11-digit number","error");return;}
  var list=getContacts();
  if(list.find(function(c){return c.number===number;})){showToast("Already saved","warning");return;}
  list.push({name:name,number:number,id:Date.now()});
  saveContacts(list);
  document.getElementById("contact-name").value="";document.getElementById("contact-number").value="";
  showToast(name+" saved!","success");renderContacts();renderSendContacts();
}
function deleteContact(id){
  saveContacts(getContacts().filter(function(c){return c.id!==id;}));
  renderContacts();renderSendContacts();showToast("Contact removed","info");
}
function renderContacts(){
  var el=document.getElementById("contacts-list");if(!el)return;
  var list=getContacts();
  if(list.length===0){el.innerHTML='<p class="text-center text-gray-400 py-6"><i class="fa-solid fa-user-slash mr-2"></i>No saved contacts</p>';return;}
  el.innerHTML=list.map(function(c){
    return '<div class="card bg-base-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">'+
      '<div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">'+c.name.charAt(0).toUpperCase()+'</div>'+
      '<div class="flex-1"><p class="font-semibold text-sm">'+c.name+'</p><p class="text-xs text-gray-400 font-mono">'+c.number+'</p></div>'+
      '<div class="flex gap-2">'+
        '<button onclick="useContact(\''+c.number+'\')" class="btn btn-xs bg-[#3B25C1] text-white border-none rounded-xl">Send</button>'+
        '<button onclick="deleteContact('+c.id+')" class="btn btn-xs btn-ghost text-red-400 rounded-xl"><i class="fa-solid fa-trash"></i></button>'+
      '</div></div>';
  }).join("");
}
function renderSendContacts(){
  var row=document.getElementById("send-contacts-row"),list_el=document.getElementById("send-contacts-list");if(!row||!list_el)return;
  var list=getContacts();
  if(list.length===0){row.classList.add("hidden");return;}
  row.classList.remove("hidden");
  list_el.innerHTML=list.map(function(c){
    return '<button onclick="useContact(\''+c.number+'\')" class="flex flex-col items-center gap-1 shrink-0">'+
      '<div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">'+c.name.charAt(0).toUpperCase()+'</div>'+
      '<p class="text-[10px] text-gray-500 max-w-[52px] truncate">'+c.name+'</p>'+
    '</button>';
  }).join("");
}
function useContact(number){var inp=document.getElementById("Transfer-input");if(inp){inp.value=number;setNav("send");showToast("Number filled","info");}}

// ─── Profile ──────────────────────────────────────
function loadProfile(){
  var name=localStorage.getItem("payoo_profile_name")||"User";
  var avatar=localStorage.getItem("payoo_avatar");
  // header avatar
  var ha=document.getElementById("header-avatar");
  if(ha){if(avatar){ha.innerHTML='<img src="'+avatar+'" class="w-full h-full object-cover"/>';}else{ha.innerHTML=name.charAt(0).toUpperCase();}}
  // profile page
  var pa=document.getElementById("profile-avatar");
  if(pa){if(avatar){pa.innerHTML='<img src="'+avatar+'" class="w-full h-full object-cover"/>';}else{pa.innerHTML=name.charAt(0).toUpperCase();}}
  var pn=document.getElementById("profile-name");if(pn)pn.value=name;
  var hu=document.getElementById("home-username");if(hu)hu.textContent=name;
  var qn=document.getElementById("qr-name");if(qn)qn.textContent=name;
}
function saveProfile(){
  var name=document.getElementById("profile-name").value.trim()||"User";
  localStorage.setItem("payoo_profile_name",name);
  loadProfile();showToast("Profile saved!","success");
}
function uploadAvatar(e){
  var file=e.target.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(ev){localStorage.setItem("payoo_avatar",ev.target.result);loadProfile();showToast("Avatar updated!","success");};
  reader.readAsDataURL(file);
}

// ─── PIN Change ───────────────────────────────────
function changePin(){
  var cur=document.getElementById("pin-current").value.trim();
  var nw=document.getElementById("pin-new").value.trim();
  var cf=document.getElementById("pin-confirm").value.trim();
  if(!validatePin(cur)){showToast("Current PIN is incorrect","error");return;}
  if(nw.length!==4||isNaN(Number(nw))){showToast("New PIN must be 4 digits","error");return;}
  if(nw!==cf){showToast("PINs don't match","error");return;}
  CORRECT_PIN=nw;localStorage.setItem("payoo_pin",nw);
  showToast("PIN changed successfully!","success");
  document.getElementById("pin-current").value="";document.getElementById("pin-new").value="";document.getElementById("pin-confirm").value="";
  pushNotification("PIN Changed","Your account PIN was changed successfully","info");
}

// ─── QR Code ──────────────────────────────────────
var qrGenerated=false;
function generateQR(){
  if(qrGenerated)return;
  var canvas=document.getElementById("qr-canvas");if(!canvas)return;
  canvas.innerHTML="";
  var number=localStorage.getItem("payoo_user")||"01890642735";
  var name=localStorage.getItem("payoo_profile_name")||"User";
  var qrNum=document.getElementById("qr-number");if(qrNum)qrNum.textContent=number;
  if(typeof QRCode!=="undefined"){
    new QRCode(canvas,{text:"payoo://receive?number="+number+"&name="+encodeURIComponent(name),width:200,height:200,colorDark:"#3B25C1",colorLight:"#ffffff"});
    qrGenerated=true;
  }
}
function downloadQR(){
  var canvas=document.querySelector("#qr-canvas canvas");
  if(!canvas){showToast("QR not ready","error");return;}
  var a=document.createElement("a");a.href=canvas.toDataURL("image/png");
  a.download="payoo-qr.png";a.click();showToast("QR saved!","success");
}

// ─── Scheduled Payments ───────────────────────────
function getSchedules(){try{return JSON.parse(localStorage.getItem("payoo_schedules"))||[];}catch{return[];}}
function saveSchedules(l){localStorage.setItem("payoo_schedules",JSON.stringify(l));}
function addSchedule(){
  var label=document.getElementById("sched-label").value.trim();
  var number=document.getElementById("sched-number").value.trim();
  var amount=document.getElementById("sched-amount").value.trim();
  var day=document.getElementById("sched-day").value.trim();
  var freq=document.getElementById("sched-freq").value;
  if(!label){showToast("Enter a label","error");return;}
  if(number.length!==11){showToast("Enter valid 11-digit number","error");return;}
  if(!amount||Number(amount)<=0){showToast("Enter valid amount","error");return;}
  if(!day||Number(day)<1||Number(day)>28){showToast("Day must be 1-28","error");return;}
  var list=getSchedules();
  list.push({id:Date.now(),label:label,number:number,amount:Number(amount),day:Number(day),freq:freq,active:true,lastRun:null});
  saveSchedules(list);
  document.getElementById("sched-label").value="";document.getElementById("sched-number").value="";
  document.getElementById("sched-amount").value="";document.getElementById("sched-day").value="";
  showToast(label+" scheduled!","success");renderSchedules();
  pushNotification("Payment Scheduled","৳"+Number(amount).toLocaleString()+" to "+number+" every "+freq,"info");
}
function deleteSchedule(id){
  saveSchedules(getSchedules().filter(function(s){return s.id!==id;}));
  renderSchedules();showToast("Schedule removed","info");
}
function toggleSchedule(id){
  var list=getSchedules();var s=list.find(function(x){return x.id===id;});
  if(s)s.active=!s.active;saveSchedules(list);renderSchedules();
}
function renderSchedules(){
  var el=document.getElementById("schedule-list");if(!el)return;
  var list=getSchedules();
  var ping=document.getElementById("sched-ping");if(ping){if(list.length>0)ping.classList.remove("hidden");else ping.classList.add("hidden");}
  if(list.length===0){el.innerHTML='<p class="text-center text-gray-400 py-6"><i class="fa-solid fa-calendar-xmark mr-2"></i>No scheduled payments</p>';return;}
  el.innerHTML=list.map(function(s){
    return '<div class="card bg-base-100 rounded-2xl p-4 shadow-sm">'+
      '<div class="flex justify-between items-start">'+
        '<div>'+
          '<p class="font-bold text-sm">'+s.label+'</p>'+
          '<p class="text-xs text-gray-400 font-mono mt-0.5">→ '+s.number+'</p>'+
          '<p class="text-xs text-[#3B25C1] font-semibold mt-1">৳'+Number(s.amount).toLocaleString()+' · '+s.freq+' on day '+s.day+'</p>'+
        '</div>'+
        '<div class="flex gap-2 items-center">'+
          '<input type="checkbox" class="toggle toggle-xs toggle-primary" '+(s.active?"checked":"")+' onchange="toggleSchedule('+s.id+')"/>'+
          '<button onclick="deleteSchedule('+s.id+')" class="btn btn-xs btn-ghost text-red-400 rounded-xl"><i class="fa-solid fa-trash"></i></button>'+
        '</div>'+
      '</div>'+
    '</div>';
  }).join("");
}
function checkDueSchedules(){
  var today=new Date().getDate();
  var list=getSchedules();var changed=false;
  list.forEach(function(s){
    if(!s.active)return;
    var lastRunDate=s.lastRun?new Date(s.lastRun).toDateString():null;
    var todayStr=new Date().toDateString();
    if(s.day===today&&lastRunDate!==todayStr){
      var bal=getBalance();
      if(Number(s.amount)<=bal){
        setBalance(bal-Number(s.amount));
        saveTransaction({success:true,title:"Scheduled Payment",subtitle:s.label+" → "+s.number,amount:s.amount,date:new Date().toLocaleString()});
        s.lastRun=new Date().toISOString();changed=true;
        pushNotification("Auto Payment","৳"+Number(s.amount).toLocaleString()+" sent for "+s.label,"success");
      } else {
        pushNotification("Scheduled Payment Failed",s.label+" — Insufficient balance","error");
      }
    }
  });
  if(changed)saveSchedules(list);
}

// ─── Currency Converter ───────────────────────────
var RATES={BDT:1,USD:0.0091,EUR:0.0084,GBP:0.0072,INR:0.76,SAR:0.034,AED:0.033,MYR:0.042};
function convertCurrency(){
  var amount=Number(document.getElementById("conv-amount").value)||0;
  var from=document.getElementById("conv-from").value;
  var to=document.getElementById("conv-to").value;
  var output=document.getElementById("conv-output");
  var rate_el=document.getElementById("conv-rate");
  if(!amount){if(output)output.textContent="—";return;}
  var inBDT=amount/RATES[from];
  var result=(inBDT*RATES[to]);
  var rate=(RATES[to]/RATES[from]);
  if(output)output.textContent=result.toFixed(4)+" "+to;
  if(rate_el)rate_el.textContent="1 "+from+" = "+rate.toFixed(4)+" "+to;
}
function swapCurrencies(){
  var f=document.getElementById("conv-from");var t=document.getElementById("conv-to");
  var tmp=f.value;f.value=t.value;t.value=tmp;convertCurrency();
}

// ─── Onboarding Tutorial ──────────────────────────
var onboardSteps=[
  {icon:"fa-wallet",color:"#3B25C1",title:"Welcome to Payoo!",body:"Your all-in-one mobile wallet. Send money, pay bills, earn bonuses and more — all in one place."},
  {icon:"fa-paper-plane",color:"#7c3aed",title:"Send Money Instantly",body:"Transfer money to anyone using their 11-digit number. Save contacts for quick access."},
  {icon:"fa-qrcode",color:"#06b6d4",title:"Your Personal QR Code",body:"Share your QR code so others can send you money without typing your number."},
  {icon:"fa-clock",color:"#f59e0b",title:"Scheduled Payments",body:"Set up recurring payments for rent, subscriptions and bills — Payoo handles it automatically."},
  {icon:"fa-chart-line",color:"#10b981",title:"Track Your Spending",body:"View your dashboard to see spending trends, set monthly limits and get alerts."},
];
var currentOnboardStep=0;
function initOnboarding(){
  if(localStorage.getItem("payoo_onboarded")){document.getElementById("onboarding").classList.add("hidden");return;}
  renderOnboardStep();
}
function renderOnboardStep(){
  var s=onboardSteps[currentOnboardStep];
  var dots=onboardSteps.map(function(_,i){return'<div class="w-2 h-2 rounded-full transition-all '+(i===currentOnboardStep?"bg-[#3B25C1] w-4":"bg-gray-300")+'"></div>';}).join("");
  document.getElementById("onboard-dots").innerHTML=dots;
  document.getElementById("onboard-content").innerHTML=
    '<div class="text-center py-4">'+
      '<div class="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style="background:'+s.color+'20">'+
        '<i class="fa-solid '+s.icon+' text-4xl" style="color:'+s.color+'"></i>'+
      '</div>'+
      '<h2 class="text-2xl font-black mb-3">'+s.title+'</h2>'+
      '<p class="text-neutral/60 text-sm leading-relaxed">'+s.body+'</p>'+
    '</div>';
  var back=document.getElementById("onboard-back");var next=document.getElementById("onboard-next");
  if(back)back.classList.toggle("hidden",currentOnboardStep===0);
  if(next)next.textContent=currentOnboardStep===onboardSteps.length-1?"Get Started 🚀":"Next →";
}
function onboardStep(dir){
  currentOnboardStep+=dir;
  if(currentOnboardStep>=onboardSteps.length){skipOnboarding();return;}
  if(currentOnboardStep<0)currentOnboardStep=0;
  renderOnboardStep();
}
function skipOnboarding(){
  localStorage.setItem("payoo_onboarded","true");
  document.getElementById("onboarding").classList.add("hidden");
}

// ─── Filters & Search ─────────────────────────────
var currentFilter="all";
function setFilter(f){
  currentFilter=f;
  ["all","credit","debit"].forEach(function(x){
    var btn=document.getElementById("filter-"+x);if(!btn)return;
    if(x===f){btn.classList.add("bg-[#3B25C1]","text-white");btn.classList.remove("bg-base-300","text-gray-500");}
    else{btn.classList.remove("bg-[#3B25C1]","text-white");btn.classList.add("bg-base-300","text-gray-500");}
  });
  renderTransactionHistory();
}
function renderTransactionHistory(){
  var c=document.getElementById("Transaction-history");if(!c)return;
  c.innerHTML="";
  var search=(document.getElementById("tx-search")||{}).value||"";
  var dateFrom=(document.getElementById("tx-date-from")||{}).value||"";
  var dateTo=(document.getElementById("tx-date-to")||{}).value||"";
  var h=getTransactionHistory().filter(function(tx){
    if(currentFilter==="credit"&&!(tx.success&&CREDIT_TITLES.indexOf(tx.title)!==-1))return false;
    if(currentFilter==="debit"&&!(tx.success&&CREDIT_TITLES.indexOf(tx.title)===-1))return false;
    if(search){var q=search.toLowerCase();if((tx.title||"").toLowerCase().indexOf(q)===-1&&(tx.subtitle||"").toLowerCase().indexOf(q)===-1)return false;}
    if(dateFrom||dateTo){
      var txDate=new Date(tx.date);
      if(dateFrom&&txDate<new Date(dateFrom))return false;
      if(dateTo&&txDate>new Date(dateTo+" 23:59:59"))return false;
    }
    return true;
  });
  if(h.length===0){c.innerHTML='<p class="text-center text-gray-400 py-6"><i class="fa-solid fa-receipt mr-2"></i>No transactions found</p>';return;}
  h.forEach(function(tx){c.appendChild(createTransactionCard(tx));});
}

// ─── Dashboard ────────────────────────────────────
function renderDashboard(){
  var history=getTransactionHistory(),totalIn=0,totalOut=0;
  history.forEach(function(tx){if(!tx.success||!tx.amount)return;if(CREDIT_TITLES.indexOf(tx.title)!==-1)totalIn+=Number(tx.amount);else totalOut+=Number(tx.amount);});
  var days=[];for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);days.push({label:d.toLocaleDateString("en-US",{weekday:"short"}),date:d.toDateString(),in:0,out:0});}
  history.forEach(function(tx){if(!tx.success||!tx.amount)return;var day=days.find(function(d){return d.date===new Date(tx.date).toDateString();});if(!day)return;if(CREDIT_TITLES.indexOf(tx.title)!==-1)day.in+=Number(tx.amount);else day.out+=Number(tx.amount);});
  var cats={};history.forEach(function(tx){if(!tx.success||!tx.amount||CREDIT_TITLES.indexOf(tx.title)!==-1)return;cats[tx.title]=(cats[tx.title]||0)+Number(tx.amount);});
  var maxV=Math.max.apply(null,days.map(function(d){return Math.max(d.in,d.out);}))||1;
  var barsHTML=days.map(function(d){var ih=Math.round((d.in/maxV)*80),oh=Math.round((d.out/maxV)*80);return'<div class="flex flex-col items-center gap-1"><div class="flex items-end gap-0.5 h-20"><div class="w-3 bg-green-400 rounded-t" style="height:'+ih+'px"></div><div class="w-3 bg-red-400 rounded-t" style="height:'+oh+'px"></div></div><p class="text-xs text-gray-400">'+d.label+'</p></div>';}).join("");
  var catHTML=Object.keys(cats).length===0?'<p class="text-gray-400 text-sm text-center py-3">No spending yet</p>':Object.keys(cats).map(function(cat){var pct=totalOut>0?Math.round((cats[cat]/totalOut)*100):0;return'<div class="space-y-1"><div class="flex justify-between text-sm"><span class="font-medium">'+cat+'</span><span class="text-gray-400">৳'+cats[cat].toLocaleString()+' ('+pct+'%)</span></div><div class="w-full bg-base-200 rounded-full h-2"><div class="bg-[#3B25C1] h-2 rounded-full" style="width:'+pct+'%"></div></div></div>';}).join("");
  var el=document.getElementById("sec-dashboard");if(!el)return;
  el.innerHTML='<div class="w-11/12 mx-auto py-5 space-y-4"><h1 class="font-bold text-2xl">Dashboard</h1>'+
    '<div class="grid grid-cols-2 gap-3"><div class="card bg-green-50 rounded-2xl p-4"><p class="text-xs text-green-600 font-bold uppercase">Total In</p><p class="text-2xl font-bold text-green-600 mt-1">৳'+totalIn.toLocaleString()+'</p></div><div class="card bg-red-50 rounded-2xl p-4"><p class="text-xs text-red-500 font-bold uppercase">Total Out</p><p class="text-2xl font-bold text-red-500 mt-1">৳'+totalOut.toLocaleString()+'</p></div></div>'+
    '<div class="card bg-base-100 rounded-2xl p-4"><div class="flex justify-between items-center mb-3"><p class="font-bold">7-Day Activity</p><div class="flex gap-3 text-xs text-gray-400"><span class="flex items-center gap-1"><span class="w-2 h-2 bg-green-400 rounded-full inline-block"></span>In</span><span class="flex items-center gap-1"><span class="w-2 h-2 bg-red-400 rounded-full inline-block"></span>Out</span></div></div><div class="flex justify-around items-end">'+barsHTML+'</div></div>'+
    '<div class="card bg-base-100 rounded-2xl p-4 space-y-3"><p class="font-bold">Spending Breakdown</p>'+catHTML+'</div>'+
    '<div class="card bg-base-100 rounded-2xl p-4 flex justify-between items-center"><p class="font-semibold">Total Transactions</p><span class="badge bg-[#3B25C1] text-white px-3 py-1 rounded-xl">'+history.length+'</span></div></div>';
}

// ─── Pull-to-Refresh ──────────────────────────────
(function(){
  var sy=0,pulling=false,threshold=80,ind=document.getElementById("ptr-indicator");
  document.addEventListener("touchstart",function(e){sy=e.touches[0].clientY;pulling=true;},{passive:true});
  document.addEventListener("touchmove",function(e){if(!pulling)return;var dy=e.touches[0].clientY-sy;if(dy>0&&window.scrollY===0&&ind)ind.style.opacity=Math.min(dy/threshold,1);},{passive:true});
  document.addEventListener("touchend",function(e){if(!pulling)return;pulling=false;var dy=e.changedTouches[0].clientY-sy;if(ind)ind.style.opacity=0;if(dy>threshold&&window.scrollY===0){var s=localStorage.getItem("payoo_balance");if(s)setBalance(s);showToast("Balance refreshed!","info");}});
})();

// ─── Navigation ───────────────────────────────────
var ALL_SECTIONS=["home","addMoney","cashout","send","paybill","bonus","qr","scheduled","converter","profile","contacts","notifications","history","dashboard","settings","split","savings","budget","loans","referral","achievements"];
var NAV_IDS=["home","send","dashboard","history","settings"];
function setNav(id){
  ALL_SECTIONS.forEach(function(s){var e=document.getElementById("sec-"+s);if(e)e.classList.add("hidden");});
  var target=document.getElementById("sec-"+id);if(target)target.classList.remove("hidden");
  NAV_IDS.forEach(function(n){var b=document.getElementById("nav-"+n);if(b)b.classList.remove("active");});
  var anav=document.getElementById("nav-"+id);if(anav)anav.classList.add("active");
  if(id==="history"){renderTransactionHistory();setFilter("all");}
  if(id==="dashboard")renderDashboard();
  if(id==="contacts")renderContacts();
  if(id==="send")renderSendContacts();
  if(id==="settings")updateLimitDisplay();
  if(id==="notifications")renderNotifications();
  if(id==="scheduled")renderSchedules();
  if(id==="qr")generateQR();
  if(id==="home")renderRecentTx();
}
function showonly(id){var map={"addMoney":"addMoney","cashout":"cashout","TransferMoney":"send","Paybill":"paybill","BonusCupon":"bonus","Transaction":"history","Dashboard":"dashboard"};setNav(map[id]||id);}

// ─── Badge ────────────────────────────────────────
function updateBadge(){
  var h=getTransactionHistory().length;
  ["tx-badge-nav"].forEach(function(id){var e=document.getElementById(id);if(!e)return;if(h>0){e.classList.remove("hidden");e.textContent=h>99?"99+":h;}else e.classList.add("hidden");});
}

// ─── Init ─────────────────────────────────────────
(function init(){
  var saved=localStorage.getItem("payoo_balance");
  if(saved!==null){["balance","balance-card"].forEach(function(id){var e=document.getElementById(id);if(e)e.innerText=Number(saved).toLocaleString();});}
  updateBadge();updateLimitBar();updateNotifBadge();
  loadProfile();
  checkDueSchedules();
  initOnboarding();
  setNav("home");
})();