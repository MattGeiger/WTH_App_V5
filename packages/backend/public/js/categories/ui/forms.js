/**
 * Form UI management for categories
 */

/**
 * Creates or updates form layout
 * @param {Object} manager - Category manager instance
 * @returns {HTMLFormElement} Form element
 */
export function createFormLayout(manager) {
    if (!manager || !manager.form) {
        throw new Error('Invalid manager or missing form element');
    }

    // Clear existing form content
    while (manager.form.firstChild) {
        manager.form.removeChild(manager.form.firstChild);
    }

    manager.form.id = 'categoryForm';
    manager.form.className = 'form';
    manager.form.setAttribute('aria-label', 'Category management form');

    // Add form sections
    appendHiddenFields(manager.form);
    appendNameField(manager.form);
    appendLimitField(manager.form, manager.settingsManager);
    appendButtons(manager.form);

    return manager.form;
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
 * @param {Object} settingsManager - Settings manager instance
 */
function appendLimitField(form, settingsManager) {
    const group = document.createElement('div');
    group.className = 'form__group';

    const label = document.createElement('label');
    label.htmlFor = 'categoryItemLimit';
    label.className = 'form__label';
    label.textContent = 'Item Limit';

    const select = document.createElement('select');
    select.id = 'categoryItemLimit';
    select.className = 'form__select';

    const defaultOption = document.createElement('option');
    defaultOption.value = '0';
    defaultOption.textContent = 'No Limit';
    select.appendChild(defaultOption);

    // Add limit options if settings manager available
    if (settingsManager?.getCurrentLimit) {
        const maxLimit = settingsManager.getCurrentLimit();
        for (let i = 1; i <= maxLimit; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = i.toString();
            select.appendChild(option);
        }
    }

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
 * @param {Object} manager - Category manager instance
 * @param {boolean} isEdit - Whether form is in edit mode
 * @param {boolean} [skipReset=false] - Whether to skip form reset
 */
export function updateFormState(manager, isEdit, skipReset = false) {
    if (!manager?.form) return;

    const submitBtn = manager.form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    // Update button state
    submitBtn.textContent = isEdit ? 'Update Category' : 'Add Category';
    submitBtn.setAttribute('aria-label', isEdit ? 'Update category' : 'Add category');

    // Handle form reset
    if (!isEdit && !skipReset) {
        clearFormFields(manager.form);
    }
}

/**
 * Clear form fields
 * @param {HTMLFormElement} form - Form element
 */
function clearFormFields(form) {
    if (!form) return;

    const nameInput = form.querySelector('#categoryName');
    if (nameInput) {
        nameInput.value = '';
        nameInput.setAttribute('aria-invalid', 'false');
    }

    const idInput = form.querySelector('#categoryId');
    if (idInput) {
        idInput.value = '';
    }

    const limitSelect = form.querySelector('#categoryItemLimit');
    if (limitSelect) {
        // Ensure '0' is set as string to match <option> value
        limitSelect.value = '0'; 
    }
}

/**
 * Public method to clear form
 * @param {Object} manager - Category manager instance
 */
export function clearForm(manager) {
    if (!manager?.form) return;
    
    try {
        clearFormFields(manager.form);
        updateFormState(manager, false, true);
    } catch (error) {
        console.error('Error clearing form:', error);
        // Attempt state update even if clear fails
        updateFormState(manager, false, true);
    }
}