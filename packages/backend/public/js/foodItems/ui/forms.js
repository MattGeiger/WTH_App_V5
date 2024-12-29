export function createFormLayout(manager) {
    // Clear the form completely
    const form = manager.form;
    while (form.firstChild) {
        form.removeChild(form.firstChild);
    }

    // Create form sections
    const formSections = ['input', 'status', 'dietary'];
    formSections.forEach(section => {
        const container = document.createElement('div');
        container.className = `form-section ${section}-section`;
        form.appendChild(container);
    });

    // Hidden ID field
    const hiddenId = document.createElement('input');
    hiddenId.type = 'hidden';
    hiddenId.id = 'foodItemId';
    form.appendChild(hiddenId);

    // Create input section elements
    const inputSection = form.querySelector('.input-section');
    [
        createFormGroup('Item Name:', manager.nameInput),
        createFormGroup('Category:', manager.categorySelect),
        createFormGroup('Item Limit:', manager.itemLimitSelect),
        createLimitTypeGroup()
    ].forEach(el => inputSection.appendChild(el));

    // Create status flags
    const statusSection = form.querySelector('.status-section');
    const statusFlags = createStatusFlagsGroup();
    statusSection.appendChild(statusFlags);

    // Create dietary flags
    const dietarySection = form.querySelector('.dietary-section');
    const dietaryFlags = createDietaryFlagsGroup();
    dietarySection.appendChild(dietaryFlags);

    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Add Food Item';
    submitButton.className = 'submit-button';
    form.appendChild(submitButton);
}

function createFormGroup(label, element) {
    const group = document.createElement('div');
    group.className = 'form__group';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.className = 'required';
    labelEl.htmlFor = element.id;
    
    // Clone the element to avoid moving it if it exists
    const elementClone = element.cloneNode(true);
    
    group.appendChild(labelEl);
    group.appendChild(elementClone);
    return group;
}

function createLimitTypeGroup() {
    const container = document.createElement('div');
    container.id = 'limitTypeContainer';
    container.style.display = 'none';
    container.className = 'limit-type-group';

    const options = [
        { value: 'perHousehold', label: 'Per Household', defaultChecked: true },
        { value: 'perPerson', label: 'Per Person', defaultChecked: false }
    ];

    options.forEach(option => {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'limitType';
        input.value = option.value;
        input.id = option.value;
        input.checked = option.defaultChecked;

        const label = document.createElement('label');
        label.htmlFor = option.value;
        label.textContent = option.label;

        container.appendChild(input);
        container.appendChild(label);
    });

    return container;
}

function createFlagGroupContainer(title) {
    const container = document.createElement('div');
    
    // Use exact class names for status and dietary flags
    if (title === 'Status Flags') {
        container.className = 'status-flags-group';
    } else if (title === 'Dietary Flags') {
        container.className = 'dietary-flags-group';
    }

    const heading = document.createElement('h3');
    heading.textContent = title;
    container.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'flags-grid';
    container.appendChild(grid);

    return { container, grid };
}

function createFlagToggle(flag) {
    const toggle = document.createElement('div');
    toggle.className = 'flag-toggle';

    const label = document.createElement('label');
    label.htmlFor = flag.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = flag.id;
    checkbox.name = flag.id;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(flag.label));
    toggle.appendChild(label);

    return toggle;
}

function createFlagsGroup(title, flags) {
    const { container, grid } = createFlagGroupContainer(title);
    flags.forEach(flag => {
        const toggle = createFlagToggle(flag);
        grid.appendChild(toggle);
    });
    return container;
}

function createStatusFlagsGroup() {
    const flags = [
        { id: 'foodItemInStock', label: 'In Stock' },
        { id: 'foodItemMustGo', label: 'Must Go' },
        { id: 'foodItemLowSupply', label: 'Low Supply' },
        { id: 'foodItemReadyToEat', label: 'Ready to Eat' }
    ];
    return createFlagsGroup('Status Flags', flags);
}

function createDietaryFlagsGroup() {
    const flags = [
        { id: 'foodItemKosher', label: 'Kosher' },
        { id: 'foodItemHalal', label: 'Halal' },
        { id: 'foodItemVegetarian', label: 'Vegetarian' },
        { id: 'foodItemVegan', label: 'Vegan' },
        { id: 'foodItemGlutenFree', label: 'Gluten Free' },
        { id: 'foodItemOrganic', label: 'Organic' }
    ];
    return createFlagsGroup('Dietary Flags', flags);
}