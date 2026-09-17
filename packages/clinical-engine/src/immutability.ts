function cloneJsonLike<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => cloneJsonLike(item)) as T;
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    output[key] = cloneJsonLike(item);
  }
  return output as T;
}

export function deepFreeze<T>(value: T): Readonly<T> {
  if (value === null || typeof value !== 'object') return value as Readonly<T>;
  Object.freeze(value);
  for (const nested of Object.values(value as Record<string, unknown>)) {
    if (nested !== null && typeof nested === 'object' && !Object.isFrozen(nested)) {
      deepFreeze(nested);
    }
  }
  return value as Readonly<T>;
}

export function immutableSnapshot<T>(value: T): Readonly<T> {
  return deepFreeze(cloneJsonLike(value));
}
