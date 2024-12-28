const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CoverageReportGenerator {
    constructor() {
        this.coverageData = null;
        this.template = '';
        this.outputPath = path.join(__dirname, '..', 'coverage-report.md');
        this.templatePath = path.join(__dirname, '..', 'coverage-template.md');
    }

    async generate() {
        try {
            // Run tests with coverage
            console.log('Running tests with coverage...');
            execSync('npm run test:fooditems:coverage', { stdio: 'inherit' });

            // Read coverage data
            console.log('Reading coverage data...');
            const coverageJson = fs.readFileSync(
                path.join(__dirname, '..', 'coverage', 'coverage-final.json'),
                'utf8'
            );
            this.coverageData = JSON.parse(coverageJson);

            // Read template
            console.log('Reading template...');
            this.template = fs.readFileSync(this.templatePath, 'utf8');

            // Generate report
            console.log('Generating report...');
            const report = this.generateReport();

            // Write report
            console.log('Writing report...');
            fs.writeFileSync(this.outputPath, report);

            console.log(`Coverage report generated at ${this.outputPath}`);
            return true;
        } catch (error) {
            console.error('Error generating coverage report:', error);
            return false;
        }
    }

    generateReport() {
        let report = this.template;

        // Replace date placeholders
        const now = new Date();
        report = report.replace('{DATE}', now.toLocaleDateString());
        report = report.replace('{TIMESTAMP}', now.toISOString());

        // Calculate and replace coverage metrics
        const components = {
            handlers: {
                'submit.js': 'SUBMIT',
                'validation.js': 'VAL',
                'formData.js': 'FORM'
            },
            ui: {
                'forms.js': 'UI_FORMS',
                'table.js': 'UI_TABLE',
                'stats.js': 'UI_STATS'
            },
            manager: {
                'FoodItemManager.js': 'MGR'
            }
        };

        // Replace component coverage
        for (const [category, files] of Object.entries(components)) {
            for (const [file, prefix] of Object.entries(files)) {
                const coverage = this.getComponentCoverage(category, file);
                report = this.replaceCoverageMetrics(report, prefix, coverage);
            }
        }

        // Calculate total coverage
        const totalCoverage = this.calculateTotalCoverage();
        report = report.replace('{COVERAGE_PERCENTAGE}', totalCoverage.toFixed(2));

        return report;
    }

    getComponentCoverage(category, filename) {
        const filePath = path.join('public/js/foodItems', category, filename);
        const fileData = this.coverageData[filePath];

        if (!fileData) {
            return {
                statements: 0,
                branches: 0,
                functions: 0,
                lines: 0,
                uncovered: []
            };
        }

        const uncoveredLines = Object.entries(fileData.statementMap)
            .filter(([key]) => !fileData.s[key])
            .map(([_, loc]) => loc.start.line);

        return {
            statements: this.calculatePercentage(fileData.s),
            branches: this.calculatePercentage(fileData.b),
            functions: this.calculatePercentage(fileData.f),
            lines: this.calculatePercentage(fileData.l),
            uncovered: uncoveredLines.join(', ')
        };
    }

    replaceCoverageMetrics(report, prefix, coverage) {
        return report
            .replace(`{${prefix}_STMT}`, coverage.statements.toFixed(2))
            .replace(`{${prefix}_BRANCH}`, coverage.branches.toFixed(2))
            .replace(`{${prefix}_FUNC}`, coverage.functions.toFixed(2))
            .replace(`{${prefix}_LINES}`, coverage.lines.toFixed(2))
            .replace(`{${prefix}_UNCOVERED}`, coverage.uncovered);
    }

    calculatePercentage(data) {
        if (typeof data === 'object') {
            const covered = Object.values(data).filter(v => v > 0).length;
            const total = Object.values(data).length;
            return (covered / total) * 100 || 0;
        }
        return 0;
    }

    calculateTotalCoverage() {
        let totalStatements = 0;
        let coveredStatements = 0;

        Object.values(this.coverageData).forEach(file => {
            Object.values(file.s).forEach(covered => {
                totalStatements++;
                if (covered > 0) coveredStatements++;
            });
        });

        return (coveredStatements / totalStatements) * 100 || 0;
    }
}

// Run if called directly
if (require.main === module) {
    const generator = new CoverageReportGenerator();
    generator.generate();
}

module.exports = CoverageReportGenerator;