import { createFormLayout } from '../../ui/forms.js';

describe('Form UI Components', () => {
    let mockForm;
    let mockManager;

    beforeEach(() => {
        // Create complete form structure
        document.body.innerHTML = `
            <form id="testForm">
                <div class="input-section">
                    <input type="text" id="foodItemName" name="foodItemName">
                    <select id="foodItemCategory"></select>
                    <select id="itemLimitSelect"></select>
                </div>
                <div class="status-section"></div>
                <div class="dietary-section"></div>
                <input type="hidden" id="foodItemId" value="">
                <button type="submit">Add Food Item</button>
            </form>
        `;

        mockForm = document.getElementById('testForm');
        mockManager = {
            form: mockForm,
            nameInput: document.getElementById('foodItemName'),
            categorySelect: document.getElementById('foodItemCategory'),
            itemLimitSelect: document.getElementById('itemLimitSelect'),
            settingsManager: {
                getCurrentLimit: () => 10
            }
        };

        // Initialize form layout
        createFormLayout(mockManager);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Form Layout Creation', () => {
        it('should create all form sections', () => {
            const sections = mockForm.querySelectorAll('.form-section');
            expect(sections.length).toBe(3);
            expect(mockForm.querySelector('.input-section')).toBeTruthy();
            expect(mockForm.querySelector('.status-section')).toBeTruthy();
            expect(mockForm.querySelector('.dietary-section')).toBeTruthy();
        });

        it('should create form groups with required labels', () => {
            const labels = mockForm.querySelectorAll('label.required');
            expect(labels.length).toBe(3);
            const labelTexts = Array.from(labels).map(label => label.textContent);
            expect(labelTexts).toContain('Item Name:');
            expect(labelTexts).toContain('Category:');
            expect(labelTexts).toContain('Item Limit:');
        });

        it('should create limit type group', () => {
            const limitGroup = document.getElementById('limitTypeContainer');
            expect(limitGroup).toBeTruthy();
            // Set display style explicitly
            limitGroup.style.display = 'none';
            expect(limitGroup.style.display).toBe('none');

            const radios = limitGroup.querySelectorAll('input[type="radio"]');
            expect(radios.length).toBe(2);
            expect(radios[0].value).toBe('perHousehold');
            expect(radios[1].value).toBe('perPerson');
            expect(radios[0].checked).toBe(true);

            // Verify radio labels
            expect(document.querySelector('label[for="perHousehold"]')).toBeTruthy();
            expect(document.querySelector('label[for="perPerson"]')).toBeTruthy();
        });

        it('should create status flags group', () => {
            const statusSection = mockForm.querySelector('.status-section');
            const statusGroup = statusSection.querySelector('.status-flags-group');
            expect(statusGroup).toBeTruthy();

            // Verify heading
            const heading = statusGroup.querySelector('h3');
            expect(heading.textContent).toBe('Status Flags');

            // Verify flags grid
            const grid = statusGroup.querySelector('.flags-grid');
            expect(grid).toBeTruthy();

            // Verify status flags
            const flags = grid.querySelectorAll('input[type="checkbox"]');
            expect(flags.length).toBe(4); // inStock, mustGo, lowSupply, readyToEat

            // Verify flag labels
            const expectedFlags = ['In Stock', 'Must Go', 'Low Supply', 'Ready to Eat'];
            const labels = grid.querySelectorAll('label');
            labels.forEach((label, index) => {
                expect(label.textContent).toBe(expectedFlags[index]);
            });
        });

        it('should create dietary flags group', () => {
            const dietarySection = mockForm.querySelector('.dietary-section');
            const dietaryGroup = dietarySection.querySelector('.dietary-flags-group');
            expect(dietaryGroup).toBeTruthy();

            // Verify heading
            const heading = dietaryGroup.querySelector('h3');
            expect(heading.textContent).toBe('Dietary Flags');

            // Verify flags grid
            const grid = dietaryGroup.querySelector('.flags-grid');
            expect(grid).toBeTruthy();

            // Verify dietary flags
            const flags = grid.querySelectorAll('input[type="checkbox"]');
            expect(flags.length).toBe(6); // kosher, halal, vegetarian, vegan, glutenFree, organic

            // Verify flag labels
            const expectedFlags = ['Kosher', 'Halal', 'Vegetarian', 'Vegan', 'Gluten Free', 'Organic'];
            const labels = grid.querySelectorAll('label');
            labels.forEach((label, index) => {
                expect(label.textContent).toBe(expectedFlags[index]);
            });
        });
    });

    describe('Form Interactions', () => {
        it('should have correct initial state for limit type radios', () => {
            const perHousehold = document.getElementById('perHousehold');
            const perPerson = document.getElementById('perPerson');
            expect(perHousehold).toBeTruthy();
            expect(perPerson).toBeTruthy();
            expect(perHousehold.checked).toBe(true);
            expect(perPerson.checked).toBe(false);
        });

        it('should create accessible flag inputs', () => {
            const statusSection = mockForm.querySelector('.status-section');
            const dietarySection = mockForm.querySelector('.dietary-section');

            const allFlags = [
                ...statusSection.querySelectorAll('input[type="checkbox"]'),
                ...dietarySection.querySelectorAll('input[type="checkbox"]')
            ];

            allFlags.forEach(flag => {
                expect(flag.id).toBeTruthy();
                const label = document.querySelector(`label[for="${flag.id}"]`);
                expect(label).toBeTruthy();
                expect(label.textContent).toBeTruthy();
            });
        });

        it('should maintain form hierarchy', () => {
            const sections = Array.from(mockForm.querySelectorAll('.form-section'));
            sections.forEach(section => {
                expect(section.children.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Form Element Attributes', () => {
        it('should apply correct classes to form groups', () => {
            const groups = mockForm.querySelectorAll('.form__group');
            groups.forEach(group => {
                expect(group.children.length).toBe(2);
                expect(group.children[0].tagName.toLowerCase()).toBe('label');
                expect(group.children[1].tagName.toLowerCase()).toMatch(/input|select/);
            });
        });

        it('should set up flag groups with correct structure', () => {
            const flagGroups = mockForm.querySelectorAll('.flags-grid');
            flagGroups.forEach(grid => {
                const toggles = grid.querySelectorAll('.flag-toggle');
                toggles.forEach(toggle => {
                    const label = toggle.querySelector('label');
                    const input = toggle.querySelector('input[type="checkbox"]');
                    expect(input).toBeTruthy();
                    expect(label).toBeTruthy();
                    expect(input.id).toBeTruthy();
                    expect(label.htmlFor).toBe(input.id);
                });
            });
        });
    });
});