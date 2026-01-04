// src/utils/auth.js
const USER_KEY = 'foodwastage_user';

export const setCurrentUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};