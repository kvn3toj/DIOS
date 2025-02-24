import { useAccessibility } from '@/providers/AccessibilityProvider';
import { useTranslations } from '@/hooks/useTranslations';

export default function AccessibilitySettings() {
  const { t } = useTranslations();
  const { highContrast, toggleHighContrast, isReducedMotion } =
    useAccessibility();

  return (
    <div
      role="region"
      aria-label={t('accessibility.settings')}
      className="p-4 space-y-4 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <h2 className="text-xl font-semibold" id="accessibility-settings">
        {t('accessibility.settings')}
      </h2>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="high-contrast"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <span>{t('accessibility.highContrast')}</span>
            <button
              id="high-contrast"
              role="switch"
              aria-checked={highContrast}
              onClick={toggleHighContrast}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleHighContrast();
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                highContrast ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              tabIndex={0}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
              <span className="sr-only">
                {highContrast
                  ? t('accessibility.highContrastEnabled')
                  : t('accessibility.highContrastDisabled')}
              </span>
            </button>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>{t('accessibility.reducedMotion')}</span>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                isReducedMotion
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
              role="status"
            >
              {isReducedMotion
                ? t('accessibility.systemEnabled')
                : t('accessibility.systemDisabled')}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <h3 className="font-medium mb-2">
          {t('accessibility.keyboardShortcuts')}
        </h3>
        <ul className="space-y-1 list-disc list-inside" role="list">
          <li>
            <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              Tab
            </kbd>{' '}
            {t('accessibility.tabDescription')}
          </li>
          <li>
            <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              Shift + Tab
            </kbd>{' '}
            {t('accessibility.shiftTabDescription')}
          </li>
          <li>
            <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              Enter
            </kbd>{' '}
            {t('accessibility.enterDescription')}
          </li>
          <li>
            <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              Space
            </kbd>{' '}
            {t('accessibility.spaceDescription')}
          </li>
        </ul>
      </div>
    </div>
  );
}
