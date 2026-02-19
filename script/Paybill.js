document.getElementById("paybill-btn").addEventListener("click", function () {
  var bank = getValueFormInput("paybill-bank");
  if (!bank || bank === "Select Bank") { showToast("Please select a bank","warning"); return; }
  var billerNum = getValueFormInput("paybill-input");
  if (billerNum.length !== 11) { showToast("Enter a valid 11-digit account number","error"); return; }
  var amount = getValueFormInput("paybill-amount");
  var bal = getBalance();
  if (!validateAmount(amount, bal, true)) return;
  var pin = getValueFormInput("paybill-pin");
  if (!pin || pin.length !== 4) { showToast("Please enter your 4-digit PIN","error"); return; }

  if (!validatePin(pin)) {
    showToast("Invalid PIN.","error");
    var tx = { success:false, title:"Bill Payment Failed", subtitle:bank+" — Wrong PIN", date:new Date().toLocaleString() };
    saveTransaction(tx); appendTransactionCard(createTransactionCard(tx)); return;
  }

  setBalance(bal - Number(amount));
  fireConfetti();
  showToast("Bill of ৳"+Number(amount).toLocaleString()+" paid!","success");
  var tx = { success:true, title:"Bill Paid", subtitle:"To: "+bank+" — Acc: "+billerNum, amount:amount, date:new Date().toLocaleString() };
  saveTransaction(tx); appendTransactionCard(createTransactionCard(tx));
  document.getElementById("paybill-input").value="";
  document.getElementById("paybill-amount").value="";
  document.getElementById("paybill-pin").value="";
  document.getElementById("paybill-bank").selectedIndex=0;
});