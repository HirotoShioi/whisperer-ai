import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { SmoothScroller } from "./smooth-scroller";

export type UseAutoScrollProps = {
  enabled?: boolean;
};
/**
 * Automatically scroll a container to the bottom as new
 * content is added to it.
 */
export function useAutoScroll({ enabled = true }: UseAutoScrollProps = {}) {
  // Store container element in state so that we can
  // mount/dismount handlers via `useEffect` (see below)
  const [container, setContainer] = useState<HTMLDivElement>();

  const scroller = useMemo(() => {
    if (container) {
      return new SmoothScroller(container);
    }
  }, [container]);

  // Maintain `isSticky` state for the consumer to access
  const [isSticky, setIsSticky] = useState(true);

  // Maintain `isStickyRef` value for internal use
  // that isn't limited to React's state lifecycle
  const isStickyRef = useRef(isSticky);

  const ref = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      setContainer(element);
    }
  }, []);

  // Convenience function to allow consumers to
  // scroll to the bottom of the container
  const scrollToEnd = useCallback(() => {
    if (container && scroller) {
      isStickyRef.current = true;

      // Update state so that consumers can hook into sticky status
      setIsSticky(isStickyRef.current);

      // TODO: support duration greater than 0
      scroller.scrollTo(container.scrollHeight - container.clientHeight, 0);
    }
  }, [container, scroller]);

  useEffect(() => {
    let resizeObserver: ResizeObserver | undefined;
    let mutationObserver: MutationObserver | undefined;
    let lastScrollTop: number;
    let lastScrollHeight: number;

    function onScrollStart() {
      if (container && scroller) {
        // TODO: understand where these phantom scroll/height changes occur
        if (
          lastScrollHeight !== undefined &&
          container.scrollHeight !== lastScrollHeight
        ) {
          return;
        }

        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight;
        const hasScrolledUp = container.scrollTop < lastScrollTop;

        if (hasScrolledUp) {
          scroller.cancel();
        }

        // We're sticky if we're in the middle of an automated scroll
        // or if the user manually scrolled to the bottom
        isStickyRef.current =
          !hasScrolledUp && (scroller.isAnimating || isAtBottom);

        // Update state so that consumers can hook into sticky status
        setIsSticky(isStickyRef.current);
      }
    }

    if (container) {
      container.addEventListener("scroll", onScrollStart);

      if (enabled) {
        // Scroll when the container's children resize
        resizeObserver = new ResizeObserver(() => {
          lastScrollTop = container.scrollTop;
          lastScrollHeight = container.scrollHeight;

          if (isStickyRef.current) {
            scrollToEnd();
          }
        });

        // Monitor the size of the children within the scroll container
        for (const child of Array.from(container.children)) {
          resizeObserver.observe(child);
        }
      }
    }

    return () => {
      container?.removeEventListener("scroll", onScrollStart);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [container, scroller, scrollToEnd, enabled]);

  return { ref, isSticky, scrollToEnd };
}

export function useAsyncMemo<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList,
  initialValue: T | undefined = undefined
) {
  const [value, setValue] = useState<T | undefined>(initialValue);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const hasBeenCancelled = useRef(false);

  useEffect(() => {
    hasBeenCancelled.current = false;
    setLoading(true);

    asyncFunction()
      .then((result) => {
        if (!hasBeenCancelled.current) {
          setValue(result);
          setError(undefined);
        }
      })
      .catch((err) => {
        if (!hasBeenCancelled.current) {
          setError(err);
        }
      })
      .finally(() => {
        if (!hasBeenCancelled.current) {
          setLoading(false);
        }
      });

    return () => {
      hasBeenCancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { value, error, loading };
}
