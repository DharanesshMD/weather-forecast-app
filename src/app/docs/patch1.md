# Persistent Theme State Using `localStorage`

## Overview

This document outlines the implementation of a persistent theme state (dark or light mode) using the browser's `localStorage`. The theme state is stored in `localStorage`, ensuring that the user's theme preference is remembered even after the page is reloaded.

## Features

1. **Persistent Theme State Using `localStorage`:**
   - The theme state (dark or light mode) is stored in the browser's `localStorage`.
   - When the page loads, the initial theme state is set based on the value stored in `localStorage`. If `localStorage` contains `'dark'`, the app starts in dark mode; otherwise, it starts in light mode.

2. **Saving Theme State to `localStorage`:**
   - Whenever the user toggles the theme, the new theme state is saved to `localStorage`. This ensures that the theme setting is remembered even after the page is reloaded.

3. **Immediate Application of Theme Class:**
   - The theme class (`dark`) is applied to the document immediately when the component mounts, based on the initial state. This prevents the flicker that occurs when the theme changes.

4. **Ensuring Theme Consistency on Component Mount:**
   - The theme is set correctly from the start by applying the theme class in the `useEffect` hook that runs when the component mounts. This ensures that the theme is consistent and prevents any flicker.

## Implementation

### 1. Persistent Theme State Using `localStorage`

To ensure the theme state is persistent across page reloads, the theme state is stored in `localStorage`. When the component mounts, it checks `localStorage` to determine the initial theme state.

```javascript
const [isDarkMode, setIsDarkMode] = useState(() => {
  const storedTheme = localStorage.getItem('theme');
  return storedTheme === 'dark';
});

2. Saving Theme State to localStorage

Whenever the user toggles the theme, the new theme state is saved to localStorage. This ensures that the theme setting is remembered even after the page is reloaded.

useEffect(() => {
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}, [isDarkMode]);

3. Immediate Application of Theme Class

To prevent the flicker that occurs when the theme changes, the theme class (dark) is applied to the document immediately when the component mounts, based on the initial state.

useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDarkMode]);

4. Ensuring Theme Consistency on Component Mount

To ensure the theme is consistent and prevent any flicker, the theme class is applied in the useEffect hook that runs when the component mounts.

useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDarkMode]);

Summary
By using localStorage to store the theme state and applying the theme class immediately when the component mounts, we ensure that the theme is persistent across page reloads and consistent throughout the user's session. This approach prevents any flicker when the theme changes, providing a seamless user experience.

### About the Weather Result

When the site loads, it will initially prompt the user to enable location services. If the user denies location access or if there is no response, the site will automatically display the location based on the user's IP address.