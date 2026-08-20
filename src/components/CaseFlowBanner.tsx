import { Activity, AlertTriangle, ChevronRight } from "lucide-react";
import { STAGE_STEPS, stageIndex, useCaseFlow, getDemoPatient, DEMO_PATIENT_NAME } from "@/lib/case-flow";
import { cn } from "@/lib/utils";

/**
 * 全流程演示进度条 —— 各角色端共用，展示「杨阳」这条闭环病例当前所处环节与下一步动作。
 */
export function CaseFlowBanner({ hint, onAction, actionLabel }: { hint?: string; onAction?: () => void; actionLabel?: string }) {
  const flow = useCaseFlow();
  if (!flow.created) return null;
  const p = getDemoPatient();
  const idx = stageIndex(flow.stage);

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/30 bg-primary/5">
      <div className="flex items-center justify-between gap-2 border-b border-primary/20 px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate text-[11px] font-semibold text-primary">
            全流程演示 · {p?.name ?? DEMO_PATIENT_NAME}
            {p?.bedNo ? ` · ${p.bedNo}床` : ""}
          </span>
        </div>
        {flow.abnormal.length > 0 && (
          <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive">
            <AlertTriangle className="h-2.5 w-2.5" />异常 {flow.abnormal.length}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2">
        {STAGE_STEPS.map((s, i) => (
          <div key={s.key} className="flex shrink-0 items-center gap-1">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-medium",
                i < idx && "bg-success/15 text-success",
                i === idx && "bg-primary text-primary-foreground",
                i > idx && "bg-muted text-muted-foreground",
              )}
            >
              {s.label}
            </span>
            {i < STAGE_STEPS.length - 1 && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {(hint || onAction) && (
        <div className="flex items-center justify-between gap-2 border-t border-primary/20 bg-card/60 px-3 py-2">
          <div className="min-w-0 flex-1 text-[10px] text-muted-foreground">{hint}</div>
          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** 异常指标面板 —— 多端共享，值班医生 / 护士 / 治疗师 录入的异常在此汇总 */
export function AbnormalPanel({ compact }: { compact?: boolean }) {
  const flow = useCaseFlow();
  if (!flow.created || flow.abnormal.length === 0) return null;
  const list = compact ? flow.abnormal.slice(0, 3) : flow.abnormal;
  return (
    <div className="overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/5">
      <div className="flex items-center gap-1.5 border-b border-destructive/20 px-3 py-2 text-[11px] font-semibold text-destructive">
        <AlertTriangle className="h-3.5 w-3.5" />
        异常指标（多端同步）· {flow.abnormal.length} 项
      </div>
      <div className="divide-y divide-destructive/10">
        {list.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-2 px-3 py-2">
            <div className="min-w-0">
              <div className="text-[11px] font-medium">{a.label}</div>
              <div className="text-[9px] text-muted-foreground">
                {a.source} · {a.at}
                {a.note ? ` · ${a.note}` : ""}
              </div>
            </div>
            <span className="shrink-0 rounded-md bg-destructive/15 px-1.5 py-0.5 text-[11px] font-bold text-destructive">
              {a.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
