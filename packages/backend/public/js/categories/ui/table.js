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
 * HTML escapes a string
 * @private
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

/**
 * Creates table layout with proper structure and accessibility
 * @returns {HTMLTableElement} Table element
 */
export function createTableLayout() {
    const existingTable = document.getElementById('categoryTable');
    if (existingTable) return existingTable;

    const table = document.createElement('table');
    table.id = 'categoryTable';
    table.className = 'table';
    table.setAttribute('role', 'grid');

    const thead = document.createElement('thead');
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
}

/**
 * Displays categories in table
 * @param {Array} categories - Category data
 */
export function displayCategories(categories = []) {
    const tbody = document.querySelector('#categoryTable tbody');
    if (!tbody) return;

    if (!Array.isArray(categories) || categories.length === 0) {
        tbody.innerHTML = createEmptyState();
        return;
    }

    tbody.innerHTML = categories.map((category, index) => {
        const safeName = escapeHtml(category?.name);
        const safeId = escapeHtml(category?.id);
        const safeLimit = category?.itemLimit > 0 ? String(category.itemLimit) : 'No Limit';
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
                            data-limit="${category?.itemLimit || ''}"
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
}

/**
 * Creates empty state message
 * @private
 * @returns {string} Empty state HTML
 */
function createEmptyState() {
    return `
        <tr role="row">
            <td class="table__cell--empty" 
                colspan="4" 
                role="gridcell"
                aria-label="No categories available">
                <div class="empty-state">
                    <p class="empty-state__message">No categories available</p>
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
    if (!date) return 'Invalid Date';
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : 'Invalid Date';
}

/**
 * Gets sort value from cell
 * @param {HTMLTableRowElement} row - Table row
 * @param {string} key - Sort key
 * @returns {string|number} Sort value
 */
export function getSortValue(row, key) {
    if (!row?.cells) return '';
    
    const columnIndex = COLUMNS.findIndex(col => col.key === key);
    if (columnIndex === -1) return '';

    const cell = row.cells[columnIndex];
    if (!cell) return '';

    const content = cell.textContent.trim();

    switch (key) {
        case 'limit':
            if (content === 'No Limit') return -1;
            const limit = parseInt(content, 10);
            return isNaN(limit) ? -1 : limit;
        
        case 'created':
            const timestamp = new Date(content).getTime();
            return isNaN(timestamp) ? 0 : timestamp;
        
        default:
            return content.toLowerCase();
    }
}