const { TextEncoder, TextDecoder } = require('util');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Add TextEncoder to global scope
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const htmlContent = fs.readFileSync(
    path.resolve(__dirname, '../../../public/index.html'),
    'utf8'
);

const dom = new JSDOM(htmlContent, {
    url: 'http://localhost',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.fetch = jest.fn();
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};

// Mock message display
global.showMessage = jest.fn();

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = htmlContent;
});