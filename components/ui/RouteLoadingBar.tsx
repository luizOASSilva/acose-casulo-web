'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const ADMIN_ONLY = true;

function isModifiedEvent(event: MouseEvent) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function getAnchorFromEvent(event: MouseEvent): HTMLAnchorElement | null {
  const target = event.target;

  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest('a');
}

function isInternalNavigation(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href');

  if (!href) return false;
  if (href.startsWith('#')) return false;
  if (href.startsWith('mailto:')) return false;
  if (href.startsWith('tel:')) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;

  try {
    const url = new URL(anchor.href);

    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export default function RouteLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadingRef = useRef(false);
  const currentUrlRef = useRef('');

  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTimers() {
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }

    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function shouldShowForPath(path: string) {
    if (!ADMIN_ONLY) return true;

    return path.startsWith('/admin');
  }

  function startLoading(nextPath?: string) {
    const path = nextPath || window.location.pathname;

    if (!shouldShowForPath(path)) {
      return;
    }

    clearTimers();

    loadingRef.current = true;
    setVisible(true);
    setProgress(6);

    startTimeoutRef.current = setTimeout(() => {
      setProgress(18);
    }, 80);

    intervalRef.current = setInterval(() => {
      setProgress((current) => {
        if (current < 32) return current + 5;
        if (current < 55) return current + 3;
        if (current < 74) return current + 2;
        if (current < 88) return current + 0.8;

        return current;
      });
    }, 180);
  }

  function finishLoading() {
    if (!loadingRef.current) return;

    loadingRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setProgress(96);

    finishTimeoutRef.current = setTimeout(() => {
      setProgress(100);

      resetTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 220);
    }, 120);
  }

  useEffect(() => {
    const query = searchParams.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;

    if (!currentUrlRef.current) {
      currentUrlRef.current = nextUrl;
      return;
    }

    if (currentUrlRef.current !== nextUrl) {
      currentUrlRef.current = nextUrl;
      finishLoading();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (isModifiedEvent(event)) return;

      const anchor = getAnchorFromEvent(event);

      if (!anchor) return;
      if (!isInternalNavigation(anchor)) return;

      const nextUrl = new URL(anchor.href);
      const currentUrl = new URL(window.location.href);

      const isSameRoute =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search;

      if (isSameRoute) return;

      startLoading(nextUrl.pathname);
    }

    function handlePopState() {
      startLoading(window.location.pathname);
    }

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      clearTimers();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`
        pointer-events-none fixed left-0 top-0 z-[9999] h-[2px] w-full overflow-hidden
        transition-opacity duration-200
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div
        className="
          h-full rounded-r-full bg-primary
          shadow-[0_0_10px_rgba(194,72,0,0.45)]
          transition-[width] duration-300 ease-out
        "
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
