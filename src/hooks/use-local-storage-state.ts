import { useState, useCallback, useRef, useEffect } from "react";

export interface UseLocalStorageStateOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageStateOptions<T> = {},
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { serializer = JSON.stringify, deserializer = JSON.parse } = options;

  const readValue = (): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return deserializer(raw) as T;
    } catch {
      return defaultValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const storedValueRef = useRef(storedValue);
  useEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValueRef.current) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, serializer(valueToStore));
      } catch (error) {
        console.warn(`Failed to write localStorage "${key}":`, error);
      }
    },
    [key, serializer],
  );

  const removeValue = useCallback(() => {
    localStorage.removeItem(key);
    setStoredValue(defaultValue);
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue];
}
