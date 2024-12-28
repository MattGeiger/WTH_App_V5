import { showMessage } from '../../utils.js';

export const VALIDATION_RULES = {
    NAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 36,
        MIN_LETTERS: 3,
    }
};

export function validateName(name) {
    if (name.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
        showMessage('Food item name must be at least three characters long', 'error', 'foodItem');
        return false;
    }

    const letterCount = (name.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < VALIDATION_RULES.NAME.MIN_LETTERS) {
        showMessage('Food item name must include at least three letters', 'error', 'foodItem');
        return false;
    }

    const words = name.toLowerCase().split(' ');
    const uniqueWords = new Set(words);
    if (uniqueWords.size !== words.length) {
        showMessage('Food item name contains repeated words', 'error', 'foodItem');
        return false;
    }

    return true;
}

export function handleNameInput(input) {
    let value = input.value;

    if (value.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
        value = value.slice(0, VALIDATION_RULES.NAME.MAX_LENGTH);
        showMessage('Input cannot exceed 36 characters', 'warning', 'foodItem');
    }

    if (/\s{2,}/.test(value)) {
        value = value.replace(/\s{2,}/g, ' ');
    }

    const words = value.toLowerCase().split(' ');
    const uniqueWords = new Set(words);
    if (uniqueWords.size !== words.length) {
        showMessage('Input contains repeated words', 'warning', 'foodItem');
    }

    return value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}