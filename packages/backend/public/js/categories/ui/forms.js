/**
 * Form UI generation and management
 * Creates and manages category form elements
 */

/**
 * Creates the main form layout
 * @returns {HTMLFormElement} The configured form element
 */
export function createFormLayout() {
    // Get existing form or create new
    const form = document.getElementById('categoryForm') || document.createElement('form');
    form.id = 'categoryForm';
    form.className = 'form';

    // Create form sections
    const sections = {
        hidden: createHiddenInputs(),
        inputs: createInputSection(),
        buttons: createButtonSection()
    };

    // Assemble form
    form.innerHTML = '';
    Object.values(sections).forEach(section => {
        form.appendChild(section);
    });

    return form;
}

/**
 * Creates the hidden input fields
 * @returns {DocumentFragment} Fragment containing hidden inputs
 */
function createHiddenInputs() {
    const fragment = document.createDocumentFragment();
    
    // Category ID field
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'categoryId';
    idInput.name = 'categoryId';
    
    fragment.appendChild(idInput);
    return fragment;
}

/**
 * Creates the main input section
 * @returns {HTMLDivElement} The input section container
 */
function createInputSection() {
    const section = document.createElement('div');
    section.className = 'form__section';

    // Name input group
    const nameGroup = createInputGroup({
        id: 'categoryName',
        label: 'Category Name',
        type: 'text',
        required: true,
        placeholder: 'Enter category name',
        minLength: 3,
        maxLength: 36
    });

    // Item limit group
    const limitGroup = createInputGroup({
        id: 'categoryItemLimit',
        label: 'Item Limit',
        type: 'select',
        required: false
    });

    section.appendChild(nameGroup);
    section.appendChild(limitGroup);

    return section;
}

/**
 * Creates a form input group
 * @param {Object} config - Input configuration
 * @returns {HTMLDivElement} The input group container
 */
function createInputGroup({ id, label, type, required, placeholder, minLength, maxLength }) {
    const group = document.createElement('div');
    group.className = 'form__group';

    // Create label
    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.className = 'form__label';
    labelElement.textContent = label;
    if (required) labelElement.classList.add('form__label--required');

    // Create input/select
    let input;
    if (type === 'select') {
        input = document.createElement('select');
    } else {
        input = document.createElement('input');
        input.type = type;
        if (placeholder) input.placeholder = placeholder;
        if (minLength) input.minLength = minLength;
        if (maxLength) input.maxLength = maxLength;
    }

    input.id = id;
    input.name = id;
    input.className = type === 'select' ? 'form__select' : 'form__input';
    if (required) input.required = true;

    // Add to group
    group.appendChild(labelElement);
    group.appendChild(input);

    return group;
}

/**
 * Creates the button section
 * @returns {HTMLDivElement} The button section container
 */
function createButtonSection() {
    const section = document.createElement('div');
    section.className = 'form__section form__section--buttons';

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'button button--primary';
    submitBtn.textContent = 'Add Category';

    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.id = 'resetForm';
    resetBtn.className = 'button button--secondary';
    resetBtn.textContent = 'Reset';

    section.appendChild(submitBtn);
    section.appendChild(resetBtn);

    return section;
}

/**
 * Updates form state for editing
 * @param {HTMLFormElement} form - The form element
 * @param {boolean} isEditing - Whether in edit mode
 */
export function updateFormState(form, isEditing) {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = isEditing ? 'Update Category' : 'Add Category';
    
    // Additional state updates can be added here
    form.classList.toggle('form--editing', isEditing);
}

/**
 * Clears all form inputs
 * @param {HTMLFormElement} form - The form element
 */
export function clearForm(form) {
    form.reset();
    const idInput = form.querySelector('#categoryId');
    if (idInput) idInput.value = '';
    updateFormState(form, false);
}