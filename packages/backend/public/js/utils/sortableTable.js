export class SortableTable {
    constructor(tableBodyId, getSortValue = null) {
        this.tableBody = document.getElementById(tableBodyId);
        this.currentSort = {
            column: null,
            direction: 'asc'
        };
        this.getSortValue = getSortValue || ((a, key) => {
            const value = a.cells[this.getColumnIndex(key)].textContent;
            return isNaN(value) ? value.toLowerCase() : parseFloat(value);
        });
    }

    getColumnIndex(key) {
        const headers = this.tableBody.closest('table').querySelectorAll('th');
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].getAttribute('data-sort') === key) {
                return i;
            }
        }
        return -1;
    }

    setupSortingControls() {
        const table = this.tableBody.closest('table');
        const headers = table.querySelectorAll('th[data-sort]');
        
        headers.forEach(header => {
            // Add sort direction indicator
            const sortKey = header.getAttribute('data-sort');
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.textContent = ' ↕';
            header.appendChild(indicator);
            
            // Add click handler
            header.addEventListener('click', () => {
                headers.forEach(h => {
                    if (h !== header) {
                        h.querySelector('.sort-indicator').textContent = ' ↕';
                    }
                });
                
                if (this.currentSort.column === sortKey) {
                    this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    this.currentSort.column = sortKey;
                    this.currentSort.direction = 'asc';
                }
                
                indicator.textContent = this.currentSort.direction === 'asc' ? ' ↑' : ' ↓';
                this.sortTable();
            });
        });
    }

    sortTable(data = null) {
        if (!this.currentSort.column) return;

        const rows = data ? data : Array.from(this.tableBody.rows);
        const sortedRows = rows.sort((a, b) => {
            const aVal = this.getSortValue(a, this.currentSort.column);
            const bVal = this.getSortValue(b, this.currentSort.column);
            
            if (aVal === bVal) return 0;
            
            const comparison = aVal < bVal ? -1 : 1;
            return this.currentSort.direction === 'asc' ? comparison : -comparison;
        });

        // Clear table body
        while (this.tableBody.firstChild) {
            this.tableBody.removeChild(this.tableBody.firstChild);
        }

        // Append sorted rows
        sortedRows.forEach(row => this.tableBody.appendChild(row));
    }

    // Custom sort value getters for specific data types
    static dateSortValue(row, columnIndex) {
        return new Date(row.cells[columnIndex].textContent).getTime();
    }

    static numberSortValue(row, columnIndex) {
        const text = row.cells[columnIndex].textContent;
        return text === 'No Limit' ? Infinity : parseFloat(text);
    }

    static booleanSortValue(row, columnIndex) {
        return row.cells[columnIndex].textContent.toLowerCase() === 'true';
    }
}