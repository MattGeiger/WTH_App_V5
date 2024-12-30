/**
 * Coverage configuration for Categories module
 * Defines thresholds, directory paths, and component structure
 */
module.exports = {
    // Coverage output configuration
    coverageDirectory: './coverage',
    reportTemplateFile: './template/coverage-template.md',
    outputDirectory: './reports',
    
    // Coverage thresholds for quality gates
    coverageThresholds: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80
        },
        // Component-specific thresholds
        components: {
            handlers: {
                statements: 85,
                branches: 85,
                functions: 85,
                lines: 85
            },
            ui: {
                statements: 75,
                branches: 75,
                functions: 75,
                lines: 75
            }
        }
    },

    // Component structure for reporting
    components: {
        handlers: [
            'submit.js',
            'validation.js',
            'formData.js'
        ],
        ui: [
            'forms.js',
            'table.js',
            'stats.js'
        ],
        manager: [
            'CategoryManager.js'
        ]
    },

    // Path mappings for component locations
    pathMappings: {
        handlers: 'handlers',
        ui: 'ui',
        manager: '.'
    },

    // Report configuration
    reportConfig: {
        includeUncoveredFiles: true,
        showLineNumbers: true,
        groupByComponent: true,
        sortByUncovered: true
    }
};