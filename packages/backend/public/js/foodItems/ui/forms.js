export function createFormLayout(manager) {
    const formSections = ['input', 'status', 'dietary'];
    formSections.forEach(section => {
        const container = document.createElement('div');
        container.className = `form-section ${section}-section`;
        manager.form.appendChild(container);
    });

    appendToFormSection(manager.form, 'input', [
        createFormGroup('Item Name:', manager.nameInput),
        createFormGroup('Category:', manager.categorySelect),
        createFormGroup('Item Limit:', manager.itemLimitSelect),
        createLimitTypeGroup()
    ]);

    appendToFormSection(manager.form, 'status', [
        createStatusFlagsGroup()
    ]);

    appendToFormSection(manager.form, 'dietary', [
        createDietaryFlagsGroup()
    ]);
}

function createFormGroup(label, element) {
    const group = document.createElement('div');
    group.className = 'form__group';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.className = 'required';
    
    group.appendChild(labelEl);
    group.appendChild(element);
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

function appendToFormSection(form, section, elements) {
    const container = form.querySelector(`.${section}-section`);
    if (container) {
        elements.forEach(el => container.appendChild(el));
    }
}

function createFlagGroup(title, flags) {
    const container = document.createElement('div');
    container.className = title.toLowerCase().replace(' ', '-') + '-flags-group';

    const heading = document.createElement('h3');
    heading.textContent = title;
    container.appendChild(heading);

    const gridContainer = document.createElement('div');
    gridContainer.className = 'flags-grid';

    flags.forEach(flag => {
        const toggle = document.createElement('div');
        toggle.className = 'flag-toggle';
        
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = flag.id;
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(flag.label));
        toggle.appendChild(label);
        gridContainer.appendChild(toggle);
    });

    container.appendChild(gridContainer);
    return container;
}

function createStatusFlagsGroup() {
    const flags = [
        { id: 'foodItemInStock', label: 'In Stock' },
        { id: 'foodItemMustGo', label: 'Must Go' },
        { id: 'foodItemLowSupply', label: 'Low Supply' },
        { id: 'foodItemReadyToEat', label: 'Ready to Eat' }
    ];
    return createFlagGroup('Status Flags', flags);
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
    return createFlagGroup('Dietary Flags', flags);
}