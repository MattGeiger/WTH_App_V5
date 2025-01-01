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
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function createTableLayout() {
    const existingTable = document.getElementById('categoryTable');
    if (existingTable) return existingTable;

    const table = document.createElement('table');
    table.id = 'categoryTable';
    table.className = 'table';
    table.setAttribute('role', 'grid');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    COLUMNS.forEach(({ key, label }) => {
        const th = document.createElement('th');
        th.textContent = label;
        th.setAttribute('scope', 'col');
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
    table.appendChild(tbody);

    return table;
}

export function displayCategories(categories = []) {
    const tbody = document.querySelector('#categoryTable tbody');
    if (!tbody) return;

    if (!Array.isArray(categories) || categories.length === 0) {
        tbody.innerHTML = createEmptyState();
        return;
    }

    tbody.innerHTML = categories.map(category => {
        const safeName = escapeHtml(category.name || '');
        const safeLimit = category.itemLimit || 'No Limit';
        const date = category.created ? new Date(category.created) : new Date();
        const safeDate = !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';

        return `
            <tr>
                <td>${safeName}</td>
                <td>${safeLimit}</td>
                <td>${safeDate}</td>
                <td class="table__actions">
                    <button class="button button--icon edit-btn" 
                        data-id="${category.id || ''}"
                        data-name="${safeName}"
                        data-limit="${category.itemLimit || ''}"
                        aria-label="Edit ${safeName}">
                        Edit
                    </button>
                    <button class="button button--icon delete-btn"
                        data-id="${category.id || ''}"
                        aria-label="Delete ${safeName}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function createEmptyState() {
    return `
        <tr>
            <td class="table__cell--empty" colspan="4" role="cell">
                <div class="empty-state">
                    <p class="empty-state__message">No categories available</p>
                    <p class="empty-state__hint">Add a category using the form above</p>
                </div>
            </td>
        </tr>
    `;
}

export function getSortValue(row, key) {
    const cell = row.cells[COLUMNS.findIndex(col => col.key === key)];
    if (!cell) return '';

    switch (key) {
        case 'limit':
            return cell.textContent === 'No Limit' ? -1 : parseInt(cell.textContent, 10);
        case 'created': {
            const timestamp = new Date(cell.textContent).getTime();
            return isNaN(timestamp) ? 0 : timestamp;
        }
        default:
            return cell.textContent.toLowerCase();
    }
}