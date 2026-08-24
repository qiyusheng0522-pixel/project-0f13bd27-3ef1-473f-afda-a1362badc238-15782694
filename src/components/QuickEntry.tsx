import { useState } from "react";
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
  MessageSquare,
  Stethoscope,
  X,
  Check,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickKey =
  | "archive"
  | "risk"
  | "report"
  | "scale"
  | "today"
  | "med"
  | "data"
  | "plan"
  | "diet"
  | "message"
  | "consult";

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
  { key: "report", title: "报告方案", desc: "第 3 步", icon: FileText, tint: "bg-fuchsia-100 text-fuchsia-600" },
  { key: "scale", title: "评估问卷", desc: "专病量表", icon: ScrollText, tint: "bg-slate-200 text-slate-700" },
  { key: "today", title: "今日任务", desc: "打卡得分", icon: ClipboardList, tint: "bg-orange-100 text-orange-600" },
  { key: "med", title: "用药管理", desc: "打卡/停药", icon: Pill, tint: "bg-teal-100 text-teal-600" },
  { key: "data", title: "数据录入", desc: "血压体温", icon: Droplet, tint: "bg-cyan-100 text-cyan-600" },
  { key: "plan", title: "健康方案", desc: "执行与服务", icon: HeartPulse, tint: "bg-rose-100 text-rose-600" },
  { key: "diet", title: "饮食打卡", desc: "拍照识别", icon: Soup, tint: "bg-emerald-100 text-emerald-600" },
  { key: "message", title: "消息", desc: "医生回复", icon: MessageSquare, tint: "bg-amber-100 text-amber-600" },
  { key: "consult", title: "在线问诊", desc: "骨科专科", icon: Stethoscope, tint: "bg-indigo-100 text-indigo-600" },
];

/* ============ 首页卡片 ============ */

export function QuickEntryCard({ onPick }: { onPick: (k: QuickKey) => void }) {
  return (
    <section className="overflow-hidden rounded-[26px] border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
      <header className="px-5 pb-1 pt-4">
        <h2 className="font-display text-[21px] font-bold">快捷入口</h2>
        <p className="mt-0.5 text-[15px] text-muted-foreground">核心功能一键直达</p>
      </header>
      <div className="grid grid-cols-3 gap-2.5 p-3">
        {QUICK_ENTRIES.map((e) => {
          const Icon = e.icon;
          return (
            <button
              key={e.key}
              onClick={() => onPick(e.key)}
              className="flex flex-col items-center gap-1.5 rounded-2xl border bg-card px-1.5 py-3.5 text-center active:scale-[0.97]"
            >
              <span className={cn("grid size-12 place-items-center rounded-2xl", e.tint)}>
                <Icon className="size-6" />
              </span>
              <span className="whitespace-nowrap text-[17px] font-bold leading-tight">{e.title}</span>
              <span className="whitespace-nowrap text-[14px] leading-tight text-muted-foreground">{e.desc}</span>
            </button>
          );
        })}
      </div>
    </section>
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
      <div className="relative max-h-[86%] overflow-y-auto rounded-t-3xl bg-background p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[22px] font-bold">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[15px] text-muted-foreground">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="关闭" className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
            <X className="size-5" />
          </button>
        </div>
        {children}
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
    <div className="flex items-center justify-between rounded-2xl border bg-card px-4 py-3">
      <span className="text-[17px] text-muted-foreground">{label}</span>
      <span className="whitespace-nowrap text-[18px] font-bold">{value}</span>
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

const RISK_ITEMS = [
  { q: "近一周是否有跌倒？", a: ["无", "1 次", "2 次以上"] },
  { q: "夜间疼痛是否影响睡眠？", a: ["不影响", "偶尔", "经常"] },
  { q: "下肢是否明显肿胀？", a: ["无", "轻度", "中重度"] },
];

const MEDS = [
  { name: "塞来昔布胶囊", dose: "200mg · 每日 1 次 · 早餐后" },
  { name: "利伐沙班片", dose: "10mg · 每日 1 次 · 固定时间" },
  { name: "钙尔奇 D", dose: "600mg · 每日 1 次 · 睡前" },
];

const MSGS = [
  { who: "王主任 · 主刀医生", txt: "术后 2 周复查 X 光，注意伤口保持干燥。", t: "今天 09:20" },
  { who: "李治疗师", txt: "屈膝角度已达 95°，今天可增加 10 次直腿抬高。", t: "昨天 16:40" },
  { who: "护士站", txt: "明日 08:00 空腹抽血，请勿进食。", t: "昨天 20:05" },
];

export function QuickEntrySheet({
  entry,
  onClose,
  onGoTodos,
  onOpenScale,
  onOpenAi,
}: {
  entry: QuickKey;
  onClose: () => void;
  onGoTodos: () => void;
  onOpenScale: () => void;
  onOpenAi: () => void;
}) {
  const meta = QUICK_ENTRIES.find((e) => e.key === entry)!;
  const [photo, setPhoto] = useState<string | null>(null);
  const [risk, setRisk] = useState<Record<number, number>>({});
  const [taken, setTaken] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const riskScore = Object.values(risk).reduce((a, b) => a + b, 0);

  return (
    <Panel title={meta.title} subtitle={meta.desc} onClose={onClose}>
      {(entry === "archive" || entry === "diet") && (
        <div>
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            {entry === "archive"
              ? "拍照上传「入院单 / 诊断证明 / 检查报告」，系统自动识别姓名、诊断与手术信息。"
              : "拍下这一餐，系统自动识别菜品并评估蛋白质与嘌呤是否达标。"}
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
              {entry === "archive" ? "识别成功：右膝骨关节炎 · 全膝关节置换术" : "识别成功：清蒸鱼 + 西兰花 · 蛋白质充足，嘌呤偏低"}
            </p>
          )}
        </div>
      )}

      {entry === "risk" && (
        <div>
          <p className="text-[17px] leading-relaxed text-muted-foreground">3 个问题，评估当前跌倒与血栓风险。</p>
          <div className="mt-4 space-y-3">
            {RISK_ITEMS.map((it, i) => (
              <div key={it.q} className="rounded-2xl border bg-card p-3.5">
                <p className="text-[18px] font-bold leading-snug">{it.q}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {it.a.map((a, ai) => (
                    <button
                      key={a}
                      onClick={() => setRisk((s) => ({ ...s, [i]: ai }))}
                      className={cn(
                        "whitespace-nowrap rounded-xl border-2 py-2.5 text-[16px] font-bold",
                        risk[i] === ai ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground",
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-secondary px-4 py-3.5 text-[18px] font-bold text-primary">
            风险等级：{riskScore >= 4 ? "较高，建议联系医生" : riskScore >= 2 ? "中等，注意防护" : "低"}
          </div>
          <BigButton onClick={onClose}>提交评估</BigButton>
        </div>
      )}

      {entry === "report" && (
        <div className="space-y-2.5">
          <Row label="诊断" value="右膝骨关节炎" />
          <Row label="手术" value="全膝关节置换（右）" />
          <Row label="当前阶段" value="术后康复期" />
          <Row label="下次复查" value="术后 2 周" />
          <div className="rounded-2xl border bg-card p-4">
            <p className="text-[18px] font-bold">方案摘要</p>
            <ul className="mt-2 space-y-1.5 text-[17px] leading-relaxed text-muted-foreground">
              <li>· 每日踝泵 3 组 × 20 次，预防血栓</li>
              <li>· 屈膝训练目标 100°，循序渐进</li>
              <li>· 高蛋白饮食，补钙 + 维生素 D</li>
            </ul>
          </div>
          <BigButton onClick={onGoTodos}>查看今日执行清单</BigButton>
        </div>
      )}

      {entry === "scale" && (
        <div>
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            专病量表共 8 项，约 3 分钟，提交后治疗师会据此调整康复方案。
          </p>
          <BigButton
            onClick={() => {
              onClose();
              onOpenScale();
            }}
          >
            开始填写量表
          </BigButton>
        </div>
      )}

      {entry === "today" && (
        <div>
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            今日任务包含康复动作、用药、护理与问卷，每完成一项可获得打卡积分。
          </p>
          <BigButton
            onClick={() => {
              onClose();
              onGoTodos();
            }}
          >
            去打卡
          </BigButton>
        </div>
      )}

      {entry === "med" && (
        <div>
          <p className="text-[17px] leading-relaxed text-muted-foreground">点击圆圈完成服药打卡；如需停药请先咨询医生。</p>
          <ul className="mt-4 space-y-2.5">
            {MEDS.map((m) => {
              const done = !!taken[m.name];
              return (
                <li key={m.name} className="flex items-start gap-3 rounded-2xl border bg-card p-3.5">
                  <button
                    onClick={() => setTaken((s) => ({ ...s, [m.name]: !done }))}
                    aria-label={done ? "取消打卡" : "服药打卡"}
                    className={cn(
                      "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border-2 active:scale-95",
                      done ? "border-success bg-success text-primary-foreground" : "border-border text-transparent",
                    )}
                  >
                    <Check className="size-5" />
                  </button>
                  <div className="min-w-0">
                    <p className={cn("text-[18px] font-bold", done && "text-muted-foreground line-through")}>{m.name}</p>
                    <p className="mt-0.5 text-[16px] text-muted-foreground">{m.dose}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <BigButton onClick={onOpenAi}>咨询骨灵：能否停药</BigButton>
        </div>
      )}

      {entry === "data" && (
        <div>
          <p className="text-[17px] leading-relaxed text-muted-foreground">每日记录一次，异常数值会自动提醒医护。</p>
          <div className="mt-4 space-y-2.5">
            <Field label="血压（高压/低压）" unit="mmHg" placeholder="130/80" />
            <Field label="体温" unit="℃" placeholder="36.6" />
            <Field label="伤口疼痛（0-10）" unit="分" placeholder="3" />
            <Field label="屈膝角度" unit="°" placeholder="95" />
          </div>
          {saved && <p className="mt-3 rounded-2xl bg-success/10 px-4 py-3 text-[17px] font-bold text-success">已保存，医护可见</p>}
          <BigButton onClick={() => setSaved(true)}>保存今日数据</BigButton>
        </div>
      )}

      {entry === "plan" && (
        <div className="space-y-2.5">
          {[
            { t: "康复运动", d: "踝泵 · 直腿抬高 · 屈膝训练", c: "bg-rose-100 text-rose-600" },
            { t: "营养饮食", d: "高蛋白 · 补钙 · 药食同源汤品", c: "bg-emerald-100 text-emerald-600" },
            { t: "注意事项", d: "助行器使用 · 伤口护理 · 防跌倒", c: "bg-amber-100 text-amber-600" },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", x.c)}>
                <HeartPulse className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-[18px] font-bold">{x.t}</span>
                <span className="mt-0.5 block text-[16px] text-muted-foreground">{x.d}</span>
              </span>
              <ChevronRight className="ml-auto size-5 shrink-0 text-muted-foreground" />
            </div>
          ))}
          <BigButton onClick={onGoTodos}>方案已转为今日待办</BigButton>
        </div>
      )}

      {entry === "message" && (
        <ul className="space-y-2.5">
          {MSGS.map((m) => (
            <li key={m.txt} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="whitespace-nowrap text-[17px] font-bold text-primary">{m.who}</p>
                <span className="whitespace-nowrap text-[14px] text-muted-foreground">{m.t}</span>
              </div>
              <p className="mt-1.5 text-[17px] leading-relaxed">{m.txt}</p>
            </li>
          ))}
        </ul>
      )}

      {entry === "consult" && (
        <div>
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            骨科专科在线问诊，工作日 08:00–20:00 由值班医生回复；也可先问「骨灵」智能助手。
          </p>
          <div className="mt-4 space-y-2.5">
            <Row label="值班医生" value="张医生 · 在线" />
            <Row label="平均回复" value="约 8 分钟" />
          </div>
          <BigButton
            onClick={() => {
              onClose();
              onOpenAi();
            }}
          >
            立即咨询
          </BigButton>
        </div>
      )}
    </Panel>
  );
}
