import { useState } from "react";
import {
  Sparkles,
  ChevronRight,
  Clock,
  Check,
  Stethoscope,
  Bell,
  QrCode,
  X,
  ShoppingBag,
  Pill,
  Dumbbell,
  BookOpen,
  Apple,
  Upload,
  MapPin,
  ScanLine,
  Watch,
  HeartPulse,
  FileText,
} from "lucide-react";
import aiDoctor from "@/assets/ai-doctor.jpg";
import { cn } from "@/lib/utils";

export type HomeTodo = {
  id: string;
  title: string;
  detail: string;
  category: "运动" | "宣教" | "用药" | "饮食" | "复查";
  time?: string;
  done?: boolean;
};

const CATEGORY_ICON = {
  运动: Dumbbell,
  宣教: BookOpen,
  用药: Pill,
  饮食: Apple,
  复查: Stethoscope,
} as const;

const AI_QUICK = ["膝盖肿了怎么办", "今天能下地走路吗", "康复动作做几组"];

export function PatientHomeScreen({
  mode,
  patientName,
  bedInfo,
  stageLabel,
  stageIdx,
  stageTotal,
  onOpenPath,
  admissionUploaded,
  onUpload,
  todos,
  onToggle,
  onAskAI,
  onOpenScale,
  onOpenGuide,
  eduSlot,
}: {
  mode: "inpatient" | "home";
  patientName: string;
  bedInfo: string;
  stageLabel: string;
  stageIdx: number;
  stageTotal: number;
  onOpenPath: () => void;
  admissionUploaded: boolean;
  onUpload: () => void;
  todos: HomeTodo[];
  onToggle: (id: string) => void;
  onAskAI: (q?: string) => void;
  onOpenScale: () => void;
  onOpenGuide: () => void;
  eduSlot?: React.ReactNode;
}) {
  const [todoIdx, setTodoIdx] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);
  const total = todos.length;
  const idx = Math.min(todoIdx, Math.max(total - 1, 0));
  const current = todos[idx];
  const remaining = todos.filter((t) => !t.done).length;
  const Icon = current ? CATEGORY_ICON[current.category] : Pill;

  const next = (step: number) => setTodoIdx((i) => (i + step + total) % total);

  return (
    <div className="relative overflow-hidden pb-2">
      {/* 氛围光背景 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 0%, oklch(0.55 0.16 240 / 0.30), transparent 60%), radial-gradient(50% 40% at 90% 10%, oklch(0.62 0.13 200 / 0.26), transparent 60%)",
        }}
      />

      <div className="relative">
        {/* 第一屏：AI 主治医生 Hero */}
        <section className="px-3 pt-3">
          <article
            className="relative overflow-hidden rounded-[30px] p-5 text-white"
            style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 animate-shimmer"
              style={{
                background:
                  "linear-gradient(110deg, transparent 0%, oklch(1 0 0 / 0.22) 50%, transparent 100%)",
              }}
            />
            <div
              aria-hidden
              className="absolute -right-16 -top-20 size-56 rounded-full opacity-30 blur-3xl"
              style={{ background: "oklch(0.85 0.12 220)" }}
            />

            <div className="relative mb-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[15px] font-bold text-white/95 ring-1 ring-white/20">
                <Sparkles className="size-4" /> 骨安 · 今日任务
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenGuide}
                  className="inline-flex h-10 items-center gap-1 rounded-full bg-white/15 px-3 text-[15px] font-bold text-white ring-1 ring-white/25 active:scale-95"
                >
                  <Sparkles className="size-4" /> 引导
                </button>
                <button
                  onClick={() => setQrOpen(true)}
                  className="inline-flex h-10 items-center gap-1 rounded-full bg-white px-3 text-[15px] font-bold text-primary shadow-md active:scale-95"
                >
                  <QrCode className="size-4" /> 入群
                </button>
              </div>
            </div>

            <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3 text-white/90" />
                  <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-white/85">
                    骨安 · 您的 AI 主治医生
                  </p>
                </div>
                <p className="mt-2 text-[23px] font-bold leading-snug">
                  {patientName}，今日 {remaining} 项待打卡
                </p>
                <p className="mt-2 text-[17px] leading-relaxed text-white/90">
                  {mode === "inpatient" ? "康复训练 · 用药 · 宣教" : "居家康复 · 用药 · 饮食"}
                </p>
              </div>
              <button
                onClick={() => onAskAI()}
                aria-label="进入骨灵会话"
                className="group relative shrink-0 transition-transform active:scale-95"
              >
                <div className="size-[80px] overflow-hidden rounded-2xl shadow-xl ring-[3px] ring-white/50 transition-all group-hover:ring-white">
                  <img
                    src={aiDoctor}
                    alt="骨灵 AI 主治医生"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="animate-breathe absolute -bottom-2 left-1/2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[15px] font-bold text-primary shadow-lg ring-2 ring-primary/20">
                  点我试试
                </span>
              </button>
            </div>

            {/* 今日任务卡（票据式） */}
            <div className="relative mt-6 rounded-[22px] bg-card p-4 text-foreground shadow-[0_10px_28px_-8px_rgba(0,0,0,0.18)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="size-4" />
                  </span>
                  <span className="text-[17px] font-bold">今日任务</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[15px] font-bold text-primary">
                    {idx + 1}/{total}
                  </span>
                  <button
                    onClick={() => next(-1)}
                    aria-label="上一项"
                    className="grid size-8 place-items-center rounded-full bg-muted text-foreground/70 active:scale-95"
                  >
                    <ChevronRight className="size-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => next(1)}
                    aria-label="下一项"
                    className="grid size-8 place-items-center rounded-full bg-muted text-foreground/70 active:scale-95"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {current && (
                <div className={cn("rounded-[18px] p-3.5", current.done ? "bg-success/10" : "bg-muted/60")}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset",
                        current.done
                          ? "bg-success/10 text-success ring-success/20"
                          : "bg-primary/10 text-primary ring-primary/20",
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <p
                      className={cn(
                        "min-w-0 flex-1 text-[18px] font-bold leading-snug",
                        current.done && "text-foreground/40 line-through",
                      )}
                    >
                      {current.title}
                    </p>

                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[15px]">
                    {current.time && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary">
                        <Clock className="size-4" /> {current.time}
                      </span>
                    )}
                    <span className="rounded-md bg-foreground/[0.06] px-2 py-0.5 font-semibold text-foreground/70">
                      {current.category}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-end justify-between gap-3">
                    <p className="min-w-0 flex-1 text-[17px] leading-snug text-foreground/75">
                      {current.detail}
                    </p>
                    {current.done ? (
                      <span className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-success/10 px-3 text-[17px] font-bold text-success">
                        <Check className="size-4" /> 已打卡
                      </span>
                    ) : (
                      <button
                        onClick={() => onToggle(current.id)}
                        className="inline-flex h-11 shrink-0 items-center rounded-full bg-primary px-5 text-[17px] font-bold text-primary-foreground shadow-sm active:scale-95"
                      >
                        确认
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 快捷提问 */}
            <div className="-mx-1 mt-4 px-1">
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                {AI_QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => onAskAI(q)}
                    className="shrink-0 rounded-full bg-white/15 px-3 py-2 text-[16px] font-semibold text-white/95 ring-1 ring-white/25 transition-colors hover:bg-white hover:text-primary active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </article>

          {/* 医生咨询 + 消息 */}
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <button
              onClick={() => onAskAI("我想咨询我的主管医生")}
              className="flex items-center justify-between rounded-2xl bg-card px-3.5 py-3 ring-1 ring-black/[0.06] transition-transform active:scale-[0.99]"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10">
                  <Stethoscope className="size-5 text-primary" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-[17px] font-bold leading-tight">咨询关节外科医生？</div>
                  <div className="mt-0.5 text-[15px] text-muted-foreground">
                    主任 / 主治 1v1 · 住院期间锁定主管医护
                  </div>
                </div>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
            <button
              className="relative flex flex-col items-center justify-center rounded-2xl bg-card px-3 ring-1 ring-black/[0.06] active:scale-[0.97]"
              aria-label="我的消息"
            >
              <Bell className="size-5 text-primary" />
              <span className="mt-0.5 text-[15px] font-bold">消息</span>
              <span className="absolute right-1.5 top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-rose-500 px-1 text-[13px] font-bold text-white">
                3
              </span>
            </button>
          </div>
        </section>

        {/* 住院版：入院单 + 当前阶段 */}
        {mode === "inpatient" && (
          <section className="mt-5 space-y-3 px-3">
            <div className="rounded-2xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <div className="text-[17px] font-bold">我的入院单</div>
              </div>
              <div className="mt-1 text-[17px] text-muted-foreground">{bedInfo}</div>
              {admissionUploaded ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-success/10 p-3 text-[17px] font-semibold text-success">
                  <Check className="size-5" /> 入院单已上传，护士已收到
                </div>
              ) : (
                <button
                  onClick={onUpload}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[17px] font-bold text-primary-foreground active:scale-[0.98]"
                >
                  <Upload className="size-5" /> 拍照上传入院单
                </button>
              )}
            </div>

            <button
              onClick={onOpenPath}
              className="flex w-full items-center justify-between rounded-2xl border bg-card p-4 text-left active:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="size-6" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-primary">
                    第 {stageIdx + 1}/{stageTotal} 步
                  </div>
                  <div className="text-[19px] font-bold leading-tight">{stageLabel}</div>
                  <div className="mt-0.5 text-[16px] text-muted-foreground">点击查看完整住院路径</div>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </button>
          </section>
        )}

        {/* 评估中心 */}
        <section className="mt-7 px-4">
          <SectionHeader title="评估中心" badge="多维评估 + 专病问卷" action="全部 12 项" />
          <button
            onClick={onOpenScale}
            className="block w-full rounded-2xl bg-card p-4 text-left ring-1 ring-black/5 transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[14px] font-bold text-destructive">
                    待完成 2
                  </span>
                  <span className="text-[15px] text-muted-foreground">本月 5/12 项</span>
                </div>
                <p className="truncate text-[17px] font-semibold leading-tight">
                  膝关节功能评估 · 术后必填
                </p>
                <p className="mt-0.5 text-[16px] text-muted-foreground">
                  7 题 · 约 2 分钟，完成后同步治疗师
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primary px-4 py-2 text-[17px] font-bold text-primary-foreground">
                去填写
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-[15px] text-muted-foreground">
              <span>更多生活问卷可选填，不强制</span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
                进入评估中心 <ChevronRight className="size-4" />
              </span>
            </div>
          </button>
        </section>

        {/* 健康百科（沿用原有模块） */}
        {eduSlot && <div className="mt-7">{eduSlot}</div>}

        {/* 骨安健康服务包 */}
        <section className="mt-7 px-4 pb-2">
          <SectionHeader title="骨安健康服务包" action="全部服务" />
          <div
            className="relative block overflow-hidden rounded-3xl p-5 text-white shadow-sm ring-1 ring-black/5"
            style={{ background: "var(--gradient-hero)" }}
          >
            <ShoppingBag className="absolute -bottom-6 -right-4 size-28 opacity-20" />
            <div className="flex items-center gap-2 text-[16px] opacity-90">
              <Sparkles className="size-4" /> 关节外科医生 & 康复治疗师联合甄选
            </div>
            <div className="mt-1 text-[21px] font-bold">骨关节全周期管理包</div>
            <div className="mt-1 text-[16px] opacity-85">康复训练 · 药食同源餐 · 院内外衔接</div>
            <div className="mt-3 flex items-center gap-3 text-[16px]">
              <span className="rounded-full bg-white/20 px-2.5 py-1">已为 8,326 位骨友服务</span>
              <span className="ml-auto inline-flex items-center gap-1 font-semibold">
                查看服务 <ChevronRight className="size-4" />
              </span>
            </div>
          </div>

          {/* 智能工具 */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { icon: ScanLine, label: "AI 拍照识别", desc: "关节 / 报告" },
              { icon: Watch, label: "智能设备", desc: "步态手环" },
              { icon: HeartPulse, label: "专科服务", desc: "预约随访" },
            ].map((t) => (
              <button
                key={t.label}
                onClick={() => onAskAI(`我想使用${t.label}`)}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 ring-1 ring-black/5 active:scale-[0.98]"
              >
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <t.icon className="size-6" />
                </div>
                <p className="text-[17px] font-semibold">{t.label}</p>
                <p className="text-[14px] text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      {qrOpen && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/45" onClick={() => setQrOpen(false)} />
          <div className="relative max-h-[80%] overflow-y-auto rounded-t-2xl bg-background p-5 shadow-2xl">
            <button
              onClick={() => setQrOpen(false)}
              aria-label="关闭"
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-muted/70"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-[19px] font-bold">加入健康管理服务群</h3>
            <p className="mt-1 text-[17px] text-muted-foreground">
              医生 + 康复治疗师 + 营养师在群内为您答疑
            </p>
            <div className="mx-auto mt-4 grid size-44 place-items-center rounded-2xl bg-card ring-1 ring-black/10">
              <QrCode className="size-28 text-primary" />
            </div>
            <p className="mt-3 text-center text-[16px] text-muted-foreground">
              长按二维码 · 使用微信扫码进群
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  badge,
  action,
}: {
  title: string;
  badge?: string;
  action?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-[19px] font-bold tracking-tight">{title}</h2>
        {badge && (
          <span className="rounded bg-primary/15 px-2 py-0.5 text-[14px] font-bold text-primary">
            {badge}
          </span>
        )}
      </div>
      {action && (
        <span className="inline-flex items-center gap-0.5 text-[16px] font-semibold text-muted-foreground">
          {action} <ChevronRight className="size-4" />
        </span>
      )}
    </div>
  );
}
