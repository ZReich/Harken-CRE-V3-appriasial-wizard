// Subject Data Page Content and Logic

let currentTab = 'location';
let currentHelpMode = 'guidance';

function switchTab(tabId) {
    currentTab = tabId;

    // Persist active tab for cross-page navigation (e.g., Review -> Subject Data)
    if (typeof WizardState !== 'undefined' && typeof WizardState.setSubjectActiveTab === 'function') {
        WizardState.setSubjectActiveTab(tabId);
    }
    
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
        case 'location':
            return renderLocation();
        case 'site':
            return renderSite();
        case 'improvements':
            return renderImprovements();
        case 'tax':
            return renderTax();
        case 'photos':
            return renderPhotos();
        case 'exhibits':
            return renderExhibits();
        default:
            return '<p>Content not found</p>';
    }
}

function renderLocation() {
    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="card">
                <h3 class="card-header">General Area Analysis</h3>
                ${renderField({
                    type: 'select',
                    label: 'City/County',
                    required: true,
                    options: ['Billings, Yellowstone County', 'Bozeman, Gallatin County', 'Missoula, Missoula County', 'Great Falls, Cascade County', 'Other']
                })}
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'area_description',
                    label: 'Area Description',
                    rows: 6,
                    placeholder: 'Describe the general area, economic conditions, population trends, major employers, and overall market conditions...',
                    sectionContext: 'area_description',
                    helperText: 'AI can help draft a professional area description based on the selected location.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Area Description',
                    rows: 6,
                    placeholder: 'Describe the general area, economic conditions, population trends...'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Neighborhood Analysis</h3>
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'neighborhood_boundaries',
                    label: 'Neighborhood Boundaries',
                    rows: 5,
                    placeholder: 'Define the neighborhood boundaries using specific streets, landmarks, or geographic features. North: ..., South: ..., East: ..., West: ...',
                    sectionContext: 'neighborhood_boundaries',
                    helperText: 'Describe boundaries using recognizable landmarks and street names.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Neighborhood Boundaries',
                    rows: 5,
                    placeholder: 'Define the neighborhood boundaries (North, South, East, West)...'
                })}
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'neighborhood_characteristics',
                    label: 'Neighborhood Characteristics',
                    rows: 6,
                    placeholder: 'Describe predominant land uses, development patterns, age and condition of properties, access/transportation, schools, shopping, employment centers, and any factors affecting property values...',
                    sectionContext: 'neighborhood_characteristics',
                    helperText: 'Include factors that influence desirability and market appeal.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Neighborhood Characteristics',
                    rows: 6,
                    placeholder: 'Describe land uses, development patterns, access, amenities...'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Location Description</h3>
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'specific_location',
                    label: 'Specific Location',
                    required: true,
                    rows: 5,
                    placeholder: 'Describe the property\'s exact location including street address relationship, proximity to major intersections, landmarks, and directional references...',
                    sectionContext: 'specific_location',
                    helperText: 'Be specific enough that a reader could locate the property from this description.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Specific Location',
                    rows: 5,
                    required: true,
                    placeholder: 'e.g., Located along the west side of South 30th Street West, approximately 265\' south of Gabel Road...'
                })}
            </div>
        </div>
    `;
}

// -----------------------------------------------------------------
// Improvements Inventory: Global Actions (inline onclick)
// -----------------------------------------------------------------
function __impr_getUiState() {
    window.__improvementsUiState = window.__improvementsUiState || { selected: null };
    return window.__improvementsUiState;
}

function __impr_getInventory() {
    if (typeof WizardState !== 'undefined' && typeof WizardState.getImprovementsInventory === 'function') {
        const inv = WizardState.getImprovementsInventory();
        if (inv) return inv;
    }
    return window.ImprovementsContract ? window.ImprovementsContract.createDefaultInventory() : { schemaVersion: 1, parcels: [] };
}

function __impr_setInventory(inv) {
    if (typeof WizardState !== 'undefined' && typeof WizardState.setImprovementsInventory === 'function') {
        WizardState.setImprovementsInventory(inv);
        return;
    }
    if (typeof WizardState !== 'undefined') WizardState.set('improvementsInventory', inv);
}

function __impr_select(level, parcelId, buildingId, areaId) {
    const ui = __impr_getUiState();
    ui.selected = { level, parcelId, buildingId, areaId };
    switchTab('improvements');
}

function __impr_addParcel() {
    if (!window.ImprovementsContract) return;
    const inv = __impr_getInventory();
    inv.parcels = inv.parcels || [];
    const next = inv.parcels.length + 1;
    inv.parcels.push(window.ImprovementsContract.createParcel({ label: `Parcel ${next}` }));
    __impr_setInventory(inv);
    const p = inv.parcels[inv.parcels.length - 1];
    __impr_select('parcel', p.id, '', '');
}

function __impr_addBuilding(parcelId) {
    if (!window.ImprovementsContract) return;
    const inv = __impr_getInventory();
    const parcel = (inv.parcels || []).find(p => p.id === parcelId);
    if (!parcel) return;
    parcel.buildings = parcel.buildings || [];
    const next = parcel.buildings.length + 1;
    parcel.buildings.push(window.ImprovementsContract.createBuilding({ label: `Building ${next}` }));
    __impr_setInventory(inv);
    const b = parcel.buildings[parcel.buildings.length - 1];
    __impr_select('building', parcelId, b.id, '');
}

function __impr_addArea(parcelId, buildingId) {
    if (!window.ImprovementsContract) return;
    const inv = __impr_getInventory();
    const parcel = (inv.parcels || []).find(p => p.id === parcelId);
    const building = (parcel?.buildings || []).find(b => b.id === buildingId);
    if (!building) return;
    building.areas = building.areas || [];
    building.areas.push(window.ImprovementsContract.createArea());
    __impr_setInventory(inv);
    const a = building.areas[building.areas.length - 1];
    __impr_select('area', parcelId, buildingId, a.id);
}

function __impr_removeParcel(parcelId) {
    const inv = __impr_getInventory();
    inv.parcels = (inv.parcels || []).filter(p => p.id !== parcelId);
    __impr_setInventory(inv);
    const ui = __impr_getUiState();
    ui.selected = null;
    switchTab('improvements');
}

function __impr_removeBuilding(parcelId, buildingId) {
    const inv = __impr_getInventory();
    const parcel = (inv.parcels || []).find(p => p.id === parcelId);
    if (!parcel) return;
    parcel.buildings = (parcel.buildings || []).filter(b => b.id !== buildingId);
    __impr_setInventory(inv);
    const ui = __impr_getUiState();
    ui.selected = null;
    switchTab('improvements');
}

function __impr_removeArea(parcelId, buildingId, areaId) {
    const inv = __impr_getInventory();
    const parcel = (inv.parcels || []).find(p => p.id === parcelId);
    const building = (parcel?.buildings || []).find(b => b.id === buildingId);
    if (!building) return;
    building.areas = (building.areas || []).filter(a => a.id !== areaId);
    __impr_setInventory(inv);
    const ui = __impr_getUiState();
    ui.selected = null;
    switchTab('improvements');
}

function __impr_update(level, parcelId, buildingId, areaId, field, value) {
    const inv = __impr_getInventory();
    const parcel = (inv.parcels || []).find(p => p.id === parcelId);
    if (!parcel) return;

    if (level === 'parcel') {
        parcel[field] = value;
        __impr_setInventory(inv);
        return;
    }

    const building = (parcel.buildings || []).find(b => b.id === buildingId);
    if (!building) return;

    if (level === 'building') {
        if (field === 'yearBuilt') building.yearBuilt = value ? Number(value) : null;
        else building[field] = value;
        __impr_setInventory(inv);
        return;
    }

    const area = (building.areas || []).find(a => a.id === areaId);
    if (!area) return;
    if (field === 'sf') area.sf = value === '' ? 0 : Number(value);
    else if (field === 'yearBuiltOverride') area.yearBuiltOverride = value ? Number(value) : null;
    else area[field] = value;

    __impr_setInventory(inv);
    switchTab('improvements');
}

function renderSite() {
    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="card">
                <h3 class="card-header">Site Size & Shape</h3>
                <div class="grid grid-cols-2 gap-4">
                    ${renderField({type: 'number', label: 'Total Acres', required: true, step: '0.001'})}
                    ${renderField({type: 'number', label: 'Total Square Feet', required: true, readonly: true, note: 'Auto-calculated from acres'})}
                </div>
                ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                    id: 'site_shape',
                    label: 'Shape',
                    options: ['Rectangular', 'Approximately Rectangular', 'Irregular', 'Triangular', 'Square'],
                    allowCustom: true,
                    category: 'site',
                    placeholder: 'Describe shape...'
                }) : renderField({
                    type: 'select',
                    label: 'Shape',
                    options: ['Rectangular', 'Approximately Rectangular', 'Irregular', 'Triangular', 'Square', 'Other']
                })}
                ${renderField({type: 'text', label: 'Frontage', placeholder: 'e.g., 475\' along South 30th Street West'})}
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'site_notes',
                    label: 'Note to Reader',
                    rows: 4,
                    placeholder: 'Any special notes about site allocation, phasing, subdivision plans, or unique site attributes that would affect value...',
                    sectionContext: 'site_notes',
                    helperText: 'Include any caveats or special considerations about the site.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Note to Reader',
                    rows: 4,
                    placeholder: 'Any special notes about site allocation, phasing, etc.'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Zoning & Land Use</h3>
                ${renderField({type: 'text', label: 'Zoning Classification', required: true, placeholder: 'e.g., I1 - Light Industrial'})}
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'zoning_description',
                    label: 'Zoning Description',
                    rows: 6,
                    placeholder: 'Describe the zoning district, permitted uses by right and conditional, development standards including setbacks, height limits, FAR, lot coverage, parking requirements, and any overlay districts or special regulations...',
                    sectionContext: 'zoning_description',
                    helperText: 'AI can help draft a comprehensive zoning description based on the classification.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Zoning Description',
                    rows: 6,
                    placeholder: 'Describe the zoning district, permitted uses, setbacks, height limits...'
                })}
                <div class="mt-3">
                    <button type="button" class="toggle-btn" data-selected="false" onclick="toggleButtonState(this)">
                        <span class="toggle-indicator flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all duration-200">
                            <svg class="w-3 h-3 text-white opacity-0 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </span>
                        <span class="text-sm text-gray-700">Current use is permitted under zoning</span>
                    </button>
                </div>
            </div>

            <div class="card">
                <h3 class="card-header">Utilities & Services</h3>
                ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                    id: 'utilities_status',
                    label: 'Utilities Status',
                    options: ['All city services available', 'All city services to be extended', 'Partial utilities', 'Well & Septic'],
                    allowCustom: true,
                    category: 'site',
                    placeholder: 'Describe utilities...'
                }) : renderField({
                    type: 'select',
                    label: 'Utilities Status',
                    options: ['All city services available', 'All city services to be extended', 'Partial utilities', 'Well & Septic', 'Other']
                })}
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'utilities_description',
                    label: 'Utilities Description',
                    rows: 5,
                    placeholder: 'Detail the availability and capacity of water (municipal/well), sewer (municipal/septic), electric service, natural gas, telecommunications, and any special utility considerations or limitations...',
                    sectionContext: 'utilities_description',
                    helperText: 'Include provider names and adequacy for the property\'s use.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Utilities Description',
                    rows: 5,
                    placeholder: 'Detail water, sewer, electric, gas availability...'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Site Characteristics</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'topography',
                        label: 'Topography',
                        options: ['Level at street grade', 'Gently sloping', 'Moderately sloping', 'Steeply sloping', 'Rolling'],
                        allowCustom: true,
                        category: 'site',
                        placeholder: 'Describe topography...'
                    }) : renderField({
                        type: 'select',
                        label: 'Topography',
                        options: ['Level at street grade', 'Gently sloping', 'Moderately sloping', 'Steeply sloping', 'Rolling', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'site_access',
                        label: 'Access',
                        options: ['Paved public road', 'Paved private road', 'Gravel road', 'Dirt road', 'Easement'],
                        allowCustom: true,
                        category: 'site',
                        placeholder: 'Describe access...'
                    }) : renderField({
                        type: 'select',
                        label: 'Access',
                        options: ['Paved public road', 'Paved private road', 'Gravel road', 'Dirt road', 'Easement', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'flood_hazard',
                        label: 'Flood Hazard',
                        options: ['Not in flood hazard area', 'In identified flood hazard area', 'Flood fringe', 'Floodway'],
                        allowCustom: true,
                        category: 'site',
                        placeholder: 'Describe flood zone...'
                    }) : renderField({
                        type: 'select',
                        label: 'Flood Hazard',
                        options: ['Not in flood hazard area', 'In identified flood hazard area', 'Flood fringe', 'Floodway', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'easements',
                        label: 'Easements',
                        options: ['No adverse easements', 'Utility easements (non-adverse)', 'Access easement', 'Other easements present'],
                        allowCustom: true,
                        category: 'site',
                        placeholder: 'Describe easements...'
                    }) : renderField({
                        type: 'select',
                        label: 'Easements',
                        options: ['No adverse easements', 'Utility easements (non-adverse)', 'Access easement', 'Other easements present']
                    })}
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders the Improvements tab - Building details and construction
 * Property Name moved to Tax & Ownership section
 * @returns {string} HTML string for improvements section
 */
function renderImprovements() {
    // New inventory builder (Parcel → Building → Area). Uses ImprovementsContract + WizardState.
    if (!window.ImprovementsContract) {
        return `
            <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
                <div class="card">
                    <h3 class="card-header">Improvements Inventory</h3>
                    <p class="text-sm text-gray-600">Missing <code>assets/improvements-contract.js</code>. Please include it on this page.</p>
                </div>
            </div>
        `;
    }

    const ui = __impr_getUiState();
    const templateId = (typeof WizardState !== 'undefined' ? (WizardState.get('template') || '') : '').toLowerCase();
    const requireImprovements = templateId !== 'land';

    const inv = __impr_getInventory();
    const normalized = window.ImprovementsContract.normalizeInventory(inv);
    __impr_setInventory(normalized);

    const esc = (s) => String(s ?? '').replace(/\"/g, '&quot;');

    // Ensure selection is valid (default to first area)
    const parcels = normalized.parcels || [];
    if (!ui.selected && parcels.length) {
        const p0 = parcels[0];
        const b0 = (p0.buildings || [])[0];
        const a0 = (b0 && (b0.areas || [])[0]) || null;
        ui.selected = a0 ? { level: 'area', parcelId: p0.id, buildingId: b0.id, areaId: a0.id } : { level: 'parcel', parcelId: p0.id };
    }
    if (ui.selected) {
        const p = parcels.find(x => x.id === ui.selected.parcelId) || parcels[0];
        if (!p) ui.selected = null;
        else if (ui.selected.level === 'parcel') ui.selected.parcelId = p.id;
        else {
            const b = (p.buildings || []).find(x => x.id === ui.selected.buildingId) || (p.buildings || [])[0];
            if (!b) ui.selected = { level: 'parcel', parcelId: p.id };
            else if (ui.selected.level === 'building') {
                ui.selected.parcelId = p.id;
                ui.selected.buildingId = b.id;
            } else {
                const a = (b.areas || []).find(x => x.id === ui.selected.areaId) || (b.areas || [])[0];
                ui.selected.parcelId = p.id;
                ui.selected.buildingId = b.id;
                ui.selected.areaId = a ? a.id : '';
            }
        }
    }
    const selected = ui.selected || { level: 'parcel', parcelId: parcels[0]?.id || '' };

    const rollups = window.ImprovementsContract.computeRollups(normalized);
    const validation = window.ImprovementsContract.validateInventory(normalized, { requireImprovements });
    const issues = validation.issues || [];
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');

    const treeHtml = parcels.map((p) => {
        const pSel = selected.level === 'parcel' && selected.parcelId === p.id;
        const buildings = p.buildings || [];
        return `
            <div class="mb-3">
                <div class="flex items-center justify-between gap-2">
                    <button type="button"
                            class="flex-1 text-left px-3 py-2 rounded-lg border ${pSel ? 'border-harken-accent bg-harken-accent/5 text-harken-accent' : 'border-gray-200 hover:bg-gray-50'}"
                            onclick="__impr_select('parcel','${p.id}','', '')">
                        <div class="text-sm font-semibold">${esc(p.label || 'Parcel')}</div>
                        <div class="text-xs text-gray-500">${p.taxParcelId ? `Tax/Parcel: ${esc(p.taxParcelId)}` : 'Tax/Parcel ID not set'}</div>
                    </button>
                    <button type="button" class="p-2 text-gray-400 hover:text-red-500" title="Remove parcel"
                            onclick="__impr_removeParcel('${p.id}')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>

                <div class="ml-3 mt-2 space-y-2">
                    ${buildings.map((b) => {
                        const bSel = selected.level === 'building' && selected.buildingId === b.id;
                        const areas = b.areas || [];
                        return `
                            <div class="border-l border-gray-200 pl-3">
                                <div class="flex items-center justify-between gap-2">
                                    <button type="button"
                                            class="flex-1 text-left px-3 py-2 rounded-lg border ${bSel ? 'border-harken-accent bg-harken-accent/5 text-harken-accent' : 'border-gray-200 hover:bg-gray-50'}"
                                            onclick="__impr_select('building','${p.id}','${b.id}','')">
                                        <div class="text-sm font-medium">${esc(b.label || 'Building')}</div>
                                        <div class="text-xs text-gray-500">${b.yearBuilt ? `Year built: ${b.yearBuilt}` : 'Year built not set'}</div>
                                    </button>
                                    <button type="button" class="p-2 text-gray-400 hover:text-red-500" title="Remove building"
                                            onclick="__impr_removeBuilding('${p.id}','${b.id}')">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>

                                <div class="ml-3 mt-2 space-y-2">
                                    ${areas.map((a) => {
                                        const aSel = selected.level === 'area' && selected.areaId === a.id;
                                        const useLabel = a.useType === 'custom' ? (a.useTypeCustom || 'Custom') : (a.useType || 'Area');
                                        return `
                                            <div class="border-l border-gray-200 pl-3">
                                                <div class="flex items-center justify-between gap-2">
                                                    <button type="button"
                                                            class="flex-1 text-left px-3 py-2 rounded-lg border ${aSel ? 'border-harken-accent bg-harken-accent/5 text-harken-accent' : 'border-gray-200 hover:bg-gray-50'}"
                                                            onclick="__impr_select('area','${p.id}','${b.id}','${a.id}')">
                                                        <div class="text-sm">${esc(useLabel)}</div>
                                                        <div class="text-xs text-gray-500">${(Number(a.sf) || 0).toLocaleString()} ${esc(a.sfType || 'SF')}</div>
                                                    </button>
                                                    <button type="button" class="p-2 text-gray-400 hover:text-red-500" title="Remove area"
                                                            onclick="__impr_removeArea('${p.id}','${b.id}','${a.id}')">
                                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}

                                    <button type="button" class="w-full px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                                            onclick="__impr_addArea('${p.id}','${b.id}')">
                                        + Add Area/Segment
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}

                    <button type="button" class="w-full px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
                            onclick="__impr_addBuilding('${p.id}')">
                        + Add Building
                    </button>
                </div>
            </div>
        `;
    }).join('');

    const parcel = parcels.find(p => p.id === selected.parcelId) || null;
    const building = parcel ? (parcel.buildings || []).find(b => b.id === selected.buildingId) : null;
    const area = building ? (building.areas || []).find(a => a.id === selected.areaId) : null;

    const editorHtml = (() => {
        if (selected.level === 'parcel' && parcel) {
            return `
                <div class="card">
                    <h3 class="card-header">Parcel</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Parcel Label</label>
                            <input class="form-input bg-white" value="${esc(parcel.label)}" onchange="__impr_update('parcel','${parcel.id}','','','label', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tax ID / Parcel #</label>
                            <input class="form-input bg-white" value="${esc(parcel.taxParcelId)}" onchange="__impr_update('parcel','${parcel.id}','','','taxParcelId', this.value)" placeholder="e.g., 123-45-678-00">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Parcel Address</label>
                        <input class="form-input bg-white" value="${esc(parcel.address)}" onchange="__impr_update('parcel','${parcel.id}','','','address', this.value)" placeholder="Street, City, State ZIP">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Legal Description</label>
                        <textarea class="form-textarea bg-white" rows="5" onchange="__impr_update('parcel','${parcel.id}','','','legalDescription', this.value)">${parcel.legalDescription || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea class="form-textarea bg-white" rows="4" onchange="__impr_update('parcel','${parcel.id}','','','notes', this.value)">${parcel.notes || ''}</textarea>
                    </div>
                </div>
            `;
        }

        if (selected.level === 'building' && parcel && building) {
            return `
                <div class="card">
                    <h3 class="card-header">Building</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Building Label</label>
                            <input class="form-input bg-white" value="${esc(building.label)}" onchange="__impr_update('building','${parcel.id}','${building.id}','','label', this.value)">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Year Built</label>
                            <input type="number" min="1600" class="form-input bg-white" value="${esc(building.yearBuilt ?? '')}" onchange="__impr_update('building','${parcel.id}','${building.id}','','yearBuilt', this.value)">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Year Remodeled</label>
                            <input class="form-input bg-white" value="${esc(building.yearRemodeled ?? '')}" onchange="__impr_update('building','${parcel.id}','${building.id}','','yearRemodeled', this.value)" placeholder="N/A or year">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Address Override</label>
                            <input class="form-input bg-white" value="${esc(building.addressOverride ?? '')}" onchange="__impr_update('building','${parcel.id}','${building.id}','','addressOverride', this.value)" placeholder="If different than parcel">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-group">
                            <label class="form-label">Construction Type</label>
                            <input class="form-input bg-white" value="${esc(building.constructionType ?? '')}" onchange="__impr_update('building','${parcel.id}','${building.id}','','constructionType', this.value)" placeholder="e.g., tilt-up">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Quality</label>
                            <input class="form-input bg-white" value="${esc(building.quality ?? '')}" onchange="__impr_update('building','${parcel.id}','${building.id}','','quality', this.value)" placeholder="e.g., average">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Condition</label>
                            <input class="form-input bg-white" value="${esc(building.condition ?? '')}" onchange="__impr_update('building','${parcel.id}','${building.id}','','condition', this.value)" placeholder="e.g., good">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea class="form-textarea bg-white" rows="4" onchange="__impr_update('building','${parcel.id}','${building.id}','','notes', this.value)">${building.notes || ''}</textarea>
                    </div>
                    <div class="p-3 mt-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                        Detailed finishes/systems will be captured per area/segment in the next iteration.
                    </div>
                </div>
            `;
        }

        if (selected.level === 'area' && parcel && building && area) {
            const useType = area.useType || 'warehouse';
            const sfType = area.sfType || 'GBA';
            const useOptions = [
                ['office','Office'], ['warehouse','Warehouse'], ['retail','Retail'], ['apartment','Apartment'],
                ['industrial','Industrial'], ['flex','Flex'], ['sfr','Single Family Residence (SFR)'], ['custom','Custom']
            ];
            const sfTypeOptions = [['GBA','Gross Building Area (GBA)'], ['NRA','Net Rentable Area (NRA)'], ['Other','Other']];
            return `
                <div class="card">
                    <h3 class="card-header">Area / Segment</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Use Type</label>
                            <select class="form-select bg-white" onchange="__impr_update('area','${parcel.id}','${building.id}','${area.id}','useType', this.value)">
                                ${useOptions.map(([v,l]) => `<option value="${v}" ${v===useType?'selected':''}>${l}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Square Footage</label>
                            <input type="number" min="0" step="1" class="form-input bg-white" value="${esc(area.sf ?? 0)}" onchange="__impr_update('area','${parcel.id}','${building.id}','${area.id}','sf', this.value)">
                        </div>
                    </div>
                    ${useType === 'custom' ? `
                        <div class="form-group">
                            <label class="form-label">Custom Use Type</label>
                            <input class="form-input bg-white" value="${esc(area.useTypeCustom ?? '')}" onchange="__impr_update('area','${parcel.id}','${building.id}','${area.id}','useTypeCustom', this.value)" placeholder="e.g., showroom">
                        </div>
                    ` : ''}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">SF Type</label>
                            <select class="form-select bg-white" onchange="__impr_update('area','${parcel.id}','${building.id}','${area.id}','sfType', this.value)">
                                ${sfTypeOptions.map(([v,l]) => `<option value="${v}" ${v===sfType?'selected':''}>${l}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Year Built (override)</label>
                            <input type="number" min="1600" class="form-input bg-white" value="${esc(area.yearBuiltOverride ?? '')}" onchange="__impr_update('area','${parcel.id}','${building.id}','${area.id}','yearBuiltOverride', this.value)" placeholder="Optional">
                        </div>
                    </div>
                    ${sfType === 'Other' ? `
                        <div class="form-group">
                            <label class="form-label">Custom SF Type</label>
                            <input class="form-input bg-white" value="${esc(area.sfTypeCustom ?? '')}" onchange="__impr_update('area','${parcel.id}','${building.id}','${area.id}','sfTypeCustom', this.value)" placeholder="e.g., NIA">
                        </div>
                    ` : ''}
                    <div class="form-group">
                        <label class="form-label">Notes</label>
                        <textarea class="form-textarea bg-white" rows="4" onchange="__impr_update('area','${parcel.id}','${building.id}','${area.id}','notes', this.value)">${area.notes || ''}</textarea>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card">
                <h3 class="card-header">Improvements</h3>
                <p class="text-sm text-gray-600">Select an item from the inventory to edit it.</p>
            </div>
        `;
    })();

    const sfTotal = Number(rollups.subjectTotals.sfTotal || 0);
    const sfByType = rollups.subjectTotals.sfByType || {};
    const sfByTypeRows = Object.keys(sfByType).map(k => `
        <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">${k}</span>
            <span class="font-semibold">${Number(sfByType[k] || 0).toLocaleString()}</span>
        </div>
    `).join('');

    return `
        <div class="max-w-6xl mx-auto animate-fade-in">
            <div class="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h2 class="text-xl font-bold text-gray-900">Improvements Inventory</h2>
                    <p class="text-sm text-gray-600">Parcels → Buildings → Areas. Totals roll up automatically from areas.</p>
                </div>
                <button type="button" class="px-4 py-2 text-sm font-semibold text-white bg-harken-accent rounded-lg hover:bg-harken-accent-light"
                        onclick="__impr_addParcel()">
                    + Add Parcel
                </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div class="lg:col-span-4">
                    <div class="card">
                        <h3 class="card-header">Inventory</h3>
                        ${treeHtml}
                    </div>
                </div>

                <div class="lg:col-span-5 space-y-6">
                    ${editorHtml}
                </div>

                <div class="lg:col-span-3 space-y-6">
                    <div class="card">
                        <h3 class="card-header">Rollups</h3>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                <div class="text-xs text-gray-500">Parcels</div>
                                <div class="text-lg font-bold">${rollups.subjectTotals.parcels}</div>
                            </div>
                            <div class="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                <div class="text-xs text-gray-500">Buildings</div>
                                <div class="text-lg font-bold">${rollups.subjectTotals.buildings}</div>
                            </div>
                            <div class="p-3 rounded-lg bg-gray-50 border border-gray-200 col-span-2">
                                <div class="text-xs text-gray-500">Total SF (derived)</div>
                                <div class="text-2xl font-bold">${sfTotal.toLocaleString()}</div>
                            </div>
                        </div>
                        ${sfByTypeRows ? `<div class="mt-3 space-y-1">${sfByTypeRows}</div>` : ''}
                    </div>

                    <div class="card">
                        <h3 class="card-header">Warnings</h3>
                        <p class="text-sm text-gray-600">Warnings don’t block progress. Critical structural issues will block Finalize.</p>
                        ${errors.length ? `<div class="mt-3 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800"><strong>${errors.length} blocking issue(s)</strong> will prevent Finalize.</div>` : ''}
                        <div class="mt-3">
                            <div class="text-xs font-bold uppercase tracking-wide text-red-700">Errors</div>
                            ${errors.length ? `<ul class="mt-2 space-y-2">${errors.map(i => `<li class="text-sm text-gray-700"><span class="font-semibold">${i.code}:</span> ${i.message}</li>`).join('')}</ul>` : `<p class="mt-2 text-sm text-gray-500">None.</p>`}
                        </div>
                        <div class="mt-4">
                            <div class="text-xs font-bold uppercase tracking-wide text-amber-700">Warnings</div>
                            ${warnings.length ? `<ul class="mt-2 space-y-2">${warnings.map(i => `<li class="text-sm text-gray-700"><span class="font-semibold">${i.code}:</span> ${i.message}</li>`).join('')}</ul>` : `<p class="mt-2 text-sm text-gray-500">None.</p>`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // LEGACY IMPLEMENTATION (retained for reference during migration)
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let y = currentYear; y >= 1900; y--) {
        yearOptions.push(y.toString());
    }
    
    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="card">
                <h3 class="card-header">General Building Information</h3>
                <div class="grid grid-cols-2 gap-4">
                    ${renderField({type: 'number', label: 'Number of Buildings', required: true, min: 1, defaultValue: '1'})}
                    ${renderField({type: 'number', label: 'Total Square Footage (GBA)', required: true, placeholder: '0'})}
                </div>
            </div>
            
            <!-- Age & Economic Life Section -->
            <div class="card">
                <h3 class="card-header">Age & Economic Life</h3>
                
                <!-- Year Inputs Row -->
                <div class="grid grid-cols-2 gap-6">
                    <div class="form-group">
                        <label class="form-label">Year Built <span class="text-red-500">*</span></label>
                        <select id="year_built" class="form-input w-full bg-white" onchange="calculateAges()">
                            <option value="">Select year...</option>
                            ${yearOptions.map(y => `<option value="${y}">${y}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Year Remodeled</label>
                        <select id="year_remodeled" class="form-input w-full bg-white" onchange="calculateAges()">
                            <option value="">Not remodeled</option>
                            <option value="N/A">N/A</option>
                            ${yearOptions.map(y => `<option value="${y}">${y}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- Age Fields Row -->
                <div class="grid grid-cols-4 gap-4 mt-5">
                    <div class="form-group">
                        <label class="form-label text-gray-600">Actual Age</label>
                        <div class="flex items-center gap-2">
                            <input type="text" id="actual_age" class="form-input w-full bg-gray-50 text-gray-700" readonly placeholder="—">
                            <span class="text-sm text-gray-500">yrs</span>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">Auto-calculated</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Effective Age <span class="text-red-500">*</span></label>
                        <div class="flex items-center gap-2">
                            <input type="number" id="effective_age" class="form-input w-full bg-white" placeholder="Enter" min="0" oninput="calculateRemainingLife()">
                            <span class="text-sm text-gray-500">yrs</span>
                        </div>
                        <p id="effective_age_hint" class="text-xs text-harken-accent mt-1 hidden">Suggested: <span></span></p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Total Economic Life</label>
                        <div class="flex items-center gap-2">
                            <input type="number" id="total_economic_life" class="form-input w-full bg-white" value="50" min="1" oninput="calculateRemainingLife()">
                            <span class="text-sm text-gray-500">yrs</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label text-gray-600">Remaining Life</label>
                        <div class="flex items-center gap-2">
                            <input type="text" id="remaining_economic_life" class="form-input w-full bg-gray-50 text-gray-700" readonly placeholder="—">
                            <span class="text-sm text-gray-500">yrs</span>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">Auto-calculated</p>
                    </div>
                </div>
                
                <!-- Depreciation Result Bar -->
                <div class="mt-5 p-4 bg-white border-2 border-harken-accent/20 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-harken-accent/10 flex items-center justify-center">
                                <svg class="w-5 h-5 text-harken-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-800">Physical Depreciation (Age-Life Method)</p>
                                <p class="text-xs text-gray-500">Effective Age ÷ Total Economic Life</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span id="depreciation_percent" class="text-2xl font-bold text-harken-accent">—%</span>
                        </div>
                    </div>
                </div>
                
                <!-- Inline Calculator (Expandable) -->
                <div class="mt-4">
                    <button type="button" onclick="toggleAgeCalculator()" id="calc-toggle-btn" class="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                        <div class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-harken-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            <span class="font-medium text-gray-700">Need help? Use the Effective Age Calculator</span>
                        </div>
                        <svg id="calc-chevron" class="w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    
                    <!-- Inline Calculator Panel (hidden by default) -->
                    <div id="age-calculator-panel" class="hidden mt-3 p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div class="space-y-5">
                            <!-- Step 1: Construction Quality -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-800 mb-2">1. Construction Quality → Sets Economic Life</label>
                                <div class="grid grid-cols-3 gap-3">
                                    <button type="button" class="calc-option" data-field="quality" data-value="high" data-life="60" onclick="selectCalcOption(this)">
                                        <span class="font-medium">Excellent</span>
                                        <span class="text-xs text-gray-500">55-65 yr life</span>
                                    </button>
                                    <button type="button" class="calc-option" data-field="quality" data-value="average" data-life="45" onclick="selectCalcOption(this)">
                                        <span class="font-medium">Average</span>
                                        <span class="text-xs text-gray-500">40-50 yr life</span>
                                    </button>
                                    <button type="button" class="calc-option" data-field="quality" data-value="low" data-life="30" onclick="selectCalcOption(this)">
                                        <span class="font-medium">Fair/Poor</span>
                                        <span class="text-xs text-gray-500">25-35 yr life</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Step 2: Current Condition -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-800 mb-2">2. Current Condition → Adjusts Effective Age</label>
                                <div class="grid grid-cols-5 gap-2">
                                    <button type="button" class="calc-option" data-field="condition" data-value="excellent" data-adjustment="-0.3" onclick="selectCalcOption(this)">
                                        <span class="font-medium text-sm">Excellent</span>
                                        <span class="text-xs text-green-600">-30%</span>
                                    </button>
                                    <button type="button" class="calc-option" data-field="condition" data-value="good" data-adjustment="-0.15" onclick="selectCalcOption(this)">
                                        <span class="font-medium text-sm">Good</span>
                                        <span class="text-xs text-green-600">-15%</span>
                                    </button>
                                    <button type="button" class="calc-option" data-field="condition" data-value="average" data-adjustment="0" onclick="selectCalcOption(this)">
                                        <span class="font-medium text-sm">Average</span>
                                        <span class="text-xs text-gray-500">±0%</span>
                                    </button>
                                    <button type="button" class="calc-option" data-field="condition" data-value="fair" data-adjustment="0.15" onclick="selectCalcOption(this)">
                                        <span class="font-medium text-sm">Fair</span>
                                        <span class="text-xs text-amber-600">+15%</span>
                                    </button>
                                    <button type="button" class="calc-option" data-field="condition" data-value="poor" data-adjustment="0.3" onclick="selectCalcOption(this)">
                                        <span class="font-medium text-sm">Poor</span>
                                        <span class="text-xs text-red-600">+30%</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Step 3: Remodeling Impact -->
                            <div>
                                <label class="block text-sm font-semibold text-gray-800 mb-2">3. Remodeling Impact → Further Adjustment</label>
                                <div class="grid grid-cols-4 gap-2">
                                    <button type="button" class="calc-option" data-field="remodel" data-value="major" data-adjustment="-0.4" onclick="selectCalcOption(this)">
                                        <span class="font-medium text-sm">Major</span>
                                        <span class="text-xs text-green-600">-40%</span>
                                    </button>
                                    <button type="button" class="calc-option" data-field="remodel" data-value="moderate" data-adjustment="-0.2" onclick="selectCalcOption(this)">
                                        <span class="font-medium text-sm">Moderate</span>
                                        <span class="text-xs text-green-600">-20%</span>
                                    </button>
                                    <button type="button" class="calc-option" data-field="remodel" data-value="minor" data-adjustment="-0.1" onclick="selectCalcOption(this)">
                                        <span class="font-medium text-sm">Minor</span>
                                        <span class="text-xs text-green-600">-10%</span>
                                    </button>
                                    <button type="button" class="calc-option" data-field="remodel" data-value="none" data-adjustment="0" onclick="selectCalcOption(this)">
                                        <span class="font-medium text-sm">None</span>
                                        <span class="text-xs text-gray-500">±0%</span>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Calculated Results -->
                            <div class="bg-harken-accent/5 rounded-lg p-4 border border-harken-accent/20">
                                <div class="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase mb-1">Economic Life</p>
                                        <p id="calc_economic_life" class="text-xl font-bold text-gray-800">—</p>
                                        <p class="text-xs text-gray-400">years</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase mb-1">Effective Age</p>
                                        <p id="calc_effective_age" class="text-xl font-bold text-harken-accent">—</p>
                                        <p class="text-xs text-gray-400">years</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase mb-1">Depreciation</p>
                                        <p id="calc_depreciation" class="text-xl font-bold text-gray-800">—%</p>
                                    </div>
                                </div>
                                <button type="button" onclick="applyCalculatedValues()" class="mt-4 w-full py-2 bg-harken-accent text-white rounded-lg font-medium hover:bg-harken-accent/90 transition-colors">
                                    Apply These Values
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3 class="card-header">Construction Details</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'construction_type',
                        label: 'Construction Type',
                        options: ['Pre-engineered steel', 'Wood Frame', 'Masonry', 'Concrete Tilt-Up', 'Steel Frame', 'Mixed'],
                        allowCustom: true,
                        category: 'structure',
                        required: true,
                        placeholder: 'Enter construction type...'
                    }) : renderField({
                        type: 'select',
                        label: 'Construction Type',
                        required: true,
                        options: ['Pre-engineered steel', 'Wood Frame', 'Masonry', 'Concrete Tilt-Up', 'Steel Frame', 'Mixed', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'construction_quality',
                        label: 'Construction Quality',
                        options: ['Excellent', 'Very Good', 'Good', 'Average', 'Fair', 'Poor'],
                        allowCustom: false,
                        category: 'structure'
                    }) : renderField({
                        type: 'select',
                        label: 'Construction Quality',
                        options: ['Excellent', 'Very Good', 'Good', 'Average', 'Fair', 'Poor']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'building_condition',
                        label: 'Condition',
                        options: ['New', 'Like New', 'Very Good', 'Good', 'Average', 'Fair', 'Poor'],
                        allowCustom: false,
                        category: 'structure',
                        required: true
                    }) : renderField({
                        type: 'select',
                        label: 'Condition',
                        required: true,
                        options: ['New', 'Like New', 'Very Good', 'Good', 'Average', 'Fair', 'Poor']
                    })}
                </div>
                
                <!-- Building Heights Section -->
                <div class="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-semibold text-gray-800 flex items-center gap-2">
                            <svg class="w-5 h-5 text-harken-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            Building Heights
                        </h4>
                        <div class="text-xs text-gray-500 flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Clear height is interior usable height
                        </div>
                    </div>
                    
                    <!-- Height Input Fields -->
                    <div id="single_height_fields" class="grid grid-cols-3 gap-4 mb-4">
                        <div class="form-group">
                            <label class="form-label text-sm">Eave Height</label>
                            <div class="flex items-center gap-2">
                                <input type="number" id="eave_height" class="form-input w-full bg-white" placeholder="24" min="0" step="0.5" oninput="updateBuildingHeights()">
                                <span class="text-sm text-gray-500 font-medium">ft</span>
                            </div>
                            <p class="text-xs text-gray-400 mt-1">Exterior wall height</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label text-sm">Clear Height <span class="text-red-500">*</span></label>
                            <div class="flex items-center gap-2">
                                <input type="number" id="clear_height" class="form-input w-full bg-white" placeholder="22" min="0" step="0.5" oninput="updateBuildingHeights()">
                                <span class="text-sm text-gray-500 font-medium">ft</span>
                            </div>
                            <p class="text-xs text-gray-400 mt-1">Usable interior height</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label text-sm">Ridge Height</label>
                            <div class="flex items-center gap-2">
                                <input type="number" id="ridge_height" class="form-input w-full bg-white" placeholder="32" min="0" step="0.5" oninput="updateBuildingHeights()">
                                <span class="text-sm text-gray-500 font-medium">ft</span>
                            </div>
                            <p class="text-xs text-gray-400 mt-1">Peak of roof</p>
                        </div>
                    </div>

                    <!-- Variable Heights: Zones -->
                    <div id="variable_height_zones" class="hidden mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <div>
                                <div class="text-sm font-semibold text-gray-800">Height Zones</div>
                                <div class="text-xs text-gray-500 mt-0.5">Use zones when clear height differs across bays/areas (e.g., office vs warehouse).</div>
                            </div>
                            <button type="button"
                                    class="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-harken-accent/5 hover:border-harken-accent/30 hover:text-harken-accent transition-all"
                                    onclick="addHeightZone()">
                                + Add Zone
                            </button>
                        </div>

                        <div class="overflow-x-auto bg-white border border-gray-200 rounded-xl">
                            <table class="min-w-full text-sm">
                                <thead class="bg-gray-50 border-b border-gray-200">
                                    <tr class="text-left text-xs font-semibold text-gray-600">
                                        <th class="px-4 py-3 w-48">Zone</th>
                                        <th class="px-4 py-3 w-40">Clear (ft) <span class="text-red-500">*</span></th>
                                        <th class="px-4 py-3 w-40">Eave (ft)</th>
                                        <th class="px-4 py-3 w-40">Ridge (ft)</th>
                                        <th class="px-4 py-3 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody id="height_zones_rows" class="divide-y divide-gray-100"></tbody>
                            </table>
                        </div>

                        <div id="height_zones_summary" class="mt-2 text-xs text-gray-500"></div>
                    </div>
                    
                    <!-- Building Configuration -->
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <label class="form-label text-sm mb-2">Building Configuration</label>
                        <div class="flex flex-wrap gap-2">
                            <button type="button" class="height-config-btn px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-700 text-sm font-medium transition-all hover:border-harken-accent/50" data-config="standard" onclick="selectBuildingConfig(this)">
                                <span class="flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                    Standard
                                </span>
                            </button>
                            <button type="button" class="height-config-btn px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-700 text-sm font-medium transition-all hover:border-harken-accent/50" data-config="clear-span" onclick="selectBuildingConfig(this)">
                                <span class="flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"></path></svg>
                                    Clear Span
                                </span>
                            </button>
                            <button type="button" class="height-config-btn px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-700 text-sm font-medium transition-all hover:border-harken-accent/50" data-config="multi-bay" onclick="selectBuildingConfig(this)">
                                <span class="flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg>
                                    Multi-Bay
                                </span>
                            </button>
                            <button type="button" class="height-config-btn px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-700 text-sm font-medium transition-all hover:border-harken-accent/50" data-config="variable" onclick="selectBuildingConfig(this)">
                                <span class="flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z"></path></svg>
                                    Variable Heights
                                </span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Quick Presets based on building type -->
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <div class="flex items-center justify-between mb-2">
                            <label class="form-label text-sm">Quick Presets</label>
                            <div id="preset_apply_controls" class="hidden items-center gap-2">
                                <span class="text-xs text-gray-500">Apply to:</span>
                                <button id="preset_apply_active"
                                        type="button"
                                        class="px-2.5 py-1 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-harken-accent/5 hover:border-harken-accent/30 hover:text-harken-accent transition-all"
                                        onclick="setPresetApplyMode('active')">
                                    Selected zone
                                </button>
                                <button id="preset_apply_all"
                                        type="button"
                                        class="px-2.5 py-1 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-harken-accent/5 hover:border-harken-accent/30 hover:text-harken-accent transition-all"
                                        onclick="setPresetApplyMode('all')">
                                    All zones
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <button type="button" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-harken-accent/5 hover:border-harken-accent/30 hover:text-harken-accent transition-all" onclick="applyHeightPreset(16, 14, 20)">
                                Retail (16'/14'/20')
                            </button>
                            <button type="button" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-harken-accent/5 hover:border-harken-accent/30 hover:text-harken-accent transition-all" onclick="applyHeightPreset(24, 22, 32)">
                                Warehouse (24'/22'/32')
                            </button>
                            <button type="button" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-harken-accent/5 hover:border-harken-accent/30 hover:text-harken-accent transition-all" onclick="applyHeightPreset(32, 30, 40)">
                                Distribution (32'/30'/40')
                            </button>
                            <button type="button" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-harken-accent/5 hover:border-harken-accent/30 hover:text-harken-accent transition-all" onclick="applyHeightPreset(20, 18, 26)">
                                Light Industrial (20'/18'/26')
                            </button>
                            <button type="button" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-harken-accent/5 hover:border-harken-accent/30 hover:text-harken-accent transition-all" onclick="applyHeightPreset(12, 10, 14)">
                                Office (12'/10'/14')
                            </button>
                        </div>
                        <div id="preset_variable_tip" class="hidden mt-2 text-xs text-gray-500">
                            Tip: in Variable Heights, click into a zone row to make it the selected zone.
                        </div>
                    </div>
                </div>
                
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'construction_description',
                    label: 'Construction Details Description',
                    rows: 6,
                    placeholder: 'Provide a narrative description of the building construction including structural system, foundation type, framing materials, exterior finishes, roofing system, and overall construction quality. Note any deferred maintenance or needed repairs...',
                    sectionContext: 'construction_details',
                    helperText: 'AI can help draft a professional construction description based on the selections above.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Construction Details Description',
                    rows: 6,
                    placeholder: 'Describe the overall building construction...'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Exterior Features</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'foundation_floor',
                        label: 'Foundation/Floor',
                        options: ['Concrete monolithic slab on grade', 'Concrete spread footings', 'Pier & beam', 'Basement'],
                        allowCustom: true,
                        category: 'structure',
                        placeholder: 'Describe foundation...'
                    }) : renderField({
                        type: 'select',
                        label: 'Foundation/Floor',
                        options: ['Concrete monolithic slab on grade', 'Concrete spread footings', 'Pier & beam', 'Basement', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'roof_type',
                        label: 'Roof',
                        options: ['Metal', 'TPO Membrane', 'EPDM Membrane', 'Standing Seam Metal', 'Asphalt Shingles', 'Tar and Gravel'],
                        allowCustom: true,
                        category: 'structure',
                        placeholder: 'Describe roof...'
                    }) : renderField({
                        type: 'select',
                        label: 'Roof',
                        options: ['Metal', 'TPO Membrane', 'EPDM Membrane', 'Standing Seam Metal', 'Asphalt Shingles', 'Tar and Gravel', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'exterior_walls',
                        label: 'Exterior Walls',
                        options: ['Steel siding', 'Brick', 'Stucco', 'Wood Siding', 'Concrete', 'EIFS'],
                        allowCustom: true,
                        category: 'structure',
                        placeholder: 'Describe exterior...'
                    }) : renderField({
                        type: 'select',
                        label: 'Exterior Walls',
                        options: ['Steel siding', 'Brick', 'Stucco', 'Wood Siding', 'Concrete', 'EIFS', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'windows_type',
                        label: 'Windows',
                        options: ['Vinyl framed', 'Metal framed', 'Wood framed', 'Aluminum', 'None'],
                        allowCustom: true,
                        category: 'systems',
                        placeholder: 'Describe windows...'
                    }) : renderField({
                        type: 'select',
                        label: 'Windows',
                        options: ['Vinyl framed', 'Metal framed', 'Wood framed', 'Aluminum', 'None', 'Other']
                    })}
                </div>
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'exterior_description',
                    label: 'Exterior Features Description',
                    rows: 5,
                    placeholder: 'Describe the building exterior including foundation, roofing system and condition, exterior wall materials, windows and doors, and any site improvements such as parking, landscaping, signage, and fencing...',
                    sectionContext: 'improvement_description',
                    helperText: 'Note any items requiring repair or replacement.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Exterior Features Description',
                    rows: 5,
                    placeholder: 'Describe the building exterior...'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Interior Features</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'ceilings',
                        label: 'Ceilings',
                        options: ['Acoustic ceiling tiles', 'Painted drywall', 'Exposed structure', 'Metal liner panel'],
                        allowCustom: true,
                        category: 'interior',
                        placeholder: 'Describe ceilings...'
                    }) : renderField({
                        type: 'select',
                        label: 'Ceilings',
                        options: ['Acoustic ceiling tiles', 'Painted drywall', 'Exposed structure', 'Metal liner panel', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'flooring',
                        label: 'Flooring',
                        options: ['Concrete', 'Sealed Concrete', 'Vinyl Plank', 'Carpet', 'Tile', 'Hardwood'],
                        allowCustom: true,
                        category: 'interior',
                        placeholder: 'Describe flooring...'
                    }) : renderField({
                        type: 'select',
                        label: 'Flooring',
                        options: ['Concrete', 'Sealed Concrete', 'Vinyl Plank', 'Carpet', 'Tile', 'Hardwood', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'interior_walls',
                        label: 'Walls',
                        options: ['Painted drywall', 'Metal liner panel', 'Plywood', 'Brick'],
                        allowCustom: true,
                        category: 'interior',
                        placeholder: 'Describe walls...'
                    }) : renderField({
                        type: 'select',
                        label: 'Walls',
                        options: ['Painted drywall', 'Metal liner panel', 'Plywood', 'Brick', 'Other']
                    })}
                </div>
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'interior_description',
                    label: 'Interior Finish Description',
                    rows: 5,
                    placeholder: 'Describe the interior finishes including wall treatments, flooring types by area, ceiling treatments and heights, lighting, restroom count and finish level, and overall interior condition...',
                    sectionContext: 'interior_description',
                    helperText: 'Include finish quality and any deferred maintenance.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Interior Finish Description',
                    rows: 5,
                    placeholder: 'Describe the interior finishes...'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Mechanical Systems</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'electrical',
                        label: 'Electrical',
                        options: ['Single Phase 200 Amp', 'Three Phase', 'Assumed Adequate'],
                        allowCustom: true,
                        category: 'systems',
                        placeholder: 'Describe electrical...'
                    }) : renderField({
                        type: 'select',
                        label: 'Electrical',
                        options: ['Single Phase 200 Amp', 'Three Phase', 'Assumed Adequate', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'heating',
                        label: 'Heating',
                        options: ['Suspended gas unit heaters', 'GFA', 'Radiant', 'Central Forced Air', 'Boiler', 'None'],
                        allowCustom: true,
                        category: 'systems',
                        placeholder: 'Describe heating...'
                    }) : renderField({
                        type: 'select',
                        label: 'Heating',
                        options: ['Suspended gas unit heaters', 'GFA', 'Radiant', 'Central Forced Air', 'Boiler', 'None', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'cooling',
                        label: 'Cooling',
                        options: ['Central AC', 'Evaporative', 'Mini-Split', 'None'],
                        allowCustom: true,
                        category: 'systems',
                        placeholder: 'Describe cooling...'
                    }) : renderField({
                        type: 'select',
                        label: 'Cooling',
                        options: ['Central AC', 'Evaporative', 'Mini-Split', 'None', 'Other']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'sprinkler_system',
                        label: 'Sprinkler System',
                        options: ['None', 'Fully Sprinkled', 'Partially Sprinkled', 'Dry System', 'Wet System'],
                        allowCustom: false,
                        category: 'systems'
                    }) : renderField({
                        type: 'select',
                        label: 'Sprinkler System',
                        options: ['None', 'Fully Sprinkled', 'Partially Sprinkled', 'Dry System', 'Wet System']
                    })}
                    ${typeof renderExpandableSelector === 'function' ? renderExpandableSelector({
                        id: 'elevators',
                        label: 'Elevators',
                        options: ['None', 'Passenger', 'Freight', 'Both'],
                        allowCustom: false,
                        category: 'systems'
                    }) : renderField({
                        type: 'select',
                        label: 'Elevators',
                        options: ['None', 'Passenger', 'Freight', 'Both']
                    })}
                </div>
                ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                    id: 'mechanical_description',
                    label: 'Mechanical Systems Description',
                    rows: 5,
                    placeholder: 'Describe the mechanical systems including HVAC equipment (type, age, capacity), electrical service, plumbing, fire suppression, elevators/lifts, and any special equipment. Note the condition and adequacy for the property use...',
                    sectionContext: 'mechanical_systems',
                    helperText: 'Include equipment ages and any needed repairs or replacements.'
                }) : renderField({
                    type: 'textarea',
                    label: 'Mechanical Systems Description',
                    rows: 5,
                    placeholder: 'Describe the mechanical systems...'
                })}
            </div>
        </div>
    `;
}

/**
 * Renders the Tax & Ownership tab
 * Consolidated location for all tax and sale history data
 * @returns {string} HTML string for tax section
 */
function renderTax() {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 11 }, (_, i) => String(currentYear - i)); // current -> current-10
    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="card">
                <h3 class="card-header">Property Identification</h3>
                <div class="grid grid-cols-2 gap-4">
                    ${renderField({type: 'text', label: 'Tax ID / Parcel Number', required: true, placeholder: 'e.g., 123-45-678-00'})}
                    ${renderField({type: 'text', label: 'Property Name', placeholder: 'e.g., Canyon Creek Industrial Complex'})}
                </div>
            </div>

            <div class="card">
                <h3 class="card-header">Property Tax Information</h3>
                <div class="grid grid-cols-2 gap-4">
                    ${renderField({type: 'select', label: 'Tax Year', options: yearOptions})}
                    ${renderField({type: 'currency', label: 'Current Year Tax Amount', placeholder: '$0.00'})}
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    ${renderField({type: 'currency', label: 'Assessed Value - Land', placeholder: '$0.00'})}
                    ${renderField({type: 'currency', label: 'Assessed Value - Improvements', placeholder: '$0.00'})}
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    ${renderField({type: 'currency', label: 'Total Assessed Value', placeholder: '$0.00'})}
                    ${renderField({type: 'number', label: 'Mill Levy / Tax Rate', placeholder: '0.000', step: '0.001'})}
                </div>
            </div>

            <div class="card">
                <h3 class="card-header">Sale & Ownership History</h3>
                <div class="grid grid-cols-2 gap-4">
                    ${renderField({type: 'date', label: 'Date of Last Sale'})}
                    ${renderField({type: 'currency', label: 'Last Sale Price'})}
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    ${renderField({type: 'text', label: 'Grantor (Seller)', placeholder: 'Name of seller'})}
                    ${renderField({type: 'text', label: 'Grantee (Buyer)', placeholder: 'Name of buyer'})}
                </div>
                <div class="mt-4">
                    ${typeof renderEnhancedTextArea === 'function' ? renderEnhancedTextArea({
                        id: 'transaction_history',
                        label: 'Transaction History (Last 3 Years)',
                        rows: 6,
                        placeholder: 'Document any sales, transfers, listings, or offers within the past 3 years per USPAP requirements. Include dates, prices, parties involved, and whether transactions were arms-length...',
                        sectionContext: 'transaction_history',
                        helperText: 'USPAP requires analysis of all sales and transfers within 3 years of the effective date.',
                        required: true
                    }) : renderField({
                        type: 'textarea',
                        label: 'Transaction History (Last 3 Years)',
                        rows: 6,
                        placeholder: 'Document any sales, transfers, or arms-length transactions in the last 3 years...'
                    })}
                </div>
                <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p class="text-xs text-amber-800 flex items-center gap-1">
                        <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <span><strong>USPAP Requirement:</strong> Document and analyze any sales within 3 years of the effective date.</span>
                    </p>
                </div>
            </div>
        </div>
    `;
}

function renderPhotos() {
    const reportPrimaryPhotoSlots = [
        { id: 'eval_p001_cover', page: 1, label: 'Cover Photo (Primary Exterior)' },
        { id: 'eval_p002_toc', page: 2, label: 'Table of Contents Photo (Exterior)' },
        { id: 'eval_p007_exec', page: 7, label: 'Executive Summary Photo (Exterior)' },
        { id: 'eval_p009_ps_1', page: 9, label: 'Property Summary Photo (1)' },
        { id: 'eval_p009_ps_2', page: 9, label: 'Property Summary Photo (2)' }
    ];

    const slotsHtml = reportPrimaryPhotoSlots.map(slot => {
        const slotId = String(slot.id);
        const page = String(slot.page);
        const label = String(slot.label);
        return `
            <div class="rounded-xl border border-gray-200 bg-white p-4">
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-harken-accent/10 text-harken-dark border border-harken-accent/20">
                                Page ${page}
                            </span>
                            <div class="text-sm font-semibold text-gray-900 truncate">${label}</div>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">This slot matches the photo placement in the sample report.</div>
                    </div>
                </div>

                <div class="relative">
                    <div id="rps-empty-${slotId}" class="flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                        <svg class="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <div class="text-xs text-gray-600">Upload an image for Page ${page}</div>
                        <button type="button"
                                class="mt-3 px-4 py-2 rounded-lg bg-harken-accent text-white text-sm font-semibold hover:brightness-95 transition-all"
                                onclick="document.getElementById('rps-input-${slotId}').click()">
                            Upload
                        </button>
                    </div>

                    <div id="rps-filled-${slotId}" class="hidden">
                        <img id="rps-img-${slotId}" alt="${label}" class="w-full h-44 object-cover rounded-lg border border-gray-200" />
                        <div class="flex items-center justify-between mt-3">
                            <div id="rps-fn-${slotId}" class="text-xs text-gray-500 truncate"></div>
                            <div class="flex items-center gap-2">
                                <button type="button"
                                        class="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-harken-accent/5 hover:border-harken-accent/30 hover:text-harken-accent transition-all"
                                        onclick="document.getElementById('rps-input-${slotId}').click()">
                                    Replace
                                </button>
                                <button type="button"
                                        class="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                                        onclick="clearReportPhotoSlot('${slotId}')">
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>

                    <input id="rps-input-${slotId}" type="file" accept="image/*" class="hidden"
                           onchange="handleReportPhotoSlotUpload('${slotId}', this.files && this.files[0] ? this.files[0] : null)">
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="card">
                <h3 class="card-header">Interactive Map</h3>
                <div class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                    <svg class="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                    </svg>
                    <p class="text-sm text-gray-600 mb-3">Interactive map will load here</p>
                    <div class="flex gap-3 justify-center">
                        <button class="btn btn-primary">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Locate Subject
                        </button>
                        <button class="btn btn-outline">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            Draw Boundary
                        </button>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3 class="card-header">Report Primary Photos</h3>
                <div class="text-sm text-gray-600 mb-4">
                    These slots are labeled by the page number where each <strong>prominent subject photo</strong> appears in
                    <span class="font-semibold text-gray-900">“Evaluation - 131 S Higgins Avenue, Missoula, MT - Final -”</span>.
                    Comparable photos and map images were intentionally excluded.
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${slotsHtml}
                </div>
            </div>
        </div>
    `;
}

function renderExhibits() {
    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="card">
                <h3 class="card-header">Required Documents</h3>
                <div class="space-y-4">
                    ${renderUploadSlot('Floor Plans', 'Upload architectural floor plans')}
                    ${renderUploadSlot('Site Plans', 'Upload site plan or survey')}
                    ${renderUploadSlot('Rent Roll', 'Upload current rent roll (if applicable)')}
                    ${renderUploadSlot('Operating Statements', 'Upload income/expense statements')}
                    ${renderUploadSlot('Lease Agreements', 'Upload sample leases')}
                    ${renderUploadSlot('Title Report', 'Upload preliminary title report')}
                </div>
            </div>

            <div class="card">
                <h3 class="card-header">Additional Exhibits</h3>
                <button class="btn btn-outline w-full">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Custom Exhibit
                </button>
            </div>
        </div>
    `;
}

function renderUploadSlot(label, description) {
    return `
        <div class="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-harken-accent transition-all">
            <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <div>
                    <div class="font-semibold text-gray-900">${label}</div>
                    <div class="text-xs text-gray-500">${description}</div>
                </div>
            </div>
            <button class="btn btn-primary">Upload</button>
        </div>
    `;
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
    
    if (leftSidebar.classList.contains('collapsed')) {
        leftSidebar.classList.remove('collapsed');
        helpSidebar.classList.remove('collapsed');
    } else {
        leftSidebar.classList.add('collapsed');
        helpSidebar.classList.add('collapsed');
    }
}

function updateHelp(tabId) {
    if (currentHelpMode !== 'guidance') return;
    
    const helpContent = document.getElementById('help-content');
    const helpText = {
        'location': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Location & Area</h3>
            <p class="text-sm text-gray-600 mb-4">Provide context about the general area, neighborhood, and specific location of the subject property.</p>
            <div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <h4 class="font-semibold text-sm text-blue-900 mb-1">Best Practice</h4>
                <p class="text-xs text-blue-800">Define neighborhood boundaries clearly (N, S, E, W) and describe the predominant land uses.</p>
            </div>
        `,
        'site': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Site Details</h3>
            <p class="text-sm text-gray-600 mb-4">Document the physical characteristics of the site including size, shape, zoning, and utilities.</p>
            <div class="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                <h4 class="font-semibold text-sm text-green-900 mb-1">Key Items</h4>
                <p class="text-xs text-green-800">Verify zoning with local planning department. Confirm all utility availability. Document any easements or encumbrances.</p>
            </div>
        `,
        'improvements': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Improvements</h3>
            <p class="text-sm text-gray-600 mb-4">Describe all improvements on the property including buildings, structures, and site improvements.</p>
            <div class="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                <h4 class="font-semibold text-sm text-purple-900 mb-1">USPAP</h4>
                <p class="text-xs text-purple-800">Standards Rule 1-4(b) requires analysis of improvements including their condition and functional utility.</p>
            </div>
        `,
        'tax': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Tax & Ownership</h3>
            <p class="text-sm text-gray-600 mb-4">Document property tax information and ownership history.</p>
        `,
        'photos': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Photos & Maps</h3>
            <p class="text-sm text-gray-600 mb-4">Upload property photos and use the interactive map to locate and draw the property boundary.</p>
        `,
        'exhibits': `
            <h3 class="text-lg font-bold text-gray-900 mb-3">Exhibits & Documents</h3>
            <p class="text-sm text-gray-600 mb-4">Upload supporting documentation such as floor plans, rent rolls, leases, and other relevant exhibits.</p>
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

// =================================================================
// AGE & ECONOMIC LIFE CALCULATOR FUNCTIONS
// =================================================================

// Calculator state
const ageCalcState = {
    quality: null,
    condition: null,
    remodel: null,
    economicLife: null,
    conditionAdjustment: 0,
    remodelAdjustment: 0
};

/**
 * Calculate ages automatically based on year built
 */
function calculateAges() {
    const yearBuiltInput = document.getElementById('year_built');
    const yearRemodeledInput = document.getElementById('year_remodeled');
    const actualAgeInput = document.getElementById('actual_age');
    
    if (!yearBuiltInput || !actualAgeInput) return;
    
    const yearBuilt = parseInt(yearBuiltInput.value);
    const currentYear = new Date().getFullYear();
    
    if (yearBuilt && yearBuilt > 1800 && yearBuilt <= currentYear) {
        const actualAge = currentYear - yearBuilt;
        actualAgeInput.value = actualAge;
        
        // If effective age is empty, suggest actual age as starting point
        const effectiveAgeInput = document.getElementById('effective_age');
        if (effectiveAgeInput && !effectiveAgeInput.value) {
            // Don't auto-fill, but update placeholder
            effectiveAgeInput.placeholder = `Suggest: ${actualAge}`;
        }
    } else {
        actualAgeInput.value = '';
    }
    
    calculateRemainingLife();
}

/**
 * Calculate remaining economic life and depreciation
 */
function calculateRemainingLife() {
    const effectiveAgeInput = document.getElementById('effective_age');
    const totalLifeInput = document.getElementById('total_economic_life');
    const remainingLifeInput = document.getElementById('remaining_economic_life');
    const depreciationDisplay = document.getElementById('depreciation_percent');
    
    if (!effectiveAgeInput || !totalLifeInput || !remainingLifeInput) return;
    
    const effectiveAge = parseFloat(effectiveAgeInput.value) || 0;
    const totalLife = parseFloat(totalLifeInput.value) || 50;
    
    if (effectiveAge >= 0 && totalLife > 0) {
        const remaining = Math.max(0, totalLife - effectiveAge);
        remainingLifeInput.value = remaining;
        
        // Calculate and display depreciation
        const depreciation = Math.min(100, Math.round((effectiveAge / totalLife) * 100));
        if (depreciationDisplay) {
            depreciationDisplay.textContent = `${depreciation}%`;
        }
    } else {
        remainingLifeInput.value = '';
        if (depreciationDisplay) {
            depreciationDisplay.textContent = '—%';
        }
    }
}

/**
 * Toggle the inline age calculator panel
 */
function toggleAgeCalculator() {
    const panel = document.getElementById('age-calculator-panel');
    const chevron = document.getElementById('calc-chevron');
    
    if (panel) {
        panel.classList.toggle('hidden');
        
        // Rotate chevron
        if (chevron) {
            chevron.style.transform = panel.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        }
        
        // If opening, pre-populate with actual age
        if (!panel.classList.contains('hidden')) {
            const actualAge = parseInt(document.getElementById('actual_age')?.value) || 0;
            if (actualAge > 0) {
                ageCalcState.actualAge = actualAge;
            }
            // Smooth scroll to make sure calculator is visible
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

/**
 * Handle calculator option selection
 */
function selectCalcOption(button) {
    const field = button.dataset.field;
    const value = button.dataset.value;
    
    // Deselect siblings
    const siblings = button.parentElement.querySelectorAll('.calc-option');
    siblings.forEach(sib => sib.classList.remove('selected', 'border-harken-accent', 'bg-harken-accent/10'));
    
    // Select this option
    button.classList.add('selected', 'border-harken-accent', 'bg-harken-accent/10');
    
    // Update state based on field
    switch (field) {
        case 'quality':
            ageCalcState.quality = value;
            ageCalcState.economicLife = parseInt(button.dataset.life);
            break;
        case 'condition':
            ageCalcState.condition = value;
            ageCalcState.conditionAdjustment = parseFloat(button.dataset.adjustment);
            break;
        case 'remodel':
            ageCalcState.remodel = value;
            ageCalcState.remodelAdjustment = parseFloat(button.dataset.adjustment);
            break;
    }
    
    // Recalculate
    updateCalculatorResults();
}

/**
 * Update calculator results based on selections
 */
function updateCalculatorResults() {
    const actualAge = ageCalcState.actualAge || parseInt(document.getElementById('actual_age')?.value) || 0;
    const economicLifeDisplay = document.getElementById('calc_economic_life');
    const effectiveAgeDisplay = document.getElementById('calc_effective_age');
    const depreciationDisplay = document.getElementById('calc_depreciation');
    
    if (!economicLifeDisplay || !effectiveAgeDisplay || !depreciationDisplay) return;
    
    // Calculate suggested economic life
    let suggestedLife = ageCalcState.economicLife || 50;
    economicLifeDisplay.textContent = suggestedLife;
    
    // Calculate effective age with adjustments
    // Start with actual age, then adjust based on condition and remodeling
    let effectiveAge = actualAge;
    
    // Apply condition adjustment (percentage of actual age)
    effectiveAge = effectiveAge * (1 + ageCalcState.conditionAdjustment);
    
    // Apply remodel adjustment (percentage of actual age)
    effectiveAge = effectiveAge * (1 + ageCalcState.remodelAdjustment);
    
    // Round and ensure minimum of 0
    effectiveAge = Math.max(0, Math.round(effectiveAge));
    
    // Ensure effective age doesn't exceed economic life
    effectiveAge = Math.min(effectiveAge, suggestedLife);
    
    effectiveAgeDisplay.textContent = effectiveAge;
    
    // Calculate depreciation
    if (suggestedLife > 0) {
        const depreciation = Math.round((effectiveAge / suggestedLife) * 100);
        depreciationDisplay.textContent = `${depreciation}%`;
    } else {
        depreciationDisplay.textContent = '—';
    }
}

/**
 * Apply calculated values to the form
 */
function applyCalculatedValues() {
    const calcEffectiveAge = document.getElementById('calc_effective_age')?.textContent;
    const calcEconomicLife = document.getElementById('calc_economic_life')?.textContent;
    
    if (calcEffectiveAge && calcEffectiveAge !== '—') {
        const effectiveAgeInput = document.getElementById('effective_age');
        if (effectiveAgeInput) {
            effectiveAgeInput.value = calcEffectiveAge;
        }
    }
    
    if (calcEconomicLife && calcEconomicLife !== '—') {
        const economicLifeInput = document.getElementById('total_economic_life');
        if (economicLifeInput) {
            economicLifeInput.value = calcEconomicLife;
        }
    }
    
    // Recalculate remaining life
    calculateRemainingLife();
    
    // Close modal
    toggleAgeCalculator();
}

// =================================================================
// BUILDING HEIGHTS FUNCTIONS
// =================================================================

/**
 * Building heights state
 */
const buildingHeightsState = {
    eaveHeight: null,
    clearHeight: null,
    ridgeHeight: null,
    configuration: null,
    presetApplyMode: 'active', // 'active' | 'all'
    activeZoneIndex: 0,
    /** @type {{label: string, clearHeight: number|null, eaveHeight: number|null, ridgeHeight: number|null}[]} */
    heightZones: []
};

function __parseNullableNumber(value) {
    const v = typeof value === 'string' ? value.trim() : '';
    if (!v) return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
}

function __ensureDefaultZoneIfNeeded() {
    if (buildingHeightsState.configuration !== 'variable') return;
    if (Array.isArray(buildingHeightsState.heightZones) && buildingHeightsState.heightZones.length > 0) return;
    buildingHeightsState.heightZones = [
        { label: 'Main Area', clearHeight: null, eaveHeight: null, ridgeHeight: null }
    ];
}

function renderHeightZones() {
    const tbody = document.getElementById('height_zones_rows');
    const summary = document.getElementById('height_zones_summary');
    if (!tbody) return;

    __ensureDefaultZoneIfNeeded();

    tbody.innerHTML = (buildingHeightsState.heightZones || []).map((z, i) => {
        const label = z.label ?? '';
        const clear = z.clearHeight ?? '';
        const eave = z.eaveHeight ?? '';
        const ridge = z.ridgeHeight ?? '';
        const isActive = (buildingHeightsState.activeZoneIndex ?? 0) === i;
        return `
            <tr class="${isActive ? 'bg-harken-accent/5' : ''}">
                <td class="px-4 py-2">
                    <input type="text"
                           class="form-input w-full bg-white"
                           placeholder="e.g., Warehouse"
                           value="${String(label).replace(/"/g, '&quot;')}"
                           onfocus="setActiveHeightZone(${i})"
                           oninput="updateHeightZoneField(${i}, 'label', this.value)">
                </td>
                <td class="px-4 py-2">
                    <input type="number"
                           class="form-input w-full bg-white"
                           placeholder="22"
                           min="0"
                           step="0.5"
                           value="${clear}"
                           onfocus="setActiveHeightZone(${i})"
                           oninput="updateHeightZoneField(${i}, 'clearHeight', this.value)">
                </td>
                <td class="px-4 py-2">
                    <input type="number"
                           class="form-input w-full bg-white"
                           placeholder="24"
                           min="0"
                           step="0.5"
                           value="${eave}"
                           onfocus="setActiveHeightZone(${i})"
                           oninput="updateHeightZoneField(${i}, 'eaveHeight', this.value)">
                </td>
                <td class="px-4 py-2">
                    <input type="number"
                           class="form-input w-full bg-white"
                           placeholder="32"
                           min="0"
                           step="0.5"
                           value="${ridge}"
                           onfocus="setActiveHeightZone(${i})"
                           oninput="updateHeightZoneField(${i}, 'ridgeHeight', this.value)">
                </td>
                <td class="px-4 py-2 text-right">
                    <button type="button"
                            class="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                            title="Remove zone"
                            onclick="removeHeightZone(${i})">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-3H10a1 1 0 00-1 1v2h8V5a1 1 0 00-1-1z"></path>
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Summary text: clear height range if available
    if (summary) {
        const clears = (buildingHeightsState.heightZones || [])
            .map(z => z.clearHeight)
            .filter(v => typeof v === 'number' && Number.isFinite(v));
        if (clears.length) {
            const min = Math.min(...clears);
            const max = Math.max(...clears);
            summary.textContent = min === max
                ? `Clear height: ${min} ft (all zones)`
                : `Clear height range: ${min}–${max} ft across zones`;
        } else {
            summary.textContent = 'Tip: enter clear height for each zone; the tool will summarize the range.';
        }
    }
}

function updateBuildingHeightsUI() {
    const single = document.getElementById('single_height_fields');
    const zones = document.getElementById('variable_height_zones');
    if (!single || !zones) return;

    const isVariable = buildingHeightsState.configuration === 'variable';
    single.classList.toggle('hidden', isVariable);
    zones.classList.toggle('hidden', !isVariable);

    if (isVariable) {
        renderHeightZones();
        const controls = document.getElementById('preset_apply_controls');
        const tip = document.getElementById('preset_variable_tip');
        if (controls) controls.classList.remove('hidden');
        if (tip) tip.classList.remove('hidden');
        setPresetApplyMode(buildingHeightsState.presetApplyMode || 'active');
    } else {
        const controls = document.getElementById('preset_apply_controls');
        const tip = document.getElementById('preset_variable_tip');
        if (controls) controls.classList.add('hidden');
        if (tip) tip.classList.add('hidden');
    }
}

function setActiveHeightZone(index) {
    buildingHeightsState.activeZoneIndex = index;
    // Re-render to show row highlight (very subtle)
    renderHeightZones();
}

function setPresetApplyMode(mode) {
    buildingHeightsState.presetApplyMode = mode === 'all' ? 'all' : 'active';
    // Also update the small UI indicator if present
    const activeBtn = document.getElementById('preset_apply_active');
    const allBtn = document.getElementById('preset_apply_all');
    if (activeBtn && allBtn) {
        const setOn = (btn) => {
            btn.classList.remove('border-gray-200', 'bg-white', 'text-gray-700');
            btn.classList.add('border-harken-accent', 'bg-harken-accent/5', 'text-harken-accent');
        };
        const setOff = (btn) => {
            btn.classList.remove('border-harken-accent', 'bg-harken-accent/5', 'text-harken-accent');
            btn.classList.add('border-gray-200', 'bg-white', 'text-gray-700');
        };
        if (buildingHeightsState.presetApplyMode === 'all') {
            setOn(allBtn);
            setOff(activeBtn);
        } else {
            setOn(activeBtn);
            setOff(allBtn);
        }
    }
}

function addHeightZone() {
    buildingHeightsState.heightZones = buildingHeightsState.heightZones || [];
    const next = buildingHeightsState.heightZones.length + 1;
    buildingHeightsState.heightZones.push({
        label: `Zone ${next}`,
        clearHeight: null,
        eaveHeight: null,
        ridgeHeight: null
    });
    buildingHeightsState.activeZoneIndex = buildingHeightsState.heightZones.length - 1;
    updateBuildingHeights();
    renderHeightZones();
}

function removeHeightZone(index) {
    buildingHeightsState.heightZones = buildingHeightsState.heightZones || [];
    buildingHeightsState.heightZones.splice(index, 1);
    if ((buildingHeightsState.activeZoneIndex ?? 0) >= buildingHeightsState.heightZones.length) {
        buildingHeightsState.activeZoneIndex = Math.max(0, buildingHeightsState.heightZones.length - 1);
    }
    if (!buildingHeightsState.heightZones.length && buildingHeightsState.configuration === 'variable') {
        __ensureDefaultZoneIfNeeded();
    }
    updateBuildingHeights();
    renderHeightZones();
}

function updateHeightZoneField(index, field, value) {
    buildingHeightsState.heightZones = buildingHeightsState.heightZones || [];
    const zone = buildingHeightsState.heightZones[index];
    if (!zone) return;
    if (field === 'label') {
        zone.label = String(value || '').slice(0, 60);
    } else {
        zone[field] = __parseNullableNumber(String(value ?? ''));
    }
    updateBuildingHeights();
    renderHeightZones();
}

/**
 * Update building heights and validate
 */
function updateBuildingHeights() {
    // Variable heights: derive summary from zones; don't rely on single-field inputs.
    if (buildingHeightsState.configuration === 'variable') {
        __ensureDefaultZoneIfNeeded();
        buildingHeightsState.eaveHeight = null;
        buildingHeightsState.clearHeight = null;
        buildingHeightsState.ridgeHeight = null;

        // Update WizardState if available
        if (typeof WizardState !== 'undefined') {
            WizardState.subjectData = WizardState.subjectData || {};
            WizardState.subjectData.buildingHeights = buildingHeightsState;
        }
        return;
    }

    const eave = parseFloat(document.getElementById('eave_height')?.value) || 0;
    const clear = parseFloat(document.getElementById('clear_height')?.value) || 0;
    const ridge = parseFloat(document.getElementById('ridge_height')?.value) || 0;
    
    // Store in state
    buildingHeightsState.eaveHeight = eave || null;
    buildingHeightsState.clearHeight = clear || null;
    buildingHeightsState.ridgeHeight = ridge || null;
    
    // Validation: Clear height should be less than or equal to eave height
    const clearInput = document.getElementById('clear_height');
    if (clear > eave && eave > 0) {
        clearInput?.classList.add('border-amber-400');
    } else {
        clearInput?.classList.remove('border-amber-400');
    }
    
    // Update WizardState if available
    if (typeof WizardState !== 'undefined') {
        WizardState.subjectData = WizardState.subjectData || {};
        WizardState.subjectData.buildingHeights = buildingHeightsState;
    }
}

/**
 * Select building configuration
 * @param {HTMLElement} button - The clicked button
 */
function selectBuildingConfig(button) {
    const config = button.dataset.config;
    
    // Remove selected state from all buttons
    document.querySelectorAll('.height-config-btn').forEach(btn => {
        btn.classList.remove('border-harken-accent', 'bg-harken-accent/5', 'text-harken-accent');
        btn.classList.add('border-gray-200', 'bg-white', 'text-gray-700');
    });
    
    // Add selected state to clicked button
    button.classList.remove('border-gray-200', 'bg-white', 'text-gray-700');
    button.classList.add('border-harken-accent', 'bg-harken-accent/5', 'text-harken-accent');
    
    // Store in state
    buildingHeightsState.configuration = config;

    // If switching away from variable, keep zones but show single inputs again.
    updateBuildingHeightsUI();
    
    // Update WizardState if available
    if (typeof WizardState !== 'undefined') {
        WizardState.subjectData = WizardState.subjectData || {};
        WizardState.subjectData.buildingHeights = buildingHeightsState;
    }
}

/**
 * Apply height preset values
 * @param {number} eave - Eave height in feet
 * @param {number} clear - Clear height in feet
 * @param {number} ridge - Ridge height in feet
 */
function applyHeightPreset(eave, clear, ridge) {
    // If variable heights, apply to the first zone (or create one).
    if (buildingHeightsState.configuration === 'variable') {
        __ensureDefaultZoneIfNeeded();
        const zones = buildingHeightsState.heightZones || [];
        const applyAll = buildingHeightsState.presetApplyMode === 'all';
        const idx = Math.min(Math.max(0, buildingHeightsState.activeZoneIndex ?? 0), zones.length - 1);

        if (applyAll) {
            zones.forEach(z => {
                z.eaveHeight = eave;
                z.clearHeight = clear;
                z.ridgeHeight = ridge;
            });
        } else {
            const z = zones[idx];
            if (z) {
                z.eaveHeight = eave;
                z.clearHeight = clear;
                z.ridgeHeight = ridge;
            }
        }

        updateBuildingHeights();
        renderHeightZones();
        return;
    }

    const eaveInput = document.getElementById('eave_height');
    const clearInput = document.getElementById('clear_height');
    const ridgeInput = document.getElementById('ridge_height');
    
    if (eaveInput) eaveInput.value = eave;
    if (clearInput) clearInput.value = clear;
    if (ridgeInput) ridgeInput.value = ridge;
    
    // Trigger update
    updateBuildingHeights();
    
    // Visual feedback
    [eaveInput, clearInput, ridgeInput].forEach(input => {
        if (input) {
            input.classList.add('ring-2', 'ring-harken-accent/30');
            setTimeout(() => {
                input.classList.remove('ring-2', 'ring-harken-accent/30');
            }, 500);
        }
    });
}

// Make functions globally accessible
window.calculateAges = calculateAges;
window.calculateRemainingLife = calculateRemainingLife;
window.toggleAgeCalculator = toggleAgeCalculator;
window.selectCalcOption = selectCalcOption;
window.updateCalculatorResults = updateCalculatorResults;
window.applyCalculatedValues = applyCalculatedValues;
window.updateBuildingHeights = updateBuildingHeights;
window.selectBuildingConfig = selectBuildingConfig;
window.applyHeightPreset = applyHeightPreset;
window.addHeightZone = addHeightZone;
window.removeHeightZone = removeHeightZone;
window.updateHeightZoneField = updateHeightZoneField;
window.renderHeightZones = renderHeightZones;
window.updateBuildingHeightsUI = updateBuildingHeightsUI;
window.setActiveHeightZone = setActiveHeightZone;
window.setPresetApplyMode = setPresetApplyMode;

// Initialize
window.addEventListener('DOMContentLoaded', function() {
    const storedTab = (typeof WizardState !== 'undefined' && typeof WizardState.getSubjectActiveTab === 'function')
        ? WizardState.getSubjectActiveTab()
        : null;
    switchTab(storedTab || 'location');
    // Default building config UI state
    setTimeout(() => {
        updateBuildingHeightsUI();
    }, 0);
});

// =================================================================
// REPORT PRIMARY PHOTO SLOTS (prototype)
// =================================================================

function __ensureReportPhotosState() {
    if (typeof WizardState === 'undefined') return null;
    WizardState.subjectData = WizardState.subjectData || {};
    WizardState.subjectData.reportPhotos = WizardState.subjectData.reportPhotos || {};
    return WizardState.subjectData.reportPhotos;
}

function handleReportPhotoSlotUpload(slotId, file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const dataUrl = String(reader.result || '');
        const store = __ensureReportPhotosState();
        if (store) {
            store[slotId] = { fileName: file.name, dataUrl };
        }

        // Update DOM immediately (no full rerender)
        const empty = document.getElementById(`rps-empty-${slotId}`);
        const filled = document.getElementById(`rps-filled-${slotId}`);
        const img = document.getElementById(`rps-img-${slotId}`);
        const fn = document.getElementById(`rps-fn-${slotId}`);
        if (img) img.src = dataUrl;
        if (fn) fn.textContent = file.name;
        if (empty) empty.classList.add('hidden');
        if (filled) filled.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function clearReportPhotoSlot(slotId) {
    const store = __ensureReportPhotosState();
    if (store && store[slotId]) delete store[slotId];

    const empty = document.getElementById(`rps-empty-${slotId}`);
    const filled = document.getElementById(`rps-filled-${slotId}`);
    const img = document.getElementById(`rps-img-${slotId}`);
    const fn = document.getElementById(`rps-fn-${slotId}`);
    if (img) img.src = '';
    if (fn) fn.textContent = '';
    if (filled) filled.classList.add('hidden');
    if (empty) empty.classList.remove('hidden');
}










