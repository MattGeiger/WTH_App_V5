/**
 * Form UI management for categories
 */

/**
 * Creates form layout
 * @returns {HTMLFormElement} Form element
 */
export function createFormLayout() {
    const existingForm = document.getElementById('categoryForm');
    if (existingForm) return existingForm;

    const form = document.createElement('form');
    form.id = 'categoryForm';
    form.className = 'form';
    form.setAttribute('aria-label', 'Category management form');

    // Setup form structure
    appendHiddenFields(form);
    appendNameField(form);
    appendLimitField(form);
    appendButtons(form);

    return form;
}

/**
 * Appends hidden fields to form
 * @param {HTMLFormElement} form - Form element
 */
function appendHiddenFields(form) {
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'categoryId';
    form.appendChild(idInput);
}

/**
 * Appends name field to form
 * @param {HTMLFormElement} form - Form element
 */
function appendNameField(form) {
    const group = document.createElement('div');
    group.className = 'form__group';

    const label = document.createElement('label');
    label.htmlFor = 'categoryName';
    label.className = 'form__label form__label--required';
    label.textContent = 'Category Name';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'categoryName';
    input.className = 'form__input';
    input.required = true;
    input.setAttribute('aria-required', 'true');
    input.setAttribute('aria-invalid', 'false');
    input.maxLength = 36;

    group.appendChild(label);
    group.appendChild(input);
    form.appendChild(group);
}

/**
 * Appends limit field to form
 * @param {HTMLFormElement} form - Form element
 */
function appendLimitField(form) {
    const group = document.createElement('div');
    group.className = 'form__group';

    const label = document.createElement('label');
    label.htmlFor = 'itemLimit';
    label.className = 'form__label';
    label.textContent = 'Item Limit';

    const select = document.createElement('select');
    select.id = 'itemLimit';
    select.className = 'form__select';

    const defaultOption = document.createElement('option');
    defaultOption.value = '0';
    defaultOption.textContent = 'No Limit';
    select.appendChild(defaultOption);

    group.appendChild(label);
    group.appendChild(select);
    form.appendChild(group);
}

/**
 * Appends action buttons to form
 * @param {HTMLFormElement} form - Form element
 */
function appendButtons(form) {
    const group = document.createElement('div');
    group.className = 'form__buttons';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'button button--primary';
    submitBtn.textContent = 'Add Category';
    submitBtn.setAttribute('aria-label', 'Add category');

    const resetBtn = document.createElement('button');
    resetBtn.type = 'reset';
    resetBtn.id = 'resetForm';
    resetBtn.className = 'button button--secondary';
    resetBtn.textContent = 'Reset';
    resetBtn.setAttribute('aria-label', 'Reset form');

    group.appendChild(submitBtn);
    group.appendChild(resetBtn);
    form.appendChild(group);
}

/**
 * Updates form state
 * @param {boolean} isEdit - Whether form is in edit mode
 * @param {boolean} [skipReset=false] - Whether to skip form reset
 */
export function updateFormState(isEdit, skipReset = false) {
    const form = document.getElementById('categoryForm');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    if (isEdit) {
        submitBtn.textContent = 'Update Category';
        submitBtn.setAttribute('aria-label', 'Update category');
    } else {
        submitBtn.textContent = 'Add Category';
        submitBtn.setAttribute('aria-label', 'Add category');
        
        if (!skipReset) {
            // Only reset if not already being called from reset handler
            clearFormFields();
        }
    }
}

/**
 * Internal helper to clear form fields without triggering events
 * @private
 */
function clearFormFields() {
    const nameInput = document.getElementById('categoryName');
    const idInput = document.getElementById('categoryId');
    const limitSelect = document.getElementById('itemLimit');
    
    if (nameInput) {
        nameInput.value = '';
        nameInput.setAttribute('aria-invalid', 'false');
    }
    
    if (idInput) {
        idInput.value = '';
    }
    
    if (limitSelect) {
        limitSelect.selectedIndex = 0;
    }
}

/**
 * Public method to clear form
 * Prevents circular dependency with CategoryManager reset handler
 */
export function clearForm() {
    clearFormFields();
    updateFormState(false, true); // Skip reset in updateFormState
}