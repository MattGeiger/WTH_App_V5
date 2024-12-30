/**
 * Table UI generation and management
 * Creates and manages category table elements
 */

import { SortableTable } from '../../utils/sortableTable.js';
import { formatLimit } from '../utils/formatters.js';

/**
 * Creates the table layout and initializes sorting
 * @returns {Object} Table management interface
 */
export function createTableLayout() {
    const table = getTableElement();
    const sortableTable = new SortableTable('categoryTableBody', getSortValue);

    return {
        displayCategories: (categories) => displayCategories(categories, table, sortableTable),
        getSortValue: (row, key) => getSortValue(row, key, sortableTable)
    };
}

/**
 * Gets or creates the table element
 * @returns {HTMLTableElement} The table element
 */
function getTableElement() {
    const existingTable = document.getElementById('categoryTable');
    if (existingTable) return existingTable;

    const table = document.createElement('table');
    table.id = 'categoryTable';
    table.className = 'table';

    // Add table header
    table.innerHTML = `
        <thead>
            <tr>
                <th class="table__header" data-sort="name">Name</th>
                <th class="table__header" data-sort="limit">Item Limit</th>
                <th class="table__header" data-sort="created">Created</th>
                <th class="table__header">Actions</th>
            </tr>
        </thead>
        <tbody id="categoryTableBody"></tbody>
    `;

    return table;
}

/**
 * Displays categories in the table
 * @param {Array} categories - Array of category objects
 * @param {HTMLTableElement} table - The table element
 * @param {SortableTable} sortableTable - The sortable table instance
 */
function displayCategories(categories, table, sortableTable) {
    const tbody = table.querySelector('#categoryTableBody');
    
    if (!Array.isArray(categories) || categories.length === 0) {
        tbody.innerHTML = createEmptyState();
        return;
    }

    tbody.innerHTML = categories.map(category => createTableRow(category)).join('');
    sortableTable.setupSortingControls();
}

/**
 * Creates a table row for a category
 * @param {Object} category - Category data object
 * @returns {string} HTML string for the table row
 */
function createTableRow(category) {
    const { id, name, itemLimit, createdAt } = category;
    
    return `
        <tr>
            <td class="table__cell">${name}</td>
            <td class="table__cell">${formatLimit(itemLimit)}</td>
            <td class="table__cell">${new Date(createdAt).toLocaleDateString()}</td>
            <td class="table__cell table__cell--actions">
                ${createActionButtons(id, name, itemLimit)}
            </td>
        </tr>
    `;
}

/**
 * Creates action buttons for a table row
 * @param {number} id - Category ID
 * @param {string} name - Category name
 * @param {number} itemLimit - Category item limit
 * @returns {string} HTML string for action buttons
 */
function createActionButtons(id, name, itemLimit) {
    return `
        <button class="button button--small edit-btn" 
                data-id="${id}" 
                data-name="${name}"
                data-limit="${itemLimit || 0}"
                aria-label="Edit ${name}">
            Edit
        </button>
        <button class="button button--small button--danger delete-btn" 
                data-id="${id}"
                aria-label="Delete ${name}">
            Delete
        </button>
    `;
}

/**
 * Creates empty state message
 * @returns {string} HTML string for empty state
 */
function createEmptyState() {
    return `
        <tr>
            <td colspan="4" class="table__cell table__cell--empty">
                <div class="empty-state">
                    <p>No categories available</p>
                    <p class="empty-state__hint">Add a category using the form above</p>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Gets sort value for a table column
 * @param {HTMLTableRowElement} row - Table row element
 * @param {string} key - Sort key
 * @param {SortableTable} sortableTable - Sortable table instance
 * @returns {string|number} Sort value
 */
function getSortValue(row, key, sortableTable) {
    const columnIndex = sortableTable.getColumnIndex(key);
    
    switch (key) {
        case 'name':
            return row.cells[columnIndex].textContent.toLowerCase();
        case 'limit':
            const limitText = row.cells[columnIndex].textContent;
            return limitText === 'No Limit' ? -1 : parseInt(limitText);
        case 'created':
            return SortableTable.dateSortValue(row, columnIndex);
        default:
            return row.cells[columnIndex].textContent.toLowerCase();
    }
}