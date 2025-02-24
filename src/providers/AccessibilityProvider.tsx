import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface AccessibilityContextType {
  announceToScreenReader: (message: string) => void;
  setFocus: (elementId: string) => void;
  trapFocus: (containerId: string, active: boolean) => void;
  isReducedMotion: boolean;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(
  null
);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }
  return context;
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslations();
  const [highContrast, setHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const announcerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Check user's motion preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionPreference = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionPreference);
    return () =>
      mediaQuery.removeEventListener('change', handleMotionPreference);
  }, []);

  useEffect(() => {
    // Apply high contrast mode
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const announceToScreenReader = (message: string) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = '';
      // Force a reflow
      void announcerRef.current.offsetHeight;
      announcerRef.current.textContent = message;
    }
  };

  const setFocus = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element && 'focus' in element) {
      (element as HTMLElement).focus();
    }
  };

  const trapFocus = (containerId: string, active: boolean) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (active) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
              e.preventDefault();
              lastFocusable.focus();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              e.preventDefault();
              firstFocusable.focus();
            }
          }
        }
      };

      container.addEventListener('keydown', handleKeyDown);
      firstFocusable.focus();

      return () => {
        container.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocusedRef.current) {
          previouslyFocusedRef.current.focus();
        }
      };
    }
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        announceToScreenReader,
        setFocus,
        trapFocus,
        isReducedMotion,
        highContrast,
        toggleHighContrast,
      }}
    >
      <div
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      {children}
    </AccessibilityContext.Provider>
  );
}
