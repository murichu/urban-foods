# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


## Backend & Frontend Improvements Task

### 1. Audit Logging System

* Implement audit logs for all critical actions:

  * User login/logout
  * Order creation & updates
  * Payment initiation & completion
  * Admin actions (CRUD operations)
* Each log should include:

  * `userId`
  * `action`
  * `entity` (Order, Payment, User, etc.)
  * `status` (SUCCESS / FAILED)
  * `metadata` (JSON payload)
  * `timestamp` (use moment)
* Store logs in database (AuditLogs collection)
* Create admin UI to:

  * View logs
  * Filter by date, user, action, status

---

### 2. Logging & Error Debugging

* Ensure all errors are properly logged:

  * Use centralized logger (e.g. Pino/Winston)
  * Log:

    * API errors
    * M-Pesa failures
    * Validation errors
* Add global error handler middleware
* Ensure logs appear in:

  * Console (dev)
  * File or DB (prod)

---

### 3. M-Pesa Architecture Refactor

#### Structure:

* `controllers/MpesaController.js`
* `services/mpesaService.js`
* `routes/mpesaRoutes.js`

#### Requirements:

* Implement STK Push
* Support polling for transaction status
* Separate business logic (service) from controller

---

### 4. Environment-Based URLs

* Use `.env` for M-Pesa base URLs:

  * DEV → sandbox URL
  * PROD → live URL
* Automatically switch based on `NODE_ENV`

Example:

```env
NODE_ENV=development
```

---

### 5. Custom Identifiers

* Generate and use:

  * Custom `orderId`
  * Custom `trackingId`
* Do NOT rely on default Mongo `_id` for business logic

---

### 6. Replace XLSX Dependency

* Remove vulnerable package:

```bash
npm uninstall xlsx
npm install exceljs
```

* Refactor Excel handling using `exceljs`

---

### 7. Frontend – PlaceOrder.jsx Improvements

#### M-Pesa UX Flow:

* When user initiates payment:

  * Show message:

    * “Waiting for M-Pesa prompt on your phone…”
* While polling:

  * Show loader + “Transaction is processing”
* On success:

  * Show modal popup with:

    * Transaction ID
    * Order ID
    * Amount
    * Status (SUCCESS)
* On failure:

  * Show clear error message

---

### 8. M-Pesa Feature Validation

* Confirm implementation exists and works:

  * `MpesaController.js`
  * `mpesaService.js`
  * `mpesaRoutes.js`
* Ensure:

  * STK Push is triggered correctly
  * Callback endpoint is handled
  * Polling mechanism works
  * Transactions update order status correctly

---

### 9. Optional (Recommended)

* Add retry mechanism for failed M-Pesa requests
* Add webhook security validation
* Store full M-Pesa response payload for auditing
