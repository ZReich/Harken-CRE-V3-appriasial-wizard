/**
 * ===========================================
 * EXPANDABLE CHIP-STYLE SELECTOR COMPONENT
 * Based on amenities-with-subsections-prototype.html
 * React-ready architecture with state management
 * ===========================================
 */

// State storage for all expandable selectors
const ExpandableSelectorState = {
    values: {},
    customValues: {},
    expandedId: null, // Only one can be expanded at a time
    
    /**
     * Get the current value for a selector
     * @param {string} id - Selector ID
     * @returns {string|null} Current value
     */
    getValue(id) {
        return this.values[id] || null;
    },
    
    /**
     * Set the value for a selector
     * @param {string} id - Selector ID
     * @param {string} value - New value
     */
    setValue(id, value) {
        this.values[id] = value;
        // Persist to WizardState if available
        if (typeof WizardState !== 'undefined' && WizardState.dispatch) {
            WizardState.dispatch({ 
                type: 'SET_FIELD', 
                payload: { field: id, value: value } 
            });
        }
    },
    
    /**
     * Get custom value for a selector
     * @param {string} id - Selector ID
     * @returns {string|null} Custom value
     */
    getCustomValue(id) {
        return this.customValues[id] || null;
    },
    
    /**
     * Set custom value for a selector
     * @param {string} id - Selector ID
     * @param {string} value - Custom value
     */
    setCustomValue(id, value) {
        this.customValues[id] = value;
    }
};

// Make state globally accessible
window.ExpandableSelectorState = ExpandableSelectorState;

/**
 * Render an expandable chip-style selector
 * @param {Object} config - Configuration object
 * @param {string} config.id - Unique identifier
 * @param {string} config.label - Display label
 * @param {string[]} config.options - Array of option values
 * @param {boolean} [config.allowCustom=true] - Show "Type My Own" option
 * @param {string} [config.category='default'] - Category for color coding (site, structure, systems, interior, market, default)
 * @param {string} [config.value] - Current selected value
 * @param {boolean} [config.required=false] - Is this field required
 * @param {string} [config.placeholder] - Placeholder for custom input
 * @param {boolean} [config.compact=false] - Use compact styling
 * @returns {string} HTML string
 */
function renderExpandableSelector(config) {
    const {
        id,
        label,
        options = [],
        allowCustom = true,
        category = 'default',
        value = null,
        required = false,
        placeholder = 'Enter custom value...',
        compact = false
    } = config;
    
    // Store initial value
    if (value) {
        ExpandableSelectorState.setValue(id, value);
    }
    
    const currentValue = ExpandableSelectorState.getValue(id) || value;
    const isCustomValue = currentValue && !options.includes(currentValue) && currentValue !== 'Type My Own';
    const hasSelection = !!currentValue;
    
    // Truncate display value if too long
    let displayValue = currentValue;
    if (displayValue && displayValue.length > 18) {
        displayValue = displayValue.substring(0, 15) + '...';
    }
    
    const compactClass = compact ? 'es-compact' : '';
    
    return `
        <div class="expandable-selector-group ${compactClass}" data-es-id="${id}">
            <div class="es-parent es-category-${category} ${hasSelection ? 'has-selection' : ''}" 
                 onclick="toggleExpandableSelector('${id}')"
                 role="button"
                 aria-expanded="false"
                 aria-controls="es-options-${id}">
                <span class="es-label">${label}${required ? '<span class="es-required">*</span>' : ''}</span>
                ${hasSelection ? `<span class="es-selected-value">${displayValue}</span>` : ''}
                <span class="es-expand-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </span>
            </div>
            <div class="es-suboptions" id="es-options-${id}">
                ${options.map(opt => `
                    <div class="es-suboption ${currentValue === opt ? 'selected' : ''}" 
                         data-value="${opt}"
                         onclick="selectExpandableOption('${id}', '${opt.replace(/'/g, "\\'")}', event)"
                         onmouseenter="this.style.backgroundColor='#dbeafe'; this.style.color='#1e40af'; this.style.fontWeight='600';"
                         onmouseleave="if(!this.classList.contains('selected')){this.style.backgroundColor=''; this.style.color=''; this.style.fontWeight='';}"
                         role="option"
                         aria-selected="${currentValue === opt}"
                         style="${currentValue === opt ? 'background-color:#dbeafe; color:#1e40af; font-weight:600;' : ''}">
                        ${opt}
                        <span class="es-check-icon" style="${currentValue === opt ? 'opacity:1;' : ''}">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color:#4db8d1;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </span>
                    </div>
                `).join('')}
                ${allowCustom ? `
                    <div class="es-suboption ${isCustomValue || currentValue === 'Type My Own' ? 'selected' : ''}" 
                         data-value="Type My Own"
                         onclick="selectExpandableOption('${id}', 'Type My Own', event)"
                         onmouseenter="this.style.backgroundColor='#dbeafe'; this.style.color='#1e40af'; this.style.fontWeight='600';"
                         onmouseleave="if(!this.classList.contains('selected')){this.style.backgroundColor=''; this.style.color=''; this.style.fontWeight='';}"
                         role="option"
                         style="${isCustomValue || currentValue === 'Type My Own' ? 'background-color:#dbeafe; color:#1e40af; font-weight:600;' : ''}">
                        Type My Own
                        <span class="es-check-icon" style="${isCustomValue || currentValue === 'Type My Own' ? 'opacity:1;' : ''}">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color:#4db8d1;">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </span>
                    </div>
                    <div class="es-custom-container ${isCustomValue || currentValue === 'Type My Own' ? 'visible' : ''}" id="es-custom-${id}">
                        <input type="text" 
                               class="es-custom-input" 
                               placeholder="${placeholder}"
                               value="${isCustomValue ? currentValue : ''}"
                               oninput="updateExpandableCustomValue('${id}', this.value)"
                               onclick="event.stopPropagation()">
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Make function globally accessible
window.renderExpandableSelector = renderExpandableSelector;

/**
 * Toggle expand/collapse for a selector
 * @param {string} id - Selector ID
 */
function toggleExpandableSelector(id) {
    const group = document.querySelector(`[data-es-id="${id}"]`);
    if (!group) return;
    
    const parent = group.querySelector('.es-parent');
    const options = group.querySelector('.es-suboptions');
    const wasExpanded = parent.classList.contains('expanded');
    
    // Close all other expanded selectors first
    closeAllExpandableSelectors();
    
    // Toggle current
    if (wasExpanded) {
        parent.classList.remove('expanded');
        parent.setAttribute('aria-expanded', 'false');
        options.classList.remove('expanded');
        ExpandableSelectorState.expandedId = null;
    } else {
        parent.classList.add('expanded');
        parent.setAttribute('aria-expanded', 'true');
        options.classList.add('expanded');
        ExpandableSelectorState.expandedId = id;
    }
}

// Make function globally accessible
window.toggleExpandableSelector = toggleExpandableSelector;

/**
 * Select an option in an expandable selector
 * @param {string} id - Selector ID
 * @param {string} value - Selected value
 * @param {Event} event - Click event
 */
function selectExpandableOption(id, value, event) {
    event.stopPropagation();
    event.preventDefault();
    
    console.log('Selecting option:', id, value);
    
    const group = document.querySelector(`[data-es-id="${id}"]`);
    if (!group) {
        console.error('Could not find group for id:', id);
        return;
    }
    
    const parent = group.querySelector('.es-parent');
    const optionsContainer = group.querySelector('.es-suboptions');
    const customContainer = group.querySelector(`#es-custom-${id}`);
    
    // Remove selection from all options
    optionsContainer.querySelectorAll('.es-suboption').forEach(el => {
        el.classList.remove('selected');
        el.setAttribute('aria-selected', 'false');
        el.style.backgroundColor = '';
        el.style.color = '';
        el.style.fontWeight = '';
        const checkIcon = el.querySelector('.es-check-icon');
        if (checkIcon) checkIcon.style.opacity = '';
    });
    
    // Find and select the clicked option
    const clickedOption = optionsContainer.querySelector(`[data-value="${value}"]`);
    if (clickedOption) {
        clickedOption.classList.add('selected');
        clickedOption.setAttribute('aria-selected', 'true');
        clickedOption.style.backgroundColor = '#dbeafe';
        clickedOption.style.color = '#1e40af';
        clickedOption.style.fontWeight = '600';
        const checkIcon = clickedOption.querySelector('.es-check-icon');
        if (checkIcon) checkIcon.style.opacity = '1';
    }
    
    // Handle "Type My Own"
    if (value === 'Type My Own') {
        if (customContainer) {
            customContainer.classList.add('visible');
            const input = customContainer.querySelector('input');
            if (input) {
                input.focus();
                // Use existing custom value if available
                const existingCustom = ExpandableSelectorState.getCustomValue(id);
                if (existingCustom) {
                    ExpandableSelectorState.setValue(id, existingCustom);
                } else {
                    ExpandableSelectorState.setValue(id, 'Type My Own');
                }
            }
        }
        // Don't close dropdown for custom input
    } else {
        if (customContainer) {
            customContainer.classList.remove('visible');
        }
        ExpandableSelectorState.setValue(id, value);
        
        // Close the dropdown after selection (except for Type My Own)
        parent.classList.remove('expanded');
        parent.setAttribute('aria-expanded', 'false');
        optionsContainer.classList.remove('expanded');
        ExpandableSelectorState.expandedId = null;
    }
    
    // Update parent visual to show the selected value
    updateExpandableParentVisual(id);
    
    console.log('Selection complete, current value:', ExpandableSelectorState.getValue(id));
}

// Make function globally accessible
window.selectExpandableOption = selectExpandableOption;

/**
 * Update custom value for an expandable selector
 * @param {string} id - Selector ID
 * @param {string} value - Custom value
 */
function updateExpandableCustomValue(id, value) {
    ExpandableSelectorState.setCustomValue(id, value);
    ExpandableSelectorState.setValue(id, value || 'Type My Own');
    updateExpandableParentVisual(id);
}

// Make function globally accessible
window.updateExpandableCustomValue = updateExpandableCustomValue;

/**
 * Update the parent visual to show current selection
 * @param {string} id - Selector ID
 */
function updateExpandableParentVisual(id) {
    const group = document.querySelector(`[data-es-id="${id}"]`);
    if (!group) return;
    
    const parent = group.querySelector('.es-parent');
    const currentValue = ExpandableSelectorState.getValue(id);
    
    // Remove existing value tag
    const existingTag = parent.querySelector('.es-selected-value');
    if (existingTag) {
        existingTag.remove();
    }
    
    if (currentValue && currentValue !== 'Type My Own') {
        parent.classList.add('has-selection');
        
        // Truncate long values
        let displayValue = currentValue;
        if (displayValue.length > 18) {
            displayValue = displayValue.substring(0, 15) + '...';
        }
        
        // Insert value tag before expand icon
        const expandIcon = parent.querySelector('.es-expand-icon');
        const valueTag = document.createElement('span');
        valueTag.className = 'es-selected-value';
        valueTag.textContent = displayValue;
        parent.insertBefore(valueTag, expandIcon);
    } else if (currentValue === 'Type My Own') {
        // Show placeholder for empty custom
        parent.classList.remove('has-selection');
    } else {
        parent.classList.remove('has-selection');
    }
}

// Make function globally accessible
window.updateExpandableParentVisual = updateExpandableParentVisual;

/**
 * Get the current value of an expandable selector
 * @param {string} id - Selector ID
 * @returns {string|null} Current value
 */
function getExpandableValue(id) {
    return ExpandableSelectorState.getValue(id);
}

// Make function globally accessible
window.getExpandableValue = getExpandableValue;

/**
 * Set the value of an expandable selector programmatically
 * @param {string} id - Selector ID
 * @param {string} value - Value to set
 */
function setExpandableValue(id, value) {
    ExpandableSelectorState.setValue(id, value);
    
    const group = document.querySelector(`[data-es-id="${id}"]`);
    if (!group) return;
    
    // Update the visual state
    const optionsContainer = group.querySelector('.es-suboptions');
    if (optionsContainer) {
        // Clear all selections
        optionsContainer.querySelectorAll('.es-suboption').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Select the matching option
        const matchingOption = optionsContainer.querySelector(`[data-value="${value}"]`);
        if (matchingOption) {
            matchingOption.classList.add('selected');
        } else {
            // It's a custom value
            const customOption = optionsContainer.querySelector('[data-value="Type My Own"]');
            if (customOption) {
                customOption.classList.add('selected');
            }
            const customContainer = group.querySelector(`#es-custom-${id}`);
            if (customContainer) {
                customContainer.classList.add('visible');
                const input = customContainer.querySelector('input');
                if (input) {
                    input.value = value;
                }
            }
        }
    }
    
    updateExpandableParentVisual(id);
}

// Make function globally accessible
window.setExpandableValue = setExpandableValue;

/**
 * Close all expanded selectors
 */
function closeAllExpandableSelectors() {
    document.querySelectorAll('.es-parent.expanded').forEach(el => {
        el.classList.remove('expanded');
        el.setAttribute('aria-expanded', 'false');
        const options = el.closest('.expandable-selector-group').querySelector('.es-suboptions');
        if (options) {
            options.classList.remove('expanded');
        }
    });
    ExpandableSelectorState.expandedId = null;
}

// Make function globally accessible
window.closeAllExpandableSelectors = closeAllExpandableSelectors;

/**
 * Initialize click-outside handler using multiple strategies
 */
let __esClickOutsideInit = false;
function initClickOutsideHandler() {
    // Idempotent init: avoids multiple listeners which can cause “instant close” / broken clicks.
    if (__esClickOutsideInit) return;
    __esClickOutsideInit = true;

    // Use capture-phase pointerdown so we never need an overlay (overlays can block hover/click).
    const handler = function(event) {
        if (!ExpandableSelectorState.expandedId) return;
        const target = /** @type {any} */ (event.target);
        const inside = target && typeof target.closest === 'function'
            ? target.closest('.expandable-selector-group')
            : null;
        if (!inside) closeAllExpandableSelectors();
    };

    document.addEventListener('pointerdown', handler, true);
    // Fallbacks for older browsers / odd environments
    document.addEventListener('mousedown', handler, true);
    document.addEventListener('touchstart', handler, true);

    console.log('Click-outside handlers initialized');
}

/**
 * Handle document clicks to close dropdowns
 * @param {Event} event - Click or touch event
 */
function handleDocumentClick(event) {
    // Don't process if no selector is expanded
    if (!ExpandableSelectorState.expandedId) {
        return;
    }
    
    // Walk up from target to check if we're inside an expandable selector
    let element = event.target;
    let isInsideSelector = false;
    
    while (element && element !== document.body) {
        if (element.classList && element.classList.contains('expandable-selector-group')) {
            isInsideSelector = true;
            break;
        }
        // Also check for data attribute
        if (element.dataset && element.dataset.esId) {
            isInsideSelector = true;
            break;
        }
        element = element.parentElement;
    }
    
    // If click was outside all selectors, close them
    if (!isInsideSelector) {
        console.log('Click outside detected, closing selectors');
        closeAllExpandableSelectors();
    }
}

// Make handler globally accessible for debugging
window.handleDocumentClick = handleDocumentClick;

// Initialize immediately and on DOM ready
function safeInit() {
    try {
        initClickOutsideHandler();
    } catch (e) {
        console.error('Failed to init click handler:', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
} else {
    safeInit();
}

// NOTE: no delayed re-init; init is idempotent and selectors render inline handlers already.

// Keyboard navigation support
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAllExpandableSelectors();
    }
});

// Re-initialize after any dynamic content loads (for SPAs)
window.initExpandableSelectorHandlers = initClickOutsideHandler;

console.log('Expandable Selector Component loaded with click-outside handler');

