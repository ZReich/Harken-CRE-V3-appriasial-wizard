/* =================================================================
   HARKEN APPRAISAL WIZARD V3 - SHARED JAVASCRIPT
   React-Ready Architecture
   ================================================================= */

// =================================================================
// TYPE DEFINITIONS (TypeScript-Ready)
// =================================================================

/**
 * @typedef {Object} WizardStateData
 * @property {string} [template] - Selected template type
 * @property {string} [propertyType] - Property type
 * @property {string} [propertySubtype] - Property subtype
 * @property {AppraisalScenario[]} [scenarios] - Valuation scenarios
 * @property {number} [activeScenarioId] - Currently active scenario
 * @property {Object.<number, ScenarioAnalysisData>} [analysisData] - Analysis data per scenario
 * @property {string} [savedTemplateId] - ID of saved template used
 * @property {Object} [savedTemplateConfig] - Configuration from saved template
 * @property {string} [currentPage] - Current wizard page
 * @property {string} [lastModified] - Last modification timestamp
 */

/**
 * @typedef {Object} AppraisalScenario
 * @property {number} id - Unique scenario ID
 * @property {string} name - Scenario name (As Is, As Completed, etc.)
 * @property {string[]} approaches - Selected valuation approaches
 * @property {string} [effectiveDate] - Effective date for this scenario
 * @property {boolean} isRequired - Whether scenario is required
 */

/**
 * @typedef {Object} ScenarioAnalysisData
 * @property {Object} hbu - Highest & Best Use analysis
 * @property {number|null} landValue - Land valuation
 * @property {Array} salesComps - Sales comparison comps
 * @property {IncomeData} income - Income approach data
 * @property {CostData} cost - Cost approach data
 * @property {ValueConclusions} concludedValues - Concluded values
 */

/**
 * @typedef {Object} IncomeData
 * @property {number|null} pgi - Potential Gross Income
 * @property {number|null} vacancy - Vacancy rate
 * @property {number|null} egi - Effective Gross Income
 * @property {number|null} expenses - Operating expenses
 * @property {number|null} noi - Net Operating Income
 * @property {number|null} capRate - Capitalization rate
 */

/**
 * @typedef {Object} CostData
 * @property {number|null} rcn - Replacement Cost New
 * @property {number|null} depreciation - Total depreciation
 * @property {number|null} landValue - Land value
 */

/**
 * @typedef {Object} ValueConclusions
 * @property {number|null} sales - Sales approach value
 * @property {number|null} income - Income approach value
 * @property {number|null} cost - Cost approach value
 * @property {number|null} final - Final reconciled value
 */

/**
 * @typedef {Object} StateAction
 * @property {string} type - Action type
 * @property {*} [payload] - Action payload
 */

// =================================================================
// WIZARD STATE - Reducer-Compatible Pattern
// =================================================================

/**
 * Global wizard state with subscriber pattern for reactive updates
 * React mapping: useReducer + useContext
 */
const WizardState = {
    /** @type {Function[]} */
    _subscribers: [],
    
    /**
     * Get state value(s)
     * @param {string} [key] - Specific key to get, or undefined for all state
     * @returns {*} State value or entire state object
     */
    get: function(key) {
        const data = localStorage.getItem('harken_wizard_v3');
        if (!data) return key ? null : {};
        const parsed = JSON.parse(data);
        return key ? parsed[key] : parsed;
    },
    
    /**
     * Set state value (triggers subscribers)
     * @param {string} key - State key
     * @param {*} value - Value to set
     */
    set: function(key, value) {
        let data = this.get() || {};
        const oldValue = data[key];
        data[key] = value;
        data.lastModified = new Date().toISOString();
        localStorage.setItem('harken_wizard_v3', JSON.stringify(data));
        
        // Notify subscribers of state change
        this._notifySubscribers({ type: 'SET', key, value, oldValue });
    },
    
    /**
     * Dispatch an action (reducer pattern)
     * @param {StateAction} action - Action to dispatch
     */
    dispatch: function(action) {
        switch (action.type) {
            case 'SET_TEMPLATE':
                this.set('template', action.payload);
                break;
            case 'SET_PROPERTY_TYPE':
                this.set('propertyType', action.payload);
                break;
            case 'ADD_SCENARIO':
                const scenarios = this.get('scenarios') || [];
                scenarios.push(action.payload);
                this.set('scenarios', scenarios);
                break;
            case 'REMOVE_SCENARIO':
                const currentScenarios = this.get('scenarios') || [];
                this.set('scenarios', currentScenarios.filter(s => s.id !== action.payload));
                break;
            case 'UPDATE_SCENARIO':
                const allScenarios = this.get('scenarios') || [];
                const idx = allScenarios.findIndex(s => s.id === action.payload.id);
                if (idx !== -1) {
                    allScenarios[idx] = { ...allScenarios[idx], ...action.payload };
                    this.set('scenarios', allScenarios);
                }
                break;
            case 'SET_ACTIVE_SCENARIO':
                this.set('activeScenarioId', action.payload);
                break;
            case 'SET_FIELD':
                // Generic field setter for expandable selectors and other form fields
                if (action.payload && action.payload.field && action.payload.value !== undefined) {
                    this.set(action.payload.field, action.payload.value);
                }
                break;
            case 'RESET':
                this.clear();
                break;
            default:
                console.warn('Unknown action type:', action.type);
        }
    },
    
    /**
     * Subscribe to state changes (React: useEffect dependency)
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe: function(callback) {
        this._subscribers.push(callback);
        return () => {
            this._subscribers = this._subscribers.filter(cb => cb !== callback);
        };
    },
    
    /**
     * Notify all subscribers of state change
     * @param {Object} change - Change details
     */
    _notifySubscribers: function(change) {
        this._subscribers.forEach(callback => {
            try {
                callback(change);
            } catch (e) {
                console.error('Subscriber error:', e);
            }
        });
    },
    
    /**
     * Clear all state
     */
    clear: function() {
        localStorage.removeItem('harken_wizard_v3');
        this._notifySubscribers({ type: 'RESET' });
    },
    
    /**
     * Get initial state with defaults
     * @returns {WizardStateData}
     */
    getInitialState: function() {
        return {
            template: null,
            propertyType: null,
            propertySubtype: null,
            scenarios: [
                { id: 1, name: 'As Is', approaches: ['Sales Comparison'], effectiveDate: '', isRequired: true }
            ],
            activeScenarioId: 1,
            analysisData: {},
            savedTemplateId: null,
            savedTemplateConfig: null,
            currentPage: 'template',
            lastModified: new Date().toISOString()
        };
    }
};

// Navigation between wizard pages
const WizardNav = {
    pages: [
        { id: 'template', file: 'index.html', title: 'Template Selection' },
        { id: 'setup', file: 'setup.html', title: 'Assignment Setup' },
        { id: 'subject', file: 'subject-data.html', title: 'Subject Property Data' },
        { id: 'analysis', file: 'analysis.html', title: 'Valuation Analysis' },
        { id: 'review', file: 'review.html', title: 'Review & Finalize' }
    ],
    
    getCurrentPage: function() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        return this.pages.find(p => p.file === filename);
    },
    
    getPageIndex: function(pageId) {
        return this.pages.findIndex(p => p.id === pageId);
    },
    
    goToPage: function(pageId) {
        const page = this.pages.find(p => p.id === pageId);
        if (page) {
            WizardState.set('currentPage', pageId);
            window.location.href = page.file;
        }
    },
    
    goNext: function() {
        const current = this.getCurrentPage();
        const currentIndex = this.getPageIndex(current.id);
        if (currentIndex < this.pages.length - 1) {
            this.goToPage(this.pages[currentIndex + 1].id);
        }
    },
    
    goPrevious: function() {
        const current = this.getCurrentPage();
        const currentIndex = this.getPageIndex(current.id);
        if (currentIndex > 0) {
            this.goToPage(this.pages[currentIndex - 1].id);
        }
    }
};

// Sidebar toggle functionality
function toggleSidebar(sidebarId) {
    const sidebar = document.getElementById(sidebarId);
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        const content = sidebar.querySelector('.sidebar-content');
        if (content) {
            content.classList.toggle('hidden');
        }
    }
}

// Form field renderer
function renderField(field, index) {
    let html = '<div class="form-group">';
    
    if (field.type === 'heading') {
        html += `<h3 class="card-header">${field.label}</h3>`;
        html += '</div>';
        return html;
    }
    
    // Label
    if (field.label && field.type !== 'checkbox') {
        html += `<label class="form-label">${field.label}${field.required ? ' <span style="color: #dc2626;">*</span>' : ''}</label>`;
    }
    
    // Field rendering based on type
    switch(field.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'number':
        case 'date':
            html += `<input type="${field.type}" 
                            class="form-input" 
                            placeholder="${field.placeholder || ''}"
                            ${field.required ? 'required' : ''}
                            ${field.readonly ? 'readonly' : ''}
                            ${field.min ? `min="${field.min}"` : ''}
                            ${field.max ? `max="${field.max}"` : ''}
                            ${field.step ? `step="${field.step}"` : ''}
                            value="${field.defaultValue || ''}">`;
            break;
            
        case 'textarea':
            html += `<textarea class="form-textarea" 
                              rows="${field.rows || 3}"
                              placeholder="${field.placeholder || ''}"
                              ${field.required ? 'required' : ''}>${field.defaultValue || ''}</textarea>`;
            break;
            
        case 'select':
            html += `<select class="form-select" ${field.required ? 'required' : ''}>`;
            html += `<option value="">Select...</option>`;
            (field.options || []).forEach(opt => {
                html += `<option value="${opt}">${opt}</option>`;
            });
            html += `</select>`;
            break;
            
        case 'checkbox':
            // Button-style toggle instead of checkbox
            const toggleId = field.id || 'toggle_' + Date.now();
            html += `<button type="button" 
                             class="toggle-btn flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 bg-white text-left transition-all duration-200 hover:border-harken-accent hover:bg-harken-accent/5 w-full"
                             data-selected="false"
                             id="${toggleId}"
                             onclick="toggleButtonState(this)">
                        <span class="toggle-indicator flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all duration-200">
                            <svg class="w-3 h-3 text-white opacity-0 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </span>
                        <span class="text-sm text-gray-700">${field.label}</span>
                     </button>`;
            break;
            
        case 'currency':
            html += `<div class="flex items-center">`;
            html += `<span class="text-sm font-semibold mr-2">$</span>`;
            html += `<input type="number" 
                            class="form-input" 
                            placeholder="${field.placeholder || '0.00'}"
                            step="0.01"
                            ${field.required ? 'required' : ''}
                            ${field.readonly ? 'readonly' : ''}>`;
            html += `</div>`;
            break;
    }
    
    // Note/Help text
    if (field.note) {
        html += `<p class="form-note">${field.note}</p>`;
    }
    
    html += '</div>';
    return html;
}

// Currency formatter
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
}

// Auto-save functionality
let autoSaveTimer;
function enableAutoSave() {
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                console.log('Auto-saved');
                // In production, this would save to backend
            }, 2000);
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Enable auto-save
    enableAutoSave();
    
    // Update progress indicator if present
    const current = WizardNav.getCurrentPage();
    if (current) {
        const progress = ((WizardNav.getPageIndex(current.id) + 1) / WizardNav.pages.length) * 100;
        const progressBar = document.getElementById('wizard-progress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }
});

// Scenario Management
const ScenarioManager = {
    // Get all scenarios from state
    getScenarios: function() {
        return WizardState.get('scenarios') || [
            { id: 1, name: 'As Is', approaches: ['Sales Comparison'], effectiveDate: '', isRequired: true }
        ];
    },
    
    // Save scenarios to state
    saveScenarios: function(scenarios) {
        WizardState.set('scenarios', scenarios);
    },
    
    // Get the currently active scenario for analysis
    getActiveScenario: function() {
        const activeId = WizardState.get('activeScenarioId');
        const scenarios = this.getScenarios();
        return scenarios.find(s => s.id === activeId) || scenarios[0];
    },
    
    // Set the active scenario
    setActiveScenario: function(scenarioId) {
        WizardState.set('activeScenarioId', scenarioId);
    },
    
    // Get analysis data for a specific scenario
    getAnalysisData: function(scenarioId) {
        const allData = WizardState.get('analysisData') || {};
        return allData[scenarioId] || this.getDefaultAnalysisData();
    },
    
    // Save analysis data for a specific scenario
    saveAnalysisData: function(scenarioId, data) {
        const allData = WizardState.get('analysisData') || {};
        allData[scenarioId] = data;
        WizardState.set('analysisData', allData);
    },
    
    // Get default analysis data structure
    getDefaultAnalysisData: function() {
        return {
            hbu: { vacant: {}, improved: {} },
            landValue: null,
            salesComps: [],
            income: { pgi: null, vacancy: null, egi: null, expenses: null, noi: null, capRate: null },
            cost: { rcn: null, depreciation: null, landValue: null },
            concludedValues: { sales: null, income: null, cost: null, final: null }
        };
    },
    
    // Get scenario-specific guidance text
    getScenarioGuidance: function(scenarioName) {
        const guidance = {
            'As Is': {
                description: 'Value the property in its current condition as of the inspection date.',
                salesTip: 'Use recent sales of similar properties in comparable condition.',
                incomeTip: 'Use actual current rent roll and operating expenses.',
                costTip: 'Apply full depreciation based on effective age and condition.'
            },
            'As Completed': {
                description: 'Value the property as if construction/renovation is complete.',
                salesTip: 'Use sales of recently completed or renovated properties.',
                incomeTip: 'Use pro forma rents based on planned improvements.',
                costTip: 'Apply minimal or no depreciation - improvements are new.'
            },
            'As Stabilized': {
                description: 'Value the property at stabilized occupancy (typically 90%+).',
                salesTip: 'Use sales of stabilized properties with strong occupancy.',
                incomeTip: 'Use market rents at stabilized vacancy (typically 5%).',
                costTip: 'Cost approach may not be applicable for this scenario.'
            },
            'As Proposed': {
                description: 'Value based on proposed development plans before construction.',
                salesTip: 'Use sales of similar proposed or entitled properties.',
                incomeTip: 'Use projected income based on development pro forma.',
                costTip: 'Use proposed construction costs with no depreciation.'
            }
        };
        return guidance[scenarioName] || guidance['As Is'];
    }
};

// =================================================================
// REACT COMPONENT MAPPING REFERENCE
// =================================================================

/**
 * Component Mapping Guide for React Conversion:
 * 
 * | Prototype File              | React Component(s)                                    |
 * |-----------------------------|-------------------------------------------------------|
 * | index.html                  | TemplatePage.tsx, TemplateCard.tsx                   |
 * | setup.html / setup-content.js | SetupPage.tsx, ScenarioCard.tsx, ApproachSelector.tsx |
 * | subject-data.html / *-content.js | SubjectDataPage.tsx, SiteDetails.tsx, Improvements.tsx |
 * | analysis.html / *-content.js | AnalysisPage.tsx, HBUAnalysis.tsx, SalesGrid.tsx     |
 * | review.html                 | ReviewPage.tsx, ReconciliationPanel.tsx, ValueSummary.tsx |
 * | appraisal-report-editor.html | ReportEditor.tsx, SectionTree.tsx, PropertiesPanel.tsx |
 * | ai-drafting.js              | AITextArea.tsx (reusable component)                  |
 * | wizard-shared.js            | WizardContext.tsx, useWizardState.ts                 |
 * 
 * State Management:
 * - WizardState.get() → useWizardState() hook
 * - WizardState.set() → dispatch(action)
 * - WizardState.subscribe() → useEffect with dependencies
 * - ScenarioManager → useScenarios() hook
 */

// =================================================================
// UTILITY FUNCTIONS (Reusable across components)
// =================================================================

/**
 * Deep clone an object (React: structuredClone or lodash.cloneDeep)
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function for input handlers
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Parse currency string to number
 * @param {string} value - Currency string (e.g., "$1,500,000")
 * @returns {number} Numeric value
 */
function parseCurrency(value) {
    if (typeof value === 'number') return value;
    return parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

/**
 * Format number as percentage
 * @param {number} value - Value (0.05 for 5%)
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted percentage
 */
function formatPercent(value, decimals = 1) {
    return (value * 100).toFixed(decimals) + '%';
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
function isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0;
}

// =================================================================
// TOGGLE BUTTON FUNCTIONALITY
// =================================================================

/**
 * Toggle button state (replaces checkbox behavior)
 * @param {HTMLElement} button - The toggle button element
 */
function toggleButtonState(button) {
    const isSelected = button.dataset.selected === 'true';
    button.dataset.selected = (!isSelected).toString();
    
    if (!isSelected) {
        // Selecting
        button.classList.add('selected');
        button.classList.remove('border-gray-200');
        button.classList.add('border-harken-accent', 'bg-harken-accent/5');
        
        const indicator = button.querySelector('.toggle-indicator');
        if (indicator) {
            indicator.classList.remove('border-gray-300');
            indicator.classList.add('border-harken-accent', 'bg-harken-accent');
            const svg = indicator.querySelector('svg');
            if (svg) svg.classList.remove('opacity-0');
        }
    } else {
        // Deselecting
        button.classList.remove('selected');
        button.classList.add('border-gray-200');
        button.classList.remove('border-harken-accent', 'bg-harken-accent/5');
        
        const indicator = button.querySelector('.toggle-indicator');
        if (indicator) {
            indicator.classList.add('border-gray-300');
            indicator.classList.remove('border-harken-accent', 'bg-harken-accent');
            const svg = indicator.querySelector('svg');
            if (svg) svg.classList.add('opacity-0');
        }
    }
}

// Make toggle function globally accessible
window.toggleButtonState = toggleButtonState;

// =================================================================
// FULLSCREEN MODE
// =================================================================

/**
 * Toggle fullscreen mode for the wizard
 * Hides progress stepper, collapses header to single line, hides bottom nav
 */
function toggleFullScreen() {
    const body = document.body;
    const isFullscreen = body.classList.toggle('wizard-fullscreen');
    
    // Store state in WizardState for persistence across page navigations
    WizardState.set('isFullscreen', isFullscreen);
    
    // Update the toggle button icon if needed
    const toggleBtn = document.querySelector('.fullscreen-toggle-btn');
    if (toggleBtn) {
        toggleBtn.setAttribute('title', isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen');
    }
    
    console.log('Fullscreen mode:', isFullscreen ? 'ON' : 'OFF');
}

/**
 * Initialize fullscreen state from WizardState on page load
 */
function initFullscreenState() {
    const isFullscreen = WizardState.get('isFullscreen');
    if (isFullscreen) {
        document.body.classList.add('wizard-fullscreen');
        const toggleBtn = document.querySelector('.fullscreen-toggle-btn');
        if (toggleBtn) {
            toggleBtn.setAttribute('title', 'Exit Full Screen');
        }
    }
}

// Initialize fullscreen state on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initFullscreenState();
});

// Export for use in other scripts
window.WizardState = WizardState;
window.WizardNav = WizardNav;
window.ScenarioManager = ScenarioManager;
window.toggleSidebar = toggleSidebar;
window.toggleFullScreen = toggleFullScreen;
window.renderField = renderField;
window.formatCurrency = formatCurrency;
window.deepClone = deepClone;
window.debounce = debounce;
window.generateId = generateId;
window.parseCurrency = parseCurrency;
window.formatPercent = formatPercent;
window.isEmpty = isEmpty;

// =================================================================
// IMPROVEMENTS INVENTORY HELPERS (Contract-backed)
// =================================================================
// NOTE: `assets/improvements-contract.js` must be included on pages that use this.
// These helpers gracefully degrade if the contract isn't loaded.

WizardState.getImprovementsInventory = function () {
    const raw = WizardState.get('improvementsInventory');
    if (typeof window !== 'undefined' && window.ImprovementsContract) {
        const normalized = window.ImprovementsContract.normalizeInventory(raw);
        // Persist normalized (includes schemaVersion + defaults)
        WizardState.set('improvementsInventory', normalized);
        return normalized;
    }
    return raw || null;
};

WizardState.setImprovementsInventory = function (inventory) {
    if (typeof window !== 'undefined' && window.ImprovementsContract) {
        const normalized = window.ImprovementsContract.normalizeInventory(inventory);
        WizardState.set('improvementsInventory', normalized);
        return normalized;
    }
    WizardState.set('improvementsInventory', inventory);
    return inventory;
};

WizardState.getSubjectActiveTab = function () {
    return WizardState.get('subjectActiveTab') || null;
};

WizardState.setSubjectActiveTab = function (tabId) {
    WizardState.set('subjectActiveTab', tabId);
};









