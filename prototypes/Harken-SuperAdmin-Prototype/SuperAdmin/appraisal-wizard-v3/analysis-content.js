// Analysis Page Content and Logic

let currentTab = 'hbu';
let currentHelpMode = 'guidance';
let activeScenario = null;

// Initialize scenarios from WizardState
function initializeScenarios() {
    if (typeof ScenarioManager !== 'undefined') {
        activeScenario = ScenarioManager.getActiveScenario();
        renderScenarioTabs();
        updateSidebarForScenario();
    } else {
        // Fallback if ScenarioManager not loaded yet
        setTimeout(initializeScenarios, 100);
    }
}

// Render scenario tabs at the top
function renderScenarioTabs() {
    const container = document.getElementById('scenario-tabs-container');
    if (!container) return;
    
    const scenarios = ScenarioManager.getScenarios();
    
    // Hide tabs container if only one scenario
    if (scenarios.length <= 1) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    
    let html = '<div class="scenario-tabs">';
    html += '<div class="flex items-center gap-2 mr-4">';
    html += '<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>';
    html += '<span class="text-sm font-semibold text-blue-800">Valuation Scenarios:</span>';
    html += '</div>';
    
    scenarios.forEach((scenario, idx) => {
        const isActive = activeScenario && activeScenario.id === scenario.id;
        const approachCount = scenario.approaches ? scenario.approaches.length : 0;
        const approachText = approachCount === 1 ? '1 approach' : `${approachCount} approaches`;
        const effectiveDate = scenario.effectiveDate ? new Date(scenario.effectiveDate).toLocaleDateString() : 'Date not set';
        
        html += `<button onclick="switchScenario(${scenario.id})" class="scenario-tab ${isActive ? 'active' : ''}">`;
        html += `<div class="scenario-badge"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>`;
        html += `<span class="scenario-name">${scenario.name || 'Scenario ' + (idx + 1)}</span>`;
        html += `<span class="scenario-date">${effectiveDate}</span>`;
        html += `<span class="scenario-approaches">${approachText}</span>`;
        html += `</button>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Switch between scenarios
function switchScenario(scenarioId) {
    const scenarios = ScenarioManager.getScenarios();
    activeScenario = scenarios.find(s => s.id === scenarioId);
    
    if (activeScenario) {
        ScenarioManager.setActiveScenario(scenarioId);
        renderScenarioTabs();
        updateSidebarForScenario();
        // Re-render current tab with new scenario context
        switchTab(currentTab);
    }
}

// Update sidebar to show only approaches for active scenario
function updateSidebarForScenario() {
    if (!activeScenario) return;
    
    const approaches = activeScenario.approaches || ['Sales Comparison'];
    
    // Get all nav items
    const navItems = {
        'sales': document.getElementById('nav-sales'),
        'income': document.getElementById('nav-income'),
        'cost': document.getElementById('nav-cost')
    };
    
    // Show/hide based on scenario approaches
    Object.keys(navItems).forEach(key => {
        const navItem = navItems[key];
        if (!navItem) return;
        
        const approachKey = key === 'sales' ? 'Sales Comparison' : 
                           key === 'income' ? 'Income Approach' : 'Cost Approach';
        
        if (approaches.includes(approachKey)) {
            navItem.style.display = 'block';
            navItem.classList.remove('disabled');
        } else {
            navItem.style.display = 'block';
            navItem.classList.add('disabled');
            navItem.style.opacity = '0.4';
            navItem.style.pointerEvents = 'none';
        }
    });
    
    // Update scenario indicator in sidebar
    updateSidebarScenarioIndicator();
}

// Add scenario indicator to sidebar
function updateSidebarScenarioIndicator() {
    const sidebar = document.getElementById('left-sidebar');
    if (!sidebar || !activeScenario) return;
    
    // Remove existing indicator
    const existing = sidebar.querySelector('.scenario-indicator');
    if (existing) existing.remove();
    
    // Add new indicator
    const indicator = document.createElement('div');
    indicator.className = 'scenario-indicator';
    indicator.innerHTML = `
        <div class="p-3 mx-3 mt-3 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
            <div class="text-xs font-bold text-cyan-800 uppercase tracking-wide mb-1">Active Scenario</div>
            <div class="font-semibold text-gray-900">${activeScenario.name || 'Default'}</div>
            <div class="text-xs text-gray-500 mt-1">${activeScenario.effectiveDate ? new Date(activeScenario.effectiveDate).toLocaleDateString() : 'Effective date not set'}</div>
        </div>
    `;
    
    // Insert after the logo/header area
    const navSection = sidebar.querySelector('.nav-section');
    if (navSection) {
        sidebar.insertBefore(indicator, navSection);
    }
}

// Generate scenario context banner for each section
function getScenarioContextBanner() {
    if (!activeScenario) return '';
    
    const scenarios = ScenarioManager.getScenarios();
    if (scenarios.length <= 1) return ''; // No banner needed for single scenario
    
    const guidance = ScenarioManager.getScenarioGuidance(activeScenario.name);
    const scenarioClass = activeScenario.name ? activeScenario.name.toLowerCase().replace(/\s+/g, '-') : 'as-is';
    
    let tipText = '';
    if (currentTab === 'sales') tipText = guidance.salesTip;
    else if (currentTab === 'income') tipText = guidance.incomeTip;
    else if (currentTab === 'cost') tipText = guidance.costTip;
    
    return `
        <div class="scenario-context-banner ${scenarioClass}">
            <div class="flex items-start gap-3">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <div class="font-semibold text-sm">${activeScenario.name} Scenario</div>
                    <p class="text-sm opacity-90">${guidance.description}</p>
                    ${tipText ? `<p class="text-xs mt-1 opacity-75"><strong>Tip:</strong> ${tipText}</p>` : ''}
                </div>
            </div>
        </div>
    `;
}

// =================================================================
// IMPROVEMENTS SUMMARY (read-only)
// =================================================================
function renderImprovementsSummaryCard() {
    try {
        if (typeof WizardState === 'undefined' || !window.ImprovementsContract) return '';
        const inv = (typeof WizardState.getImprovementsInventory === 'function')
            ? WizardState.getImprovementsInventory()
            : WizardState.get('improvementsInventory');
        if (!inv) return '';

        const rollups = window.ImprovementsContract.computeRollups(inv);
        const sfTotal = Number(rollups.subjectTotals.sfTotal || 0);
        const parcels = Number(rollups.subjectTotals.parcels || 0);
        const buildings = Number(rollups.subjectTotals.buildings || 0);
        const sfByType = rollups.subjectTotals.sfByType || {};

        const sfTypeRows = Object.keys(sfByType).map(k => `
            <div class="flex items-center justify-between text-xs text-gray-600">
                <span>${k}</span>
                <span class="font-semibold text-gray-800">${Number(sfByType[k] || 0).toLocaleString()}</span>
            </div>
        `).join('');

        return `
            <div class="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h3 class="text-sm font-bold text-gray-900 mb-1">Improvements Summary</h3>
                        <p class="text-xs text-gray-500">Derived from Subject Data → Improvements inventory.</p>
                    </div>
                    <button type="button"
                            class="text-xs font-semibold text-harken-accent hover:text-harken-accent-light"
                            onclick="goToSubjectImprovements()">
                        Edit Improvements →
                    </button>
                </div>

                <div class="grid grid-cols-3 gap-3 mt-4">
                    <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div class="text-[11px] text-gray-500">Parcels</div>
                        <div class="text-lg font-bold text-gray-900">${parcels}</div>
                    </div>
                    <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div class="text-[11px] text-gray-500">Buildings</div>
                        <div class="text-lg font-bold text-gray-900">${buildings}</div>
                    </div>
                    <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div class="text-[11px] text-gray-500">Total SF</div>
                        <div class="text-lg font-bold text-gray-900">${sfTotal.toLocaleString()}</div>
                    </div>
                </div>

                ${sfTypeRows ? `<div class="mt-3 space-y-1">${sfTypeRows}</div>` : ''}
            </div>
        `;
    } catch (e) {
        console.warn('Improvements summary failed to render:', e);
        return '';
    }
}

function goToSubjectImprovements() {
    try {
        if (typeof WizardState !== 'undefined' && typeof WizardState.setSubjectActiveTab === 'function') {
            WizardState.setSubjectActiveTab('improvements');
        } else if (typeof WizardState !== 'undefined') {
            WizardState.set('subjectActiveTab', 'improvements');
        }
        if (typeof WizardNav !== 'undefined') {
            WizardNav.goToPage('subject');
        } else {
            window.location.href = 'subject-data.html';
        }
    } catch (e) {
        window.location.href = 'subject-data.html';
    }
}

function switchTab(tabId) {
    currentTab = tabId;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    const navBtn = document.getElementById('nav-' + tabId);
    if (navBtn) navBtn.classList.add('active');
    
    // Render content
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = renderTabContent(tabId);
    contentArea.scrollTop = 0;
    
    // Update help
    updateHelp(tabId);
}

function renderTabContent(tabId) {
    switch(tabId) {
        case 'hbu':
            return renderHBU();
        case 'land':
            return renderLand();
        case 'market':
            return renderMarket();
        case 'sales':
            return renderSales();
        case 'income':
            return renderIncome();
        case 'cost':
            return renderCost();
        default:
            return '<p>Content not found</p>';
    }
}

function renderHBU() {
    let html = `<div class="animate-fade-in space-y-6">`;
    html += getScenarioContextBanner();
    
    // HBU Introduction
    html += `
        <div class="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
                <svg class="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <h4 class="font-semibold text-amber-900 mb-1">Highest & Best Use Analysis</h4>
                    <p class="text-sm text-amber-800">The reasonably probable use of property that results in the highest value. The use must be legally permissible, physically possible, financially feasible, and maximally productive.</p>
                        </div>
                        </div>
                    </div>
    `;
    
    // ========== SUBJECT DATA REFERENCE (Collapsible) ==========
    html += `
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <button onclick="toggleHBUReference()" class="w-full bg-gray-50 px-6 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors">
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <span class="font-semibold text-gray-700">Subject Data Reference</span>
                    <span class="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">From Subject Data Page</span>
                        </div>
                <svg id="hbu-ref-chevron" class="w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div id="hbu-reference-panel" class="hidden border-t border-gray-200">
                <div class="p-6 grid grid-cols-2 gap-6">
                    <!-- Site/Zoning Data -->
                    <div class="space-y-3">
                        <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                            Site & Zoning
                        </h4>
                        <div class="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                            <div class="flex justify-between"><span class="text-gray-500">Zoning:</span><span class="font-medium text-gray-900" id="ref-zoning">I1 - Light Industrial</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Site Size:</span><span class="font-medium text-gray-900" id="ref-site-size">1.43 Acres / 62,291 SF</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Shape:</span><span class="font-medium text-gray-900" id="ref-shape">Approximately Rectangular</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Topography:</span><span class="font-medium text-gray-900" id="ref-topography">Level at street grade</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Frontage:</span><span class="font-medium text-gray-900" id="ref-frontage">475' along S. 30th St W</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Access:</span><span class="font-medium text-gray-900" id="ref-access">Paved public road</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Utilities:</span><span class="font-medium text-gray-900" id="ref-utilities">All city services available</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Flood Hazard:</span><span class="font-medium text-gray-900" id="ref-flood">Not in flood hazard area</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Easements:</span><span class="font-medium text-gray-900" id="ref-easements">No adverse easements</span></div>
                        </div>
                    </div>
                    <!-- Improvements Data -->
                    <div class="space-y-3">
                        <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            Improvements
                        </h4>
                        <div class="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                            <div class="flex justify-between"><span class="text-gray-500">Building Size:</span><span class="font-medium text-gray-900" id="ref-bldg-size">11,174 SF</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Year Built:</span><span class="font-medium text-gray-900" id="ref-year-built">2019</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Construction:</span><span class="font-medium text-gray-900" id="ref-construction">Pre-engineered steel</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Quality:</span><span class="font-medium text-gray-900" id="ref-quality">Average</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Condition:</span><span class="font-medium text-gray-900" id="ref-condition">Very Good</span></div>
                        </div>
                        </div>
                    </div>
                <div class="px-6 pb-4">
                    <p class="text-xs text-gray-500 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        This data is pulled from Subject Data (Phase 2). To edit, go to Subject Data → Site Details or Improvements.
                    </p>
                        </div>
                        </div>
                    </div>
    `;
    
    // ========== AS VACANT SECTION ==========
    html += `
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    Highest & Best Use - As Vacant
                </h3>
                <p class="text-blue-100 text-sm mt-1">Analysis of the land as if vacant and available for development</p>
                </div>
            <div class="p-6 space-y-6">
                
                <!-- Test 1: Legally Permissible -->
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">1</span>
                            <div>
                                <h4 class="font-semibold text-gray-900">Legally Permissible</h4>
                                <p class="text-xs text-gray-500">What uses are permitted by zoning, deed restrictions, and other legal constraints?</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">Conclusion:</span>
                            <select class="text-sm border-gray-300 rounded-md focus:ring-harken-accent focus:border-harken-accent">
                                <option value="pass" selected>✓ Multiple uses permitted</option>
                                <option value="limited">⚠ Limited uses permitted</option>
                                <option value="single">Single use permitted</option>
                            </select>
                        </div>
                    </div>
                    <div class="p-4 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Permitted Uses Under Current Zoning</label>
                            <div class="flex flex-wrap gap-2">
                                <button type="button" class="toggle-pill selected" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Retail/Commercial
                                </button>
                                <button type="button" class="toggle-pill selected" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Office
                                </button>
                                <button type="button" class="toggle-pill selected" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Industrial/Warehouse
                                </button>
                                <button type="button" class="toggle-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Residential
                                </button>
                                <button type="button" class="toggle-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Mixed-Use
                                </button>
                                <button type="button" class="toggle-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Special/Conditional Use
                                </button>
                                <button type="button" class="toggle-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Agricultural
                                </button>
                                <button type="button" class="toggle-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Recreational
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Max Building Height</label>
                                <input type="text" placeholder="e.g., 45 feet / 3 stories" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Max FAR / Coverage</label>
                                <input type="text" placeholder="e.g., 2.0 FAR / 60% coverage" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Required Parking</label>
                                <input type="text" placeholder="e.g., 1:300 SF retail" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Private Restrictions Identified</label>
                            <div class="flex flex-wrap gap-2">
                                <button type="button" class="toggle-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Deed Restrictions
                                </button>
                                <button type="button" class="toggle-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Restrictive Covenants
                                </button>
                                <button type="button" class="toggle-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Historic Overlay
                                </button>
                                <button type="button" class="toggle-pill selected" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    None Identified
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Legal Permissibility Analysis</label>
                            <textarea rows="2" placeholder="Based on the zoning and any private restrictions, discuss which uses pass the legal permissibility test..." class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">Current I1 zoning permits commercial, office, and light industrial uses without restriction. No private deed restrictions, covenants, or easements were identified that would limit development. The subject passes the legal permissibility test for commercial and industrial uses.</textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Test 2: Physically Possible -->
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">2</span>
                            <div>
                                <h4 class="font-semibold text-gray-900">Physically Possible</h4>
                                <p class="text-xs text-gray-500">What uses can the site's size, shape, topography, and utilities support?</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">Conclusion:</span>
                            <select class="text-sm border-gray-300 rounded-md focus:ring-harken-accent focus:border-harken-accent">
                                <option value="pass" selected>✓ Site supports multiple uses</option>
                                <option value="limited">⚠ Site has constraints</option>
                                <option value="single">Site limits options</option>
                            </select>
                        </div>
                    </div>
                    <div class="p-4 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Site Adequacy Assessment</label>
                            <div class="grid grid-cols-2 gap-3">
                                <button type="button" class="toggle-btn selected" onclick="toggleButtonState(this)">
                                    <span class="toggle-indicator flex-shrink-0 w-5 h-5 rounded-full border-2 border-harken-accent bg-harken-accent flex items-center justify-center">
                                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                    </span>
                                    <span class="text-sm text-gray-700">Site size adequate for intended uses</span>
                                </button>
                                <button type="button" class="toggle-btn selected" onclick="toggleButtonState(this)">
                                    <span class="toggle-indicator flex-shrink-0 w-5 h-5 rounded-full border-2 border-harken-accent bg-harken-accent flex items-center justify-center">
                                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                    </span>
                                    <span class="text-sm text-gray-700">Shape/configuration supports development</span>
                                </button>
                                <button type="button" class="toggle-btn selected" onclick="toggleButtonState(this)">
                                    <span class="toggle-indicator flex-shrink-0 w-5 h-5 rounded-full border-2 border-harken-accent bg-harken-accent flex items-center justify-center">
                                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                    </span>
                                    <span class="text-sm text-gray-700">Topography suitable (no excessive grading)</span>
                                </button>
                                <button type="button" class="toggle-btn selected" onclick="toggleButtonState(this)">
                                    <span class="toggle-indicator flex-shrink-0 w-5 h-5 rounded-full border-2 border-harken-accent bg-harken-accent flex items-center justify-center">
                                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                    </span>
                                    <span class="text-sm text-gray-700">Adequate frontage/access for use</span>
                                </button>
                                <button type="button" class="toggle-btn selected" onclick="toggleButtonState(this)">
                                    <span class="toggle-indicator flex-shrink-0 w-5 h-5 rounded-full border-2 border-harken-accent bg-harken-accent flex items-center justify-center">
                                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                    </span>
                                    <span class="text-sm text-gray-700">All necessary utilities available</span>
                                </button>
                                <button type="button" class="toggle-btn selected" onclick="toggleButtonState(this)">
                                    <span class="toggle-indicator flex-shrink-0 w-5 h-5 rounded-full border-2 border-harken-accent bg-harken-accent flex items-center justify-center">
                                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                    </span>
                                    <span class="text-sm text-gray-700">No significant environmental constraints</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Physical Constraints Identified</label>
                            <div class="flex flex-wrap gap-2">
                                <button type="button" class="toggle-pill constraint-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Flood Zone
                                </button>
                                <button type="button" class="toggle-pill constraint-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Wetlands
                                </button>
                                <button type="button" class="toggle-pill constraint-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Environmental Contamination
                                </button>
                                <button type="button" class="toggle-pill constraint-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Poor Soils
                                </button>
                                <button type="button" class="toggle-pill constraint-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Drainage Issues
                                </button>
                                <button type="button" class="toggle-pill constraint-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Steep Topography
                                </button>
                                <button type="button" class="toggle-pill constraint-pill" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    Access Limitations
                                </button>
                                <button type="button" class="toggle-pill selected" onclick="this.classList.toggle('selected')">
                                    <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                    None Identified
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Physical Possibility Analysis</label>
                            <textarea rows="2" placeholder="Based on the site characteristics from Subject Data, discuss which uses pass the physical possibility test..." class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">The 1.43-acre site is level, regularly shaped, and has adequate frontage along S. 30th Street West. All city utilities are available. No flood hazards, wetlands, or environmental constraints were identified. The site's physical characteristics support commercial, office, and light industrial development without unusual costs.</textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Test 3: Financially Feasible -->
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm">3</span>
                            <div>
                                <h4 class="font-semibold text-gray-900">Financially Feasible</h4>
                                <p class="text-xs text-gray-500">Which uses would generate a return sufficient to justify development costs?</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">Conclusion:</span>
                            <select class="text-sm border-gray-300 rounded-md focus:ring-harken-accent focus:border-harken-accent">
                                <option value="pass" selected>✓ Feasible uses identified</option>
                                <option value="limited">⚠ Limited feasibility</option>
                                <option value="fail">✗ No feasible uses</option>
                            </select>
                        </div>
                    </div>
                    <div class="p-4 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Market Demand Assessment</label>
                            <div class="grid grid-cols-4 gap-4 text-sm">
                                <div class="bg-gray-50 rounded-lg p-3 text-center">
                                    <div class="text-gray-500 text-xs mb-1">Primary Market Area</div>
                                    <input type="text" value="Billings MSA" class="w-full border-0 bg-transparent text-center font-medium text-gray-900 focus:ring-0">
                                </div>
                                <div class="bg-gray-50 rounded-lg p-3 text-center">
                                    <div class="text-gray-500 text-xs mb-1">Commercial Vacancy</div>
                                    <input type="text" value="6.2%" class="w-full border-0 bg-transparent text-center font-medium text-gray-900 focus:ring-0">
                                </div>
                                <div class="bg-gray-50 rounded-lg p-3 text-center">
                                    <div class="text-gray-500 text-xs mb-1">Industrial Vacancy</div>
                                    <input type="text" value="4.1%" class="w-full border-0 bg-transparent text-center font-medium text-gray-900 focus:ring-0">
                                </div>
                                <div class="bg-gray-50 rounded-lg p-3 text-center">
                                    <div class="text-gray-500 text-xs mb-1">Absorption Trend</div>
                                    <input type="text" value="Positive" class="w-full border-0 bg-transparent text-center font-medium text-green-700 focus:ring-0">
                                </div>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Feasibility Analysis by Use</label>
                            <table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-3 py-2 text-left font-medium text-gray-700">Potential Use</th>
                                        <th class="px-3 py-2 text-center font-medium text-gray-700">Est. Dev. Cost</th>
                                        <th class="px-3 py-2 text-center font-medium text-gray-700">Est. Completed Value</th>
                                        <th class="px-3 py-2 text-center font-medium text-gray-700">Profit Margin</th>
                                        <th class="px-3 py-2 text-center font-medium text-gray-700">Feasible?</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr class="bg-green-50">
                                        <td class="px-3 py-2"><input type="text" value="Light Industrial/Warehouse" class="w-full border-0 bg-transparent text-sm font-medium focus:ring-0"></td>
                                        <td class="px-3 py-2"><input type="text" value="$1,850,000" class="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-harken-accent"></td>
                                        <td class="px-3 py-2"><input type="text" value="$2,450,000" class="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-harken-accent"></td>
                                        <td class="px-3 py-2 text-center text-green-700 font-medium">32%</td>
                                        <td class="px-3 py-2 text-center"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">✓ Yes</span></td>
                                    </tr>
                                    <tr>
                                        <td class="px-3 py-2"><input type="text" value="Commercial Retail" class="w-full border-0 bg-transparent text-sm focus:ring-0"></td>
                                        <td class="px-3 py-2"><input type="text" value="$2,100,000" class="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-harken-accent"></td>
                                        <td class="px-3 py-2"><input type="text" value="$2,350,000" class="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-harken-accent"></td>
                                        <td class="px-3 py-2 text-center text-yellow-700 font-medium">12%</td>
                                        <td class="px-3 py-2 text-center"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">⚠ Marginal</span></td>
                                    </tr>
                                    <tr>
                                        <td class="px-3 py-2"><input type="text" value="Office Building" class="w-full border-0 bg-transparent text-sm focus:ring-0"></td>
                                        <td class="px-3 py-2"><input type="text" value="$2,400,000" class="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-harken-accent"></td>
                                        <td class="px-3 py-2"><input type="text" value="$2,200,000" class="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-harken-accent"></td>
                                        <td class="px-3 py-2 text-center text-red-700 font-medium">-8%</td>
                                        <td class="px-3 py-2 text-center"><span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">✗ No</span></td>
                                    </tr>
                                    <tr>
                                        <td class="px-3 py-2"><input type="text" placeholder="Add alternative use..." class="w-full border-0 bg-transparent text-sm text-gray-400 focus:ring-0"></td>
                                        <td class="px-3 py-2"><input type="text" placeholder="$" class="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-harken-accent"></td>
                                        <td class="px-3 py-2"><input type="text" placeholder="$" class="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-harken-accent"></td>
                                        <td class="px-3 py-2 text-center text-gray-400">-</td>
                                        <td class="px-3 py-2 text-center">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Financial Feasibility Analysis</label>
                            <textarea rows="2" placeholder="Discuss which uses are financially feasible based on market conditions, development costs, and expected returns..." class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">Based on current market conditions in the Billings MSA, light industrial/warehouse development is financially feasible with an estimated 32% profit margin. Commercial retail shows marginal feasibility. Office development is not feasible due to current market oversupply and weak rental rates.</textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Test 4: Maximally Productive -->
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">4</span>
                            <div>
                                <h4 class="font-semibold text-gray-900">Maximally Productive</h4>
                                <p class="text-xs text-gray-500">Among feasible uses, which produces the highest residual land value?</p>
                            </div>
                        </div>
                    </div>
                    <div class="p-4 space-y-4">
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <label class="block text-sm font-semibold text-blue-900 mb-2">Concluded Highest & Best Use - As Vacant</label>
                            <input type="text" value="Development with Light Industrial/Warehouse Improvements" class="w-full border border-blue-300 rounded-lg px-4 py-3 text-lg font-semibold text-blue-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Maximally Productive Analysis & Conclusion</label>
                            <textarea rows="4" placeholder="Explain which feasible use produces the highest residual land value and why..." class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">Among the legally permissible, physically possible, and financially feasible uses, light industrial/warehouse development produces the highest residual land value. This conclusion is supported by:

• Strong market demand with low vacancy (4.1%) in the Billings industrial market
• Location along S. 30th Street West with good access and visibility for industrial users
• Site characteristics (size, shape, topography) well-suited for warehouse development
• Zoning allows industrial use by right without need for special permits

The highest and best use of the site as vacant is development with light industrial/warehouse improvements.</textarea>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        `;
    
    // ========== AS IMPROVED SECTION ==========
    html += `
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    Highest & Best Use - As Improved
                </h3>
                <p class="text-green-100 text-sm mt-1">Analysis of the property with existing improvements</p>
            </div>
            <div class="p-6 space-y-6">
                
                <!-- Existing Improvements Summary - references Subject Data -->
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="font-semibold text-gray-900">Existing Improvements Summary</h4>
                        <span class="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">From Subject Data</span>
                    </div>
                    <div class="grid grid-cols-5 gap-4 text-sm">
                        <div>
                            <span class="text-gray-500">Type:</span>
                            <div class="font-medium" id="imp-type">Light Industrial</div>
                        </div>
                        <div>
                            <span class="text-gray-500">Year Built:</span>
                            <div class="font-medium" id="imp-year">2019</div>
                        </div>
                        <div>
                            <span class="text-gray-500">Size:</span>
                            <div class="font-medium" id="imp-size">11,174 SF</div>
                        </div>
                        <div>
                            <span class="text-gray-500">Quality:</span>
                            <div class="font-medium" id="imp-quality">Average</div>
                        </div>
                        <div>
                            <span class="text-gray-500">Condition:</span>
                            <div class="font-medium" id="imp-condition">Very Good</div>
                        </div>
                    </div>
                </div>
                
                <!-- Key Question -->
                <div class="border border-gray-200 rounded-lg p-5">
                    <h4 class="font-semibold text-gray-900 mb-4">Central Question: What should be done with the existing improvements?</h4>
                    <div class="grid grid-cols-4 gap-3">
                        <label class="flex flex-col items-center gap-2 px-4 py-4 border-2 border-green-500 bg-green-50 rounded-lg cursor-pointer text-center">
                            <input type="radio" name="retain_improvements" value="continue" checked class="text-green-600 focus:ring-green-500">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            <span class="font-semibold text-green-900 text-sm">Continue Current Use</span>
                            <span class="text-xs text-green-700">Improvements contribute value</span>
                        </label>
                        <label class="flex flex-col items-center gap-2 px-4 py-4 border-2 border-gray-200 rounded-lg cursor-pointer text-center hover:border-gray-300">
                            <input type="radio" name="retain_improvements" value="convert" class="text-harken-accent focus:ring-harken-accent">
                            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                            <span class="font-semibold text-gray-900 text-sm">Convert to Different Use</span>
                            <span class="text-xs text-gray-600">Adapt for higher value use</span>
                        </label>
                        <label class="flex flex-col items-center gap-2 px-4 py-4 border-2 border-gray-200 rounded-lg cursor-pointer text-center hover:border-gray-300">
                            <input type="radio" name="retain_improvements" value="renovate" class="text-harken-accent focus:ring-harken-accent">
                            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            <span class="font-semibold text-gray-900 text-sm">Renovate/Modernize</span>
                            <span class="text-xs text-gray-600">Investment increases value</span>
                        </label>
                        <label class="flex flex-col items-center gap-2 px-4 py-4 border-2 border-gray-200 rounded-lg cursor-pointer text-center hover:border-gray-300">
                            <input type="radio" name="retain_improvements" value="demolish" class="text-red-600 focus:ring-red-500">
                            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            <span class="font-semibold text-gray-900 text-sm">Demolish & Redevelop</span>
                            <span class="text-xs text-gray-600">Land value exceeds improved</span>
                        </label>
                    </div>
                </div>
                
                <!-- Contributory Value Analysis -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-3">Contributory Value Analysis</h4>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                        <div class="bg-blue-50 rounded-lg p-3 text-center">
                            <div class="text-gray-500 text-xs mb-1">Estimated Land Value (Vacant)</div>
                            <input type="text" value="$285,000" class="w-full border-0 bg-transparent text-center text-xl font-bold text-blue-700 focus:ring-0">
                        </div>
                        <div class="bg-green-50 rounded-lg p-3 text-center">
                            <div class="text-gray-500 text-xs mb-1">Estimated Value As Improved</div>
                            <input type="text" value="$2,450,000" class="w-full border-0 bg-transparent text-center text-xl font-bold text-green-700 focus:ring-0">
                        </div>
                        <div class="bg-purple-50 rounded-lg p-3 text-center">
                            <div class="text-gray-500 text-xs mb-1">Improvement Contribution</div>
                            <input type="text" value="$2,165,000" class="w-full border-0 bg-transparent text-center text-xl font-bold text-purple-700 focus:ring-0" readonly>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-3 text-center">Improvements contribute significant value; demolition is not economically justified.</p>
                </div>
                
                <!-- Interim Use -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="font-semibold text-gray-900">Interim Use Consideration</h4>
                        <button type="button" class="toggle-pill" onclick="this.classList.toggle('selected'); document.getElementById('interim-use-details').style.display = this.classList.contains('selected') ? 'block' : 'none';">
                            <svg class="pill-check w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            Interim use applies
                        </button>
                    </div>
                    <div id="interim-use-details" style="display: none;">
                        <textarea rows="2" placeholder="Describe the interim use and the timeline/trigger for transition to the highest and best use..." class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-harken-accent focus:border-harken-accent"></textarea>
                    </div>
                </div>
                
                <!-- Conclusion -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <label class="block text-sm font-semibold text-green-900 mb-2">Concluded Highest & Best Use - As Improved</label>
                    <input type="text" value="Continued Use as Light Industrial/Warehouse" class="w-full border border-green-300 rounded-lg px-4 py-3 text-lg font-semibold text-green-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">As Improved Conclusion & Rationale</label>
                    <textarea rows="4" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">The highest and best use of the property as improved is the continuation of its current use as a light industrial/warehouse facility. This conclusion is based on the following:

• The existing improvements are consistent with the as-vacant highest and best use conclusion
• The 2019-built improvements are in very good condition with substantial remaining economic life
• The improvements contribute approximately $2,165,000 to property value beyond the land value
• No conversion, renovation, or demolition scenario produces a higher residual value
• The current use is legally conforming and represents the most efficient use of the site</textarea>
                </div>
            </div>
        </div>
    `;
    
    html += `</div>`;
    return html;
}

// Toggle function for HBU reference panel
function toggleHBUReference() {
    const panel = document.getElementById('hbu-reference-panel');
    const chevron = document.getElementById('hbu-ref-chevron');
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        chevron.style.transform = 'rotate(180deg)';
    } else {
        panel.classList.add('hidden');
        chevron.style.transform = 'rotate(0deg)';
    }
}

function renderLand() {
    let html = `<div class="animate-fade-in space-y-6">`;
    html += getScenarioContextBanner();
    
    // Methodology Selection with Context
    html += `<div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">`;
    html += `<div class="flex items-center justify-between mb-4">`;
    html += `<h3 class="text-lg font-semibold text-gray-900">Land Valuation Methodology</h3>`;
    html += `<button class="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1" onclick="alert('Methodology help coming soon')">`;
    html += `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    html += `Which method should I use?`;
    html += `</button>`;
    html += `</div>`;
    
    // Method Cards instead of dropdown
    html += `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">`;
    const methods = [
        { 
            id: 'sales-comparison', 
            label: 'Sales Comparison', 
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            description: 'Compare to recent land sales',
            recommended: true
        },
        { 
            id: 'allocation', 
            label: 'Allocation', 
            icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
            description: 'Extract from improved sales'
        },
        { 
            id: 'extraction', 
            label: 'Extraction', 
            icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
            description: 'Depreciated cost minus land'
        }
    ];
    
    methods.forEach(method => {
        const isSelected = method.id === 'sales-comparison'; // Default selection
        html += `<div class="relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}" onclick="selectLandMethod('${method.id}')">`;
        if (method.recommended) {
            html += `<span class="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">Recommended</span>`;
        }
        if (isSelected) {
            html += `<div class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">`;
            html += `<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
            html += `</div>`;
        }
        html += `<div class="flex items-start gap-3">`;
        html += `<div class="p-2 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}">`;
        html += `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${method.icon}"></path></svg>`;
        html += `</div>`;
        html += `<div class="flex-1">`;
        html += `<h4 class="font-semibold text-gray-900 mb-1">${method.label}</h4>`;
        html += `<p class="text-xs text-gray-600">${method.description}</p>`;
        html += `</div>`;
        html += `</div>`;
        html += `</div>`;
    });
    html += `</div>`;
    html += `</div>`;
    
    // Search/Add Comparables Section
    html += `<div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">`;
    html += `<div class="flex items-center justify-between mb-4">`;
    html += `<h3 class="text-lg font-semibold text-gray-900">Comparable Land Sales</h3>`;
    html += `<div class="flex gap-2">`;
    html += `<button class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">`;
    html += `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`;
    html += `Search Database`;
    html += `</button>`;
    html += `<button class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">`;
    html += `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>`;
    html += `Add Comparable`;
    html += `</button>`;
    html += `</div>`;
    html += `</div>`;
    
    // Interactive Grid with better styling
    html += `<div class="overflow-x-auto border rounded-lg">`;
    html += `<table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">Feature</th>
                <th class="px-4 py-3 text-center font-semibold text-blue-700 bg-blue-50 border-x-2 border-blue-200">Subject</th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700">
                    <div class="flex items-center justify-between">
                        <span>Sale 1</span>
                        <button class="text-red-500 hover:text-red-700 opacity-0 hover:opacity-100 transition-opacity">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700">
                    <div class="flex items-center justify-between">
                        <span>Sale 2</span>
                        <button class="text-red-500 hover:text-red-700 opacity-0 hover:opacity-100 transition-opacity">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </th>
                <th class="px-4 py-3 text-center font-semibold text-gray-700">
                    <div class="flex items-center justify-between">
                        <span>Sale 3</span>
                        <button class="text-red-500 hover:text-red-700 opacity-0 hover:opacity-100 transition-opacity">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Sale Price
                    </div>
                </td>
                <td class="px-4 py-3 text-center bg-blue-50 border-x-2 border-blue-100 text-gray-500">-</td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="$"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="$"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="$"></td>
            </tr>
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        Price / SF
                    </div>
                </td>
                <td class="px-4 py-3 text-center bg-blue-50 border-x-2 border-blue-100 text-gray-500">-</td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="$"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="$"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="$"></td>
            </tr>
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                        Size (SF)
                    </div>
                </td>
                <td class="px-4 py-3 bg-blue-50 border-x-2 border-blue-100"><input class="w-full border border-blue-300 rounded px-2 py-1 text-center bg-white focus:ring-2 focus:ring-blue-500" placeholder="SF"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="SF"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="SF"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="SF"></td>
            </tr>
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                        Zoning
                    </div>
                </td>
                <td class="px-4 py-3 bg-blue-50 border-x-2 border-blue-100"><input class="w-full border border-blue-300 rounded px-2 py-1 text-center bg-white focus:ring-2 focus:ring-blue-500" placeholder="Zone"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Zone"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Zone"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Zone"></td>
            </tr>
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        Sale Date
                    </div>
                </td>
                <td class="px-4 py-3 text-center bg-blue-50 border-x-2 border-blue-100 text-gray-500">Current</td>
                <td class="px-4 py-3"><input type="date" class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></td>
                <td class="px-4 py-3"><input type="date" class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></td>
                <td class="px-4 py-3"><input type="date" class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></td>
            </tr>
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-white">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Location
                    </div>
                </td>
                <td class="px-4 py-3 bg-blue-50 border-x-2 border-blue-100"><input class="w-full border border-blue-300 rounded px-2 py-1 text-center bg-white focus:ring-2 focus:ring-blue-500" placeholder="Address"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Address"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Address"></td>
                <td class="px-4 py-3"><input class="w-full border border-gray-300 rounded px-2 py-1 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Address"></td>
            </tr>
        </tbody>
    </table>`;
    html += `</div>`;
    
    // Add more comparables button
    html += `<button class="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">`;
    html += `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>`;
    html += `Add Another Comparable`;
    html += `</button>`;
    html += `</div>`;
    
    // Value Conclusion with Analysis
    html += `<div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">`;
    html += `<h3 class="text-lg font-semibold text-gray-900 mb-4">Land Value Conclusion</h3>`;
    
    // Quick Stats
    html += `<div class="grid grid-cols-3 gap-4 mb-6">`;
    html += `<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">`;
    html += `<div class="text-xs text-blue-700 font-medium mb-1">Average $/SF</div>`;
    html += `<div class="text-2xl font-bold text-blue-900">$0.00</div>`;
    html += `<div class="text-xs text-blue-600 mt-1">From comparables</div>`;
    html += `</div>`;
    html += `<div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">`;
    html += `<div class="text-xs text-green-700 font-medium mb-1">Range</div>`;
    html += `<div class="text-lg font-bold text-green-900">$0 - $0</div>`;
    html += `<div class="text-xs text-green-600 mt-1">Min to Max</div>`;
    html += `</div>`;
    html += `<div class="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">`;
    html += `<div class="text-xs text-purple-700 font-medium mb-1">Subject Size</div>`;
    html += `<div class="text-2xl font-bold text-purple-900">0 SF</div>`;
    html += `<div class="text-xs text-purple-600 mt-1">Enter above</div>`;
    html += `</div>`;
    html += `</div>`;
    
    html += renderField({ type: 'currency', label: 'Indicated Value of Land', id: 'land_value_conc', placeholder: '$0.00' });
    html += typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
        id: 'land_analysis',
        label: 'Reconciliation & Analysis',
        rows: 4,
        placeholder: 'Explain how you arrived at the land value conclusion. Discuss which comparables were given more weight and why, adjustments made, and any market trends affecting land values...',
        sectionContext: 'reconciliation',
        helperText: 'Explain your reconciliation of land value indicators.'
    }) : renderField({ type: 'textarea', label: 'Reconciliation & Analysis', id: 'land_analysis', rows: 4, placeholder: 'Explain how you arrived at the land value conclusion...' });
    html += `</div>`;
    
    html += `</div>`;
    return html;
}

// Helper function for land method selection
function selectLandMethod(methodId) {
    console.log('Land method selected:', methodId);
    // Update UI to show selected method
    document.querySelectorAll('[onclick^="selectLandMethod"]').forEach(card => {
        card.classList.remove('border-blue-500', 'bg-blue-50');
        card.classList.add('border-gray-200');
        // Remove checkmark
        const checkmark = card.querySelector('.absolute.top-2.right-2');
        if (checkmark) checkmark.remove();
    });
    
    // Add selection to clicked card
    const selectedCard = document.querySelector(`[onclick="selectLandMethod('${methodId}')"]`);
    if (selectedCard) {
        selectedCard.classList.add('border-blue-500', 'bg-blue-50');
        selectedCard.classList.remove('border-gray-200');
        // Add checkmark if not exists
        if (!selectedCard.querySelector('.absolute.top-2.right-2')) {
            const checkmark = document.createElement('div');
            checkmark.className = 'absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center';
            checkmark.innerHTML = '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>';
            selectedCard.appendChild(checkmark);
        }
    }
}

function renderMarket() {
    let html = `<div class="animate-fade-in space-y-6">`;
    html += getScenarioContextBanner();
    
    html += `<div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">`;
    html += `<h3 class="text-lg font-semibold text-gray-900 mb-4">Market Analysis</h3>`;
    html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">`;
    html += typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
        id: 'mkt_cycle',
        label: 'Market Cycle Stage',
        options: ['Recovery', 'Expansion', 'Hypersupply', 'Recession'],
        allowCustom: false,
        category: 'market'
    }) : renderField({ type: 'select', label: 'Market Cycle Stage', id: 'mkt_cycle', options: ['Recovery', 'Expansion', 'Hypersupply', 'Recession'] });
    html += typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
        id: 'mkt_supply_demand',
        label: 'Supply & Demand',
        options: ['Shortage', 'In Balance', 'Over Supply'],
        allowCustom: false,
        category: 'market'
    }) : renderField({ type: 'select', label: 'Supply & Demand', id: 'mkt_supply_demand', options: ['Shortage', 'In Balance', 'Over Supply'] });
    html += `</div>`;
    html += `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">`;
    html += renderField({ type: 'text', label: 'Marketing Time', id: 'mkt_time', placeholder: 'e.g. 6-12 Months' });
    html += renderField({ type: 'text', label: 'Vacancy Rate Trend', id: 'mkt_vacancy', placeholder: 'e.g. Stable at 5%' });
    html += renderField({ type: 'text', label: 'Rent Trend', id: 'mkt_rent', placeholder: 'e.g. Increasing 3%/yr' });
    html += `</div>`;
    html += typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
        id: 'mkt_desc',
        label: 'Market Area Description',
        rows: 4,
        placeholder: 'Describe the market area boundaries and general characteristics...',
        sectionContext: 'area_description',
        helperText: 'Include location, boundaries, and general neighborhood characteristics.'
    }) : renderField({ type: 'textarea', label: 'Market Area Description', id: 'mkt_desc', rows: 4, placeholder: 'Describe the market area boundaries and general characteristics...' });
    html += typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
        id: 'mkt_econ',
        label: 'Economic Trends',
        rows: 4,
        placeholder: 'Discuss employment, population growth, and major economic drivers (e.g., WSJ articles, interest rates)...',
        sectionContext: 'area_description',
        helperText: 'Discuss economic factors affecting the market.'
    }) : renderField({ type: 'textarea', label: 'Economic Trends', id: 'mkt_econ', rows: 4, placeholder: 'Discuss employment, population growth, and major economic drivers...' });
    html += `</div>`;
    
    html += `</div>`;
    return html;
}

function renderSales() {
    const scenarioBanner = getScenarioContextBanner();
    return `
        <div class="space-y-6 animate-fade-in">
            ${scenarioBanner}
            ${renderImprovementsSummaryCard()}
            <!-- Comparable Sales Selection -->
            <div class="card">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="card-header mb-0">Sales Comparison Grid</h3>
                    <div class="flex gap-2">
                        <button class="btn btn-outline" onclick="searchComparables()">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            Search Database
                        </button>
                        <button class="btn btn-primary" onclick="addComparable()">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            Add Comparable
                        </button>
                    </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">Click on comparable properties to select/deselect. Use Superior/Inferior/Similar flags to indicate relative quality.</p>
                
                <!-- Grid Container -->
                <div class="sales-grid-container" id="sales-grid-container">
                    ${renderSalesGrid()}
                </div>
            </div>

            <!-- Value Conclusion -->
            <div class="card">
                <h3 class="card-header">Value Conclusion</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <div class="text-xs text-blue-700 font-medium mb-1">Low Range</div>
                        <div class="text-2xl font-bold text-blue-900" id="value-low">$4,850,000</div>
                        <div class="text-xs text-blue-600 mt-1" id="value-low-sf">$242.50 / SF</div>
                    </div>
                    <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <div class="text-xs text-green-700 font-medium mb-1">Concluded Value</div>
                        <div class="text-3xl font-bold text-green-900" id="value-concluded">$5,130,000</div>
                        <div class="text-xs text-green-600 mt-1" id="value-concluded-sf">$256.50 / SF</div>
                    </div>
                    <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                        <div class="text-xs text-purple-700 font-medium mb-1">High Range</div>
                        <div class="text-2xl font-bold text-purple-900" id="value-high">$5,400,000</div>
                        <div class="text-xs text-purple-600 mt-1" id="value-high-sf">$270.00 / SF</div>
                    </div>
                </div>
                ${renderField({type: 'textarea', label: 'Reconciliation Comments', rows: 5, required: true, placeholder: 'Explain how you reconciled the comparable sales to arrive at your value conclusion. Discuss which comparables were given more weight and why...'})}
            </div>
        </div>
    `;
}

// Sales Comparison Grid Data - Match AppraisePro
let gridData = {
    subject: {
        id: 'subject',
        name: "The Loft/Wild Willy's",
        address: "1123 1st Avenue North",
        city: "Billings, MT",
        photo: "https://picsum.photos/id/122/400/300",
        status: "Subject",
        saleDate: "Current",
        salePrice: null,
        buildingSize: 8766,
        siteSize: 62375,
        yearBuilt: "1930/R2006",
        effectiveAge: "12 yrs",
        condition: "Aver./Aver.+",
        hbu: "Bar/Casino/Rest",
        pricePerSF: null,
        capRate: null
    },
    comparables: [
        {
            id: 'comp1',
            name: "Tippy Cow Café",
            address: "279 Airport Road",
            city: "Billings, MT",
            photo: "https://picsum.photos/id/437/400/300",
            status: "Sold 08-2024",
            distance: "2.4 mi",
            saleDate: "08-2024",
            salePrice: 1155000,
            buildingSize: 3280,
            siteSize: 37592,
            yearBuilt: "1977/R2000",
            effectiveAge: "10 yrs",
            condition: "Aver./Aver.+",
            hbu: "Restaurant",
            pricePerSF: 352.13,
            capRate: 0.0624,
            selected: true,
            adjustments: {}
        },
        {
            id: 'comp2',
            name: "Doc & Eddy's",
            address: "927 S. 32nd Street",
            city: "Billings, MT",
            photo: "https://picsum.photos/id/225/400/300",
            status: "Sold 01-2024",
            distance: "3.1 mi",
            saleDate: "01-2024",
            salePrice: 1415000,
            buildingSize: 9120,
            siteSize: 84684,
            yearBuilt: "2005",
            effectiveAge: "7 yrs",
            condition: "Aver./Aver.+",
            hbu: "Rest/Bar/Casino",
            pricePerSF: 155.15,
            capRate: 0.0661,
            selected: true,
            adjustments: {}
        },
        {
            id: 'comp3',
            name: "Casino Mardi Gras",
            address: "4100 King Avenue West",
            city: "Billings, MT",
            photo: "https://picsum.photos/id/158/400/300",
            status: "Sold 06-2023",
            distance: "5.0 mi",
            saleDate: "06-2023",
            salePrice: 1300000,
            buildingSize: 4284,
            siteSize: 36271,
            yearBuilt: "2007",
            effectiveAge: "7 yrs",
            condition: "Good/Good",
            hbu: "Bar/Casino",
            pricePerSF: 303.45,
            capRate: 0.0564,
            selected: true,
            adjustments: {}
        },
        {
            id: 'comp4',
            name: "Beartooth Bar & Grill",
            address: "305 South 1st Avenue",
            city: "Laurel, MT",
            photo: "https://picsum.photos/id/431/400/300",
            status: "Sold 12-2020",
            distance: "12.5 mi",
            saleDate: "12-2020",
            salePrice: 525000,
            buildingSize: 3996,
            siteSize: 15000,
            yearBuilt: "1998/R2014",
            effectiveAge: "7 yrs",
            condition: "Aver./Aver.+",
            hbu: "Bar/Casino/Rest",
            pricePerSF: 131.38,
            capRate: 0.0739,
            selected: false,
            adjustments: {}
        },
        {
            id: 'comp5',
            name: "Dos Machos Restaurant",
            address: "980 S. 24th Street West",
            city: "Billings, MT",
            photo: "https://picsum.photos/id/348/400/300",
            status: "Sold 02-2020",
            distance: "4.2 mi",
            saleDate: "02-2020",
            salePrice: 1850000,
            buildingSize: 8349,
            siteSize: 74339,
            yearBuilt: "2000",
            effectiveAge: "15 yrs",
            condition: "Aver./Aver.",
            hbu: "Bar/Casino/Rest",
            pricePerSF: 221.58,
            capRate: 0.0598,
            selected: false,
            adjustments: {}
        },
        {
            id: 'comp6',
            name: "The Red Door Lounge",
            address: "3875 Grand Avenue",
            city: "Billings, MT",
            photo: "https://picsum.photos/id/435/400/300",
            status: "Sold 11-2019",
            distance: "6.1 mi",
            saleDate: "11-2019",
            salePrice: 875000,
            buildingSize: 4200,
            siteSize: 28000,
            yearBuilt: "1985",
            effectiveAge: "20 yrs",
            condition: "Average",
            hbu: "Bar/Lounge",
            pricePerSF: 208.33,
            capRate: 0.0712,
            selected: false,
            adjustments: {}
        },
        {
            id: 'comp7',
            name: "Jake's Downtown",
            address: "2701 1st Avenue North",
            city: "Billings, MT",
            photo: "https://picsum.photos/id/238/400/300",
            status: "Sold 09-2019",
            distance: "0.5 mi",
            saleDate: "09-2019",
            salePrice: 1250000,
            buildingSize: 6500,
            siteSize: 45000,
            yearBuilt: "1995/R2010",
            effectiveAge: "10 yrs",
            condition: "Good",
            hbu: "Restaurant/Bar",
            pricePerSF: 192.31,
            capRate: 0.0685,
            selected: false,
            adjustments: {}
        },
        {
            id: 'comp8',
            name: "Bullwhackers Casino",
            address: "1500 N 7th Ave",
            city: "Bozeman, MT",
            photo: "https://picsum.photos/id/299/400/300",
            status: "Sold 05-2019",
            distance: "142 mi",
            saleDate: "05-2019",
            salePrice: 2100000,
            buildingSize: 7800,
            siteSize: 52000,
            yearBuilt: "2001",
            effectiveAge: "12 yrs",
            condition: "Good",
            hbu: "Casino/Restaurant",
            pricePerSF: 269.23,
            capRate: 0.0598,
            selected: false,
            adjustments: {}
        }
    ]
};

// Adjustment categories with their properties
const adjustmentCategories = [
    { id: 'property_rights', label: 'Property Rights', section: 'transactional', type: 'select', options: ['Fee Simple', 'Leased Fee', 'Leasehold'] },
    { id: 'financing', label: 'Financing Terms', section: 'transactional', type: 'select', options: ['Cash', 'Conventional', 'Seller Financing'] },
    { id: 'conditions_sale', label: 'Conditions of Sale', section: 'transactional', type: 'select', options: ['Arms Length', 'Non-Arms Length', 'REO'] },
    { id: 'market_conditions', label: 'Market Conditions (Time)', section: 'transactional', type: 'currency', hasFlag: false },
    { id: 'location', label: 'Location', section: 'physical', type: 'currency', hasFlag: true },
    { id: 'size', label: 'Building Size', section: 'physical', type: 'currency', hasFlag: true },
    { id: 'site_size', label: 'Site Size', section: 'physical', type: 'currency', hasFlag: true },
    { id: 'age_condition', label: 'Age/Condition', section: 'physical', type: 'currency', hasFlag: true },
    { id: 'quality', label: 'Quality/Class', section: 'physical', type: 'currency', hasFlag: true },
    { id: 'parking', label: 'Parking', section: 'physical', type: 'currency', hasFlag: true },
    { id: 'amenities', label: 'Amenities', section: 'physical', type: 'currency', hasFlag: true }
];

function renderSalesGrid() {
    const allComps = [gridData.subject, ...gridData.comparables];
    const selectedComps = gridData.comparables.filter(c => c.selected);
    const displayComps = [gridData.subject, ...selectedComps];
    const numCols = displayComps.length;
    
    let html = `<div class="sales-grid" style="grid-template-columns: 200px 260px repeat(${selectedComps.length}, 240px);">`;
    
    // HEADER ROW WITH PHOTOS
    html += '<div class="grid-cell grid-header-cell grid-label-col"><span class="text-xs uppercase tracking-wide text-gray-500 font-bold">Elements</span></div>';
    
    // Subject Header
    html += `<div class="grid-cell grid-header-cell grid-subject-col">
        <div class="property-card-header">
            <img src="${gridData.subject.photo}" alt="${gridData.subject.name}" class="property-photo">
            <div>
                <div class="property-name">${gridData.subject.name}</div>
                <div class="property-address">${gridData.subject.address}<br>${gridData.subject.city}</div>
                <div class="property-status" style="background: #dbeafe; color: #1e40af;">${gridData.subject.status}</div>
            </div>
        </div>
    </div>`;
    
    // Comp Headers
    selectedComps.forEach((comp, idx) => {
        html += `<div class="grid-cell grid-header-cell">
            <div class="property-card-header">
                <img src="${comp.photo}" alt="${comp.name}" class="property-photo">
                <div>
                    <div class="property-name">${comp.name}</div>
                    <div class="property-address">${comp.address}<br>${comp.city}</div>
                    <div class="flex items-center justify-between gap-2 mt-1">
                        <div class="property-status" style="background: #dcfce7; color: #166534;">${comp.status}</div>
                        <div class="text-xs text-gray-500">${comp.distance}</div>
                    </div>
                </div>
            </div>
        </div>`;
    });
    
    // SECTION 1: TRANSACTION DATA
    html += '<div class="section-header-row">Transaction Data</div>';
    
    const transactionRows = [
        { label: 'Date of Sale', key: 'saleDate' },
        { label: 'Identification', key: 'name' },
        { label: 'Address', key: 'address' },
        { label: 'H & B Use', key: 'hbu' },
        { label: 'Year Built', key: 'yearBuilt' },
        { label: 'Effective Age', key: 'effectiveAge' },
        { label: 'Site Area SF', key: 'siteSize', format: 'number' },
        { label: 'Bldg. Size', key: 'buildingSize', format: 'number' },
        { label: 'Qual./Cond.', key: 'condition' },
        { label: 'Sales Price', key: 'salePrice', format: 'currency', highlight: true },
        { label: 'Overall $/SF', key: 'pricePerSF', format: 'currency', highlight: true },
        { label: 'CAP Rate', key: 'capRate', format: 'percent' }
    ];
    
    transactionRows.forEach(row => {
        html += '<div class="grid-row">';
        html += `<div class="grid-cell grid-label-col"><span class="text-sm font-medium text-gray-700">${row.label}</span></div>`;
        html += `<div class="grid-cell grid-subject-col"><span class="${row.highlight ? 'font-semibold' : ''}">${formatGridValue(gridData.subject[row.key], row.format)}</span></div>`;
        selectedComps.forEach(comp => {
            const value = formatGridValue(comp[row.key], row.format);
            html += `<div class="grid-cell"><span class="${row.highlight ? 'font-semibold text-harken-accent' : ''}">${value}</span></div>`;
        });
        html += '</div>';
    });
    
    // SECTION 2: TRANSACTIONAL ADJUSTMENTS
    html += '<div class="section-header-row">Transactional Adjustments</div>';
    
    const transactionalAdj = [
        { id: 'prop_rights', label: 'Prop. Rights', subjectValue: 'Fee Simple' },
        { id: 'financing', label: 'Financing', subjectValue: 'Cash to Seller' },
        { id: 'cond_sale', label: 'Cond. Sale', subjectValue: 'Typical' },
        { id: 'expenditures', label: 'Expenditures', subjectValue: 'None' },
        { id: 'market_cond', label: 'Market Cond.', subjectValue: 'Current' },
        { id: 'adjustment', label: 'Adjustment', subjectValue: '-' }
    ];
    
    transactionalAdj.forEach(adj => {
        html += '<div class="grid-row">';
        html += `<div class="grid-cell grid-label-col"><span class="text-sm font-medium text-gray-700">${adj.label}</span></div>`;
        html += `<div class="grid-cell grid-subject-col text-center"><span class="text-sm">${adj.subjectValue}</span></div>`;
        selectedComps.forEach(comp => {
            html += `<div class="grid-cell">
                <input type="text" class="adjustment-input" placeholder="-" onchange="updateAdjustment('${comp.id}', '${adj.id}', this.value)">
            </div>`;
        });
        html += '</div>';
    });
    
    // Net Transactional Adjustment Summary
    html += '<div class="grid-row summary-row">';
    html += '<div class="grid-cell grid-label-col summary-row"><span class="font-semibold">Adj. Price/SF</span></div>';
    html += '<div class="grid-cell grid-subject-col summary-row text-center">-</div>';
    selectedComps.forEach(comp => {
        html += `<div class="grid-cell summary-row text-center"><span class="font-bold text-gray-900" id="adj-trans-sf-${comp.id}">$${comp.pricePerSF.toFixed(2)}</span></div>`;
    });
    html += '</div>';
    
    // SECTION 3: PHYSICAL CHARACTERISTICS
    html += '<div class="section-header-row">Physical Characteristics & Overall</div>';
    
    const physicalRows = [
        { id: 'location', label: 'Location', subjectValue: 'Good' },
        { id: 'hbu_comp', label: 'H & B Use', subjectValue: gridData.subject.hbu },
        { id: 'eff_age', label: 'Effective Age', subjectValue: gridData.subject.effectiveAge },
        { id: 'site_area', label: 'Site Size/SF', subjectValue: gridData.subject.siteSize.toLocaleString() },
        { id: 'bldg_size', label: 'Bldg. Size/SF', subjectValue: gridData.subject.buildingSize.toLocaleString() },
        { id: 'qual_cond', label: 'Qual./Cond.', subjectValue: gridData.subject.condition }
    ];
    
    physicalRows.forEach(row => {
        html += '<div class="grid-row">';
        html += `<div class="grid-cell grid-label-col"><span class="text-sm font-medium text-gray-700">${row.label}</span></div>`;
        html += `<div class="grid-cell grid-subject-col text-center"><span class="text-sm">${row.subjectValue}</span></div>`;
        selectedComps.forEach(comp => {
            const currentFlag = comp.adjustments?.[row.id]?.flag || 'similar';
            html += `<div class="grid-cell">
                <div class="flex flex-col gap-2">
                    ${renderSingleFlagToggle(comp.id, row.id, currentFlag)}
                    <input type="text" class="adjustment-input" placeholder="$0" onchange="updateAdjustment('${comp.id}', '${row.id}', this.value)">
                </div>
            </div>`;
        });
        html += '</div>';
    });
    
    // SECTION 4: VALUATION ANALYSIS
    html += '<div class="section-header-row">Valuation Analysis</div>';
    
    const valuationRows = [
        { id: 'notes', label: 'Notes', type: 'link' },
        { id: 'overall_comp', label: 'Overall Comparability', type: 'flag' },
        { id: 'overall_adj', label: 'Overall Adjustment', type: 'percent' },
        { id: 'adj_price_sf', label: 'Adjusted Price Per SF', type: 'currency' },
        { id: 'weighting', label: 'Weighting', type: 'percent' },
        { id: 'sales_value_sf', label: 'Sales Value $/SF', type: 'currency' }
    ];
    
    valuationRows.forEach(row => {
        html += '<div class="grid-row">';
        html += `<div class="grid-cell grid-label-col"><span class="text-sm font-medium text-gray-700">${row.label}</span></div>`;
        html += `<div class="grid-cell grid-subject-col text-center text-gray-400">-</div>`;
        selectedComps.forEach(comp => {
            if (row.type === 'link') {
                html += `<div class="grid-cell"><a href="#" class="text-cyan-600 hover:underline text-xs">Add notes</a></div>`;
            } else if (row.type === 'flag') {
                const currentFlag = comp.adjustments?.[row.id]?.flag || 'similar';
                html += `<div class="grid-cell">
                    ${renderSingleFlagToggle(comp.id, row.id, currentFlag)}
                </div>`;
            } else {
                html += `<div class="grid-cell">
                    <input type="text" class="adjustment-input" placeholder="${row.type === 'percent' ? '0%' : '$0'}" onchange="updateValuation('${comp.id}', '${row.id}', this.value)">
                </div>`;
            }
        });
        html += '</div>';
    });
    
    // TOTAL VALUE ROW
    html += '<div class="grid-row total-row">';
    html += '<div class="grid-cell grid-label-col total-row"><span class="text-base font-black uppercase">TOTAL SALES VALUE</span></div>';
    html += '<div class="grid-cell grid-subject-col total-row text-center"><span class="text-gray-400">N/A</span></div>';
    selectedComps.forEach(comp => {
        html += `<div class="grid-cell total-row text-center"><span class="text-xl font-bold text-emerald-600" id="total-value-${comp.id}">$${comp.salePrice.toLocaleString()}</span></div>`;
    });
    html += '</div>';
    
    html += '</div>'; // End grid
    
    // Add/Remove Comps Section
    const unselectedComps = gridData.comparables.filter(c => !c.selected);
    if (unselectedComps.length > 0) {
        html += '<div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">';
        html += '<h4 class="font-semibold text-gray-900 mb-3">Available Comparables</h4>';
        html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">';
        unselectedComps.forEach(comp => {
            html += `<div class="bg-white border border-gray-200 rounded-lg p-3 hover:border-harken-accent hover:shadow-md transition-all cursor-pointer" onclick="toggleCompSelection('${comp.id}')">
                <img src="${comp.photo}" alt="${comp.name}" class="w-full h-20 object-cover rounded mb-2">
                <div class="text-xs font-semibold text-gray-900 truncate">${comp.name}</div>
                <div class="text-xs text-gray-500 truncate">${comp.address}</div>
                <div class="text-xs text-harken-accent font-semibold mt-1">$${comp.pricePerSF.toFixed(2)}/SF</div>
            </div>`;
        });
        html += '</div></div>';
    }
    
    return html;
}

function formatGridValue(value, format) {
    if (value === null || value === undefined) return '-';
    if (format === 'currency') return '$' + value.toLocaleString();
    if (format === 'number') return value.toLocaleString();
    if (format === 'percent') return value ? (value * 100).toFixed(2) + '%' : '-';
    return value;
}

function updateValuation(compId, rowId, value) {
    const comp = gridData.comparables.find(c => c.id === compId);
    if (comp) {
        if (!comp.adjustments) comp.adjustments = {};
        if (!comp.adjustments[rowId]) comp.adjustments[rowId] = {};
        comp.adjustments[rowId].value = value;
    }
}

function searchComparables() {
    alert('This would open a modal to search the database for comparable sales based on filters (location, size, date, property type).');
}

function addComparable() {
    alert('This would open a modal to manually add a comparable sale or upload from external source.');
}

function toggleCompSelection(compId) {
    const comp = gridData.comparables.find(c => c.id === compId);
    if (comp) {
        comp.selected = !comp.selected;
        updateSalesGrid();
    }
}

function updateAdjustment(compId, categoryId, value) {
    const comp = gridData.comparables.find(c => c.id === compId);
    if (comp) {
        if (!comp.adjustments) comp.adjustments = {};
        if (!comp.adjustments[categoryId]) comp.adjustments[categoryId] = {};
        comp.adjustments[categoryId].value = value;
        
        // Recalculate totals
        calculateAdjustments(compId);
    }
}

function renderSingleFlagToggle(compId, adjId, currentFlag) {
    if (currentFlag === 'superior') {
        return `<button onclick="cycleFlag('${compId}', '${adjId}')" class="flag-badge flag-superior w-full justify-center" title="Click to change">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"></path></svg>
            SUP
        </button>`;
    } else if (currentFlag === 'inferior') {
        return `<button onclick="cycleFlag('${compId}', '${adjId}')" class="flag-badge flag-inferior w-full justify-center" title="Click to change">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
            INF
        </button>`;
    } else {
        return `<button onclick="cycleFlag('${compId}', '${adjId}')" class="flag-badge flag-similar w-full justify-center" title="Click to change">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4"></path></svg>
            SIM
        </button>`;
    }
}

function cycleFlag(compId, adjId) {
    const comp = gridData.comparables.find(c => c.id === compId);
    if (!comp) return;
    
    if (!comp.adjustments) comp.adjustments = {};
    if (!comp.adjustments[adjId]) comp.adjustments[adjId] = {};
    
    const currentFlag = comp.adjustments[adjId].flag || 'similar';
    
    // Cycle: similar -> superior -> inferior -> similar
    const nextFlag = currentFlag === 'similar' ? 'superior' : 
                     currentFlag === 'superior' ? 'inferior' : 'similar';
    
    comp.adjustments[adjId].flag = nextFlag;
    
    // Update just this button without re-rendering entire grid
    updateSalesGrid();
}

function calculateAdjustments(compId) {
    // In a real app, this would sum all adjustments and update the adjusted price
    // For now, just log
    console.log('Calculating adjustments for', compId);
}

function updateSalesGrid() {
    const container = document.getElementById('sales-grid-container');
    if (container) {
        container.innerHTML = renderSalesGrid();
    }
}

function renderIncome() {
    let html = `<div class="animate-fade-in space-y-6">`;
    html += getScenarioContextBanner();
    html += renderImprovementsSummaryCard();
    
    // NOI & Cap Rate Summary
    html += `<div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">`;
    html += `<h3 class="text-lg font-semibold text-gray-900 mb-4">Direct Capitalization Summary</h3>`;
    html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-8">`;
    html += `<div>`;
    html += renderField({ type: 'currency', label: 'Potential Gross Income (PGI)', id: 'inc_pgi', placeholder: '$105,000' });
    html += renderField({ type: 'currency', label: 'Vacancy & Credit Loss', id: 'inc_vac', placeholder: '-$5,250' });
    html += renderField({ type: 'currency', label: 'Effective Gross Income (EGI)', id: 'inc_egi', readonly: true, placeholder: '$99,750' });
    html += renderField({ type: 'currency', label: 'Total Expenses', id: 'inc_exp', readonly: true, placeholder: '-$25,400' });
    html += `<div class="p-3 bg-blue-50 rounded-lg border border-blue-100 mt-2">`;
    html += `<label class="block text-xs font-bold text-blue-900 uppercase">Net Operating Income (NOI)</label>`;
    html += `<div class="text-2xl font-bold text-blue-700">$74,350</div>`;
    html += `</div>`;
    html += `</div>`;
    
    html += `<div>`;
    html += `<label class="block text-sm font-medium text-gray-700 mb-2">Cap Rate Selection</label>`;
    html += `<div class="flex items-center gap-4 mb-4">`;
    html += `<input type="range" min="3" max="12" step="0.1" value="6.5" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" oninput="document.getElementById('cap-rate-disp').textContent = this.value + '%'">`;
    html += `<span id="cap-rate-disp" class="text-xl font-bold text-gray-900">6.5%</span>`;
    html += `</div>`;
    html += typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
        id: 'inc_cap_rat',
        label: 'Cap Rate Rationale',
        rows: 3,
        placeholder: 'Justify selection based on comps...',
        sectionContext: 'reconciliation',
        helperText: 'Explain how you selected and supported the capitalization rate.'
    }) : renderField({ type: 'textarea', label: 'Cap Rate Rationale', id: 'inc_cap_rat', rows: 3, placeholder: 'Justify selection based on comps...' });
    
    html += `<div class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 text-center">`;
    html += `<p class="text-sm text-green-800 mb-1">Indicated Value (NOI / Cap Rate)</p>`;
    html += `<div class="text-3xl font-bold text-green-700">$1,143,846</div>`;
    html += `<p class="text-xs text-green-600 mt-1">Rounded: <strong>$1,140,000</strong></p>`;
    html += `</div>`;
    
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;

    html += `</div>`;
    return html;
}

function renderCost() {
    const scenarioBanner = getScenarioContextBanner();
    return `<div class="animate-fade-in space-y-6">
        ${scenarioBanner}
        ${renderImprovementsSummaryCard()}
        <!-- Data Source -->
         <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Cost Data Source</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Source Name</label>
                    <select class="w-full border-gray-300 rounded-lg focus:ring-harken-accent focus:border-harken-accent">
                        <option>Marshall & Swift / CoreLogic</option>
                        <option>Marshall Valuation Service (MVS)</option>
                        <option>RSMeans</option>
                        <option>Local Contractors</option>
                        <option>Historical Costs</option>
                    </select>
                </div>
                <div>
                     <label class="block text-sm font-medium text-gray-700 mb-1">Effective Date of Cost Data</label>
                     <input type="date" class="w-full border-gray-300 rounded-lg focus:ring-harken-accent focus:border-harken-accent">
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                     <label class="block text-sm font-medium text-gray-700 mb-1">Quality Rating</label>
                     <select class="w-full border-gray-300 rounded-lg focus:ring-harken-accent focus:border-harken-accent">
                        <option>Low Cost</option>
                        <option>Average</option>
                        <option>Good</option>
                        <option selected>Excellent Quality</option>
                    </select>
                </div>
                <div>
                     <label class="block text-sm font-medium text-gray-700 mb-1">Structure Class</label>
                     <select class="w-full border-gray-300 rounded-lg"><option>Class A (Fireproof Steel)</option><option>Class B (Reinforced Concrete)</option><option selected>Class C (Masonry)</option><option>Class D (Wood Frame)</option><option>Class S (Metal Frame)</option></select>
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Section / Page Reference</label>
                <input type="text" class="w-full border-gray-300 rounded-lg" placeholder="e.g., Section 14, Page 30">
            </div>
        </div>

        <!-- Base Cost Calculation -->
        <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Base Cost Calculation</h3>
            <div class="grid grid-cols-2 gap-6 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Gross Building Area (SF)</label>
                    <input type="number" class="w-full border-gray-300 rounded-lg" value="11174" placeholder="5,736">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Base Cost ($/SF)</label>
                    <input type="number" step="0.01" class="w-full border-gray-300 rounded-lg" value="227.00" placeholder="$227.00">
                </div>
            </div>
            
            <!-- Cost Multipliers Section -->
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                <h4 class="font-bold text-sm text-blue-900 mb-3">Cost Multipliers & Adjustments</h4>
                <div class="space-y-3">
                    <div class="grid grid-cols-3 gap-4 items-center">
                        <label class="text-sm font-medium text-gray-700">Story Height Multiplier:</label>
                        <input type="number" step="0.01" class="border-gray-300 rounded px-2 py-1 text-center" value="1.18" placeholder="1.00">
                        <span class="text-xs text-gray-500">Adjust for building height</span>
                    </div>
                    <div class="grid grid-cols-3 gap-4 items-center">
                        <label class="text-sm font-medium text-gray-700">Current Cost Multiplier:</label>
                        <input type="number" step="0.01" class="border-gray-300 rounded px-2 py-1 text-center" value="1.12" placeholder="1.00">
                        <span class="text-xs text-gray-500">Time/inflation adjustment</span>
                    </div>
                    <div class="grid grid-cols-3 gap-4 items-center">
                        <label class="text-sm font-medium text-gray-700">Local Multiplier:</label>
                        <input type="number" step="0.01" class="border-gray-300 rounded px-2 py-1 text-center" value="0.96" placeholder="1.00">
                        <span class="text-xs text-gray-500">Geographic adjustment</span>
                    </div>
                </div>
            </div>

            <div class="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-gray-700">Adjusted Base Cost ($/SF):</span>
                    <span class="text-xl font-bold text-green-700">$288.00</span>
                </div>
                <div class="text-xs text-gray-600 mt-1">
                    Calculation: $227.00 × 1.18 × 1.12 × 0.96 = $288.00/SF
                </div>
            </div>

            <div class="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <span class="font-medium text-gray-700">Total Building Replacement Cost</span>
                <span class="text-xl font-bold text-harken-dark">$3,218,112</span>
            </div>
        </div>

        <!-- Site Improvements -->
        <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Site Improvements</h3>
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Paving & Parking</label>
                        <input type="number" class="w-full border-gray-300 rounded-lg" placeholder="$0">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Landscaping</label>
                        <input type="number" class="w-full border-gray-300 rounded-lg" placeholder="$0">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Utilities & Infrastructure</label>
                        <input type="number" class="w-full border-gray-300 rounded-lg" placeholder="$0">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Other Site Improvements</label>
                        <input type="number" class="w-full border-gray-300 rounded-lg" placeholder="$0">
                    </div>
                </div>
                <div class="p-4 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-200">
                    <span class="font-medium text-gray-700">Total Site Improvements:</span>
                    <span class="text-lg font-bold text-blue-700">$1,593,280</span>
                </div>
            </div>
        </div>

        <!-- Replacement Cost Summary -->
        <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Replacement Cost New - Summary</h3>
            <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-sm text-gray-700">Building: 11,174 SF @ $288.00</span>
                    <span class="font-medium">$3,218,112</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-sm text-gray-700">Site Improvements</span>
                    <span class="font-medium">$1,593,280</span>
                </div>
                <div class="flex justify-between items-center py-3 bg-blue-50 px-3 rounded-lg">
                    <span class="font-bold text-gray-900">Total Cost via M&S:</span>
                    <span class="text-2xl font-bold text-blue-700">$4,811,392</span>
                </div>
                <div class="flex justify-between items-center py-2 text-sm text-gray-600">
                    <span>Cost Per Square Foot:</span>
                    <span class="font-medium">$430.59 / SF</span>
                </div>
            </div>
        </div>

        <!-- Depreciation Analysis -->
        <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Depreciation Analysis</h3>
            <div class="space-y-6">
                <!-- Physical -->
                <div class="grid grid-cols-12 gap-4 items-center">
                    <div class="col-span-4">
                        <label class="text-sm font-medium text-gray-900">Physical Depreciation</label>
                        <p class="text-xs text-gray-500">Age / Life Method</p>
                    </div>
                    <div class="col-span-6">
                        <input type="range" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" min="0" max="100" value="25" oninput="document.getElementById('phys-val').textContent = this.value + '%'">
                    </div>
                    <div class="col-span-2 text-right">
                        <span id="phys-val" class="text-sm font-bold text-gray-900">25%</span>
                    </div>
                </div>
                
                <!-- Functional -->
                <div class="grid grid-cols-12 gap-4 items-center">
                    <div class="col-span-4">
                        <label class="text-sm font-medium text-gray-900">Functional Obsolescence</label>
                        <p class="text-xs text-gray-500">Design / Utility</p>
                    </div>
                    <div class="col-span-6">
                        <input type="range" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" min="0" max="100" value="5" oninput="document.getElementById('func-val').textContent = this.value + '%'">
                    </div>
                    <div class="col-span-2 text-right">
                        <span id="func-val" class="text-sm font-bold text-gray-900">5%</span>
                    </div>
                </div>

                <!-- External -->
                <div class="grid grid-cols-12 gap-4 items-center">
                    <div class="col-span-4">
                        <label class="text-sm font-medium text-gray-900">External Obsolescence</label>
                        <p class="text-xs text-gray-500">Economic / Locational</p>
                    </div>
                    <div class="col-span-6">
                        <input type="range" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" min="0" max="100" value="0" oninput="document.getElementById('ext-val').textContent = this.value + '%'">
                    </div>
                    <div class="col-span-2 text-right">
                        <span id="ext-val" class="text-sm font-bold text-gray-900">0%</span>
                    </div>
                </div>
            </div>
            <div class="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <span class="font-medium text-gray-700">Total Depreciation</span>
                <span class="text-lg font-bold text-red-600">-$258,120 (30%)</span>
            </div>
        </div>

        <!-- Value Conclusion -->
        <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Cost Approach Value Conclusion</h3>
            <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-sm text-gray-700">Land Value</span>
                    <span class="font-medium">$450,000</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-sm text-gray-700">Replacement Cost New</span>
                    <span class="font-medium">$860,400</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-sm text-gray-700">Less: Total Depreciation</span>
                    <span class="font-medium text-red-600">-$258,120</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b">
                    <span class="text-sm text-gray-700">Depreciated Cost of Improvements</span>
                    <span class="font-medium">$602,280</span>
                </div>
                <div class="flex justify-between items-center py-3 bg-green-50 px-3 rounded-lg mt-4">
                    <span class="font-bold text-gray-900">Indicated Value - Cost Approach</span>
                    <span class="text-2xl font-bold text-green-700">$1,052,280</span>
                </div>
            </div>
        </div>
    </div>`;
}

function switchHelpMode(mode) {
    currentHelpMode = mode;
    
    // Update header tabs
    const guidanceBtn = document.getElementById('header-tab-guidance');
    const valuesBtn = document.getElementById('header-tab-values');
    
    if (mode === 'guidance') {
        guidanceBtn.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
        guidanceBtn.classList.remove('text-gray-600');
        valuesBtn.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
        valuesBtn.classList.add('text-gray-600');
    } else {
        valuesBtn.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
        valuesBtn.classList.remove('text-gray-600');
        guidanceBtn.classList.remove('bg-white', 'text-gray-900', 'shadow-sm');
        guidanceBtn.classList.add('text-gray-600');
    }
    
    // Update content
    const helpContent = document.getElementById('help-content');
    if (mode === 'guidance') {
        updateHelp(currentTab);
    } else {
        renderValuesPanel();
    }
}

function toggleFullScreen() {
    const leftSidebar = document.getElementById('left-sidebar');
    const helpSidebar = document.getElementById('help-sidebar');
    const gridContainer = document.getElementById('sales-grid-container');
    
    if (leftSidebar.classList.contains('collapsed')) {
        // Exit full screen
        leftSidebar.classList.remove('collapsed');
        helpSidebar.classList.remove('collapsed');
        if (gridContainer) gridContainer.classList.remove('fullscreen');
    } else {
        // Enter full screen
        leftSidebar.classList.add('collapsed');
        helpSidebar.classList.add('collapsed');
        if (gridContainer) gridContainer.classList.add('fullscreen');
    }
}

function updateHelp(tabId) {
    if (currentHelpMode !== 'guidance') return;
    
    const helpContent = document.getElementById('help-content');
    const helpText = {
        'hbu': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Highest & Best Use</h3>
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4">
                <h4 class="font-bold text-sm mb-2">The 4 Tests</h4>
                <ul class="text-xs text-gray-700 space-y-1 list-disc list-inside">
                    <li><strong>Legally Permissible:</strong> Zoning, easements, deed restrictions</li>
                    <li><strong>Physically Possible:</strong> Size, shape, topography, utilities</li>
                    <li><strong>Financially Feasible:</strong> Positive return potential</li>
                    <li><strong>Maximally Productive:</strong> Highest value use</li>
                </ul>
            </div>
            <p class="text-sm text-gray-600">Analyze "As Vacant" first, then "As Improved".</p>
        `,
        'land': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Land Valuation</h3>
            <p class="text-sm text-gray-600 mb-4">Estimate the value of the land as if vacant and available for development.</p>
            <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                <h4 class="font-semibold text-sm text-green-900 mb-1">Methods</h4>
                <p class="text-xs text-green-800">Sales Comparison is most common. Use Allocation or Extraction when improved sales are available.</p>
            </div>
        `,
        'market': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Market Analysis</h3>
            <p class="text-sm text-gray-600 mb-4">Analyze current market conditions, trends, and competitive properties.</p>
        `,
        'sales': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Sales Comparison</h3>
            <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
                <h4 class="font-bold text-sm mb-2">Adjustment Hierarchy</h4>
                <ol class="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Property Rights Conveyed</li>
                    <li>Financing Terms</li>
                    <li>Conditions of Sale</li>
                    <li>Market Conditions (Time)</li>
                    <li>Location & Physical Characteristics</li>
                </ol>
            </div>
        `,
        'income': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Income Approach</h3>
            <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded mb-4">
                <h4 class="font-bold text-sm mb-2">Key Metrics</h4>
                <ul class="text-xs text-gray-700 space-y-1 list-disc list-inside">
                    <li><strong>PGI:</strong> Potential Gross Income</li>
                    <li><strong>EGI:</strong> Effective Gross Income (less vacancy)</li>
                    <li><strong>NOI:</strong> Net Operating Income (less expenses)</li>
                    <li><strong>Cap Rate:</strong> NOI / Value</li>
                </ul>
            </div>
        `,
        'cost': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Cost Approach</h3>
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-4">
                <h4 class="font-bold text-sm mb-2">Depreciation Types</h4>
                <ul class="text-xs text-gray-700 space-y-1 list-disc list-inside">
                    <li><strong>Physical:</strong> Wear and tear</li>
                    <li><strong>Functional:</strong> Outdated design or superadequacy</li>
                    <li><strong>External:</strong> Economic or locational factors</li>
                </ul>
            </div>
            <p class="text-xs text-gray-500 mt-2">Source: Marshall & Swift / CoreLogic</p>
        `
    };
    helpContent.innerHTML = helpText[tabId] || '';
}

function renderValuesPanel() {
    const helpContent = document.getElementById('help-content');
    helpContent.innerHTML = `
        <h3 class="text-lg font-bold text-gray-900 mb-4">Weighted Values</h3>
        <div class="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">Preliminary Conclusion</div>
            <div class="text-3xl font-bold text-harken-accent">$5,200,000</div>
        </div>
        <div class="space-y-3">
            <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-semibold text-blue-900">Sales Comparison</span>
                    <span class="text-xs font-bold text-blue-700">40%</span>
                </div>
                <div class="text-lg font-bold text-gray-900">$5,130,000</div>
            </div>
            <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-semibold text-green-900">Income Approach</span>
                    <span class="text-xs font-bold text-green-700">40%</span>
                </div>
                <div class="text-lg font-bold text-gray-900">$5,300,000</div>
            </div>
            <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-semibold text-purple-900">Cost Approach</span>
                    <span class="text-xs font-bold text-purple-700">20%</span>
                </div>
                <div class="text-lg font-bold text-gray-900">$5,290,000</div>
            </div>
        </div>
        <div class="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Note:</strong> Adjust weights in the Reconciliation section (Phase 5).
        </div>
    `;
}

// Initialize
window.addEventListener('DOMContentLoaded', function() {
    initializeScenarios();
    switchTab('hbu');
});

// Export functions for global access
window.switchScenario = switchScenario;
window.initializeScenarios = initializeScenarios;

