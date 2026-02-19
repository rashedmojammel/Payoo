document.getElementById("Transfer-btn").addEventListener("click", function () {
  var num = getValueFormInput("Transfer-input");
  if (!validatePhone(num)) return;
  var amount = getValueFormInput("Transfer-amount");
  var bal = getBalance();
  if (!validateAmount(amount, bal, true)) return;
  var pin = getValueFormInput("Transfer-pin");
  if (!pin || pin.length !== 4) { showToast("Please enter your 4-digit PIN","error"); return; }

  if (!validatePin(pin)) {
    showToast("Invalid PIN.","error");
    var tx = { success:false, title:"Transfer Failed", subtitle:"To: "+num+" — Wrong PIN", date:new Date().toLocaleString() };
    saveTransaction(tx); appendTransactionCard(createTransactionCard(tx)); return;
  }

  setBalance(bal - Number(amount));
  fireConfetti();
  showToast("৳"+Number(amount).toLocaleString()+" sent successfully!","success");
  var tx = { success:true, title:"Money Transferred", subtitle:"To: "+num, amount:amount, date:new Date().toLocaleString() };
  saveTransaction(tx); appendTransactionCard(createTransactionCard(tx));
  document.getElementById("Transfer-input").value="";
  document.getElementById("Transfer-amount").value="";
  document.getElementById("Transfer-pin").value="";
});