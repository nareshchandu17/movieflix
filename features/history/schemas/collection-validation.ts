/**
 * @file collection-validation.ts
 * @description Production-grade validation logic for collection names across frontend and backend.
 */

export const MIN_COLLECTION_NAME_LENGTH = 4;
export const MAX_COLLECTION_NAME_LENGTH = 60;

export interface CollectionValidationResult {
  isValid: boolean;
  error: string | null;
  cleanName: string;
}

/**
 * Validates a collection name against production OTT rules.
 * @param name The raw input name
 * @param existingNames Array of existing collection names for duplicate checking (case-insensitive)
 * @returns Object with isValid, error message, and cleanName
 */
export function validateCollectionName(
  name: string,
  existingNames: string[] = []
): CollectionValidationResult {
  const trimmed = name.trim();
  const cleanName = trimmed.replace(/\s+/g, " ");

  if (!trimmed) {
    return {
      isValid: false,
      error: "Collection name is required.",
      cleanName,
    };
  }

  if (/\s{2,}/.test(name)) {
    return {
      isValid: false,
      error: "Collection name cannot contain consecutive spaces.",
      cleanName,
    };
  }

  if (trimmed.length < MIN_COLLECTION_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Collection name must contain at least ${MIN_COLLECTION_NAME_LENGTH} characters.`,
      cleanName,
    };
  }

  if (trimmed.length > MAX_COLLECTION_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Collection name must be under ${MAX_COLLECTION_NAME_LENGTH} characters.`,
      cleanName,
    };
  }

  const isDuplicate = existingNames.some(
    (existing) => existing.trim().replace(/\s+/g, " ").toLowerCase() === cleanName.toLowerCase()
  );

  if (isDuplicate) {
    return {
      isValid: false,
      error: "A collection with this name already exists.",
      cleanName,
    };
  }

  return {
    isValid: true,
    error: null,
    cleanName,
  };
}

/**
 * Escapes special characters in a string for use inside RegExp.
 * Prevents regex injection and regex syntax errors during database queries.
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
