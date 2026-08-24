import { ArrowLeft } from "lucide-react";
import { MiniToastProvider } from "@/components/quick/MiniToast";

/**
 * 快捷入口二级页统一外壳（全屏、适老化大字号）。
 * 各业务视图只负责内容区（自带 padding），滚动由外壳负责。
 */
export function QuickSheet({
  title,
  subtitle,
  right,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-2 border-b bg-card px-3 py-2.5">
        <button onClick={onClose} aria-label="返回" className="grid size-9 shrink-0 place-items-center rounded-full bg-muted">
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[19px] font-bold">{title}</div>
          {subtitle && <div className="truncate text-[13px] text-muted-foreground">{subtitle}</div>}
        </div>
        {right}
      </div>
      <MiniToastProvider>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </MiniToastProvider>
    </div>
  );
}

/** 轻量 toast（相对手机壳定位） */
export function QuickToast({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-16 z-[60] -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-[14px] font-bold text-background shadow-lg">
      {text}
    </div>
  );
}
