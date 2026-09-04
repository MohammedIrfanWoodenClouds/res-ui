import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, opts = {}) => {
      const id = ++toastId;
      const toast = {
        id,
        message,
        title: opts.title || '',
        type: opts.type || 'info', // info | success | warning
        duration: opts.duration ?? 6000,
      };
      setToasts((list) => [...list, toast]);
      if (toast.duration > 0) {
        setTimeout(() => remove(id), toast.duration);
      }
      return id;
    },
    [remove]
  );

  const value = useMemo(() => ({ push, remove }), [push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border shadow-lg px-4 py-3 bg-white animate-[slideIn_.25s_ease]
              ${t.type === 'success' ? 'border-emerald-200' : ''}
              ${t.type === 'warning' ? 'border-amber-200' : ''}
              ${t.type === 'info' ? 'border-blue-200' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0
                  ${t.type === 'success' ? 'bg-emerald-500' : ''}
                  ${t.type === 'warning' ? 'bg-amber-500' : ''}
                  ${t.type === 'info' ? 'bg-blue-500' : ''}
                `}
              />
              <div className="flex-1 min-w-0">
                {t.title && <div className="font-semibold text-sm">{t.title}</div>}
                <div className={`text-sm text-slate-600 ${t.title ? 'mt-0.5' : ''}`}>{t.message}</div>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 text-sm"
                onClick={() => remove(t.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
