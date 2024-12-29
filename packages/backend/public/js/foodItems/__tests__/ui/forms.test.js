import { createFormLayout, createFlagsGroup } from '../../ui/forms.js';

describe('Form UI Components', () => {
    let mockForm;
    let mockManager;

    beforeEach(() => {
        // Create basic form structure
        document.body.innerHTML = `
            <form id="testForm">
                <input type="text" id="foodItemName" name="foodItemName">
                <select id="foodItemCategory"></select>
                <select id="itemLimitSelect"></select>
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
            
            const sectionTypes = ['input', 'status', 'dietary'];
            sectionTypes.forEach(type => {
                const section = mockForm.querySelector(`.${type}-section`);
                expect(section).toBeTruthy();
                expect(section.classList.contains('form-section')).toBe(true);
            });
        });

        it('should create form groups with required labels', () => {
            const formGroups = mockForm.querySelectorAll('.form__group');
            expect(formGroups.length).toBe(3);

            const requiredLabels = mockForm.querySelectorAll('label.required');
            expect(requiredLabels.length).toBe(3);

            const expectedLabels = ['Item Name:', 'Category:', 'Item Limit:'];
            const labelTexts = Array.from(requiredLabels).map(label => label.textContent);
            expectedLabels.forEach(text => {
                expect(labelTexts).toContain(text);
            });
        });

        it('should create limit type group', () => {
            const limitGroup = document.getElementById('limitTypeContainer');
            expect(limitGroup).toBeTruthy();
            expect(limitGroup.style.display).toBe('none');
            expect(limitGroup.classList.contains('limit-type-group')).toBe(true);

            const radios = limitGroup.querySelectorAll('input[type="radio"]');
            expect(radios.length).toBe(2);

            const radioValues = Array.from(radios).map(radio => radio.value);
            expect(radioValues).toContain('perHousehold');
            expect(radioValues).toContain('perPerson');

            const perHousehold = limitGroup.querySelector('input[value="perHousehold"]');
            expect(perHousehold.checked).toBe(true);

            ['perHousehold', 'perPerson'].forEach(id => {
                const label = document.querySelector(`label[for="${id}"]`);
                expect(label).toBeTruthy();
            });
        });

        it('should create status flags group', () => {
            const statusSection = mockForm.querySelector('.status-section');
            expect(statusSection).toBeTruthy();

            const statusGroup = statusSection.querySelector('.status-flags-group');
            expect(statusGroup).toBeTruthy();

            const heading = statusGroup.querySelector('h3');
            expect(heading).toBeTruthy();
            expect(heading.textContent).toBe('Status Flags');

            const grid = statusGroup.querySelector('.flags-grid');
            expect(grid).toBeTruthy();

            const statusFlags = [
                { id: 'foodItemInStock', label: 'In Stock' },
                { id: 'foodItemMustGo', label: 'Must Go' },
                { id: 'foodItemLowSupply', label: 'Low Supply' },
                { id: 'foodItemReadyToEat', label: 'Ready to Eat' }
            ];

            const flags = grid.querySelectorAll('.flag-toggle');
            expect(flags.length).toBe(statusFlags.length);

            flags.forEach((flag, index) => {
                const input = flag.querySelector('input[type="checkbox"]');
                const label = flag.querySelector('label');
                expect(input.id).toBe(statusFlags[index].id);
                expect(label.textContent).toBe(statusFlags[index].label);
            });
        });

        it('should create dietary flags group', () => {
            const dietarySection = mockForm.querySelector('.dietary-section');
            expect(dietarySection).toBeTruthy();

            const dietaryGroup = dietarySection.querySelector('.dietary-flags-group');
            expect(dietaryGroup).toBeTruthy();

            const heading = dietaryGroup.querySelector('h3');
            expect(heading).toBeTruthy();
            expect(heading.textContent).toBe('Dietary Flags');

            const grid = dietaryGroup.querySelector('.flags-grid');
            expect(grid).toBeTruthy();

            const dietaryFlags = [
                { id: 'foodItemKosher', label: 'Kosher' },
                { id: 'foodItemHalal', label: 'Halal' },
                { id: 'foodItemVegetarian', label: 'Vegetarian' },
                { id: 'foodItemVegan', label: 'Vegan' },
                { id: 'foodItemGlutenFree', label: 'Gluten Free' },
                { id: 'foodItemOrganic', label: 'Organic' }
            ];

            const flags = grid.querySelectorAll('.flag-toggle');
            expect(flags.length).toBe(dietaryFlags.length);

            flags.forEach((flag, index) => {
                const input = flag.querySelector('input[type="checkbox"]');
                const label = flag.querySelector('label');
                expect(input.id).toBe(dietaryFlags[index].id);
                expect(label.textContent).toBe(dietaryFlags[index].label);
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
            const allFlags = mockForm.querySelectorAll('.flag-toggle input[type="checkbox"]');
            expect(allFlags.length).toBeGreaterThan(0);

            allFlags.forEach(flag => {
                expect(flag.id).toBeTruthy();
                const label = document.querySelector(`label[for="${flag.id}"]`);
                expect(label).toBeTruthy();
                expect(label.textContent.trim()).toBeTruthy();
            });
        });

        it('should maintain form hierarchy', () => {
            const sections = Array.from(mockForm.querySelectorAll('.form-section'));
            expect(sections.length).toBe(3);
            
            sections.forEach(section => {
                expect(section.children.length).toBeGreaterThan(0);
                expect(section.classList.contains('form-section')).toBe(true);
            });
        });
    });

    describe('Form Element Attributes', () => {
        it('should apply correct classes to form groups', () => {
            const groups = mockForm.querySelectorAll('.form__group');
            expect(groups.length).toBe(3);

            groups.forEach(group => {
                const label = group.querySelector('label');
                const input = group.querySelector('input, select');
                
                expect(label).toBeTruthy();
                expect(input).toBeTruthy();
                expect(label.classList.contains('required')).toBe(true);
            });
        });

        it('should set up flag groups with correct structure', () => {
            const flagGroups = mockForm.querySelectorAll('.flags-grid');
            expect(flagGroups.length).toBe(2);

            flagGroups.forEach(grid => {
                const toggles = grid.querySelectorAll('.flag-toggle');
                expect(toggles.length).toBeGreaterThan(0);

                toggles.forEach(toggle => {
                    const input = toggle.querySelector('input[type="checkbox"]');
                    const label = toggle.querySelector('label');
                    
                    expect(input).toBeTruthy();
                    expect(label).toBeTruthy();
                    expect(input.id).toBeTruthy();
                    expect(label.htmlFor).toBe(input.id);
                });
            });
        });
    });

    describe('Flag Group Creation', () => {
        // New test for unknown flag group title
        it('should handle unknown flag group titles', () => {
            const flagsGroup = createFlagsGroup('Unknown Flags', [
                { id: 'testFlag', label: 'Test Flag' }
            ]);
            expect(flagsGroup).toBeTruthy();
            expect(flagsGroup.classList.contains('status-flags-group')).toBe(false);
            expect(flagsGroup.classList.contains('dietary-flags-group')).toBe(false);
        });

        // Test for empty flags array
        it('should handle empty flags array', () => {
            const flagsGroup = createFlagsGroup('Status Flags', []);
            const grid = flagsGroup.querySelector('.flags-grid');
            expect(grid.children.length).toBe(0);
        });

        // Test for flags with missing properties
        it('should handle flags with missing properties', () => {
            const flagsGroup = createFlagsGroup('Status Flags', [
                { id: 'testFlag' }, // missing label
                { label: 'Test' }  // missing id
            ]);
            const grid = flagsGroup.querySelector('.flags-grid');
            const toggles = grid.querySelectorAll('.flag-toggle');
            expect(toggles.length).toBe(2);
        });
    });
});