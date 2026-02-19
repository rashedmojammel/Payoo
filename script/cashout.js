document.getElementById("cashout-btn").addEventListener("click", function () {
  var agentNum = getValueFormInput("cashout-input");
  if (!validatePhone(agentNum)) return;
  var amount = getValueFormInput("cashout-amount");
  var bal = getBalance();
  if (!validateAmount(amount, bal, true)) return;
  var pin = getValueFormInput("cashout-pin");
  if (!pin || pin.length !== 4) { showToast("Please enter your 4-digit PIN","error"); return; }

  if (agentNum !== "01890642735") {
    showToast("Agent number not found","error");
    var tx = { success:false, title:"Cashout Failed", subtitle:"Agent: "+agentNum+" — Not registered", date:new Date().toLocaleString() };
    saveTransaction(tx); appendTransactionCard(createTransactionCard(tx)); return;
  }
  if (!validatePin(pin)) {
    showToast("Invalid PIN.","error");
    var tx = { success:false, title:"Cashout Failed", subtitle:"Agent: "+agentNum+" — Wrong PIN", date:new Date().toLocaleString() };
    saveTransaction(tx); appendTransactionCard(createTransactionCard(tx)); return;
  }

  setBalance(bal - Number(amount));
  fireConfetti();
  showToast("৳"+Number(amount).toLocaleString()+" cashed out!","success");
  var tx = { success:true, title:"Cash Out", subtitle:"To Agent: "+agentNum, amount:amount, date:new Date().toLocaleString() };
  saveTransaction(tx); appendTransactionCard(createTransactionCard(tx));
  document.getElementById("cashout-input").value="";
  document.getElementById("cashout-amount").value="";
  document.getElementById("cashout-pin").value="";
});