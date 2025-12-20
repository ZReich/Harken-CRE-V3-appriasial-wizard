// Analysis Page Content and Logic

let currentTab = 'hbu';
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
    
    const renderHBUChecklist = (prefix, title) => {
        return `
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">${title}</h3>
                <div class="space-y-4 mb-6">
                    <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input type="checkbox" id="${prefix}_leg" class="focus:ring-harken-accent h-4 w-4 text-harken-accent border-gray-300 rounded" checked>
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="${prefix}_leg" class="font-medium text-gray-700">Legally Permissible</label>
                            <p class="text-gray-500">Conforms to zoning, building codes, and easements.</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input type="checkbox" id="${prefix}_phys" class="focus:ring-harken-accent h-4 w-4 text-harken-accent border-gray-300 rounded" checked>
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="${prefix}_phys" class="font-medium text-gray-700">Physically Possible</label>
                            <p class="text-gray-500">Site size, shape, terrain, and utility support the use.</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input type="checkbox" id="${prefix}_fin" class="focus:ring-harken-accent h-4 w-4 text-harken-accent border-gray-300 rounded" checked>
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="${prefix}_fin" class="font-medium text-gray-700">Financially Feasible</label>
                            <p class="text-gray-500">Income generation exceeds operating costs and debt service.</p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input type="checkbox" id="${prefix}_max" class="focus:ring-harken-accent h-4 w-4 text-harken-accent border-gray-300 rounded" checked>
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="${prefix}_max" class="font-medium text-gray-700">Maximally Productive</label>
                            <p class="text-gray-500">The use that produces the highest residual land value.</p>
                        </div>
                    </div>
                </div>
                ${renderField({ type: 'textarea', label: 'Analysis & Conclusion', id: `${prefix}_conc`, rows: 3, placeholder: 'Summarize your analysis of the four tests...' })}
            </div>
        `;
    };

    html += renderHBUChecklist('hbu_vac', 'Highest & Best Use - As Vacant');
    html += renderHBUChecklist('hbu_imp', 'Highest & Best Use - As Improved');
    html += `</div>`;
    return html;
}

function renderLand() {
    let html = `<div class="animate-fade-in space-y-6">`;
    
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
    html += renderField({ type: 'textarea', label: 'Reconciliation & Analysis', id: 'land_analysis', rows: 4, placeholder: 'Explain how you arrived at the land value conclusion. Discuss which comparables were given more weight and why, adjustments made, and any market trends affecting land values...' });
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
    
    html += `<div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">`;
    html += `<h3 class="text-lg font-semibold text-gray-900 mb-4">Market Analysis</h3>`;
    html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">`;
    html += renderField({ type: 'select', label: 'Market Cycle Stage', id: 'mkt_cycle', options: ['Recovery', 'Expansion', 'Hypersupply', 'Recession'] });
    html += renderField({ type: 'select', label: 'Supply & Demand', id: 'mkt_supply_demand', options: ['Shortage', 'In Balance', 'Over Supply'] });
    html += `</div>`;
    html += `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">`;
    html += renderField({ type: 'text', label: 'Marketing Time', id: 'mkt_time', placeholder: 'e.g. 6-12 Months' });
    html += renderField({ type: 'text', label: 'Vacancy Rate Trend', id: 'mkt_vacancy', placeholder: 'e.g. Stable at 5%' });
    html += renderField({ type: 'text', label: 'Rent Trend', id: 'mkt_rent', placeholder: 'e.g. Increasing 3%/yr' });
    html += `</div>`;
    html += renderField({ type: 'textarea', label: 'Market Area Description', id: 'mkt_desc', rows: 4, placeholder: 'Describe the market area boundaries and general characteristics...' });
    html += renderField({ type: 'textarea', label: 'Economic Trends', id: 'mkt_econ', rows: 4, placeholder: 'Discuss employment, population growth, and major economic drivers (e.g., WSJ articles, interest rates)...' });
    html += `</div>`;
    
    html += `</div>`;
    return html;
}

function renderSales() {
    return `
        <div class="space-y-6 animate-fade-in">
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
    
    let html = `<div class="sales-grid" style="grid-template-columns: 160px 180px repeat(${selectedComps.length}, 170px);">`;
    
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
    html += renderField({ type: 'textarea', label: 'Cap Rate Rationale', id: 'inc_cap_rat', rows: 3, placeholder: 'Justify selection based on comps...' });
    
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
    return `<div class="animate-fade-in space-y-6">
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
    switchTab('hbu');
});

