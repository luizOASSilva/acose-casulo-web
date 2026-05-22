'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type ConfirmVariant = 'default' | 'danger' | 'success';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(
  null
);

function getVariantStyles(variant: ConfirmVariant) {
  if (variant === 'danger') {
    return {
      icon: AlertTriangle,
      iconBox: 'bg-red-500/10 text-red-600',
      confirm:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
    };
  }

  if (variant === 'success') {
    return {
      icon: CheckCircle2,
      iconBox: 'bg-emerald-500/10 text-emerald-600',
      confirm:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600',
    };
  }

  return {
    icon: Info,
    iconBox: 'bg-primary/10 text-primary',
    confirm:
      'bg-primary text-white hover:brightness-110 focus-visible:outline-primary',
  };
}

export function ConfirmDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    variant: 'default',
  });

  const close = useCallback((result: boolean) => {
    setOpen(false);
    resolverRef.current?.(result);
    resolverRef.current = null;
  }, []);

  const confirm = useCallback((nextOptions: ConfirmOptions) => {
    setOptions({
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      variant: 'default',
      ...nextOptions,
    });

    setOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const variant = options.variant ?? 'default';
  const styles = getVariantStyles(variant);
  const Icon = styles.icon;

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby={
            options.description ? 'confirm-dialog-description' : undefined
          }
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => close(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-md border border-zinc-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconBox}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h2
                    id="confirm-dialog-title"
                    className="text-lg font-semibold leading-tight text-zinc-950"
                  >
                    {options.title}
                  </h2>

                  <button
                    type="button"
                    onClick={() => close(false)}
                    className="rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    aria-label="Fechar"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {options.description && (
                  <p
                    id="confirm-dialog-description"
                    className="mt-2 text-sm leading-relaxed text-zinc-600"
                  >
                    {options.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
              >
                {options.cancelText}
              </button>

              <button
                type="button"
                onClick={() => close(true)}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 ${styles.confirm}`}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error(
      'useConfirmDialog deve ser usado dentro de ConfirmDialogProvider'
    );
  }

  return context;
}
