/* =================================================================
   ENHANCED TEXTAREA COMPONENT
   Features: Fullscreen, Rich Text, Spell Check, Snippets, AI
   React-Ready Architecture
   ================================================================= */

/**
 * @typedef {Object} EnhancedTextAreaOptions
 * @property {string} id - Unique identifier
 * @property {string} label - Field label
 * @property {boolean} required - Is field required
 * @property {string} placeholder - Placeholder text
 * @property {string} value - Initial value
 * @property {string} helperText - Helper text below field
 * @property {string} sectionContext - AI context for this field
 * @property {number} rows - Default row count
 * @property {boolean} richText - Enable rich text editing
 * @property {boolean} showWordCount - Show word/character count
 */

/**
 * @typedef {Object} Snippet
 * @property {string} id - Unique ID
 * @property {string} name - Snippet name
 * @property {string} content - Snippet content
 * @property {string} category - Snippet category
 */

// Snippet storage
const SnippetManager = {
    storageKey: 'harken_text_snippets',
    
    getAll: function() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    },
    
    save: function(snippet) {
        const snippets = this.getAll();
        snippet.id = 'snippet_' + Date.now();
        snippets.push(snippet);
        localStorage.setItem(this.storageKey, JSON.stringify(snippets));
        return snippet;
    },
    
    delete: function(id) {
        const snippets = this.getAll().filter(s => s.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(snippets));
    },
    
    getByCategory: function(category) {
        return this.getAll().filter(s => s.category === category);
    }
};

// AI Prompt Templates for different field contexts
const AIPromptTemplates = {
    'legal_description': {
        system: 'You are a professional real estate appraiser. Generate a properly formatted legal description based on the provided information.',
        prompt: 'Generate a professional legal description for a property. Use standard legal description format including lot, block, subdivision, section, township, and range as appropriate.'
    },
    'area_description': {
        system: 'You are a professional real estate appraiser writing market area descriptions for appraisal reports.',
        prompt: 'Write a professional general area description for an appraisal report. Include information about the city/county, economic base, population trends, major employers, and overall market conditions. 2-3 paragraphs.'
    },
    'neighborhood_boundaries': {
        system: 'You are a professional real estate appraiser defining neighborhood boundaries.',
        prompt: 'Write professional neighborhood boundary descriptions for an appraisal report. Define the North, South, East, and West boundaries using specific streets, landmarks, or geographic features.'
    },
    'neighborhood_characteristics': {
        system: 'You are a professional real estate appraiser describing neighborhood characteristics.',
        prompt: 'Write a detailed neighborhood characteristics description for an appraisal report. Include predominant land uses, development patterns, age and condition of properties, access/transportation, amenities, and any factors affecting value.'
    },
    'specific_location': {
        system: 'You are a professional real estate appraiser describing property location.',
        prompt: 'Write a specific location description for an appraisal report. Describe the property\'s exact location including street address relationship, proximity to major intersections, landmarks, and directional references.'
    },
    'site_notes': {
        system: 'You are a professional real estate appraiser writing site notes.',
        prompt: 'Write professional notes about site characteristics for an appraisal report. Include any special considerations about site allocation, phasing, or unique attributes.'
    },
    'zoning_description': {
        system: 'You are a professional real estate appraiser describing zoning classifications.',
        prompt: 'Write a detailed zoning description for an appraisal report. Include the zoning district, permitted uses, development standards (setbacks, height limits, FAR, lot coverage), and any overlay districts or special regulations.'
    },
    'utilities_description': {
        system: 'You are a professional real estate appraiser describing property utilities.',
        prompt: 'Write a professional utilities description for an appraisal report. Detail the availability and capacity of water, sewer, electric, gas, telecommunications, and any special utility considerations.'
    },
    'improvement_description': {
        system: 'You are a professional real estate appraiser describing property improvements.',
        prompt: 'Write a detailed improvement description for an appraisal report. Include construction type, quality, condition, layout, and notable features.'
    },
    'construction_details': {
        system: 'You are a professional real estate appraiser describing building construction.',
        prompt: 'Write a professional construction description for an appraisal report. Include structural system, foundation type, framing, exterior finish, roofing, and overall construction quality.'
    },
    'interior_description': {
        system: 'You are a professional real estate appraiser describing building interiors.',
        prompt: 'Write a professional interior finish description for an appraisal report. Include wall finishes, flooring types, ceiling treatments, lighting, and overall condition of interior components.'
    },
    'mechanical_systems': {
        system: 'You are a professional real estate appraiser describing mechanical systems.',
        prompt: 'Write a professional mechanical systems description for an appraisal report. Include HVAC systems, electrical capacity, plumbing fixtures, fire suppression, and any special mechanical equipment.'
    },
    'site_description': {
        system: 'You are a professional real estate appraiser describing property sites.',
        prompt: 'Write a professional site description for an appraisal report. Include size, shape, topography, utilities, access, and any environmental considerations.'
    },
    'flood_hazard': {
        system: 'You are a professional real estate appraiser describing flood hazard status.',
        prompt: 'Write a professional flood hazard description for an appraisal report. Include FEMA flood zone designation, community and panel numbers, and any flood insurance requirements or implications.'
    },
    'easements': {
        system: 'You are a professional real estate appraiser describing property easements.',
        prompt: 'Write a professional easement description for an appraisal report. Describe any utility easements, access easements, or other encumbrances, their location, and impact on the property.'
    },
    'environmental': {
        system: 'You are a professional real estate appraiser describing environmental factors.',
        prompt: 'Write a professional environmental factors description for an appraisal report. Include any known environmental considerations, Phase I findings, wetlands, or other environmental issues.'
    },
    'transaction_history': {
        system: 'You are a professional real estate appraiser documenting property transaction history.',
        prompt: 'Write a professional 3-year transaction history for an appraisal report. Document any sales, transfers, or listings of the subject property within the past three years per USPAP requirements.'
    },
    'hbu_analysis': {
        system: 'You are a professional real estate appraiser conducting highest and best use analysis.',
        prompt: 'Write a highest and best use analysis considering the four tests: legally permissible, physically possible, financially feasible, and maximally productive.'
    },
    'reconciliation': {
        system: 'You are a professional real estate appraiser writing value reconciliation narratives.',
        prompt: 'Write a professional reconciliation narrative explaining the weight given to each approach and the final value conclusion.'
    },
    'extraordinary_assumptions': {
        system: 'You are a professional real estate appraiser writing extraordinary assumptions per USPAP requirements.',
        prompt: 'Write professional extraordinary assumptions for an appraisal. These are assumptions made that if found to be false could alter the appraiser\'s opinions or conclusions.'
    },
    'hypothetical_conditions': {
        system: 'You are a professional real estate appraiser writing hypothetical conditions per USPAP requirements.',
        prompt: 'Write professional hypothetical conditions for an appraisal. These are conditions that are contrary to what exists but are used for analysis purposes.'
    },
    'limiting_conditions': {
        system: 'You are a professional real estate appraiser writing limiting conditions.',
        prompt: 'Write additional limiting conditions specific to this appraisal assignment.'
    },
    'exposure_time': {
        system: 'You are a professional real estate appraiser explaining exposure time estimates.',
        prompt: 'Write a professional exposure time rationale explaining the estimated marketing period for this property type in the current market.'
    },
    'market_analysis': {
        system: 'You are a professional real estate appraiser conducting market analysis.',
        prompt: 'Write a professional market area analysis for an appraisal report. Include supply/demand conditions, market trends, vacancy rates, rental rates, and economic factors affecting the property type.'
    },
    'cap_rate_rationale': {
        system: 'You are a professional real estate appraiser explaining capitalization rate selection.',
        prompt: 'Write a professional capitalization rate rationale for an appraisal report. Explain the sources of comparable rates, adjustments made, and justification for the selected rate.'
    },
    'default': {
        system: 'You are a professional real estate appraiser writing content for an appraisal report.',
        prompt: 'Write professional appraisal content for this section. Use appropriate industry terminology and maintain USPAP compliance.'
    }
};

/**
 * Render an enhanced textarea with all features
 * @param {EnhancedTextAreaOptions} options
 * @returns {string} HTML string
 */
function renderEnhancedTextArea(options) {
    const {
        id = 'eta_' + Math.random().toString(36).substr(2, 9),
        label = '',
        required = false,
        placeholder = '',
        value = '',
        helperText = '',
        sectionContext = 'default',
        rows = 4,
        richText = false,
        showWordCount = true
    } = options;

    const escapedValue = (value || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const minHeight = rows * 24;

    return `
        <div class="enhanced-textarea-container" id="container-${id}" data-section="${sectionContext}">
            <div class="eta-label-row">
                <label class="eta-label" for="${id}">
                    ${label}${required ? '<span class="required">*</span>' : ''}
                </label>
            </div>
            
            <div class="eta-toolbar">
                <div class="eta-toolbar-group">
                    <button type="button" class="eta-toolbar-btn" onclick="etaFormat('${id}', 'bold')" title="Bold (Ctrl+B)">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path></svg>
                    </button>
                    <button type="button" class="eta-toolbar-btn" onclick="etaFormat('${id}', 'italic')" title="Italic (Ctrl+I)">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4m-2 0v16m-4 0h4"></path></svg>
                    </button>
                    <button type="button" class="eta-toolbar-btn" onclick="etaFormat('${id}', 'underline')" title="Underline (Ctrl+U)">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3M4 21h16"></path></svg>
                    </button>
                </div>
                
                <div class="eta-toolbar-group">
                    <button type="button" class="eta-toolbar-btn" onclick="etaFormat('${id}', 'insertUnorderedList')" title="Bullet List">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <button type="button" class="eta-toolbar-btn" onclick="etaFormat('${id}', 'insertOrderedList')" title="Numbered List">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                </div>
                
                <div class="eta-toolbar-group">
                    <button type="button" class="eta-snippet-btn" onclick="etaToggleSnippets('${id}')" title="Insert Snippet">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        Snippets
                    </button>
                    <button type="button" class="eta-ai-btn" onclick="etaGenerateAI('${id}', '${sectionContext}')" id="ai-btn-${id}" title="Generate with AI">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2 2m-2-2v2m4 10l2 2m-2-2v2m-8-8v4m-2-2h4"></path></svg>
                        AI Draft
                    </button>
                </div>
                
                <div class="eta-toolbar-group">
                    <button type="button" class="eta-toolbar-btn eta-fullscreen-btn" onclick="etaToggleFullscreen('${id}')" title="Toggle Fullscreen">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                    </button>
                </div>
            </div>
            
            <div class="eta-editor" 
                 id="${id}" 
                 contenteditable="true" 
                 spellcheck="true"
                 data-placeholder="${placeholder}"
                 style="min-height: ${minHeight}px;"
                 oninput="etaUpdateCount('${id}')">${escapedValue}</div>
            
            ${showWordCount ? `<div class="eta-counter" id="counter-${id}">0 words</div>` : ''}
            
            ${helperText ? `
                <div class="eta-helper">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ${helperText}
                </div>
            ` : ''}
            
            <div class="eta-snippets-dropdown" id="snippets-${id}">
                <div class="eta-snippets-header">
                    <span class="eta-snippets-title">Text Snippets</span>
                    <button type="button" class="eta-add-snippet-btn" onclick="etaOpenAddSnippet('${id}')">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Snippet
                    </button>
                </div>
                <div id="snippets-list-${id}"></div>
            </div>
            
            <div id="ai-status-${id}"></div>
        </div>
    `;
}

/**
 * Format text in the editor
 */
function etaFormat(id, command) {
    document.execCommand(command, false, null);
    document.getElementById(id).focus();
}

/**
 * Toggle fullscreen mode
 */
function etaToggleFullscreen(id) {
    const container = document.getElementById(`container-${id}`);
    container.classList.toggle('fullscreen');
    
    const btn = container.querySelector('.eta-fullscreen-btn svg');
    if (container.classList.contains('fullscreen')) {
        btn.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
    } else {
        btn.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>';
    }
}

/**
 * Update word/character count
 */
function etaUpdateCount(id) {
    const editor = document.getElementById(id);
    const counter = document.getElementById(`counter-${id}`);
    if (!editor || !counter) return;
    
    const text = editor.innerText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    counter.textContent = `${words} words, ${chars} characters`;
}

/**
 * Toggle snippets dropdown
 */
function etaToggleSnippets(id) {
    const dropdown = document.getElementById(`snippets-${id}`);
    const isOpen = dropdown.classList.contains('open');
    
    // Close all dropdowns first
    document.querySelectorAll('.eta-snippets-dropdown.open').forEach(d => d.classList.remove('open'));
    
    if (!isOpen) {
        dropdown.classList.add('open');
        etaRenderSnippets(id);
    }
}

/**
 * Render snippets list
 */
function etaRenderSnippets(id) {
    const listContainer = document.getElementById(`snippets-list-${id}`);
    const snippets = SnippetManager.getAll();
    
    if (snippets.length === 0) {
        listContainer.innerHTML = '<div class="eta-no-snippets">No snippets saved yet. Click "Add Snippet" to create one.</div>';
        return;
    }
    
    listContainer.innerHTML = snippets.map(snippet => `
        <div class="eta-snippet-item" onclick="etaInsertSnippet('${id}', '${snippet.id}')">
            <div class="eta-snippet-name">${snippet.name}</div>
            <div class="eta-snippet-preview">${snippet.content.substring(0, 80)}${snippet.content.length > 80 ? '...' : ''}</div>
        </div>
    `).join('');
}

/**
 * Insert a snippet into the editor
 */
function etaInsertSnippet(editorId, snippetId) {
    const snippets = SnippetManager.getAll();
    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return;
    
    const editor = document.getElementById(editorId);
    editor.focus();
    document.execCommand('insertText', false, snippet.content);
    
    // Close dropdown
    document.getElementById(`snippets-${editorId}`).classList.remove('open');
    etaUpdateCount(editorId);
}

/**
 * Open add snippet modal
 */
function etaOpenAddSnippet(editorId) {
    const editor = document.getElementById(editorId);
    const selectedText = window.getSelection().toString() || editor.innerText.substring(0, 200);
    
    const modal = document.createElement('div');
    modal.className = 'eta-modal-overlay';
    modal.id = 'snippet-modal';
    modal.innerHTML = `
        <div class="eta-modal">
            <div class="eta-modal-header">
                <span class="eta-modal-title">Save as Snippet</span>
                <button type="button" class="eta-modal-close" onclick="etaCloseSnippetModal()">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="eta-modal-body">
                <div class="form-group mb-4">
                    <label class="form-label">Snippet Name *</label>
                    <input type="text" id="snippet-name" class="form-input" placeholder="e.g., Standard Site Description">
                </div>
                <div class="form-group mb-4">
                    <label class="form-label">Category</label>
                    <select id="snippet-category" class="form-select">
                        <option value="general">General</option>
                        <option value="legal">Legal Description</option>
                        <option value="site">Site Description</option>
                        <option value="improvements">Improvements</option>
                        <option value="market">Market Analysis</option>
                        <option value="hbu">Highest & Best Use</option>
                        <option value="reconciliation">Reconciliation</option>
                        <option value="assumptions">Assumptions & Conditions</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Content *</label>
                    <textarea id="snippet-content" class="form-textarea" rows="6" placeholder="Enter snippet content...">${selectedText}</textarea>
                </div>
            </div>
            <div class="eta-modal-footer">
                <button type="button" class="eta-modal-cancel" onclick="etaCloseSnippetModal()">Cancel</button>
                <button type="button" class="eta-modal-save" onclick="etaSaveSnippet('${editorId}')">Save Snippet</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('snippet-name').focus();
    
    // Close dropdown
    document.getElementById(`snippets-${editorId}`).classList.remove('open');
}

/**
 * Close snippet modal
 */
function etaCloseSnippetModal() {
    const modal = document.getElementById('snippet-modal');
    if (modal) modal.remove();
}

/**
 * Save snippet
 */
function etaSaveSnippet(editorId) {
    const name = document.getElementById('snippet-name').value.trim();
    const category = document.getElementById('snippet-category').value;
    const content = document.getElementById('snippet-content').value.trim();
    
    if (!name || !content) {
        alert('Please enter a name and content for the snippet.');
        return;
    }
    
    SnippetManager.save({ name, category, content });
    etaCloseSnippetModal();
    
    // Show success message
    const container = document.getElementById(`container-${editorId}`);
    const msg = document.createElement('div');
    msg.className = 'eta-ai-loading';
    msg.style.background = 'rgba(34, 197, 94, 0.1)';
    msg.style.color = '#16a34a';
    msg.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Snippet saved!';
    container.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
}

/**
 * Generate AI content
 */
async function etaGenerateAI(id, sectionContext) {
    const editor = document.getElementById(id);
    const aiBtn = document.getElementById(`ai-btn-${id}`);
    const statusContainer = document.getElementById(`ai-status-${id}`);
    
    // Get template
    const template = AIPromptTemplates[sectionContext] || AIPromptTemplates.default;
    
    // Show loading state
    aiBtn.disabled = true;
    aiBtn.innerHTML = '<span class="eta-ai-spinner"></span> Generating...';
    
    try {
        // Simulate API call (in production, this calls the backend)
        const currentContent = editor.innerText.trim();
        const draft = await simulateAIGeneration(sectionContext, currentContent);
        
        // Show preview
        statusContainer.innerHTML = `
            <div class="eta-ai-preview">
                <div class="eta-ai-preview-header">
                    <span class="eta-ai-preview-label">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2 2m-2-2v2m4 10l2 2m-2-2v2"></path></svg>
                        AI Generated Draft
                    </span>
                    <div class="eta-ai-preview-actions">
                        <button class="eta-ai-accept" onclick="etaAcceptAI('${id}')">Accept</button>
                        <button class="eta-ai-reject" onclick="etaRejectAI('${id}')">Reject</button>
                    </div>
                </div>
                <div class="eta-ai-preview-text">${draft}</div>
            </div>
        `;
    } catch (error) {
        statusContainer.innerHTML = `
            <div class="eta-ai-loading" style="background: rgba(239, 68, 68, 0.1); color: #dc2626;">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Failed to generate. Please try again.
            </div>
        `;
        setTimeout(() => statusContainer.innerHTML = '', 5000);
    } finally {
        aiBtn.disabled = false;
        aiBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2 2m-2-2v2m4 10l2 2m-2-2v2m-8-8v4m-2-2h4"></path></svg> AI Draft';
    }
}

/**
 * Simulate AI generation (replace with actual API call in production)
 */
async function simulateAIGeneration(context, currentContent) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const drafts = {
        'legal_description': 'Lot 12, Block 4, of CANYON CREEK INDUSTRIAL PARK, according to the plat thereof, filed in Plat Book 45, at Page 123, records of Yellowstone County, Montana, located in the Southeast Quarter of Section 15, Township 1 South, Range 26 East, Principal Meridian, Montana.',
        'area_description': 'The subject property is located in the Billings Heights area of Billings, Montana, an established commercial and industrial corridor along South 30th Street West. The immediate neighborhood is characterized by a mix of light industrial, warehouse, and commercial uses. The area benefits from excellent access to Interstate 90 and major arterial roads. The local economy is diverse, supported by agriculture, energy, healthcare, and manufacturing sectors. Population growth has remained steady, contributing to sustained demand for industrial real estate.',
        'improvement_description': 'The subject improvements consist of a single-story industrial warehouse building constructed in 2019. The building features a steel frame with metal panel exterior walls and a standing seam metal roof. The structure provides approximately 11,174 square feet of gross building area, including warehouse space with 24-foot clear heights, one grade-level overhead door, and approximately 1,500 square feet of finished office space. The improvements are in very good condition with minimal deferred maintenance.',
        'site_description': 'The subject site contains approximately 1.43 acres (62,291 square feet) of level, rectangular land. The site has approximately 200 feet of frontage along South 30th Street West with adequate ingress and egress. All public utilities including water, sewer, electricity, and natural gas are available and connected. The site is improved with asphalt paving for parking and truck maneuvering, providing approximately 25 marked parking spaces. Landscaping is minimal and functional, consistent with industrial use.',
        'hbu_analysis': 'Based on analysis of the four tests of highest and best use, the subject site as vacant would be developed with industrial/warehouse use. This conclusion is supported by: (1) Legal permissibility under the I1-Light Industrial zoning; (2) Physical possibility given the level topography, adequate size, and utility availability; (3) Financial feasibility based on current market demand for industrial space; and (4) Maximum productivity compared to alternative uses. As improved, the highest and best use is continuation of the existing industrial use, as the improvements contribute value above the land value alone.',
        'reconciliation': 'In reconciling the value indications, the Income Approach is given primary emphasis as it best reflects investor decision-making for income-producing properties. The Sales Comparison Approach provides good support and is given secondary weight due to available comparable transactions. The Cost Approach is given least weight due to challenges in accurately measuring depreciation. Based on this analysis, the concluded market value as of the effective date is $1,550,000.',
        'extraordinary_assumptions': 'The following extraordinary assumptions apply to this appraisal:\n\n1. It is assumed that the property is free of any environmental contamination that would affect value.\n2. It is assumed that the property complies with all applicable zoning and building code requirements.\n3. It is assumed that all mechanical and structural systems are in good working order.\n\nIf any of these assumptions are found to be incorrect, the value conclusion may require revision.',
        'hypothetical_conditions': 'No hypothetical conditions apply to this appraisal. The property is valued in its current "as is" condition as of the effective date.',
        'exposure_time': 'Based on analysis of comparable sales and discussions with market participants, a reasonable exposure time for the subject property is estimated at 6 to 12 months. This estimate considers the current market conditions, property type, price range, and typical marketing periods for similar industrial properties in the Billings market.',
        'default': 'This section contains professionally written appraisal content that follows USPAP guidelines and industry best practices. The content should be reviewed and modified as appropriate for the specific assignment.'
    };
    
    return drafts[context] || drafts.default;
}

/**
 * Accept AI draft
 */
function etaAcceptAI(id) {
    const statusContainer = document.getElementById(`ai-status-${id}`);
    const previewText = statusContainer.querySelector('.eta-ai-preview-text').innerText;
    const editor = document.getElementById(id);
    
    editor.innerHTML = previewText.replace(/\n/g, '<br>');
    statusContainer.innerHTML = '';
    etaUpdateCount(id);
}

/**
 * Reject AI draft
 */
function etaRejectAI(id) {
    document.getElementById(`ai-status-${id}`).innerHTML = '';
}

/**
 * Get editor content as plain text
 */
function etaGetContent(id) {
    const editor = document.getElementById(id);
    return editor ? editor.innerText : '';
}

/**
 * Get editor content as HTML
 */
function etaGetHTML(id) {
    const editor = document.getElementById(id);
    return editor ? editor.innerHTML : '';
}

/**
 * Set editor content
 */
function etaSetContent(id, content) {
    const editor = document.getElementById(id);
    if (editor) {
        editor.innerHTML = content;
        etaUpdateCount(id);
    }
}

// Close snippets dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.eta-snippets-dropdown') && !e.target.closest('.eta-snippet-btn')) {
        document.querySelectorAll('.eta-snippets-dropdown.open').forEach(d => d.classList.remove('open'));
    }
});

// Export functions for global access
window.renderEnhancedTextArea = renderEnhancedTextArea;
window.etaFormat = etaFormat;
window.etaToggleFullscreen = etaToggleFullscreen;
window.etaUpdateCount = etaUpdateCount;
window.etaToggleSnippets = etaToggleSnippets;
window.etaInsertSnippet = etaInsertSnippet;
window.etaOpenAddSnippet = etaOpenAddSnippet;
window.etaCloseSnippetModal = etaCloseSnippetModal;
window.etaSaveSnippet = etaSaveSnippet;
window.etaGenerateAI = etaGenerateAI;
window.etaAcceptAI = etaAcceptAI;
window.etaRejectAI = etaRejectAI;
window.etaGetContent = etaGetContent;
window.etaGetHTML = etaGetHTML;
window.etaSetContent = etaSetContent;
window.SnippetManager = SnippetManager;

