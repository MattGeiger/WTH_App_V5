import { createFormLayout } from '../../ui/forms.js';

describe('Form UI Components', () => {
    let mockForm;
    let mockManager;

    beforeEach(() => {
        // Create complete form structure
        document.body.innerHTML = `
            <form id="testForm">
                <input type="hidden" id="foodItemId" value="">
                <input type="text" id="foodItemName" name="foodItemName">
                <select id="foodItemCategory"></select>
                <select id="itemLimitSelect"></select>
                <button type="submit">Add Food Item</button>
            </form>
            <div id="limitTypeContainer"></div>
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
            const groups = mockForm.querySelectorAll('.form__group');
            groups.forEach(group => {
                const label = group.querySelector('label.required');
                expect(label).toBeTruthy();
                expect(label.textContent).toMatch(/Name|Category|Limit/);
            });
        });

        it('should create limit type group', () => {
            const limitGroup = document.getElementById('limitTypeContainer');
            expect(limitGroup).toBeTruthy();
            expect(limitGroup.style.display).toBe('none');

            const radios = limitGroup.querySelectorAll('input[type="radio"]');
            expect(radios.length).toBe(2);
            expect(radios[0].value).toBe('perHousehold');
            expect(radios[1].value).toBe('perPerson');
            expect(radios[0].checked).toBe(true);
        });

        it('should create status flags group', () => {
            const statusGroup = mockForm.querySelector('.status-flags-group');
            expect(statusGroup).toBeTruthy();

            const heading = statusGroup.querySelector('h3');
            expect(heading.textContent).toBe('Status Flags');

            const flags = statusGroup.querySelectorAll('input[type="checkbox"]');
            expect(flags.length).toBe(4); // inStock, mustGo, lowSupply, readyToEat
        });

        it('should create dietary flags group', () => {
            const dietaryGroup = mockForm.querySelector('.dietary-flags-group');
            expect(dietaryGroup).toBeTruthy();

            const heading = dietaryGroup.querySelector('h3');
            expect(heading.textContent).toBe('Dietary Flags');

            const flags = dietaryGroup.querySelectorAll('input[type="checkbox"]');
            expect(flags.length).toBe(6); // kosher, halal, vegetarian, vegan, glutenFree, organic
        });
    });

    describe('Form Interactions', () => {
        it('should have correct initial state for limit type radios', () => {
            const perHousehold = document.getElementById('perHousehold');
            const perPerson = document.getElementById('perPerson');
            expect(perHousehold.checked).toBe(true);
            expect(perPerson.checked).toBe(false);
        });

        it('should create accessible flag inputs', () => {
            const flags = mockForm.querySelectorAll('input[type="checkbox"]');
            flags.forEach(flag => {
                expect(flag.id).toBeTruthy();
                const label = mockForm.querySelector(`label[for="${flag.id}"]`);
                expect(label).toBeTruthy();
                expect(label.textContent).toBeTruthy();
            });
        });

        it('should maintain form hierarchy', () => {
            const sections = Array.from(mockForm.children);
            sections.forEach(section => {
                if (section.classList.contains('form-section')) {
                    expect(section.children.length).toBeGreaterThan(0);
                }
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