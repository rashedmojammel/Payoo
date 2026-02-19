var BONUS_COUPONS = { rashed:5000, Fatema:200, Mercy:2000 };

document.getElementById("Bonus-btn").addEventListener("click", function () {
  var coupon = getValueFormInput("Bonus-input");
  if (!coupon) { showToast("Please enter a coupon code","warning"); return; }

  var used = JSON.parse(localStorage.getItem("payoo_used_coupons") || "[]");
  if (used.indexOf(coupon) !== -1) { showToast("This coupon has already been used!","error"); return; }

  var bonus = BONUS_COUPONS[coupon];
  if (!bonus) {
    showToast("Invalid coupon code.","error");
    var tx = { success:false, title:"Bonus Failed", subtitle:'Invalid coupon: "'+coupon+'"', date:new Date().toLocaleString() };
    saveTransaction(tx); appendTransactionCard(createTransactionCard(tx)); return;
  }

  setBalance(getBalance() + bonus);
  used.push(coupon);
  localStorage.setItem("payoo_used_coupons", JSON.stringify(used));
  fireConfetti();
  showToast("🎉 Bonus of ৳"+bonus.toLocaleString()+" added!","success");
  var tx = { success:true, title:"Bonus Credited", subtitle:'Coupon: "'+coupon+'"', amount:bonus, date:new Date().toLocaleString() };
  saveTransaction(tx); appendTransactionCard(createTransactionCard(tx));
  document.getElementById("Bonus-input").value="";
});