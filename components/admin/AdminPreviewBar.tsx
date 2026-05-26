'use client';

import Link from 'next/link';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/api';

const PREVIEW_ACTIVE_KEY = 'admin.preview.active';
const PREVIEW_RETURN_TO_KEY = 'admin.preview.returnTo';

function normalizeReturnTo(value?: string | null) {
  if (!value) return '/admin/dashboard';

  if (!value.startsWith('/admin')) {
    return '/admin/dashboard';
  }

  return value;
}

export default function AdminPreviewBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsString = useMemo(
    () => searchParams.toString(),
    [searchParams]
  );

  const [isVisible, setIsVisible] = useState(false);
  const [returnTo, setReturnTo] = useState('/admin/dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function setupPreviewBar() {
      const params = new URLSearchParams(searchParamsString);

      const isPreviewByUrl = params.get('adminPreview') === '1';
      const hasPreviewUrlParams =
        params.has('adminPreview') && params.has('returnTo');

      const urlReturnTo = normalizeReturnTo(params.get('returnTo'));

      if (isPreviewByUrl) {
        sessionStorage.setItem(PREVIEW_ACTIVE_KEY, '1');
        sessionStorage.setItem(PREVIEW_RETURN_TO_KEY, urlReturnTo);

        if (!params.get('t')) {
          params.set('t', String(Date.now()));

          const query = params.toString();

          router.replace(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
          });
        }

        if (!cancelled) {
          setReturnTo(urlReturnTo);
          setIsVisible(true);
        }

        return;
      }

      const storedActive = sessionStorage.getItem(PREVIEW_ACTIVE_KEY) === '1';
      const storedReturnTo = normalizeReturnTo(
        sessionStorage.getItem(PREVIEW_RETURN_TO_KEY)
      );

      if (storedActive) {
        if (!hasPreviewUrlParams) {
          params.set('adminPreview', '1');
          params.set('returnTo', storedReturnTo);
          params.set('t', String(Date.now()));

          const query = params.toString();

          router.replace(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
          });
        }

        if (!cancelled) {
          setReturnTo(storedReturnTo);
          setIsVisible(true);
        }

        return;
      }

      try {
        await api.get('/auth/me');

        const fallbackReturnTo = '/admin/dashboard';

        sessionStorage.setItem(PREVIEW_ACTIVE_KEY, '1');
        sessionStorage.setItem(PREVIEW_RETURN_TO_KEY, fallbackReturnTo);

        params.set('adminPreview', '1');
        params.set('returnTo', fallbackReturnTo);
        params.set('t', String(Date.now()));

        const query = params.toString();

        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });

        if (!cancelled) {
          setReturnTo(fallbackReturnTo);
          setIsVisible(true);
        }
      } catch {
        if (!cancelled) {
          setIsVisible(false);
        }
      }
    }

    setupPreviewBar();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParamsString]);

  function handleRefresh() {
    setIsRefreshing(true);

    const params = new URLSearchParams(searchParams.toString());

    params.set('adminPreview', '1');
    params.set('returnTo', returnTo);
    params.set('t', String(Date.now()));

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });

    router.refresh();

    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 650);
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="admin-preview-bar"
          initial={{
            opacity: 0,
            y: 28,
            scale: 0.96,
            filter: 'blur(6px)',
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
          }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.96,
            filter: 'blur(6px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 34,
            mass: 0.8,
          }}
          className="fixed bottom-4 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
        >
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-white/95 shadow-xl backdrop-blur">
            <motion.div
              animate={{
                opacity: isRefreshing ? 0.72 : 1,
              }}
              transition={{
                duration: 0.2,
              }}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-800">
                  Visualizando o site como administrador
                </p>

                <p className="mt-0.5 text-xs text-zinc-500">
                  As alterações recentes podem ser atualizadas por aqui.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 active:scale-95 disabled:cursor-wait disabled:opacity-70"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                    aria-hidden="true"
                  />
                  {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                </button>

                <Link
                  href={returnTo}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110 active:scale-95"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                  Painel
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={false}
              animate={{
                scaleX: isRefreshing ? 1 : 0,
                opacity: isRefreshing ? 1 : 0,
              }}
              transition={{
                duration: 0.65,
                ease: 'easeInOut',
              }}
              className="h-0.5 origin-left bg-primary"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
