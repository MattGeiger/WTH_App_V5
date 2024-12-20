export const ErrorTypes = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL: 500
} as const;

export const ErrorMessages = {
  // Entity not found
  CATEGORY_NOT_FOUND: 'Category not found',
  FOOD_ITEM_NOT_FOUND: 'Food item not found',
  TRANSLATION_NOT_FOUND: 'Translation not found',
  LANGUAGE_NOT_FOUND: 'Language not found',
  SETTING_NOT_FOUND: 'Setting not found',

  // Invalid inputs
  INVALID_CATEGORY: 'Invalid category ID',
  INVALID_LANGUAGE: 'Invalid or inactive language code',
  INVALID_LIMIT_TYPE: 'Invalid limit type',
  
  // Operation errors
  CREATE_ERROR: (entity: string) => `Error creating ${entity}`,
  UPDATE_ERROR: (entity: string) => `Error updating ${entity}`,
  DELETE_ERROR: (entity: string) => `Error deleting ${entity}`,
  TRANSLATION_ERROR: (lang: string) => `Error generating translation for language: ${lang}`
} as const;