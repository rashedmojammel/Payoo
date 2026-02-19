// ═══════════════════════════════════════════════════════════
//  MACHINE.JS  —  Core utilities, navigation, all features
// ═══════════════════════════════════════════════════════════

// ─── Core Helpers ─────────────────────────────────────────
function getValueFormInput(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function getBalance() {
  var el = document.getElementById("balance");
  return Number(el ? el.innerText.replace(/,/g,"") : 0);
}

function setBalance(value) {
  var el = document.getElementById("balance");
  if (el) {
    var start = getBalance(), end = Number(value), t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts-t0)/600, 1);
      el.innerText = Math.round(start + (end-start)*p).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  localStorage.setItem("payoo_balance", value);
}

var CORRECT_PIN = "6427";
function validatePin(pin) { return pin === CORRECT_PIN; }

function validateAmount(amount, balance, deduct) {
  var n = Number(amount);
  if (!amount || isNaN(n) || n <= 0) { showToast("Enter a valid amount greater than 0","error"); return false; }
  if (deduct && n > balance) { showToast("Insufficient balance!","error"); return false; }
  return true;
}
function validatePhone(num) {
  if (!num || num.length !== 11) { showToast("Enter a valid 11-digit number","error"); return false; }
  return true;
}

// ─── Toast ────────────────────────────────────────────────
function showToast(msg, type) {
  type = type || "success";
  var c = document.getElementById("toast-container");
  if (!c) {
    c = document.createElement("div");
    c.id = "toast-container";
    c.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 w-11/12 max-w-sm pointer-events-none";
    document.body.appendChild(c);
  }
  var colors = {success:"bg-green-500",error:"bg-red-500",warning:"bg-yellow-500",info:"bg-blue-500"};
  var icons  = {success:"fa-circle-check",error:"fa-circle-xmark",warning:"fa-triangle-exclamation",info:"fa-circle-info"};
  var t = document.createElement("div");
  t.className = "flex items-center gap-3 "+(colors[type]||"bg-blue-500")+" text-white px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 opacity-0 translate-y-4 pointer-events-auto";
  t.innerHTML = '<i class="fa-solid '+(icons[type]||"fa-circle-info")+'"></i><span class="text-sm font-semibold">'+msg+'</span>';
  c.appendChild(t);
  requestAnimationFrame(function(){ t.classList.remove("opacity-0","translate-y-4"); });
  setTimeout(function(){ t.classList.add("opacity-0","translate-y-4"); setTimeout(function(){ t.remove(); },300); },3000);
}

// ─── Confetti ─────────────────────────────────────────────
function fireConfetti() {
  var colors = ["#3B25C1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4"];
  for (var i = 0; i < 60; i++) {
    (function(i){
      setTimeout(function() {
        var p = document.createElement("div");
        p.className = "confetti-piece";
        p.style.cssText = [
          "left:"+(Math.random()*100)+"vw",
          "background:"+colors[Math.floor(Math.random()*colors.length)],
          "width:"+(6+Math.random()*8)+"px",
          "height:"+(6+Math.random()*8)+"px",
          "border-radius:"+(Math.random()>0.5?"50%":"2px"),
          "animation-duration:"+(1.5+Math.random()*2)+"s",
          "animation-delay:"+(Math.random()*0.3)+"s"
        ].join(";");
        document.body.appendChild(p);
        setTimeout(function(){ p.remove(); }, 3500);
      }, i*18);
    })(i);
  }
}

// ─── Transaction Storage ───────────────────────────────────
function saveTransaction(tx) {
  var h = getTransactionHistory();
  tx.id = Date.now();
  h.unshift(tx);
  localStorage.setItem("payoo_transactions", JSON.stringify(h));
  updateBadge();
  checkSpendingLimit(tx);
}
function getTransactionHistory() {
  try { return JSON.parse(localStorage.getItem("payoo_transactions")) || []; } catch { return []; }
}

// ─── Transaction Card ──────────────────────────────────────
function createTransactionCard(tx) {
  var w = document.createElement("div");
  var color = tx.success ? "green" : "red";
  var icon  = tx.success ? "fa-circle-check" : "fa-circle-xmark";
  var amtHTML = tx.amount
    ? '<p class="text-sm mt-1 font-semibold">৳<span class="text-'+color+'-500 font-bold">'+Number(tx.amount).toLocaleString()+'</span> BDT</p>'
    : "";
  var rcptBtn = (tx.success && tx.amount)
    ? '<button onclick="downloadReceipt('+tx.id+')" class="mt-2 text-xs text-blue-500 hover:underline flex items-center gap-1"><i class="fa-solid fa-file-arrow-down"></i> Receipt</button>'
    : "";
  w.innerHTML =
    '<div class="border border-'+color+'-400 rounded-2xl bg-base-100 w-full p-4 shadow-sm flex items-start gap-3 animate-fade-in">'+
      '<div class="bg-'+color+'-100 text-'+color+'-600 rounded-full p-2 mt-0.5 shrink-0">'+
        '<i class="fa-solid '+icon+' text-base"></i>'+
      '</div>'+
      '<div class="flex-1 min-w-0">'+
        '<p class="font-bold text-sm">'+tx.title+'</p>'+
        '<p class="text-xs text-gray-400">'+tx.subtitle+'</p>'+
        amtHTML+
        '<p class="text-xs text-gray-400 mt-1">'+(tx.date||new Date().toLocaleString())+'</p>'+
        rcptBtn+
      '</div>'+
    '</div>';
  return w;
}
function appendTransactionCard(card) {
  var c = document.getElementById("Transaction-history");
  if (c) c.prepend(card);
}

// ─── Receipt ──────────────────────────────────────────────
function downloadReceipt(txId) {
  var tx = getTransactionHistory().find(function(t){ return t.id===txId; });
  if (!tx) { showToast("Receipt not found","error"); return; }
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payoo Receipt</title>'+
    '<style>body{font-family:Arial,sans-serif;max-width:400px;margin:40px auto;padding:20px}'+
    '.hdr{text-align:center;border-bottom:2px solid #3B25C1;padding-bottom:16px;margin-bottom:20px}'+
    '.logo{font-size:28px;font-weight:900;color:#3B25C1}.badge{display:inline-block;padding:4px 16px;border-radius:99px;font-size:13px;font-weight:700;margin-top:8px}'+
    '.ok{background:#dcfce7;color:#16a34a}.fail{background:#fee2e2;color:#dc2626}'+
    '.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px}'+
    '.lbl{color:#888}.val{font-weight:600;color:#111}'+
    '.amt{font-size:28px;font-weight:900;text-align:center;color:#3B25C1;margin:20px 0}'+
    '.ftr{text-align:center;margin-top:24px;font-size:11px;color:#aaa}'+
    '@media print{button{display:none}}</style></head><body>'+
    '<div class="hdr"><div class="logo">Payoo</div><div>Transaction Receipt</div>'+
    '<span class="badge '+(tx.success?'ok':'fail')+'">'+(tx.success?'✓ Successful':'✗ Failed')+'</span></div>'+
    '<div class="amt">৳'+Number(tx.amount||0).toLocaleString()+' BDT</div>'+
    '<div class="row"><span class="lbl">Type</span><span class="val">'+tx.title+'</span></div>'+
    '<div class="row"><span class="lbl">Details</span><span class="val">'+tx.subtitle+'</span></div>'+
    '<div class="row"><span class="lbl">Date</span><span class="val">'+tx.date+'</span></div>'+
    '<div class="row"><span class="lbl">Receipt ID</span><span class="val">#'+tx.id+'</span></div>'+
    '<div class="ftr">Thank you for using Payoo</div><br>'+
    '<button onclick="window.print()" style="width:100%;padding:12px;background:#3B25C1;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer">🖨 Print</button>'+
    '</body></html>';
  var w = window.open("","_blank");
  w.document.write(html); w.document.close();
}

// ─── CSV Export ───────────────────────────────────────────
function exportCSV() {
  var history = getTransactionHistory();
  if (history.length === 0) { showToast("No transactions to export","warning"); return; }
  var rows = [["ID","Date","Type","Details","Amount","Status"]];
  history.forEach(function(tx){
    rows.push([tx.id, tx.date, tx.title, tx.subtitle, tx.amount||"", tx.success?"Success":"Failed"]);
  });
  var csv = rows.map(function(r){ return r.map(function(v){ return '"'+(v||"").toString().replace(/"/g,'""')+'"'; }).join(","); }).join("\n");
  var blob = new Blob([csv], {type:"text/csv"});
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement("a");
  a.href = url; a.download = "payoo-statement-"+new Date().toISOString().slice(0,10)+".csv";
  a.click(); URL.revokeObjectURL(url);
  showToast("Statement downloaded!","success");
}

// ─── Spending Limit ───────────────────────────────────────
function getSpendingLimit() { return Number(localStorage.getItem("payoo_spending_limit")) || 0; }

function saveSpendingLimit() {
  var val = Number(document.getElementById("limit-input").value);
  if (!val || val <= 0) { showToast("Enter a valid limit","error"); return; }
  localStorage.setItem("payoo_spending_limit", val);
  showToast("Spending limit set to ৳"+val.toLocaleString(),"success");
  updateLimitDisplay();
  updateLimitBar();
}

function getMonthlySpend() {
  var CREDIT = ["Money Added","Bonus Credited"];
  var now = new Date(), month = now.getMonth(), year = now.getFullYear();
  return getTransactionHistory().reduce(function(sum, tx){
    if (!tx.success || !tx.amount || CREDIT.indexOf(tx.title)!==-1) return sum;
    var d = new Date(tx.date);
    if (d.getMonth()===month && d.getFullYear()===year) sum += Number(tx.amount);
    return sum;
  }, 0);
}

function checkSpendingLimit(tx) {
  var limit = getSpendingLimit();
  if (!limit) return;
  var CREDIT = ["Money Added","Bonus Credited"];
  if (!tx.success || !tx.amount || CREDIT.indexOf(tx.title)!==-1) return;
  var spent = getMonthlySpend();
  var pct = (spent / limit) * 100;
  if (pct >= 100) showToast("⚠️ You've exceeded your monthly spending limit!","error");
  else if (pct >= 80) showToast("⚠️ You've used "+Math.round(pct)+"% of your monthly limit","warning");
  updateLimitBar();
}

function updateLimitBar() {
  var limit = getSpendingLimit();
  var wrap  = document.getElementById("limit-bar-wrap");
  var bar   = document.getElementById("limit-bar");
  var label = document.getElementById("limit-bar-label");
  if (!wrap) return;
  if (!limit) { wrap.classList.add("hidden"); return; }
  wrap.classList.remove("hidden");
  var spent = getMonthlySpend();
  var pct   = Math.min((spent/limit)*100, 100);
  bar.style.width = pct+"%";
  bar.style.background = pct>=100?"#ef4444":pct>=80?"#f59e0b":"#3B25C1";
  label.textContent = "৳"+spent.toLocaleString()+" / ৳"+limit.toLocaleString();
}

function updateLimitDisplay() {
  var el = document.getElementById("current-limit-display");
  var input = document.getElementById("limit-input");
  var limit = getSpendingLimit();
  if (el) el.textContent = limit ? "Current limit: ৳"+limit.toLocaleString() : "No limit set";
  if (input && limit) input.value = limit;
}

// ─── Saved Contacts ───────────────────────────────────────
function getContacts() {
  try { return JSON.parse(localStorage.getItem("payoo_contacts")) || []; } catch { return []; }
}
function saveContacts(list) { localStorage.setItem("payoo_contacts", JSON.stringify(list)); }

function addContact() {
  var name   = document.getElementById("contact-name").value.trim();
  var number = document.getElementById("contact-number").value.trim();
  if (!name)          { showToast("Enter a contact name","error"); return; }
  if (number.length!==11){ showToast("Enter a valid 11-digit number","error"); return; }
  var list = getContacts();
  if (list.find(function(c){ return c.number===number; })) {
    showToast("This number is already saved","warning"); return;
  }
  list.push({ name:name, number:number, id:Date.now() });
  saveContacts(list);
  document.getElementById("contact-name").value = "";
  document.getElementById("contact-number").value = "";
  showToast(name+" saved to contacts!","success");
  renderContacts();
  renderSendContacts();
}

function deleteContact(id) {
  var list = getContacts().filter(function(c){ return c.id!==id; });
  saveContacts(list);
  renderContacts();
  renderSendContacts();
  showToast("Contact removed","info");
}

function renderContacts() {
  var el = document.getElementById("contacts-list");
  if (!el) return;
  var list = getContacts();
  if (list.length===0) {
    el.innerHTML='<p class="text-center text-gray-400 py-6"><i class="fa-solid fa-user-slash mr-2"></i>No saved contacts</p>';
    return;
  }
  el.innerHTML = list.map(function(c){
    return '<div class="card bg-base-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">'+
      '<div class="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shrink-0">'+
        c.name.charAt(0).toUpperCase()+
      '</div>'+
      '<div class="flex-1">'+
        '<p class="font-semibold text-sm">'+c.name+'</p>'+
        '<p class="text-xs text-gray-400 font-mono">'+c.number+'</p>'+
      '</div>'+
      '<div class="flex gap-2">'+
        '<button onclick="useContact(\''+c.number+'\')" class="btn btn-xs btn-primary btn-soft rounded-xl">Send</button>'+
        '<button onclick="deleteContact('+c.id+')" class="btn btn-xs btn-ghost text-red-400 rounded-xl"><i class="fa-solid fa-trash"></i></button>'+
      '</div>'+
    '</div>';
  }).join("");
}

function renderSendContacts() {
  var row  = document.getElementById("send-contacts-row");
  var list_el = document.getElementById("send-contacts-list");
  if (!row || !list_el) return;
  var list = getContacts();
  if (list.length===0) { row.classList.add("hidden"); return; }
  row.classList.remove("hidden");
  list_el.innerHTML = list.map(function(c){
    return '<button onclick="useContact(\''+c.number+'\')" class="flex flex-col items-center gap-1 shrink-0">'+
      '<div class="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-base">'+
        c.name.charAt(0).toUpperCase()+
      '</div>'+
      '<p class="text-xs text-gray-500 whitespace-nowrap max-w-[56px] truncate">'+c.name+'</p>'+
    '</button>';
  }).join("");
}

function useContact(number) {
  var input = document.getElementById("Transfer-input");
  if (input) { input.value = number; setNav("send"); showToast("Number filled from contacts","info"); }
}

// ─── Transaction Filters ───────────────────────────────────
var currentFilter = "all";
var CREDIT_TITLES = ["Money Added","Bonus Credited"];

function setFilter(f) {
  currentFilter = f;
  ["all","credit","debit"].forEach(function(x){
    var btn = document.getElementById("filter-"+x);
    if (!btn) return;
    if (x===f) { btn.classList.add("bg-[#3B25C1]","text-white"); btn.classList.remove("bg-base-300","text-gray-500"); }
    else        { btn.classList.remove("bg-[#3B25C1]","text-white"); btn.classList.add("bg-base-300","text-gray-500"); }
  });
  renderTransactionHistory(f);
}

function renderTransactionHistory(filter) {
  var c = document.getElementById("Transaction-history");
  if (!c) return;
  c.innerHTML = "";
  filter = filter || currentFilter || "all";
  var h = getTransactionHistory().filter(function(tx){
    if (filter==="all")    return true;
    if (filter==="credit") return tx.success && CREDIT_TITLES.indexOf(tx.title)!==-1;
    if (filter==="debit")  return tx.success && CREDIT_TITLES.indexOf(tx.title)===-1;
    return true;
  });
  if (h.length===0) {
    c.innerHTML='<p class="text-center text-gray-400 py-6"><i class="fa-solid fa-receipt mr-2"></i>No transactions found</p>';
    return;
  }
  h.forEach(function(tx){ c.appendChild(createTransactionCard(tx)); });
}

// ─── Dashboard ────────────────────────────────────────────
function renderDashboard() {
  var history = getTransactionHistory();
  var totalIn=0, totalOut=0;
  history.forEach(function(tx){
    if (!tx.success||!tx.amount) return;
    if (CREDIT_TITLES.indexOf(tx.title)!==-1) totalIn+=Number(tx.amount);
    else totalOut+=Number(tx.amount);
  });

  var days=[];
  for (var i=6;i>=0;i--) {
    var d=new Date(); d.setDate(d.getDate()-i);
    days.push({label:d.toLocaleDateString("en-US",{weekday:"short"}),date:d.toDateString(),in:0,out:0});
  }
  history.forEach(function(tx){
    if (!tx.success||!tx.amount) return;
    var day=days.find(function(d){return d.date===new Date(tx.date).toDateString();});
    if (!day) return;
    if (CREDIT_TITLES.indexOf(tx.title)!==-1) day.in+=Number(tx.amount);
    else day.out+=Number(tx.amount);
  });

  var cats={};
  history.forEach(function(tx){
    if (!tx.success||!tx.amount||CREDIT_TITLES.indexOf(tx.title)!==-1) return;
    cats[tx.title]=(cats[tx.title]||0)+Number(tx.amount);
  });

  var maxV=Math.max.apply(null,days.map(function(d){return Math.max(d.in,d.out);})) || 1;
  var barsHTML=days.map(function(d){
    var ih=Math.round((d.in/maxV)*80), oh=Math.round((d.out/maxV)*80);
    return '<div class="flex flex-col items-center gap-1">'+
      '<div class="flex items-end gap-0.5 h-20">'+
        '<div class="w-3 bg-green-400 rounded-t" style="height:'+ih+'px" title="In: ৳'+d.in.toLocaleString()+'"></div>'+
        '<div class="w-3 bg-red-400 rounded-t" style="height:'+oh+'px" title="Out: ৳'+d.out.toLocaleString()+'"></div>'+
      '</div>'+
      '<p class="text-xs text-gray-400">'+d.label+'</p>'+
    '</div>';
  }).join("");

  var catHTML=Object.keys(cats).length===0
    ? '<p class="text-gray-400 text-sm text-center py-3">No spending yet</p>'
    : Object.keys(cats).map(function(cat){
        var pct=totalOut>0?Math.round((cats[cat]/totalOut)*100):0;
        return '<div class="space-y-1">'+
          '<div class="flex justify-between text-sm"><span class="font-medium">'+cat+'</span><span class="text-gray-400">৳'+cats[cat].toLocaleString()+' ('+pct+'%)</span></div>'+
          '<div class="w-full bg-base-200 rounded-full h-2"><div class="bg-[#3B25C1] h-2 rounded-full" style="width:'+pct+'%"></div></div>'+
        '</div>';
      }).join("");

  var el=document.getElementById("sec-dashboard");
  if (!el) return;
  el.innerHTML=
    '<div class="w-11/12 mx-auto py-5 space-y-4">'+
      '<h1 class="font-bold text-2xl">Dashboard</h1>'+
      '<div class="grid grid-cols-2 gap-3">'+
        '<div class="card bg-green-50 rounded-2xl p-4"><p class="text-xs text-green-600 font-bold uppercase">Total In</p><p class="text-2xl font-bold text-green-600 mt-1">৳'+totalIn.toLocaleString()+'</p></div>'+
        '<div class="card bg-red-50 rounded-2xl p-4"><p class="text-xs text-red-500 font-bold uppercase">Total Out</p><p class="text-2xl font-bold text-red-500 mt-1">৳'+totalOut.toLocaleString()+'</p></div>'+
      '</div>'+
      '<div class="card bg-base-100 rounded-2xl p-4">'+
        '<div class="flex justify-between items-center mb-3">'+
          '<p class="font-bold">7-Day Activity</p>'+
          '<div class="flex gap-3 text-xs text-gray-400">'+
            '<span class="flex items-center gap-1"><span class="w-2 h-2 bg-green-400 rounded-full inline-block"></span>In</span>'+
            '<span class="flex items-center gap-1"><span class="w-2 h-2 bg-red-400 rounded-full inline-block"></span>Out</span>'+
          '</div>'+
        '</div>'+
        '<div class="flex justify-around items-end">'+barsHTML+'</div>'+
      '</div>'+
      '<div class="card bg-base-100 rounded-2xl p-4 space-y-3"><p class="font-bold">Spending Breakdown</p>'+catHTML+'</div>'+
      '<div class="card bg-base-100 rounded-2xl p-4 flex justify-between items-center">'+
        '<p class="font-semibold">Total Transactions</p>'+
        '<span class="badge bg-[#3B25C1] text-white px-3 py-1 rounded-xl">'+history.length+'</span>'+
      '</div>'+
    '</div>';
}

// ─── Pull-to-Refresh ──────────────────────────────────────
(function() {
  var startY=0, pulling=false, threshold=80;
  var ind=document.getElementById("ptr-indicator");

  document.addEventListener("touchstart",function(e){ startY=e.touches[0].clientY; pulling=true; },{passive:true});
  document.addEventListener("touchmove",function(e){
    if (!pulling) return;
    var dy=e.touches[0].clientY - startY;
    if (dy>0 && window.scrollY===0 && ind) {
      ind.style.opacity = Math.min(dy/threshold,1);
    }
  },{passive:true});
  document.addEventListener("touchend",function(e){
    if (!pulling) return;
    pulling=false;
    var dy=e.changedTouches[0].clientY - startY;
    if (ind) ind.style.opacity=0;
    if (dy>threshold && window.scrollY===0) {
      // Refresh balance animation
      var saved=localStorage.getItem("payoo_balance");
      if (saved) { var old=getBalance(); setBalance(saved); }
      showToast("Balance refreshed!","info");
    }
  });
})();

// ─── Bottom Nav ───────────────────────────────────────────
var ALL_SECTIONS = ["home","addMoney","cashout","send","paybill","bonus","contacts","history","dashboard","settings"];
var NAV_IDS = ["home","send","dashboard","history","settings"];

function setNav(id) {
  // Hide all sections
  ALL_SECTIONS.forEach(function(s){
    var el=document.getElementById("sec-"+s);
    if (el) el.classList.add("hidden");
  });
  // Show target
  var target=document.getElementById("sec-"+id);
  if (target) target.classList.remove("hidden");

  // Update nav bar active states
  NAV_IDS.forEach(function(n){
    var btn=document.getElementById("nav-"+n);
    if (btn) btn.classList.remove("active");
  });
  var activeNav=document.getElementById("nav-"+id);
  if (activeNav) activeNav.classList.add("active");

  // Lazy render
  if (id==="history")   { renderTransactionHistory("all"); setFilter("all"); }
  if (id==="dashboard") renderDashboard();
  if (id==="contacts")  { renderContacts(); }
  if (id==="send")      renderSendContacts();
  if (id==="settings")  { updateLimitDisplay(); }
}

// Legacy alias so old JS files still work
function showonly(id) {
  var map = {
    "addMoney":"addMoney","cashout":"cashout","TransferMoney":"send",
    "Paybill":"paybill","BonusCupon":"bonus","Transaction":"history","Dashboard":"dashboard"
  };
  setNav(map[id] || id);
}

// ─── Badge ────────────────────────────────────────────────
function updateBadge() {
  var h=getTransactionHistory().length;
  ["tx-badge","tx-badge-nav"].forEach(function(id){
    var el=document.getElementById(id);
    if (!el) return;
    if (h>0){ el.classList.remove("hidden"); el.textContent=h>99?"99+":h; }
    else el.classList.add("hidden");
  });
}

// ─── Init ─────────────────────────────────────────────────
(function init(){
  var saved=localStorage.getItem("payoo_balance");
  if (saved!==null) {
    var el=document.getElementById("balance");
    if (el) el.innerText=Number(saved).toLocaleString();
  }
  updateBadge();
  updateLimitBar();
  // Start on home
  setNav("home");
})();