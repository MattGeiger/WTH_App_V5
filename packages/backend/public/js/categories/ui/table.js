/**
 * Table UI management for categories
 */

const COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'limit', label: 'Item Limit' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: 'Actions' }
];

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

    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>${category.itemLimit || 'No Limit'}</td>
            <td>${new Date(category.created).toLocaleDateString()}</td>
            <td class="table__actions">
                <button class="button button--icon edit-btn" 
                    data-id="${category.id}"
                    data-name="${category.name}"
                    data-limit="${category.itemLimit}"
                    aria-label="Edit ${category.name}">
                    Edit
                </button>
                <button class="button button--icon delete-btn"
                    data-id="${category.id}"
                    aria-label="Delete ${category.name}">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
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
        case 'created':
            return new Date(cell.textContent).getTime();
        default:
            return cell.textContent.toLowerCase();
    }
}