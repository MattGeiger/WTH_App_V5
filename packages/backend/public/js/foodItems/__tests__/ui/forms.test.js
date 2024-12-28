import { createFormLayout } from '../../ui/forms.js';

describe('Form UI Components', () => {
    let mockManager;
    let mockForm;

    beforeEach(() => {
        // Set up our DOM environment
        document.body.innerHTML = '<form id="testForm"></form>';
        mockForm = document.getElementById('testForm');

        // Create mock manager
        mockManager = {
            form: mockForm,
            nameInput: document.createElement('input'),
            categorySelect: document.createElement('select'),
            itemLimitSelect: document.createElement('select')
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Form Layout Creation', () => {
        beforeEach(() => {
            createFormLayout(mockManager);
        });

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
            expect(labels[0].textContent).toBe('Item Name:');
            expect(labels[1].textContent).toBe('Category:');
            expect(labels[2].textContent).toBe('Item Limit:');
        });

        it('should create limit type group', () => {
            const limitGroup = mockForm.querySelector('#limitTypeContainer');
            expect(limitGroup).toBeTruthy();
            expect(limitGroup.style.display).toBe('none');

            const radioButtons = limitGroup.querySelectorAll('input[type="radio"]');
            expect(radioButtons.length).toBe(2);
            expect(radioButtons[0].value).toBe('perHousehold');
            expect(radioButtons[1].value).toBe('perPerson');
        });

        it('should create status flags group', () => {
            const statusGroup = mockForm.querySelector('.status-flags-group');
            expect(statusGroup).toBeTruthy();

            const heading = statusGroup.querySelector('h3');
            expect(heading.textContent).toBe('Status Flags');

            const grid = statusGroup.querySelector('.flags-grid');
            expect(grid).toBeTruthy();

            const checkboxes = grid.querySelectorAll('input[type="checkbox"]');
            expect(checkboxes.length).toBe(4);
        });

        it('should create dietary flags group', () => {
            const dietaryGroup = mockForm.querySelector('.dietary-flags-group');
            expect(dietaryGroup).toBeTruthy();

            const heading = dietaryGroup.querySelector('h3');
            expect(heading.textContent).toBe('Dietary Flags');

            const grid = dietaryGroup.querySelector('.flags-grid');
            expect(grid).toBeTruthy();

            const checkboxes = grid.querySelectorAll('input[type="checkbox"]');
            expect(checkboxes.length).toBe(6);
        });
    });

    describe('Form Interactions', () => {
        beforeEach(() => {
            createFormLayout(mockManager);
        });

        it('should have correct initial state for limit type radios', () => {
            const perHousehold = document.querySelector('#perHousehold');
            const perPerson = document.querySelector('#perPerson');
            
            expect(perHousehold.checked).toBe(true);
            expect(perPerson.checked).toBe(false);
        });

        it('should create accessible flag inputs', () => {
            const flags = mockForm.querySelectorAll('input[type="checkbox"]');
            flags.forEach(flag => {
                const label = document.querySelector(`label[for="${flag.id}"]`);
                expect(label).toBeTruthy();
            });
        });

        it('should maintain form hierarchy', () => {
            const sections = Array.from(mockForm.children);
            sections.forEach(section => {
                expect(section.classList.contains('form-section')).toBe(true);
                expect(section.children.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Form Element Attributes', () => {
        beforeEach(() => {
            createFormLayout(mockManager);
        });

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
                    expect(label).toBeTruthy();
                    expect(input).toBeTruthy();
                    expect(input.id).toBeTruthy();
                    expect(label.htmlFor).toBe(input.id);
                });
            });
        });
    });
});