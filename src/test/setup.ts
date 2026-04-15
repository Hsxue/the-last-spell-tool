import '@testing-library/jest-dom';
import i18n from '@/i18n/config'; // Initialize i18n for all tests

// i18n resources are statically imported in the config,
// so they're available synchronously. Set default language.
void i18n.changeLanguage('en');
