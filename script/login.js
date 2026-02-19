// ─── Rate Limiting ────────────────────────────────────────────────────────────
var MAX_ATTEMPTS = 3;
var LOCKOUT_DURATION = 30 * 1000; // 30 seconds

function getLockState() {
  try { return JSON.parse(localStorage.getItem("payoo_lock") || "{}"); }
  catch { return {}; }
}
function saveLockState(state) {
  localStorage.setItem("payoo_lock", JSON.stringify(state));
}
function isLockedOut() {
  var state = getLockState();
  if (!state.lockedUntil) return false;
  if (Date.now() < state.lockedUntil) return true;
  saveLockState({ attempts: 0, lockedUntil: null });
  return false;
}
function getRemainingLockSeconds() {
  var state = getLockState();
  return Math.ceil((state.lockedUntil - Date.now()) / 1000);
}
function recordFailedAttempt() {
  var state = getLockState();
  state.attempts = (state.attempts || 0) + 1;
  if (state.attempts >= MAX_ATTEMPTS) state.lockedUntil = Date.now() + LOCKOUT_DURATION;
  saveLockState(state);
  return state;
}
function resetAttempts() { saveLockState({ attempts: 0, lockedUntil: null }); }
function getAttempts() { return getLockState().attempts || 0; }

// ─── Countdown Timer ──────────────────────────────────────────────────────────
var countdownInterval = null;

function startCountdown() {
  var btn = document.getElementById("login-btn");
  var countdownEl = document.getElementById("lockout-countdown");
  clearInterval(countdownInterval);
  btn.disabled = true;

  countdownInterval = setInterval(function () {
    if (!isLockedOut()) {
      clearInterval(countdownInterval);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i>Login';
      if (countdownEl) countdownEl.classList.add("hidden");
      return;
    }
    var secs = getRemainingLockSeconds();
    btn.innerHTML = '<i class="fa-solid fa-lock mr-2"></i>Locked (' + secs + 's)';
    if (countdownEl) {
      countdownEl.classList.remove("hidden");
      countdownEl.textContent = "Too many failed attempts. Try again in " + secs + " seconds.";
    }
  }, 500);
}

// ─── Init: check lock on page load ───────────────────────────────────────────
(function () {
  if (isLockedOut()) {
    startCountdown();
  } else {
    var attempts = getAttempts();
    if (attempts > 0) {
      var rem = MAX_ATTEMPTS - attempts;
      showLoginToast(rem + " attempt" + (rem === 1 ? "" : "s") + " remaining before lockout", "warning");
    }
  }
})();

// ─── Login Handler ────────────────────────────────────────────────────────────
document.getElementById("login-btn").addEventListener("click", function () {
  if (isLockedOut()) {
    showLoginToast("Account locked. Wait " + getRemainingLockSeconds() + "s.", "error");
    return;
  }

  var number = document.getElementById("number-input").value.trim();
  var pin    = document.getElementById("input-pin").value.trim();

  if (!number || number.length !== 11) {
    showLoginToast("Please enter a valid 11-digit mobile number", "error");
    return;
  }
  if (!pin || pin.length !== 4) {
    showLoginToast("Please enter your 4-digit PIN", "error");
    return;
  }

  if (number === "01890642735" && pin === "6427") {
    resetAttempts();
    localStorage.setItem("payoo_logged_in", "true");
    localStorage.setItem("payoo_user", number);
    showLoginToast("Login successful! Redirecting...", "success");
    setTimeout(function () { window.location.assign("./home.html"); }, 1000);
  } else {
    var state = recordFailedAttempt();
    document.getElementById("input-pin").value = "";
    if (state.lockedUntil) {
      showLoginToast("Too many failed attempts! Locked for 30 seconds.", "error");
      startCountdown();
    } else {
      var remaining = MAX_ATTEMPTS - state.attempts;
      showLoginToast("Wrong number or PIN. " + remaining + " attempt" + (remaining === 1 ? "" : "s") + " left.", "error");
    }
  }
});

// ─── Toast Helper ─────────────────────────────────────────────────────────────
function showLoginToast(message, type) {
  var container = document.getElementById("login-toast");
  if (!container) {
    container = document.createElement("div");
    container.id = "login-toast";
    container.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm";
    document.body.appendChild(container);
  }
  var colors = { success: "bg-green-500", error: "bg-red-500", warning: "bg-yellow-500" };
  var icons  = { success: "fa-circle-check", error: "fa-circle-xmark", warning: "fa-triangle-exclamation" };
  container.innerHTML = '<div class="flex items-center gap-3 ' + colors[type] + ' text-white px-4 py-3 rounded-2xl shadow-lg"><i class="fa-solid ' + icons[type] + '"></i><span class="text-sm font-semibold">' + message + '</span></div>';
  setTimeout(function () { container.innerHTML = ""; }, 3500);
}