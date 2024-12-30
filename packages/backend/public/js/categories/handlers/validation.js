/**
 * Category validation handlers
 * Provides validation logic for category-related inputs
 */

import { showMessage } from '../../utils.js';

// Validation constants
const CONSTANTS = {
    MIN_LENGTH: 3,
    MAX_LENGTH: 36,
    MIN_LETTERS: 3
};

/**
 * Validates a category name against all rules
 * @param {string} name - The category name to validate
 * @returns {Object} - Validation result {isValid: boolean, error: string|null}
 */
export function validateName(name) {
    const trimmedName = name.trim();
    
    // Length validation
    if (trimmedName.length < CONSTANTS.MIN_LENGTH) {
        return {
            isValid: false,
            error: `Category name must be at least ${CONSTANTS.MIN_LENGTH} characters long`
        };
    }

    if (trimmedName.length > CONSTANTS.MAX_LENGTH) {
        return {
            isValid: false,
            error: `Category name cannot exceed ${CONSTANTS.MAX_LENGTH} characters`
        };
    }

    // Letter count validation
    const letterCount = (trimmedName.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < CONSTANTS.MIN_LETTERS) {
        return {
            isValid: false,
            error: `Category name must include at least ${CONSTANTS.MIN_LETTERS} letters`
        };
    }

    // Word repetition validation
    const words = trimmedName.toLowerCase().split(' ');
    const uniqueWords = new Set(words);
    if (uniqueWords.size !== words.length) {
        return {
            isValid: false,
            error: 'Category name contains repeated words'
        };
    }

    // Special character validation
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
        return {
            isValid: false,
            error: 'Category name can only contain letters and spaces'
        };
    }

    return { isValid: true, error: null };
}

/**
 * Handles real-time validation during input
 * @param {Event} e - The input event
 * @param {CategoryManager} manager - The category manager instance
 */
export function validateCategoryName(e, manager) {
    const input = e.target;
    let value = input.value;

    // Prevent input longer than max length
    if (value.length > CONSTANTS.MAX_LENGTH) {
        input.value = value.slice(0, CONSTANTS.MAX_LENGTH);
        showMessage(`Input cannot exceed ${CONSTANTS.MAX_LENGTH} characters`, 'warning', 'category');
        return;
    }

    // Remove consecutive spaces as they type
    if (/\s{2,}/.test(value)) {
        input.value = value.replace(/\s{2,}/g, ' ');
    }

    // Check for repeated words
    const words = value.toLowerCase().split(' ');
    const uniqueWords = new Set(words);
    if (uniqueWords.size !== words.length) {
        showMessage('Input contains repeated words', 'warning', 'category');
    }

    // Convert to Title Case as they type
    input.value = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Validates the item limit value
 * @param {number|string} limit - The limit value to validate
 * @param {number} globalLimit - The global upper limit
 * @returns {Object} - Validation result {isValid: boolean, error: string|null}
 */
export function validateItemLimit(limit, globalLimit) {
    const limitNum = parseInt(limit);

    if (isNaN(limitNum)) {
        return {
            isValid: false,
            error: 'Item limit must be a number'
        };
    }

    if (limitNum < 0) {
        return {
            isValid: false,
            error: 'Item limit cannot be negative'
        };
    }

    if (limitNum > globalLimit) {
        return {
            isValid: false,
            error: `Item limit cannot exceed global limit of ${globalLimit}`
        };
    }

    return { isValid: true, error: null };
}