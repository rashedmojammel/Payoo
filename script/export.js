// ╔══════════════════════════════════════════════════════════╗
//  EXPORT.JS  —  Payoo Transaction Export
//  Features:
//    1. Filter by date range & transaction type
//    2. Export as CSV  (spreadsheet-ready)
//    3. Export as PDF  (formatted bank-style statement)
//    4. Live preview of filtered results
// ╚══════════════════════════════════════════════════════════╝


// ════════════════════════════════════════════════════════════
// PATCH NAV — register "export" section with existing setNav
// ════════════════════════════════════════════════════════════
(function patchExportNav() {
  var orig = window.setNav;
  if (!orig) return;

  window.setNav = function (id) {
    var el = document.getElementById("sec-export");
    if (el) el.classList.add("hidden");
    orig(id);
    if (id === "export") initExport();
  };
})();


// ════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════
var exportFiltered = []; // holds the current filtered result set


// ════════════════════════════════════════════════════════════
// INIT — called every time user opens the Export section
// ════════════════════════════════════════════════════════════
function initExport() {
  // Set default date range: first day of this month → today
  var today    = new Date();
  var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  var fromEl = document.getElementById("export-from");
  var toEl   = document.getElementById("export-to");
  if (fromEl && !fromEl.value) fromEl.value = formatDateInput(firstDay);
  if (toEl   && !toEl.value)   toEl.value   = formatDateInput(today);

  applyExportFilters();
}


// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function formatDateInput(d) {
  // Returns "YYYY-MM-DD" for <input type="date">
  var yyyy = d.getFullYear();
  var mm   = String(d.getMonth() + 1).padStart(2, "0");
  var dd   = String(d.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
}

function formatCurrency(n) {
  return "৳" + Number(n || 0).toLocaleString();
}

function txTypeLabel(tx) {
  if (!tx.success) return "Failed";
  var creditTypes = ["Money Added", "Bonus Credited", "Lucky Spin Bonus", "Referral Bonus"];
  return creditTypes.indexOf(tx.title) !== -1 ? "Credit" : "Debit";
}

function txSign(tx) {
  if (!tx.success) return "";
  var creditTypes = ["Money Added", "Bonus Credited", "Lucky Spin Bonus", "Referral Bonus"];
  return creditTypes.indexOf(tx.title) !== -1 ? "+" : "-";
}


// ════════════════════════════════════════════════════════════
// FILTER LOGIC
// ════════════════════════════════════════════════════════════
function applyExportFilters() {
  var fromVal  = (document.getElementById("export-from") || {}).value;
  var toVal    = (document.getElementById("export-to")   || {}).value;
  var typeVal  = (document.getElementById("export-type") || {}).value || "all";
  var searchVal = ((document.getElementById("export-search") || {}).value || "").toLowerCase().trim();

  var fromDate = fromVal ? new Date(fromVal + "T00:00:00") : null;
  var toDate   = toVal   ? new Date(toVal   + "T23:59:59") : null;

  var all = getTransactionHistory ? getTransactionHistory() : [];

  exportFiltered = all.filter(function (tx) {
    // Date filter
    if (fromDate || toDate) {
      var txDate = new Date(tx.date);
      if (isNaN(txDate)) return false;
      if (fromDate && txDate < fromDate) return false;
      if (toDate   && txDate > toDate)   return false;
    }

    // Type filter
    if (typeVal !== "all") {
      var label = txTypeLabel(tx).toLowerCase();
      if (typeVal === "credit" && label !== "credit") return false;
      if (typeVal === "debit"  && label !== "debit")  return false;
      if (typeVal === "failed" && label !== "failed")  return false;
    }

    // Keyword search
    if (searchVal) {
      var haystack = (tx.title + " " + tx.subtitle + " " + (tx.amount || "")).toLowerCase();
      if (haystack.indexOf(searchVal) === -1) return false;
    }

    return true;
  });

  renderExportPreview();
}


// ════════════════════════════════════════════════════════════
// PREVIEW TABLE
// ════════════════════════════════════════════════════════════
function renderExportPreview() {
  var container = document.getElementById("export-preview");
  var countEl   = document.getElementById("export-count");
  var totalEl   = document.getElementById("export-total");
  if (!container) return;

  // Summary stats
  var successTx = exportFiltered.filter(function (t) { return t.success && t.amount; });
  var creditTypes = ["Money Added", "Bonus Credited", "Lucky Spin Bonus", "Referral Bonus"];

  var totalCredit = successTx
    .filter(function (t) { return creditTypes.indexOf(t.title) !== -1; })
    .reduce(function (s, t) { return s + Number(t.amount); }, 0);

  var totalDebit = successTx
    .filter(function (t) { return creditTypes.indexOf(t.title) === -1; })
    .reduce(function (s, t) { return s + Number(t.amount); }, 0);

  if (countEl) countEl.textContent = exportFiltered.length;
  if (totalEl) totalEl.innerHTML =
    '<span class="text-green-600 font-bold">+৳' + totalCredit.toLocaleString() + '</span>' +
    '<span class="mx-2 text-gray-300">|</span>' +
    '<span class="text-red-500 font-bold">-৳' + totalDebit.toLocaleString() + '</span>';

  // Empty state
  if (exportFiltered.length === 0) {
    container.innerHTML =
      '<div class="text-center py-10 text-gray-400">' +
        '<i class="fa-solid fa-receipt text-4xl mb-3 opacity-30"></i>' +
        '<p class="text-sm font-semibold">No transactions match your filters</p>' +
        '<p class="text-xs mt-1">Try adjusting the date range or type</p>' +
      '</div>';
    return;
  }

  // Transaction rows (show up to 50 in preview)
  var previewList = exportFiltered.slice(0, 50);
  var rowsHtml = previewList.map(function (tx) {
    var typeLabel = txTypeLabel(tx);
    var sign      = txSign(tx);
    var amtStr    = tx.amount ? sign + "৳" + Number(tx.amount).toLocaleString() : "—";
    var amtColor  = typeLabel === "Credit" ? "text-green-600" : typeLabel === "Debit" ? "text-red-500" : "text-gray-400";
    var badgeColor = typeLabel === "Credit"
      ? "bg-green-100 text-green-700"
      : typeLabel === "Debit"
        ? "bg-red-100 text-red-600"
        : "bg-gray-100 text-gray-500";

    return (
      '<tr class="border-b border-base-200 hover:bg-base-200/50 transition-colors">' +
        '<td class="py-3 px-2">' +
          '<p class="text-sm font-semibold leading-tight">' + tx.title + '</p>' +
          '<p class="text-[11px] text-gray-400 leading-tight mt-0.5">' + (tx.subtitle || "") + '</p>' +
        '</td>' +
        '<td class="py-3 px-2 text-xs text-gray-400 whitespace-nowrap">' + (tx.date || "—") + '</td>' +
        '<td class="py-3 px-2">' +
          '<span class="text-[11px] font-bold px-2 py-0.5 rounded-full ' + badgeColor + '">' + typeLabel + '</span>' +
        '</td>' +
        '<td class="py-3 px-2 text-right font-bold text-sm ' + amtColor + '">' + amtStr + '</td>' +
      '</tr>'
    );
  }).join("");

  var moreNote = exportFiltered.length > 50
    ? '<p class="text-xs text-center text-gray-400 py-3">Showing 50 of ' + exportFiltered.length + ' — export to see all</p>'
    : "";

  container.innerHTML =
    '<div class="overflow-x-auto">' +
      '<table class="w-full text-left">' +
        '<thead>' +
          '<tr class="border-b-2 border-base-300">' +
            '<th class="py-2 px-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Transaction</th>' +
            '<th class="py-2 px-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>' +
            '<th class="py-2 px-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Type</th>' +
            '<th class="py-2 px-2 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Amount</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
      '</table>' +
    '</div>' +
    moreNote;
}


// ════════════════════════════════════════════════════════════
// CSV EXPORT
// ════════════════════════════════════════════════════════════
function exportFilteredCSV() {
  if (exportFiltered.length === 0) {
    showToast("No transactions to export", "warning");
    return;
  }

  var user   = localStorage.getItem("payoo_user")   || "Unknown";
  var name   = localStorage.getItem("payoo_profile_name") || "User";
  var today  = new Date().toLocaleDateString("en-GB");

  // Header meta rows
  var metaRows = [
    ['"Payoo Account Statement"'],
    ['"Account Holder"', '"' + name + '"'],
    ['"Account Number"', '"' + user + '"'],
    ['"Generated"',     '"' + today + '"'],
    ['"Total Records"', '"' + exportFiltered.length + '"'],
    [""],
  ];

  // Column headers
  var colHeaders = ['"#"', '"Date"', '"Transaction"', '"Details"', '"Type"', '"Amount (BDT)"', '"Status"'];

  // Data rows
  var dataRows = exportFiltered.map(function (tx, i) {
    return [
      i + 1,
      '"' + (tx.date || "").replace(/"/g, '""') + '"',
      '"' + (tx.title || "").replace(/"/g, '""') + '"',
      '"' + (tx.subtitle || "").replace(/"/g, '""') + '"',
      '"' + txTypeLabel(tx) + '"',
      tx.amount ? Number(tx.amount).toFixed(2) : '""',
      '"' + (tx.success ? "Success" : "Failed") + '"',
    ].join(",");
  });

  var allRows = metaRows.map(function (r) { return r.join(","); })
    .concat([colHeaders.join(",")])
    .concat(dataRows);

  var csv     = allRows.join("\n");
  var blob    = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
  var url     = URL.createObjectURL(blob);
  var dateStr = formatDateInput(new Date());
  var a       = document.createElement("a");
  a.href     = url;
  a.download = "payoo-statement-" + dateStr + ".csv";
  a.click();
  URL.revokeObjectURL(url);

  showToast("CSV downloaded (" + exportFiltered.length + " records)", "success");
  if (typeof pushNotification === "function") {
    pushNotification("Statement Exported", exportFiltered.length + " transactions saved as CSV", "success");
  }
}


// ════════════════════════════════════════════════════════════
// PDF EXPORT — opens a styled printable statement in a new tab
// ════════════════════════════════════════════════════════════
function exportFilteredPDF() {
  if (exportFiltered.length === 0) {
    showToast("No transactions to export", "warning");
    return;
  }

  var user  = localStorage.getItem("payoo_user")   || "Unknown";
  var name  = localStorage.getItem("payoo_profile_name") || "User";
  var today = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  var creditTypes = ["Money Added", "Bonus Credited", "Lucky Spin Bonus", "Referral Bonus"];
  var successTx   = exportFiltered.filter(function (t) { return t.success && t.amount; });
  var totalCredit = successTx.filter(function (t) { return creditTypes.indexOf(t.title) !== -1; })
                             .reduce(function (s, t) { return s + Number(t.amount); }, 0);
  var totalDebit  = successTx.filter(function (t) { return creditTypes.indexOf(t.title) === -1; })
                             .reduce(function (s, t) { return s + Number(t.amount); }, 0);
  var netBalance  = totalCredit - totalDebit;

  // Build table rows HTML
  var rowsHtml = exportFiltered.map(function (tx, i) {
    var typeLabel = txTypeLabel(tx);
    var sign      = txSign(tx);
    var amtStr    = tx.amount ? sign + "BDT " + Number(tx.amount).toLocaleString("en-IN") : "—";
    var rowColor  = i % 2 === 0 ? "#f9fafb" : "#ffffff";
    var statusColor = tx.success ? "#16a34a" : "#dc2626";
    var amtColor  = typeLabel === "Credit" ? "#16a34a" : typeLabel === "Debit" ? "#dc2626" : "#6b7280";
    var typeBg    = typeLabel === "Credit"
      ? "background:#dcfce7;color:#15803d"
      : typeLabel === "Debit"
        ? "background:#fee2e2;color:#dc2626"
        : "background:#f3f4f6;color:#6b7280";

    return (
      '<tr style="background:' + rowColor + '">' +
        '<td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#6b7280;text-align:center">' + (i + 1) + '</td>' +
        '<td style="padding:10px 14px;border-bottom:1px solid #f0f0f0">' +
          '<p style="font-size:13px;font-weight:700;color:#111;margin:0">' + (tx.title || "") + '</p>' +
          '<p style="font-size:11px;color:#9ca3af;margin:3px 0 0">' + (tx.subtitle || "") + '</p>' +
        '</td>' +
        '<td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:11px;color:#6b7280;white-space:nowrap">' + (tx.date || "—") + '</td>' +
        '<td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center">' +
          '<span style="font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;' + typeBg + '">' + typeLabel + '</span>' +
        '</td>' +
        '<td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:700;color:' + amtColor + ';text-align:right;white-space:nowrap">' + amtStr + '</td>' +
        '<td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:11px;font-weight:700;color:' + statusColor + '">' +
          (tx.success ? '&#10003; OK' : '&#10005; Fail') +
        '</td>' +
      '</tr>'
    );
  }).join("");

  var html = '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
  '<meta charset="UTF-8"/>' +
  '<title>Payoo Statement — ' + name + '</title>' +
  '<style>' +
    '* { margin:0; padding:0; box-sizing:border-box; }' +
    'body { font-family: "Segoe UI", Arial, sans-serif; background:#f4f6fb; color:#111; }' +
    '.page { max-width:900px; margin:0 auto; background:#fff; min-height:100vh; }' +

    /* Header */
    '.header { background:linear-gradient(135deg,#3B25C1,#7c3aed); color:#fff; padding:36px 40px; }' +
    '.header-top { display:flex; justify-content:space-between; align-items:flex-start; }' +
    '.logo { font-size:32px; font-weight:900; letter-spacing:-1px; }' +
    '.logo span { opacity:0.7; font-weight:300; }' +
    '.statement-label { font-size:11px; font-weight:600; background:rgba(255,255,255,0.2); padding:4px 12px; border-radius:99px; margin-top:6px; display:inline-block; }' +
    '.generated { font-size:11px; opacity:0.7; text-align:right; }' +

    /* Account Info */
    '.account-info { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0; border-bottom:1px solid rgba(255,255,255,0.2); padding-top:24px; }' +
    '.account-info-item { padding:0 0 0 0; }' +
    '.account-info-item:not(:last-child) { border-right:1px solid rgba(255,255,255,0.2); padding-right:24px; margin-right:24px; }' +
    '.info-label { font-size:10px; font-weight:600; opacity:0.6; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px; }' +
    '.info-value { font-size:16px; font-weight:700; }' +

    /* Summary Cards */
    '.summary { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:24px 40px; background:#f9fafb; border-bottom:1px solid #e5e7eb; }' +
    '.summary-card { background:#fff; border-radius:12px; padding:16px 20px; box-shadow:0 1px 4px rgba(0,0,0,0.06); }' +
    '.summary-card .label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#9ca3af; margin-bottom:6px; }' +
    '.summary-card .value { font-size:22px; font-weight:900; }' +
    '.summary-card .sub { font-size:11px; color:#9ca3af; margin-top:4px; }' +
    '.credit-val { color:#16a34a; }' +
    '.debit-val  { color:#dc2626; }' +
    '.net-val    { color:#3B25C1; }' +

    /* Table */
    '.table-wrap { padding:24px 40px 40px; }' +
    '.table-title { font-size:14px; font-weight:700; color:#374151; margin-bottom:16px; display:flex; align-items:center; gap:8px; }' +
    '.count-badge { background:#e0e7ff; color:#3B25C1; font-size:11px; font-weight:700; padding:2px 10px; border-radius:99px; }' +
    'table { width:100%; border-collapse:collapse; font-family:"Segoe UI",Arial,sans-serif; }' +
    'thead th { background:#3B25C1; color:#fff; padding:12px 14px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }' +
    'thead th:first-child { border-radius:8px 0 0 0; }' +
    'thead th:last-child  { border-radius:0 8px 0 0; }' +

    /* Footer */
    '.footer { background:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 40px; display:flex; justify-content:space-between; align-items:center; }' +
    '.footer-note { font-size:11px; color:#9ca3af; }' +
    '.print-btn { background:#3B25C1; color:#fff; border:none; padding:10px 24px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; }' +
    '@media print { .print-btn { display:none; } body { background:#fff; } .page { box-shadow:none; } }' +
  '</style>' +
'</head>' +
'<body>' +
'<div class="page">' +

  /* ── HEADER ── */
  '<div class="header">' +
    '<div class="header-top">' +
      '<div>' +
        '<div class="logo">Pay<span>oo</span></div>' +
        '<div class="statement-label">Account Statement</div>' +
      '</div>' +
      '<div class="generated">' +
        '<p style="font-size:13px;font-weight:700">Generated</p>' +
        '<p>' + today + '</p>' +
      '</div>' +
    '</div>' +
    '<div class="account-info" style="margin-top:24px">' +
      '<div class="account-info-item">' +
        '<div class="info-label">Account Holder</div>' +
        '<div class="info-value">' + name + '</div>' +
      '</div>' +
      '<div class="account-info-item">' +
        '<div class="info-label">Account Number</div>' +
        '<div class="info-value" style="font-family:monospace;letter-spacing:0.05em">' + user + '</div>' +
      '</div>' +
      '<div class="account-info-item">' +
        '<div class="info-label">Total Transactions</div>' +
        '<div class="info-value">' + exportFiltered.length + '</div>' +
      '</div>' +
    '</div>' +
  '</div>' +

  /* ── SUMMARY CARDS ── */
  '<div class="summary">' +
    '<div class="summary-card">' +
      '<div class="label">Total Credit</div>' +
      '<div class="value credit-val">৳' + totalCredit.toLocaleString() + '</div>' +
      '<div class="sub">Money received</div>' +
    '</div>' +
    '<div class="summary-card">' +
      '<div class="label">Total Debit</div>' +
      '<div class="value debit-val">৳' + totalDebit.toLocaleString() + '</div>' +
      '<div class="sub">Money sent / paid</div>' +
    '</div>' +
    '<div class="summary-card">' +
      '<div class="label">Net Flow</div>' +
      '<div class="value net-val">' + (netBalance >= 0 ? '+' : '') + '৳' + netBalance.toLocaleString() + '</div>' +
      '<div class="sub">Credit minus Debit</div>' +
    '</div>' +
  '</div>' +

  /* ── TRANSACTION TABLE ── */
  '<div class="table-wrap">' +
    '<div class="table-title">' +
      'Transaction History' +
      '<span class="count-badge">' + exportFiltered.length + ' records</span>' +
    '</div>' +
    '<table>' +
      '<thead>' +
        '<tr>' +
          '<th style="text-align:center;width:48px">#</th>' +
          '<th>Transaction</th>' +
          '<th style="white-space:nowrap">Date &amp; Time</th>' +
          '<th style="text-align:center">Type</th>' +
          '<th style="text-align:right">Amount</th>' +
          '<th style="text-align:center">Status</th>' +
        '</tr>' +
      '</thead>' +
      '<tbody>' + rowsHtml + '</tbody>' +
    '</table>' +
  '</div>' +

  /* ── FOOTER ── */
  '<div class="footer">' +
    '<div class="footer-note">' +
      '<p style="font-weight:700;margin-bottom:2px">Payoo Digital Wallet</p>' +
      '<p>This is a simulated statement for demonstration purposes only.</p>' +
    '</div>' +
    '<button class="print-btn" onclick="window.print()">&#128424; Print / Save PDF</button>' +
  '</div>' +

'</div>' +
'</body></html>';

  var w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();

  showToast("PDF statement opened — use Print to save!", "success");
  if (typeof pushNotification === "function") {
    pushNotification("Statement Ready", exportFiltered.length + " transactions in your PDF statement", "success");
  }
}


// ════════════════════════════════════════════════════════════
// QUICK PRESET BUTTONS  (This Month, Last Month, All Time)
// ════════════════════════════════════════════════════════════
function setExportPreset(preset) {
  var today = new Date();
  var from, to;

  if (preset === "this_month") {
    from = new Date(today.getFullYear(), today.getMonth(), 1);
    to   = today;
  } else if (preset === "last_month") {
    from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    to   = new Date(today.getFullYear(), today.getMonth(), 0);
  } else if (preset === "last_7") {
    from = new Date(today);
    from.setDate(from.getDate() - 6);
    to   = today;
  } else if (preset === "all") {
    from = new Date("2020-01-01");
    to   = today;
  }

  var fromEl = document.getElementById("export-from");
  var toEl   = document.getElementById("export-to");
  if (fromEl) fromEl.value = formatDateInput(from);
  if (toEl)   toEl.value   = formatDateInput(to);

  // Highlight active preset button
  document.querySelectorAll(".export-preset-btn").forEach(function (b) {
    b.classList.remove("bg-[#3B25C1]", "text-white");
    b.classList.add("bg-base-200");
  });
  var active = document.getElementById("preset-" + preset);
  if (active) {
    active.classList.add("bg-[#3B25C1]", "text-white");
    active.classList.remove("bg-base-200");
  }

  applyExportFilters();
}