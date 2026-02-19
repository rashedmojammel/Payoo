document.getElementById("addMoney-btn").addEventListener("click", function () {
  var bank = getValueFormInput("addmoney-bank");
  if (!bank || bank === "Select Bank") { showToast("Please select a bank","warning"); return; }
  var accountNum = getValueFormInput("addMoney-input");
  if (accountNum.length !== 11) { showToast("Please enter a valid 11-digit account number","error"); return; }
  var amount = getValueFormInput("addMoney-amount");
  if (!validateAmount(amount)) return;
  var pin = getValueFormInput("addMoney-pin");
  if (!pin || pin.length !== 4) { showToast("Please enter your 4-digit PIN","error"); return; }

  if (!validatePin(pin)) {
    showToast("Invalid PIN. Please try again.","error");
    saveTransaction({ success:false, title:"Add Money Failed", subtitle:"From "+bank+" — Wrong PIN", date:new Date().toLocaleString() });
    appendTransactionCard(createTransactionCard({ success:false, title:"Add Money Failed", subtitle:"From "+bank+" — Wrong PIN", amount:null, date:new Date().toLocaleString() }));
    return;
  }

  setBalance(getBalance() + Number(amount));
  fireConfetti();
  showToast("৳"+Number(amount).toLocaleString()+" added successfully!","success");
  var tx = { success:true, title:"Money Added", subtitle:"From "+bank+" — Acc: "+accountNum, amount:amount, date:new Date().toLocaleString() };
  saveTransaction(tx);
  appendTransactionCard(createTransactionCard(tx));
  document.getElementById("addMoney-input").value="";
  document.getElementById("addMoney-amount").value="";
  document.getElementById("addMoney-pin").value="";
  document.getElementById("addmoney-bank").selectedIndex=0;
});