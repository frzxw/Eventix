# Inventory Cache Synchronization

The Service API and background workers rely on Redis hashes under the key pattern `inventory:{eventId}:{categoryId}` to serve availability checks and enforce real-time ticket holds. These hashes must stay aligned with the authoritative data that lives in the `events`, `ticket_categories`, `orders`, and `tickets` tables in Azure SQL.

This guide explains when the cache should be seeded, how to reconcile it with SQL, and what to do after manual database changes.

## When to run a sync

- **Fresh environment provisioning** – Run immediately after database migrations and seeding so Redis reflects the initial ticket counts.
- **After manual SQL maintenance** – Any direct update to `ticket_categories.quantity_total`, `ticket_categories.quantity_sold`, or a ticket/order rollback must be followed by a cache refresh.
- **Disaster recovery** – If Redis data is lost or the cache is considered stale, trigger a full rebuild before enabling traffic.

## Source of truth

- `ticket_categories.quantity_total` – Maximum seats per category.
- `ticket_categories.quantity_sold` – Seats already sold/confirmed.
- Derived Redis fields:
  - `total` mirrors `quantity_total`.
  - `sold` mirrors `quantity_sold`.
  - `pending` represents seats reserved by active holds (populated by the hold Lua scripts).
  - `available` is `total - sold - pending` and must never be negative.

## Sync workflow

1. **Fetch live category data**
   ```sql
   SELECT id, event_id, quantity_total, quantity_sold
   FROM ticket_categories;
   ```

2. **Build Redis payloads**
   For every row, compute:
   ```text
   total = quantity_total
   sold = quantity_sold
   pending = 0            # reset; active holds will re-populate
   available = max(total - sold, 0)
   version = 1            # optional monotonic counter
   ```

3. **Write to Redis atomically**
   Use a Lua script or Redis pipelining to execute the following per category:
   ```redis
   HSET inventory:{eventId}:{categoryId} \
     total {total} \
     sold {sold} \
     pending {pending} \
     available {available} \
     version {version}
   ```
   When clearing stale data, delete the existing hash before re-adding fields to avoid leftover attributes.

4. **Warm the expiration index (optional)**
   If you are rebuilding holds as well, repopulate the sorted set `holds:expiration-index` with only the active hold tokens. Otherwise, remove the ZSET entries so the hold-cleaner job does not waste work.

5. **Verify**
   - Spot-check with `HGETALL inventory:{eventId}:{categoryId}`.
   - Run an API call to `/v1/inventory/holds` for the same category and confirm the numbers match the SQL snapshot.
   - Monitor the hold-cleaner telemetry for unexpected jumps in `released`/`errors` after the sync.

## Automation options

- **Scripted job** – Extend `services/scripts` with a Node.js or TypeScript CLI that reads from Postgres using `pg`, then pushes calculated hashes to Redis (see `services/api/src/lib/redisClient.ts` for connection helpers).
- **Azure Function** – Create a timer-triggered Function that invokes the same logic nightly to detect drift. Gate execution behind an environment flag to avoid unintended overwrites in production.
- **CI/CD hook** – Add a GitHub Actions job after database migrations to call the sync script for staging environments.

## Operational playbook

1. Disable traffic (if production) or ensure only maintenance users are active.
2. Run the sync script against the target environment.
3. Re-enable traffic and monitor:
   - Redis metrics (`available`, `pending` counts should stabilize).
   - API error rates for `/v1/inventory/holds` and `/v1/checkout`.
   - Application Insights custom metric `HoldCleanupRun` for anomalies.
4. Document the run in the maintenance log with the SQL snapshot timestamp.

Keeping Redis aligned with SQL prevents overselling and ensures the Lua hold scripts deliver accurate availability during high-demand “ticket wars.”
