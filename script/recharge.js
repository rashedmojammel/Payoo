// ═══════════════════════════════════════════════════
//  RECHARGE.JS  v1.0  —  Payoo Mobile Recharge
//  Operators | Prepaid / Postpaid | Quick Packages
//  Recent Recharges | Achievement Hooks
// ═══════════════════════════════════════════════════

// ─── Operator Data ────────────────────────────────
var RECHARGE_OPERATORS = {
  grameenphone: {
    label: "Grameenphone",
    color: "#0070bd",
    icon: "fa-signal",
    prepaid: [
      { amount: 19,  validity: "1 day",   data: "100MB",  tag: "" },
      { amount: 29,  validity: "3 days",  data: "200MB",  tag: "" },
      { amount: 49,  validity: "7 days",  data: "500MB",  tag: "Popular" },
      { amount: 99,  validity: "28 days", data: "1.5GB",  tag: "" },
      { amount: 149, validity: "28 days", data: "4GB",    tag: "Best Value" },
      { amount: 249, validity: "28 days", data: "10GB",   tag: "" },
      { amount: 399, validity: "28 days", data: "20GB",   tag: "" },
      { amount: 599, validity: "28 days", data: "40GB",   tag: "" },
    ],
    postpaid: [
      { amount: 200,  validity: "Monthly", data: "5GB",   tag: "" },
      { amount: 350,  validity: "Monthly", data: "12GB",  tag: "Popular" },
      { amount: 500,  validity: "Monthly", data: "25GB",  tag: "" },
      { amount: 750,  validity: "Monthly", data: "50GB",  tag: "Best Value" },
      { amount: 1000, validity: "Monthly", data: "100GB", tag: "" },
    ]
  },
  robi: {
    label: "Robi",
    color: "#e2001a",
    icon: "fa-signal",
    prepaid: [
      { amount: 19,  validity: "1 day",   data: "100MB",  tag: "" },
      { amount: 39,  validity: "7 days",  data: "500MB",  tag: "Popular" },
      { amount: 79,  validity: "28 days", data: "1GB",    tag: "" },
      { amount: 129, validity: "28 days", data: "3GB",    tag: "Best Value" },
      { amount: 219, validity: "28 days", data: "8GB",    tag: "" },
      { amount: 349, validity: "28 days", data: "16GB",   tag: "" },
      { amount: 499, validity: "28 days", data: "30GB",   tag: "" },
    ],
    postpaid: [
      { amount: 250,  validity: "Monthly", data: "7GB",   tag: "Popular" },
      { amount: 450,  validity: "Monthly", data: "15GB",  tag: "" },
      { amount: 700,  validity: "Monthly", data: "40GB",  tag: "Best Value" },
      { amount: 1200, validity: "Monthly", data: "80GB",  tag: "" },
    ]
  },
  banglalink: {
    label: "Banglalink",
    color: "#f90",
    icon: "fa-signal",
    prepaid: [
      { amount: 25,  validity: "3 days",  data: "200MB",  tag: "" },
      { amount: 45,  validity: "7 days",  data: "500MB",  tag: "Popular" },
      { amount: 89,  validity: "28 days", data: "1.5GB",  tag: "" },
      { amount: 139, validity: "28 days", data: "4GB",    tag: "Best Value" },
      { amount: 229, validity: "28 days", data: "10GB",   tag: "" },
      { amount: 369, validity: "28 days", data: "20GB",   tag: "" },
    ],
    postpaid: [
      { amount: 300,  validity: "Monthly", data: "8GB",   tag: "" },
      { amount: 500,  validity: "Monthly", data: "20GB",  tag: "Popular" },
      { amount: 900,  validity: "Monthly", data: "50GB",  tag: "Best Value" },
    ]
  },
  teletalk: {
    label: "Teletalk",
    color: "#2b9c3e",
    icon: "fa-signal",
    prepaid: [
      { amount: 15,  validity: "3 days",  data: "150MB",  tag: "" },
      { amount: 35,  validity: "7 days",  data: "400MB",  tag: "Popular" },
      { amount: 75,  validity: "28 days", data: "1GB",    tag: "" },
      { amount: 119, validity: "28 days", data: "3GB",    tag: "Best Value" },
      { amount: 199, validity: "28 days", data: "8GB",    tag: "" },
    ],
    postpaid: [
      { amount: 200, validity: "Monthly", data: "5GB",    tag: "" },
      { amount: 400, validity: "Monthly", data: "15GB",   tag: "Popular" },
      { amount: 700, validity: "Monthly", data: "35GB",   tag: "Best Value" },
    ]
  },
  airtel: {
    label: "Airtel",
    color: "#e40000",
    icon: "fa-signal",
    prepaid: [
      { amount: 29,  validity: "3 days",  data: "250MB",  tag: "" },
      { amount: 49,  validity: "7 days",  data: "600MB",  tag: "Popular" },
      { amount: 99,  validity: "28 days", data: "2GB",    tag: "" },
      { amount: 159, validity: "28 days", data: "5GB",    tag: "Best Value" },
      { amount: 269, validity: "28 days", data: "12GB",   tag: "" },
    ],
    postpaid: [
      { amount: 280,  validity: "Monthly", data: "6GB",   tag: "" },
      { amount: 480,  validity: "Monthly", data: "18GB",  tag: "Popular" },
      { amount: 850,  validity: "Monthly", data: "45GB",  tag: "Best Value" },
    ]
  }
};

// ─── State ────────────────────────────────────────
var currentOperator = "grameenphone";
var currentRechargeType = "prepaid";

// ─── Init ─────────────────────────────────────────
function initRecharge() {
  setOperator(currentOperator);
  renderRecentRecharges();
}

// ─── Operator Selector ────────────────────────────
function setOperator(op) {
  currentOperator = op;
  // Update tab styles
  document.querySelectorAll(".op-tab").forEach(function (b) {
    b.classList.remove("bg-[#3B25C1]", "text-white");
    b.classList.add("bg-base-200");
  });
  var active = document.getElementById("op-" + op);
  if (active) {
    active.classList.add("bg-[#3B25C1]", "text-white");
    active.classList.remove("bg-base-200");
  }
  renderPackages();
}

// ─── Prepaid / Postpaid Toggle ────────────────────
function setRechargeType(type) {
  currentRechargeType = type;
  document.querySelectorAll(".rtype-tab").forEach(function (b) {
    b.classList.remove("bg-[#3B25C1]", "text-white");
    b.classList.add("bg-base-200");
  });
  var active = document.getElementById("rtype-" + type);
  if (active) {
    active.classList.add("bg-[#3B25C1]", "text-white");
    active.classList.remove("bg-base-200");
  }
  // Clear selected package and amount
  document.getElementById("recharge-amount").value = "";
  renderPackages();
}

// ─── Package Grid ─────────────────────────────────
var selectedPackage = null;

function renderPackages() {
  var el = document.getElementById("recharge-packages");
  if (!el) return;
  var op = RECHARGE_OPERATORS[currentOperator];
  if (!op) return;
  var pkgs = op[currentRechargeType] || [];
  selectedPackage = null;

  el.innerHTML =
    '<p class="text-xs font-semibold text-neutral/50 mb-2 uppercase tracking-wide">' +
    op.label + " — Quick Packages</p>" +
    '<div class="grid grid-cols-2 gap-2">' +
    pkgs.map(function (pkg, i) {
      var tagHTML = pkg.tag
        ? '<span class="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ' +
          (pkg.tag === "Popular" ? "bg-[#3B25C1] text-white" : "bg-yellow-400 text-yellow-900") +
          '">' + pkg.tag + "</span>"
        : "";
      return (
        '<button onclick="selectPackage(' + i + ')" id="pkg-' + i + '" ' +
        'class="pkg-card relative text-left rounded-2xl border-2 border-base-300 bg-base-100 p-3 hover:border-[#3B25C1] transition-all">' +
        tagHTML +
        '<p class="text-lg font-black text-[#3B25C1]">৳' + pkg.amount + "</p>" +
        '<p class="text-xs font-semibold mt-0.5">' + pkg.data + "</p>" +
        '<p class="text-[10px] text-gray-400">' + pkg.validity + "</p>" +
        "</button>"
      );
    }).join("") +
    "</div>";
}

function selectPackage(i) {
  var op = RECHARGE_OPERATORS[currentOperator];
  var pkgs = op[currentRechargeType] || [];
  selectedPackage = pkgs[i];

  // Highlight selected card
  document.querySelectorAll(".pkg-card").forEach(function (c) {
    c.classList.remove("border-[#3B25C1]", "bg-[#3B25C1]/5");
    c.classList.add("border-base-300");
  });
  var card = document.getElementById("pkg-" + i);
  if (card) {
    card.classList.add("border-[#3B25C1]", "bg-[#3B25C1]/5");
    card.classList.remove("border-base-300");
  }

  // Auto-fill the amount
  var amtEl = document.getElementById("recharge-amount");
  if (amtEl) amtEl.value = selectedPackage.amount;
}

// ─── Recharge History ─────────────────────────────
function getRechargeHistory() {
  try { return JSON.parse(localStorage.getItem("payoo_recharges") || "[]"); }
  catch (e) { return []; }
}

function saveRechargeRecord(record) {
  var list = getRechargeHistory();
  list.unshift(record);
  if (list.length > 20) list = list.slice(0, 20); // cap at 20
  localStorage.setItem("payoo_recharges", JSON.stringify(list));
}

function renderRecentRecharges() {
  var el = document.getElementById("recent-recharges");
  if (!el) return;
  var list = getRechargeHistory().slice(0, 5);
  if (list.length === 0) {
    el.innerHTML = '<p class="text-xs text-gray-400 py-2">No recent recharges</p>';
    return;
  }
  el.innerHTML = list.map(function (r) {
    return (
      '<div class="flex items-center justify-between py-2 border-b border-base-200 last:border-0">' +
      '<div class="flex items-center gap-2">' +
        '<div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">' +
          '<i class="fa-solid fa-mobile-screen-button text-xs"></i>' +
        "</div>" +
        '<div>' +
          '<p class="text-sm font-semibold">' + r.number + "</p>" +
          '<p class="text-[10px] text-gray-400">' + r.operator + " · " + r.data + " · " + r.validity + "</p>" +
        "</div>" +
      "</div>" +
      '<div class="text-right">' +
        '<p class="font-bold text-sm text-green-600">৳' + Number(r.amount).toLocaleString() + "</p>" +
        '<p class="text-[10px] text-gray-400">' + r.date + "</p>" +
        '<button onclick="quickRecharge(\'' + r.number + '\',' + r.amount + ')" ' +
        'class="text-[10px] text-[#3B25C1] font-semibold hover:underline">Repeat</button>' +
      "</div>" +
      "</div>"
    );
  }).join("");
}

// ─── Quick Repeat Recharge ─────────────────────────
function quickRecharge(number, amount) {
  var numEl = document.getElementById("recharge-number");
  var amtEl = document.getElementById("recharge-amount");
  if (numEl) numEl.value = number;
  if (amtEl) amtEl.value = amount;
  // Scroll into view
  var pinEl = document.getElementById("recharge-pin");
  if (pinEl) pinEl.focus();
}

// ─── Main Recharge Handler ────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("recharge-btn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    var number = (document.getElementById("recharge-number") || {}).value;
    if (number) number = number.trim(); else number = "";
    if (!validatePhone(number)) return;

    var amtVal = (document.getElementById("recharge-amount") || {}).value;
    var amount = Number(amtVal);
    if (!amtVal || isNaN(amount) || amount < 10) {
      showToast("Minimum recharge amount is ৳10", "error");
      return;
    }

    var bal = getBalance();
    if (amount > bal) {
      showToast("Insufficient balance!", "error");
      return;
    }

    var pin = (document.getElementById("recharge-pin") || {}).value;
    if (!pin) pin = "";
    pin = pin.trim();
    if (!pin || pin.length !== 4) {
      showToast("Please enter your 4-digit PIN", "error");
      return;
    }

    if (!validatePin(pin)) {
      showToast("Invalid PIN. Please try again.", "error");
      var failTx = {
        success: false,
        title: "Recharge Failed",
        subtitle: number + " — Wrong PIN",
        date: new Date().toLocaleString()
      };
      saveTransaction(failTx);
      appendTransactionCard(createTransactionCard(failTx));
      return;
    }

    // Determine package info for the subtitle
    var op = RECHARGE_OPERATORS[currentOperator];
    var opLabel = op ? op.label : currentOperator;
    var pkgInfo = selectedPackage
      ? selectedPackage.data + " · " + selectedPackage.validity
      : currentRechargeType === "postpaid" ? "Postpaid Bill" : "Prepaid Top-up";

    // Deduct balance
    setBalance(bal - amount);
    fireConfetti();

    var successMsg = "৳" + Number(amount).toLocaleString() + " recharged to " + number + "!";
    showToast(successMsg, "success");

    // Save transaction
    var tx = {
      success: true,
      title: "Mobile Recharge",
      subtitle: opLabel + " · " + number + " — " + pkgInfo,
      amount: amount,
      date: new Date().toLocaleString()
    };
    saveTransaction(tx);
    appendTransactionCard(createTransactionCard(tx));

    // Save to recharge history
    saveRechargeRecord({
      number: number,
      operator: opLabel,
      amount: amount,
      data: selectedPackage ? selectedPackage.data : "Custom",
      validity: selectedPackage ? selectedPackage.validity : "—",
      type: currentRechargeType,
      date: new Date().toLocaleString()
    });

    // Check recharge-specific achievements
    if (typeof checkAchievement === "function") {
      checkAchievement("recharger");
      checkAchievement("recharge_5");
    }

    // Push notification
    if (typeof pushNotification === "function") {
      pushNotification(
        "Recharge Successful",
        opLabel + " · " + number + " — ৳" + Number(amount).toLocaleString(),
        "success"
      );
    }

    // Reset form
    document.getElementById("recharge-number").value = "";
    document.getElementById("recharge-amount").value = "";
    document.getElementById("recharge-pin").value = "";
    selectedPackage = null;

    // Re-render recent list & packages
    renderRecentRecharges();
    renderPackages();
  });
});