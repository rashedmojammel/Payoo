// ╔══════════════════════════════════════════════════════════════╗
//  FINANCE.JS  —  Payoo Finance Tools Hub
//
//  5 tools inside one section using an inner tab bar:
//
//  1. Gold & Silver Tracker  — prices + calculator + alerts
//  2. Zakat Calculator       — 2.5% on net zakatable wealth
//  3. Tax / Income Calc      — BD FY2023-24 tax slabs
//  4. FDR Calculator         — fixed deposit maturity + interest
//  5. DPS Calculator         — monthly savings scheme returns
// ╚══════════════════════════════════════════════════════════════╝


// ════════════════════════════════════════════════════════════
// INIT — called by machine.js when user opens Finance tab
// ════════════════════════════════════════════════════════════
function initFinance() {
  setFinanceTab("gold");  // always open on gold tab first
}


// ════════════════════════════════════════════════════════════
// TAB SWITCHER
// Shows one panel, hides all others, styles active button
// ════════════════════════════════════════════════════════════
var FINANCE_TABS = ["gold", "zakat", "tax", "fdr", "dps"];

function setFinanceTab(tab) {
  // Hide all panels
  FINANCE_TABS.forEach(function(t) {
    var el = document.getElementById("fp-" + t);
    if (el) el.classList.add("hidden");
  });

  // Show selected panel
  var active = document.getElementById("fp-" + tab);
  if (active) active.classList.remove("hidden");

  // Style tab buttons
  FINANCE_TABS.forEach(function(t) {
    var btn = document.getElementById("ftab-" + t);
    if (!btn) return;
    if (t === tab) {
      btn.classList.add("bg-[#3B25C1]", "text-white");
      btn.classList.remove("bg-base-200");
    } else {
      btn.classList.remove("bg-[#3B25C1]", "text-white");
      btn.classList.add("bg-base-200");
    }
  });

  // Render data for the opened tab
  if (tab === "gold")  renderGoldAlerts();
  if (tab === "fdr")   updateFDRRate();
  if (tab === "dps")   updateDPSRate();
}


// ════════════════════════════════════════════════════════════
// FEATURE 1 — GOLD & SILVER PRICE TRACKER
//
// Prices from BAJUS (Bangladesh Jewellers Assoc.) April 2024
// Calculator: user picks metal, unit, quantity → shows value
// Price Alerts: save a target price → shown in a list
// ════════════════════════════════════════════════════════════

// Current prices per gram (BDT) — update these as rates change
var METAL_PRICES = {
  gold22k:  9450,
  gold21k:  9020,
  gold18k:  7730,
  silver:   105
};

// One bhori = 11.664 grams (standard Bengali unit for gold)
var BHORI_GRAMS = 11.664;

// Calculate and show the gold/silver value
function calcGold() {
  var pricePerGram = Number(document.getElementById("gold-calc-type").value);
  var unitGrams    = Number(document.getElementById("gold-calc-unit").value);
  var qty          = Number(document.getElementById("gold-qty").value);
  var resultEl     = document.getElementById("gold-result");

  if (!qty || qty <= 0) {
    resultEl.classList.add("hidden");
    return;
  }

  var totalGrams = qty * unitGrams;
  var value      = totalGrams * pricePerGram;

  document.getElementById("gold-value").textContent = Math.round(value).toLocaleString();
  resultEl.classList.remove("hidden");
}

// ── Gold Price Alerts ──
function getGoldAlerts() {
  try { return JSON.parse(localStorage.getItem("payoo_gold_alerts") || "[]"); }
  catch(e) { return []; }
}

function setGoldAlert() {
  var type  = document.getElementById("gold-alert-type").value;
  var price = Number(document.getElementById("gold-alert-price").value);

  if (!price || price <= 0) {
    showToast("Enter a valid target price", "error");
    return;
  }

  var alerts = getGoldAlerts();
  alerts.unshift({
    id:    Date.now(),
    type:  type,          // "above" or "below"
    price: price,
    set:   new Date().toLocaleDateString()
  });
  localStorage.setItem("payoo_gold_alerts", JSON.stringify(alerts.slice(0, 10)));

  showToast("🔔 Alert set for ৳" + price.toLocaleString() + "/gram", "success");
  document.getElementById("gold-alert-price").value = "";

  // Check immediately if the alert is already triggered
  checkGoldAlerts();
  renderGoldAlerts();
}

function deleteGoldAlert(id) {
  var alerts = getGoldAlerts().filter(function(a) { return a.id !== id; });
  localStorage.setItem("payoo_gold_alerts", JSON.stringify(alerts));
  renderGoldAlerts();
}

// Check if any saved alerts are already triggered by current gold price
function checkGoldAlerts() {
  var currentPrice = METAL_PRICES.gold22k;
  getGoldAlerts().forEach(function(a) {
    if (a.type === "above" && currentPrice > a.price) {
      showToast("🔔 Gold price is above your target ৳" + a.price.toLocaleString(), "warning");
    }
    if (a.type === "below" && currentPrice < a.price) {
      showToast("🔔 Gold price is below your target ৳" + a.price.toLocaleString(), "warning");
    }
  });
}

function renderGoldAlerts() {
  var el     = document.getElementById("gold-alerts-list");
  if (!el)   return;
  var alerts = getGoldAlerts();

  if (alerts.length === 0) {
    el.innerHTML = '<p class="text-xs text-gray-400 py-1">No alerts set</p>';
    return;
  }

  el.innerHTML = alerts.map(function(a) {
    var label = a.type === "above"
      ? '<span class="text-red-500 font-bold">↑ Above</span>'
      : '<span class="text-green-600 font-bold">↓ Below</span>';
    return (
      '<div class="flex items-center justify-between bg-base-200 rounded-xl px-3 py-2">' +
        '<div class="text-sm">' + label + ' ৳' + Number(a.price).toLocaleString() + '/gram</div>' +
        '<div class="flex items-center gap-3">' +
          '<span class="text-xs text-gray-400">' + a.set + '</span>' +
          '<button onclick="deleteGoldAlert(' + a.id + ')" class="text-red-400 text-xs">' +
            '<i class="fa-solid fa-trash"></i>' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }).join("");
}


// ════════════════════════════════════════════════════════════
// FEATURE 2 — ZAKAT CALCULATOR
//
// Nisab thresholds (2024, Bangladesh):
//   Gold  nisab: 87.48g  × ৳9,450/g  = ৳826,836
//   Silver nisab: 612.36g × ৳105/g   = ৳64,298
//
// We use the silver nisab (lower, more inclusive) as the default.
// Zakat rate = 2.5% of net zakatable wealth
// ════════════════════════════════════════════════════════════

var NISAB_SILVER = 64298;   // BDT — silver nisab 2024

function calcZakat() {
  // Read all asset inputs
  var cash       = Number(document.getElementById("zk-cash").value)       || 0;
  var gold       = Number(document.getElementById("zk-gold").value)       || 0;
  var silver     = Number(document.getElementById("zk-silver").value)     || 0;
  var business   = Number(document.getElementById("zk-business").value)   || 0;
  var receivable = Number(document.getElementById("zk-receivable").value) || 0;
  var debts      = Number(document.getElementById("zk-debts").value)      || 0;

  // Net zakatable wealth = total assets − debts
  var totalAssets = cash + gold + silver + business + receivable;
  var netWealth   = Math.max(0, totalAssets - debts);
  var zakatDue    = netWealth * 0.025;   // 2.5%

  var resultEl   = document.getElementById("zakat-result");
  var belowEl    = document.getElementById("zakat-below-nisab");
  var eligibleEl = document.getElementById("zakat-eligible-msg");

  if (totalAssets === 0) {
    // Nothing entered yet — hide both result boxes
    resultEl.classList.add("hidden");
    belowEl.classList.add("hidden");
    return;
  }

  if (netWealth < NISAB_SILVER) {
    // Below nisab — zakat not obligatory
    resultEl.classList.add("hidden");
    belowEl.classList.remove("hidden");
  } else {
    // Above nisab — show zakat due
    belowEl.classList.add("hidden");
    resultEl.classList.remove("hidden");

    document.getElementById("zk-due").textContent = Math.round(zakatDue).toLocaleString();
    document.getElementById("zk-net").textContent = Math.round(netWealth).toLocaleString();
    eligibleEl.textContent = "✅ Your wealth exceeds the Nisab threshold. Zakat is obligatory.";
    eligibleEl.className   = "rounded-2xl p-4 bg-emerald-50 border border-emerald-200 text-sm text-center font-semibold text-emerald-700";
  }
}


// ════════════════════════════════════════════════════════════
// FEATURE 3 — TAX / INCOME CALCULATOR
//
// Bangladesh FY 2023-24 individual income tax slabs:
//
//  General (male):        Free up to ৳3,50,000
//  Female / 65+ / Disabled: Free up to ৳4,00,000
//  Freedom Fighter:       Free up to ৳4,75,000
//
//  After free limit:
//   Next ৳1,00,000  → 5%
//   Next ৳3,00,000  → 10%
//   Next ৳4,00,000  → 15%
//   Next ৳5,00,000  → 20%
//   Remaining        → 25%
//
// Investment rebate: 15% of actual investment (max 20% of income)
// ════════════════════════════════════════════════════════════

// Tax-free thresholds per category
var TAX_FREE = {
  general:  350000,
  female:   400000,
  freedom:  475000
};

// Tax slabs (applied after the free limit)
var TAX_SLABS = [
  { limit: 100000, rate: 0.05  },
  { limit: 300000, rate: 0.10  },
  { limit: 400000, rate: 0.15  },
  { limit: 500000, rate: 0.20  },
  { limit: Infinity, rate: 0.25 }
];

function calcTax() {
  var category = document.getElementById("tax-category").value;
  var income   = Number(document.getElementById("tax-income").value)  || 0;
  var invest   = Number(document.getElementById("tax-invest").value)  || 0;
  var resultEl = document.getElementById("tax-result");

  if (!income || income <= 0) {
    resultEl.classList.add("hidden");
    return;
  }

  var freeLimit = TAX_FREE[category] || TAX_FREE.general;

  // Taxable income after free limit
  var taxable = Math.max(0, income - freeLimit);

  // Calculate gross tax using slabs
  var grossTax  = 0;
  var remaining = taxable;
  var slabRows  = [];

  TAX_SLABS.forEach(function(slab) {
    if (remaining <= 0) return;
    var taxableInSlab = Math.min(remaining, slab.limit === Infinity ? remaining : slab.limit);
    var taxInSlab     = taxableInSlab * slab.rate;
    grossTax         += taxInSlab;
    remaining        -= taxableInSlab;

    if (taxableInSlab > 0) {
      slabRows.push({
        range: "৳" + taxableInSlab.toLocaleString(),
        rate:  Math.round(slab.rate * 100) + "%",
        tax:   Math.round(taxInSlab).toLocaleString()
      });
    }
  });

  // Investment rebate = 15% of allowable investment
  // Allowable investment = min(actual investment, 20% of income)
  var maxAllowableInvest = income * 0.20;
  var allowableInvest    = Math.min(invest, maxAllowableInvest);
  var rebate             = allowableInvest * 0.15;

  // Net tax after rebate (can't go below 0)
  var netTax     = Math.max(0, grossTax - rebate);
  var monthlyTax = netTax / 12;

  // Show results
  resultEl.classList.remove("hidden");
  document.getElementById("tax-due").textContent        = Math.round(netTax).toLocaleString();
  document.getElementById("tax-after-rebate").textContent = Math.round(netTax).toLocaleString();
  document.getElementById("tax-gross").textContent       = "৳" + Math.round(grossTax).toLocaleString();
  document.getElementById("tax-rebate-amt").textContent  = "−৳" + Math.round(rebate).toLocaleString();
  document.getElementById("tax-net").textContent         = "৳" + Math.round(netTax).toLocaleString();
  document.getElementById("tax-monthly").textContent     = "৳" + Math.round(monthlyTax).toLocaleString() + "/month";

  // Render slab breakdown table
  var slabEl = document.getElementById("tax-slabs");
  if (slabEl) {
    slabEl.innerHTML = slabRows.map(function(row) {
      return (
        '<div class="flex justify-between items-center py-1.5 border-b border-base-200 last:border-0 text-sm">' +
          '<span class="text-gray-500">On ' + row.range + ' @ ' + row.rate + '</span>' +
          '<span class="font-bold">৳' + row.tax + '</span>' +
        '</div>'
      );
    }).join("") || '<p class="text-xs text-gray-400">Income is within the tax-free limit</p>';
  }
}


// ════════════════════════════════════════════════════════════
// FEATURE 4 — FDR CALCULATOR
//
// Simple Interest:
//   Maturity = P + (P × r × t/12)
//
// Compound (Quarterly):
//   Maturity = P × (1 + r/4)^(4 × t/12)
//
// Compound (Monthly):
//   Maturity = P × (1 + r/12)^t
//
//  P = principal, r = annual rate (decimal), t = months
// ════════════════════════════════════════════════════════════

// When user picks a bank, show or hide the custom rate field
function updateFDRRate() {
  var val     = document.getElementById("fdr-bank").value;
  var wrap    = document.getElementById("fdr-custom-wrap");
  if (!wrap) return;

  if (val === "custom") {
    wrap.classList.remove("hidden");
  } else {
    wrap.classList.add("hidden");
    calcFDR();
  }
}

function calcFDR() {
  var bankVal  = document.getElementById("fdr-bank").value;
  var rate     = bankVal === "custom"
    ? Number(document.getElementById("fdr-custom-rate").value)
    : Number(bankVal);

  var principal = Number(document.getElementById("fdr-principal").value);
  var months    = Number(document.getElementById("fdr-term").value);
  var compound  = document.getElementById("fdr-compound").value;
  var resultEl  = document.getElementById("fdr-result");

  if (!principal || !rate || !months) {
    resultEl.classList.add("hidden");
    return;
  }

  var r        = rate / 100;    // annual rate as decimal
  var maturity = 0;

  if (compound === "simple") {
    // Simple interest formula
    maturity = principal + (principal * r * months / 12);

  } else if (compound === "quarterly") {
    // Compounded 4 times per year
    var quarters = months / 3;
    maturity = principal * Math.pow(1 + r / 4, quarters);

  } else if (compound === "monthly") {
    // Compounded 12 times per year
    maturity = principal * Math.pow(1 + r / 12, months);
  }

  var interest = maturity - principal;

  // Display results
  resultEl.classList.remove("hidden");
  document.getElementById("fdr-maturity").textContent    = Math.round(maturity).toLocaleString();
  document.getElementById("fdr-interest").textContent    = Math.round(interest).toLocaleString();
  document.getElementById("fdr-p-display").textContent   = Math.round(principal).toLocaleString();
  document.getElementById("fdr-rate-display").textContent = rate;
  document.getElementById("fdr-term-display").textContent = months;
}


// ════════════════════════════════════════════════════════════
// FEATURE 5 — DPS CALCULATOR
//
// DPS (Deposit Pension Scheme) = monthly savings with interest.
// Formula treats each monthly deposit as a separate investment
// that earns interest for the remaining months.
//
// Total Maturity = Σ (deposit × (1 + r/12)^n)
//   where n = number of months remaining for each deposit
//   and r = annual interest rate (decimal)
//
// This is the standard BD bank formula for DPS.
// ════════════════════════════════════════════════════════════

function updateDPSRate() {
  var val  = document.getElementById("dps-bank").value;
  var wrap = document.getElementById("dps-custom-wrap");
  if (!wrap) return;

  if (val === "custom") {
    wrap.classList.remove("hidden");
  } else {
    wrap.classList.add("hidden");
    calcDPS();
  }
}

function calcDPS() {
  var bankVal  = document.getElementById("dps-bank").value;
  var rate     = bankVal === "custom"
    ? Number(document.getElementById("dps-custom-rate").value)
    : Number(bankVal);

  var monthly  = Number(document.getElementById("dps-monthly").value);
  var tenure   = Number(document.getElementById("dps-tenure").value);
  var resultEl = document.getElementById("dps-result");

  if (!monthly || !rate || !tenure) {
    resultEl.classList.add("hidden");
    return;
  }

  var r = rate / 100;    // annual rate as decimal

  // Calculate total maturity by summing each monthly deposit's future value
  var totalMaturity = 0;
  for (var i = 1; i <= tenure; i++) {
    // Each deposit made at month i earns interest for (tenure - i + 1) months
    var monthsEarning = tenure - i + 1;
    totalMaturity    += monthly * Math.pow(1 + r / 12, monthsEarning);
  }

  var totalDeposited = monthly * tenure;
  var totalProfit    = totalMaturity - totalDeposited;

  // Show main results
  resultEl.classList.remove("hidden");
  document.getElementById("dps-maturity").textContent        = Math.round(totalMaturity).toLocaleString();
  document.getElementById("dps-profit").textContent          = Math.round(totalProfit).toLocaleString();
  document.getElementById("dps-total-deposited").textContent = Math.round(totalDeposited).toLocaleString();
  document.getElementById("dps-total-profit").textContent    = Math.round(totalProfit).toLocaleString();

  // Build year-by-year breakdown
  var breakdownEl = document.getElementById("dps-breakdown");
  if (!breakdownEl) return;

  var rows = [];
  var totalYears = Math.ceil(tenure / 12);

  for (var year = 1; year <= totalYears; year++) {
    var monthsCompleted = Math.min(year * 12, tenure);

    // Calculate maturity up to this point
    var maturityAtYear = 0;
    for (var j = 1; j <= monthsCompleted; j++) {
      var mEarning = monthsCompleted - j + 1;
      maturityAtYear += monthly * Math.pow(1 + r / 12, mEarning);
    }

    var depositedAtYear = monthly * monthsCompleted;
    var profitAtYear    = maturityAtYear - depositedAtYear;

    rows.push({ year, deposited: depositedAtYear, profit: profitAtYear, maturity: maturityAtYear });
  }

  breakdownEl.innerHTML = rows.map(function(row) {
    return (
      '<div class="flex justify-between items-center py-2 border-b border-base-200 last:border-0">' +
        '<div>' +
          '<p class="text-sm font-semibold">Year ' + row.year + '</p>' +
          '<p class="text-xs text-gray-400">Deposited: ৳' + Math.round(row.deposited).toLocaleString() + '</p>' +
        '</div>' +
        '<div class="text-right">' +
          '<p class="font-bold text-sky-700">৳' + Math.round(row.maturity).toLocaleString() + '</p>' +
          '<p class="text-xs text-green-600">+৳' + Math.round(row.profit).toLocaleString() + ' profit</p>' +
        '</div>' +
      '</div>'
    );
  }).join("");
}