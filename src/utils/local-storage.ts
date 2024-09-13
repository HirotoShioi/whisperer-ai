// src/utils/localStorageUtils.ts
export const saveToLocalStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const loadFromLocalStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const deleteFromLocalStorage = (key: string) => {
  localStorage.removeItem(key);
};
