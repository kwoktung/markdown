import { useState, useCallback, useRef, useEffect } from "react";
import { getCookie, setCookie, removeCookie } from "#/lib/cookie";

export interface UseCookieStorageStateOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  cookieOptions?: Cookies.CookieAttributes;
}

export function useCookieStorageState<T>(
  key: string,
  defaultValue: T,
  options: UseCookieStorageStateOptions<T> = {},
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    cookieOptions,
  } = options;

  const readValue = (): T => {
    try {
      const raw = getCookie(key);
      if (raw === undefined) return defaultValue;
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
        setCookie(key, serializer(valueToStore), cookieOptions);
      } catch (error) {
        console.warn(`Failed to write cookie "${key}":`, error);
      }
    },
    [key, serializer, cookieOptions],
  );

  const removeValue = useCallback(() => {
    removeCookie(key, cookieOptions);
    setStoredValue(defaultValue);
  }, [key, defaultValue, cookieOptions]);

  return [storedValue, setValue, removeValue];
}
