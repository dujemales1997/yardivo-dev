# YARDIVO modular runtime

YARDIVO remains a single web application opened through the same URL.

## Runtime ownership

- `services/`: Supabase, Auth, Realtime and shared server synchronization
- `modules/supplier/`: supplier portal, booking, history and supplier-specific UI
- `modules/master-data/`: locations, warehouses, ramps, suppliers and responsible people
- `modules/chat/`: Help Chat and Operational Chat
- `modules/gate/`: QR, gate and driver flows
- `modules/receiving/`: receiving workflows
- `modules/notifications/`: notification presentation and policy
- `modules/settings/`: settings and visual preferences
- `modules/analytics/`: overview and analytics behavior
- `modules/ai/`: AI and voice behavior
- `modules/ui/`: shared presentation compatibility code

## Phase 3 contract

Phase 3 preserves classic script execution order. Runtime blocks are moved out of `index.html` only by replacing the inline body with an external `src` at the same document position.

Three identical embedded YARDIVO PNG logos were consolidated into one cacheable `assets/yardivo-logo.svg` asset.

New code must not reintroduce:
- large inline JavaScript
- base64 image assets in `index.html`
- retired/disabled runtime blocks
- high-frequency network polling
- duplicate owners for the same feature

Semantic merging of older final/hotfix/authority generations should happen within one domain at a time, behind QA, after the compatibility globals are covered.

## Guardrails

- `index.html` is kept under 500 KB by CI.
- Active inline CSS is forbidden.
- Inline JavaScript blocks >= 3.5 KB are rejected by CI.
- Chat, AI, Notifications, Settings, Supplier, Master Data, Sync and shared services have canonical owner folders.
- Externalized classic scripts stay at the same document position to preserve execution order and runtime behavior.
