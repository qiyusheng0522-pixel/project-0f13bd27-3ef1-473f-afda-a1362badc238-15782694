import { useMemo, useRef, useState } from "react";
import {
  Camera,
  ShieldCheck,
  FileText,
  ScrollText,
  ClipboardList,
  Pill,
  Droplet,
  HeartPulse,
  Soup,
  Stethoscope,
  X,
  Check,
  ChevronRight,
  Mic,
  Smartphone,
  Timer,
  Image as ImageIcon,
  CheckCircle2,
  Dumbbell,
  Utensils,
  Plus,
  Clock,
  AlertTriangle,
  Target,
  Activity,
  Brain,
  Bluetooth,
  Keyboard,
  Ban,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MedsView } from "@/components/quick/MedsView";
import { DataEntryView } from "@/components/quick/DataEntryView";
import { CarePlanView } from "@/components/quick/CarePlanView";
import { DietView } from "@/components/quick/DietView";
import { ArchiveView } from "@/components/quick/ArchiveView";
import { MiniToastProvider, useMiniToast } from "@/components/quick/MiniToast";



export type QuickKey =
  | "archive"
  | "risk"
  | "scale"
  | "today"
  | "med"
  | "data"
  | "plan"
  | "diet";

type Entry = {
  key: QuickKey;
  title: string;
  desc: string;
  icon: React.ElementType;
  /** 与主色（蓝）形成明显对比的强调色 */
  tint: string;
};

export const QUICK_ENTRIES: Entry[] = [
  { key: "archive", title: "完善档案", desc: "第 1 步", icon: Camera, tint: "bg-sky-100 text-sky-600" },
  { key: "risk", title: "风险评估", desc: "第 2 步", icon: ShieldCheck, tint: "bg-violet-100 text-violet-600" },
  { key: "plan", title: "健康方案", desc: "执行与服务", icon: HeartPulse, tint: "bg-rose-100 text-rose-600" },
  { key: "scale", title: "问卷评估", desc: "专病量表", icon: ScrollText, tint: "bg-slate-200 text-slate-700" },
  { key: "today", title: "今日任务", desc: "打卡得分", icon: ClipboardList, tint: "bg-orange-100 text-orange-600" },
  { key: "med", title: "用药管理", desc: "打卡/停药", icon: Pill, tint: "bg-teal-100 text-teal-600" },
  { key: "data", title: "数据录入", desc: "血压体温", icon: Droplet, tint: "bg-cyan-100 text-cyan-600" },
  { key: "diet", title: "饮食打卡", desc: "拍照识别", icon: Soup, tint: "bg-emerald-100 text-emerald-600" },
];

/* ============ 右侧边缘「快捷入口」拉手（支持长按拖动） + 抽屉面板 ============ */

export function QuickEntryRail({ onPick }: { onPick: (k: QuickKey) => void }) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0.42); // 相对高度比例
  const [dragging, setDragging] = useState(false);
  const stateRef = useRef({ timer: 0 as unknown as ReturnType<typeof setTimeout>, moved: false, long: false, h: 1 });

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const host = e.currentTarget.parentElement?.parentElement ?? e.currentTarget.parentElement;
    stateRef.current.h = host?.clientHeight || 800;
    stateRef.current.moved = false;
    stateRef.current.long = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    stateRef.current.timer = setTimeout(() => {
      stateRef.current.long = true;
      setDragging(true);
    }, 300);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!stateRef.current.long) return;
    stateRef.current.moved = true;
    const host = e.currentTarget.parentElement?.parentElement ?? e.currentTarget.parentElement;
    const rect = host?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (e.clientY - rect.top) / rect.height;
    setTop(Math.min(0.86, Math.max(0.08, ratio)));
  };

  const onPointerUp = () => {
    clearTimeout(stateRef.current.timer);
    setDragging(false);
    if (!stateRef.current.long && !stateRef.current.moved) setOpen(true);
    stateRef.current.long = false;
  };

  return (
    <>
      <button
        type="button"
        aria-label="快捷入口"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "absolute right-0 z-40 grid h-24 w-8 touch-none place-items-center rounded-l-2xl bg-amber-500 text-white active:scale-95",
          dragging ? "ring-4 ring-amber-500/30" : "transition-[top] duration-150",
        )}
        style={{ top: `${top * 100}%`, boxShadow: "var(--shadow-elevated)" }}
      >
        <span className="text-[13px] font-bold tracking-[0.2em]" style={{ writingMode: "vertical-rl" }}>
          快捷入口
        </span>
      </button>

      {open && (
        <div className="absolute inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 right-0 top-0 flex w-[86%] max-w-[330px] flex-col bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
              <div>
                <h3 className="font-display text-[20px] font-bold">快捷入口</h3>
                <p className="mt-0.5 whitespace-nowrap text-[14px] text-muted-foreground">核心功能一键直达 · 长按拉手可移动</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="关闭"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 gap-2.5">
                {QUICK_ENTRIES.map((e) => {
                  const Icon = e.icon;
                  return (
                    <button
                      key={e.key}
                      onClick={() => {
                        setOpen(false);
                        onPick(e.key);
                      }}
                      className="flex flex-col items-center gap-1.5 rounded-2xl border bg-card px-1.5 py-3 text-center active:scale-95"
                    >
                      <span className={cn("grid size-12 place-items-center rounded-2xl", e.tint)}>
                        <Icon className="size-6" />
                      </span>
                      <span className="whitespace-nowrap text-[15px] font-bold leading-none">{e.title}</span>
                      <span className="whitespace-nowrap text-[12px] leading-none text-muted-foreground">{e.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


/* ============ 详情弹层 ============ */

function Panel({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative max-h-[92%] overflow-y-auto rounded-t-3xl bg-background p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[22px] font-bold">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[15px] text-muted-foreground">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="关闭" className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
            <X className="size-5" />
          </button>
        </div>
        <MiniToastProvider>{children}</MiniToastProvider>
      </div>
    </div>
  );
}

function BigButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-5 w-full rounded-2xl py-3.5 text-[18px] font-bold text-primary-foreground active:scale-[0.98]"
      style={{ background: "var(--gradient-primary)" }}
    >
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0">
      <span className="whitespace-nowrap text-[16px] text-muted-foreground">{label}</span>
      <span className="text-right text-[17px] font-bold">{value}</span>
    </div>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-2xl border bg-card">{children}</div>;
}

function SectionTitle({
  icon: Icon,
  title,
  right,
}: {
  icon: React.ElementType;
  title: string;
  right?: string;
}) {
  return (
    <div className="mt-5 flex items-end justify-between gap-2">
      <h4 className="flex items-center gap-2 font-display text-[19px] font-bold">
        <Icon className="size-5 text-primary" /> {title}
      </h4>
      {right && <span className="whitespace-nowrap text-[14px] text-muted-foreground">{right}</span>}
    </div>
  );
}

function Field({ label, unit, placeholder }: { label: string; unit: string; placeholder: string }) {
  return (
    <label className="block rounded-2xl border bg-card p-3.5">
      <span className="text-[17px] font-bold">{label}</span>
      <span className="mt-2 flex items-center gap-2">
        <input
          className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2.5 text-[18px]"
          placeholder={placeholder}
          inputMode="decimal"
        />
        <span className="whitespace-nowrap text-[16px] text-muted-foreground">{unit}</span>
      </span>
    </label>
  );
}

/* ============ 风险评估（图 1） ============ */

const RISK_DETAILS = [
  {
    name: "关节疼痛与功能",
    level: "高风险",
    tone: "danger" as const,
    concl: "术后疼痛控制不佳，屈膝活动度不达标",
    points: ["静息 VAS 4 分（目标 <3）", "近 14 天夜间痛醒 6 次", "屈膝 85°（同期目标 100°）"],
    from: "康复评估单 + 疼痛日记 + 屈膝测量",
  },
  {
    name: "下肢深静脉血栓",
    level: "中风险",
    tone: "warn" as const,
    concl: "存在血栓倾向，需坚持踝泵与抗凝",
    points: ["小腿周径左右差 1.8cm", "D-二聚体 0.86 mg/L", "每日步行不足 800 步"],
    from: "化验单 + 护理巡视记录",
  },
  {
    name: "跌倒风险",
    level: "中风险",
    tone: "warn" as const,
    concl: "下肢肌力偏弱，起身与如厕时易失衡",
    points: ["股四头肌肌力 4-级", "起立-行走测试 16 秒", "夜间起夜 2 次、未用助行器"],
    from: "跌倒风险量表 + 生活问卷",
  },
  {
    name: "骨质疏松",
    level: "低风险",
    tone: "ok" as const,
    concl: "骨量基本正常，继续补钙与维 D",
    points: ["骨密度 T 值 -1.2", "血钙 2.31 mmol/L", "每日日照 30 分钟"],
    from: "骨密度报告 + 营养问卷",
  },
];

function riskTone(t: "danger" | "warn" | "ok") {
  return t === "danger"
    ? { pill: "bg-destructive text-destructive-foreground", card: "border-destructive/30 bg-destructive/5", text: "text-destructive" }
    : t === "warn"
      ? { pill: "bg-warning text-warning-foreground", card: "border-warning/40 bg-warning/10", text: "text-warning-foreground" }
      : { pill: "bg-success text-primary-foreground", card: "border-success/30 bg-success/5", text: "text-success" };
}

function RiskView() {
  return (
    <div>
      <section className="rounded-3xl bg-primary p-5 text-primary-foreground" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <p className="flex items-center gap-2 text-[16px] font-semibold text-primary-foreground/85">
          <ShieldCheck className="size-5" /> 风险结论
        </p>
        <span className="mt-3 inline-block whitespace-nowrap rounded-full bg-white/25 px-4 py-1.5 text-[16px] font-bold">
          中高风险
        </span>
        <h4 className="mt-3 font-display text-[26px] font-bold leading-snug">
          术后疼痛与活动度不达标，
          <br />
          合并血栓与跌倒倾向
        </h4>
        <p className="mt-3 text-[16px] leading-relaxed text-primary-foreground/85">
          近 2 周静息 VAS 4 分，屈膝 85° 低于同期目标，小腿周径左右差 1.8cm，需强化踝泵、抗凝与渐进屈膝训练并按期复查。
        </p>
        <p className="mt-3 text-[15px] text-primary-foreground/70">2026-08-15 更新（基于第 2 次评估，在历史数据上更新）</p>
      </section>

      <SectionTitle icon={AlertTriangle} title="分项结论与依据" />
      <div className="mt-3 space-y-3">
        {RISK_DETAILS.map((d) => {
          const t = riskTone(d.tone);
          return (
            <div key={d.name} className={cn("rounded-2xl border p-4", t.card)}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[19px] font-bold">{d.name}</p>
                <span className={cn("shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[14px] font-bold", t.pill)}>
                  {d.level}
                </span>
              </div>
              <p className={cn("mt-2 text-[17px] font-bold leading-snug", t.text)}>{d.concl}</p>
              <ul className="mt-2 space-y-1 text-[16px] leading-relaxed text-muted-foreground">
                {d.points.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
              <p className="mt-2 text-[14px] text-muted-foreground/80">风险来源：{d.from}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ 专病体检报告（图 2~5） ============ */

const ARCHIVE_ROWS: [string, string][] = [
  ["姓名", "李桂芳"],
  ["性别", "女"],
  ["年龄", "68 岁"],
  ["BMI", "26.4"],
  ["主要疾病", "右膝骨关节炎"],
  ["病程", "6 年"],
  ["手术方式", "全膝关节置换（右）"],
  ["合并疾病", "高血压 1 级"],
  ["当前用药", "塞来昔布胶囊"],
  ["联合用药", "利伐沙班 · 钙尔奇 D"],
  ["屈膝活动度", "85°"],
  ["疼痛 VAS", "4 分"],
  ["骨密度 T 值", "-1.2"],
  ["血压", "138/86 mmHg"],
];

const REPORT_TAGS = [
  { t: "疼痛控制", c: "bg-rose-100 text-rose-600" },
  { t: "关节活动度", c: "bg-amber-100 text-amber-600" },
  { t: "深静脉血栓", c: "bg-orange-100 text-orange-600" },
  { t: "骨质疏松", c: "bg-emerald-100 text-emerald-600" },
];

const REPORT_ISSUES = [
  "屈膝活动度 85°，是当前最需解决的问题",
  "小腿周径左右差 1.8cm，提示血栓倾向",
  "夜间疼痛影响睡眠，镇痛方案需调整",
  "每周步行不足 3000 步，肌力恢复缓慢",
];

const VISIT_ROWS: [string, string][] = [
  ["首选科室", "关节外科"],
  ["次选科室", "康复医学科（2 周内）"],
  ["建议医院", "鼓楼医院"],
  ["建议医生", "王丽 主任医师"],
  ["建议检查", "右膝正侧位 X 线"],
  ["建议检查", "下肢静脉超声"],
  ["建议检查", "D-二聚体"],
  ["建议检查", "骨密度"],
  ["就诊时间", "2 周内复诊"],
];

function ReportView({ onGoPlan }: { onGoPlan: () => void }) {
  const toast = useMiniToast();
  return (
    <div>
      <section className="rounded-2xl bg-secondary p-4">
        <p className="text-[17px] font-bold text-primary">ⓘ 本报告的生成依据</p>
        <p className="mt-2 text-[16px] leading-relaxed">
          由您上传的<span className="font-bold">健康档案（入院单、化验单、影像与用药）</span>与已完成的
          <span className="font-bold">专病问卷</span>共同分析生成，档案或问卷更新后报告会同步刷新。
        </p>
        <p className="mt-2 text-[16px] font-bold text-primary">查看档案 › 　查看问卷 ›</p>
      </section>

      <SectionTitle icon={FileText} title="健康档案摘要" right="仅供查看" />
      <div className="mt-3">
        <Table>
          {ARCHIVE_ROWS.map(([k, v]) => (
            <Row key={k} label={k} value={v} />
          ))}
        </Table>
      </div>

      <SectionTitle icon={Target} title="风险评估结论" right="先结论后依据" />
      <div className="mt-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4">
        <p className="text-[19px] font-bold leading-snug text-destructive">术后疼痛与活动度不达标，合并血栓倾向</p>
        <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
          近 2 周静息 VAS 4 分，屈膝 85° 低于同期目标，小腿周径左右差 1.8cm，需强化踝泵与渐进屈膝训练并按期复查。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REPORT_TAGS.map((x) => (
            <span key={x.t} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-[15px] font-bold", x.c)}>
              {x.t}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[16px] font-bold text-primary">查看完整评估依据 ›</p>
      </div>

      <SectionTitle icon={ClipboardList} title="最需关注的问题" />
      <ol className="mt-3 space-y-2">
        {REPORT_ISSUES.map((x, i) => (
          <li key={x} className="flex items-start gap-3 rounded-2xl border bg-card p-3.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-amber-100 text-[15px] font-bold text-amber-600">
              {i + 1}
            </span>
            <span className="text-[17px] leading-snug">{x}</span>
          </li>
        ))}
      </ol>

      <SectionTitle icon={Stethoscope} title="就医建议" right="院内仅做引导" />
      <div className="mt-3">
        <Table>
          {VISIT_ROWS.map(([k, v], i) => (
            <Row key={k + i} label={k} value={v} />
          ))}
        </Table>
      </div>
      <button onClick={() => toast("已提交预约申请，助手将电话与您确认时间")} className="mt-3 w-full rounded-2xl border-2 border-primary/30 bg-card py-3.5 text-[18px] font-bold text-primary active:scale-[0.98]">
        去预约关节外科医生 ›
      </button>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        本报告不替代医生诊疗，院内诊断与处方以主诊医生为准。
      </p>

      <section className="mt-4 flex gap-3 rounded-2xl bg-secondary p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-card text-primary">
          <HeartPulse className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="text-[18px] font-bold">健康管理方案</p>
          <p className="mt-1 text-[16px] leading-relaxed text-muted-foreground">
            专病体检报告与健康管理方案是两份独立内容。您可前往查看基于本报告生成的全病程健康管理方案。
          </p>
          <button onClick={onGoPlan} className="mt-2 text-[16px] font-bold text-primary">
            查看我的健康管理方案 ›
          </button>
        </div>
      </section>
    </div>
  );
}

/* ============ 评估中心（图 6） ============ */

const SCALES = [
  { name: "膝关节 HSS 评分", icon: Activity, tint: "bg-sky-100 text-sky-600", n: "10 题 · 约 3 分钟", done: true, req: true },
  { name: "WOMAC 骨关节炎量表", icon: HeartPulse, tint: "bg-rose-100 text-rose-600", n: "8 题 · 约 3 分钟", done: true, req: true },
  { name: "跌倒风险评估", icon: ShieldCheck, tint: "bg-violet-100 text-violet-600", n: "8 题 · 约 2 分钟", done: true, req: true },
  { name: "疼痛与睡眠评估", icon: Brain, tint: "bg-indigo-100 text-indigo-600", n: "6 题 · 约 2 分钟", done: true, req: true },
];

const LIFE_SCALES = [
  { name: "营养与饮食问卷", icon: Soup, tint: "bg-emerald-100 text-emerald-600", n: "10 题 · 约 3 分钟", done: false },
  { name: "日常活动能力（ADL）", icon: ClipboardList, tint: "bg-orange-100 text-orange-600", n: "8 题 · 约 3 分钟", done: false },
  { name: "居家环境安全问卷", icon: Target, tint: "bg-cyan-100 text-cyan-600", n: "6 题 · 约 2 分钟", done: true },
  { name: "情绪与睡眠自评", icon: Brain, tint: "bg-violet-100 text-violet-600", n: "8 题 · 约 3 分钟", done: false },
];

function ScaleCenterView({ onOpenScale }: { onOpenScale: () => void }) {
  const lifeDone = LIFE_SCALES.filter((s) => s.done).length;
  return (
    <div>
      <section className="rounded-3xl bg-primary p-5 text-primary-foreground" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[16px] font-semibold text-primary-foreground/85">专病问卷（必填）完成进度</p>
            <p className="mt-1 font-display text-[34px] font-bold leading-none">
              4 <span className="text-[18px] font-semibold text-primary-foreground/70">/ 4</span>
            </p>
          </div>
          <div className="whitespace-nowrap text-right text-[15px] font-semibold text-primary-foreground/85">
            <p>生活问卷 {lifeDone}/4</p>
            <p className="mt-1">专病问卷 4/4</p>
          </div>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-white/30">
          <div className="h-2 w-full rounded-full bg-white" />
        </div>
        <p className="mt-3 text-[16px] leading-relaxed text-primary-foreground/85">
          专病问卷已齐全，风险评估已生成；后续再次作答只会更新问卷总结。
        </p>
      </section>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <h4 className="font-display text-[21px] font-bold">专病问卷</h4>
          <p className="mt-0.5 text-[15px] text-muted-foreground">必填 · 生成个人风险评估的依据</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-destructive/10 px-3 py-1 text-[15px] font-bold text-destructive">
          4/4
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {SCALES.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.name} className="rounded-2xl border border-success/30 bg-success/5 p-4">
              <div className="flex items-start gap-3">
                <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", s.tint)}>
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[18px] font-bold leading-snug">{s.name}</p>
                  <span className="mt-1 inline-block whitespace-nowrap rounded-md bg-destructive/10 px-2 py-0.5 text-[13px] font-bold text-destructive">
                    必填
                  </span>
                  <p className="mt-1 text-[15px] text-muted-foreground">{s.n}</p>
                </div>
                <span className="shrink-0 whitespace-nowrap rounded-full bg-success px-3 py-1.5 text-[14px] font-bold text-primary-foreground">
                  已填写
                </span>
              </div>
              <button
                onClick={onOpenScale}
                className="mt-3 w-full rounded-xl border bg-card py-2.5 text-[16px] font-bold text-primary active:scale-[0.98]"
              >
                查看结果 ›
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <h4 className="font-display text-[21px] font-bold">生活问卷</h4>
          <p className="mt-0.5 text-[15px] text-muted-foreground">选填 · 用于优化康复与营养方案</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-muted px-3 py-1 text-[15px] font-bold text-muted-foreground">
          {lifeDone}/4
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {LIFE_SCALES.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.name} className={cn("rounded-2xl border p-4", s.done ? "border-success/30 bg-success/5" : "bg-card")}>
              <div className="flex items-start gap-3">
                <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", s.tint)}>
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[18px] font-bold leading-snug">{s.name}</p>
                  <p className="mt-1 text-[15px] text-muted-foreground">{s.n}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[14px] font-bold",
                    s.done ? "bg-success text-primary-foreground" : "bg-primary text-primary-foreground",
                  )}
                >
                  {s.done ? "已填写" : "去填写"}
                </span>
              </div>
              <button
                onClick={onOpenScale}
                className="mt-3 w-full rounded-xl border bg-card py-2.5 text-[16px] font-bold text-primary active:scale-[0.98]"
              >
                {s.done ? "查看结果 ›" : "开始填写 ›"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ 用药管理（图 7） ============ */

const MEDS = [
  {
    name: "塞来昔布胶囊",
    spec: "0.2g × 20 粒 · 200mg / 次 · 每日 1 次",
    times: ["08:00"],
    from: "鼓楼医院 关节外科 · 王主任医嘱",
    cycle: "周期 2026-08-01 ~ 2026-09-30 · 已服 14/60 天",
    pct: 24,
  },
  {
    name: "利伐沙班片",
    spec: "10mg × 14 片 · 10mg / 次 · 每日 1 次",
    times: ["20:00"],
    from: "术后抗凝 · 出院带药",
    cycle: "周期 2026-08-01 ~ 2026-08-28 · 已服 14/28 天",
    pct: 50,
  },
  {
    name: "钙尔奇 D",
    spec: "600mg × 60 片 · 1 片 / 次 · 每日 1 次",
    times: ["21:30"],
    from: "骨质疏松预防 · 长期",
    cycle: "周期 长期服用 · 已服 62 天",
    pct: 80,
  },
];

function MedView({ onOpenAi }: { onOpenAi: () => void }) {
  const toast = useMiniToast();
  const [taken, setTaken] = useState<Record<string, boolean>>({});
  const [stopped, setStopped] = useState<Record<string, boolean>>({});
  const doneCount = MEDS.filter((m) => taken[m.name]).length;

  return (
    <div>
      <section className="rounded-3xl bg-primary p-5 text-primary-foreground" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <p className="text-[16px] font-semibold text-primary-foreground/85">今日服药</p>
        <p className="mt-1 font-display text-[32px] font-bold leading-none">
          {doneCount}/{MEDS.length} <span className="text-[17px] font-semibold text-primary-foreground/80">在服 {MEDS.length} 种</span>
        </p>
        <div className="mt-4 h-2 w-full rounded-full bg-white/30">
          <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${(doneCount / MEDS.length) * 100}%` }} />
        </div>
      </section>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <label className="rounded-2xl border bg-card p-3.5 active:scale-[0.98]">
          <span className="grid size-11 place-items-center rounded-2xl bg-sky-100 text-sky-600">
            <Camera className="size-5" />
          </span>
          <span className="mt-2 block text-[17px] font-bold leading-tight">拍药盒 / 拍医嘱</span>
          <span className="mt-1 block text-[14px] leading-snug text-muted-foreground">AI 识别自动生成用药计划</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" />
        </label>
        <button onClick={() => toast("已打开手动录入表单")} className="rounded-2xl border bg-card p-3.5 text-left active:scale-[0.98]">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
            <Plus className="size-5" />
          </span>
          <span className="mt-2 block text-[17px] font-bold leading-tight">手动输入</span>
          <span className="mt-1 block text-[14px] leading-snug text-muted-foreground">自定义名称、剂量与提醒</span>
        </button>
      </div>

      <SectionTitle icon={Pill} title="在服药品" right={`${MEDS.length} 种`} />
      <div className="mt-3 space-y-3">
        {MEDS.map((m) => {
          const done = !!taken[m.name];
          const off = !!stopped[m.name];
          return (
            <div key={m.name} className={cn("rounded-2xl border bg-card p-4", off && "opacity-60")}>
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal-100 text-teal-600">
                  <Pill className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[19px] font-bold leading-snug">{m.name}</p>
                  <p className="mt-1 text-[16px] text-muted-foreground">{m.spec}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.times.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-muted px-2.5 py-1 text-[15px] font-bold">
                        <Clock className="size-4" /> {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[15px] text-muted-foreground">{m.from}</p>
                </div>
              </div>

              <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${m.pct}%` }} />
              </div>
              <p className="mt-2 text-[15px] text-muted-foreground">{m.cycle}</p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {["服用记录", "周期计划", "用药禁忌"].map((x) => (
                  <button key={x} onClick={() => toast(`${m.name} · ${x}`)} className="whitespace-nowrap rounded-xl bg-muted py-2 text-[15px] font-bold active:scale-[0.98]">
                    {x}
                  </button>
                ))}
              </div>

              <div className="mt-2.5 flex gap-2">
                <button
                  onClick={() => setTaken((s) => ({ ...s, [m.name]: !done }))}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl py-3 text-[17px] font-bold active:scale-[0.98]",
                    done ? "bg-success text-primary-foreground" : "bg-primary text-primary-foreground",
                  )}
                >
                  <Check className="size-5" /> {done ? "已打卡" : "打卡"}
                </button>
                <button
                  onClick={() => setStopped((s) => ({ ...s, [m.name]: !off }))}
                  className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-destructive/10 px-5 py-3 text-[17px] font-bold text-destructive active:scale-[0.98]"
                >
                  <Ban className="size-5" /> {off ? "已停药" : "停药"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <BigButton onClick={onOpenAi}>咨询骨灵：能否停药</BigButton>
    </div>
  );
}

/* ============ 健康数据录入（图 8） ============ */

const METRICS = [
  { name: "疼痛 VAS", when: "今 08:10 · 静息", value: "4", unit: "分", trend: "近 7 日下降", icon: Activity, tint: "bg-rose-100 text-rose-600" },
  { name: "屈膝角度", when: "今 09:00", value: "85", unit: "°", trend: "近 7 日 +5°", icon: Target, tint: "bg-sky-100 text-sky-600" },
  { name: "血压", when: "昨 21:30", value: "138/86", unit: "mmHg", trend: "正常高值", icon: HeartPulse, tint: "bg-cyan-100 text-cyan-600" },
  { name: "体温", when: "今晨", value: "36.6", unit: "℃", trend: "近 7 日平稳", icon: Droplet, tint: "bg-emerald-100 text-emerald-600" },
  { name: "小腿周径", when: "今 09:05", value: "36.8", unit: "cm", trend: "左右差 1.8cm", icon: TrendingUp, tint: "bg-violet-100 text-violet-600" },
];

function DataView() {
  const [tab, setTab] = useState<"manual" | "device">("manual");
  const [add, setAdd] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 rounded-2xl border bg-card p-1">
        {(
          [
            { k: "manual", t: "手动录入", i: Keyboard },
            { k: "device", t: "设备同步", i: Bluetooth },
          ] as const
        ).map((x) => {
          const Icon = x.i;
          return (
            <button
              key={x.k}
              onClick={() => setTab(x.k)}
              className={cn(
                "flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl py-3 text-[17px] font-bold",
                tab === x.k ? "bg-secondary text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" /> {x.t}
            </button>
          );
        })}
      </div>

      <section className="mt-3 rounded-3xl bg-primary p-5 text-primary-foreground" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/25 px-3 py-1.5 text-[15px] font-bold">
          <Clock className="size-4" /> 今日待录入
        </span>
        <p className="mt-3 font-display text-[22px] font-bold">晨起疼痛 · 屈膝角度 · 晚间血压</p>
        <p className="mt-2 text-[16px] text-primary-foreground/85">主诊医生本周关注：屈膝活动度与小腿肿胀</p>
      </section>

      {tab === "device" ? (
        <div className="mt-4 space-y-2.5">
          {["电子血压计 · 已连接", "智能体温贴 · 未连接", "关节角度仪 · 已连接"].map((d) => (
            <div key={d} className="flex items-center justify-between rounded-2xl border bg-card px-4 py-3.5">
              <span className="text-[17px] font-bold">{d.split(" · ")[0]}</span>
              <span
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-[15px] font-bold",
                  d.includes("未") ? "bg-muted text-muted-foreground" : "bg-success/10 text-success",
                )}
              >
                {d.split(" · ")[1]}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <SectionTitle icon={Activity} title="常用指标" right="趋势与 AI 分析 ›" />
          <div className="mt-3 space-y-2.5">
            {METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.name} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                  <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", m.tint)}>
                    <Icon className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="whitespace-nowrap text-[16px] text-muted-foreground">{m.name}</span>
                      <span className="whitespace-nowrap text-[14px] text-muted-foreground">{m.when}</span>
                    </div>
                    <p className="mt-0.5 font-display text-[26px] font-bold leading-none">
                      {m.value} <span className="text-[15px] font-semibold text-muted-foreground">{m.unit}</span>
                    </p>
                    <p className="mt-1 text-[15px] font-bold text-success">↗ {m.trend}</p>
                  </div>
                  <button
                    onClick={() => setAdd(m.name)}
                    aria-label={`录入${m.name}`}
                    className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground active:scale-95"
                  >
                    <Plus className="size-6" />
                  </button>
                </div>
              );
            })}
          </div>

          {add && (
            <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-card p-4">
              <p className="text-[18px] font-bold">录入{add}</p>
              <div className="mt-3">
                <Field label={add} unit="" placeholder="请输入数值" />
              </div>
              <button
                onClick={() => {
                  setSaved(true);
                  setAdd(null);
                }}
                className="mt-3 w-full rounded-2xl bg-primary py-3 text-[17px] font-bold text-primary-foreground"
              >
                保存
              </button>
            </div>
          )}
          {saved && (
            <p className="mt-3 rounded-2xl bg-success/10 px-4 py-3 text-[17px] font-bold text-success">已保存，医护可见</p>
          )}
        </>
      )}
    </div>
  );
}


/* ============ 今日任务中心（复用代码包任务页交互，内容改为骨关节） ============ */

type QTask = { id: string; title: string; desc: string; time: string; done: boolean };
type QGroupKey = "rehab" | "med" | "diet";

const TASK_GROUPS: { key: QGroupKey; label: string; icon: React.ElementType; tone: string; tasks: QTask[] }[] = [
  {
    key: "rehab",
    label: "康复运动",
    icon: Dumbbell,
    tone: "bg-rose-100 text-rose-600",
    tasks: [
      { id: "r1", title: "踝泵运动 3 组", desc: "每组 20 次 · 预防下肢血栓", time: "08:30", done: true },
      { id: "r2", title: "直腿抬高 3 组", desc: "每组 10 次 · 强化股四头肌", time: "14:00", done: false },
      { id: "r3", title: "屈膝训练 0-100°", desc: "床边垂膝 · 每次 10 分钟", time: "19:30", done: false },
    ],
  },
  {
    key: "med",
    label: "用药",
    icon: Pill,
    tone: "bg-teal-100 text-teal-600",
    tasks: [
      { id: "m1", title: "塞来昔布胶囊", desc: "200mg · 餐后服用（镇痛）", time: "08:00", done: true },
      { id: "m2", title: "利伐沙班片", desc: "10mg · 每日一次（抗凝）", time: "12:30", done: false },
      { id: "m3", title: "钙尔奇 D", desc: "600mg · 睡前（补钙）", time: "21:00", done: false },
    ],
  },
  {
    key: "diet",
    label: "饮食营养",
    icon: Utensils,
    tone: "bg-emerald-100 text-emerald-600",
    tasks: [
      { id: "d1", title: "早餐打卡", desc: "高蛋白 · 鸡蛋 / 牛奶", time: "已完成", done: true },
      { id: "d2", title: "午餐打卡", desc: "拍照识别 · 蛋白质与补钙达标", time: "12:00", done: false },
      { id: "d3", title: "药食同源汤品", desc: "杜仲牛骨汤 · 强筋壮骨", time: "18:30", done: false },
    ],
  },
];

function TaskCenterView({ onGoTodos }: { onGoTodos: () => void }) {
  const all = useMemo(() => TASK_GROUPS.flatMap((g) => g.tasks), []);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(all.map((t) => [t.id, t.done])),
  );
  const [sheet, setSheet] = useState<{ kind: "rehab" | "diet"; task: QTask } | null>(null);
  const done = all.filter((t) => doneMap[t.id]).length;
  const pct = Math.round((done / all.length) * 100);
  const markDone = (id: string) => setDoneMap((m) => ({ ...m, [id]: true }));

  return (
    <div>
      <section className="rounded-3xl bg-primary p-5 text-primary-foreground" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <p className="text-[16px] font-semibold text-primary-foreground/85">今日打卡进度</p>
        <p className="mt-1 font-display text-[30px] font-bold leading-none">
          {done}/{all.length}
          <span className="ml-2 text-[16px] font-semibold opacity-85">完成 {pct}%</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
        </div>
      </section>

      {TASK_GROUPS.map((g) => {
        const Icon = g.icon;
        const gDone = g.tasks.filter((t) => doneMap[t.id]).length;
        return (
          <div key={g.key}>
            <SectionTitle icon={g.icon} title={`${g.label}打卡`} right={`${gDone}/${g.tasks.length}`} />
            <div className="mt-3 space-y-2.5">
              {g.tasks.map((t) => {
                const isDone = !!doneMap[t.id];
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3.5">
                    <span
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-2xl",
                        isDone ? "bg-success text-primary-foreground" : g.tone,
                      )}
                    >
                      {isDone ? <CheckCircle2 className="size-6" /> : <Icon className="size-6" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-[17px] font-bold", isDone && "text-muted-foreground line-through")}>
                        {t.title}
                      </p>
                      <p className="mt-0.5 truncate text-[15px] text-muted-foreground">{t.desc}</p>
                      <p className="mt-0.5 flex items-center gap-1 whitespace-nowrap text-[14px] text-muted-foreground">
                        <Clock className="size-3.5" /> {t.time}
                      </p>
                    </div>
                    {isDone ? (
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-muted px-3 py-2 text-[14px] font-bold text-muted-foreground">
                        已打卡
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          g.key === "med" ? markDone(t.id) : setSheet({ kind: g.key === "diet" ? "diet" : "rehab", task: t })
                        }
                        className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-primary px-3.5 py-2 text-[14px] font-bold text-primary-foreground active:scale-95"
                      >
                        {g.key === "med" ? <Check className="size-4" /> : g.key === "diet" ? <Camera className="size-4" /> : <Smartphone className="size-4" />}
                        {g.key === "med" ? "确认服药" : "打卡"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <BigButton onClick={onGoTodos}>回到首页待办</BigButton>

      {sheet && (
        <CheckInSheet
          kind={sheet.kind}
          task={sheet.task}
          onClose={() => setSheet(null)}
          onConfirm={() => {
            markDone(sheet.task.id);
            setSheet(null);
          }}
        />
      )}
    </div>
  );
}

export function CheckInSheet({
  kind,
  task,
  onClose,
  onConfirm,
}: {
  kind: "rehab" | "diet";
  task: QTask;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [mode, setMode] = useState<"photo" | "voice" | "manual">(kind === "diet" ? "photo" : "voice");
  const [recording, setRecording] = useState(false);
  const [note, setNote] = useState("");
  const [project, setProject] = useState(kind === "rehab" ? task.title.replace(/\s*\d+.*$/, "") : "");
  const [duration, setDuration] = useState("10");

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[88%] overflow-y-auto rounded-t-3xl bg-background p-4 pb-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-display text-[20px] font-bold">{kind === "diet" ? "饮食打卡" : "康复运动打卡"}</h4>
            <p className="mt-0.5 truncate text-[15px] text-muted-foreground">{task.title}</p>
          </div>
          <button onClick={onClose} aria-label="关闭" className="grid size-9 shrink-0 place-items-center rounded-full bg-muted">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          {kind === "diet" ? (
            <>
              <ModeBtn active={mode === "photo"} onClick={() => setMode("photo")} icon={<Camera className="size-5" />} label="拍照识别" />
              <ModeBtn active={mode === "voice"} onClick={() => setMode("voice")} icon={<Mic className="size-5" />} label="语音描述" />
            </>
          ) : (
            <>
              <ModeBtn active={mode === "voice"} onClick={() => setMode("voice")} icon={<Mic className="size-5" />} label="语音录入" />
              <ModeBtn active={mode === "manual"} onClick={() => setMode("manual")} icon={<Smartphone className="size-5" />} label="手动填写" />
            </>
          )}
        </div>

        {mode === "photo" && (
          <label className="block rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
            <ImageIcon className="mx-auto size-9 text-primary" />
            <span className="mt-2 block text-[17px] font-bold">上传本餐照片</span>
            <span className="mt-1 block text-[15px] text-muted-foreground">AI 自动识别菜品与蛋白质、补钙是否达标</span>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[16px] font-bold text-primary-foreground">
              <Camera className="size-4" /> 拍照 / 相册
            </span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
        )}

        {mode === "voice" && (
          <div className="rounded-2xl bg-muted/50 p-6 text-center">
            <button
              onClick={() => setRecording((r) => !r)}
              className={cn(
                "mx-auto grid size-20 place-items-center rounded-full",
                recording ? "animate-pulse bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground",
              )}
            >
              <Mic className="size-9" />
            </button>
            <p className="mt-3 text-[16px] text-muted-foreground">
              {recording ? "正在录音，点击结束" : kind === "diet" ? "说出这一餐吃了什么" : "说出完成的动作与组数"}
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={kind === "diet" ? "示例：一碗牛骨汤、一个鸡蛋、半份西兰花" : "示例：踝泵 3 组，每组 20 次，无明显疼痛"}
              className="mt-3 h-24 w-full resize-none rounded-xl border bg-card p-3 text-[16px]"
            />
          </div>
        )}

        {mode === "manual" && kind === "rehab" && (
          <div className="space-y-3 rounded-2xl bg-muted/50 p-3.5">
            <label className="block">
              <span className="text-[15px] text-muted-foreground">运动项目</span>
              <input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="踝泵 / 直腿抬高 / 屈膝"
                className="mt-1 h-12 w-full rounded-xl border bg-card px-3 text-[17px]"
              />
            </label>
            <label className="block">
              <span className="text-[15px] text-muted-foreground">时长（分钟）</span>
              <span className="mt-1 flex items-center gap-2">
                <Timer className="size-5 text-muted-foreground" />
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  className="h-12 min-w-0 flex-1 rounded-xl border bg-card px-3 text-[17px]"
                />
              </span>
            </label>
          </div>
        )}

        <BigButton onClick={onConfirm}>完成打卡</BigButton>
      </div>
    </div>
  );
}

function ModeBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl text-[16px] font-bold active:scale-[0.98]",
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {icon} {label}
    </button>
  );
}

/* ============ 其它简单页 ============ */


export function QuickEntrySheet({
  entry,
  onClose,
  onGoTodos,
  onOpenScale,
  onOpenAi,
  onArchived,
}: {
  entry: QuickKey;
  onClose: () => void;
  onGoTodos: () => void;
  onOpenScale: () => void;
  onOpenAi: () => void;
  onArchived?: () => void;
}) {
  const meta = QUICK_ENTRIES.find((e) => e.key === entry)!;
  const [photo, setPhoto] = useState<string | null>(null);

  const title =
    entry === "risk"
      ? "我的风险评估"
      : entry === "scale"
          ? "评估中心"
          : entry === "med"
            ? "用药管理"
            : entry === "data"
              ? "健康数据录入"
              : meta.title;

  // 以下入口完全复用代码包中的页面样式与交互（全屏二级页）
  if (entry === "archive") return <ArchiveView onClose={onClose} onUploaded={onArchived} />;
  if (entry === "med") return <MedsView onClose={onClose} />;
  if (entry === "data") return <DataEntryView onClose={onClose} />;
  if (entry === "plan") return <CarePlanView onClose={onClose} />;
  if (entry === "diet") return <DietView onClose={onClose} />;

  return (
    <Panel title={title} subtitle={entry === "risk" ? undefined : meta.desc} onClose={onClose}>

      {entry === "archive" && (
        <div>
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            拍照上传「入院单 / 诊断证明 / 检查报告」，系统自动识别姓名、诊断与手术信息。
          </p>
          {photo && <img src={photo} alt="上传的照片" className="mt-4 h-44 w-full rounded-2xl object-cover" />}
          <label className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[18px] font-bold text-primary-foreground active:scale-[0.98]">
            <Camera className="size-6" /> {photo ? "重新拍照" : "拍照上传"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPhoto(URL.createObjectURL(f));
              }}
            />
          </label>
          <label className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3 text-[17px] font-bold active:scale-[0.98]">
            从相册选择
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPhoto(URL.createObjectURL(f));
              }}
            />
          </label>
          {photo && (
            <p className="mt-3 rounded-2xl bg-success/10 px-4 py-3 text-[17px] font-bold text-success">
              识别成功：右膝骨关节炎 · 全膝关节置换术
            </p>
          )}
        </div>
      )}

      {entry === "risk" && <RiskView />}
      {entry === "scale" && <ScaleCenterView onOpenScale={() => { onClose(); onOpenScale(); }} />}
      {entry === "today" && <TaskCenterView onGoTodos={() => { onClose(); onGoTodos(); }} />}


    </Panel>
  );
}
