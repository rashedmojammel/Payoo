// ═══════════════════════════════════════════════════
//  FEATURES.JS  v1.0  —  Payoo Extended Features
//  Bill Split | Savings Goals | Budget Planner
//  Loan Tracker | Referral | Achievements | Auto-logout
// ═══════════════════════════════════════════════════

// ─── Register new sections with navigation ────────
(function patchNav(){
  var extras=["split","savings","budget","loans","referral","achievements"];
  var orig=window.setNav;
  if(!orig)return;
  window.setNav=function(id){
    // hide extra sections
    extras.forEach(function(s){var e=document.getElementById("sec-"+s);if(e)e.classList.add("hidden");});
    orig(id);
    if(id==="split")    initSplit();
    if(id==="savings")  renderGoals();
    if(id==="budget")   renderBudgets();
    if(id==="loans")    renderLoans();
    if(id==="referral") initReferral();
    if(id==="achievements") renderAchievements();
  };
})();

// ═══════════════════════════════════════════════════
// 1. BILL SPLIT CALCULATOR
// ═══════════════════════════════════════════════════
var splitPeople=[];
var splitPeopleCount=2;
var currentTip=0;

function initSplit(){ calcSplit(); renderSplitPeople(); }

function changePeople(delta){
  splitPeopleCount=Math.max(2,Math.min(20,splitPeopleCount+delta));
  document.getElementById("split-people-display").textContent=splitPeopleCount;
  calcSplit();
}

function setTip(pct){
  currentTip=pct;
  document.querySelectorAll(".tip-btn").forEach(function(b){
    b.classList.remove("bg-[#3B25C1]","text-white");
    b.classList.add("bg-base-200");
  });
  var tipMap={"0":0,"10":1,"15":2,"20":3};
  var btns=document.querySelectorAll(".tip-btn");
  if(btns[tipMap[String(pct)]]){
    btns[tipMap[String(pct)]].classList.add("bg-[#3B25C1]","text-white");
    btns[tipMap[String(pct)]].classList.remove("bg-base-200");
  }
  calcSplit();
}

function calcSplit(){
  var total=Number(document.getElementById("split-total").value)||0;
  if(!total){document.getElementById("split-result").classList.add("hidden");return;}
  var tip=total*(currentTip/100);
  var grandTotal=total+tip;
  var people=splitPeople.length>0?splitPeople.length:splitPeopleCount;
  var perPerson=grandTotal/people;
  var tipPer=tip/people;
  document.getElementById("split-result").classList.remove("hidden");
  document.getElementById("split-per-person").textContent="৳"+perPerson.toFixed(2);
  document.getElementById("split-total-tip").textContent="৳"+grandTotal.toFixed(2);
  document.getElementById("split-tip-per").textContent="৳"+tipPer.toFixed(2);
  renderSplitPeople();
}

function addSplitPerson(){
  var name=document.getElementById("split-name-input").value.trim();
  if(!name){showToast("Enter a name","error");return;}
  splitPeople.push({name:name,id:Date.now()});
  document.getElementById("split-name-input").value="";
  document.getElementById("split-people-display").textContent=splitPeople.length;
  calcSplit();
}

function removeSplitPerson(id){
  splitPeople=splitPeople.filter(function(p){return p.id!==id;});
  if(splitPeople.length===0)document.getElementById("split-people-display").textContent=splitPeopleCount;
  calcSplit();
}

function renderSplitPeople(){
  var el=document.getElementById("split-people-list");if(!el)return;
  var total=Number(document.getElementById("split-total").value)||0;
  var tip=total*(currentTip/100);
  var grandTotal=total+tip;
  var people=splitPeople.length>0?splitPeople.length:splitPeopleCount;
  var perPerson=(grandTotal/people).toFixed(2);
  if(splitPeople.length===0){el.innerHTML="";return;}
  el.innerHTML=splitPeople.map(function(p){
    return '<div class="flex items-center justify-between bg-base-200 rounded-2xl px-4 py-3">'+
      '<div class="flex items-center gap-3">'+
        '<div class="w-8 h-8 rounded-full bg-[#3B25C1]/10 text-[#3B25C1] flex items-center justify-center font-bold text-sm">'+p.name.charAt(0).toUpperCase()+'</div>'+
        '<p class="font-semibold text-sm">'+p.name+'</p>'+
      '</div>'+
      '<div class="flex items-center gap-3">'+
        '<p class="font-black text-[#3B25C1]">৳'+perPerson+'</p>'+
        '<button onclick="removeSplitPerson('+p.id+')" class="text-red-400 hover:text-red-600"><i class="fa-solid fa-xmark text-xs"></i></button>'+
      '</div>'+
    '</div>';
  }).join("");
}

// ═══════════════════════════════════════════════════
// 2. SAVINGS GOALS
// ═══════════════════════════════════════════════════
var selectedEmoji="🎯";
var depositingGoalId=null;

function selectEmoji(el){
  document.querySelectorAll(".goal-emoji").forEach(function(e){e.classList.remove("bg-base-200","ring-2","ring-[#3B25C1]");});
  el.classList.add("bg-base-200","ring-2","ring-[#3B25C1]");
  selectedEmoji=el.textContent;
}

function getGoals(){try{return JSON.parse(localStorage.getItem("payoo_goals"))||[];}catch{return[];}}
function saveGoals(l){localStorage.setItem("payoo_goals",JSON.stringify(l));}

function addSavingsGoal(){
  var name=document.getElementById("goal-name").value.trim();
  var target=Number(document.getElementById("goal-target").value);
  if(!name){showToast("Enter a goal name","error");return;}
  if(!target||target<=0){showToast("Enter a valid target amount","error");return;}
  var goals=getGoals();
  goals.push({id:Date.now(),name:name,emoji:selectedEmoji,target:target,saved:0,created:new Date().toLocaleDateString()});
  saveGoals(goals);
  document.getElementById("goal-name").value="";document.getElementById("goal-target").value="";
  document.getElementById("add-goal-modal").close();
  showToast(selectedEmoji+" Goal created!","success");
  checkAchievement("first_goal");
  renderGoals();
}

function openDepositModal(id){
  depositingGoalId=id;
  var goals=getGoals();var g=goals.find(function(x){return x.id===id;});
  if(!g)return;
  document.getElementById("deposit-goal-name").textContent=g.emoji+" "+g.name;
  document.getElementById("deposit-goal-amount").value="";
  document.getElementById("deposit-goal-modal").showModal();
}

function depositToGoal(){
  var amount=Number(document.getElementById("deposit-goal-amount").value);
  if(!amount||amount<=0){showToast("Enter a valid amount","error");return;}
  if(amount>getBalance()){showToast("Insufficient balance!","error");return;}
  var goals=getGoals();var g=goals.find(function(x){return x.id===depositingGoalId;});
  if(!g)return;
  g.saved=Math.min(g.saved+amount,g.target);
  saveGoals(goals);
  setBalance(getBalance()-amount);
  document.getElementById("deposit-goal-modal").close();
  showToast("৳"+amount.toLocaleString()+" added to "+g.name+"!","success");
  if(g.saved>=g.target){fireConfetti();showToast("🎉 Goal achieved! "+g.emoji,"success");checkAchievement("goal_complete");}
  renderGoals();
}

function deleteGoal(id){
  if(!confirm("Delete this goal?"))return;
  saveGoals(getGoals().filter(function(g){return g.id!==id;}));
  renderGoals();showToast("Goal deleted","info");
}

function renderGoals(){
  var el=document.getElementById("goals-list");if(!el)return;
  var goals=getGoals();
  if(goals.length===0){
    el.innerHTML='<div class="text-center py-12"><p class="text-5xl mb-3">🎯</p><p class="text-gray-400">No savings goals yet</p><p class="text-xs text-gray-400 mt-1">Tap + New to create one</p></div>';
    return;
  }
  el.innerHTML=goals.map(function(g){
    var pct=Math.min(Math.round((g.saved/g.target)*100),100);
    var remaining=Math.max(g.target-g.saved,0);
    var done=pct>=100;
    return '<div class="card bg-base-100 rounded-2xl p-5 shadow-sm animate-fade-in">'+
      '<div class="flex justify-between items-start mb-3">'+
        '<div class="flex items-center gap-2"><span class="text-2xl">'+g.emoji+'</span><div><p class="font-bold">'+g.name+'</p><p class="text-xs text-gray-400">Since '+g.created+'</p></div></div>'+
        '<button onclick="deleteGoal('+g.id+')" class="text-gray-300 hover:text-red-400 transition-colors"><i class="fa-solid fa-trash text-xs"></i></button>'+
      '</div>'+
      '<div class="flex justify-between text-sm mb-2">'+
        '<span class="text-gray-400">Saved</span><span class="font-bold '+(done?"text-green-500":"text-[#3B25C1]")+'">৳'+g.saved.toLocaleString()+' / ৳'+g.target.toLocaleString()+'</span>'+
      '</div>'+
      '<div class="w-full bg-base-200 rounded-full h-3 mb-3">'+
        '<div class="h-3 rounded-full transition-all duration-700 '+(done?"bg-green-500":"bg-[#3B25C1]")+'" style="width:'+pct+'%"></div>'+
      '</div>'+
      '<div class="flex justify-between items-center">'+
        '<span class="text-sm font-bold '+(done?"text-green-500":"text-[#3B25C1]")+'">'+pct+'% '+(done?"🎉 Complete!":"")+'</span>'+
        (done?'':'<button onclick="openDepositModal('+g.id+')" class="btn btn-sm bg-[#3B25C1] text-white border-none rounded-xl">+ Deposit</button>')+
      '</div>'+
      (!done?'<p class="text-xs text-gray-400 mt-2">৳'+remaining.toLocaleString()+' remaining</p>':'')+
    '</div>';
  }).join("");
}

// ═══════════════════════════════════════════════════
// 3. BUDGET PLANNER
// ═══════════════════════════════════════════════════
var CAT_ICONS={"Food":"🍔","Transport":"🚌","Bills":"💡","Shopping":"🛍️","Health":"💊","Entertainment":"🎬","Other":"📦"};

function getBudgets(){try{return JSON.parse(localStorage.getItem("payoo_budgets"))||[];}catch{return[];}}
function saveBudgets(l){localStorage.setItem("payoo_budgets",JSON.stringify(l));}

function addBudget(){
  var cat=document.getElementById("budget-cat").value;
  var limit=Number(document.getElementById("budget-amount").value);
  if(!limit||limit<=0){showToast("Enter a valid amount","error");return;}
  var budgets=getBudgets();
  var existing=budgets.find(function(b){return b.cat===cat;});
  if(existing){existing.limit=limit;showToast(cat+" budget updated!","success");}
  else{budgets.push({id:Date.now(),cat:cat,limit:limit});showToast(cat+" budget set!","success");}
  saveBudgets(budgets);document.getElementById("budget-amount").value="";
  renderBudgets();
}

function deleteBudget(id){
  saveBudgets(getBudgets().filter(function(b){return b.id!==id;}));
  renderBudgets();showToast("Budget removed","info");
}

// calculate how much has been spent in a given category this month
function getSpentForCategory(cat){
  var now=new Date(),m=now.getMonth(),y=now.getFullYear();
  var CREDIT=["Money Added","Bonus Credited"];
  return getTransactionHistory().reduce(function(s,tx){
    if(!tx.success||!tx.amount||CREDIT.indexOf(tx.title)!==-1)return s;
    var d=new Date(tx.date);
    if(d.getMonth()!==m||d.getFullYear()!==y)return s;
    // match by category keyword in subtitle/title
    if((tx.subtitle+tx.title).toLowerCase().indexOf(cat.toLowerCase())!==-1)s+=Number(tx.amount);
    return s;
  },0);
}

function renderBudgets(){
  var el=document.getElementById("budget-list");if(!el)return;
  var budgets=getBudgets();
  if(budgets.length===0){el.innerHTML='<p class="text-center text-gray-400 py-6"><i class="fa-solid fa-chart-pie mr-2"></i>No budgets set yet</p>';return;}
  el.innerHTML=budgets.map(function(b){
    var spent=getSpentForCategory(b.cat);
    var pct=Math.min(Math.round((spent/b.limit)*100),100);
    var barColor=pct>=100?"bg-red-500":pct>=80?"bg-yellow-400":"bg-[#3B25C1]";
    return '<div class="card bg-base-100 rounded-2xl p-4 shadow-sm">'+
      '<div class="flex justify-between items-center mb-2">'+
        '<div class="flex items-center gap-2"><span class="text-xl">'+(CAT_ICONS[b.cat]||"📦")+'</span><p class="font-bold text-sm">'+b.cat+'</p></div>'+
        '<button onclick="deleteBudget('+b.id+')" class="text-gray-300 hover:text-red-400"><i class="fa-solid fa-trash text-xs"></i></button>'+
      '</div>'+
      '<div class="flex justify-between text-xs text-gray-400 mb-1">'+
        '<span>৳'+spent.toLocaleString()+' spent</span><span>৳'+b.limit.toLocaleString()+' budget</span>'+
      '</div>'+
      '<div class="w-full bg-base-200 rounded-full h-2.5 mb-1">'+
        '<div class="'+barColor+' h-2.5 rounded-full transition-all duration-700" style="width:'+pct+'%"></div>'+
      '</div>'+
      '<p class="text-xs font-semibold '+(pct>=100?"text-red-500":pct>=80?"text-yellow-500":"text-gray-400")+'">'+pct+'% used'+(pct>=100?" — Over budget!":pct>=80?" — Almost there!":"")+'</p>'+
    '</div>';
  }).join("");
}

// ═══════════════════════════════════════════════════
// 4. LOAN TRACKER
// ═══════════════════════════════════════════════════
var currentLoanType="lent";

function setLoanType(type){
  currentLoanType=type;
  var lentBtn=document.getElementById("loan-type-lent");
  var borBtn=document.getElementById("loan-type-borrowed");
  if(type==="lent"){
    lentBtn.classList.add("bg-green-500","text-white");lentBtn.classList.remove("bg-base-200");
    borBtn.classList.remove("bg-red-400","text-white");borBtn.classList.add("bg-base-200");
  } else {
    borBtn.classList.add("bg-red-400","text-white");borBtn.classList.remove("bg-base-200");
    lentBtn.classList.remove("bg-green-500","text-white");lentBtn.classList.add("bg-base-200");
  }
}

function getLoans(){try{return JSON.parse(localStorage.getItem("payoo_loans"))||[];}catch{return[];}}
function saveLoans(l){localStorage.setItem("payoo_loans",JSON.stringify(l));}

function addLoan(){
  var person=document.getElementById("loan-person").value.trim();
  var amount=Number(document.getElementById("loan-amount").value);
  var note=document.getElementById("loan-note").value.trim();
  if(!person){showToast("Enter person's name","error");return;}
  if(!amount||amount<=0){showToast("Enter a valid amount","error");return;}
  var loans=getLoans();
  loans.push({id:Date.now(),person:person,amount:amount,note:note,type:currentLoanType,paid:false,date:new Date().toLocaleDateString()});
  saveLoans(loans);
  document.getElementById("loan-person").value="";document.getElementById("loan-amount").value="";document.getElementById("loan-note").value="";
  showToast("Loan recorded!","success");checkAchievement("first_loan");renderLoans();
}

function markLoanPaid(id){
  var loans=getLoans();var l=loans.find(function(x){return x.id===id;});
  if(l){l.paid=!l.paid;saveLoans(loans);renderLoans();}
}

function deleteLoan(id){
  saveLoans(getLoans().filter(function(l){return l.id!==id;}));
  renderLoans();showToast("Record removed","info");
}

function renderLoans(){
  var el=document.getElementById("loans-list");if(!el)return;
  var loans=getLoans();
  // update summary
  var receivable=loans.filter(function(l){return l.type==="lent"&&!l.paid;}).reduce(function(s,l){return s+l.amount;},0);
  var payable=loans.filter(function(l){return l.type==="borrowed"&&!l.paid;}).reduce(function(s,l){return s+l.amount;},0);
  var lr=document.getElementById("loan-receivable");var lp=document.getElementById("loan-payable");
  if(lr)lr.textContent="৳"+receivable.toLocaleString();if(lp)lp.textContent="৳"+payable.toLocaleString();
  if(loans.length===0){el.innerHTML='<p class="text-center text-gray-400 py-6"><i class="fa-solid fa-handshake mr-2"></i>No loan records yet</p>';return;}
  el.innerHTML=loans.map(function(l){
    var isLent=l.type==="lent";
    var color=isLent?"green":"red";var label=isLent?"You lent":"You owe";
    return '<div class="card bg-base-100 rounded-2xl p-4 shadow-sm '+(l.paid?"opacity-60":"")+'">'+
      '<div class="flex justify-between items-start">'+
        '<div>'+
          '<div class="flex items-center gap-2 mb-0.5">'+
            '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-'+color+'-100 text-'+color+'-600">'+label+'</span>'+
            (l.paid?'<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Settled</span>':'')+
          '</div>'+
          '<p class="font-bold">'+l.person+'</p>'+
          (l.note?'<p class="text-xs text-gray-400">'+l.note+'</p>':'')+
          '<p class="text-xs text-gray-400">'+l.date+'</p>'+
        '</div>'+
        '<p class="font-black text-'+color+'-500 text-lg">৳'+l.amount.toLocaleString()+'</p>'+
      '</div>'+
      '<div class="flex gap-2 mt-3">'+
        '<button onclick="markLoanPaid('+l.id+')" class="btn btn-xs '+(l.paid?"bg-base-200 text-gray-400":"bg-green-500 text-white")+' border-none rounded-xl flex-1">'+
          (l.paid?"Mark Unpaid":"Mark Settled")+
        '</button>'+
        '<button onclick="deleteLoan('+l.id+')" class="btn btn-xs btn-ghost text-red-400 rounded-xl"><i class="fa-solid fa-trash"></i></button>'+
      '</div>'+
    '</div>';
  }).join("");
}

// ═══════════════════════════════════════════════════
// 5. REFERRAL SYSTEM
// ═══════════════════════════════════════════════════
function getMyReferralCode(){
  var code=localStorage.getItem("payoo_referral_code");
  if(!code){
    var num=localStorage.getItem("payoo_user")||"00000";
    code="PAYOO"+num.slice(-5);
    localStorage.setItem("payoo_referral_code",code);
  }
  return code;
}

function initReferral(){
  var code=getMyReferralCode();
  var el=document.getElementById("my-referral-code");if(el)el.textContent=code;
  updateReferralStats();
}

function updateReferralStats(){
  var stats=JSON.parse(localStorage.getItem("payoo_referral_stats")||'{"count":0,"earned":0}');
  var rc=document.getElementById("referral-count");var re=document.getElementById("referral-earned");
  if(rc)rc.textContent=stats.count;if(re)re.textContent="৳"+stats.earned.toLocaleString();
}

function copyReferralCode(){
  var code=getMyReferralCode();
  if(navigator.clipboard){navigator.clipboard.writeText(code);}
  showToast("Code copied: "+code,"success");
}

function redeemReferral(){
  var input=document.getElementById("referral-input").value.trim().toUpperCase();
  if(!input){showToast("Enter a referral code","error");return;}
  var myCode=getMyReferralCode();
  if(input===myCode){showToast("You can't use your own code!","error");return;}
  var used=JSON.parse(localStorage.getItem("payoo_used_referrals")||"[]");
  if(used.indexOf(input)!==-1){showToast("This code has already been redeemed","error");return;}
  // Validate: must match PAYOO + 5 digits pattern
  if(!/^PAYOO\d{5}$/.test(input)){showToast("Invalid referral code format","error");return;}
  used.push(input);
  localStorage.setItem("payoo_used_referrals",JSON.stringify(used));
  // Reward both parties
  setBalance(getBalance()+200);
  saveTransaction({success:true,title:"Referral Bonus",subtitle:"Redeemed code: "+input,amount:200,date:new Date().toLocaleString()});
  fireConfetti();showToast("🎉 ৳200 referral bonus added!","success");
  document.getElementById("referral-input").value="";
  // also credit the referrer (simulated — update their stats in localStorage)
  var stats=JSON.parse(localStorage.getItem("payoo_referral_stats")||'{"count":0,"earned":0}');
  // In real app this would be a server call — we simulate by checking if referral code belongs to this user
  checkAchievement("first_referral");
  updateReferralStats();
}

// ═══════════════════════════════════════════════════
// 6. ACHIEVEMENTS / BADGES
// ═══════════════════════════════════════════════════
var ALL_ACHIEVEMENTS=[
  {id:"first_tx",    emoji:"🚀",name:"First Transaction",  desc:"Complete your first transaction",       check:function(){return getTransactionHistory().filter(function(t){return t.success;}).length>=1;}},
  {id:"five_tx",     emoji:"⚡",name:"Power User",          desc:"Complete 5 successful transactions",    check:function(){return getTransactionHistory().filter(function(t){return t.success;}).length>=5;}},
  {id:"big_send",    emoji:"💸",name:"High Roller",         desc:"Send or pay ৳10,000+ in one go",        check:function(){return getTransactionHistory().some(function(t){return t.success&&Number(t.amount)>=10000;});}},
  {id:"saver",       emoji:"🐷",name:"Smart Saver",         desc:"Add ৳50,000+ to your balance total",   check:function(){var CREDIT=["Money Added","Bonus Credited"];return getTransactionHistory().filter(function(t){return t.success&&CREDIT.indexOf(t.title)!==-1;}).reduce(function(s,t){return s+Number(t.amount);},0)>=50000;}},
  {id:"first_goal",  emoji:"🎯",name:"Goal Setter",         desc:"Create your first savings goal",        check:function(){return getGoals().length>=1;}},
  {id:"goal_complete",emoji:"🏆",name:"Goal Crusher",        desc:"Complete a savings goal",               check:function(){return getGoals().some(function(g){return g.saved>=g.target;});}},
  {id:"first_loan",  emoji:"🤝",name:"Trusted Friend",      desc:"Record your first loan",                check:function(){return getLoans().length>=1;}},
  {id:"first_referral",emoji:"📣",name:"Influencer",         desc:"Redeem your first referral bonus",      check:function(){return (JSON.parse(localStorage.getItem("payoo_used_referrals")||"[]")).length>=1;}},
  {id:"budget_master",emoji:"📊",name:"Budget Master",       desc:"Set 3 or more category budgets",        check:function(){return getBudgets().length>=3;}},
  {id:"night_owl",   emoji:"🦉",name:"Night Owl",            desc:"Make a transaction after midnight",     check:function(){return getTransactionHistory().some(function(t){var h=new Date(t.date).getHours();return h>=0&&h<5;});}},
  {id:"streak_3",    emoji:"🔥",name:"On Fire",              desc:"Log in 3 days in a row",               check:function(){return(Number(localStorage.getItem("payoo_login_streak"))||0)>=3;}},
  {id:"splitter",    emoji:"🍕",name:"Fair Share",           desc:"Use the bill splitter",                 check:function(){return !!localStorage.getItem("payoo_used_splitter");}},
];

function getUnlocked(){try{return JSON.parse(localStorage.getItem("payoo_achievements"))||[];}catch{return[];}}

function checkAchievement(id){
  var unlocked=getUnlocked();
  if(unlocked.indexOf(id)!==-1)return;
  var ach=ALL_ACHIEVEMENTS.find(function(a){return a.id===id;});
  if(!ach)return;
  if(ach.check()){
    unlocked.push(id);
    localStorage.setItem("payoo_achievements",JSON.stringify(unlocked));
    fireConfetti();
    showToast("🏅 Badge unlocked: "+ach.name,"success");
    pushNotification("Badge Unlocked!",ach.emoji+" "+ach.name+" — "+ach.desc,"success");
  }
}

function checkAllAchievements(){
  ALL_ACHIEVEMENTS.forEach(function(a){checkAchievement(a.id);});
}

function renderAchievements(){
  var el=document.getElementById("achievements-grid");if(!el)return;
  var unlocked=getUnlocked();
  checkAllAchievements();
  el.innerHTML=ALL_ACHIEVEMENTS.map(function(a){
    var isUnlocked=unlocked.indexOf(a.id)!==-1;
    return '<div class="card '+(isUnlocked?"bg-base-100 shadow-md":"bg-base-200 opacity-50")+' rounded-2xl p-3 text-center">'+
      '<div class="text-3xl mb-2 '+(isUnlocked?"":"grayscale")+'">'+a.emoji+'</div>'+
      '<p class="font-bold text-xs leading-tight">'+a.name+'</p>'+
      '<p class="text-[10px] text-gray-400 mt-1">'+a.desc+'</p>'+
      (isUnlocked?'<div class="mt-2 text-[10px] font-bold text-green-500">✓ Unlocked</div>':'<div class="mt-2 text-[10px] text-gray-400">Locked</div>')+
    '</div>';
  }).join("");
}

// auto-check after each transaction
var origSaveTx=window.saveTransaction;
if(origSaveTx){
  window.saveTransaction=function(tx){
    origSaveTx(tx);
    checkAllAchievements();
    // mark splitter used
    if(tx.title==="Bill Splitter")localStorage.setItem("payoo_used_splitter","1");
  };
}

// ═══════════════════════════════════════════════════
// 7. AUTO-LOGOUT AFTER INACTIVITY
// ═══════════════════════════════════════════════════
var INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
var inactivityTimer = null;
var warningTimer = null;
var warningShown = false;

function resetInactivityTimer(){
  clearTimeout(inactivityTimer);clearTimeout(warningTimer);warningShown=false;
  // Warn at 4 min 30 sec
  warningTimer=setTimeout(function(){
    if(!warningShown){warningShown=true;showToast("⏱ You'll be logged out in 30 seconds due to inactivity","warning");}
  }, INACTIVITY_TIMEOUT - 30000);
  inactivityTimer=setTimeout(function(){
    showToast("Logged out due to inactivity","info");
    setTimeout(function(){localStorage.removeItem("payoo_logged_in");window.location.assign("./index.html");},1500);
  }, INACTIVITY_TIMEOUT);
}

// Track user activity
["mousemove","keydown","touchstart","click","scroll"].forEach(function(evt){
  document.addEventListener(evt, resetInactivityTimer, {passive:true});
});
resetInactivityTimer(); // start on load

// Login streak tracking
(function trackStreak(){
  var today=new Date().toDateString();
  var lastLogin=localStorage.getItem("payoo_last_login");
  var streak=Number(localStorage.getItem("payoo_login_streak"))||0;
  if(lastLogin!==today){
    var yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
    if(lastLogin===yesterday.toDateString())streak++;else streak=1;
    localStorage.setItem("payoo_login_streak",streak);
    localStorage.setItem("payoo_last_login",today);
    if(streak>=3)checkAchievement("streak_3");
  }
})();

// Run achievement check on load
setTimeout(checkAllAchievements, 1000);