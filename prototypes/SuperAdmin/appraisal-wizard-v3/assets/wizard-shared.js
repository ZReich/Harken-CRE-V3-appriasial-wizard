/* =================================================================
   HARKEN APPRAISAL WIZARD V3 - SHARED JAVASCRIPT
   ================================================================= */

// Global wizard state (stored in localStorage)
const WizardState = {
    get: function(key) {
        const data = localStorage.getItem('harken_wizard_v3');
        if (!data) return null;
        const parsed = JSON.parse(data);
        return key ? parsed[key] : parsed;
    },
    
    set: function(key, value) {
        let data = this.get();
        if (!data) data = {};
        data[key] = value;
        data.lastModified = new Date().toISOString();
        localStorage.setItem('harken_wizard_v3', JSON.stringify(data));
    },
    
    clear: function() {
        localStorage.removeItem('harken_wizard_v3');
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
        let filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        // Handle URLs without .html extension (server redirects)
        if (!filename.endsWith('.html') && filename !== '') {
            filename = filename + '.html';
        }
        // Handle root of appraisal-wizard-v3 directory
        if (filename === '' || filename === 'appraisal-wizard-v3') {
            filename = 'index.html';
        }
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
            html += `<label class="flex items-center gap-2">`;
            html += `<input type="checkbox" ${field.required ? 'required' : ''}>`;
            html += `<span class="text-sm">${field.label}</span>`;
            html += `</label>`;
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

// Export for use in other scripts
window.WizardState = WizardState;
window.WizardNav = WizardNav;
window.toggleSidebar = toggleSidebar;
window.renderField = renderField;
window.formatCurrency = formatCurrency;

















