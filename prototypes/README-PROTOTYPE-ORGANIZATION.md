# Harken CRE Prototype Organization

## 🏗️ Three-Tier White-Label Platform Architecture

This prototype demonstrates Harken CRE as a **white-label platform** for appraisal firms, using a three-tier architecture similar to Shopify or Stripe.

---

## 📁 Folder Structure

### 1. **Harken-Admin-Panel/** 
**Platform Provider (Super Admin)**

**Who Uses This:** Harken CRE staff (you)

**Purpose:** Manage the entire platform, all customer accounts, and software support

**Key Files:**
- `admin-dashboard.html` - Platform overview
- `admin-accounts.html` - Manage all customer accounts (Rove, Metro, etc.)
- `admin-account-manage.html` - Individual account management + impersonation
- `admin-support-tickets.html` - SOFTWARE support tickets FROM customers
- `admin-settings.html` - **START HERE** - Platform architecture overview
- `admin-settings-white-label.html` - Custom domain management
- `admin-users.html`, `admin-audit-logs.html`, `admin-reports.html`

**Revenue Model:** $100-150/month per customer account

---

### 2. **Customer-Admin-Panel/**
**Tenant Accounts (Rove Management)**

**Who Uses This:** Your customers (appraisal firms like Rove Management)

**Purpose:** Manage their business operations, assign work to their team

**Key Files:**

**Rove Admin View** (Account Owner/Manager):
- `customer-admin-work-requests.html` - **START HERE** - Manage incoming client requests
- `customer-work-detail.html` - Detailed view with pricing and assignment controls
- Pricing visible, can assign to team members

**Rove Appraiser View** (Field Workers - 30 employees):
- `appraiser-assigned-work.html` - **START HERE** - See only THEIR assigned work
- `appraiser-work-detail.html` - Work detail with upload area
- **NO pricing visible** (industry standard for field workers)

**Architecture:**
- Rove has 30 appraisers
- Rove admins assign work to their appraisers
- Appraisers complete work and upload reports
- Pricing hidden from appraisers, visible to admins

---

### 3. **Client-Portal/**
**End Clients (White-Label)**

**Who Uses This:** Rove's end clients (real estate investors, brokers)

**Purpose:** Submit service requests and track status

**Key Files:**
- `client-request-portal.html` - **START HERE** - Submit & track requests
- White-label branded (shows "Rove Management", NOT "Harken")
- Accessed via `portal.rovemanagement.com`
- Shows pricing (what Rove charges them)

**Revenue to Rove:** $400-5,000 per request

---

## 🔄 Complete Workflow Example

### Scenario: ABC Corporation needs a $3,200 appraisal

1. **ABC Corp** (end client) submits request via `Client-Portal/client-request-portal.html`
   - Sees Rove Management branding (white-label)
   - Request #WR-2025-045 created

2. **Rove Admin** (tenant admin) manages via `Customer-Admin-Panel/customer-admin-work-requests.html`
   - Sees request in unassigned queue
   - Clicks "Assign to Team" → Opens professional modal
   - Assigns to Sarah Chen (one of 30 appraisers)

3. **Sarah Chen** (appraiser) works via `Customer-Admin-Panel/appraiser-assigned-work.html`
   - Sees ONLY her assigned work
   - Does NOT see $3,200 pricing
   - Completes appraisal, clicks "Submit for Review" → Professional modal
   - Uploads PDF report

4. **ABC Corp** gets notification
   - Logs back into `Client-Portal/client-request-portal.html`
   - Downloads completed report
   - Invoice paid: $3,200

5. **Harken's involvement**
   - Rove pays Harken $150/month for software subscription
   - Harken does NOT touch individual work requests
   - Harken only helps if Rove has SOFTWARE issues (bugs, features)

---

## 🎯 Key Features Demonstrated

### Professional UI Components:
✅ **NO browser alerts** - Professional centered modals  
✅ **Success toasts** - Slide in from bottom-right corner  
✅ **Assignment modal** - Searchable appraiser list with workload info  
✅ **Submit review modal** - File upload + notes field  
✅ **All buttons functional** - Proper links and workflows  

### Architecture Highlights:
✅ **Multi-tenant isolation** - Each customer sees only their data  
✅ **Role-based access** - Admins vs appraisers have different views  
✅ **Pricing visibility** - Hidden from appraisers, visible to admins  
✅ **White-label branding** - End clients never see Harken  
✅ **Custom domains** - `portal.rovemanagement.com` routing  

---

## 🚀 How to View Prototypes

### View Harken Super Admin Panel:
```
Open: prototypes/Harken-Admin-Panel/admin-settings.html
```
This shows the complete platform architecture overview

### View Rove Admin Panel (Your Customer):
```
Open: prototypes/Customer-Admin-Panel/customer-admin-work-requests.html
```
Shows assignment workflow with professional modals

### View Rove Appraiser Panel (Field Worker):
```
Open: prototypes/Customer-Admin-Panel/appraiser-assigned-work.html
```
Shows work view WITHOUT pricing

### View End Client Portal (White-Label):
```
Open: prototypes/Client-Portal/client-request-portal.html
```
Shows what Rove's clients see (Rove branding, not Harken)

---

## 📊 Business Model Summary

| Entity | Software Cost | Work Revenue | Notes |
|--------|---------------|--------------|-------|
| **Harken CRE** | Charges $100-150/mo | N/A | Platform provider |
| **Rove Management** | Pays $150/mo to Harken | Earns $400-5K per request | Your customer |
| **ABC Corporation** | N/A | Pays $3,200 to Rove | Rove's client |

**This is the "Shopify model" for appraisal firms!**

---

## 🔨 Development Notes

**Phase 1 Complete:**
- ✅ Three-tier architecture designed
- ✅ All portals built with professional modals
- ✅ Role-based pricing visibility
- ✅ Assignment workflows implemented
- ✅ Detail pages created

**Still To Build:**
- White-label domain management page
- Impersonation feature (Login as Customer)
- Request submission form for end clients
- Actual database schema and API

**Industry References:**
- Shopify (store owners → their customers)
- Stripe (businesses → their customers)
- Zendesk (support teams → their clients)
- ServiceTitan (contractors → their clients)

---

## 🎨 NEW: SuperAdmin/ - Unified Navigation Prototype

**Status:** ✅ Phase 1 Complete (October 2024)

**Purpose:** Complete redesign of the Harken Super Admin interface with unified navigation system

### What's New

This is a **complete, fully-linked prototype** showcasing:

✅ **Unified Navigation Design**
- Core features (COMPS, APPRAISAL, EVALUATION) prominently displayed in **purple**
- Management features (Dashboard, Users, Clients, Accounts, etc.) in standard styling
- Conditional property tabs (only visible on COMPS/APPRAISAL/EVALUATION pages)

✅ **Dashboard as Landing Page**
- Comprehensive metrics and analytics
- User activity tracking
- Revenue and billing overview
- Chart.js visualizations

✅ **Role-Based Access Control UI**
- User permissions matrix (COMPS always enabled)
- Account-level feature toggles (Enable/Disable Appraisals & Evaluations)
- Visual permission management

✅ **Complete Page Set**
- 13+ fully-linked HTML pages
- Reusable navigation component
- Consistent styling and UX

### How to View

**Start Here:**
```
Open: prototypes/SuperAdmin/index.html
```
This provides a visual index of all prototype pages

**Or Go Directly to Landing Page:**
```
Open: prototypes/SuperAdmin/super-admin-dashboard.html
```

### Key Files

| File | Purpose |
|------|---------|
| `index.html` | Visual index of all pages |
| `super-admin-dashboard.html` | **LANDING PAGE** - Default after login |
| `super-admin-comps.html` | COMPS portal |
| `super-admin-appraisals-list.html` | Appraisals with property tabs |
| `super-admin-evaluations-list.html` | Evaluations with property tabs |
| `super-admin-users.html` | Users management |
| `super-admin-user-detail.html` | User permissions matrix |
| `super-admin-accounts.html` | Accounts management |
| `super-admin-account-detail.html` | Feature toggles (Appraisals/Evaluations) |
| `super-admin-clients.html` | Clients management |
| `super-admin-reports.html` | Reports & analytics portal |
| `super-admin-support.html` | Support tickets |
| `super-admin-audit-logs.html` | System audit trail |
| `super-admin-settings.html` | Platform settings |
| `README.md` | Complete documentation |

### Navigation Design

**Core Features** (Purple - Always prominent):
```
[COMPS] [APPRAISAL] [EVALUATION]
```

**Management Features** (Standard):
```
Dashboard | Users | Clients | Accounts | Reports | Support | Audit Logs | Settings
```

**Property Tabs** (Conditional - only on COMPS/APPRAISAL/EVALUATION):
```
[Commercial] [Residential] [Land]
```

### RBAC Rules

| Feature | Always Enabled? | Toggleable? |
|---------|----------------|-------------|
| **COMPS** | ✅ Yes | ❌ No - Always on |
| **APPRAISALS** | ❌ No | ✅ Yes - Per account |
| **EVALUATIONS** | ❌ No | ✅ Yes - Per account |

### Next Steps

**Phase 2:** Create Regular User prototype with restricted navigation based on their permissions

**Phase 3:** Implement in React application (`packages/frontend/`)

---

