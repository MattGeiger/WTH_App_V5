/**
 * Entry point for the Categories module
 * Exports the CategoryManager class and related utilities
 */

export { CategoryManager } from './CategoryManager.js';

// Export additional utilities as needed
export { handleSubmit } from './handlers/submit.js';
export { validateCategoryName } from './handlers/validation.js';
export { createFormLayout } from './ui/forms.js';
export { createTableLayout } from './ui/table.js';
export { createStatsView } from './ui/stats.js';
export { formatLimit } from './utils/formatters.js';