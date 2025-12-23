// Subject Data Page Content and Logic

let currentTab = 'location';
let currentHelpMode = 'guidance';

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
                ${renderField({
                    type: 'textarea',
                    label: 'Area Description',
                    rows: 4,
                    placeholder: 'Describe the general area, economic conditions, population trends...'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Neighborhood Analysis</h3>
                ${renderField({
                    type: 'textarea',
                    label: 'Neighborhood Boundaries',
                    rows: 3,
                    placeholder: 'Define the neighborhood boundaries (North, South, East, West)...'
                })}
                ${renderField({
                    type: 'textarea',
                    label: 'Neighborhood Characteristics',
                    rows: 4,
                    placeholder: 'Describe land uses, development patterns, access, amenities...'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Location Description</h3>
                ${renderField({
                    type: 'textarea',
                    label: 'Specific Location',
                    rows: 3,
                    required: true,
                    placeholder: 'e.g., Located along the west side of South 30th Street West, approximately 265\' south of Gabel Road...'
                })}
            </div>
        </div>
    `;
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
                ${renderField({
                    type: 'select',
                    label: 'Shape',
                    options: ['Rectangular', 'Approximately Rectangular', 'Irregular', 'Triangular', 'Square', 'Other']
                })}
                ${renderField({type: 'text', label: 'Frontage', placeholder: 'e.g., 475\' along South 30th Street West'})}
                ${renderField({
                    type: 'textarea',
                    label: 'Note to Reader',
                    rows: 2,
                    placeholder: 'Any special notes about site allocation, phasing, etc.'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Zoning & Land Use</h3>
                ${renderField({type: 'text', label: 'Zoning Classification', required: true, placeholder: 'e.g., I1 - Light Industrial'})}
                ${renderField({
                    type: 'textarea',
                    label: 'Zoning Description',
                    rows: 4,
                    placeholder: 'Describe the zoning district, permitted uses, setbacks, height limits...'
                })}
                ${renderField({type: 'checkbox', label: 'Current use is permitted under zoning'})}
            </div>

            <div class="card">
                <h3 class="card-header">Utilities & Services</h3>
                ${renderField({
                    type: 'select',
                    label: 'Utilities Status',
                    options: ['All city services available', 'All city services to be extended', 'Partial utilities', 'Well & Septic', 'Other']
                })}
                ${renderField({
                    type: 'textarea',
                    label: 'Utilities Description',
                    rows: 2,
                    placeholder: 'Detail water, sewer, electric, gas availability...'
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Site Characteristics</h3>
                ${renderField({
                    type: 'select',
                    label: 'Topography',
                    options: ['Level at street grade', 'Gently sloping', 'Moderately sloping', 'Steeply sloping', 'Rolling', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Access',
                    options: ['Paved public road', 'Paved private road', 'Gravel road', 'Dirt road', 'Easement', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Flood Hazard',
                    options: ['Not in flood hazard area', 'In identified flood hazard area', 'Flood fringe', 'Floodway', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Easements',
                    options: ['No adverse easements', 'Utility easements (non-adverse)', 'Access easement', 'Other easements present']
                })}
            </div>
        </div>
    `;
}

function renderImprovements() {
    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="card">
                <h3 class="card-header">General Building Information</h3>
                ${renderField({type: 'text', label: 'Property Name', placeholder: 'e.g., Canyon Creek Industrial Complex - Phase 1'})}
                ${renderField({type: 'number', label: 'Number of Buildings', required: true, min: 1, defaultValue: '1'})}
                ${renderField({type: 'number', label: 'Total Square Footage', required: true, placeholder: '0'})}
                ${renderField({type: 'number', label: 'Year Built', required: true, min: 1800, max: 2050})}
                ${renderField({type: 'text', label: 'Year Remodeled', placeholder: 'N/A or year'})}
            </div>

            <div class="card">
                <h3 class="card-header">Construction Details</h3>
                ${renderField({
                    type: 'select',
                    label: 'Construction Type',
                    required: true,
                    options: ['Pre-engineered steel', 'Wood Frame', 'Masonry', 'Concrete Tilt-Up', 'Steel Frame', 'Mixed', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Construction Quality',
                    options: ['Excellent', 'Very Good', 'Good', 'Average', 'Fair', 'Poor']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Condition',
                    required: true,
                    options: ['New', 'Like New', 'Very Good', 'Good', 'Average', 'Fair', 'Poor']
                })}
                ${renderField({type: 'text', label: 'Sidewall Height', placeholder: 'e.g., 16\' - 21.5\''})}
            </div>

            <div class="card">
                <h3 class="card-header">Exterior Features</h3>
                ${renderField({
                    type: 'select',
                    label: 'Foundation/Floor',
                    options: ['Concrete monolithic slab on grade', 'Concrete spread footings', 'Pier & beam', 'Basement', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Roof',
                    options: ['Metal', 'TPO Membrane', 'EPDM Membrane', 'Standing Seam Metal', 'Asphalt Shingles', 'Tar and Gravel', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Exterior Walls',
                    options: ['Steel siding', 'Brick', 'Stucco', 'Wood Siding', 'Concrete', 'EIFS', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Windows',
                    options: ['Vinyl framed', 'Metal framed', 'Wood framed', 'Aluminum', 'None', 'Other']
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Interior Features</h3>
                ${renderField({
                    type: 'select',
                    label: 'Ceilings',
                    options: ['Acoustic ceiling tiles', 'Painted drywall', 'Exposed structure', 'Metal liner panel', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Flooring',
                    options: ['Concrete', 'Sealed Concrete', 'Vinyl Plank', 'Carpet', 'Tile', 'Hardwood', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Walls',
                    options: ['Painted drywall', 'Metal liner panel', 'Plywood', 'Brick', 'Other']
                })}
            </div>

            <div class="card">
                <h3 class="card-header">Mechanical Systems</h3>
                ${renderField({
                    type: 'select',
                    label: 'Electrical',
                    options: ['Single Phase 200 Amp', 'Three Phase', 'Assumed Adequate', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Heating',
                    options: ['Suspended gas unit heaters', 'GFA', 'Radiant', 'Central Forced Air', 'Boiler', 'None', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Cooling',
                    options: ['Central AC', 'Evaporative', 'Mini-Split', 'None', 'Other']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Sprinkler System',
                    options: ['None', 'Fully Sprinkled', 'Partially Sprinkled', 'Dry System', 'Wet System']
                })}
                ${renderField({
                    type: 'select',
                    label: 'Elevators',
                    options: ['None', 'Passenger', 'Freight', 'Both']
                })}
            </div>
        </div>
    `;
}

function renderTax() {
    return `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div class="card">
                <h3 class="card-header">Property Tax Information</h3>
                ${renderField({type: 'number', label: 'Current Year Tax Amount', placeholder: '$0.00'})}
                ${renderField({type: 'number', label: 'Tax Year', placeholder: '2023'})}
                ${renderField({type: 'number', label: 'Assessed Value', placeholder: '$0.00'})}
                ${renderField({type: 'number', label: 'Mill Levy', placeholder: '0.000', step: '0.001'})}
            </div>

            <div class="card">
                <h3 class="card-header">Ownership History</h3>
                ${renderField({type: 'date', label: 'Date of Last Sale'})}
                ${renderField({type: 'currency', label: 'Last Sale Price'})}
                ${renderField({
                    type: 'textarea',
                    label: 'Transaction History (Last 3 Years)',
                    rows: 4,
                    placeholder: 'Document any sales or transfers in the last 3 years...'
                })}
            </div>
        </div>
    `;
}

function renderPhotos() {
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
                <h3 class="card-header">Property Photos</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div class="upload-slot">
                        <div class="upload-placeholder">
                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <p class="text-xs text-gray-500">Front View</p>
                            <button class="btn-upload">Upload</button>
                        </div>
                    </div>
                    <div class="upload-slot">
                        <div class="upload-placeholder">
                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <p class="text-xs text-gray-500">Rear View</p>
                            <button class="btn-upload">Upload</button>
                        </div>
                    </div>
                    <div class="upload-slot">
                        <div class="upload-placeholder">
                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <p class="text-xs text-gray-500">Street View</p>
                            <button class="btn-upload">Upload</button>
                        </div>
                    </div>
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

// Initialize
window.addEventListener('DOMContentLoaded', function() {
    switchTab('location');
});



















