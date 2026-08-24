import { useMemo, useState } from "react";
import {
  Pill, Camera, Plus, X, CheckCircle2, Ban, Clock, CalendarDays,
  AlertTriangle, FileText, Sparkles, History, ScanLine,
} from "lucide-react";
import { QuickSheet, QuickToast } from "@/components/quick/QuickSheet";

type Med = {
  id: string;
  name: string;
  spec: string;
  dose: string;
  freq: string;
  times: string[];
  purpose: string;
  cycle: { start: string; end: string; totalDays: number; passedDays: number };
  taboos: string[];
  source: string;
  stopped?: boolean;
};

const INIT_MEDS: Med[] = [
  {
    id: "m1",
    name: "塞来昔布胶囊",
    spec: "0.2g × 10 粒",
    dose: "0.2g / 次",
    freq: "每日 2 次",
    times: ["08:00", "18:30"],
    purpose: "缓解术后关节疼痛、消炎镇痛",
    cycle: { start: "2026-05-01", end: "2026-05-15", totalDays: 14, passedDays: 9 },
    taboos: ["随餐服用，避免空腹引起胃肠不适", "服药期间禁止大量饮酒", "有消化道溃疡病史者慎用"],
    source: "鼓楼医院 骨科 · 王主任医嘱",
  },
  {
    id: "m2",
    name: "利伐沙班片",
    spec: "10mg × 10 片",
    dose: "10mg / 次",
    freq: "每日 1 次",
    times: ["20:00"],
    purpose: "预防术后深静脉血栓（DVT）",
    cycle: { start: "2026-05-01", end: "2026-06-05", totalDays: 35, passedDays: 22 },
    taboos: ["避免与其他抗凝药同时使用", "出现牙龈出血、皮下瘀斑须及时复诊", "定期复查凝血功能"],
    source: "拍照识别 · 出院带药清单",
  },
  {
    id: "m3",
    name: "钙尔奇 D 片",
    spec: "600mg × 60 片",
    dose: "1 片 / 次",
    freq: "每日 1 次",
    times: ["12:00"],
    purpose: "补充钙质，促进骨骼愈合",
    cycle: { start: "2026-04-20", end: "2026-07-19", totalDays: 90, passedDays: 73 },
    taboos: ["避免与浓茶、咖啡同服", "肾结石患者遵医嘱使用", "建议随餐服用提高吸收"],
    source: "手动录入",
  },
];

type LogItem = { id: string; med: string; time: string; status: "done" | "missed" };
const INIT_LOGS: LogItem[] = [
  { id: "l1", med: "塞来昔布胶囊", time: "今天 08:02", status: "done" },
  { id: "l2", med: "钙尔奇 D 片", time: "今天 12:05", status: "done" },
  { id: "l3", med: "利伐沙班片", time: "昨天 20:10", status: "done" },
  { id: "l4", med: "塞来昔布胶囊", time: "昨天 18:30", status: "missed" },
];

export function MedsView({ onClose }: { onClose: () => void }) {
  const [meds, setMeds] = useState<Med[]>(INIT_MEDS);
  const [logs, setLogs] = useState<LogItem[]>(INIT_LOGS);
  const [detail, setDetail] = useState<{ med: Med; tab: "log" | "cycle" | "taboo" } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [stopTarget, setStopTarget] = useState<Med | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 1500);
  };

  const active = meds.filter((m) => !m.stopped);
  const stopped = meds.filter((m) => m.stopped);
  const todayTotal = useMemo(() => active.reduce((n, m) => n + m.times.length, 0), [active]);
  const todayDone = Object.values(checked).filter(Boolean).length + 2;

  const checkIn = (m: Med) => {
    setChecked((c) => ({ ...c, [m.id]: true }));
    setLogs((l) => [{ id: `n${Date.now()}`, med: m.name, time: "刚刚", status: "done" }, ...l]);
    showToast("打卡成功");
  };
  const stopMed = (m: Med) => {
    setMeds((list) => list.map((x) => (x.id === m.id ? { ...x, stopped: true } : x)));
    setStopTarget(null);
    setDetail(null);
    showToast("已停用该药品");
  };
  const resume = (m: Med) => {
    setMeds((list) => list.map((x) => (x.id === m.id ? { ...x, stopped: false } : x)));
    showToast("已恢复用药");
  };

  return (
    <QuickSheet
      title="用药管理"
      subtitle="骨科术后用药提醒与打卡"
      onClose={onClose}
      right={
        <button onClick={() => setAddOpen(true)} className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Plus className="size-5" />
        </button>
      }
    >
      <div className="min-h-full bg-background pb-6">
        {/* 概览 */}
        <section className="px-4 pt-3">
          <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
            <div className="text-[12px] opacity-80">今日服药</div>
            <div className="mt-1 text-[22px] font-extrabold tabular-nums">
              {Math.min(todayDone, todayTotal)}/{todayTotal}
              <span className="ml-2 text-[13px] font-semibold opacity-80">在服 {active.length} 种</span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.round((Math.min(todayDone, todayTotal) / Math.max(todayTotal, 1)) * 100)}%` }} />
            </div>
          </div>
        </section>

        {/* 录入方式 */}
        <section className="px-4 mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => setAddOpen(true)} className="rounded-2xl bg-card ring-1 ring-border p-3 text-left active:scale-[0.98]">
            <span className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Camera className="size-4" />
            </span>
            <div className="text-[14px] font-bold mt-2">拍药盒 / 拍医嘱</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">AI 识别自动生成用药计划</div>
          </button>
          <button onClick={() => setAddOpen(true)} className="rounded-2xl bg-card ring-1 ring-border p-3 text-left active:scale-[0.98]">
            <span className="size-9 rounded-xl bg-success/10 text-success grid place-items-center">
              <FileText className="size-4" />
            </span>
            <div className="text-[14px] font-bold mt-2">手动输入</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">自定义名称、剂量与提醒时间</div>
          </button>
        </section>

        {/* 在服药品 */}
        <section className="px-4 mt-5">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[14px] font-bold inline-flex items-center gap-1.5">
              <Pill className="size-4 text-primary" /> 在服药品
            </span>
            <span className="text-[12px] text-muted-foreground tabular-nums whitespace-nowrap">{active.length} 种</span>
          </div>
          <div className="space-y-2.5">
            {active.map((m) => (
              <MedCard
                key={m.id}
                med={m}
                checked={!!checked[m.id]}
                onCheck={() => checkIn(m)}
                onStop={() => setStopTarget(m)}
                onOpen={(tab) => setDetail({ med: m, tab })}
              />
            ))}
            {active.length === 0 && (
              <div className="rounded-2xl bg-card ring-1 ring-border p-6 text-center text-[13px] text-muted-foreground">
                暂无在服药品，点击右上角添加
              </div>
            )}
          </div>
        </section>

        {stopped.length > 0 && (
          <section className="px-4 mt-5">
            <div className="text-[14px] font-bold mb-2 px-1 inline-flex items-center gap-1.5">
              <Ban className="size-4 text-muted-foreground" /> 已停用
            </div>
            <div className="space-y-2">
              {stopped.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-muted p-3.5">
                  <span className="size-9 rounded-xl bg-muted text-muted-foreground grid place-items-center shrink-0">
                    <Pill className="size-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-muted-foreground line-through truncate">{m.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">已停药 · 提醒已暂停</div>
                  </div>
                  <button onClick={() => resume(m)} className="shrink-0 h-9 px-3 rounded-full bg-card ring-1 ring-border text-[13px] font-semibold whitespace-nowrap">
                    恢复
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 近期记录 */}
        <section className="px-4 mt-5">
          <div className="text-[14px] font-bold mb-2 px-1 inline-flex items-center gap-1.5">
            <History className="size-4 text-primary" /> 近期服药记录
          </div>
          <div className="rounded-2xl bg-card ring-1 ring-border divide-y divide-border">
            {logs.slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center gap-2.5 px-3.5 py-2.5">
                {l.status === "done" ? (
                  <CheckCircle2 className="size-4 text-success shrink-0" />
                ) : (
                  <AlertTriangle className="size-4 text-warning shrink-0" />
                )}
                <span className="text-[13px] font-medium flex-1 truncate">{l.med}</span>
                <span className="text-[12px] text-muted-foreground tabular-nums whitespace-nowrap">{l.time}</span>
                <span className={`text-[12px] font-bold whitespace-nowrap ${l.status === "done" ? "text-success" : "text-warning"}`}>
                  {l.status === "done" ? "已服" : "漏服"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {detail && (
        <Sheet onClose={() => setDetail(null)}>
          <MedDetail
            med={detail.med}
            tab={detail.tab}
            logs={logs.filter((l) => l.med === detail.med.name)}
            onTab={(t) => setDetail({ med: detail.med, tab: t })}
            onStop={() => setStopTarget(detail.med)}
          />
        </Sheet>
      )}
      {addOpen && (
        <Sheet onClose={() => setAddOpen(false)}>
          <AddMed
            onSave={(m) => {
              setMeds((l) => [...l, m]);
              setAddOpen(false);
              showToast("已生成用药计划");
            }}
          />
        </Sheet>
      )}
      {stopTarget && (
        <Sheet onClose={() => setStopTarget(null)}>
          <div className="p-1">
            <div className="text-[16px] font-bold">确认停用「{stopTarget.name}」？</div>
            <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">
              停药后该药品的提醒与打卡任务将暂停，并同步给您的康复管理团队。建议先咨询医生后再停用。
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setStopTarget(null)} className="flex-1 h-11 rounded-xl bg-muted text-[14px] font-bold">
                再想想
              </button>
              <button onClick={() => stopMed(stopTarget)} className="flex-1 h-11 rounded-xl bg-destructive text-destructive-foreground text-[14px] font-bold">
                确认停药
              </button>
            </div>
          </div>
        </Sheet>
      )}
      {toast && <QuickToast text={toast} />}
    </QuickSheet>
  );
}

function MedCard({
  med, checked, onCheck, onStop, onOpen,
}: {
  med: Med;
  checked: boolean;
  onCheck: () => void;
  onStop: () => void;
  onOpen: (tab: "log" | "cycle" | "taboo") => void;
}) {
  const pct = Math.round((med.cycle.passedDays / med.cycle.totalDays) * 100);
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border p-3.5">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <Pill className="size-5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold truncate">{med.name}</div>
          <div className="text-[12px] text-muted-foreground mt-0.5 truncate">{med.spec} · {med.dose} · {med.freq}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {med.times.map((t) => (
              <span key={t} className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full tabular-nums whitespace-nowrap">
                <Clock className="size-2.5" /> {t}
              </span>
            ))}
            <span className="text-[11.5px] text-muted-foreground whitespace-nowrap">{med.source}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[11.5px] text-muted-foreground tabular-nums">
        周期 {med.cycle.start} ~ {med.cycle.end} · 已服 {med.cycle.passedDays}/{med.cycle.totalDays} 天
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <MiniBtn label="服用记录" onClick={() => onOpen("log")} />
        <MiniBtn label="周期计划" onClick={() => onOpen("cycle")} />
        <MiniBtn label="用药禁忌" onClick={() => onOpen("taboo")} />
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          disabled={checked}
          onClick={onCheck}
          className={`flex-1 h-10 rounded-xl text-[13.5px] font-bold inline-flex items-center justify-center gap-1 ${
            checked ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground active:scale-95"
          }`}
        >
          <CheckCircle2 className="size-3.5" /> {checked ? "今日已打卡" : "打卡"}
        </button>
        <button
          onClick={onStop}
          className="h-10 px-4 rounded-xl bg-destructive/10 text-destructive text-[13.5px] font-bold inline-flex items-center gap-1 active:scale-95 whitespace-nowrap"
        >
          <Ban className="size-3.5" /> 停药
        </button>
      </div>
    </div>
  );
}

function MiniBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 h-9 rounded-lg bg-muted text-[12.5px] font-semibold text-foreground/80 active:bg-muted/70 whitespace-nowrap">
      {label}
    </button>
  );
}

function MedDetail({
  med, tab, logs, onTab, onStop,
}: {
  med: Med;
  tab: "log" | "cycle" | "taboo";
  logs: LogItem[];
  onTab: (t: "log" | "cycle" | "taboo") => void;
  onStop: () => void;
}) {
  return (
    <div>
      <div className="text-[16px] font-bold">{med.name}</div>
      <div className="text-[13px] text-muted-foreground mt-0.5">{med.spec} · {med.purpose}</div>

      <div className="mt-3 flex gap-1 rounded-xl bg-muted p-1">
        {([
          { k: "log", l: "服用记录" },
          { k: "cycle", l: "周期计划" },
          { k: "taboo", l: "用药禁忌" },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => onTab(t.k)}
            className={`flex-1 h-9 rounded-lg text-[13px] font-bold whitespace-nowrap ${tab === t.k ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {tab === "log" && (
          <div className="rounded-2xl bg-muted divide-y divide-border">
            {logs.length === 0 && <div className="p-5 text-center text-[13px] text-muted-foreground">暂无服用记录</div>}
            {logs.map((l) => (
              <div key={l.id} className="flex items-center gap-2 px-3 py-2.5">
                {l.status === "done" ? <CheckCircle2 className="size-4 text-success" /> : <AlertTriangle className="size-4 text-warning" />}
                <span className="text-[13px] flex-1">{l.time}</span>
                <span className={`text-[12px] font-bold whitespace-nowrap ${l.status === "done" ? "text-success" : "text-warning"}`}>
                  {l.status === "done" ? "已服" : "漏服"}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "cycle" && (
          <div className="space-y-2">
            <div className="rounded-2xl bg-muted p-3.5 space-y-1.5 text-[13px]">
              <Row label="用药周期" value={`${med.cycle.start} ~ ${med.cycle.end}`} />
              <Row label="服用频次" value={med.freq} />
              <Row label="每次剂量" value={med.dose} />
              <Row label="提醒时间" value={med.times.join(" / ")} />
              <Row label="计划来源" value={med.source} />
            </div>
            <div className="rounded-2xl bg-primary/5 ring-1 ring-primary/15 p-3.5">
              <div className="text-[13px] font-bold text-primary inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" /> 进度
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(med.cycle.passedDays / med.cycle.totalDays) * 100}%` }} />
              </div>
              <div className="text-[12px] text-muted-foreground mt-1.5 tabular-nums">
                已服 {med.cycle.passedDays} 天，剩余 {med.cycle.totalDays - med.cycle.passedDays} 天，到期前 3 天将提醒复诊续方。
              </div>
            </div>
          </div>
        )}

        {tab === "taboo" && (
          <div className="space-y-2">
            {med.taboos.map((t) => (
              <div key={t} className="flex items-start gap-2 rounded-2xl bg-warning/10 ring-1 ring-warning/30 p-3">
                <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
                <span className="text-[13px] text-foreground/80 leading-relaxed">{t}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onStop} className="mt-4 w-full h-11 rounded-xl bg-destructive/10 text-destructive text-[14px] font-bold inline-flex items-center justify-center gap-1.5">
        <Ban className="size-4" /> 停用该药品
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}

function AddMed({ onSave }: { onSave: (m: Med) => void }) {
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [scanned, setScanned] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [freq, setFreq] = useState("每日 1 次");
  const [time, setTime] = useState("08:00");
  const [days, setDays] = useState("30");

  const fillFromScan = () => {
    setScanned(true);
    setName("氨基葡萄糖胶囊");
    setDose("0.75g / 次");
    setFreq("每日 2 次");
    setTime("07:30");
    setDays("60");
  };

  const save = () =>
    onSave({
      id: `u${Date.now()}`,
      name: name || "未命名药品",
      spec: "自定义",
      dose: dose || "遵医嘱",
      freq,
      times: [time],
      purpose: "用户添加",
      cycle: { start: "2026-08-06", end: "2026-09-05", totalDays: Number(days) || 30, passedDays: 0 },
      taboos: ["请按医嘱服用，如出现不适及时联系医生"],
      source: mode === "scan" ? "拍照识别" : "手动录入",
    });

  return (
    <div>
      <div className="text-[16px] font-bold">添加用药</div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode("scan")}
          className={`h-11 rounded-xl text-[13.5px] font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${mode === "scan" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"}`}
        >
          <Camera className="size-4" /> 拍照识别
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`h-11 rounded-xl text-[13.5px] font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${mode === "manual" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"}`}
        >
          <FileText className="size-4" /> 手动输入
        </button>
      </div>

      {mode === "scan" && (
        <div className="mt-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
          <ScanLine className="size-8 text-primary mx-auto" />
          <div className="text-[14px] font-semibold mt-2">拍摄药盒 / 医嘱单</div>
          <div className="text-[12px] text-muted-foreground mt-1">AI 自动识别药名、剂量与频次，生成用药计划</div>
          <button onClick={fillFromScan} className="mt-3 h-10 px-4 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold inline-flex items-center gap-1">
            <Camera className="size-3.5" /> 拍照 / 相册
          </button>
          {scanned && (
            <div className="mt-3 rounded-xl bg-card ring-1 ring-border p-3 text-left">
              <div className="text-[12.5px] font-bold text-primary inline-flex items-center gap-1">
                <Sparkles className="size-3.5" /> 识别结果（可修改）
              </div>
              <div className="text-[13px] mt-1.5">{name} · {dose} · {freq} · {time}</div>
            </div>
          )}
        </div>
      )}

      {(mode === "manual" || scanned) && (
        <div className="mt-3 rounded-2xl bg-muted p-3 space-y-2.5">
          <Field label="药品名称" value={name} onChange={setName} placeholder="如：乙哌立松片" />
          <Field label="每次剂量" value={dose} onChange={setDose} placeholder="如：50mg / 次" />
          <Field label="服用频次" value={freq} onChange={setFreq} placeholder="如：每日 3 次" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="提醒时间" value={time} onChange={setTime} placeholder="08:00" />
            <Field label="周期（天）" value={days} onChange={(v) => setDays(v.replace(/\D/g, ""))} placeholder="30" />
          </div>
        </div>
      )}

      <button onClick={save} className="mt-4 w-full h-11 rounded-xl bg-primary text-primary-foreground text-[15px] font-bold active:scale-[0.99]">
        保存并生成用药计划
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full h-10 rounded-lg bg-card ring-1 ring-border px-3 text-[14px]"
      />
    </label>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-[55] flex flex-col justify-end animate-in fade-in duration-150">
      <button aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-foreground/40" />
      <div className="relative bg-card rounded-t-3xl p-4 pb-6 animate-in slide-in-from-bottom duration-200 max-h-[85%] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 size-8 rounded-full grid place-items-center bg-muted z-10">
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
