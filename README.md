# ExpiTrack™ — Smart Inventory & Expiry Tracker
### Advanced Database Systems (ADBMS) Project-Based Learning (PBL)

**ExpiTrack** is a full-stack MERN application engineered to demonstrate advanced database concepts by shifting data calculation, aggregation, and filtering from the application layer directly to the **MongoDB database engine**.

---

## 🌟 Key Advanced Database Features Implemented

### 1. B-Tree Database Indexing Strategy
To optimize range queries (`$lte`, `$gte`) and prevent expensive full table scans (**COLLSCAN**), multiple single-field and compound indexes are defined in `server/models/Item.js`:
- `ItemSchema.index({ expiryDate: 1 })` — Primary B-Tree index for temporal range queries.
- `ItemSchema.index({ userId: 1, expiryDate: 1 })` — Compound index for tenant-scoped date queries.
- `ItemSchema.index({ userId: 1, quantity: 1 })` — Compound index for low-stock threshold queries.
- `ItemSchema.index({ category: 1 })` — Index for rapid categorical grouping.

### 2. Multi-Stage MongoDB Aggregation Pipelines
Instead of loading thousands of documents into Node.js/React and filtering with JavaScript, heavy lifting occurs inside the database engine:
- **Live Alerts Pipeline (`GET /api/analytics/alerts`)**:
  - `$match`: Filters items where `expiryDate <= (now + 7 days)` OR `quantity < 5`.
  - `$addFields`: Performs direct date arithmetic (`$subtract`, `$divide`) to compute remaining days and categorizes items into `EXPIRED`, `CRITICAL_EXPIRY`, `EXPIRING_SOON`, or `LOW_STOCK`.
  - `$sort`: Orders by earliest expiration date first.
- **Single-Pass Multi-Dimensional Facet Pipeline (`GET /api/analytics/metrics`)**:
  - Uses `$facet` to compute total stock units, inventory valuation (`$multiply: ['$quantity', '$costPrice']`), category distributions, and alert counters simultaneously in a **single database round-trip**.

### 3. Live EXPLAIN Query Plan Analyzer (`GET /api/analytics/explain-benchmark`)
An academic showcase modal is built right into the UI:
- Compares **IXSCAN (B-Tree Index Scan)** vs. **COLLSCAN (Table Scan forced via `$natural: 1`)**.
- Displays real-time metrics extracted from `explain("executionStats")`:
  - `totalDocsExamined` vs. `nReturned`
  - `totalKeysExamined`
  - `stage`: `FETCH -> IXSCAN` vs. `COLLSCAN`
  - Document reduction ratio and computational complexity ($O(\log N)$ vs. $O(N)$).

### 4. Atomic Database Mutations
- Uses MongoDB's atomic `$inc` operator for instant restocking without race conditions.

---

## 🚀 Running the Project

Both the backend and frontend dev servers are set up:

### Backend (Node.js + Express + MongoDB)
- **Directory**: `server/`
- **Port**: `http://localhost:5000`
- **Command to run**:
  ```bash
  cd server
  npm run dev
  ```
- **Command to seed / reset database**:
  ```bash
  cd server
  npm run seed
  ```

### Frontend (React + Vite + Vanilla CSS Design System)
- **Directory**: `client/`
- **Port**: `http://localhost:3000`
- **Command to run**:
  ```bash
  cd client
  npm run dev
  ```

---

## 📋 Academic Presentation Walkthrough for Evaluators

1. **Open the Dashboard**: Navigate to `http://localhost:3000` in your web browser.
2. **Observe Aggregation KPIs**: Show the top cards calculated using the single-pass `$facet` aggregation pipeline.
3. **Show Live Alerts**: Point out the live alert banner filtered by `$match` and sorted by `$sort`.
4. **Trigger the EXPLAIN Benchmark**:
   - Click the purple **"EXPLAIN Benchmark"** button in the top navbar.
   - Show the evaluator the side-by-side comparison:
     - **IXSCAN** only examines the matching documents (e.g. 9 documents examined).
     - **COLLSCAN** is forced to scan every single document (53+ documents examined).
   - Use the **"+ Add 1,000 Items"** button to simulate high-volume datasets and widen the performance gap live!
5. **Inspect Raw MongoDB Output**: Click **"Inspect Raw MongoDB explain() JSON"** inside the benchmark modal to show the raw `executionStats` JSON from the database engine.
