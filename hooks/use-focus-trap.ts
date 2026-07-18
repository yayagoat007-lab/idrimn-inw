import { useEffect, useRef, RefObject } from 'react';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose?: () => void;
}

export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!options.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key
      if (e.key === 'Escape' && options.onClose) {
        options.onClose();
        return;
      }

      if (e.key !== 'Tab' || !ref.current) return;

      const focusableElements = ref.current.querySelectorAll<HTMLElement>(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    // Store current active element to restore focus on unmount
    const previousActiveElement = document.activeElement as HTMLElement;

    // Focus on the first focusable element inside the modal
    if (ref.current) {
      const focusableElements = ref.current.querySelectorAll<HTMLElement>(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };
  }, [options.isOpen, options.onClose]);

  return ref;
}

export default useFocusTrap;
