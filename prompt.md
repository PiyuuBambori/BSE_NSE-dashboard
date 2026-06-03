# Corporate News Dashboard (NSE/BSE Only)

You are a senior full-stack engineer.

Build a complete production-ready repository from scratch.

Project Name:

corporate-news-dashboard

## Objective

Create a lightweight real-time dashboard for reviewing official NSE and BSE announcements.

The dashboard will connect to an existing Supabase database and display only announcements where the source is NSE or BSE.

This repository is completely new.

Generate all files required for local development and Render deployment.

Do not generate snippets.

Generate the complete repository structure and all source files.

---

## Tech Stack

Frontend:

* React
* Vite
* TypeScript

UI:

* TailwindCSS
* Shadcn/UI

Database:

* Supabase

State Management:

* Zustand

Hosting:

* Render

Realtime:

* Supabase Realtime

Icons:

* Lucide React

---

## Existing Supabase Table

Table:

corporate_announcements

Columns:

* headline
* article_cleaned
* url
* tags
* published_at
* source

Ignore all other columns.

---

## Business Requirement

Display ONLY rows where:

```sql
source IN ('NSE', 'BSE')
```

No other sources should appear in the dashboard.

Filtering must happen both:

1. Initial data fetch
2. Realtime subscriptions

---

## Columns to Display

Display only:

* headline
* article_cleaned
* url
* tags
* published_at
* source

---

## Dashboard Layout

Single-page dashboard.

Layout:

Top Header

Statistics Row

Filter Row

Announcement Feed

Announcement Detail Drawer

---

## Header

Display:

Corporate News Dashboard

Realtime Status Indicator

Last Updated Timestamp

Refresh Button

---

## Statistics Row

Show:

* Total NSE Announcements
* Total BSE Announcements
* Total Announcements Today
* Last Update Time

Use simple cards.

No charts.

No analytics.

No sentiment.

No sector analysis.

---

## Filters

Support:

Search

Search should match:

* headline
* tags

Source Filter:

* All
* NSE
* BSE

Date Filter:

* Today
* Last 7 Days
* Last 30 Days
* Custom Range

Tag Filter

Multi-select tags.

All filters must work together.

---

## Announcement Feed

Newest first.

Infinite scroll.

Virtualized rendering.

Each card should display:

Source Badge

Headline

Published Time

Tags

Article Preview

Open Announcement Button

Example:

---

NSE

Tata Motors Announces New Manufacturing Facility

Published:
2026-06-03 10:30 AM

Tags:
Manufacturing, Expansion

Preview:
The company informed the exchange regarding...

Open Announcement

---

---

## Announcement Detail View

When a card is clicked:

Open side drawer.

Display:

Headline

Published Time

Source

Tags

Full article_cleaned

Open Original Announcement Button

Open URL in new tab.

---

## Realtime Requirements

Use Supabase Realtime.

Subscribe to:

corporate_announcements

Event:

INSERT

When new row arrives:

Check source.

Only process if:

```javascript
source === "NSE" || source === "BSE"
```

Then:

* Add announcement to top of feed
* Update counters
* Update last updated timestamp
* Show toast notification

No page refresh.

---

## Supabase Layer

Create:

src/lib/supabase.ts

Environment Variables:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

Create reusable service layer.

---

## State Management

Use Zustand.

Store:

* announcements
* selectedAnnouncement
* filters
* stats
* connectionStatus
* lastUpdated

---

## Performance Requirements

Must support:

100,000+ announcements

Requirements:

* Infinite scrolling
* Virtualized list
* Memoized components
* Cached queries
* Efficient filtering
* Optimized rendering

---

## Loading States

Create:

* Skeleton loaders
* Empty state
* Error state

Examples:

"No announcements found"

"Supabase connection lost"

"Realtime disconnected"

---

## Security

No secrets committed.

Environment variables only.

No hardcoded credentials.

---

## Render Deployment

Generate:

render.yaml

Requirements:

Build Command:

npm install && npm run build

Publish Directory:

dist

Generate complete deployment instructions.

---

## File Structure

Generate exactly:

corporate-news-dashboard/

src/

components/
├── AnnouncementCard.tsx
├── AnnouncementDrawer.tsx
├── SearchBar.tsx
├── Filters.tsx
├── StatsCards.tsx
├── RealtimeIndicator.tsx
├── EmptyState.tsx
└── LoadingSkeleton.tsx

hooks/
├── useAnnouncements.ts
└── useRealtimeAnnouncements.ts

services/
└── announcements.ts

store/
└── dashboardStore.ts

types/
└── announcement.ts

lib/
└── supabase.ts

pages/
└── Dashboard.tsx

App.tsx

main.tsx

---

## TypeScript

Use strict mode.

No any types.

Strong interfaces.

Reusable hooks.

Reusable components.

---

## README

Include:

* Project overview
* Installation
* Environment variables
* Supabase setup
* Local development
* Render deployment
* Realtime architecture
* Troubleshooting

---

## Deliverables

Generate:

1. Full repository structure
2. Every file
3. Every component
4. Zustand store
5. Supabase integration
6. Realtime implementation
7. Tailwind setup
8. Shadcn setup
9. Render deployment files
10. README

Output files one by one in correct repository order.

The repository must run immediately after:

npm install
npm run dev

and deploy on Render without code changes.
