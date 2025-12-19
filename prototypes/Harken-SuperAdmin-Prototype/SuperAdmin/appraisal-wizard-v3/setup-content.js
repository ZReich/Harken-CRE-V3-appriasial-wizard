// Setup Page Content and Logic

let currentTab = 'basics';
let currentHelpMode = 'guidance';

// ==========================================
// SCENARIO TRIGGER STATE & OPTIONS
// ==========================================
let assignmentContext = {
    propertyType: null,
    subType: null,
    propertyStatus: null,
    plannedChanges: null,        // No pre-selection
    occupancyStatus: null,       // No pre-selection
    loanPurpose: null,           // No pre-selection
    // Purpose & Scope fields
    appraisalPurpose: null,      // Market Value, Insurable Value, etc.
    propertyInterest: null,      // Fee Simple, Leased Fee, Leasehold
    intendedUsers: '',           // Text field for user names
    approaches: {
        cost: { enabled: false, required: false },
        sales: { enabled: false, required: false },
        income: { enabled: false, required: false }
    }
};

// ==========================================
// OWNERS STATE MANAGEMENT
// ==========================================
let owners = [
    { id: 'owner_1', name: '', ownershipType: 'individual', percentage: '100' }
];

function getOwnersHTML() {
    return owners.map((owner, index) => `
        <div class="owner-entry p-4 border border-gray-200 rounded-lg mb-3 bg-gray-50" id="owner-${owner.id}">
            <div class="flex items-start justify-between mb-3">
                <span class="text-sm font-medium text-gray-700">Owner ${index + 1}</span>
                ${owners.length > 1 ? `
                    <button type="button" onclick="removeOwner('${owner.id}')" class="text-gray-400 hover:text-red-500 transition-colors" title="Remove Owner">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Owner Name <span class="text-red-500">*</span></label>
                    <input type="text" 
                           value="${owner.name}" 
                           onchange="updateOwner('${owner.id}', 'name', this.value)"
                           placeholder="Full legal name as shown on title"
                           class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ownership Type</label>
                    <select onchange="updateOwner('${owner.id}', 'ownershipType', this.value)"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">
                        <option value="individual" ${owner.ownershipType === 'individual' ? 'selected' : ''}>Individual</option>
                        <option value="corporation" ${owner.ownershipType === 'corporation' ? 'selected' : ''}>Corporation</option>
                        <option value="llc" ${owner.ownershipType === 'llc' ? 'selected' : ''}>LLC</option>
                        <option value="partnership" ${owner.ownershipType === 'partnership' ? 'selected' : ''}>Partnership</option>
                        <option value="trust" ${owner.ownershipType === 'trust' ? 'selected' : ''}>Trust</option>
                        <option value="government" ${owner.ownershipType === 'government' ? 'selected' : ''}>Government Entity</option>
                        <option value="other" ${owner.ownershipType === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
            </div>
            ${owners.length > 1 ? `
                <div class="mt-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ownership Percentage</label>
                    <div class="flex items-center gap-2">
                        <input type="number" 
                               value="${owner.percentage}" 
                               onchange="updateOwner('${owner.id}', 'percentage', this.value)"
                               min="0" max="100" step="0.01"
                               placeholder="100"
                               class="w-24 border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-harken-accent focus:border-harken-accent">
                        <span class="text-gray-500">%</span>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function renderOwners() {
    const container = document.getElementById('owners-container');
    if (!container) return;
    container.innerHTML = getOwnersHTML();
}

function addOwner() {
    const newOwner = {
        id: 'owner_' + Date.now(),
        name: '',
        ownershipType: 'individual',
        percentage: ''
    };
    owners.push(newOwner);
    
    // Recalculate percentages if needed
    if (owners.length === 2 && owners[0].percentage === '100') {
        owners[0].percentage = '50';
        owners[1].percentage = '50';
    }
    
    renderOwners();
}

function removeOwner(ownerId) {
    if (owners.length <= 1) return;
    owners = owners.filter(o => o.id !== ownerId);
    
    // If only one owner left, set percentage to 100
    if (owners.length === 1) {
        owners[0].percentage = '100';
    }
    
    renderOwners();
}

function updateOwner(ownerId, field, value) {
    const owner = owners.find(o => o.id === ownerId);
    if (owner) {
        owner[field] = value;
    }
}

const propertyStatusOptions = [
    { value: 'existing', label: 'Existing / Completed', description: 'Property is built and operational', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { value: 'under_construction', label: 'Under Construction', description: 'Currently being built or renovated', icon: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z' },
    { value: 'proposed', label: 'Proposed / Not Yet Started', description: 'Plans exist but construction has not begun', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { value: 'recently_completed', label: 'Recently Completed', description: 'Finished within the last 12 months', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
];

const plannedChangesOptions = [
    { value: 'none', label: 'No planned changes', description: 'Property will remain as-is' },
    { value: 'minor', label: 'Minor repairs/updates', description: 'Less than 10% of property value' },
    { value: 'major', label: 'Major renovation or expansion', description: 'Significant capital improvements planned' },
    { value: 'change_of_use', label: 'Change of use / Conversion', description: 'Property will be converted to different use' }
];

const occupancyStatusOptions = [
    { value: 'stabilized', label: 'Stabilized (>90% occupied)', description: 'At or near market occupancy' },
    { value: 'lease_up', label: 'In lease-up phase', description: 'Currently filling vacancies' },
    { value: 'vacant', label: 'Vacant or under-occupied', description: 'Below 70% occupied' },
    { value: 'not_applicable', label: 'N/A (owner-occupied)', description: 'Not an income property' }
];

const loanPurposeOptions = [
    { value: 'purchase', label: 'Purchase financing', description: 'Acquisition of existing property' },
    { value: 'refinance', label: 'Refinance', description: 'Refinancing existing debt' },
    { value: 'construction', label: 'Construction loan', description: 'Financing new construction' },
    { value: 'bridge', label: 'Bridge / interim financing', description: 'Short-term financing, often for value-add' },
    { value: 'internal', label: 'Internal / portfolio review', description: 'Not for lending purposes' }
];

// ==========================================
// PURPOSE & SCOPE OPTIONS (Button-based)
// ==========================================
const appraisalPurposeOptions = [
    { value: 'market_value', label: 'Market Value', description: 'Most probable selling price in open market', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'insurable_value', label: 'Insurable Value', description: 'Replacement cost for insurance purposes', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { value: 'liquidation_value', label: 'Liquidation Value', description: 'Value under forced or distressed sale', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { value: 'investment_value', label: 'Investment Value', description: 'Value to a specific investor', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
];

const propertyInterestOptions = [
    { value: 'fee_simple', label: 'Fee Simple', description: 'Full ownership rights, subject only to government powers', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { value: 'leased_fee', label: 'Leased Fee', description: 'Landlord\'s interest when property is leased', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { value: 'leasehold', label: 'Leasehold', description: 'Tenant\'s interest under a lease agreement', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    { value: 'partial_interest', label: 'Partial Interest', description: 'Fractional ownership or undivided interest', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' }
];

// ==========================================
// AUTOMATIC SCENARIO DETERMINATION LOGIC
// Per Interagency Appraisal Guidelines and USPAP
// ==========================================
function determineRequiredScenarios() {
    const result = [];
    const { propertyStatus, plannedChanges, occupancyStatus, loanPurpose } = assignmentContext;
    
    if (!propertyStatus) {
        // No property status selected yet - return empty scenario with no pre-selected approaches
        return [{ id: 1, name: 'As Is', nameSelect: 'As Is', customName: '', approaches: [], effectiveDate: '', isRequired: false, requirementSource: '' }];
    }
    
    // === RULE 1: Property Status Drives Primary Scenarios ===
    if (propertyStatus === 'proposed') {
        result.push({ id: 1, name: 'As Proposed', nameSelect: 'As Proposed', customName: '', approaches: getDefaultApproachesForScenario('As Proposed'), effectiveDate: '', isRequired: true, requirementSource: 'Proposed development - no existing improvements' });
        result.push({ id: 2, name: 'As Completed', nameSelect: 'As Completed', customName: '', approaches: getDefaultApproachesForScenario('As Completed'), effectiveDate: '', isRequired: true, requirementSource: 'Interagency Guidelines - construction/development' });
        result.push({ id: 3, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized'), effectiveDate: '', isRequired: true, requirementSource: 'Interagency Guidelines - income property stabilization' });
    } 
    else if (propertyStatus === 'under_construction') {
        result.push({ id: 1, name: 'As Is', nameSelect: 'As Is', customName: '', approaches: getDefaultApproachesForScenario('As Is'), effectiveDate: '', isRequired: true, requirementSource: 'Current value of partially-complete improvements' });
        result.push({ id: 2, name: 'As Completed', nameSelect: 'As Completed', customName: '', approaches: getDefaultApproachesForScenario('As Completed'), effectiveDate: '', isRequired: true, requirementSource: 'Interagency Guidelines - construction loan' });
        result.push({ id: 3, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized'), effectiveDate: '', isRequired: true, requirementSource: 'Interagency Guidelines - post-construction lease-up' });
    }
    else if (propertyStatus === 'recently_completed') {
        result.push({ id: 1, name: 'As Is', nameSelect: 'As Is', customName: '', approaches: getDefaultApproachesForScenario('As Is'), effectiveDate: '', isRequired: true, requirementSource: 'Current market value' });
        // Only add As Stabilized if occupancy is explicitly set to lease_up or vacant
        if (occupancyStatus === 'lease_up' || occupancyStatus === 'vacant') {
            result.push({ id: 2, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized'), effectiveDate: '', isRequired: true, requirementSource: 'Property not yet at stabilized occupancy' });
        }
    }
    else {
        result.push({ id: 1, name: 'As Is', nameSelect: 'As Is', customName: '', approaches: getDefaultApproachesForScenario('As Is'), effectiveDate: '', isRequired: true, requirementSource: 'Current market value' });
    }
    
    // === RULE 2: Planned Changes Add Scenarios ===
    if (plannedChanges === 'major' || plannedChanges === 'change_of_use') {
        if (!result.some(s => s.name === 'As Completed')) {
            result.push({ id: result.length + 1, name: 'As Completed', nameSelect: 'As Completed', customName: '', approaches: getDefaultApproachesForScenario('As Completed'), effectiveDate: '', isRequired: true, requirementSource: 'Major renovation/change of use planned' });
        }
        // Only add As Stabilized for income properties (occupancyStatus must be explicitly set and not N/A)
        if (occupancyStatus && occupancyStatus !== 'not_applicable' && !result.some(s => s.name === 'As Stabilized')) {
            result.push({ id: result.length + 1, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized'), effectiveDate: '', isRequired: false, requirementSource: 'Recommended for income property after renovation' });
        }
    }
    
    // === RULE 3: Occupancy Adjustments ===
    if (occupancyStatus === 'lease_up' && !result.some(s => s.name === 'As Stabilized')) {
        result.push({ id: result.length + 1, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized'), effectiveDate: '', isRequired: true, requirementSource: 'Property currently in lease-up phase' });
    }
    
    // === RULE 4: Loan Purpose Overrides ===
    if (loanPurpose === 'construction') {
        if (!result.some(s => s.name === 'As Completed')) {
            result.push({ id: result.length + 1, name: 'As Completed', nameSelect: 'As Completed', customName: '', approaches: getDefaultApproachesForScenario('As Completed'), effectiveDate: '', isRequired: true, requirementSource: 'Interagency Guidelines - construction loan requirement' });
        }
        if (!result.some(s => s.name === 'As Stabilized')) {
            result.push({ id: result.length + 1, name: 'As Stabilized', nameSelect: 'As Stabilized', customName: '', approaches: getDefaultApproachesForScenario('As Stabilized'), effectiveDate: '', isRequired: true, requirementSource: 'Interagency Guidelines - construction loan requirement' });
        }
    }
    
    if (loanPurpose === 'bridge' && plannedChanges && plannedChanges !== 'none' && !result.some(s => s.name === 'As Completed')) {
        result.push({ id: result.length + 1, name: 'As Completed', nameSelect: 'As Completed', customName: '', approaches: getDefaultApproachesForScenario('As Completed'), effectiveDate: '', isRequired: false, requirementSource: 'Recommended for bridge financing with planned improvements' });
    }
    
    // Reassign IDs to be sequential
    result.forEach((s, idx) => s.id = idx + 1);
    return result;

}

// Get default approaches based on property type and scenario - MOVED HERE before first use
function getDefaultApproachesForScenario(scenarioName) {
    const propertyType = assignmentContext.propertyType;
    const approaches = [];
    
    // Default approach selection based on property type
    if (propertyType === 'Commercial') {
        // Commercial properties typically use all three approaches
        approaches.push('Sales Comparison', 'Income Approach');
        if (scenarioName === 'As Completed' || scenarioName === 'As Proposed') {
            approaches.push('Cost Approach');
        }
    } else if (propertyType === 'Residential') {
        // Residential primarily uses Sales Comparison
        approaches.push('Sales Comparison');
        if (scenarioName === 'As Completed' || scenarioName === 'As Proposed') {
            approaches.push('Cost Approach');
        }
    } else if (propertyType === 'Land') {
        // Land uses Sales Comparison primarily
        approaches.push('Sales Comparison');
        if (scenarioName === 'As Completed' || scenarioName === 'As Proposed') {
            approaches.push('Cost Approach');
        }
    } else {
        // Default: Sales Comparison
        approaches.push('Sales Comparison');
    }
    
    // Scenario-specific adjustments
    if (scenarioName === 'As Stabilized') {
        // As Stabilized emphasizes Income Approach for income properties
        if (!approaches.includes('Income Approach') && (propertyType === 'Commercial' || assignmentContext.subType?.includes('multifamily'))) {
            approaches.unshift('Income Approach');
        }
    }
    
    return approaches;
}

function updateScenarioTrigger(field, value) {
    assignmentContext[field] = value;
    
    // Auto-determine scenarios
    const newScenarios = determineRequiredScenarios();
    const customScenarios = scenarios.filter(s => !['As Is', 'As Completed', 'As Stabilized', 'As Proposed'].includes(s.name));
    scenarios = [...newScenarios, ...customScenarios];
    
    // Update only the changed elements instead of full re-render
    updateTriggerButtonStates(field, value);
    updateScenariosDisplay();
    updateAutoConfigToast();
}

// Update button selected states without re-rendering
function updateTriggerButtonStates(field, value) {
    // Find all trigger buttons for this field type
    const fieldToSelector = {
        'propertyStatus': '.property-status-btn',
        'plannedChanges': '[onclick*="plannedChanges"]',
        'occupancyStatus': '[onclick*="occupancyStatus"]',
        'loanPurpose': '[onclick*="loanPurpose"]'
    };
    
    const selector = fieldToSelector[field];
    if (!selector) return;
    
    document.querySelectorAll(selector).forEach(btn => {
        // Extract the value from the onclick attribute
        const onclickAttr = btn.getAttribute('onclick') || '';
        const match = onclickAttr.match(/'([^']+)'\s*\)/);
        const btnValue = match ? match[1] : btn.getAttribute('data-value');
        
        if (btnValue === value) {
            btn.classList.add('selected');
            // Add blue highlight styling for property status buttons
            if (field === 'propertyStatus') {
                btn.style.borderColor = '#0da1c7';
                btn.style.backgroundColor = 'rgba(13, 161, 199, 0.05)';
                // Add checkmark if not present
                if (!btn.querySelector('.status-check')) {
                    const checkmark = document.createElement('div');
                    checkmark.className = 'status-check absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center';
                    checkmark.style.background = '#0da1c7';
                    checkmark.innerHTML = '<svg class="w-3 h-3 text-white" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>';
                    btn.appendChild(checkmark);
                }
            }
        } else {
            btn.classList.remove('selected');
            // Remove blue highlight styling for property status buttons
            if (field === 'propertyStatus') {
                btn.style.borderColor = '';
                btn.style.backgroundColor = '';
            }
            // Remove checkmark if exists
            const check = btn.querySelector('.status-check');
            if (check) check.remove();
        }
    });
}

// Show/hide the auto-config toast
function updateAutoConfigToast() {
    let toast = document.getElementById('auto-config-toast');
    if (assignmentContext.propertyStatus) {
        if (!toast) {
            // Create toast if it doesn't exist
            const propertyStatusSection = document.querySelector('[onclick*="propertyStatus"]')?.closest('.mb-6');
            if (propertyStatusSection) {
                const toastDiv = document.createElement('div');
                toastDiv.id = 'auto-config-toast';
                toastDiv.className = 'mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700';
                toastDiv.innerHTML = '<strong>Auto-configured:</strong> Based on your selection, required valuation scenarios and approaches have been pre-selected below.';
                toastDiv.style.animation = 'fadeIn 0.3s ease';
                propertyStatusSection.appendChild(toastDiv);
            }
        }
    } else if (toast) {
        toast.remove();
    }
}

// Update just the property status UI without full re-render
function updatePropertyStatusUI() {
    // Update property status buttons - use data-value attribute
    document.querySelectorAll('.property-status-btn').forEach(btn => {
        const value = btn.getAttribute('data-value');
        if (value === assignmentContext.propertyStatus) {
            btn.classList.add('border-harken-accent', 'bg-harken-accent/5');
            btn.classList.remove('border-gray-200', 'hover:border-gray-300');
            // Add checkmark if not present
            if (!btn.querySelector('.status-check')) {
                const checkmark = document.createElement('div');
                checkmark.className = 'status-check absolute top-2 right-2 w-5 h-5 bg-harken-accent rounded-full flex items-center justify-center';
                checkmark.innerHTML = '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>';
                btn.style.position = 'relative';
                btn.appendChild(checkmark);
            }
        } else {
            btn.classList.remove('border-harken-accent', 'bg-harken-accent/5');
            btn.classList.add('border-gray-200', 'hover:border-gray-300');
            // Remove checkmark if present
            const check = btn.querySelector('.status-check');
            if (check) check.remove();
        }
    });
    
    // Update planned changes selector
    document.querySelectorAll('input[name="plannedChanges"]').forEach(radio => {
        radio.checked = radio.value === assignmentContext.plannedChanges;
    });
    
    // Update occupancy status selector  
    document.querySelectorAll('input[name="occupancyStatus"]').forEach(radio => {
        radio.checked = radio.value === assignmentContext.occupancyStatus;
    });
    
    // Update loan purpose selector
    document.querySelectorAll('input[name="loanPurpose"]').forEach(radio => {
        radio.checked = radio.value === assignmentContext.loanPurpose;
    });
    
    // Show/hide conditional sections based on selections
    const plannedChangesSection = document.getElementById('planned-changes-section');
    const occupancySection = document.getElementById('occupancy-section');
    const loanPurposeSection = document.getElementById('loan-purpose-section');
    
    // Show follow-up questions if property status is selected
    if (assignmentContext.propertyStatus) {
        if (plannedChangesSection) {
            plannedChangesSection.style.display = assignmentContext.propertyStatus !== 'proposed' ? 'block' : 'none';
        }
        if (occupancySection) {
            occupancySection.style.display = shouldShowOccupancyQuestion() ? 'block' : 'none';
        }
        if (loanPurposeSection) {
            loanPurposeSection.style.display = 'block';
        }
        
        // Show auto-config toast
        const toast = document.getElementById('auto-config-toast');
        if (toast) {
            toast.classList.remove('hidden');
        }
    }
}

function shouldShowOccupancyQuestion() {
    const { propertyType, subType } = assignmentContext;
    if (propertyType === 'Commercial') return true;
    if (subType && (subType.includes('multifamily') || subType.includes('2-4unit'))) return true;
    return false;
}

function switchTab(tabId) {
    currentTab = tabId;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('nav-' + tabId).classList.add('active');
    
    // Render content
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = renderTabContent(tabId);
    contentArea.scrollTop = 0;
    
    // Update help
    updateHelp(tabId);
    
}

/**
 * Renders the content for a given tab
 * @param {string} tabId - The tab identifier
 * @returns {string} HTML string for the tab content
 */
function renderTabContent(tabId) {
    switch(tabId) {
        case 'basics':
            return renderBasics();
        case 'scope':
            return renderScope();
        case 'id':
            return renderPropertyID();
        case 'inspection':
            return renderInspection();
        case 'certifications':
            return renderCertifications();
        default:
            return '<p>Content not found</p>';
    }
}

function renderBasics() {
    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="card">
                <h3 class="card-header">Property Address</h3>
                ${renderField({type: 'text', label: 'Street Address', required: true, placeholder: '1478 South 30th Street West'})}
                <div class="grid grid-cols-2 gap-4">
                    ${renderField({type: 'text', label: 'City', required: true, placeholder: 'Billings'})}
                    ${renderField({type: 'text', label: 'State', required: true, placeholder: 'Montana'})}
                </div>
                <div class="grid grid-cols-2 gap-4">
                    ${renderField({type: 'text', label: 'ZIP Code', required: true, placeholder: '59102'})}
                    ${renderField({type: 'text', label: 'County', required: true, placeholder: 'Yellowstone'})}
                </div>
            </div>

            <div class="card">
                <h3 class="card-header">Report Date</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${renderField({type: 'date', label: 'Date of Report', required: true, id: 'report_date'})}
                </div>
                <p class="text-xs text-gray-500 mt-3 flex items-center gap-1">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Date of Inspection is set in the Inspection tab. Effective Date is set per scenario below.</span>
                </p>
            </div>

            <div class="card">
                <h3 class="card-header">Property Type Selection</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="property-type-card" onclick="selectPropertyType('Commercial')" id="type-commercial">
                        <div class="check-badge">
                            <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div class="type-icon">
                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <div class="type-label">Commercial</div>
                        <div class="type-description">Office, Retail, Industrial</div>
                    </div>
                    <div class="property-type-card" onclick="selectPropertyType('Residential')" id="type-residential">
                        <div class="check-badge">
                            <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div class="type-icon">
                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </div>
                        <div class="type-label">Residential</div>
                        <div class="type-description">1-4 Family, Condo</div>
                    </div>
                    <div class="property-type-card" onclick="selectPropertyType('Land')" id="type-land">
                        <div class="check-badge">
                            <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div class="type-icon">
                            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="type-label">Land</div>
                        <div class="type-description">Vacant, Subdivided</div>
                    </div>
                </div>
            </div>

            <div class="card" id="subtype-section" style="display: none;">
                <h3 class="card-header">Property Sub-Type</h3>
                <div id="subtype-options" class="grid grid-cols-2 md:grid-cols-3 gap-4"></div>
            </div>

            <div class="card">
                <h3 class="card-header">Property Status</h3>
                <p class="text-sm text-gray-600 mb-4">These questions determine which valuation scenarios are required for your appraisal.</p>
                
                <!-- Property Status Selection -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">What is the current status of the property? *</label>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        ${propertyStatusOptions.map(opt => `
                            <button type="button" data-value="${opt.value}" class="property-status-btn relative p-4 border-2 rounded-lg transition-all text-left ${assignmentContext.propertyStatus === opt.value ? 'border-harken-accent bg-harken-accent/5' : 'border-gray-200 hover:border-harken-accent/50'}" onclick="updateScenarioTrigger('propertyStatus', '${opt.value}')">
                                ${assignmentContext.propertyStatus === opt.value ? `<div class="status-check absolute top-2 right-2 w-5 h-5 bg-harken-accent rounded-full flex items-center justify-center"><svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg></div>` : ''}
                                <svg class="w-8 h-8 text-harken-accent mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${opt.icon}" />
                                </svg>
                                <h4 class="font-semibold text-sm text-gray-900">${opt.label}</h4>
                                <p class="text-xs text-gray-500 mt-1">${opt.description}</p>
                            </button>
                        `).join('')}
                    </div>
                    ${assignmentContext.propertyStatus ? `<div id="auto-config-toast" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 animate-pulse">
                        <strong>Auto-configured:</strong> Based on your selection, required valuation scenarios and approaches have been pre-selected below.
                    </div>` : ''}
                </div>
                
                <!-- Planned Changes (conditional) -->
                ${(assignmentContext.propertyStatus === 'existing' || assignmentContext.propertyStatus === 'recently_completed') ? `
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">Are there any planned improvements or renovations?</label>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        ${plannedChangesOptions.map(opt => `
                            <button type="button" class="trigger-btn relative p-3 border-2 rounded-lg text-left border-gray-200 ${assignmentContext.plannedChanges === opt.value ? 'selected' : ''}" onclick="updateScenarioTrigger('plannedChanges', '${opt.value}')">
                                <h4 class="font-semibold text-sm text-gray-900">${opt.label}</h4>
                                <p class="text-xs text-gray-500 mt-1">${opt.description}</p>
                            </button>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Occupancy Status (conditional for commercial/multi-family) -->
                ${(assignmentContext.propertyType === 'Commercial' || shouldShowOccupancyQuestion()) ? `
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-3">What is the current occupancy status?</label>
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        ${occupancyStatusOptions.map(opt => `
                            <button type="button" class="trigger-btn relative p-3 border-2 rounded-lg text-left border-gray-200 ${assignmentContext.occupancyStatus === opt.value ? 'selected' : ''}" onclick="updateScenarioTrigger('occupancyStatus', '${opt.value}')">
                                <h4 class="font-semibold text-sm text-gray-900">${opt.label}</h4>
                                <p class="text-xs text-gray-500 mt-1">${opt.description}</p>
                            </button>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Loan Purpose -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-3">What is the intended use of this appraisal?</label>
                    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        ${loanPurposeOptions.map(opt => `
                            <button type="button" class="trigger-btn relative p-3 border-2 rounded-lg text-left border-gray-200 ${assignmentContext.loanPurpose === opt.value ? 'selected' : ''}" onclick="updateScenarioTrigger('loanPurpose', '${opt.value}')">
                                <h4 class="font-semibold text-sm text-gray-900">${opt.label}</h4>
                                <p class="text-xs text-gray-500 mt-1">${opt.description}</p>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="card-header mb-0">Valuation Scenarios</h3>
                    ${assignmentContext.propertyStatus ? `
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                        Auto-configured
                    </span>
                    ` : ''}
                </div>
                <p class="text-sm text-gray-600 mb-4">Based on your selections above, these scenarios are recommended. You can customize approaches for each or add additional scenarios.</p>
                <div id="scenarios-container">
                    ${renderScenarios()}
                </div>
            </div>
        </div>
    `;
}

function renderScope() {
    let html = `<div class="space-y-6 animate-fade-in">`;
    
    // Purpose of Appraisal (Button Cards)
    html += `<div class="card">`;
    html += `<div class="flex items-center gap-2 mb-4">
        <h3 class="text-lg font-semibold text-gray-900">What type of value are you estimating?</h3>
    </div>`;
    html += `<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">`;
    appraisalPurposeOptions.forEach(option => {
        const isSelected = assignmentContext.appraisalPurpose === option.value;
        html += `
            <button type="button" 
                class="trigger-btn relative p-4 border-2 rounded-lg text-left ${isSelected ? 'selected border-harken-accent bg-harken-accent/5' : 'border-gray-200'}"
                onclick="updateScopeTrigger('appraisalPurpose', '${option.value}')">
                <div class="status-check">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${isSelected ? 'bg-harken-accent/10' : ''}">
                        <svg class="w-5 h-5 ${isSelected ? 'text-harken-accent' : 'text-gray-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${option.icon}"></path>
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900">${option.label}</div>
                        <div class="text-xs text-gray-500 mt-1">${option.description}</div>
                    </div>
                </div>
            </button>`;
    });
    html += `</div></div>`;
    
    // Property Interest (Button Cards)
    html += `<div class="card">`;
    html += `<div class="flex items-center gap-2 mb-4">
        <h3 class="text-lg font-semibold text-gray-900">What property interest is being appraised?</h3>
    </div>`;
    html += `<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">`;
    propertyInterestOptions.forEach(option => {
        const isSelected = assignmentContext.propertyInterest === option.value;
        html += `
            <button type="button" 
                class="trigger-btn relative p-4 border-2 rounded-lg text-left ${isSelected ? 'selected border-harken-accent bg-harken-accent/5' : 'border-gray-200'}"
                onclick="updateScopeTrigger('propertyInterest', '${option.value}')">
                <div class="status-check">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${isSelected ? 'bg-harken-accent/10' : ''}">
                        <svg class="w-5 h-5 ${isSelected ? 'text-harken-accent' : 'text-gray-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${option.icon}"></path>
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900">${option.label}</div>
                        <div class="text-xs text-gray-500 mt-1">${option.description}</div>
                    </div>
                </div>
            </button>`;
    });
    html += `</div></div>`;
    
    html += `</div>`;
    return html;
}

// Update scope trigger (for Purpose & Scope page)
function updateScopeTrigger(field, value) {
    assignmentContext[field] = value;
    
    // For button selections, update visual state without full re-render
    if (field !== 'intendedUsers') {
        // Update button states surgically
        const container = document.querySelector('#content-area');
        if (container) {
            // Find all trigger buttons in the relevant section and update their state
            const allButtons = container.querySelectorAll('.trigger-btn');
            allButtons.forEach(btn => {
                const onclickAttr = btn.getAttribute('onclick');
                if (onclickAttr && onclickAttr.includes(`'${field}'`)) {
                    const isThisButton = onclickAttr.includes(`'${value}'`);
                    if (isThisButton) {
                        btn.classList.add('selected', 'border-harken-accent', 'bg-harken-accent/5');
                        btn.classList.remove('border-gray-200');
                        // Update icon container
                        const iconContainer = btn.querySelector('.flex-shrink-0');
                        if (iconContainer) {
                            iconContainer.classList.add('bg-harken-accent/10');
                            iconContainer.classList.remove('bg-gray-100');
                        }
                        // Update icon color
                        const icon = btn.querySelector('svg:not(.status-check svg)');
                        if (icon) {
                            icon.classList.add('text-harken-accent');
                            icon.classList.remove('text-gray-500');
                        }
                    } else if (onclickAttr.includes(`'${field}'`)) {
                        btn.classList.remove('selected', 'border-harken-accent', 'bg-harken-accent/5');
                        btn.classList.add('border-gray-200');
                        // Update icon container
                        const iconContainer = btn.querySelector('.flex-shrink-0');
                        if (iconContainer) {
                            iconContainer.classList.remove('bg-harken-accent/10');
                            iconContainer.classList.add('bg-gray-100');
                        }
                        // Update icon color
                        const icon = btn.querySelector('svg:not(.status-check svg)');
                        if (icon) {
                            icon.classList.remove('text-harken-accent');
                            icon.classList.add('text-gray-500');
                        }
                    }
                }
            });
        }
    }
}

/**
 * Renders the Property ID tab - Legal Description and Ownership only
 * Tax/Sale data moved to Subject Data → Tax tab to avoid duplication
 * @returns {string} HTML string for property ID section
 */
function renderPropertyID() {
    return `<div class="space-y-6">
        <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Legal Description</h3>
            <div class="mt-4">
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'legal_description',
                    label: 'Legal Description',
                    required: true,
                    placeholder: 'Enter the full legal description from title documents...',
                    sectionContext: 'legal_description',
                    rows: 4,
                    helperText: 'Copy the legal description exactly as it appears on the deed or title report.'
                }) : renderField({ type: 'textarea', label: 'Legal Description', rows: 4, required: true, placeholder: 'Enter the full legal description from title documents...' })}
            </div>
        </div>
        <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Current Ownership</h3>
            <p class="text-sm text-gray-600 mb-4">Add all current owners as shown on title. Each owner should be entered separately.</p>
            
            <div id="owners-container">
                ${getOwnersHTML()}
            </div>
            
            <button type="button" onclick="addOwner()" class="mt-4 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-harken-accent hover:text-harken-accent hover:bg-harken-accent/5 transition-all w-full justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Another Owner
            </button>
            
            <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-xs text-blue-800 flex items-center gap-1">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span><strong>Note:</strong> Tax ID, sale history, and assessed values are entered in Subject Data → Tax & Ownership tab.</span>
                </p>
            </div>
        </div>
    </div>`;
}

function renderInspection() {
    let html = `<div class="space-y-6">`;
    html += `<div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">`;
    html += `<h3 class="text-lg font-semibold text-gray-900 mb-4">Subject Property Inspection</h3>`;
    html += typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
        id: 'inspection_type',
        label: 'Inspection Type',
        options: ['Interior & Exterior Inspection', 'Exterior Only Inspection', 'Desktop / No Inspection'],
        allowCustom: false,
        category: 'default',
        required: true
    }) : renderField({ type: 'select', label: 'Inspection Type', id: 'inspection_type', options: ['Interior & Exterior Inspection', 'Exterior Only Inspection', 'Desktop / No Inspection'] });
    html += renderField({ type: 'date', label: 'Date of Inspection', id: 'inspection_date' });
    html += `<div class="mt-4">`;
    html += `<label class="block text-sm font-medium text-gray-700 mb-2">Did you personally inspect the property?</label>`;
    html += `<div class="flex gap-4">`;
    html += `<label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 w-full">`;
    html += `<input type="radio" name="personal_inspection" value="yes" checked class="mr-2 text-harken-accent focus:ring-harken-accent" onclick="document.getElementById('inspector_details').classList.add('hidden')">`;
    html += `<span>Yes, I inspected it personally</span>`;
    html += `</label>`;
    html += `<label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 w-full">`;
    html += `<input type="radio" name="personal_inspection" value="no" class="mr-2 text-harken-accent focus:ring-harken-accent" onclick="document.getElementById('inspector_details').classList.remove('hidden')">`;
    html += `<span>No, I did not inspect it</span>`;
    html += `</label>`;
    html += `</div>`;
    html += `</div>`;
    html += `<div id="inspector_details" class="hidden mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">`;
    html += `<h4 class="text-sm font-semibold text-gray-900 mb-3">Contract Appraiser / Inspector Details</h4>`;
    html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
    html += renderField({ type: 'text', label: 'Inspector Name', id: 'inspector_name' });
    html += renderField({ type: 'text', label: 'License Number', id: 'inspector_license' });
    html += `</div>`;
    html += `</div>`;
    html += `</div>`;
    html += `<div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">`;
    html += `<h3 class="text-lg font-semibold text-gray-900 mb-4">USPAP Certification & Assistance</h3>`;
    html += `<p class="text-sm text-gray-500 mb-4">Identify any significant professional assistance provided by others.</p>`;
    html += renderField({ type: 'textarea', label: 'Significant Appraisal Assistance', id: 'inspection_assistance', rows: 3, placeholder: 'Name and description of assistance (e.g. John Doe provided market research...)' });
    html += `</div>`;
    html += `</div>`;
    return html;
}

/**
 * @typedef {Object} CertificationState
 * @property {string} extraordinaryAssumptions
 * @property {string} hypotheticalConditions
 * @property {string[]} limitingConditions
 * @property {string} appraiserLicense
 * @property {string} marketValueDefinition
 */

/**
 * Renders the Certifications tab - USPAP required fields
 * @returns {string} HTML string for certifications section
 */
function renderCertifications() {
    // Standard market value definition per USPAP
    const marketValueDefinition = `The most probable price which a property should bring in a competitive and open market under all conditions requisite to a fair sale, the buyer and seller each acting prudently and knowledgeably, and assuming the price is not affected by undue stimulus. Implicit in this definition is the consummation of a sale as of a specified date and the passing of title from seller to buyer under conditions whereby:

(1) buyer and seller are typically motivated;
(2) both parties are well informed or well advised, and acting in what they consider their own best interests;
(3) a reasonable time is allowed for exposure in the open market;
(4) payment is made in terms of cash in U.S. dollars or in terms of financial arrangements comparable thereto; and
(5) the price represents the normal consideration for the property sold unaffected by special or creative financing or sales concessions granted by anyone associated with the sale.`;

    // Common limiting conditions
    const standardLimitingConditions = [
        'The appraiser assumes no responsibility for matters legal in character.',
        'The appraiser has made no survey of the property and assumes no liability in connection with such matters.',
        'Information, estimates, and opinions contained in this report were obtained from sources considered reliable.',
        'The appraiser assumes that there are no hidden or unapparent conditions that would affect value.',
        'The appraiser is not required to give testimony or appear in court because of this appraisal.',
        'No environmental impact studies were requested or made in conjunction with this appraisal.',
        'The distribution of the total valuation between land and improvements applies only under the existing use.',
        'Possession of this report does not carry with it the right of publication.',
        'The appraiser is not a home inspector and assumes no liability for any conditions not readily apparent.',
        'Sketches in this report may show approximate dimensions and are included only to assist the reader.'
    ];

    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <!-- Appraiser Information -->
            <div class="card">
                <h3 class="card-header">
                    <svg class="w-5 h-5 text-harken-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                    </svg>
                    Appraiser Credentials
                </h3>
                <div class="grid grid-cols-2 gap-4">
                    ${renderField({ type: 'text', label: 'Appraiser Name', required: true, id: 'appraiser_name' })}
                    ${renderField({ type: 'text', label: 'License/Certification Number', required: true, id: 'appraiser_license', placeholder: 'e.g., MT-12345' })}
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    ${renderField({ type: 'text', label: 'State of Licensure', required: true, id: 'appraiser_state' })}
                    ${renderField({ type: 'date', label: 'License Expiration Date', id: 'license_expiration' })}
                </div>
                <div class="mt-4">
                    ${renderField({ type: 'text', label: 'Designation(s)', id: 'appraiser_designations', placeholder: 'e.g., MAI, SRA, AI-GRS' })}
                </div>
            </div>

            <!-- Definition of Market Value -->
            <div class="card">
                <h3 class="card-header">
                    <svg class="w-5 h-5 text-harken-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Definition of Market Value
                </h3>
                <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p class="text-xs text-blue-800 flex items-center gap-1">
                        <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span><strong>USPAP Requirement:</strong> The definition of value must be stated in the report.</span>
                    </p>
                </div>
                <div class="mt-4">
                    ${renderField({ 
                        type: 'textarea', 
                        label: 'Definition of Value', 
                        id: 'market_value_definition',
                        rows: 8,
                        defaultValue: marketValueDefinition
                    })}
                </div>
                <p class="text-xs text-gray-500 mt-2">Pre-filled with standard FIRREA definition. Modify if using a different definition of value.</p>
            </div>

            <!-- Extraordinary Assumptions -->
            <div class="card">
                <h3 class="card-header">
                    <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    Extraordinary Assumptions
                </h3>
                <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p class="text-sm text-amber-800">
                        <strong>Definition:</strong> An assumption, directly related to a specific assignment, as of the effective date of the assignment results, which, if found to be false, could alter the appraiser's opinions or conclusions.
                    </p>
                </div>
                <div class="mt-4">
                    ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                        id: 'extraordinary_assumptions',
                        label: 'Extraordinary Assumptions (if any)',
                        placeholder: 'List any extraordinary assumptions for this appraisal. If none, enter "None".',
                        sectionContext: 'extraordinary_assumptions',
                        rows: 4,
                        helperText: 'Examples: Assuming proposed improvements are completed, assuming clear title, assuming environmental clearance.'
                    }) : renderField({ 
                        type: 'textarea', 
                        label: 'Extraordinary Assumptions (if any)', 
                        id: 'extraordinary_assumptions',
                        rows: 4,
                        placeholder: 'List any extraordinary assumptions for this appraisal. If none, enter "None".'
                    })}
                </div>
            </div>

            <!-- Hypothetical Conditions -->
            <div class="card">
                <h3 class="card-header">
                    <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Hypothetical Conditions
                </h3>
                <div class="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p class="text-sm text-purple-800">
                        <strong>Definition:</strong> A condition, directly related to a specific assignment, which is contrary to what is known by the appraiser to exist on the effective date of the assignment results, but is used for the purpose of analysis.
                    </p>
                </div>
                <div class="mt-4">
                    ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                        id: 'hypothetical_conditions',
                        label: 'Hypothetical Conditions (if any)',
                        placeholder: 'List any hypothetical conditions for this appraisal. If none, enter "None".',
                        sectionContext: 'hypothetical_conditions',
                        rows: 4,
                        helperText: 'Examples: Property valued as if rezoned, property valued as if subdivided, value as if vacant land.'
                    }) : renderField({ 
                        type: 'textarea', 
                        label: 'Hypothetical Conditions (if any)', 
                        id: 'hypothetical_conditions',
                        rows: 4,
                        placeholder: 'List any hypothetical conditions for this appraisal. If none, enter "None".'
                    })}
                </div>
            </div>

            <!-- Limiting Conditions -->
            <div class="card">
                <h3 class="card-header">
                    <svg class="w-5 h-5 text-harken-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Limiting Conditions
                </h3>
                <p class="text-sm text-gray-600 mb-4">Click to select the standard limiting conditions to include in your report.</p>
                <div class="space-y-2 max-h-80 overflow-y-auto p-3">
                    ${standardLimitingConditions.map((condition, idx) => `
                        <div class="limiting-btn p-3 border-2 border-harken-accent rounded-lg cursor-pointer transition-all selected" onclick="toggleLimitingCondition(this)" data-condition="${idx}">
                            <div class="flex items-start gap-3">
                                <div class="limiting-check w-5 h-5 rounded-full bg-harken-accent flex-shrink-0 flex items-center justify-center mt-0.5">
                                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <span class="text-sm text-gray-700">${condition}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-4">
                    ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                        id: 'custom_limiting_conditions',
                        label: 'Additional Limiting Conditions',
                        placeholder: 'Add any additional limiting conditions specific to this assignment...',
                        sectionContext: 'limiting_conditions',
                        rows: 3,
                        helperText: 'Add custom conditions beyond the standard ones selected above.'
                    }) : renderField({ 
                        type: 'textarea', 
                        label: 'Additional Limiting Conditions', 
                        id: 'custom_limiting_conditions',
                        rows: 3,
                        placeholder: 'Add any additional limiting conditions specific to this assignment...'
                    })}
                </div>
            </div>
        </div>
    `;
}

function selectPropertyType(type) {
    // Update UI
    document.querySelectorAll('.property-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('type-' + type.toLowerCase()).classList.add('selected');
    
    // Save to state
    WizardState.set('propertyType', type);
    assignmentContext.propertyType = type; // Also update assignment context
    
    // Update help sidebar
    updateHelpForPropertyType(type);
    
    // Show subtype options
    showSubtypes(type);
    
    // Re-determine scenarios with new property type for correct approach defaults
    if (assignmentContext.propertyStatus) {
        const newScenarios = determineRequiredScenarios();
        const customScenarios = scenarios.filter(s => !['As Is', 'As Completed', 'As Stabilized', 'As Proposed'].includes(s.name));
        scenarios = [...newScenarios, ...customScenarios];
        updateScenariosDisplay();
    }
}

function showSubtypes(type) {
    const section = document.getElementById('subtype-section');
    const optionsDiv = document.getElementById('subtype-options');
    
    const subtypeData = {
        'Commercial': [
            { id: 'office', name: 'Office', description: 'CBD, Suburban, Medical', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>' },
            { id: 'retail', name: 'Retail', description: 'Strip Center, Mall, Standalone', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>' },
            { id: 'industrial', name: 'Industrial', description: 'Warehouse, Manufacturing, Flex', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>' },
            { id: 'multifamily', name: 'Multi-Family (5+)', description: 'Apartment Complex, 5+ Units', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>' },
            { id: 'mixeduse', name: 'Mixed-Use', description: 'Residential + Commercial', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>' },
            { id: 'hospitality', name: 'Hospitality', description: 'Hotel, Motel, Resort', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>' }
        ],
        'Residential': [
            { id: 'singlefamily', name: 'Single Family', description: 'Detached Residence', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>' },
            { id: 'condo', name: 'Condo', description: 'Individual Unit Ownership', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>' },
            { id: 'townhome', name: 'Townhome', description: 'Attached Residence', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>' },
            { id: '2-4unit', name: '2-4 Unit', description: 'Small Multi-Family', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>' }
        ],
        'Land': [
            { id: 'vacant', name: 'Vacant Land', description: 'Undeveloped Parcel', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>' },
            { id: 'reslot', name: 'Residential Lot', description: 'Buildable Lot, Subdivision', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>' },
            { id: 'commsite', name: 'Commercial Site', description: 'Development Ready', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>' },
            { id: 'agricultural', name: 'Agricultural', description: 'Farm, Ranch, Orchard', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },
            { id: 'subdivision', name: 'Subdivision', description: 'Multiple Lots, Platted', icon: '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>' }
        ]
    };
    
    const subtypes = subtypeData[type] || [];
    let html = '';
    
    subtypes.forEach(subtype => {
        html += `
            <div class="property-type-card" onclick="selectSubtype('${subtype.id}')" id="subtype-${subtype.id}">
                <div class="check-badge">
                    <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div class="type-icon">
                    ${subtype.icon}
                </div>
                <div class="type-label">${subtype.name}</div>
                <div class="type-description">${subtype.description}</div>
            </div>
        `;
    });
    
    optionsDiv.innerHTML = html;
    section.style.display = 'block';
    
    // Animate in
    setTimeout(() => {
        section.classList.add('animate-fade-in');
    }, 50);
}

function selectSubtype(subtypeId) {
    // Update UI
    document.querySelectorAll('[id^="subtype-"]').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('subtype-' + subtypeId).classList.add('selected');
    
    // Save to state
    WizardState.set('propertySubtype', subtypeId);
    assignmentContext.subType = subtypeId; // Also update assignment context
    
    // Re-determine scenarios with new subtype for correct approach defaults
    if (assignmentContext.propertyStatus) {
        const newScenarios = determineRequiredScenarios();
        const customScenarios = scenarios.filter(s => !['As Is', 'As Completed', 'As Stabilized', 'As Proposed'].includes(s.name));
        scenarios = [...newScenarios, ...customScenarios];
        updateScenariosDisplay();
    }
    
    console.log('Subtype selected:', subtypeId);
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
    const body = document.body;
    const leftSidebar = document.getElementById('left-sidebar');
    const helpSidebar = document.getElementById('help-sidebar');
    const isFullscreen = body.classList.toggle('wizard-fullscreen');
    
    // Toggle sidebars
    if (isFullscreen) {
        leftSidebar.classList.add('collapsed');
        helpSidebar.classList.add('collapsed');
    } else {
        leftSidebar.classList.remove('collapsed');
        helpSidebar.classList.remove('collapsed');
    }
    
    // Persist state
    if (typeof WizardState !== 'undefined') {
        WizardState.set('isFullscreen', isFullscreen);
    }
    
    // Update button title
    const toggleBtn = document.querySelector('.fullscreen-toggle-btn');
    if (toggleBtn) {
        toggleBtn.setAttribute('title', isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen');
    }
}

function updateHelp(tabId) {
    if (currentHelpMode !== 'guidance') return;
    
    const helpContent = document.getElementById('help-content');
    const helpText = {
        'basics': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Assignment Basics</h3>
            <p class="text-sm text-gray-600 mb-4">Select the property type and sub-type. This determines which valuation approaches are most appropriate and which sections of the report will be emphasized.</p>
            <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-3">
                <h4 class="font-semibold text-sm text-blue-900 mb-1">Smart Automation</h4>
                <p class="text-xs text-blue-800">Your property type and status selections automatically configure the required valuation scenarios and approaches per USPAP and Interagency Guidelines.</p>
            </div>
            <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded mb-3">
                <h4 class="font-semibold text-sm text-green-900 mb-1">Effective Date Tip</h4>
                <p class="text-xs text-green-800">The Effective Date is required by USPAP. For "As Is" values, use your inspection date. For prospective scenarios, use the anticipated completion or stabilization date.</p>
            </div>
            <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                <h4 class="font-semibold text-sm text-purple-900 mb-1">Multiple Scenarios?</h4>
                <p class="text-xs text-purple-800">Construction loans and value-add projects often require multiple values (As Is + As Completed + As Stabilized). Each scenario will have its own effective date.</p>
            </div>
        `,
        'scope': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Purpose & Scope</h3>
            <p class="text-sm text-gray-600 mb-4">Define the type of value being estimated and the property interest being appraised.</p>
            <div class="bg-amber-50 border-l-4 border-amber-500 p-3 rounded mb-3">
                <h4 class="font-semibold text-sm text-amber-900 mb-1">Purpose of Appraisal</h4>
                <p class="text-xs text-amber-800">Most assignments require Market Value. Other purposes like Insurable or Liquidation Value have specific definitions and methodologies.</p>
            </div>
            <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <h4 class="font-semibold text-sm text-blue-900 mb-1">Property Interest</h4>
                <p class="text-xs text-blue-800">Fee Simple is most common. Use Leased Fee when property has in-place leases, or Leasehold when valuing a tenant's interest.</p>
            </div>
        `,
        'id': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Property Identification</h3>
            <p class="text-sm text-gray-600 mb-4">Provide complete identification of the property including address, legal description, and ownership information.</p>
            <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                <h4 class="font-semibold text-sm text-green-900 mb-1">Best Practice</h4>
                <p class="text-xs text-green-800">Verify the legal description matches current deed records and include all parcels if the property consists of multiple tax lots.</p>
            </div>
        `,
        'inspection': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Inspection & Teams</h3>
            <p class="text-sm text-gray-600 mb-4">Document who inspected the property and when. USPAP requires disclosure of any assistance received.</p>
            <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                <h4 class="font-semibold text-sm text-purple-900 mb-1">USPAP Disclosure</h4>
                <p class="text-xs text-purple-800">You must disclose any significant professional assistance received in the assignment.</p>
            </div>
        `,
        'certifications': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Certifications & USPAP</h3>
            <p class="text-sm text-gray-600 mb-4">Complete the required USPAP certifications, assumptions, and conditions.</p>
            <div class="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-3">
                <h4 class="font-semibold text-sm text-red-900 mb-1">Critical USPAP Requirements</h4>
                <p class="text-xs text-red-800">Extraordinary Assumptions and Hypothetical Conditions must be clearly stated in every appraisal report.</p>
            </div>
            <div class="bg-amber-50 border-l-4 border-amber-500 p-3 rounded mb-3">
                <h4 class="font-semibold text-sm text-amber-900 mb-1">Extraordinary Assumptions</h4>
                <p class="text-xs text-amber-800">Assumptions that, if found to be false, could alter your conclusions. Must be labeled in the report.</p>
            </div>
            <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                <h4 class="font-semibold text-sm text-purple-900 mb-1">Hypothetical Conditions</h4>
                <p class="text-xs text-purple-800">Conditions contrary to what exists but used for analysis (e.g., "as if rezoned"). Must be prominently disclosed.</p>
            </div>
        `
    };
    helpContent.innerHTML = helpText[tabId] || '';
}

function updateHelpForPropertyType(type) {
    if (currentHelpMode !== 'guidance') return;
    
    const helpContent = document.getElementById('help-content');
    const typeHelp = {
        'Commercial': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Commercial Property</h3>
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                <h4 class="font-semibold text-sm text-blue-900 mb-2">Valuation Focus</h4>
                <p class="text-xs text-blue-800 leading-relaxed">Income Approach is typically most heavily weighted for commercial properties. Analyze rent rolls, operating expenses, and market cap rates carefully.</p>
            </div>
            <div class="space-y-2">
                <h4 class="font-semibold text-sm text-gray-900">Key Considerations:</h4>
                <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>Tenant credit quality and lease terms</li>
                    <li>Operating expense ratios</li>
                    <li>Market rental rates and vacancy</li>
                    <li>Capitalization rate support</li>
                </ul>
            </div>
        `,
        'Residential': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Residential Property</h3>
            <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
                <h4 class="font-semibold text-sm text-green-900 mb-2">Valuation Focus</h4>
                <p class="text-xs text-green-800 leading-relaxed">Sales Comparison Approach is primary for residential properties. Analyze recent comparable sales with careful adjustments for differences.</p>
            </div>
            <div class="space-y-2">
                <h4 class="font-semibold text-sm text-gray-900">Key Considerations:</h4>
                <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>Recent comparable sales (within 6-12 months)</li>
                    <li>Location and neighborhood compatibility</li>
                    <li>Size, condition, and quality adjustments</li>
                    <li>Market trends and absorption rates</li>
                </ul>
            </div>
        `,
        'Land': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Land Valuation</h3>
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
                <h4 class="font-semibold text-sm text-yellow-900 mb-2">Valuation Focus</h4>
                <p class="text-xs text-yellow-800 leading-relaxed">Highest & Best Use analysis is critical for land. Sales Comparison or Allocation/Extraction methods are typical approaches.</p>
            </div>
            <div class="space-y-2">
                <h4 class="font-semibold text-sm text-gray-900">Key Considerations:</h4>
                <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>Zoning and permitted uses</li>
                    <li>Utilities availability and costs</li>
                    <li>Development feasibility</li>
                    <li>Comparable land sales analysis</li>
                </ul>
            </div>
        `
    };
    helpContent.innerHTML = typeHelp[type] || '';
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

// Scenario Management
let scenarios = [
    { id: 1, name: 'As Is', nameSelect: 'As Is', customName: '', approaches: [], effectiveDate: '' }
];

const scenarioOptions = [
    { label: 'As Is', value: 'As Is' },
    { label: 'As Completed', value: 'As Completed' },
    { label: 'As Stabilized', value: 'As Stabilized' },
    { label: 'As Proposed', value: 'As Proposed' },
    { label: 'Type my own', value: 'Type my own' }
];

function renderScenarios() {
    let html = '<div class="space-y-4">';
    
    scenarios.forEach((scenario, index) => {
        const blockClass = scenario.isRequired ? 'required' : (scenario.isRequired === false ? 'recommended' : '');
        const borderStyle = scenario.isRequired ? 'border-l-4 border-l-red-400' : (scenario.isRequired === false ? 'border-l-4 border-l-blue-400' : '');
        html += `<div class="scenario-block ${borderStyle}">`;
        
        // Scenario Header with Required/Recommended Badge
        html += `<div class="flex items-center justify-between mb-3">`;
        html += `<div class="flex items-center gap-3">`;
        html += `<span class="text-lg font-semibold text-gray-900">${scenario.name || 'New Scenario'}</span>`;
        
        // Required/Recommended badge
        if (scenario.isRequired !== undefined) {
            if (scenario.isRequired) {
                html += `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title="${scenario.requirementSource || 'Required'}">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    Required
                </span>`;
            } else {
                html += `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" title="${scenario.requirementSource || 'Recommended'}">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Recommended
                </span>`;
            }
        }
        html += `</div>`;
        
        // Delete button - always show trash icon for removing scenarios
        html += `<button onclick="removeScenario(${scenario.id})" class="text-gray-400 hover:text-red-500 p-2 transition-colors rounded-full hover:bg-red-50" title="Remove Scenario">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>`;
        html += `</div>`;
        
        // Requirement Source tooltip
        if (scenario.requirementSource) {
            const bgColor = scenario.isRequired ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200';
            html += `<div class="mb-4 px-3 py-2 ${bgColor} border rounded text-xs text-gray-600">
                <span class="font-medium">${scenario.isRequired ? 'Why required:' : 'Why recommended:'}</span> ${scenario.requirementSource}
            </div>`;
        }
        
        // Effective Date for this Scenario
        html += `<div class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">`;
        html += `<div class="flex items-center gap-2 mb-2">`;
        html += `<svg class="w-5 h-5 text-harken-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`;
        html += `<label class="block text-sm font-semibold text-gray-900">Effective Date for ${scenario.name || 'This Scenario'} *</label>`;
        html += `</div>`;
        html += `<input type="date" class="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-harken-accent focus:ring focus:ring-harken-accent focus:ring-opacity-50 px-3 py-2" value="${scenario.effectiveDate || ''}" onchange="updateScenarioEffectiveDate(${scenario.id}, this.value)">`;
        
        // Helper text based on scenario type
        let dateHelperText = 'The "as of" date for this value opinion.';
        if (scenario.name === 'As Is') {
            dateHelperText = 'Typically the inspection date - the date you are valuing the property in its current condition.';
        } else if (scenario.name === 'As Completed') {
            dateHelperText = 'The projected date when construction/renovation will be complete.';
        } else if (scenario.name === 'As Stabilized') {
            dateHelperText = 'The projected date when the property will reach stabilized occupancy (typically 90%+).';
        } else if (scenario.name === 'As Proposed') {
            dateHelperText = 'The date used to value the proposed development plans.';
        }
        html += `<p class="text-xs text-gray-500 mt-2">${dateHelperText}</p>`;
        html += `</div>`;
        
        // Scenario Name with Pill Buttons (for changing)
        html += `<div class="flex justify-between items-start mb-4 gap-4">`;
        html += `<div class="flex-1">`;
        html += `<label class="block text-sm font-medium text-gray-700 mb-2">Change Scenario Type</label>`;
        html += `<div class="scenario-name-pills">`;
        scenarioOptions.forEach(opt => {
            const isSelected = scenario.nameSelect === opt.value;
            const pillClass = opt.value === 'Type my own' ? 'scenario-pill custom' : 'scenario-pill';
            html += `<button type="button" class="${pillClass} ${isSelected ? 'selected' : ''}" onclick="updateScenarioName(${scenario.id}, 'pill', '${opt.value}')">
                ${opt.label}
            </button>`;
        });
        html += `</div>`;
        
        // Custom input if "Type my own" is selected
        if (scenario.nameSelect === 'Type my own' || (scenario.name && !scenarioOptions.some(opt => opt.value === scenario.name))) {
            const customVal = scenario.customName || (scenario.nameSelect === 'Type my own' ? '' : scenario.name);
            html += `<div class="scenario-custom-input">
                <input type="text" class="w-full rounded-md border-gray-300 shadow-sm focus:border-harken-accent focus:ring focus:ring-harken-accent focus:ring-opacity-50 px-3 py-2" placeholder="Enter custom scenario name..." value="${customVal}" onchange="updateScenarioName(${scenario.id}, 'custom', this.value)">
            </div>`;
        }
        html += `</div>`;
        html += `</div>`;

        // Approaches Grid with Cards
        html += `<label class="block text-sm font-medium text-gray-700 mb-2">Select Approaches for this Scenario</label>`;
        html += `<div class="approach-grid">`;
        
        const approaches = [
            { key: 'Sales Comparison', label: 'Sales Comparison', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { key: 'Cost Approach', label: 'Cost Approach', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
            { key: 'Income Approach', label: 'Income Approach', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
        ];

        approaches.forEach(app => {
            const isSelected = scenario.approaches.includes(app.key);
            html += `
            <button type="button" role="switch" aria-checked="${isSelected}" class="approach-card ${isSelected ? 'selected' : ''}" onclick="toggleScenarioApproach(${scenario.id}, '${app.key}')">
                <div class="check-badge">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div class="approach-icon">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="${app.icon}"></path></svg>
                </div>
                <span class="approach-label">${app.label}</span>
            </button>`;
        });
        
        html += `</div>`; // End approach grid
        html += `</div>`; // End scenario block
    });

    // Add Scenario Button
    html += `<button onclick="addScenario()" class="btn-add-scenario">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Add Another Scenario
    </button>`;
    
    html += '</div>';
    return html;
}

function addScenario() {
    const newId = scenarios.length > 0 ? Math.max(...scenarios.map(s => s.id)) + 1 : 1;
    scenarios.push({ id: newId, name: '', nameSelect: '', customName: '', approaches: [], effectiveDate: '' });
    
    // Only re-render the scenarios section
    updateScenariosDisplay();
}

function removeScenario(id) {
    // Prevent removing the last scenario - must have at least one
    if (scenarios.length <= 1) {
        alert('You must have at least one valuation scenario.');
        return;
    }
    
    const scenario = scenarios.find(s => s.id === id);
    
    // If it's a required scenario, show a confirmation
    if (scenario && scenario.isRequired) {
        const confirmed = confirm(`"${scenario.name}" is marked as required per ${scenario.requirementSource || 'industry guidelines'}.\n\nAre you sure you want to remove it from your report?`);
        if (!confirmed) return;
    }
    
    scenarios = scenarios.filter(s => s.id !== id);
    
    // Re-render the scenarios section
    updateScenariosDisplay();
}

function updateScenarioName(id, type, value) {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    if (type === 'pill') {
        if (value === 'Type my own') {
            scenario.nameSelect = 'Type my own';
            scenario.name = scenario.customName || '';
        } else {
            scenario.nameSelect = value;
            scenario.name = value;
            scenario.customName = '';
        }
        // Re-render to show/hide custom input
        updateScenariosDisplay();
    } else if (type === 'custom') {
        // For custom input, just update the value without re-rendering
        scenario.customName = value;
        scenario.name = value;
    }
}

function updateScenarioEffectiveDate(id, value) {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;
    
    scenario.effectiveDate = value;
    
    // No need to re-render - the input already has the new value
    console.log(`Scenario ${scenario.name} effective date updated to: ${value}`);
}

function toggleScenarioApproach(id, approach) {
    // Find the card element for immediate visual feedback
    const cards = document.querySelectorAll('.approach-card');
    let clickedCard = null;
    cards.forEach(card => {
        const cardText = card.querySelector('.approach-label')?.textContent;
        const cardScenario = card.closest('.scenario-block');
        if (cardText === approach && cardScenario) {
            // Check if this card belongs to the right scenario by checking its position
            const allScenarioBlocks = document.querySelectorAll('.scenario-block');
            const scenarioIndex = Array.from(allScenarioBlocks).indexOf(cardScenario);
            if (scenarios[scenarioIndex]?.id === id) {
                clickedCard = card;
            }
        }
    });
    
    // Immediate visual feedback - toggle the selected class
    if (clickedCard) {
        clickedCard.classList.toggle('selected');
    }
    
    // Update data in background
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) return;

    const index = scenario.approaches.indexOf(approach);
    if (index === -1) {
        scenario.approaches.push(approach);
    } else {
        scenario.approaches.splice(index, 1);
    }
    
    // Update global approaches for backward compatibility
    const allApproaches = new Set();
    scenarios.forEach(s => {
        s.approaches.forEach(a => allApproaches.add(a));
    });
    
    const approachMap = {
        'Sales Comparison': 'sales',
        'Cost Approach': 'cost',
        'Income Approach': 'income'
    };

    Object.keys(approachMap).forEach(key => {
        const globalKey = approachMap[key];
        if (assignmentContext.approaches[globalKey]) {
            assignmentContext.approaches[globalKey].enabled = allApproaches.has(key);
        }
    });
}

// Helper function to update only the scenarios display
function updateScenariosDisplay() {
    const scenariosContainer = document.getElementById('scenarios-container');
    if (scenariosContainer) {
        scenariosContainer.innerHTML = renderScenarios();
    }
    // Sync scenarios to shared state for use in Analysis page
    syncScenariosToState();
}

// Sync scenarios to WizardState for cross-page access
function syncScenariosToState() {
    if (typeof ScenarioManager !== 'undefined') {
        ScenarioManager.saveScenarios(scenarios);
    }
}

/**
 * Toggle limiting condition button selection
 * @param {HTMLElement} btn - The limiting condition button element
 */
function toggleLimitingCondition(btn) {
    btn.classList.toggle('selected');
    const checkIcon = btn.querySelector('.limiting-check');
    if (btn.classList.contains('selected')) {
        btn.classList.remove('border-gray-200');
        btn.classList.add('border-harken-accent');
        checkIcon.classList.remove('bg-gray-200');
        checkIcon.classList.add('bg-harken-accent');
        checkIcon.querySelector('svg').classList.remove('hidden');
    } else {
        btn.classList.remove('border-harken-accent');
        btn.classList.add('border-gray-200');
        checkIcon.classList.remove('bg-harken-accent');
        checkIcon.classList.add('bg-gray-200');
        checkIcon.querySelector('svg').classList.add('hidden');
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', function() {
    switchTab('basics');
    // Initial sync of scenarios to WizardState
    setTimeout(syncScenariosToState, 500);
});

