# 🧪 SuperAdmin Prototype - Testing Guide

## Quick Start Testing

### Step 1: Open the Prototype
```
File: prototypes/SuperAdmin/super-admin-dashboard.html
Action: Open in your web browser (Chrome, Edge, Firefox recommended)
```

### Step 2: Test Core Features (MOST IMPORTANT)

#### ✅ Purple COMPS Button
1. Click **COMPS** (purple button)
2. Should load: `comps-premium-with-clustering.html`
3. ✅ Check: Property tabs (Commercial/Residential/Land) are visible
4. ✅ Check: COMPS button is highlighted purple
5. ✅ Check: Map and property cards display
6. Click back to Dashboard using nav bar

#### ✅ Purple APPRAISAL Button
1. Click **APPRAISAL** (purple button)
2. Should load: `super-admin-appraisals-list.html`
3. ✅ Check: Property tabs (Commercial/Residential/Land) are visible
4. ✅ Check: APPRAISAL button is highlighted purple
5. ✅ Check: Placeholder message displays
6. Click back to Dashboard using nav bar

#### ✅ Purple EVALUATION Button
1. Click **EVALUATION** (purple button)
2. Should load: `evaluation-wizard-full.html`
3. ✅ Check: Property tabs (Commercial/Residential/Land) are visible
4. ✅ Check: EVALUATION button is highlighted purple
5. ✅ Check: Evaluation wizard displays
6. Click back to Dashboard using nav bar

### Step 3: Test Management Items (Teal)

#### ✅ Dashboard
1. Click **Dashboard** (teal text)
2. Should load: `super-admin-dashboard.html`
3. ✅ Check: Property tabs are HIDDEN
4. ✅ Check: Dashboard button has teal border
5. ✅ Check: Metrics and charts display

#### ✅ Users
1. Click **Users** (teal text)
2. Should load: `super-admin-users.html`
3. ✅ Check: Property tabs are HIDDEN
4. ✅ Check: Users button has teal border
5. Click any user row
6. Should load: `super-admin-user-edit.html`
7. ✅ Check: Permission matrix is visible
8. Click "← Back to Users" to return

#### ✅ Clients
1. Click **Clients** (teal text)
2. Should load: `super-admin-clients.html`
3. ✅ Check: Property tabs are HIDDEN
4. ✅ Check: Placeholder message displays

#### ✅ Accounts
1. Click **Accounts** (teal text)
2. Should load: `super-admin-accounts.html`
3. ✅ Check: Property tabs are HIDDEN
4. Click any account row
5. Should load: `super-admin-account-manage.html`
6. ✅ Check: Feature toggles for Appraisals/Evaluations visible
7. Click "View Amenities"
8. Should load: `super-admin-account-amenities.html`
9. Click "← Back to Accounts" to return

#### ✅ Reports
1. Click **Reports** (teal text)
2. Should load: `super-admin-reports.html`
3. ✅ Check: Property tabs are HIDDEN
4. ✅ Check: Reports table displays

#### ✅ Support
1. Click **Support** (teal text)
2. Should load: `super-admin-support-tickets.html`
3. ✅ Check: Property tabs are HIDDEN
4. ✅ Check: Support tickets table displays
5. Click "Create Ticket" button
6. Should load: `super-admin-support-create-ticket.html`
7. **Note**: Old navbar but links still work
8. Navigate back using browser back button

#### ✅ Audit Logs
1. Click **Audit Logs** (teal text)
2. Should load: `super-admin-audit-logs.html`
3. ✅ Check: Property tabs are HIDDEN
4. ✅ Check: Audit logs table displays

#### ✅ Settings
1. Click **Settings** (teal text)
2. Should load: `super-admin-settings.html`
3. ✅ Check: Property tabs are HIDDEN
4. Click "Billing Settings"
5. Should load: `super-admin-settings-billing.html`
6. **Note**: Old navbar but links still work
7. Navigate back using browser back button

### Step 4: Test Visual Features

#### ✅ Active Page Highlighting
- Current page should have visual indicator:
  - Purple core features: Purple gradient background with glow
  - Teal management: Teal border

#### ✅ Property Tab Visibility
- **Should SHOW** on: COMPS, APPRAISAL, EVALUATION
- **Should HIDE** on: Dashboard, Users, Clients, Accounts, Reports, Support, Audit Logs, Settings

#### ✅ Property Tab Switching
1. On COMPS page, click different property tabs
2. Active tab should have teal underline
3. Selection should persist when navigating back to COMPS

#### ✅ Logo Click
1. Click Harken logo (top left)
2. Should return to Dashboard

#### ✅ Hover Effects
1. Hover over any nav item
2. Should see subtle background color change

---

## 🎯 Expected Test Results

### ✅ ALL WORKING (14 pages)
1. super-admin-dashboard.html
2. super-admin-users.html
3. super-admin-user-edit.html
4. super-admin-clients.html
5. super-admin-accounts.html
6. super-admin-account-manage.html
7. super-admin-account-amenities.html
8. super-admin-reports.html
9. super-admin-support-tickets.html
10. super-admin-audit-logs.html
11. super-admin-settings.html
12. super-admin-appraisals-list.html
13. comps-premium-with-clustering.html
14. evaluation-wizard-full.html

### 🔄 FUNCTIONAL BUT OLD NAVBAR (9 pages)
These have old navbar styling but all links work:
1. super-admin-account-report-templates.html
2. super-admin-account-report-templates-visual.html
3. super-admin-settings-amenities.html
4. super-admin-settings-billing.html
5. super-admin-settings-white-label.html
6. super-admin-support-create-ticket.html
7. super-admin-support-ticket-detail.html
8. super-admin-report-editor-pro.html
9. super-admin-template-visual-editor-full.html

---

## 🐛 Known Issues (Expected)

### Not Issues - Working as Designed
- ✅ Some subsidiary pages have old navbar - **This is expected**
- ✅ All internal links use `super-admin-*` naming - **This is correct**
- ✅ Property tabs only show on core feature pages - **This is intentional**
- ✅ Placeholder content on Clients and Appraisals - **This is expected**

### Actual Issues to Report
If you encounter any of these, let me know:
- ❌ Navigation link goes to wrong page
- ❌ Property tabs show on Dashboard/Users/etc
- ❌ Property tabs don't show on COMPS/APPRAISAL/EVALUATION
- ❌ Active page highlighting not working on main pages
- ❌ Logo click doesn't return to dashboard

---

## 📸 Screenshot Checklist for Owner Presentation

### Key Screenshots to Capture
1. **Dashboard** - Landing page with metrics
2. **COMPS page** - Show purple highlight and property tabs
3. **EVALUATION page** - Show purple highlight and property tabs  
4. **Users page** - Show teal highlight and NO property tabs
5. **User Edit page** - Show permission matrix
6. **Account Manage page** - Show feature toggles
7. **Navigation bar close-up** - Show purple vs teal distinction

---

## 🎬 Demo Flow for Owners

### Recommended Presentation Order

1. **Start at Dashboard** (Landing page)
   - Point out clean layout
   - Show metrics and charts

2. **Click COMPS** (Purple core feature)
   - Show purple highlight
   - Point out property tabs appear
   - Show map and property cards
   - "This is our core product"

3. **Click APPRAISAL** (Purple core feature)
   - Show purple highlight
   - Point out property tabs still visible
   - "Another core product"

4. **Click EVALUATION** (Purple core feature)
   - Show purple highlight
   - Point out property tabs still visible
   - Show wizard interface
   - "Our third core product"

5. **Click Users** (Teal management)
   - Show teal highlight
   - Point out property tabs DISAPPEAR
   - Show user list
   - Click into user detail
   - **Show permission matrix**
   - "Super Admin can control access to Appraisals/Evaluations"

6. **Click Accounts** (Teal management)
   - Show account list
   - Click into account detail
   - **Show feature toggles**
   - "Harken controls which features each account can access"

7. **Navigate around**
   - Show how navigation persists
   - Show active page highlighting
   - Show property tab visibility logic

### Key Talking Points
- **Purple = Core Products** (COMPS, APPRAISAL, EVALUATION)
- **Teal = Management** (Dashboard, Users, Accounts, etc.)
- **Property Tabs** = Only visible on core product pages
- **Permissions** = Configurable at account and user level
- **COMPS** = Always enabled (base product)
- **Appraisals & Evaluations** = Add-ons that can be toggled

---

## 📝 Feedback Collection

### Questions to Ask Owners
1. Does the purple prominence work for core features?
2. Is the two-tier navigation clear?
3. Should property tabs be different?
4. Any other management sections needed?
5. Should "Clients" be a separate section?
6. Is the permission UI clear?

### Expected Feedback Areas
- Color preferences
- Navigation order adjustments
- Additional features needed
- UI polish requests

---

## ✅ Pre-Presentation Checklist

Before showing to owners:
- [ ] Test all navigation links work
- [ ] Verify property tabs show/hide correctly
- [ ] Confirm active page highlighting works
- [ ] Check responsive layout on different screen sizes
- [ ] Prepare answers to common questions
- [ ] Have backup screenshots ready
- [ ] Know which pages have old navbar (it's fine!)

---

**READY TO TEST!** 🚀

Open `prototypes/SuperAdmin/super-admin-dashboard.html` and start exploring!

