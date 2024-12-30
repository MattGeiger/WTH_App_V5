/**
 * Form UI management for categories
 */

/**
 * Creates category form layout
 * @returns {HTMLFormElement} Created form element
 */
export function createFormLayout() {
    const existingForm = document.getElementById('categoryForm');
    if (existingForm) return existingForm;

    const form = document.createElement('form');
    form.id = 'categoryForm';
    form.className = 'form';
    form.setAttribute('aria-label', 'Category management form');

    // Hidden fields
    appendHiddenInputs(form);

    // Name input group
    appendNameInput(form);

    // Item limit group
    appendLimitInput(form);

    // Button section
    appendButtons(form);

    return form;
}

function appendHiddenInputs(form) {
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'categoryId';
    form.appendChild(idInput);
}

function appendNameInput(form) {
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

function appendLimitInput(form) {
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

function appendButtons(form) {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'form__buttons';

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

    buttonGroup.appendChild(submitBtn);
    buttonGroup.appendChild(resetBtn);
    form.appendChild(buttonGroup);
}

/**
 * Updates form state for edit/add mode
 * @param {boolean} isEdit - Whether form is in edit mode
 */
export function updateFormState(isEdit) {
    const submitBtn = document.querySelector('#categoryForm button[type="submit"]');
    if (!submitBtn) return;
    
    submitBtn.textContent = isEdit ? 'Update Category' : 'Add Category';
    submitBtn.setAttribute('aria-label', isEdit ? 'Update category' : 'Add category');
}

/**
 * Clears form and resets to add mode
 */
export function clearForm() {
    const form = document.getElementById('categoryForm');
    if (!form) return;
    
    form.reset();
    document.getElementById('categoryId').value = '';
    updateFormState(false);
}