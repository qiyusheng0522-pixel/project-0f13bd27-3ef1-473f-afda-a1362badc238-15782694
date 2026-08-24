import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Ruler,
  Thermometer,
  HeartPulse,
  Footprints,
  Plus,
  TrendingUp,
  Keyboard,
  Camera,
  Mic,
  Bluetooth,
  Wifi,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  X,
  Delete,
  Check,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Clock3,
} from "lucide-react";
import { QuickSheet } from "@/components/quick/QuickSheet";

type Metric = {
  id: string;
  title: string;
  icon: React.ReactNode;
  bg: string;
  fg: string;
  latest: string;
  unit: string;
  time: string;
  trend?: string;
  placeholder?: string;
  tags?: string[];
};

const METRICS: Metric[] = [
  { id: "vas", title: "疼痛 VAS", icon: <Activity className="size-5" />, bg: "bg-primary/10", fg: "text-primary", latest: "3", unit: "分", time: "今 08:10 · 活动后", trend: "近 7 日下降", placeholder: "0", tags: ["静息", "活动后", "夜间"] },
  { id: "flexion", title: "屈膝角度", icon: <Activity className="size-5" />, bg: "bg-success/10", fg: "text-success", latest: "95", unit: "°", time: "今晨康复训练", trend: "较昨日 +5°", placeholder: "0", tags: ["主动屈曲", "被动屈曲"] },
  { id: "calf", title: "小腿周径", icon: <Ruler className="size-5" />, bg: "bg-warning/10", fg: "text-warning", latest: "34.5", unit: "cm", time: "昨 21:30", trend: "较昨日持平", placeholder: "0.0", tags: ["左侧", "右侧"] },
  { id: "temp", title: "体温", icon: <Thermometer className="size-5" />, bg: "bg-destructive/10", fg: "text-destructive", latest: "36.8", unit: "℃", time: "今 12:00", trend: "正常范围", placeholder: "0.0", tags: ["晨起", "午间", "睡前"] },
  { id: "bp", title: "血压", icon: <HeartPulse className="size-5" />, bg: "bg-info/10", fg: "text-info", latest: "128/82", unit: "mmHg", time: "昨 21:30", trend: "正常高值", placeholder: "收缩压 / 舒张压", tags: ["晨起", "午间", "睡前"] },
  { id: "steps", title: "步数/步行距离", icon: <Footprints className="size-5" />, bg: "bg-accent/10", fg: "text-accent-foreground", latest: "1,240", unit: "步", time: "今日累计", trend: "达成 62%", placeholder: "0", tags: ["助行器", "独立行走"] },
];

type ModeKey = "manual" | "device";
type MethodKey = "keypad" | "camera" | "voice";
type Toast = { id: number; text: string };

export function DataEntryView({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<ModeKey>("manual");
  const [activeMetric, setActiveMetric] = useState<Metric | null>(null);
  const [method, setMethod] = useState<MethodKey>("keypad");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1800);
  };

  const openEntry = (m: Metric, mk: MethodKey = "keypad") => {
    setActiveMetric(m);
    setMethod(mk);
  };

  return (
    <QuickSheet title="康复数据录入" subtitle="记录术后康复关键指标" onClose={onClose}>
      <div className="min-h-full bg-background pb-4 relative">
        <section className="px-5 pt-4">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted/70">
            {([
              { key: "manual", label: "手动录入", icon: <Keyboard className="size-3.5" /> },
              { key: "device", label: "设备同步", icon: <Bluetooth className="size-3.5" /> },
            ] as { key: ModeKey; label: string; icon: React.ReactNode }[]).map((t) => {
              const active = mode === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setMode(t.key)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                    active ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="px-5 mt-5">
          <div
            className="rounded-3xl p-5 text-primary-foreground shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, oklch(0.5 0.18 250) 100%)",
              boxShadow: "0 18px 40px -18px color-mix(in oklab, var(--primary) 60%, transparent)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] whitespace-nowrap">
                今日待录入
              </span>
              <Clock3 className="size-4 text-white/70" />
            </div>
            <div className="text-[18px] font-bold tracking-tight leading-tight">康复训练后屈膝角度 · 术后体温</div>
            <div className="text-[11.5px] text-white/80 mt-1.5">主诊医生本周关注：DVT 抗凝与屈膝角度进展</div>
          </div>
        </section>

        {mode === "manual" ? (
          <ManualSection onMetric={(m) => openEntry(m, "keypad")} />
        ) : (
          <DeviceSection onSync={(name) => pushToast(`已同步：${name}`)} />
        )}
      </div>

      {activeMetric && (
        <EntrySheet
          metric={activeMetric}
          method={method}
          onMethodChange={setMethod}
          onClose={() => setActiveMetric(null)}
          onSaved={(val) => {
            pushToast(`已保存 ${activeMetric.title} ${val} ${activeMetric.unit}`);
            setActiveMetric(null);
          }}
        />
      )}

      {toasts.length > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-[60] flex flex-col gap-1.5 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="px-3.5 py-2 rounded-xl bg-foreground text-background text-[12px] font-semibold shadow-lg inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <CheckCircle2 className="size-3.5" /> {t.text}
            </div>
          ))}
        </div>
      )}
    </QuickSheet>
  );
}

function ManualSection({ onMetric }: { onMetric: (m: Metric) => void }) {
  return (
    <section className="px-5 mt-5">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.18em] uppercase whitespace-nowrap">常用指标</h3>
        <span className="text-[11px] font-bold text-primary inline-flex items-center gap-0.5 whitespace-nowrap">
          <Sparkles className="size-3" /> 趋势与 AI 分析 ›
        </span>
      </div>
      <div className="grid gap-3">
        {METRICS.map((m) => (
          <div
            key={m.id}
            className="rounded-3xl bg-card ring-1 ring-black/[0.04] p-4 flex items-center gap-4"
            style={{ boxShadow: "0 4px 20px -6px rgba(15, 23, 42, 0.06)" }}
          >
            <div className={`size-12 rounded-2xl grid place-items-center shrink-0 ${m.bg} ${m.fg}`}>
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-end justify-between mb-0.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{m.title}</span>
                <span className="text-[10px] text-foreground/40 whitespace-nowrap">{m.time}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[22px] font-extrabold tabular-nums leading-none">
                  {m.latest}
                </span>
                <span className="text-[11px] font-semibold text-foreground/45">{m.unit}</span>
              </div>
              {m.trend && (
                <div className="text-[10.5px] text-success font-medium mt-1 inline-flex items-center gap-1 whitespace-nowrap">
                  <TrendingUp className="size-3" /> {m.trend}
                </div>
              )}
            </div>
            <button
              onClick={() => onMetric(m)}
              aria-label={`录入${m.title}`}
              className="size-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shrink-0 active:bg-primary/90 transition-colors"
              style={{ boxShadow: "0 6px 16px -4px color-mix(in oklab, var(--primary) 50%, transparent)" }}
            >
              <Plus className="size-5" strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

type Device = {
  id: string;
  name: string;
  model: string;
  channel: "bluetooth" | "wifi";
  status: "connected" | "available" | "syncing";
  lastSync?: string;
  metric: string;
};

const DEVICES: Device[] = [
  { id: "d1", name: "云康角度计", model: "ROM-200", channel: "bluetooth", status: "connected", lastSync: "今 08:11 · 同步 1 条", metric: "屈膝角度" },
  { id: "d2", name: "欧姆龙电子血压计", model: "HEM-7156", channel: "bluetooth", status: "connected", lastSync: "昨 21:30 · 同步 1 条", metric: "血压" },
  { id: "d3", name: "智能体温计", model: "iThermo Pro", channel: "wifi", status: "syncing", lastSync: "同步中…", metric: "体温" },
  { id: "d4", name: "小米手环 9", model: "Mi Band 9", channel: "bluetooth", status: "available", metric: "步数 / 步行距离" },
];

function DeviceSection({ onSync }: { onSync: (name: string) => void }) {
  return (
    <>
      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-[11px] font-bold text-muted-foreground tracking-[0.16em] whitespace-nowrap">已绑定设备</div>
          <button onClick={() => onSync("全部设备")} className="inline-flex items-center gap-1 text-[11px] font-bold text-primary whitespace-nowrap">
            <RefreshCw className="size-3" /> 全部同步
          </button>
        </div>
        <div className="grid gap-2.5">
          {DEVICES.map((d) => (
            <DeviceRow key={d.id} device={d} onSync={() => onSync(d.name)} />
          ))}
        </div>
      </section>

      <section className="px-5 mt-5">
        <button className="w-full rounded-2xl ring-1 ring-dashed ring-primary/40 bg-primary/5 text-primary py-3.5 text-[13px] font-bold inline-flex items-center justify-center gap-1.5 active:bg-primary/10">
          <Plus className="size-4" /> 添加新设备
        </button>
        <p className="text-[11px] text-muted-foreground mt-2 px-1 leading-relaxed">
          支持角度计 / 欧姆龙 / 智能体温计 / 小米手环 等常见康复监测设备；通过蓝牙或 Wi-Fi 自动同步至主诊医生。
        </p>
      </section>
    </>
  );
}

function DeviceRow({ device, onSync }: { device: Device; onSync: () => void }) {
  const channelIcon =
    device.channel === "bluetooth" ? <Bluetooth className="size-3" /> : <Wifi className="size-3" />;
  const statusMeta =
    device.status === "connected"
      ? { label: "已连接", cls: "text-success bg-success/10", icon: <CheckCircle2 className="size-3" /> }
      : device.status === "syncing"
        ? { label: "同步中", cls: "text-primary bg-primary/10", icon: <RefreshCw className="size-3 animate-spin" /> }
        : { label: "去连接", cls: "text-warning bg-warning/10", icon: <Plus className="size-3" /> };
  return (
    <button onClick={onSync} className="text-left rounded-2xl bg-card ring-1 ring-black/5 p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform">
      <div className="size-11 rounded-xl grid place-items-center shrink-0 bg-primary/10 text-primary">
        {channelIcon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[13px] font-bold truncate">{device.name}</div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${statusMeta.cls}`}>
            {statusMeta.icon}
            {statusMeta.label}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {device.model} · {device.metric}
        </div>
        {device.lastSync && (
          <div className="text-[11px] text-foreground/55 mt-0.5">{device.lastSync}</div>
        )}
      </div>
      <ChevronRight className="size-4 text-muted-foreground/60 shrink-0" />
    </button>
  );
}

/* ---------------- Entry Sheet ---------------- */

function EntrySheet({
  metric,
  method,
  onMethodChange,
  onClose,
  onSaved,
}: {
  metric: Metric;
  method: MethodKey;
  onMethodChange: (m: MethodKey) => void;
  onClose: () => void;
  onSaved: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const [tag, setTag] = useState(metric.tags?.[0] ?? "");

  useEffect(() => {
    setValue("");
    setTag(metric.tags?.[0] ?? "");
  }, [metric.id]);

  const canSave = value.trim().length > 0;

  return (
    <div className="absolute inset-0 z-[55] flex items-end">
      <button aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative w-full bg-background rounded-t-[32px] shadow-2xl max-h-[92%] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="pt-3 pb-2 grid place-items-center">
          <div className="w-12 h-1.5 rounded-full bg-foreground/15" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <div className="flex items-center gap-3">
            <div className={`size-11 rounded-2xl grid place-items-center ${metric.bg} ${metric.fg}`}>
              {metric.icon}
            </div>
            <div>
              <div className="text-[16px] font-bold leading-tight tracking-tight">录入{metric.title}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] mt-0.5 whitespace-nowrap">
                Unit · {metric.unit}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full grid place-items-center bg-muted active:bg-muted/70">
            <X className="size-4 text-foreground/60" />
          </button>
        </div>

        <div className="px-5">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-muted/70">
            {([
              { k: "keypad", l: "手填", i: <Keyboard className="size-3.5" /> },
              { k: "camera", l: "拍照", i: <Camera className="size-3.5" /> },
              { k: "voice", l: "语音", i: <Mic className="size-3.5" /> },
            ] as { k: MethodKey; l: string; i: React.ReactNode }[]).map((t) => {
              const active = method === t.k;
              return (
                <button
                  key={t.k}
                  onClick={() => {
                    setValue("");
                    onMethodChange(t.k);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold transition-colors whitespace-nowrap ${
                    active ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {t.i}
                  {t.l}
                </button>
              );
            })}
          </div>
        </div>

        {metric.tags && (
          <div className="px-5 mt-4">
            <div className="text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-[0.16em] whitespace-nowrap">记录场景</div>
            <div className="flex flex-wrap gap-2">
              {metric.tags.map((t) => {
                const active = tag === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTag(t)}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold ring-1 transition-colors whitespace-nowrap ${
                      active
                        ? "bg-primary text-primary-foreground ring-primary shadow-md"
                        : "bg-muted/50 ring-black/5 text-foreground/65"
                    }`}
                    style={
                      active
                        ? { boxShadow: "0 6px 14px -4px color-mix(in oklab, var(--primary) 45%, transparent)" }
                        : undefined
                    }
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-5 mt-5">
          <div className="text-center">
            <div className="text-[10px] text-muted-foreground font-bold tracking-[0.18em] uppercase mb-2 whitespace-nowrap">
              {method === "keypad" ? "输入数值" : method === "camera" ? "识别结果" : "语音转写"}
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span
                className={`text-[56px] font-black tabular-nums leading-none tracking-tighter ${value ? "text-foreground" : "text-foreground/20"}`}
              >
                {value || metric.placeholder || "0.0"}
              </span>
              <span className="text-[13px] text-foreground/45 font-bold pb-1">{metric.unit}</span>
            </div>
          </div>
        </div>

        <div className="px-5 mt-5 flex-1">
          {method === "keypad" && <Keypad metricId={metric.id} value={value} onChange={setValue} />}
          {method === "camera" && <CameraCapture onResult={setValue} />}
          {method === "voice" && <VoiceCapture onResult={setValue} />}
        </div>

        <div className="px-5 pt-4 pb-7 bg-gradient-to-t from-background via-background to-transparent">
          <button
            disabled={!canSave}
            onClick={() => onSaved(value)}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-[15px] font-bold inline-flex items-center justify-center gap-2 disabled:opacity-35 active:bg-primary/90 transition-colors"
            style={
              canSave
                ? { boxShadow: "0 14px 30px -10px color-mix(in oklab, var(--primary) 55%, transparent)" }
                : undefined
            }
          >
            <Check className="size-5" strokeWidth={3} /> 保存记录
          </button>
        </div>
      </div>
    </div>
  );
}

function Keypad({
  metricId,
  value,
  onChange,
}: {
  metricId: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const isBp = metricId === "bp";
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", isBp ? "/" : ".", "0", "del"];
  const press = (k: string) => {
    if (k === "del") return onChange(value.slice(0, -1));
    if (k === "." && value.includes(".")) return;
    if (k === "/" && value.includes("/")) return;
    if (value.length >= 7) return;
    onChange(value + k);
  };
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => press(k)}
          className={`h-14 rounded-2xl text-[22px] font-bold inline-flex items-center justify-center transition-all active:scale-95 ${
            k === "del" ? "bg-muted/60 text-foreground/60 active:bg-muted" : "bg-card text-foreground active:bg-muted/50"
          }`}
          style={{
            boxShadow: k === "del" ? "none" : "0 2px 10px -2px rgba(15, 23, 42, 0.06)",
          }}
        >
          {k === "del" ? <Delete className="size-6" /> : k}
        </button>
      ))}
    </div>
  );
}

function CameraCapture({ onResult }: { onResult: (v: string) => void }) {
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const start = () => {
    setPhase("scanning");
    setTimeout(() => {
      onResult("36.6");
      setPhase("done");
    }, 1500);
  };
  return (
    <div className="rounded-2xl ring-1 ring-dashed ring-black/15 bg-card p-4 flex flex-col items-center gap-3">
      <div className="size-24 rounded-2xl bg-muted grid place-items-center relative overflow-hidden">
        <ImageIcon className="size-8 text-foreground/30" />
        {phase === "scanning" && (
          <div className="absolute inset-0 bg-primary/10">
            <div className="absolute left-0 right-0 h-0.5 bg-primary animate-[scan_1.4s_linear_infinite]" />
          </div>
        )}
      </div>
      <div className="text-[12px] text-muted-foreground text-center">
        {phase === "idle" && "对准仪器屏幕，自动识别读数"}
        {phase === "scanning" && "识别中…"}
        {phase === "done" && (
          <span className="text-success font-bold inline-flex items-center gap-1 whitespace-nowrap">
            <CheckCircle2 className="size-3.5" /> 识别成功，请确认
          </span>
        )}
      </div>
      <button
        onClick={start}
        disabled={phase === "scanning"}
        className="w-full h-10 rounded-xl bg-foreground text-background text-[13px] font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
      >
        {phase === "scanning" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> 识别中
          </>
        ) : (
          <>
            <Camera className="size-4" /> {phase === "done" ? "重新拍照" : "拍照识别"}
          </>
        )}
      </button>
      <style>{`@keyframes scan{0%{top:0}50%{top:100%}100%{top:0}}`}</style>
    </div>
  );
}

function VoiceCapture({ onResult }: { onResult: (v: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const timer = useRef<number | null>(null);

  const toggle = () => {
    if (recording) {
      if (timer.current) window.clearTimeout(timer.current);
      setRecording(false);
      return;
    }
    setTranscript("");
    setRecording(true);
    timer.current = window.setTimeout(() => {
      const text = "疼痛评分 3 分";
      setTranscript(text);
      onResult("3");
      setRecording(false);
    }, 1800);
  };

  return (
    <div className="rounded-2xl ring-1 ring-dashed ring-black/15 bg-card p-4 flex flex-col items-center gap-3">
      <button
        onClick={toggle}
        className={`size-16 rounded-full grid place-items-center transition-colors ${
          recording ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        <Mic className="size-7" />
      </button>
      {recording && (
        <div className="flex items-end gap-0.5 h-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-0.5 bg-destructive rounded-full animate-pulse"
              style={{ height: `${6 + (i % 3) * 4}px`, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      )}
      <div className="text-[12px] text-center">
        {transcript ? (
          <span className="text-foreground inline-flex items-center gap-1">
            <Sparkles className="size-3.5 text-primary" /> 已识别："{transcript}"
          </span>
        ) : (
          <span className="text-muted-foreground">
            {recording ? "正在聆听…说出如「疼痛评分 3 分」" : "点击话筒，说出测量结果"}
          </span>
        )}
      </div>
    </div>
  );
}
