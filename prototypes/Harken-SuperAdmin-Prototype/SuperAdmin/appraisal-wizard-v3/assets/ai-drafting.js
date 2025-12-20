/**
 * AI Drafting Component for Appraisal Wizard
 * React-Ready: Maps to AITextArea.tsx component
 * 
 * @fileoverview Provides AI-assisted text generation for textarea fields
 * using GPT-4o through the backend API.
 */

// =================================================================
// TYPE DEFINITIONS (TypeScript-Ready)
// =================================================================

/**
 * @typedef {Object} AIFieldConfig
 * @property {string} id - Unique identifier for the field
 * @property {string} section - Section identifier (e.g., 'hbu_analysis', 'area_description')
 * @property {string} label - Human-readable label
 * @property {string} [placeholder] - Placeholder text
 * @property {number} [rows] - Number of rows for textarea
 * @property {boolean} [required] - Whether field is required
 */

/**
 * @typedef {Object} AIGenerationContext
 * @property {string} propertyType - Type of property being appraised
 * @property {string} propertySubtype - Subtype of property
 * @property {Object} siteData - Site characteristics data
 * @property {Object} improvementData - Building/improvement data
 * @property {Object} marketData - Market analysis data
 * @property {Array} scenarios - Valuation scenarios
 */

/**
 * @typedef {Object} AIGenerationRequest
 * @property {string} section - Section identifier
 * @property {AIGenerationContext} context - Context data for generation
 * @property {string} [existingText] - Existing text for refinement
 * @property {string} [instruction] - Additional instruction for AI
 */

/**
 * @typedef {Object} AIGenerationResponse
 * @property {boolean} success - Whether generation was successful
 * @property {string} [content] - Generated content
 * @property {string} [error] - Error message if failed
 */

// =================================================================
// STATE (becomes useState in React)
// =================================================================

/**
 * @type {Map<string, {isLoading: boolean, previewContent: string|null, originalContent: string}>}
 */
const aiFieldStates = new Map();

// =================================================================
// MOCK API (for prototype - replaced with real API in production)
// =================================================================

/**
 * Mock AI generation function for prototype testing
 * In production, this calls the actual backend API
 * 
 * @param {AIGenerationRequest} request 
 * @returns {Promise<AIGenerationResponse>}
 */
async function generateAIDraft(request) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Get mock content based on section
    const mockContent = getMockContent(request.section, request.context);
    
    return {
        success: true,
        content: mockContent
    };
}

/**
 * Get mock content for a section (prototype only)
 * @param {string} section 
 * @param {AIGenerationContext} context 
 * @returns {string}
 */
function getMockContent(section, context) {
    const propertyType = context?.propertyType || 'Commercial';
    const city = context?.siteData?.city || 'Billings';
    
    const mockResponses = {
        'area_description': `${city} is the largest city in Montana, serving as the regional economic hub for the Yellowstone Valley and surrounding areas. The metropolitan statistical area has experienced steady population growth of approximately 1.2% annually over the past decade. The local economy is diversified across healthcare, energy, agriculture, and retail sectors. The subject property is located in an established ${propertyType.toLowerCase()} corridor with good visibility and access to major transportation routes.`,
        
        'neighborhood_description': `The subject neighborhood is characterized by a mix of ${propertyType.toLowerCase()} and light industrial uses. Development in the immediate area is approximately 85% built-out with remaining parcels actively being developed. The area benefits from proximity to major arterials and interstate access. Land uses are compatible, and the neighborhood is considered stable to improving.`,
        
        'site_description': `The subject site is a regularly-shaped parcel suitable for its current use. The site is level at street grade with good drainage characteristics. All public utilities including water, sewer, electric, and natural gas are available. Access is provided via a paved public street with adequate traffic capacity. No adverse easements, encroachments, or environmental conditions were observed or disclosed.`,
        
        'hbu_analysis': `The highest and best use of the subject property as vacant is for development with a ${propertyType.toLowerCase()} use consistent with surrounding development and current zoning. This conclusion is supported by the legal permissibility under current zoning, physical suitability of the site, financial feasibility based on comparable development activity, and maximum productivity compared to alternative uses. As improved, the highest and best use is the continuation of the existing use, which represents a legal, physically possible, financially feasible, and maximally productive use of the property.`,
        
        'market_analysis': `The ${propertyType.toLowerCase()} market in the subject area is characterized by stable demand and limited new supply. Current vacancy rates are below long-term averages, indicating a healthy absorption rate. Rental rates have increased modestly over the past 12 months, reflecting positive market conditions. Market participants interviewed indicated continued investor interest in the area. Overall, market conditions are considered favorable for the subject property type.`,
        
        'reconciliation': `In reconciling the value indications from the approaches used, greatest weight is given to the Income Approach as it best reflects the investment decision-making process for this property type. The Sales Comparison Approach provides good support and is given secondary consideration. The Cost Approach is given least weight due to the difficulty in accurately measuring depreciation for properties of this age. Based on this analysis and the data presented in this report, the concluded value represents a reasonable and well-supported estimate of market value.`,
        
        'default': `The ${propertyType.toLowerCase()} property is located in a well-established area with good market fundamentals. Based on the analysis presented in this report, the property represents a sound investment opportunity consistent with market expectations for similar properties in the area.`
    };
    
    return mockResponses[section] || mockResponses['default'];
}

// =================================================================
// COMPONENT FUNCTIONS (become React component methods)
// =================================================================

/**
 * Initialize an AI-enabled textarea
 * @param {string} textareaId - ID of the textarea element
 * @param {AIFieldConfig} config - Configuration for the field
 */
function initAITextarea(textareaId, config) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) {
        console.warn(`AITextarea: Element with id "${textareaId}" not found`);
        return;
    }
    
    // Don't re-initialize if already done
    if (textarea.dataset.aiInitialized === 'true') return;
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-textarea-wrapper';
    wrapper.id = `ai-wrapper-${textareaId}`;
    
    // Insert wrapper
    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(textarea);
    
    // Add AI button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'ai-button-container';
    buttonContainer.innerHTML = `
        <button type="button" class="ai-generate-btn" onclick="handleAIGenerate('${textareaId}', '${config.section}')">
            <svg class="sparkle-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
            </svg>
            <span class="btn-text">AI Draft</span>
        </button>
    `;
    wrapper.appendChild(buttonContainer);
    
    // Add character count
    const charCount = document.createElement('div');
    charCount.className = 'ai-char-count';
    charCount.id = `char-count-${textareaId}`;
    charCount.textContent = `0 characters`;
    wrapper.appendChild(charCount);
    
    // Update character count on input
    textarea.addEventListener('input', () => {
        charCount.textContent = `${textarea.value.length} characters`;
    });
    
    // Initialize state
    aiFieldStates.set(textareaId, {
        isLoading: false,
        previewContent: null,
        originalContent: textarea.value
    });
    
    // Mark as initialized
    textarea.dataset.aiInitialized = 'true';
    textarea.dataset.aiSection = config.section;
}

/**
 * Handle AI generation button click
 * @param {string} textareaId - ID of the textarea
 * @param {string} section - Section identifier for context
 */
async function handleAIGenerate(textareaId, section) {
    const wrapper = document.getElementById(`ai-wrapper-${textareaId}`);
    const textarea = document.getElementById(textareaId);
    const button = wrapper.querySelector('.ai-generate-btn');
    const state = aiFieldStates.get(textareaId);
    
    if (!wrapper || !textarea || !button || !state) return;
    if (state.isLoading) return;
    
    // Save original content
    state.originalContent = textarea.value;
    state.isLoading = true;
    aiFieldStates.set(textareaId, state);
    
    // Update button to loading state
    button.classList.add('loading');
    button.querySelector('.btn-text').innerHTML = `
        <span class="loading-dots">
            <span></span><span></span><span></span>
        </span>
    `;
    
    try {
        // Gather context from WizardState
        const context = gatherGenerationContext();
        
        // Call AI generation
        const response = await generateAIDraft({
            section: section,
            context: context,
            existingText: state.originalContent
        });
        
        if (response.success && response.content) {
            // Show preview with accept/reject buttons
            showAIPreview(textareaId, response.content);
        } else {
            throw new Error(response.error || 'Generation failed');
        }
    } catch (error) {
        console.error('AI generation failed:', error);
        alert('AI generation failed. Please try again.');
    } finally {
        // Reset button state
        state.isLoading = false;
        aiFieldStates.set(textareaId, state);
        button.classList.remove('loading');
        button.querySelector('.btn-text').textContent = 'AI Draft';
    }
}

/**
 * Gather context data for AI generation
 * @returns {AIGenerationContext}
 */
function gatherGenerationContext() {
    // Get data from WizardState if available
    const wizardState = typeof WizardState !== 'undefined' ? WizardState : { get: () => null };
    
    return {
        propertyType: wizardState.get?.('propertyType') || 'Commercial',
        propertySubtype: wizardState.get?.('propertySubtype') || '',
        siteData: {
            city: 'Billings',
            state: 'Montana',
            zoning: 'I1 - Light Industrial',
            siteSize: '1.43 acres',
            utilities: 'All city services available'
        },
        improvementData: {
            buildingSize: '11,174 SF',
            yearBuilt: '2019',
            condition: 'Very Good'
        },
        marketData: {
            vacancyRate: '4.1%',
            marketTrend: 'Stable'
        },
        scenarios: wizardState.get?.('scenarios') || []
    };
}

/**
 * Show AI-generated preview with accept/reject buttons
 * @param {string} textareaId - ID of the textarea
 * @param {string} content - Generated content to preview
 */
function showAIPreview(textareaId, content) {
    const wrapper = document.getElementById(`ai-wrapper-${textareaId}`);
    const textarea = document.getElementById(textareaId);
    const state = aiFieldStates.get(textareaId);
    
    if (!wrapper || !textarea || !state) return;
    
    // Store preview content
    state.previewContent = content;
    aiFieldStates.set(textareaId, state);
    
    // Add preview class
    wrapper.classList.add('ai-preview');
    
    // Create preview overlay
    const previewOverlay = document.createElement('div');
    previewOverlay.className = 'ai-preview-overlay';
    previewOverlay.id = `preview-overlay-${textareaId}`;
    wrapper.appendChild(previewOverlay);
    
    // Create preview content
    const previewContent = document.createElement('div');
    previewContent.className = 'ai-draft-preview';
    previewContent.id = `preview-content-${textareaId}`;
    previewContent.textContent = content;
    wrapper.appendChild(previewContent);
    
    // Add AI label badge
    const labelBadge = document.createElement('div');
    labelBadge.className = 'ai-label-badge';
    labelBadge.innerHTML = `
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
        </svg>
        AI Generated
    `;
    labelBadge.id = `label-badge-${textareaId}`;
    wrapper.appendChild(labelBadge);
    
    // Create action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'ai-action-buttons';
    actionButtons.id = `action-buttons-${textareaId}`;
    actionButtons.innerHTML = `
        <button type="button" class="ai-regenerate-btn" onclick="handleAIRegenerate('${textareaId}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Regenerate
        </button>
        <button type="button" class="ai-reject-btn" onclick="handleAIReject('${textareaId}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Reject
        </button>
        <button type="button" class="ai-accept-btn" onclick="handleAIAccept('${textareaId}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Accept
        </button>
    `;
    wrapper.appendChild(actionButtons);
    
    // Hide original button container
    wrapper.querySelector('.ai-button-container').style.display = 'none';
}

/**
 * Handle accept button click
 * @param {string} textareaId 
 */
function handleAIAccept(textareaId) {
    const wrapper = document.getElementById(`ai-wrapper-${textareaId}`);
    const textarea = document.getElementById(textareaId);
    const state = aiFieldStates.get(textareaId);
    
    if (!wrapper || !textarea || !state) return;
    
    // Set textarea value to preview content
    textarea.value = state.previewContent;
    
    // Trigger input event for any listeners
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Clean up preview UI
    cleanupAIPreview(textareaId);
    
    // Add success animation
    wrapper.classList.add('ai-success');
    setTimeout(() => wrapper.classList.remove('ai-success'), 500);
    
    // Clear state
    state.previewContent = null;
    aiFieldStates.set(textareaId, state);
}

/**
 * Handle reject button click
 * @param {string} textareaId 
 */
function handleAIReject(textareaId) {
    const textarea = document.getElementById(textareaId);
    const state = aiFieldStates.get(textareaId);
    
    if (!textarea || !state) return;
    
    // Restore original content
    textarea.value = state.originalContent;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Clean up preview UI
    cleanupAIPreview(textareaId);
    
    // Clear state
    state.previewContent = null;
    aiFieldStates.set(textareaId, state);
}

/**
 * Handle regenerate button click
 * @param {string} textareaId 
 */
function handleAIRegenerate(textareaId) {
    const textarea = document.getElementById(textareaId);
    const section = textarea?.dataset?.aiSection;
    
    if (!section) return;
    
    // Clean up current preview
    cleanupAIPreview(textareaId);
    
    // Generate new content
    handleAIGenerate(textareaId, section);
}

/**
 * Clean up AI preview UI elements
 * @param {string} textareaId 
 */
function cleanupAIPreview(textareaId) {
    const wrapper = document.getElementById(`ai-wrapper-${textareaId}`);
    if (!wrapper) return;
    
    // Remove preview class
    wrapper.classList.remove('ai-preview');
    
    // Remove preview elements
    const elementsToRemove = [
        `preview-overlay-${textareaId}`,
        `preview-content-${textareaId}`,
        `label-badge-${textareaId}`,
        `action-buttons-${textareaId}`
    ];
    
    elementsToRemove.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
    
    // Show original button container
    const buttonContainer = wrapper.querySelector('.ai-button-container');
    if (buttonContainer) buttonContainer.style.display = 'flex';
}

/**
 * Initialize all textareas with data-ai-section attribute
 */
function initAllAITextareas() {
    const textareas = document.querySelectorAll('textarea[data-ai-section]');
    textareas.forEach(textarea => {
        if (textarea.id) {
            initAITextarea(textarea.id, {
                id: textarea.id,
                section: textarea.dataset.aiSection,
                label: textarea.dataset.label || ''
            });
        }
    });
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.AITextarea = {
        init: initAITextarea,
        initAll: initAllAITextareas,
        generate: handleAIGenerate,
        accept: handleAIAccept,
        reject: handleAIReject
    };
}

