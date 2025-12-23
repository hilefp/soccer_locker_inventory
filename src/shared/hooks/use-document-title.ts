import { useEffect, useRef } from 'react';

/**
 * Custom hook to dynamically update the document title
 * @param title - The page title (will be appended with " | Soccer Locker Management")
 * @param options - Configuration options
 */
export function useDocumentTitle(
  title: string,
  options?: {
    /** If true, uses the title as-is without appending the app name */
    raw?: boolean;
    /** If true, restores the previous title when component unmounts */
    restoreOnUnmount?: boolean;
  }
) {
  const { raw = false, restoreOnUnmount = false } = options || {};
  const prevTitleRef = useRef<string>(document.title);

  useEffect(() => {
    const previousTitle = prevTitleRef.current;

    // Update the document title
    if (title) {
      document.title = raw ? title : `${title} | Soccer Locker Management`;
    }

    // Restore previous title on unmount if requested
    return () => {
      if (restoreOnUnmount && previousTitle) {
        document.title = previousTitle;
      }
    };
  }, [title, raw, restoreOnUnmount]);
}
