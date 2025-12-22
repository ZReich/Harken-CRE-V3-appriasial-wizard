// =================================================================
// STATE HELPER UTILITIES
// =================================================================

/**
 * Get a value from an object using dot-notation path
 * Supports array access like "scenarios[0].effectiveDate"
 */
export function getNestedValue<T = unknown>(obj: unknown, path: string): T | undefined {
  if (!obj || !path) return undefined;
  
  // Split path and handle array notation
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return current as T;
}

/**
 * Set a value in an object using dot-notation path
 * Returns a new object (immutable)
 */
export function setNestedValue<T extends object>(obj: T, path: string, value: unknown): T {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  
  const result = { ...obj };
  let current: Record<string, unknown> = result as Record<string, unknown>;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const isNextArray = /^\d+$/.test(nextKey);
    
    if (current[key] === undefined || current[key] === null) {
      current[key] = isNextArray ? [] : {};
    } else if (Array.isArray(current[key])) {
      current[key] = [...(current[key] as unknown[])];
    } else if (typeof current[key] === 'object') {
      current[key] = { ...(current[key] as Record<string, unknown>) };
    }
    
    current = current[key] as Record<string, unknown>;
  }
  
  current[keys[keys.length - 1]] = value;
  
  return result;
}

/**
 * Check if a value is "filled" (not null, undefined, or empty string)
 * For booleans (checkboxes), false means "not filled", true means "filled"
 */
export function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (typeof value === 'boolean') return value === true; // For checkboxes, only true = filled
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/**
 * Check if all required fields are filled in an object
 */
export function areFieldsFilled(obj: unknown, requiredFields: string[]): boolean {
  if (requiredFields.length === 0) return true;
  
  return requiredFields.every(field => {
    const value = getNestedValue(obj, field);
    return isFilled(value);
  });
}

/**
 * Calculate completion percentage based on required fields
 */
export function calculateFieldCompletion(obj: unknown, requiredFields: string[]): number {
  if (requiredFields.length === 0) return 100; // No requirements = complete
  
  const filledCount = requiredFields.filter(field => {
    const value = getNestedValue(obj, field);
    return isFilled(value);
  }).length;
  
  return Math.round((filledCount / requiredFields.length) * 100);
}

/**
 * Deep equality check for objects
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object' || a === null || b === null) {
    return a === b;
  }
  
  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => 
    deepEqual(
      (a as Record<string, unknown>)[key], 
      (b as Record<string, unknown>)[key]
    )
  );
}

