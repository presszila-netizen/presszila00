// Reserve the compact menu's final layout before the deferred navigation script runs.
// If that script cannot load, restore the fully visible, usable navigation.
document.documentElement.classList.add('nav-pending');
setTimeout(() => document.documentElement.classList.remove('nav-pending'), 3500);

// Apply the saved preference before painting. A blocked store keeps the light default.
try {
  const theme = localStorage.getItem('presszilaTheme');
  if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme;
} catch { /* Storage is optional. */ }
