// ╔══════════════════════════════════════════════════════════╗
//  UTILITIES.JS  —  Payoo Utility Bills Hub
//
//  Covers 10 bill categories:
//  Water | Electricity | Gas | Landline | Internet |
//  Cable TV | Municipal Tax | Passport | Hospital | School
//
//  Flow:
//  1. User sees a category grid
//  2. They tap a category → payment form slides in
//  3. Form has dynamic fields (provider, account/meter no.)
//  4. They enter amount + PIN → payment processed
// ╚══════════════════════════════════════════════════════════╝


// ════════════════════════════════════════════════════════════
// UTILITY DEFINITIONS
// Each entry defines:
//   title       — shown in the page header
//   icon        — Font Awesome class
//   color       — icon background colour
//   textColor   — icon colour
//   txTitle     — title used in transaction history
//   fields      — array of extra form fields rendered dynamically
//     Each field has:
//       id        — the HTML input/select element id
//       label     — label text
//       type      — "select" or "text" or "number"
//       options   — array of strings (for selects only)
//       placeholder — hint text (for inputs)
//       maxlength — max chars (for text inputs)
// ════════════════════════════════════════════════════════════

var UTILITIES = {

  wasa: {
    title:     "WASA Water Bill",
    icon:      "fa-droplet",
    color:     "#e0f2fe",
    textColor: "#0284c7",
    txTitle:   "WASA Water Bill",
    fields: [
      {
        id:          "util-wasa-zone",
        label:       "Select Zone",
        type:        "select",
        options:     ["Dhaka Zone 1", "Dhaka Zone 2", "Narayanganj", "Gazipur"]
      },
      {
        id:          "util-wasa-account",
        label:       "Account Number",
        type:        "text",
        placeholder: "Enter WASA account number",
        maxlength:   "15"
      }
    ]
  },

  electricity: {
    title:     "Electricity Bill",
    icon:      "fa-bolt",
    color:     "#fef9c3",
    textColor: "#ca8a04",
    txTitle:   "Electricity Bill",
    fields: [
      {
        id:      "util-elec-provider",
        label:   "Provider",
        type:    "select",
        options: ["DESCO", "DPDC", "BPDB", "REB / Palli Bidyut"]
      },
      {
        id:          "util-elec-meter",
        label:       "Meter / Account Number",
        type:        "text",
        placeholder: "e.g. 1234567890",
        maxlength:   "13"
      },
      {
        id:      "util-elec-type",
        label:   "Connection Type",
        type:    "select",
        options: ["Prepaid", "Postpaid"]
      }
    ]
  },

  gas: {
    title:     "Titas Gas Bill",
    icon:      "fa-fire-flame-curved",
    color:     "#fce7f3",
    textColor: "#db2777",
    txTitle:   "Titas Gas Bill",
    fields: [
      {
        id:      "util-gas-type",
        label:   "Connection Type",
        type:    "select",
        options: ["Residential", "Commercial", "Industrial"]
      },
      {
        id:          "util-gas-account",
        label:       "Bill Account Number",
        type:        "text",
        placeholder: "e.g. TT-123456",
        maxlength:   "12"
      }
    ]
  },

  landline: {
    title:     "BTCL Landline Bill",
    icon:      "fa-phone",
    color:     "#f3e8ff",
    textColor: "#7c3aed",
    txTitle:   "BTCL Landline Bill",
    fields: [
      {
        id:      "util-btcl-region",
        label:   "Region",
        type:    "select",
        options: ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet", "Barisal", "Rangpur", "Mymensingh"]
      },
      {
        id:          "util-btcl-number",
        label:       "Landline Number",
        type:        "text",
        placeholder: "e.g. 028123456",
        maxlength:   "11"
      }
    ]
  },

  internet: {
    title:     "Internet Bill",
    icon:      "fa-wifi",
    color:     "#dcfce7",
    textColor: "#16a34a",
    txTitle:   "Internet Bill",
    fields: [
      {
        id:      "util-isp-provider",
        label:   "ISP Provider",
        type:    "select",
        options: [
          "Grameenphone Home",
          "Banglalion",
          "Ranks ITT",
          "Dhaka Fiber Net",
          "Fiber @ Home",
          "Amberit",
          "Link3 Technologies",
          "Other"
        ]
      },
      {
        id:          "util-isp-account",
        label:       "Customer / Account ID",
        type:        "text",
        placeholder: "Your ISP account ID",
        maxlength:   "20"
      }
    ]
  },

  cable: {
    title:     "Cable TV Bill",
    icon:      "fa-tv",
    color:     "#ffedd5",
    textColor: "#ea580c",
    txTitle:   "Cable TV Bill",
    fields: [
      {
        id:      "util-cable-provider",
        label:   "Cable Operator",
        type:    "select",
        options: ["T&T Cable", "Digicon", "My TV", "Akash DTH", "Local Operator"]
      },
      {
        id:          "util-cable-id",
        label:       "Subscriber ID",
        type:        "text",
        placeholder: "Subscriber / set-top box ID",
        maxlength:   "15"
      }
    ]
  },

  municipal: {
    title:     "Municipal / City Tax",
    icon:      "fa-landmark",
    color:     "#e0f2fe",
    textColor: "#0369a1",
    txTitle:   "Municipal Tax",
    fields: [
      {
        id:      "util-muni-corp",
        label:   "City Corporation / Pourashava",
        type:    "select",
        options: [
          "Dhaka North City Corporation",
          "Dhaka South City Corporation",
          "Chattogram City Corporation",
          "Gazipur City Corporation",
          "Narayanganj City Corporation",
          "Other Pourashava"
        ]
      },
      {
        id:      "util-muni-type",
        label:   "Tax Type",
        type:    "select",
        options: ["Holding Tax", "Trade License", "Sign Board Tax", "Water & Sewerage Tax"]
      },
      {
        id:          "util-muni-holding",
        label:       "Holding / Reference Number",
        type:        "text",
        placeholder: "e.g. H-12345",
        maxlength:   "15"
      }
    ]
  },

  passport: {
    title:     "Passport / Govt. Fee",
    icon:      "fa-passport",
    color:     "#fef3c7",
    textColor: "#b45309",
    txTitle:   "Passport / Govt. Fee",
    fields: [
      {
        id:      "util-pass-service",
        label:   "Service Type",
        type:    "select",
        options: [
          "MRP Passport (48 pages)",
          "MRP Passport (64 pages)",
          "E-Passport (48 pages)",
          "E-Passport (64 pages)",
          "Passport Renewal",
          "NID Correction Fee",
          "Birth Certificate Fee",
          "Police Clearance Certificate"
        ]
      },
      {
        id:      "util-pass-delivery",
        label:   "Delivery Type",
        type:    "select",
        options: ["Regular (21 days)", "Express (7 days)", "Super Express (2 days)"]
      },
      {
        id:          "util-pass-nid",
        label:       "NID / Application Number",
        type:        "text",
        placeholder: "Enter your NID or application no.",
        maxlength:   "17"
      }
    ]
  },

  hospital: {
    title:     "Hospital Bill",
    icon:      "fa-hospital",
    color:     "#fee2e2",
    textColor: "#dc2626",
    txTitle:   "Hospital Bill",
    fields: [
      {
        id:      "util-hosp-name",
        label:   "Hospital / Clinic",
        type:    "select",
        options: [
          "Dhaka Medical College Hospital",
          "Square Hospital",
          "United Hospital",
          "Evercare Hospital",
          "Ibn Sina Hospital",
          "Popular Medical Centre",
          "Labaid Hospital",
          "Medinova Medical Services",
          "Other"
        ]
      },
      {
        id:      "util-hosp-type",
        label:   "Bill Type",
        type:    "select",
        options: ["OPD / Consultation", "Inpatient / Admission", "Diagnostic / Lab", "Pharmacy", "Emergency"]
      },
      {
        id:          "util-hosp-invoice",
        label:       "Invoice / Patient ID",
        type:        "text",
        placeholder: "e.g. INV-20240001",
        maxlength:   "20"
      }
    ]
  },

  school: {
    title:     "School / University Fee",
    icon:      "fa-graduation-cap",
    color:     "#dbeafe",
    textColor: "#1d4ed8",
    txTitle:   "School / University Fee",
    fields: [
      {
        id:      "util-edu-type",
        label:   "Institution Type",
        type:    "select",
        options: ["School (Primary)", "School (Secondary)", "College", "University", "Coaching Centre", "Other"]
      },
      {
        id:          "util-edu-name",
        label:       "Institution Name",
        type:        "text",
        placeholder: "e.g. BUET, Dhaka College",
        maxlength:   "40"
      },
      {
        id:      "util-edu-fee",
        label:   "Fee Type",
        type:    "select",
        options: ["Tuition Fee", "Admission Fee", "Exam Fee", "Registration Fee", "Hostel Fee", "Other"]
      },
      {
        id:          "util-edu-roll",
        label:       "Student ID / Roll Number",
        type:        "text",
        placeholder: "e.g. 2021-1-60-001",
        maxlength:   "20"
      }
    ]
  }

}; // end UTILITIES object


// ════════════════════════════════════════════════════════════
// STATE — which utility is currently selected
// ════════════════════════════════════════════════════════════

var currentUtility = null;   // key like "wasa", "electricity" etc.


// ════════════════════════════════════════════════════════════
// INIT — called by machine.js when user navigates to paybill
// ════════════════════════════════════════════════════════════

function initUtilities() {
  showUtilityGrid();         // always start on the grid view
  renderRecentUtilPayments();
}


// ════════════════════════════════════════════════════════════
// SHOW GRID
// Hides the payment form, shows the category grid
// ════════════════════════════════════════════════════════════

function showUtilityGrid() {
  currentUtility = null;

  // Show grid, hide form
  document.getElementById("util-grid").classList.remove("hidden");
  document.getElementById("util-form").classList.add("hidden");

  // Hide the back button
  document.getElementById("util-back-btn").classList.add("hidden");

  // Reset page title
  document.getElementById("util-page-title").textContent = "Pay Bills";
  document.getElementById("util-page-sub").textContent   = "Choose a utility to pay";

  // Refresh the recent payments list
  renderRecentUtilPayments();
}


// ════════════════════════════════════════════════════════════
// OPEN UTILITY
// Called when user taps a category button.
// Builds the dynamic form for that utility.
// ════════════════════════════════════════════════════════════

function openUtility(key) {
  var util = UTILITIES[key];
  if (!util) return;

  currentUtility = key;

  // Update the page header
  document.getElementById("util-page-title").textContent = util.title;
  document.getElementById("util-page-sub").textContent   = "Fill in details and pay";

  // Show back button
  document.getElementById("util-back-btn").classList.remove("hidden");

  // Hide grid, show form
  document.getElementById("util-grid").classList.add("hidden");
  document.getElementById("util-form").classList.remove("hidden");

  // Clear old amount and PIN
  document.getElementById("util-amount").value = "";
  document.getElementById("util-pin").value    = "";

  // Build the dynamic fields for this utility
  buildDynamicFields(util.fields);

  // Update pay button label
  document.getElementById("util-pay-btn").innerHTML =
    '<i class="fa-solid ' + util.icon + ' mr-2"></i>Pay ' + util.title;
}


// ════════════════════════════════════════════════════════════
// BUILD DYNAMIC FIELDS
// Renders select dropdowns and text inputs specific to
// each utility category into #util-dynamic-fields
// ════════════════════════════════════════════════════════════

function buildDynamicFields(fields) {
  var container = document.getElementById("util-dynamic-fields");
  container.innerHTML = "";   // clear previous fields

  fields.forEach(function(field) {
    // Wrapper div for each field
    var wrapper = document.createElement("div");

    // Label
    var label = document.createElement("label");
    label.className     = "label font-semibold text-sm";
    label.textContent   = field.label;
    wrapper.appendChild(label);

    if (field.type === "select") {
      // ── SELECT DROPDOWN ──
      var select = document.createElement("select");
      select.id        = field.id;
      select.className = "select rounded-2xl bg-base-200 w-full h-12";

      // Placeholder option
      var placeholder = document.createElement("option");
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.textContent = "Select " + field.label;
      select.appendChild(placeholder);

      // Real options
      field.options.forEach(function(optText) {
        var opt = document.createElement("option");
        opt.value       = optText;
        opt.textContent = optText;
        select.appendChild(opt);
      });

      wrapper.appendChild(select);

    } else {
      // ── TEXT / NUMBER INPUT ──
      var input = document.createElement("input");
      input.id          = field.id;
      input.type        = field.type || "text";
      input.className   = "input rounded-2xl bg-base-200 w-full h-12";
      input.placeholder = field.placeholder || "";
      if (field.maxlength) input.maxLength = field.maxlength;

      wrapper.appendChild(input);
    }

    container.appendChild(wrapper);
  });
}


// ════════════════════════════════════════════════════════════
// PROCESS PAYMENT
// Validates all fields, deducts balance, saves transaction
// ════════════════════════════════════════════════════════════

function processUtilityPayment() {
  if (!currentUtility) return;

  var util = UTILITIES[currentUtility];

  // ── Validate dynamic fields ──
  var fields  = util.fields;
  var details = [];   // collect field values for the transaction subtitle

  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var el    = document.getElementById(field.id);
    if (!el) continue;

    var val = el.value.trim();

    // Every field is required
    if (!val || val === "Select " + field.label) {
      showToast("Please fill in: " + field.label, "error");
      return;
    }

    details.push(val);
  }

  // ── Validate amount ──
  var amount = Number(document.getElementById("util-amount").value);
  if (!amount || amount <= 0) {
    showToast("Please enter a valid amount", "error");
    return;
  }

  var balance = getBalance();
  if (amount > balance) {
    showToast("Insufficient balance!", "error");
    return;
  }

  // ── Validate PIN ──
  var pin = document.getElementById("util-pin").value.trim();
  if (!pin || pin.length !== 4) {
    showToast("Please enter your 4-digit PIN", "error");
    return;
  }

  if (!validatePin(pin)) {
    showToast("Invalid PIN. Please try again.", "error");

    // Log the failed attempt
    var failTx = {
      success:  false,
      title:    util.txTitle + " Failed",
      subtitle: details.join(" — ") + " — Wrong PIN",
      date:     new Date().toLocaleString()
    };
    saveTransaction(failTx);
    appendTransactionCard(createTransactionCard(failTx));
    return;
  }

  // ── All good — process the payment ──
  setBalance(balance - amount);
  fireConfetti();
  showToast("✅ ৳" + Number(amount).toLocaleString() + " paid for " + util.title + "!", "success");

  // Save to main transaction history
  var tx = {
    success:  true,
    title:    util.txTitle,
    subtitle: details.join(" — "),
    amount:   amount,
    date:     new Date().toLocaleString()
  };
  saveTransaction(tx);
  appendTransactionCard(createTransactionCard(tx));

  // Save to utility-specific history (for "Recent Payments" list)
  saveUtilPayment({
    utilKey:  currentUtility,
    title:    util.title,
    icon:     util.icon,
    color:    util.color,
    textColor:util.textColor,
    subtitle: details.join(" — "),
    amount:   amount,
    date:     new Date().toLocaleString()
  });

  // Push notification
  pushNotification(
    util.txTitle + " Paid",
    "৳" + Number(amount).toLocaleString() + " — " + details.join(" · "),
    "success"
  );

  // Reset form and go back to grid
  document.getElementById("util-amount").value = "";
  document.getElementById("util-pin").value    = "";
  showUtilityGrid();
}


// ════════════════════════════════════════════════════════════
// UTILITY PAYMENT HISTORY (separate from main tx history)
// Stored as array under "payoo_util_payments"
// ════════════════════════════════════════════════════════════

function getUtilPayments() {
  try { return JSON.parse(localStorage.getItem("payoo_util_payments") || "[]"); }
  catch (e) { return []; }
}

function saveUtilPayment(record) {
  var list = getUtilPayments();
  list.unshift(record);
  if (list.length > 30) list = list.slice(0, 30);   // keep last 30
  localStorage.setItem("payoo_util_payments", JSON.stringify(list));
}

// Render the 5 most recent utility payments on the grid screen
function renderRecentUtilPayments() {
  var el = document.getElementById("util-recent");
  if (!el) return;

  var list = getUtilPayments().slice(0, 5);

  if (list.length === 0) {
    el.innerHTML = '<p class="text-xs text-gray-400 py-1">No recent utility payments</p>';
    return;
  }

  el.innerHTML = list.map(function(p) {
    return (
      '<div class="flex items-center justify-between py-2 border-b border-base-200 last:border-0">' +
        '<div class="flex items-center gap-3">' +
          // Coloured icon
          '<div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style="background:' + p.color + '">' +
            '<i class="fa-solid ' + p.icon + ' text-xs" style="color:' + p.textColor + '"></i>' +
          '</div>' +
          '<div>' +
            '<p class="text-sm font-semibold leading-tight">' + p.title + '</p>' +
            '<p class="text-[10px] text-gray-400">' + p.subtitle + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="text-right shrink-0">' +
          '<p class="font-bold text-sm text-[#3B25C1]">৳' + Number(p.amount).toLocaleString() + '</p>' +
          '<p class="text-[10px] text-gray-400">' + p.date + '</p>' +
          // Quick-repeat button
          '<button onclick="openUtility(\'' + p.utilKey + '\')" ' +
            'class="text-[10px] text-[#3B25C1] font-semibold hover:underline">Pay again</button>' +
        '</div>' +
      '</div>'
    );
  }).join("");
}