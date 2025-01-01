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

    try {
        // Setup form structure
        appendHiddenFields(form);
        appendNameField(form);
        appendLimitField(form);
        appendButtons(form);
    } catch (error) {
        console.error('Error creating form layout:', error);
        // Return basic form if elements fail to append
        return form;
    }

    return form;
}

/**
 * Appends hidden fields to form
 * @param {HTMLFormElement} form - Form element
 * @throws {Error} If form parameter is invalid
 */
function appendHiddenFields(form) {
    if (!form || !(form instanceof HTMLFormElement)) {
        throw new Error('Invalid form element');
    }

    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'categoryId';
    form.appendChild(idInput);
}

/**
 * Appends name field to form
 * @param {HTMLFormElement} form - Form element
 * @throws {Error} If form parameter is invalid
 */
function appendNameField(form) {
    if (!form || !(form instanceof HTMLFormElement)) {
        throw new Error('Invalid form element');
    }

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
 * @throws {Error} If form parameter is invalid
 */
function appendLimitField(form) {
    if (!form || !(form instanceof HTMLFormElement)) {
        throw new Error('Invalid form element');
    }

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

    group.appendChild(label);
    group.appendChild(select);
    form.appendChild(group);
}

/**
 * Appends action buttons to form
 * @param {HTMLFormElement} form - Form element
 * @throws {Error} If form parameter is invalid
 */
function appendButtons(form) {
    if (!form || !(form instanceof HTMLFormElement)) {
        throw new Error('Invalid form element');
    }

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
    try {
        const form = document.getElementById('categoryForm');
        if (!form) {
            console.warn('Form not found for state update');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) {
            console.warn('Submit button not found for state update');
            return;
        }

        if (isEdit) {
            submitBtn.textContent = 'Update Category';
            submitBtn.setAttribute('aria-label', 'Update category');
        } else {
            submitBtn.textContent = 'Add Category';
            submitBtn.setAttribute('aria-label', 'Add category');
            
            if (!skipReset) {
                clearFormFields();
            }
        }
    } catch (error) {
        console.error('Error updating form state:', error);
    }
}

/**
 * Internal helper to clear form fields without triggering events
 * @private
 */
function clearFormFields() {
    try {
        const nameInput = document.getElementById('categoryName');
        const idInput = document.getElementById('categoryId');
        const limitSelect = document.getElementById('categoryItemLimit');
        
        // Clear each field if it exists
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
    } catch (error) {
        console.error('Error clearing form fields:', error);
    }
}

/**
 * Public method to clear form
 * Prevents circular dependency with CategoryManager reset handler
 */
export function clearForm() {
    try {
        clearFormFields();
        updateFormState(false, true); // Skip reset in updateFormState
    } catch (error) {
        console.error('Error clearing form:', error);
    }
}