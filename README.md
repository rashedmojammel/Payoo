# 💳 Payoo — Mobile Wallet Web App !

> A feature-rich, Bangladesh-focused mobile wallet simulation built with pure HTML, Tailwind CSS (DaisyUI), and vanilla JavaScript. No frameworks, no build step — just open in a browser.

---

## 📱 Live Demo

| Account | Mobile Number | PIN |
|---|---|---|
| Demo Account | `01890642735` | `6427` |
| Your Account | Sign up with any `01XXXXXXXXX` number | Your chosen PIN |

---

## ✨ Features Overview

Payoo has **40+ features** spread across 7 modules. Every feature stores data in `localStorage` — no backend or database required.

---

### 🏠 Home & Core

| Feature | Description |
|---|---|
| **Animated Balance** | Counter animates smoothly on every transaction |
| **Pull to Refresh** | Swipe down to refresh balance on mobile |
| **Recent Activity** | Last 5 transactions shown on home screen |
| **Onboarding Tutorial** | Step-by-step guide for first-time users |
| **Dark / Light Theme** | Toggle from Settings, persists on reload |
| **Bottom Navigation** | 5-tab nav bar (Home, Send, Dashboard, History, Settings) |
| **Quick Action Grid** | 20+ shortcut buttons on the home screen |

---

### 💸 Payments (core)

| Feature | File | Description |
|---|---|---|
| **Add Money** | `addmoney.js` | Add funds from a bank account (DBBL, IBBL, City Bank etc.) |
| **Send Money** | `sendmoney.js` | Transfer to any 11-digit mobile number with PIN verification |
| **Cash Out** | `cashout.js` | Withdraw via registered agent number |
| **Pay Bill** | `Paybill.js` | Generic bill payment to bank biller accounts |
| **Bonus Coupon** | `getbonus.js` | Redeem coupon codes for wallet credit (one-time use) |
| **Mobile Recharge** | `recharge.js` | Prepaid & postpaid top-up for 5 BD operators |
| **QR Code** | `machine.js` | Generate personal QR code for receiving payments |
| **Scheduled Payments** | `machine.js` | Set auto-recurring payments (daily/weekly/monthly) |

---

### ⚡ Payments Hub (`payments.js`)

Four advanced payment features in one module:

| Feature | Description |
|---|---|
| **Money Request / Invoice** | Generate a shareable invoice with unique ID, amount, note and due date. Mark received or reject |
| **Tap to Pay** | NFC-style QR scan simulation — shows a countdown and processes payment |
| **Payoo.me Link** | Personal payment page link generator — share your unique payment URL |
| **Bulk Payment** | Pay multiple people at once — add recipients, set amounts, process all in one tap |

---

### 🧾 Utility Bills (`utilities.js`)

10 utility categories with smart per-provider form fields:

| Category | Providers / Details |
|---|---|
| 🚰 WASA Water | Zone selector + account number |
| ⚡ Electricity | DESCO, DPDC, BPDB, REB — prepaid & postpaid |
| 🔥 Titas Gas | Residential, Commercial, Industrial |
| 📞 BTCL Landline | 8 regional divisions |
| 🌐 Internet | 8 ISPs (Grameenphone Home, Banglalion, Ranks ITT etc.) |
| 📺 Cable TV | T&T Cable, Digicon, My TV, Akash DTH |
| 🏛️ Municipal Tax | 6 City Corporations — Holding Tax, Trade License, etc. |
| 🛂 Passport / Govt. | MRP/E-Passport, Renewal, NID Correction, Police Clearance |
| 🏥 Hospital | 9 major BD hospitals — OPD, Lab, Pharmacy, Emergency |
| 🎓 School / University | Tuition, Exam, Registration, Hostel fees |

Every payment is logged to transaction history and shows in "Recent Payments" with a **Pay Again** shortcut.

---

### 🚌 Transport & Travel (`transport.js`)

8 travel tools in a single tabbed section:

| Tab | Feature |
|---|---|
| 🚌 **Bus Pass** | Top-up BRTC / BRT / City Bus prepaid transport cards with quick-amount buttons |
| 🛵 **Ride Share** | Log Pathao / Uber / Shohoz / InDrive trips. Set monthly budget with live progress bar |
| ⛽ **Fuel Calc** | Calculate trip cost by distance + mileage. Supports Octane / Petrol / Diesel / CNG. Save trips |
| ✈️ **Travel Fund** | Create savings goals per destination. Deposit from wallet. Progress bar + confetti on completion |
| 🏨 **Hotel Budget** | Enter check-in/out dates + nightly rate → auto-calculates nights and total cost |
| 🛫 **Flight Tracker** | Monitor routes (BD airports + international). Set budget alert price per route |
| 🛣️ **Toll Fees** | Log 9 BD highway toll plazas. Shows monthly total and trip count |
| 🅿️ **Parking** | Log daily parking by location and duration. Monthly + all-time totals |

---

### 💰 Finance Tools (`finance.js`)

5 calculators in a single tabbed section:

| Tab | Feature |
|---|---|
| 🥇 **Gold & Silver** | BAJUS 2024 prices for Gold 22K/21K/18K and Silver. Calculator (gram/bhori). Price alerts (above/below target) |
| ☪️ **Zakat** | 6-field asset calculator. Silver nisab (৳64,298). Shows 2.5% due or "below nisab" message |
| 🧾 **Tax** | FY2023-24 BD tax slabs. 3 taxpayer categories. Investment rebate (15%). Full slab breakdown |
| 🏦 **FDR** | Fixed Deposit calculator — 6 real BD banks + custom rate. Simple / quarterly / monthly compounding |
| 💳 **DPS** | Monthly savings scheme — 6 bank schemes + custom rate. Year-by-year breakdown table |

---

### 🛠️ Extra Features (`newfeatures.js`)

| Feature | Description |
|---|---|
| 🧮 **EMI Calculator** | Standard EMI formula (P×r×(1+r)^n / ((1+r)^n−1)). Live result as you type. Principal vs Interest bar |
| 🎰 **Lucky Spin** | 8-segment CSS prize wheel. Once per day. Prizes: ৳20–৳500. Wins added to balance |
| 📝 **Notes / Memos** | Colour-coded sticky notes (5 colours). Saved to localStorage. XSS-safe rendering |

---

### 📊 Extended Features (`features.js`)

| Feature | Description |
|---|---|
| 🍕 **Bill Splitter** | Split any bill among 2–20 people with tip % calculator (0/10/15/20%). Add named participants |
| 🎯 **Savings Goals** | Create goals with target amount and deadline. Deposit from wallet. Animated progress bar |
| 📊 **Budget Planner** | Set monthly spending limits by category. Tracks remaining budget vs actual spending |
| 🤝 **Loan Tracker** | Record money lent / borrowed with due dates. Mark as repaid. Separate owed-to and owed-by views |
| 📣 **Referral System** | Generate and redeem referral codes. ৳200 bonus on redemption. Referral stats tracked |
| 🏅 **Achievements** | 14 unlockable badges (First Transaction, High Roller, Budget Master, Night Owl, On Fire etc.) |
| ⏱️ **Auto-logout** | 5-minute inactivity timer with 30-second warning toast |
| 🔥 **Login Streak** | Tracks consecutive daily logins. Unlocks "On Fire" badge at 3-day streak |

---

### 📤 Export (`export.js`)

| Feature | Description |
|---|---|
| **Date Range Filter** | Filter transactions by custom from/to dates |
| **Type Filter** | Filter by success / failed / all |
| **CSV Export** | Download spreadsheet-ready `.csv` file |
| **PDF Export** | Download formatted bank-style statement as `.pdf` |
| **Live Preview** | See filtered results before downloading |

---

### 🔐 Authentication (`login.js`, `index.html`)

| Feature | Description |
|---|---|
| **Sign Up** | Full name, 11-digit BD number, PIN validation (no weak PINs) |
| **Login** | Checks both demo account and registered accounts |
| **Per-user Balance** | Each account has its own balance key — switching users never shows the wrong balance |
| **New User Bonus** | ৳500 starting balance for every new signup |
| **Rate Limiting** | 3 failed attempts → 30-second lockout with countdown |
| **PIN Strength Bar** | Live indicator (weak / strong) while creating a PIN |
| **Enter Key Support** | Press Enter on PIN fields to submit login or signup |

---

## 📁 File Structure

```
payoo/
│
├── index.html          # Login & Sign Up page
├── home.html           # Main app (all sections inside one file)
│
├── assets/
│   └── logo.png        # App icon / favicon
│
└── script/
    ├── machine.js      # Core engine — balance, toast, nav, transactions, QR
    ├── login.js        # Auth — login, signup, lockout, per-user balance
    ├── addmoney.js     # Add money from bank
    ├── sendmoney.js    # Send money to another number
    ├── cashout.js      # Cash out via agent
    ├── Paybill.js      # Generic bill payment
    ├── getbonus.js     # Coupon code redemption
    ├── recharge.js     # Mobile recharge (5 operators)
    ├── features.js     # Bill split, savings, budget, loans, referral, achievements
    ├── newfeatures.js  # EMI calculator, lucky spin, notes
    ├── utilities.js    # 10-category utility bills hub
    ├── transport.js    # 8-tab transport & travel hub
    ├── finance.js      # 5-tab finance tools hub
    ├── payments.js     # Request, Tap to Pay, Payoo.me, Bulk Pay
    └── export.js       # CSV & PDF transaction export
```

---

## 🚀 Getting Started

### Option 1 — Open directly in browser

No installation required. Just open `index.html` in any modern browser.

```
index.html  →  login  →  home.html
```

### Option 2 — Serve locally (recommended for full features)

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

Then visit `http://localhost:8000`

---

## 🔧 Tech Stack

| Technology | Usage |
|---|---|
| **HTML5** | Single-page app structure |
| **Tailwind CSS v4** | Utility-first styling (CDN) |
| **DaisyUI v5** | Component library (cards, modals, selects etc.) |
| **Font Awesome 6.5** | Icons throughout the app |
| **Outfit (Google Fonts)** | App-wide typography |
| **QRCode.js** | QR code generation |
| **Vanilla JavaScript** | All logic — no frameworks |
| **localStorage** | All data persistence |

---

## 💾 localStorage Keys Reference

| Key | Used for |
|---|---|
| `payoo_logged_in` | Session flag |
| `payoo_user` | Current logged-in number |
| `payoo_accounts` | Array of all registered accounts |
| `payoo_balance` | Active session balance |
| `payoo_balance_<number>` | Per-user balance (persists across logins) |
| `payoo_transactions` | Full transaction history array |
| `payoo_goals` | Savings goals array |
| `payoo_budgets` | Budget categories array |
| `payoo_loans` | Loan records array |
| `payoo_contacts` | Saved contacts array |
| `payoo_schedules` | Scheduled payments array |
| `payoo_recharges` | Mobile recharge history |
| `payoo_used_coupons` | Redeemed coupon codes |
| `payoo_used_referrals` | Redeemed referral codes |
| `payoo_achievements` | Unlocked badge IDs |
| `payoo_login_streak` | Consecutive login days |
| `payoo_last_login` | Last login date string |
| `payoo_last_spin` | Last lucky spin date |
| `payoo_notes` | Sticky notes array |
| `payoo_util_payments` | Utility bill payment history |
| `payoo_bus_history` | Bus top-up history |
| `payoo_ride_log` | Ride share trip log |
| `payoo_ride_budget` | Monthly ride budget limit |
| `payoo_fuel_history` | Saved fuel trip calculations |
| `payoo_travel_funds` | Travel savings goals |
| `payoo_hotel_list` | Hotel budget records |
| `payoo_flight_list` | Flight route tracker |
| `payoo_toll_log` | Toll fee log |
| `payoo_parking_log` | Parking fee log |
| `payoo_gold_alerts` | Gold price alert rules |
| `payoo_requests` | Money request / invoice records |
| `payoo_lock` | Login lockout state |
| `payoo_theme` | `"light"` or `"dark"` |
| `payoo_pin` | Active PIN (defaults to `6427`) |

---

## 🏅 Achievements

| Badge | Emoji | How to Unlock |
|---|---|---|
| First Transaction | 🚀 | Complete any successful transaction |
| Power User | ⚡ | Complete 5 successful transactions |
| High Roller | 💸 | Send or pay ৳10,000+ in one transaction |
| Smart Saver | 🐷 | Add ৳50,000+ to balance total |
| Goal Setter | 🎯 | Create your first savings goal |
| Goal Crusher | 🏆 | Complete a savings goal |
| Trusted Friend | 🤝 | Record your first loan |
| Influencer | 📣 | Redeem your first referral code |
| Budget Master | 📊 | Set 3 or more category budgets |
| Night Owl | 🦉 | Make a transaction after midnight |
| On Fire | 🔥 | Log in 3 days in a row |
| Fair Share | 🍕 | Use the bill splitter |
| Power Up | ⚡ | Complete your first mobile recharge |
| Signal Booster | 📶 | Recharge 5 times |

---

## 📲 Mobile Recharge Operators

| Operator | Prepaid Packages | Postpaid Packages |
|---|---|---|
| Grameenphone | ৳19 – ৳599 (8 packages) | ৳200 – ৳1000 (5 packages) |
| Robi | ৳19 – ৳499 (7 packages) | ৳250 – ৳1200 (4 packages) |
| Banglalink | ৳25 – ৳369 (6 packages) | ৳300 – ৳900 (3 packages) |
| Teletalk | ৳15 – ৳199 (5 packages) | ৳200 – ৳700 (3 packages) |
| Airtel | ৳29 – ৳269 (5 packages) | ৳280 – ৳850 (3 packages) |

---

## 🔑 Demo Coupon Codes

| Code | Bonus |
|---|---|
| `rashed` | ৳5,000 |
| `Fatema` | ৳200 |
| `Mercy` | ৳2,000 |

Each code can only be used once per account.

---

## 🧮 Financial Formulas Used

### EMI Calculator
```
EMI = P × r × (1 + r)^n  /  ((1 + r)^n − 1)
  P = principal amount
  r = monthly interest rate (annual% / 12 / 100)
  n = number of months
```

### FDR Calculator
```
Simple:    Maturity = P + (P × r × t/12)
Quarterly: Maturity = P × (1 + r/4)^(4 × t/12)
Monthly:   Maturity = P × (1 + r/12)^t
```

### DPS Calculator
```
Maturity = Σ [deposit × (1 + r/12)^(months remaining)]
  (each monthly deposit earns interest for its remaining term)
```

### Zakat
```
Net Wealth = Cash + Gold + Silver + Business + Receivables − Debts
Zakat Due  = Net Wealth × 2.5%  (if Net Wealth ≥ Nisab)
Silver Nisab 2024 = ৳64,298
```

### Tax (BD FY2023-24)
```
Free Limit:  ৳3,50,000 (General) | ৳4,00,000 (Female/65+) | ৳4,75,000 (Freedom Fighter)
Slabs (on taxable income above free limit):
  First  ৳1,00,000  →  5%
  Next   ৳3,00,000  →  10%
  Next   ৳4,00,000  →  15%
  Next   ৳5,00,000  →  20%
  Above             →  25%
Investment Rebate   = 15% of allowable investment (max 20% of income)
```

---

## 🗺️ Roadmap / Planned Features

- [ ] Daily check-in bonus
- [ ] Scratch card mini-game
- [ ] Quiz & Earn
- [ ] PIN change from Settings
- [ ] Subscription tracker
- [ ] Grocery budget manager
- [ ] Group expense manager
- [ ] NID card mock-up
- [ ] App lock with pattern

---

## 🤝 Contributing

1. Fork the repository
2. Add your feature in a new `script/yourfeature.js` file
3. Register the section ID in `ALL_SECTIONS` inside `machine.js`
4. Add the `setNav` hook in `machine.js` → `setNav()` function
5. Add your section HTML in `home.html` before `</main>`
6. Submit a pull request

---

## 📄 License

MIT — free to use, modify and distribute.

---

## 👨‍💻 Author

Built with ❤️ for Bangladesh.  
Powered by vanilla JS — no Node, no npm, no build tools required.

> **Note:** This is a simulation / demo app. No real money is transferred. All data is stored locally in your browser.
