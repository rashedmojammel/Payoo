// ╔══════════════════════════════════════════════════════════╗
//  LOGIN.JS  —  Payoo Authentication
//  Handles: Login  |  Sign Up  |  Rate Limiting / Lockout
// ╚══════════════════════════════════════════════════════════╝


// ════════════════════════════════════════════════════════════
// RATE LIMITING  (login only)
// After 3 wrong attempts the user is locked out for 30 seconds
// ════════════════════════════════════════════════════════════

var MAX_ATTEMPTS      = 3;
var LOCKOUT_MS        = 30 * 1000;   // 30 seconds in milliseconds
var countdownInterval = null;        // holds the setInterval reference


// Read lockout state from localStorage
function getLockState() {
  try { return JSON.parse(localStorage.getItem("payoo_lock") || "{}"); }
  catch (e) { return {}; }
}

// Save lockout state to localStorage
function saveLockState(state) {
  localStorage.setItem("payoo_lock", JSON.stringify(state));
}

// Returns true if the user is currently locked out
function isLockedOut() {
  var state = getLockState();
  if (!state.lockedUntil) return false;

  if (Date.now() < state.lockedUntil) {
    return true;   // still locked
  }

  // Lock has expired — reset it
  saveLockState({ attempts: 0, lockedUntil: null });
  return false;
}

// How many seconds remain in the lockout
function getRemainingSeconds() {
  var state = getLockState();
  return Math.ceil((state.lockedUntil - Date.now()) / 1000);
}

// Record one failed login attempt; triggers lockout if limit reached
function recordFailedAttempt() {
  var state = getLockState();
  state.attempts = (state.attempts || 0) + 1;

  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_MS;
  }

  saveLockState(state);
  return state;
}

// Clear all failed attempts after a successful login
function resetAttempts() {
  saveLockState({ attempts: 0, lockedUntil: null });
}

// Start the countdown timer shown on the login button
function startCountdown() {
  var btn         = document.getElementById("login-btn");
  var countdownEl = document.getElementById("lockout-countdown");
  clearInterval(countdownInterval);
  if (btn) btn.disabled = true;

  countdownInterval = setInterval(function () {
    if (!isLockedOut()) {
      // Lock expired — re-enable everything
      clearInterval(countdownInterval);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i>Login';
      }
      if (countdownEl) countdownEl.classList.add("hidden");
      return;
    }

    var secs = getRemainingSeconds();
    if (btn) btn.innerHTML = '<i class="fa-solid fa-lock mr-2"></i>Locked (' + secs + 's)';
    if (countdownEl) {
      countdownEl.classList.remove("hidden");
      countdownEl.textContent = "Too many failed attempts. Try again in " + secs + " seconds.";
    }
  }, 500);
}

// Check lockout state when the page first loads
(function checkLockOnLoad() {
  if (isLockedOut()) {
    startCountdown();
  } else {
    var attempts = (getLockState().attempts || 0);
    if (attempts > 0) {
      var remaining = MAX_ATTEMPTS - attempts;
      showAuthToast(remaining + " attempt" + (remaining === 1 ? "" : "s") + " remaining before lockout", "warning");
    }
  }
})();


// ════════════════════════════════════════════════════════════
// HELPER — get all registered accounts from localStorage
// Accounts are stored as an array:
//   [ { name, number, pin }, { name, number, pin }, ... ]
// ════════════════════════════════════════════════════════════

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem("payoo_accounts") || "[]");
  } catch (e) {
    return [];
  }
}

function saveAccounts(list) {
  localStorage.setItem("payoo_accounts", JSON.stringify(list));
}


// ════════════════════════════════════════════════════════════
// LOGIN HANDLER
// Called when user clicks the Login button
// ════════════════════════════════════════════════════════════

function handleLogin() {
  // Don't allow login while locked out
  if (isLockedOut()) {
    showAuthToast("Account locked. Wait " + getRemainingSeconds() + "s.", "error");
    return;
  }

  var number = document.getElementById("login-number").value.trim();
  var pin    = document.getElementById("login-pin").value.trim();

  // ── Basic field validation ──
  if (!number || number.length !== 11) {
    showAuthToast("Please enter a valid 11-digit number", "error");
    return;
  }
  if (!pin || pin.length !== 4) {
    showAuthToast("Please enter your 4-digit PIN", "error");
    return;
  }

  // ── Check the demo account first ──
  var isDemoAccount = (number === "01890642735" && pin === "6427");

  // Give the demo account its own starting balance of ৳45,000
  if (isDemoAccount && !localStorage.getItem("payoo_balance_01890642735")) {
    localStorage.setItem("payoo_balance_01890642735", "45000");
  }

  // ── Check registered accounts ──
  var accounts   = getAccounts();
  var foundUser  = accounts.find(function (acc) {
    return acc.number === number && acc.pin === pin;
  });

  if (isDemoAccount || foundUser) {
    // ✅ Successful login
    resetAttempts();
    localStorage.setItem("payoo_logged_in", "true");
    localStorage.setItem("payoo_user", number);

    // Save the profile name if it's a real registered account
    if (foundUser) {
      localStorage.setItem("payoo_profile_name", foundUser.name);
    }

    // ── Per-user balance system ──
    // Each account has its own balance key: "payoo_balance_<number>"
    // This way switching users never shows the wrong balance.
    var userBalanceKey = "payoo_balance_" + number;

    if (!localStorage.getItem(userBalanceKey)) {
      // First time this account ever logs in — give them ৳500
      localStorage.setItem(userBalanceKey, "500");
    }

    // Always write the active balance so home.html reads the right value
    localStorage.setItem("payoo_balance", localStorage.getItem(userBalanceKey));

    showAuthToast("Login successful! Redirecting…", "success");
    setTimeout(function () { window.location.assign("./home.html"); }, 1000);

  } else {
    // ❌ Wrong credentials
    var state     = recordFailedAttempt();
    document.getElementById("login-pin").value = "";

    if (state.lockedUntil) {
      showAuthToast("Too many failed attempts! Locked for 30 seconds.", "error");
      startCountdown();
    } else {
      var left = MAX_ATTEMPTS - state.attempts;
      showAuthToast("Wrong number or PIN. " + left + " attempt" + (left === 1 ? "" : "s") + " left.", "error");
    }
  }
}


// ════════════════════════════════════════════════════════════
// SIGN UP HANDLER
// Called when user clicks "Create Account"
// ════════════════════════════════════════════════════════════

function handleSignup() {
  var name       = document.getElementById("signup-name").value.trim();
  var number     = document.getElementById("signup-number").value.trim();
  var pin        = document.getElementById("signup-pin").value.trim();
  var confirmPin = document.getElementById("signup-confirm-pin").value.trim();

  // ── Validate: Name ──
  if (!name || name.length < 2) {
    showAuthToast("Please enter your full name", "error");
    return;
  }

  // ── Validate: Number must be exactly 11 digits ──
  if (!number || number.length !== 11) {
    showAuthToast("Please enter a valid 11-digit number", "error");
    return;
  }

  // ── Validate: Number must start with 01 (BD mobile format) ──
  if (!number.startsWith("01")) {
    showAuthToast("Number must start with 01", "error");
    return;
  }

  // ── Validate: PIN must be exactly 4 digits ──
  if (!pin || pin.length !== 4) {
    showAuthToast("PIN must be exactly 4 digits", "error");
    return;
  }

  // ── Validate: No weak PINs ──
  var allSame    = /^(.)\1+$/.test(pin);
  var sequential = (pin === "1234" || pin === "0000" || pin === "9999");
  if (allSame || sequential) {
    showAuthToast("PIN is too weak. Avoid patterns like 1234 or 0000", "warning");
    return;
  }

  // ── Validate: Confirm PIN matches ──
  if (pin !== confirmPin) {
    showAuthToast("PINs do not match. Please try again", "error");
    document.getElementById("signup-confirm-pin").value = "";
    return;
  }

  // ── Check: number already registered? ──
  var accounts = getAccounts();
  var alreadyExists = accounts.find(function (acc) { return acc.number === number; });
  if (alreadyExists || number === "01890642735") {
    showAuthToast("This number is already registered. Please login.", "warning");
    return;
  }

  // ── All checks passed — save the new account ──
  var newAccount = {
    name:   name,
    number: number,
    pin:    pin,
    joined: new Date().toLocaleDateString()
  };

  accounts.push(newAccount);
  saveAccounts(accounts);

  // Give the new user a starting balance of ৳500
  // (only set this flag; actual balance loads when they login)
  localStorage.setItem("payoo_new_user_balance_" + number, "500");

  showAuthToast("Account created! Please login 🎉", "success");

  // Switch to the Login tab and pre-fill their number
  setTimeout(function () {
    showTab("login");
    document.getElementById("login-number").value = number;
    document.getElementById("login-pin").focus();
  }, 1200);
}


// ════════════════════════════════════════════════════════════
// Also handle Enter key on login fields for convenience
// ════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", function () {

  // Press Enter on the login PIN field → trigger login
  var loginPin = document.getElementById("login-pin");
  if (loginPin) {
    loginPin.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleLogin();
    });
  }

  // Press Enter on confirm-pin field → trigger signup
  var confirmPin = document.getElementById("signup-confirm-pin");
  if (confirmPin) {
    confirmPin.addEventListener("keydown", function (e) {
      if (e.key === "Enter") handleSignup();
    });
  }

});