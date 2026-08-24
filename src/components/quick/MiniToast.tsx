import { createContext, useCallback, useContext, useState } from "react";

const ToastCtx = createContext<(msg: string) => void>(() => {});

/** 手机壳内的轻量提示，用于快捷入口各页的操作反馈 */
export function MiniToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useCallback((text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 1700);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {msg && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-[80] -translate-x-1/2 px-6">
          <div className="whitespace-nowrap rounded-2xl bg-foreground/90 px-4 py-2.5 text-[15px] font-bold text-background shadow-lg">
            {msg}
          </div>
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export function useMiniToast() {
  return useContext(ToastCtx);
}
