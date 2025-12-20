# ========================================
# Complete SuperAdmin Prototype Setup Script
# ========================================
# This script completes the unified navigation implementation for all remaining files
# Run from: prototypes/SuperAdmin/

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SuperAdmin Prototype Setup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Load the unified navigation component
$navContent = Get-Content "nav-compact.txt" -Raw

# Define the old navbar pattern to replace
$oldNavPattern = @'
    <!-- Navigation Bar -->
    <nav class="navbar flex items-center justify-between px-8">
        <div class="flex items-center">
            <img src="harken.png" alt="Harken" style="height: 40px; width: auto;" />
        </div>
        <div class="flex items-center gap-6">
            <a href="super-admin-dashboard.html" class="nav-link">Dashboard</a>
            <a href="super-admin-users.html" class="nav-link">Users</a>
            <a href="super-admin-accounts.html" class="nav-link">Accounts & Billing</a>
            <a href="super-admin-reports.html" class="nav-link">Reports</a>
            <a href="super-admin-support-tickets.html" class="nav-link" style="position: relative;">
                Support
                <span style="position: absolute; top: 4px; right: 14px; background-color: #c62828; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; min-width: 18px; text-align: center;">7</span>
            </a>
            <a href="super-admin-audit-logs.html" class="nav-link">Audit Logs</a>
            <a href="super-admin-settings.html" class="nav-link">Settings</a>
        </div>
        <div class="flex items-center gap-4">
            <span class="text-sm">Super Administrator</span>
        </div>
    </nav>
'@

# Alternate pattern for active accounts page
$oldNavPatternAccounts = @'
    <!-- Navigation Bar -->
    <nav class="navbar flex items-center justify-between px-8">
        <div class="flex items-center">
            <img src="harken.png" alt="Harken" style="height: 40px; width: auto;" />
        </div>
        <div class="flex items-center gap-6">
            <a href="super-admin-dashboard.html" class="nav-link">Dashboard</a>
            <a href="super-admin-users.html" class="nav-link">Users</a>
            <a href="super-admin-accounts.html" class="nav-link active">Accounts & Billing</a>
            <a href="super-admin-reports.html" class="nav-link">Reports</a>
            <a href="super-admin-support-tickets.html" class="nav-link" style="position: relative;">
                Support
                <span style="position: absolute; top: 4px; right: 14px; background-color: #c62828; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; min-width: 18px; text-align: center;">7</span>
            </a>
            <a href="super-admin-audit-logs.html" class="nav-link">Audit Logs</a>
            <a href="super-admin-settings.html" class="nav-link">Settings</a>
        </div>
        <div class="flex items-center gap-4">
            <span class="text-sm">Super Administrator</span>
        </div>
    </nav>
'@

# Alternate pattern for active settings page
$oldNavPatternSettings = @'
    <!-- Navigation Bar -->
    <nav class="navbar flex items-center justify-between px-8">
        <div class="flex items-center">
            <img src="harken.png" alt="Harken" style="height: 40px; width: auto;" />
        </div>
        <div class="flex items-center gap-6">
            <a href="super-admin-dashboard.html" class="nav-link">Dashboard</a>
            <a href="super-admin-users.html" class="nav-link">Users</a>
            <a href="super-admin-accounts.html" class="nav-link">Accounts & Billing</a>
            <a href="super-admin-reports.html" class="nav-link">Reports</a>
            <a href="super-admin-support-tickets.html" class="nav-link" style="position: relative;">
                Support
                <span style="position: absolute; top: 4px; right: 14px; background-color: #c62828; color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; min-width: 18px; text-align: center;">7</span>
            </a>
            <a href="super-admin-audit-logs.html" class="nav-link">Audit Logs</a>
            <a href="super-admin-settings.html" class="nav-link active">Settings</a>
        </div>
        <div class="flex items-center gap-4">
            <span class="text-sm">Super Administrator</span>
        </div>
    </nav>
'@

# Files to update
$filesToUpdate = @(
    'super-admin-account-report-templates.html',
    'super-admin-account-report-templates-visual.html',
    'super-admin-settings-amenities.html',
    'super-admin-settings-billing.html',
    'super-admin-settings-white-label.html',
    'super-admin-support-create-ticket.html',
    'super-admin-support-ticket-detail.html',
    'super-admin-report-editor-pro.html',
    'super-admin-template-visual-editor-full.html'
)

Write-Host "Step 1: Updating $($filesToUpdate.Count) remaining files..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($file in $filesToUpdate) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Try all pattern variations
        if ($content -match [regex]::Escape($oldNavPattern)) {
            $content = $content.Replace($oldNavPattern, $navContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  ✓ Updated: $file" -ForegroundColor Green
            $successCount++
        }
        elseif ($content -match [regex]::Escape($oldNavPatternAccounts)) {
            $content = $content.Replace($oldNavPatternAccounts, $navContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  ✓ Updated: $file (accounts variant)" -ForegroundColor Green
            $successCount++
        }
        elseif ($content -match [regex]::Escape($oldNavPatternSettings)) {
            $content = $content.Replace($oldNavPatternSettings, $navContent)
            Set-Content -Path $file -Value $content -NoNewline
            Write-Host "  ✓ Updated: $file (settings variant)" -ForegroundColor Green
            $successCount++
        }
        else {
            Write-Host "  ✗ Pattern not found in: $file" -ForegroundColor Red
            $failCount++
        }
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "Step 2: Creating missing placeholder files..." -ForegroundColor Yellow
Write-Host ""

# Create super-admin-clients.html placeholder
if (-not (Test-Path "super-admin-clients.html")) {
    $clientsContent = @'
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Clients - Harken CRE</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { font-family: 'Montserrat', sans-serif !important; }
        body { background-color: #f9f9f9; margin: 0; padding: 0; }
        .section-title { font-size: 23px; font-weight: 600; color: #1c3643; }
    </style>
</head>
<body>
    <!-- UNIFIED NAVIGATION COMPONENT -->
    <style>.unified-navbar{background:url(https://app.harkenbov.com/assets/img/accent-white-bright.png) top left/contain #1c3643;background-color:#1c3643!important;height:84px;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 32px;box-shadow:0 2px 8px rgba(0,0,0,0.1);position:sticky;top:0;z-index:1000}.nav-logo{height:40px;width:auto;cursor:pointer}.nav-center{display:flex;align-items:center;gap:8px;flex:1;justify-content:center}.nav-core-features{display:flex;align-items:center;gap:4px;background:linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(109, 40, 217, 0.15) 100%);border-radius:25px;padding:4px 8px;margin-right:16px}.nav-link{color:white;text-decoration:none;padding:10px 20px;border-radius:25px;transition:all 0.2s;border:1px solid transparent;font-weight:500;font-size:14px;white-space:nowrap}.nav-link:hover{background-color:rgba(255,255,255,0.08)}.nav-link.core-feature{font-weight:700;font-size:15px;letter-spacing:0.5px;color:#c4b5fd}.nav-link.core-feature:hover{background-color:rgba(124, 58, 237, 0.3);color:#e9d5ff}.nav-link.core-feature.active{background:linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);border:1px solid #a78bfa;color:white;box-shadow:0 4px 12px rgba(124, 58, 237, 0.4)}.nav-link.active{background-color:transparent;border:1px solid #0da1c7;color:#0da1c7}.nav-separator{width:1px;height:24px;background:rgba(255, 255, 255, 0.2);margin:0 8px}.nav-user{display:flex;align-items:center;gap:12px}.nav-user-name{font-size:14px;font-weight:500;color:white}.nav-user-avatar{width:36px;height:36px;border-radius:50%;border:2px solid #0da1c7}.property-tabs-container{background:white;border-bottom:2px solid #e0e0e0;display:none;padding:0 32px}.property-tabs-container.show{display:flex}.property-tab{padding:16px 24px;border:none;background:transparent;color:#687F8B;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:8px;border-bottom:3px solid transparent;margin-bottom:-2px;font-family:'Montserrat', sans-serif}.property-tab:hover{color:#0da1c7;background:#f0fbfd}.property-tab.active{color:#0da1c7;border-bottom-color:#0da1c7;background:#f0fbfd}</style><nav class="unified-navbar"><img src="assets/harken.png" alt="Harken CRE" class="nav-logo" onclick="window.location.href='super-admin-dashboard.html'"><div class="nav-center"><div class="nav-core-features"><a href="../comps-premium-with-clustering.html" class="nav-link core-feature" id="nav-comps">COMPS</a><a href="super-admin-appraisals-list.html" class="nav-link core-feature" id="nav-appraisals">APPRAISAL</a><a href="../evaluation-wizard-full.html" class="nav-link core-feature" id="nav-evaluations">EVALUATION</a></div><div class="nav-separator"></div><a href="super-admin-dashboard.html" class="nav-link" id="nav-dashboard">Dashboard</a><a href="super-admin-users.html" class="nav-link" id="nav-users">Users</a><a href="super-admin-clients.html" class="nav-link" id="nav-clients">Clients</a><a href="super-admin-accounts.html" class="nav-link" id="nav-accounts">Accounts</a><a href="super-admin-reports.html" class="nav-link" id="nav-reports">Reports</a><a href="super-admin-support-tickets.html" class="nav-link" id="nav-support">Support</a><a href="super-admin-audit-logs.html" class="nav-link" id="nav-audit">Audit Logs</a><a href="super-admin-settings.html" class="nav-link" id="nav-settings">Settings</a></div><div class="nav-user"><span class="nav-user-name">Harken Admin</span><img src="https://i.pravatar.cc/150?img=33" alt="User" class="nav-user-avatar"></div></nav><div class="property-tabs-container" id="propertyTabsContainer"><button class="property-tab active" data-type="commercial" onclick="switchPropertyType('commercial')"><span style="font-size: 18px;">🏢</span>Commercial</button><button class="property-tab" data-type="residential" onclick="switchPropertyType('residential')"><span style="font-size: 18px;">🏠</span>Residential</button><button class="property-tab" data-type="land" onclick="switchPropertyType('land')"><span style="font-size: 18px;">🏞️</span>Land</button></div><script>(function(){const currentPage=window.location.pathname.split('/').pop()||'super-admin-dashboard.html';const showPropertyTabsOn=['comps-premium-with-clustering.html','super-admin-appraisals-list.html','evaluation-wizard-full.html'];if(showPropertyTabsOn.some(page=>currentPage.includes(page)||currentPage.includes('comps-')||currentPage.includes('appraisal-')||currentPage.includes('evaluation-'))){document.getElementById('propertyTabsContainer').classList.add('show');}const navMapping={'super-admin-dashboard.html':'nav-dashboard','comps-premium-with-clustering.html':'nav-comps','super-admin-appraisals-list.html':'nav-appraisals','evaluation-wizard-full.html':'nav-evaluations','super-admin-users.html':'nav-users','super-admin-user-edit.html':'nav-users','super-admin-clients.html':'nav-clients','super-admin-accounts.html':'nav-accounts','super-admin-account-manage.html':'nav-accounts','super-admin-account-amenities.html':'nav-accounts','super-admin-account-report-templates.html':'nav-accounts','super-admin-reports.html':'nav-reports','super-admin-support-tickets.html':'nav-support','super-admin-support-create-ticket.html':'nav-support','super-admin-support-ticket-detail.html':'nav-support','super-admin-audit-logs.html':'nav-audit','super-admin-settings.html':'nav-settings','super-admin-settings-billing.html':'nav-settings','super-admin-settings-amenities.html':'nav-settings','super-admin-settings-white-label.html':'nav-settings'};for(const[page,navId]of Object.entries(navMapping)){if(currentPage.includes(page)){const navElement=document.getElementById(navId);if(navElement){navElement.classList.add('active');}break;}}})();function switchPropertyType(type){document.querySelectorAll('.property-tab').forEach(tab=>{tab.classList.remove('active');});document.querySelector(`[data-type="${type}"]`).classList.add('active');localStorage.setItem('activePropertyType',type);console.log('Switched to property type:',type);}window.addEventListener('load',function(){const savedType=localStorage.getItem('activePropertyType');if(savedType){switchPropertyType(savedType);}});</script>

    <div style="padding: 35px 50px;">
        <h2 class="section-title">CLIENTS</h2>
        <div style="background: white; padding: 40px; border-radius: 8px; margin-top: 24px; text-align: center;">
            <p style="color: #687F8B; font-size: 16px;">Client management interface - Coming Soon</p>
            <p style="color: #999; font-size: 14px; margin-top: 12px;">This page will display client information for all accounts.</p>
        </div>
    </div>
</body>
</html>
'@
    Set-Content -Path "super-admin-clients.html" -Value $clientsContent
    Write-Host "  ✓ Created: super-admin-clients.html" -ForegroundColor Green
}

# Create super-admin-appraisals-list.html placeholder
if (-not (Test-Path "super-admin-appraisals-list.html")) {
    $appraisalsContent = @'
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appraisals - Harken CRE</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { font-family: 'Montserrat', sans-serif !important; }
        body { background-color: #f9f9f9; margin: 0; padding: 0; }
        .section-title { font-size: 23px; font-weight: 600; color: #1c3643; }
    </style>
</head>
<body>
    <!-- UNIFIED NAVIGATION COMPONENT -->
    <style>.unified-navbar{background:url(https://app.harkenbov.com/assets/img/accent-white-bright.png) top left/contain #1c3643;background-color:#1c3643!important;height:84px;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 32px;box-shadow:0 2px 8px rgba(0,0,0,0.1);position:sticky;top:0;z-index:1000}.nav-logo{height:40px;width:auto;cursor:pointer}.nav-center{display:flex;align-items:center;gap:8px;flex:1;justify-content:center}.nav-core-features{display:flex;align-items:center;gap:4px;background:linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(109, 40, 217, 0.15) 100%);border-radius:25px;padding:4px 8px;margin-right:16px}.nav-link{color:white;text-decoration:none;padding:10px 20px;border-radius:25px;transition:all 0.2s;border:1px solid transparent;font-weight:500;font-size:14px;white-space:nowrap}.nav-link:hover{background-color:rgba(255,255,255,0.08)}.nav-link.core-feature{font-weight:700;font-size:15px;letter-spacing:0.5px;color:#c4b5fd}.nav-link.core-feature:hover{background-color:rgba(124, 58, 237, 0.3);color:#e9d5ff}.nav-link.core-feature.active{background:linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);border:1px solid #a78bfa;color:white;box-shadow:0 4px 12px rgba(124, 58, 237, 0.4)}.nav-link.active{background-color:transparent;border:1px solid #0da1c7;color:#0da1c7}.nav-separator{width:1px;height:24px;background:rgba(255, 255, 255, 0.2);margin:0 8px}.nav-user{display:flex;align-items:center;gap:12px}.nav-user-name{font-size:14px;font-weight:500;color:white}.nav-user-avatar{width:36px;height:36px;border-radius:50%;border:2px solid #0da1c7}.property-tabs-container{background:white;border-bottom:2px solid #e0e0e0;display:none;padding:0 32px}.property-tabs-container.show{display:flex}.property-tab{padding:16px 24px;border:none;background:transparent;color:#687F8B;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:8px;border-bottom:3px solid transparent;margin-bottom:-2px;font-family:'Montserrat', sans-serif}.property-tab:hover{color:#0da1c7;background:#f0fbfd}.property-tab.active{color:#0da1c7;border-bottom-color:#0da1c7;background:#f0fbfd}</style><nav class="unified-navbar"><img src="assets/harken.png" alt="Harken CRE" class="nav-logo" onclick="window.location.href='super-admin-dashboard.html'"><div class="nav-center"><div class="nav-core-features"><a href="../comps-premium-with-clustering.html" class="nav-link core-feature" id="nav-comps">COMPS</a><a href="super-admin-appraisals-list.html" class="nav-link core-feature" id="nav-appraisals">APPRAISAL</a><a href="../evaluation-wizard-full.html" class="nav-link core-feature" id="nav-evaluations">EVALUATION</a></div><div class="nav-separator"></div><a href="super-admin-dashboard.html" class="nav-link" id="nav-dashboard">Dashboard</a><a href="super-admin-users.html" class="nav-link" id="nav-users">Users</a><a href="super-admin-clients.html" class="nav-link" id="nav-clients">Clients</a><a href="super-admin-accounts.html" class="nav-link" id="nav-accounts">Accounts</a><a href="super-admin-reports.html" class="nav-link" id="nav-reports">Reports</a><a href="super-admin-support-tickets.html" class="nav-link" id="nav-support">Support</a><a href="super-admin-audit-logs.html" class="nav-link" id="nav-audit">Audit Logs</a><a href="super-admin-settings.html" class="nav-link" id="nav-settings">Settings</a></div><div class="nav-user"><span class="nav-user-name">Harken Admin</span><img src="https://i.pravatar.cc/150?img=33" alt="User" class="nav-user-avatar"></div></nav><div class="property-tabs-container" id="propertyTabsContainer"><button class="property-tab active" data-type="commercial" onclick="switchPropertyType('commercial')"><span style="font-size: 18px;">🏢</span>Commercial</button><button class="property-tab" data-type="residential" onclick="switchPropertyType('residential')"><span style="font-size: 18px;">🏠</span>Residential</button><button class="property-tab" data-type="land" onclick="switchPropertyType('land')"><span style="font-size: 18px;">🏞️</span>Land</button></div><script>(function(){const currentPage=window.location.pathname.split('/').pop()||'super-admin-dashboard.html';const showPropertyTabsOn=['comps-premium-with-clustering.html','super-admin-appraisals-list.html','evaluation-wizard-full.html'];if(showPropertyTabsOn.some(page=>currentPage.includes(page)||currentPage.includes('comps-')||currentPage.includes('appraisal-')||currentPage.includes('evaluation-'))){document.getElementById('propertyTabsContainer').classList.add('show');}const navMapping={'super-admin-dashboard.html':'nav-dashboard','comps-premium-with-clustering.html':'nav-comps','super-admin-appraisals-list.html':'nav-appraisals','evaluation-wizard-full.html':'nav-evaluations','super-admin-users.html':'nav-users','super-admin-user-edit.html':'nav-users','super-admin-clients.html':'nav-clients','super-admin-accounts.html':'nav-accounts','super-admin-account-manage.html':'nav-accounts','super-admin-account-amenities.html':'nav-accounts','super-admin-account-report-templates.html':'nav-accounts','super-admin-reports.html':'nav-reports','super-admin-support-tickets.html':'nav-support','super-admin-support-create-ticket.html':'nav-support','super-admin-support-ticket-detail.html':'nav-support','super-admin-audit-logs.html':'nav-audit','super-admin-settings.html':'nav-settings','super-admin-settings-billing.html':'nav-settings','super-admin-settings-amenities.html':'nav-settings','super-admin-settings-white-label.html':'nav-settings'};for(const[page,navId]of Object.entries(navMapping)){if(currentPage.includes(page)){const navElement=document.getElementById(navId);if(navElement){navElement.classList.add('active');}break;}}})();function switchPropertyType(type){document.querySelectorAll('.property-tab').forEach(tab=>{tab.classList.remove('active');});document.querySelector(`[data-type="${type}"]`).classList.add('active');localStorage.setItem('activePropertyType',type);console.log('Switched to property type:',type);}window.addEventListener('load',function(){const savedType=localStorage.getItem('activePropertyType');if(savedType){switchPropertyType(savedType);}});</script>

    <div style="padding: 35px 50px;">
        <h2 class="section-title">APPRAISALS</h2>
        <div style="background: white; padding: 40px; border-radius: 8px; margin-top: 24px; text-align: center;">
            <p style="color: #687F8B; font-size: 16px;">Appraisal management interface - Coming Soon</p>
            <p style="color: #999; font-size: 14px; margin-top: 12px;">This page will list all appraisals with filtering by property type.</p>
            <p style="color: #999; font-size: 14px; margin-top: 8px;">Note: Property type tabs are visible above when on this page.</p>
        </div>
    </div>
</body>
</html>
'@
    Set-Content -Path "super-admin-appraisals-list.html" -Value $appraisalsContent
    Write-Host "  ✓ Created: super-admin-appraisals-list.html" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  ✓ Files updated: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  ✗ Files failed: $failCount" -ForegroundColor Red
}
Write-Host "  ✓ Created placeholder files: 2" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Manually update: ../comps-premium-with-clustering.html (replace old nav)" -ForegroundColor White
Write-Host "  2. Manually update: ../evaluation-wizard-full.html (replace old nav)" -ForegroundColor White
Write-Host "  3. Test all pages by opening super-admin-dashboard.html in browser" -ForegroundColor White
Write-Host "  4. Verify navigation links work across all pages" -ForegroundColor White
Write-Host ""
Write-Host "All SuperAdmin prototype files are now ready!" -ForegroundColor Green

