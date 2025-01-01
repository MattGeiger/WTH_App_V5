/**
 * Table UI management for categories
 */

const COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'limit', label: 'Item Limit' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions' }
];

/**
 * HTML escapes a string with XSS protection
 * @private
 * @param {*} input - Value to escape
 * @returns {string} Escaped string
 */
function escapeHtml(input) {
    try {
        if (input === null || input === undefined) return '';
        const str = String(input).trim();
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    } catch (error) {
        console.error('Error escaping HTML:', error);
        return '';
    }
}

/**
 * Creates table layout with proper structure and accessibility
 * @returns {HTMLTableElement} Table element
 */
export function createTableLayout() {
    try {
        const existingTable = document.getElementById('categoryTable');
        if (existingTable?.tagName === 'TABLE') return existingTable;

        const table = document.createElement('table');
        table.id = 'categoryTable';
        table.className = 'table';
        table.setAttribute('role', 'grid');

        const thead = document.createElement('thead');
        thead.setAttribute('role', 'rowgroup');
        
        const headerRow = document.createElement('tr');
        headerRow.setAttribute('role', 'row');

        COLUMNS.forEach(({ key, label }) => {
            const th = document.createElement('th');
            th.textContent = label;
            th.setAttribute('scope', 'col');
            th.setAttribute('role', 'columnheader');
            th.dataset.sortKey = key;
            
            if (key !== 'actions') {
                th.classList.add('sortable');
                th.setAttribute('aria-sort', 'none');
            }
            
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        tbody.setAttribute('role', 'rowgroup');
        table.appendChild(tbody);

        return table;
    } catch (error) {
        console.error('Error creating table layout:', error);
        return document.createElement('table');
    }
}

/**
 * Displays categories in table
 * @param {Array} categories - Category data
 * @returns {boolean} Success status
 */
export function displayCategories(categories = []) {
    try {
        const tbody = document.querySelector('#categoryTable tbody');
        if (!tbody) {
            console.warn('Table body not found');
            return false;
        }

        if (!Array.isArray(categories) || categories.length === 0) {
            tbody.innerHTML = createEmptyState();
            return true;
        }

        tbody.innerHTML = categories.map((category, index) => {
            // Safely extract and format values
            const safeName = escapeHtml(category?.name) || 'Unnamed Category';
            const safeId = escapeHtml(category?.id) || '';
            const rawLimit = category?.itemLimit;
            const safeLimit = rawLimit > 0 ? String(rawLimit) : 'No Limit';
            const safeDate = formatDate(category?.created);

            return `
                <tr role="row">
                    <td role="gridcell">${safeName}</td>
                    <td role="gridcell">${safeLimit}</td>
                    <td role="gridcell">${safeDate}</td>
                    <td role="gridcell" class="table__actions">
                        <button class="button button--icon edit-btn" 
                                data-id="${safeId}"
                                data-name="${safeName}"
                                data-limit="${rawLimit || ''}"
                                aria-label="Edit ${safeName}">
                            <span class="button__text">Edit</span>
                        </button>
                        <button class="button button--icon delete-btn"
                                data-id="${safeId}"
                                aria-label="Delete ${safeName}">
                            <span class="button__text">Delete</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        return true;
    } catch (error) {
        console.error('Error displaying categories:', error);
        if (tbody) {
            tbody.innerHTML = createEmptyState('Error displaying categories');
        }
        return false;
    }
}

/**
 * Creates empty state message
 * @private
 * @param {string} [message] - Optional custom message
 * @returns {string} Empty state HTML
 */
function createEmptyState(message = 'No categories available') {
    return `
        <tr role="row">
            <td class="table__cell--empty" 
                colspan="4" 
                role="gridcell"
                aria-label="${escapeHtml(message)}">
                <div class="empty-state">
                    <p class="empty-state__message">${escapeHtml(message)}</p>
                    <p class="empty-state__hint">Add a category using the form above</p>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Formats date for display
 * @private
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
    try {
        if (!date) return 'Invalid Date';
        
        // Handle both Date objects and strings
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';
        
        // Format with browser locale
        return dateObj.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
}

/**
 * Gets sort value from cell
 * @param {HTMLTableRowElement} row - Table row
 * @param {string} key - Sort key
 * @returns {string|number} Sort value
 */
export function getSortValue(row, key) {
    try {
        if (!row?.cells) return '';
        
        const columnIndex = COLUMNS.findIndex(col => col.key === key);
        if (columnIndex === -1) return '';

        const cell = row.cells[columnIndex];
        if (!cell) return '';

        const content = cell.textContent.trim();
        if (!content) return '';

        switch (key) {
            case 'limit': {
                if (content === 'No Limit') return -1;
                const limit = parseInt(content, 10);
                return !isNaN(limit) && isFinite(limit) ? limit : -1;
            }
            
            case 'created': {
                const date = new Date(content);
                const timestamp = date.getTime();
                return !isNaN(timestamp) && isFinite(timestamp) ? timestamp : 0;
            }
            
            default:
                return content.toLowerCase();
        }
    } catch (error) {
        console.error('Error getting sort value:', error);
        return '';
    }
}