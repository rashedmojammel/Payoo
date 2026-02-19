// ╔══════════════════════════════════════════════════════════╗
//  NEWFEATURES.JS  —  Payoo Extra Features
//  1. EMI Calculator  (loan installment calculator)
//  2. Lucky Spin      (daily prize wheel)
//  3. Notes / Memos   (personal sticky notes)
// ╚══════════════════════════════════════════════════════════╝


// ════════════════════════════════════════════════════════════
// FEATURE 1 ── EMI CALCULATOR
//
// Formula:  EMI = P × r × (1+r)^n  /  ((1+r)^n − 1)
//   P = principal loan amount
//   r = monthly interest rate  (annual% / 12 / 100)
//   n = number of months
// ════════════════════════════════════════════════════════════

// Called by machine.js setNav("emi")
function initEMI() {
  // Just make sure result is hidden when user first opens the page
  var result = document.getElementById("emi-result");
  if (result) result.classList.add("hidden");
}

// Called every time any input changes (oninput on each field)
function calculateEMI() {

  // Read values from the three input boxes
  var principal = Number(document.getElementById("emi-amount").value);
  var annualRate = Number(document.getElementById("emi-rate").value);
  var months     = Number(document.getElementById("emi-months").value);

  // Hide result if inputs are not filled yet
  var resultBox = document.getElementById("emi-result");
  if (!principal || !annualRate || !months || months < 1) {
    resultBox.classList.add("hidden");
    return;
  }

  // Convert annual rate → monthly rate
  var r = annualRate / 12 / 100;

  // EMI formula
  var emi;
  if (r === 0) {
    // 0% interest — simple division
    emi = principal / months;
  } else {
    var factor = Math.pow(1 + r, months);
    emi = (principal * r * factor) / (factor - 1);
  }

  var totalPayment  = emi * months;
  var totalInterest = totalPayment - principal;

  // Update the displayed numbers
  document.getElementById("emi-monthly").textContent  = Math.round(emi).toLocaleString();
  document.getElementById("emi-total").textContent    = Math.round(totalPayment).toLocaleString();
  document.getElementById("emi-interest").textContent = Math.round(totalInterest).toLocaleString();

  // Update the principal vs interest bar widths
  var principalPct = Math.round((principal / totalPayment) * 100);
  var interestPct  = 100 - principalPct;
  document.getElementById("emi-bar-principal").style.width = principalPct + "%";
  document.getElementById("emi-bar-interest").style.width  = interestPct  + "%";

  // Show the result card
  resultBox.classList.remove("hidden");
}


// ════════════════════════════════════════════════════════════
// FEATURE 2 ── LUCKY SPIN
//
// Rules:
//  • Player can spin ONCE per day (date stored in localStorage)
//  • Wheel has 8 segments with different prizes
//  • If they win bonus money it is added to their balance
// ════════════════════════════════════════════════════════════

// Prize segments — label shown on wheel, bonus amount in BDT
var SPIN_PRIZES = [
  { label: "৳50",    amount: 50,   color: "#3B25C1" },
  { label: "৳0",     amount: 0,    color: "#d1d5db" },
  { label: "৳200",   amount: 200,  color: "#7c3aed" },
  { label: "৳0",     amount: 0,    color: "#d1d5db" },
  { label: "৳100",   amount: 100,  color: "#06b6d4" },
  { label: "৳500",   amount: 500,  color: "#f59e0b" },
  { label: "৳20",    amount: 20,   color: "#10b981" },
  { label: "৳0",     amount: 0,    color: "#d1d5db" },
];

// Total degrees in the wheel, updated as wheel spins
var spinCurrentDeg = 0;
// Prevents clicking Spin twice during animation
var spinIsAnimating = false;

// Called by machine.js setNav("spin")
function initSpin() {
  drawWheel();
  updateSpinStatus();
}

// Draw the wheel using a CSS conic-gradient
function drawWheel() {
  var wheel = document.getElementById("spin-wheel");
  if (!wheel) return;

  var numSegments = SPIN_PRIZES.length;
  var segDeg      = 360 / numSegments;   // degrees per segment

  // Build a conic-gradient string: each prize gets one coloured slice
  var gradientParts = SPIN_PRIZES.map(function(prize, i) {
    var start = i * segDeg;
    var end   = start + segDeg;
    return prize.color + " " + start + "deg " + end + "deg";
  });

  wheel.style.background = "conic-gradient(" + gradientParts.join(", ") + ")";

  // Draw text labels — each label is absolutely positioned and rotated
  var labelsContainer = document.getElementById("spin-labels");
  if (!labelsContainer) return;
  labelsContainer.innerHTML = "";

  SPIN_PRIZES.forEach(function(prize, i) {
    // Angle pointing to the centre of this segment
    var angle = i * segDeg + segDeg / 2;

    // Create a label element
    var label       = document.createElement("div");
    label.textContent = prize.label;
    label.style.cssText = [
      "position: absolute",
      "top: 50%",
      "left: 50%",
      "font-size: 11px",
      "font-weight: 900",
      "color: white",
      "text-shadow: 0 1px 3px rgba(0,0,0,0.6)",
      "white-space: nowrap",
      // Rotate to the segment angle, then push outward (64px = ~half radius)
      "transform: rotate(" + angle + "deg) translateY(-72px) rotate(-" + angle + "deg)",
      "transform-origin: 0 0",
    ].join(";");

    labelsContainer.appendChild(label);
  });
}

// Show status text (e.g. "Already spun today")
function updateSpinStatus() {
  var statusEl = document.getElementById("spin-status");
  var spinBtn  = document.getElementById("spin-btn");
  if (!statusEl || !spinBtn) return;

  var today     = new Date().toDateString();
  var lastSpun  = localStorage.getItem("payoo_last_spin");

  if (lastSpun === today) {
    // Already spun today — disable the button
    statusEl.textContent = "You've already spun today. Come back tomorrow! 🌙";
    spinBtn.disabled  = true;
    spinBtn.classList.add("opacity-50", "cursor-not-allowed");

    // Also hide the ping dot on the home grid button
    var ping = document.getElementById("spin-ping");
    if (ping) ping.classList.add("hidden");
  } else {
    statusEl.textContent = "You have a free spin available today! 🎉";
    spinBtn.disabled = false;
    spinBtn.classList.remove("opacity-50", "cursor-not-allowed");
  }
}

// Main spin logic — runs when user taps "Spin!"
function doSpin() {
  // Prevent double-click during animation
  if (spinIsAnimating) return;

  // Check if already spun today
  var today    = new Date().toDateString();
  var lastSpun = localStorage.getItem("payoo_last_spin");
  if (lastSpun === today) {
    showToast("You already spun today! Try again tomorrow 🌙", "warning");
    return;
  }

  // Pick a random prize index
  var prizeIndex = Math.floor(Math.random() * SPIN_PRIZES.length);
  var prize      = SPIN_PRIZES[prizeIndex];

  // Each segment is 360/8 = 45 degrees.
  // We spin at least 5 full rotations (1800°) plus the offset
  // so the WINNING segment lands under the pointer (top centre).
  var segDeg      = 360 / SPIN_PRIZES.length;
  var targetOffset = 360 - (prizeIndex * segDeg + segDeg / 2);
  var totalSpin    = 1800 + targetOffset;

  // Apply rotation via CSS transition
  spinCurrentDeg  += totalSpin;
  spinIsAnimating  = true;

  var wheel = document.getElementById("spin-wheel");
  wheel.style.transform = "rotate(" + spinCurrentDeg + "deg)";

  // Disable button during spin
  var spinBtn  = document.getElementById("spin-btn");
  var statusEl = document.getElementById("spin-status");
  spinBtn.disabled = true;
  statusEl.textContent = "Spinning… 🎰";

  // After the 4-second CSS animation ends, show the result
  setTimeout(function() {
    spinIsAnimating = false;

    // Mark today's spin as used
    localStorage.setItem("payoo_last_spin", today);

    if (prize.amount > 0) {
      // Win! Add the money to balance
      setBalance(getBalance() + prize.amount);
      fireConfetti();
      showToast("🎉 You won ৳" + prize.amount + "!", "success");
      statusEl.textContent = "🎊 You won ৳" + prize.amount + "! Balance updated.";

      // Save as a transaction so it shows in history
      var tx = {
        success:  true,
        title:    "Lucky Spin Bonus",
        subtitle: "Spin prize — ৳" + prize.amount,
        amount:   prize.amount,
        date:     new Date().toLocaleString()
      };
      saveTransaction(tx);
      appendTransactionCard(createTransactionCard(tx));

      // Check achievements
      if (typeof checkAchievement === "function") {
        checkAchievement("first_tx");
      }

    } else {
      // No prize this time
      showToast("Better luck next time! 😅", "info");
      statusEl.textContent = "No prize this time. Try again tomorrow!";
    }

    // Update button state (disable until tomorrow)
    updateSpinStatus();

  }, 4200); // slightly longer than the 4s CSS transition
}


// ════════════════════════════════════════════════════════════
// FEATURE 3 ── NOTES / MEMOS
//
// Users can create colour-coded sticky notes.
// Notes are saved to localStorage as an array of objects.
// Each note has: id, title, body, color, date
// ════════════════════════════════════════════════════════════

// The currently selected colour for a new note
var selectedNoteColor = "yellow";

// Colour → Tailwind background class map
var NOTE_COLORS = {
  yellow: "bg-yellow-100",
  green:  "bg-green-100",
  blue:   "bg-blue-100",
  pink:   "bg-pink-100",
  purple: "bg-purple-100",
};

// Colour → border class map
var NOTE_BORDERS = {
  yellow: "border-yellow-300",
  green:  "border-green-300",
  blue:   "border-blue-300",
  pink:   "border-pink-300",
  purple: "border-purple-300",
};

// ── Colour picker ──
function setNoteColor(color) {
  selectedNoteColor = color;

  // Remove the ring from all buttons, then add it to the picked one
  document.querySelectorAll(".note-color-btn").forEach(function(btn) {
    btn.style.outline = "";
  });
  var picked = document.getElementById("nc-" + color);
  if (picked) picked.style.outline = "3px solid #3B25C1";
}

// Initialise the colour picker ring on page load
(function initNoteColorPicker() {
  // Wait for DOM ready
  document.addEventListener("DOMContentLoaded", function() {
    setNoteColor("yellow"); // default colour
  });
})();

// ── Storage helpers ──
function getNotes() {
  try {
    return JSON.parse(localStorage.getItem("payoo_notes") || "[]");
  } catch (e) {
    return [];
  }
}

function saveNotes(list) {
  localStorage.setItem("payoo_notes", JSON.stringify(list));
}

// ── Add a new note ──
function addNote() {
  var title = document.getElementById("note-title").value.trim();
  var body  = document.getElementById("note-body").value.trim();

  if (!title) {
    showToast("Please enter a note title", "error");
    return;
  }

  // Build the note object
  var note = {
    id:    Date.now(),           // unique ID = current timestamp
    title: title,
    body:  body,
    color: selectedNoteColor,
    date:  new Date().toLocaleDateString()
  };

  // Prepend (newest first) and save
  var list = getNotes();
  list.unshift(note);
  saveNotes(list);

  // Clear the form inputs
  document.getElementById("note-title").value = "";
  document.getElementById("note-body").value  = "";

  showToast("Note saved! 📝", "success");
  renderNotes();
}

// ── Delete a note by its id ──
function deleteNote(id) {
  var list = getNotes().filter(function(n) { return n.id !== id; });
  saveNotes(list);
  renderNotes();
  showToast("Note deleted", "info");
}

// ── Render all notes to the screen ──
function renderNotes() {
  var container = document.getElementById("notes-list");
  if (!container) return;

  var notes = getNotes();

  // Show a friendly empty state
  if (notes.length === 0) {
    container.innerHTML =
      '<div class="text-center py-10 text-gray-400">' +
        '<i class="fa-solid fa-note-sticky text-4xl mb-3 opacity-30"></i>' +
        '<p class="text-sm">No notes yet. Add one above!</p>' +
      '</div>';
    return;
  }

  // Build each note card
  container.innerHTML = notes.map(function(note) {
    var bgClass     = NOTE_COLORS[note.color]  || "bg-yellow-100";
    var borderClass = NOTE_BORDERS[note.color] || "border-yellow-300";

    return (
      '<div class="rounded-2xl border-2 p-4 ' + bgClass + ' ' + borderClass + '">' +
        '<div class="flex justify-between items-start">' +
          '<p class="font-bold text-sm flex-1 mr-2">' + escapeHtml(note.title) + '</p>' +
          '<button onclick="deleteNote(' + note.id + ')" ' +
            'class="text-gray-400 hover:text-red-500 transition-colors shrink-0">' +
            '<i class="fa-solid fa-trash text-xs"></i>' +
          '</button>' +
        '</div>' +
        (note.body
          ? '<p class="text-xs text-gray-600 mt-2 leading-relaxed">' + escapeHtml(note.body) + '</p>'
          : '') +
        '<p class="text-[10px] text-gray-400 mt-3">' + note.date + '</p>' +
      '</div>'
    );
  }).join("");
}

// ── Safety helper — prevents XSS in note text ──
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}