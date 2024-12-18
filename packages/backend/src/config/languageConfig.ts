export const LanguageConfig = {
    DEFAULT_LANGUAGE: 'en',
    SUPPORTED_LANGUAGES: [
        { code: 'ar', name: 'Arabic' },
        { code: 'bn', name: 'Bengali' },
        { code: 'de', name: 'German' },
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'hi', name: 'Hindi' },
        { code: 'id', name: 'Indonesian' },
        { code: 'it', name: 'Italian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'ms', name: 'Malay' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'th', name: 'Thai' },
        { code: 'tr', name: 'Turkish' },
        { code: 'uk', name: 'Ukrainian' },
        { code: 'ur', name: 'Urdu' },
        { code: 'vi', name: 'Vietnamese' },
        { code: 'zh', name: 'Chinese' }
    ]
};

export const isValidLanguageCode = (code: string): boolean => {
    return LanguageConfig.SUPPORTED_LANGUAGES.some(lang => lang.code === code);
};

export const getLanguageName = (code: string): string => {
    const language = LanguageConfig.SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : code;
};