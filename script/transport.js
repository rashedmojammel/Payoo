// ╔══════════════════════════════════════════════════════════════╗
//  TRANSPORT.JS  —  Payoo Transport & Travel Hub
//
//  8 features all inside one section using an inner tab bar:
//
//  1. Bus Pass Top-up     — recharge prepaid transport cards
//  2. Ride Share Budget   — log & track Pathao/Uber trips
//  3. Fuel Cost Calc      — calculate trip fuel cost
//  4. Travel Fund         — savings goal for a trip
//  5. Hotel Budget        — plan & save hotel costs
//  6. Flight Tracker      — watch a flight route price
//  7. Toll Fee Tracker    — log highway toll payments
//  8. Parking Fee Log     — log daily parking fees
// ╚══════════════════════════════════════════════════════════════╝


// ════════════════════════════════════════════════════════════
// FUEL PRICE TABLE (BPC rates, April 2024)
// Used by the Fuel Cost Calculator
// ════════════════════════════════════════════════════════════
var FUEL_PRICES = {
  octane: 130,   // BDT per litre
  petrol: 125,
  diesel: 109,
  cng:     43    // BDT per cubic metre
};


// ════════════════════════════════════════════════════════════
// INIT — called by machine.js when user opens Transport tab
// ════════════════════════════════════════════════════════════
function initTransport() {
  // Always start on the first tab: Bus Pass
  setTransportTab("buspass");
}


// ════════════════════════════════════════════════════════════
// TAB SWITCHER
// Shows one sub-panel, hides all others.
// Highlights the active tab button.
// ════════════════════════════════════════════════════════════

// All 8 tab IDs — used to show/hide panels
var TRANSPORT_TABS = ["buspass","rideshare","fuel","travelfund","hotel","flight","toll","parking"];

function setTransportTab(tab) {

  // Hide all panels
  TRANSPORT_TABS.forEach(function(t) {
    var panel = document.getElementById("tp-" + t);
    if (panel) panel.classList.add("hidden");
  });

  // Show the chosen panel
  var active = document.getElementById("tp-" + tab);
  if (active) active.classList.remove("hidden");

  // Style the tab buttons — active = purple, rest = gray
  TRANSPORT_TABS.forEach(function(t) {
    var btn = document.getElementById("ttab-" + t);
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
  if (tab === "buspass")    renderBusHistory();
  if (tab === "rideshare")  renderRideLog();
  if (tab === "fuel")       renderFuelHistory();
  if (tab === "travelfund") renderTravelFunds();
  if (tab === "hotel")      renderHotelList();
  if (tab === "flight")     renderFlightList();
  if (tab === "toll")       renderTollLog();
  if (tab === "parking")    renderParkingLog();
}


// ════════════════════════════════════════════════════════════
// FEATURE 1 — BUS PASS TOP-UP
// Lets user recharge a prepaid transport card.
// Deducts from wallet, logs in history.
// ════════════════════════════════════════════════════════════

// Quick-amount buttons fill the amount input
function setBusAmount(amount) {
  var el = document.getElementById("bus-amount");
  if (el) el.value = amount;
}

// Process the top-up
function doBusTopup() {
  var service = document.getElementById("bus-service").value;
  var card    = document.getElementById("bus-card").value.trim();
  var amount  = Number(document.getElementById("bus-amount").value);
  var pin     = document.getElementById("bus-pin").value.trim();

  // Validate each field
  if (!service || service === "Select service") { showToast("Select a transport service", "error"); return; }
  if (!card || card.length < 8)  { showToast("Enter a valid card number", "error"); return; }
  if (!amount || amount < 10)    { showToast("Minimum top-up is ৳10", "error"); return; }
  if (amount > getBalance())     { showToast("Insufficient balance!", "error"); return; }
  if (!pin || pin.length !== 4)  { showToast("Enter your 4-digit PIN", "error"); return; }
  if (!validatePin(pin))         { showToast("Invalid PIN", "error"); return; }

  // Deduct balance
  setBalance(getBalance() - amount);
  fireConfetti();
  showToast("৳" + amount.toLocaleString() + " topped up to " + service + " card!", "success");

  // Save to main transaction history
  var tx = {
    success:  true,
    title:    "Bus Pass Top-up",
    subtitle: service + " — Card: " + card,
    amount:   amount,
    date:     new Date().toLocaleString()
  };
  saveTransaction(tx);
  appendTransactionCard(createTransactionCard(tx));

  // Save to bus-specific history
  var history = getBusHistory();
  history.unshift({ service, card, amount, date: new Date().toLocaleString() });
  localStorage.setItem("payoo_bus_history", JSON.stringify(history.slice(0, 20)));

  // Clear inputs
  document.getElementById("bus-card").value   = "";
  document.getElementById("bus-amount").value = "";
  document.getElementById("bus-pin").value    = "";
  document.getElementById("bus-service").selectedIndex = 0;

  renderBusHistory();
}

function getBusHistory() {
  try { return JSON.parse(localStorage.getItem("payoo_bus_history") || "[]"); } catch(e) { return []; }
}

function renderBusHistory() {
  var el   = document.getElementById("bus-history");
  if (!el) return;
  var list = getBusHistory();

  if (list.length === 0) {
    el.innerHTML = '<p class="text-xs text-gray-400 py-2">No top-ups yet</p>';
    return;
  }

  el.innerHTML = list.slice(0, 5).map(function(r) {
    return (
      '<div class="flex justify-between items-center py-2 border-b border-base-200 last:border-0">' +
        '<div>' +
          '<p class="text-sm font-semibold">' + r.service + '</p>' +
          '<p class="text-xs text-gray-400">Card: ' + r.card + ' · ' + r.date + '</p>' +
        '</div>' +
        '<p class="font-bold text-sky-600">৳' + Number(r.amount).toLocaleString() + '</p>' +
      '</div>'
    );
  }).join("");
}


// ════════════════════════════════════════════════════════════
// FEATURE 2 — RIDE SHARE BUDGET
// Log trips, track monthly spending, set a budget limit.
// ════════════════════════════════════════════════════════════

function getRideLog() {
  try { return JSON.parse(localStorage.getItem("payoo_ride_log") || "[]"); } catch(e) { return []; }
}

// Set or update the monthly ride budget
function setRideBudget() {
  var input = prompt("Enter your monthly ride budget (BDT):");
  var val   = Number(input);
  if (!val || val <= 0) { showToast("Enter a valid amount", "error"); return; }
  localStorage.setItem("payoo_ride_budget", val);
  showToast("Budget set to ৳" + val.toLocaleString(), "success");
  renderRideLog();
}

// Add a new trip to the log
function logRideTrip() {
  var service = document.getElementById("rs-service").value;
  var cost    = Number(document.getElementById("rs-cost").value);
  var route   = document.getElementById("rs-route").value.trim();

  if (!cost || cost <= 0) { showToast("Enter a valid cost", "error"); return; }

  var log = getRideLog();
  log.unshift({
    service: service,
    cost:    cost,
    route:   route || "No route specified",
    date:    new Date().toLocaleString(),
    month:   new Date().getMonth() + "-" + new Date().getFullYear()
  });
  localStorage.setItem("payoo_ride_log", JSON.stringify(log.slice(0, 100)));

  showToast(service + " trip logged — ৳" + cost.toLocaleString(), "success");
  document.getElementById("rs-cost").value  = "";
  document.getElementById("rs-route").value = "";
  renderRideLog();
}

function clearRideLog() {
  if (!confirm("Clear all ride history?")) return;
  localStorage.removeItem("payoo_ride_log");
  renderRideLog();
  showToast("Ride log cleared", "info");
}

function renderRideLog() {
  var log       = getRideLog();
  var budget    = Number(localStorage.getItem("payoo_ride_budget")) || 0;
  var thisMonth = new Date().getMonth() + "-" + new Date().getFullYear();

  // Calculate this month's total and trip count
  var monthTrips = log.filter(function(r) { return r.month === thisMonth; });
  var monthTotal = monthTrips.reduce(function(sum, r) { return sum + r.cost; }, 0);

  // Update summary cards
  var elTotal = document.getElementById("rs-month-total");
  var elTrips = document.getElementById("rs-month-trips");
  var elBudget = document.getElementById("rs-budget-display");
  if (elTotal)  elTotal.textContent  = monthTotal.toLocaleString();
  if (elTrips)  elTrips.textContent  = monthTrips.length;
  if (elBudget) elBudget.textContent = budget ? budget.toLocaleString() : "—";

  // Show budget progress bar if budget is set
  var barWrap = document.getElementById("rs-bar-wrap");
  if (budget && barWrap) {
    barWrap.classList.remove("hidden");
    var pct = Math.min(Math.round((monthTotal / budget) * 100), 100);
    document.getElementById("rs-bar").style.width = pct + "%";
    document.getElementById("rs-bar").style.background = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f97316" : "#fb923c";
    document.getElementById("rs-bar-label").textContent = "৳" + monthTotal.toLocaleString() + " / ৳" + budget.toLocaleString();
    if (pct >= 100) showToast("⚠️ Ride share budget exceeded!", "warning");
  }

  // Render trip list
  var el = document.getElementById("rs-log");
  if (!el) return;
  if (log.length === 0) {
    el.innerHTML = '<p class="text-xs text-gray-400 py-2">No trips logged yet</p>';
    return;
  }

  el.innerHTML = log.slice(0, 20).map(function(r) {
    return (
      '<div class="flex justify-between items-center py-2 border-b border-base-200 last:border-0">' +
        '<div>' +
          '<p class="text-sm font-semibold">' + r.service + '</p>' +
          '<p class="text-xs text-gray-400">' + r.route + '</p>' +
          '<p class="text-xs text-gray-300">' + r.date + '</p>' +
        '</div>' +
        '<p class="font-bold text-orange-500 shrink-0">৳' + Number(r.cost).toLocaleString() + '</p>' +
      '</div>'
    );
  }).join("");
}


// ════════════════════════════════════════════════════════════
// FEATURE 3 — FUEL COST CALCULATOR
// Formula: litres = distance / mileage
//          cost   = litres × fuel price
// ════════════════════════════════════════════════════════════

function calcFuel() {
  var fuelType = document.getElementById("fuel-type").value;
  var distance = Number(document.getElementById("fuel-distance").value);
  var mileage  = Number(document.getElementById("fuel-mileage").value);
  var resultEl = document.getElementById("fuel-result");

  // Need all three values to calculate
  if (!distance || !mileage || mileage <= 0) {
    resultEl.classList.add("hidden");
    return;
  }

  var pricePerLitre = FUEL_PRICES[fuelType] || 130;
  var litresNeeded  = distance / mileage;
  var totalCost     = litresNeeded * pricePerLitre;
  var costPerKm     = totalCost / distance;

  // Update result display
  document.getElementById("fuel-cost").textContent    = Math.round(totalCost).toLocaleString();
  document.getElementById("fuel-litres").textContent  = litresNeeded.toFixed(2);
  document.getElementById("fuel-per-km").textContent  = "৳" + costPerKm.toFixed(2);

  resultEl.classList.remove("hidden");
}

// Save the calculated trip to local history
function saveFuelTrip() {
  var fuelType = document.getElementById("fuel-type").value;
  var distance = Number(document.getElementById("fuel-distance").value);
  var mileage  = Number(document.getElementById("fuel-mileage").value);
  var name     = document.getElementById("fuel-trip-name").value.trim();

  if (!distance || !mileage) { showToast("Calculate a trip first", "error"); return; }
  if (!name) { showToast("Enter a trip name", "error"); return; }

  var pricePerLitre = FUEL_PRICES[fuelType] || 130;
  var litresNeeded  = distance / mileage;
  var totalCost     = Math.round(litresNeeded * pricePerLitre);

  var history = getFuelHistory();
  history.unshift({ name, fuelType, distance, mileage, litres: litresNeeded.toFixed(2), cost: totalCost, date: new Date().toLocaleDateString() });
  localStorage.setItem("payoo_fuel_history", JSON.stringify(history.slice(0, 20)));

  showToast("Trip saved!", "success");
  document.getElementById("fuel-trip-name").value = "";
  renderFuelHistory();
}

function getFuelHistory() {
  try { return JSON.parse(localStorage.getItem("payoo_fuel_history") || "[]"); } catch(e) { return []; }
}

function renderFuelHistory() {
  var el   = document.getElementById("fuel-history");
  if (!el) return;
  var list = getFuelHistory();

  if (list.length === 0) {
    el.innerHTML = '<p class="text-xs text-gray-400 py-2">No saved trips yet</p>';
    return;
  }

  el.innerHTML = list.map(function(t) {
    return (
      '<div class="flex justify-between items-center py-2 border-b border-base-200 last:border-0">' +
        '<div>' +
          '<p class="text-sm font-semibold">' + t.name + '</p>' +
          '<p class="text-xs text-gray-400">' + t.distance + 'km · ' + t.litres + 'L ' + t.fuelType + ' · ' + t.date + '</p>' +
        '</div>' +
        '<p class="font-bold text-amber-600 shrink-0">৳' + Number(t.cost).toLocaleString() + '</p>' +
      '</div>'
    );
  }).join("");
}


// ════════════════════════════════════════════════════════════
// FEATURE 4 — TRAVEL FUND
// Dedicated savings goal for a trip.
// Money is deducted from the wallet when depositing.
// ════════════════════════════════════════════════════════════

var depositingFundId = null;  // ID of the fund currently being deposited to

function getTravelFunds() {
  try { return JSON.parse(localStorage.getItem("payoo_travel_funds") || "[]"); } catch(e) { return []; }
}

function saveTravelFunds(list) {
  localStorage.setItem("payoo_travel_funds", JSON.stringify(list));
}

// Create a new travel fund
function addTravelFund() {
  var dest   = document.getElementById("tf-dest").value.trim();
  var target = Number(document.getElementById("tf-target").value);
  var date   = document.getElementById("tf-date").value;

  if (!dest)              { showToast("Enter a destination", "error"); return; }
  if (!target || target < 1) { showToast("Enter a target amount", "error"); return; }

  var funds = getTravelFunds();
  funds.unshift({
    id:      Date.now(),
    dest:    dest,
    target:  target,
    saved:   0,
    tripDate: date || null,
    created: new Date().toLocaleDateString()
  });
  saveTravelFunds(funds);

  showToast("✈️ Travel fund for " + dest + " created!", "success");
  document.getElementById("tf-dest").value   = "";
  document.getElementById("tf-target").value = "";
  document.getElementById("tf-date").value   = "";
  renderTravelFunds();
}

// Open the deposit modal for a specific fund
function openTFDeposit(id) {
  depositingFundId = id;
  var fund = getTravelFunds().find(function(f) { return f.id === id; });
  if (!fund) return;

  document.getElementById("tf-modal-name").textContent  = "✈️ " + fund.dest;
  document.getElementById("tf-deposit-amount").value    = "";
  document.getElementById("tf-deposit-pin").value       = "";
  document.getElementById("tf-deposit-modal").showModal();
}

// Deposit money from wallet into the travel fund
function depositTravelFund() {
  var amount = Number(document.getElementById("tf-deposit-amount").value);
  var pin    = document.getElementById("tf-deposit-pin").value.trim();

  if (!amount || amount <= 0)     { showToast("Enter a valid amount", "error"); return; }
  if (amount > getBalance())      { showToast("Insufficient balance!", "error"); return; }
  if (!pin || pin.length !== 4)   { showToast("Enter your 4-digit PIN", "error"); return; }
  if (!validatePin(pin))          { showToast("Invalid PIN", "error"); return; }

  var funds = getTravelFunds();
  var fund  = funds.find(function(f) { return f.id === depositingFundId; });
  if (!fund) return;

  // Add to fund, cap at target
  fund.saved = Math.min(fund.saved + amount, fund.target);
  saveTravelFunds(funds);
  setBalance(getBalance() - amount);

  document.getElementById("tf-deposit-modal").close();
  showToast("৳" + amount.toLocaleString() + " added to " + fund.dest + " fund!", "success");

  // Celebrate if goal reached
  if (fund.saved >= fund.target) {
    fireConfetti();
    showToast("🎉 Travel fund for " + fund.dest + " is complete!", "success");
  }

  renderTravelFunds();
}

// Delete a travel fund
function deleteTravelFund(id) {
  if (!confirm("Delete this travel fund?")) return;
  saveTravelFunds(getTravelFunds().filter(function(f) { return f.id !== id; }));
  renderTravelFunds();
  showToast("Fund deleted", "info");
}

function renderTravelFunds() {
  var el    = document.getElementById("tf-list");
  if (!el)  return;
  var funds = getTravelFunds();

  if (funds.length === 0) {
    el.innerHTML = '<div class="text-center py-8 text-gray-400"><i class="fa-solid fa-plane text-3xl mb-2 opacity-30"></i><p class="text-sm">No travel funds yet</p></div>';
    return;
  }

  el.innerHTML = funds.map(function(f) {
    var pct     = Math.min(Math.round((f.saved / f.target) * 100), 100);
    var dateStr = f.tripDate ? " · Trip: " + f.tripDate : "";

    return (
      '<div class="card bg-base-100 rounded-2xl p-4 shadow-sm">' +
        '<div class="flex justify-between items-start mb-2">' +
          '<div>' +
            '<p class="font-bold">✈️ ' + f.dest + '</p>' +
            '<p class="text-xs text-gray-400">Created ' + f.created + dateStr + '</p>' +
          '</div>' +
          '<button onclick="deleteTravelFund(' + f.id + ')" class="text-red-400 hover:text-red-600 text-xs"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
        // Progress bar
        '<div class="w-full bg-base-200 rounded-full h-2 mb-1">' +
          '<div class="h-2 rounded-full bg-[#3B25C1] transition-all" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<div class="flex justify-between text-xs mb-3">' +
          '<span class="text-[#3B25C1] font-bold">৳' + f.saved.toLocaleString() + ' saved</span>' +
          '<span class="text-gray-400">৳' + f.target.toLocaleString() + ' goal (' + pct + '%)</span>' +
        '</div>' +
        (f.saved < f.target
          ? '<button onclick="openTFDeposit(' + f.id + ')" class="btn btn-sm bg-[#3B25C1] text-white border-none rounded-xl w-full">+ Add Money</button>'
          : '<div class="btn btn-sm bg-green-500 text-white border-none rounded-xl w-full pointer-events-none">✓ Goal Complete!</div>'
        ) +
      '</div>'
    );
  }).join("");
}


// ════════════════════════════════════════════════════════════
// FEATURE 5 — HOTEL BOOKING BUDGET
// Calculates nightly cost and saves the booking plan.
// ════════════════════════════════════════════════════════════

// Calculate total hotel cost from dates and nightly rate
function calcHotelCost() {
  var checkin  = document.getElementById("hotel-checkin").value;
  var checkout = document.getElementById("hotel-checkout").value;
  var rate     = Number(document.getElementById("hotel-rate").value);
  var preview  = document.getElementById("hotel-preview");

  if (!checkin || !checkout || !rate) { preview.classList.add("hidden"); return; }

  // Calculate number of nights
  var msPerDay = 1000 * 60 * 60 * 24;
  var nights   = Math.round((new Date(checkout) - new Date(checkin)) / msPerDay);

  if (nights <= 0) { preview.classList.add("hidden"); return; }

  var total = nights * rate;
  document.getElementById("hotel-nights").textContent = nights;
  document.getElementById("hotel-total").textContent  = total.toLocaleString();
  preview.classList.remove("hidden");
}

// Save a hotel budget entry
function saveHotelBudget() {
  var name     = document.getElementById("hotel-name").value.trim();
  var checkin  = document.getElementById("hotel-checkin").value;
  var checkout = document.getElementById("hotel-checkout").value;
  var rate     = Number(document.getElementById("hotel-rate").value);

  if (!name)              { showToast("Enter hotel name", "error"); return; }
  if (!checkin||!checkout){ showToast("Select check-in and check-out dates", "error"); return; }
  if (!rate || rate <= 0) { showToast("Enter price per night", "error"); return; }

  var msPerDay = 1000 * 60 * 60 * 24;
  var nights   = Math.round((new Date(checkout) - new Date(checkin)) / msPerDay);
  if (nights <= 0) { showToast("Check-out must be after check-in", "error"); return; }

  var total    = nights * rate;
  var list     = getHotelList();
  list.unshift({ id: Date.now(), name, checkin, checkout, nights, rate, total, saved: false });
  localStorage.setItem("payoo_hotel_list", JSON.stringify(list.slice(0, 20)));

  showToast("🏨 Hotel budget saved!", "success");
  document.getElementById("hotel-name").value    = "";
  document.getElementById("hotel-checkin").value = "";
  document.getElementById("hotel-checkout").value= "";
  document.getElementById("hotel-rate").value    = "";
  document.getElementById("hotel-preview").classList.add("hidden");
  renderHotelList();
}

function getHotelList() {
  try { return JSON.parse(localStorage.getItem("payoo_hotel_list") || "[]"); } catch(e) { return []; }
}

function deleteHotel(id) {
  localStorage.setItem("payoo_hotel_list", JSON.stringify(getHotelList().filter(function(h) { return h.id !== id; })));
  renderHotelList();
}

function renderHotelList() {
  var el   = document.getElementById("hotel-list");
  if (!el) return;
  var list = getHotelList();

  if (list.length === 0) {
    el.innerHTML = '<p class="text-xs text-gray-400 py-2">No hotel budgets saved</p>';
    return;
  }

  el.innerHTML = list.map(function(h) {
    return (
      '<div class="rounded-2xl bg-sky-50 p-4">' +
        '<div class="flex justify-between items-start">' +
          '<div>' +
            '<p class="font-bold text-sm">🏨 ' + h.name + '</p>' +
            '<p class="text-xs text-gray-500">' + h.checkin + ' → ' + h.checkout + ' (' + h.nights + ' nights)</p>' +
            '<p class="text-xs text-sky-600 font-semibold mt-1">৳' + h.rate.toLocaleString() + '/night × ' + h.nights + ' = <span class="text-lg font-black">৳' + h.total.toLocaleString() + '</span></p>' +
          '</div>' +
          '<button onclick="deleteHotel(' + h.id + ')" class="text-red-400 text-xs"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
      '</div>'
    );
  }).join("");
}


// ════════════════════════════════════════════════════════════
// FEATURE 6 — FLIGHT PRICE TRACKER
// Track flight routes with a budget alert price.
// (No live API — tracks user's own price research)
// ════════════════════════════════════════════════════════════

function trackFlight() {
  var from   = document.getElementById("flight-from").value;
  var to     = document.getElementById("flight-to").value;
  var date   = document.getElementById("flight-date").value;
  var budget = Number(document.getElementById("flight-budget").value);

  if (!date)           { showToast("Select a travel date", "error"); return; }
  if (!budget || budget <= 0) { showToast("Enter a budget alert price", "error"); return; }
  if (from === to)     { showToast("Origin and destination can't be the same", "error"); return; }

  var list = getFlightList();
  list.unshift({ id: Date.now(), from, to, date, budget, added: new Date().toLocaleDateString() });
  localStorage.setItem("payoo_flight_list", JSON.stringify(list.slice(0, 20)));

  showToast("🛫 " + from + " → " + to + " added to tracker!", "success");
  document.getElementById("flight-date").value   = "";
  document.getElementById("flight-budget").value = "";
  renderFlightList();
}

function getFlightList() {
  try { return JSON.parse(localStorage.getItem("payoo_flight_list") || "[]"); } catch(e) { return []; }
}

function deleteFlight(id) {
  localStorage.setItem("payoo_flight_list", JSON.stringify(getFlightList().filter(function(f) { return f.id !== id; })));
  renderFlightList();
}

function renderFlightList() {
  var el   = document.getElementById("flight-list");
  if (!el) return;
  var list = getFlightList();

  if (list.length === 0) {
    el.innerHTML = '<div class="text-center py-6 text-gray-400"><i class="fa-solid fa-plane text-3xl mb-2 opacity-30"></i><p class="text-sm">No routes tracked yet</p></div>';
    return;
  }

  el.innerHTML = list.map(function(f) {
    return (
      '<div class="rounded-2xl border-2 border-base-200 p-4">' +
        '<div class="flex justify-between items-start">' +
          '<div>' +
            '<p class="font-bold text-sm">🛫 ' + f.from + ' → ' + f.to + '</p>' +
            '<p class="text-xs text-gray-400">Travel date: ' + f.date + '</p>' +
            '<p class="text-xs text-indigo-600 font-semibold mt-1">Budget alert: ৳' + Number(f.budget).toLocaleString() + '</p>' +
          '</div>' +
          '<button onclick="deleteFlight(' + f.id + ')" class="text-red-400 text-xs"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
        '<p class="text-[10px] text-gray-300 mt-2">Added ' + f.added + '</p>' +
      '</div>'
    );
  }).join("");
}


// ════════════════════════════════════════════════════════════
// FEATURE 7 — TOLL FEE TRACKER
// Log highway toll payments. Shows monthly total.
// ════════════════════════════════════════════════════════════

function getTollLog() {
  try { return JSON.parse(localStorage.getItem("payoo_toll_log") || "[]"); } catch(e) { return []; }
}

function logToll() {
  var plaza   = document.getElementById("toll-plaza").value;
  var vehicle = document.getElementById("toll-vehicle").value;
  var amount  = Number(document.getElementById("toll-amount").value);

  if (!plaza || plaza === "Select toll plaza") { showToast("Select a toll plaza", "error"); return; }
  if (!amount || amount <= 0)                  { showToast("Enter a valid fee", "error"); return; }

  var log = getTollLog();
  log.unshift({
    plaza, vehicle, amount,
    date:  new Date().toLocaleString(),
    month: new Date().getMonth() + "-" + new Date().getFullYear()
  });
  localStorage.setItem("payoo_toll_log", JSON.stringify(log.slice(0, 100)));

  showToast("Toll logged — ৳" + amount, "success");
  document.getElementById("toll-amount").value = "";
  document.getElementById("toll-plaza").selectedIndex = 0;
  renderTollLog();
}

function clearTollLog() {
  if (!confirm("Clear all toll history?")) return;
  localStorage.removeItem("payoo_toll_log");
  renderTollLog();
}

function renderTollLog() {
  var log       = getTollLog();
  var thisMonth = new Date().getMonth() + "-" + new Date().getFullYear();
  var monthEntries = log.filter(function(t) { return t.month === thisMonth; });
  var monthTotal   = monthEntries.reduce(function(s, t) { return s + t.amount; }, 0);

  var elTotal = document.getElementById("toll-month-total");
  var elCount = document.getElementById("toll-month-count");
  if (elTotal) elTotal.textContent = monthTotal.toLocaleString();
  if (elCount) elCount.textContent = monthEntries.length;

  var el = document.getElementById("toll-log");
  if (!el) return;

  if (log.length === 0) {
    el.innerHTML = '<p class="text-xs text-gray-400 py-2">No tolls logged yet</p>';
    return;
  }

  el.innerHTML = log.slice(0, 20).map(function(t) {
    return (
      '<div class="flex justify-between items-center py-2 border-b border-base-200 last:border-0">' +
        '<div>' +
          '<p class="text-sm font-semibold">' + t.plaza + '</p>' +
          '<p class="text-xs text-gray-400">' + t.vehicle + ' · ' + t.date + '</p>' +
        '</div>' +
        '<p class="font-bold text-slate-600 shrink-0">৳' + t.amount.toLocaleString() + '</p>' +
      '</div>'
    );
  }).join("");
}


// ════════════════════════════════════════════════════════════
// FEATURE 8 — PARKING FEE LOG
// Log daily parking costs. Shows monthly & all-time totals.
// ════════════════════════════════════════════════════════════

function getParkingLog() {
  try { return JSON.parse(localStorage.getItem("payoo_parking_log") || "[]"); } catch(e) { return []; }
}

function logParking() {
  var location = document.getElementById("park-location").value.trim();
  var duration = document.getElementById("park-duration").value;
  var fee      = Number(document.getElementById("park-fee").value);

  if (!location)          { showToast("Enter parking location", "error"); return; }
  if (!fee || fee <= 0)   { showToast("Enter a valid fee", "error"); return; }

  var log = getParkingLog();
  log.unshift({
    location, duration, fee,
    date:  new Date().toLocaleString(),
    month: new Date().getMonth() + "-" + new Date().getFullYear()
  });
  localStorage.setItem("payoo_parking_log", JSON.stringify(log.slice(0, 100)));

  showToast("Parking logged — ৳" + fee, "success");
  document.getElementById("park-location").value = "";
  document.getElementById("park-fee").value      = "";
  renderParkingLog();
}

function clearParkingLog() {
  if (!confirm("Clear all parking history?")) return;
  localStorage.removeItem("payoo_parking_log");
  renderParkingLog();
}

function renderParkingLog() {
  var log       = getParkingLog();
  var thisMonth = new Date().getMonth() + "-" + new Date().getFullYear();

  var monthTotal = log.filter(function(p) { return p.month === thisMonth; })
                      .reduce(function(s, p) { return s + p.fee; }, 0);
  var allTotal   = log.reduce(function(s, p) { return s + p.fee; }, 0);

  var elMonth = document.getElementById("park-month-total");
  var elAll   = document.getElementById("park-all-total");
  if (elMonth) elMonth.textContent = monthTotal.toLocaleString();
  if (elAll)   elAll.textContent   = allTotal.toLocaleString();

  var el = document.getElementById("park-log");
  if (!el) return;

  if (log.length === 0) {
    el.innerHTML = '<p class="text-xs text-gray-400 py-2">No parking logged yet</p>';
    return;
  }

  el.innerHTML = log.slice(0, 20).map(function(p) {
    return (
      '<div class="flex justify-between items-center py-2 border-b border-base-200 last:border-0">' +
        '<div>' +
          '<p class="text-sm font-semibold">' + p.location + '</p>' +
          '<p class="text-xs text-gray-400">' + p.duration + ' · ' + p.date + '</p>' +
        '</div>' +
        '<p class="font-bold text-violet-600 shrink-0">৳' + p.fee.toLocaleString() + '</p>' +
      '</div>'
    );
  }).join("");
}