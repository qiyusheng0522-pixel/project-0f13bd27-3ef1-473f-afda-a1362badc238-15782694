import { useMemo, useState } from "react";
import {
  Home,
  CalendarCheck,
  Sparkles,
  BookOpen,
  User,
  Dumbbell,
  Pill,
  Stethoscope,
  ClipboardList,
  Check,
  Clock,
  ChevronRight,
  Send,
  BedDouble,
  ShieldCheck,
  FileSignature,
  Phone,
  MessageSquare,
  FileText,
  Bell,
  Type,
  HeartPulse,
  X,

} from "lucide-react";
import { PhoneShell, TabBar } from "@/components/PhoneShell";
import { cn } from "@/lib/utils";
import {
  useCaseFlow,
  getDemoPatient,
  STAGE_STEPS,
  stageIndex,
  toggleTodo,
  markEduRead,
  markMessageRead,
  DEMO_PATIENT_NAME,
} from "@/lib/case-flow";


/* ============ 分类定义 ============ */

type TodoCat = "康复动作" | "用药" | "护理" | "问卷" | "宣教";

const CAT_META: Record<TodoCat, { icon: React.ElementType; tint: string }> = {
  康复动作: { icon: Dumbbell, tint: "text-primary bg-primary/10" },
  用药: { icon: Pill, tint: "text-rose-600 bg-rose-500/10" },
  护理: { icon: Stethoscope, tint: "text-emerald-600 bg-emerald-500/10" },
  问卷: { icon: ClipboardList, tint: "text-amber-600 bg-amber-500/10" },
  宣教: { icon: BookOpen, tint: "text-sky-600 bg-sky-500/10" },
};

interface SimpleTodo {
  id: string;
  title: string;
  detail: string;
  time?: string;
  cat: TodoCat;
  done: boolean;
}

const FALLBACK_TODOS: SimpleTodo[] = [
  { id: "t1", title: "踝泵运动 3 组 × 20 次", detail: "平躺，脚背用力上勾再下压", time: "08:00", cat: "康复动作", done: true },
  { id: "t2", title: "直腿抬高 2 组 × 10 次", detail: "膝盖绷直，抬起 30° 保持 5 秒", time: "10:00", cat: "康复动作", done: false },
  { id: "t3", title: "屈膝训练 到 90°", detail: "床边坐位缓慢屈膝，不追求角度", time: "15:00", cat: "康复动作", done: false },
  { id: "t4", title: "利伐沙班 10mg 口服", detail: "抗凝药，饭后服用，勿漏服", time: "09:00", cat: "用药", done: true },
  { id: "t5", title: "塞来昆布 1 粒", detail: "疼痛明显时服用，24 小时不超 2 次", time: "20:00", cat: "用药", done: false },
  { id: "t6", title: "伤口观察与冰敷 20 分钟", detail: "查看有无渗液、红肿，冰袋隔毛巾", time: "14:00", cat: "护理", done: false },
  { id: "t7", title: "穿戴弹力袜 全天", detail: "预防下肢血栓，睡前可脱下", cat: "护理", done: true },
  { id: "t8", title: "膝关节功能问卷（7 题）", detail: "约 2 分钟，完成后同步治疗师", cat: "问卷", done: false },
  { id: "t9", title: "疼痛评分打卡", detail: "今日疼痛 0-10 分自评", time: "21:00", cat: "问卷", done: false },
];

const CAT_ORDER: TodoCat[] = ["康复动作", "用药", "护理", "问卷", "宣教"];

function mapCat(c: string): TodoCat {
  if (c === "运动") return "康复动作";
  if (c === "评估") return "问卷";
  if (c === "用药") return "用药";
  if (c === "宣教") return "宣教";
  return "护理";
}

/* ============ 科普内容 ============ */

interface EduItem {
  title: string;
  desc: string;
  tag: string;
  scope: "院内" | "居家";
  /** 内容形式 */
  media: "图文" | "视频";
  /** 时长 / 阅读时间 */
  meta: string;
  /** 关联骨关节问题 */
  topics: string[];
  /** 封面渐变 */
  cover: string;
}

/** 骨关节相关问题筛选 */
export const EDU_TOPICS = ["全部", "关节置换术后", "疼痛与消肿", "屈膝角度", "血栓预防", "用药安全", "行走与防跌倒", "饮食营养", "复查随访"];

const EDU_LIB: EduItem[] = [
  {
    title: "术后第 1 天：为什么要马上活动脚踝",
    desc: "踝泵运动可降低下肢血栓风险，护士示范标准动作",
    tag: "术后康复", scope: "院内", media: "视频", meta: "视频 2分18秒",
    topics: ["关节置换术后", "血栓预防"],
    cover: "linear-gradient(135deg,#2563eb,#38bdf8)",
  },
  {
    title: "膝关节置换术后正确翻身与坐起",
    desc: "避免患肢内旋，三步法图解演示",
    tag: "护理", scope: "院内", media: "视频", meta: "视频 3分05秒",
    topics: ["关节置换术后", "行走与防跌倒"],
    cover: "linear-gradient(135deg,#0ea5e9,#22d3ee)",
  },
  {
    title: "抗凝药怎么吃才安全",
    desc: "漏服、牙龈出血、瘀斑的处理方法",
    tag: "用药", scope: "院内", media: "图文", meta: "图文 3分钟",
    topics: ["用药安全", "血栓预防"],
    cover: "linear-gradient(135deg,#f43f5e,#fb923c)",
  },
  {
    title: "冰敷与消肿：时间和次数怎么定",
    desc: "每次 15-20 分钟，间隔 2 小时，配图说明",
    tag: "护理", scope: "院内", media: "图文", meta: "图文 2分钟",
    topics: ["疼痛与消肿"],
    cover: "linear-gradient(135deg,#06b6d4,#818cf8)",
  },
  {
    title: "屈膝角度怎么一步步练到 120°",
    desc: "0-60°、60-90°、90-120° 三阶段动作视频",
    tag: "术后康复", scope: "院内", media: "视频", meta: "视频 4分40秒",
    topics: ["屈膝角度", "关节置换术后"],
    cover: "linear-gradient(135deg,#4f46e5,#a855f7)",
  },
  {
    title: "居家康复训练怎么循序渐进",
    desc: "从被动屈膝到负重行走的 4 周计划",
    tag: "术后康复", scope: "居家", media: "视频", meta: "视频 5分12秒",
    topics: ["关节置换术后", "屈膝角度"],
    cover: "linear-gradient(135deg,#059669,#34d399)",
  },
  {
    title: "回家后怎么防跌倒",
    desc: "浴室防滑、夜灯、拐杖使用要点",
    tag: "安全", scope: "居家", media: "图文", meta: "图文 3分钟",
    topics: ["行走与防跌倒"],
    cover: "linear-gradient(135deg,#f59e0b,#fbbf24)",
  },
  {
    title: "骨关节营养：钙与蛋白怎么补",
    desc: "每日 1200mg 钙 + 优质蛋白配餐示例",
    tag: "饮食", scope: "居家", media: "图文", meta: "图文 4分钟",
    topics: ["饮食营养"],
    cover: "linear-gradient(135deg,#16a34a,#84cc16)",
  },
  {
    title: "药食同源：适合骨关节的 6 道家常菜",
    desc: "牛骨汤、黑豆排骨、三色时蔬等做法视频",
    tag: "饮食", scope: "居家", media: "视频", meta: "视频 6分30秒",
    topics: ["饮食营养"],
    cover: "linear-gradient(135deg,#ea580c,#fcd34d)",
  },
  {
    title: "复查节点与预警信号",
    desc: "出现红肿热痛、发热要立即联系医生",
    tag: "复查", scope: "居家", media: "图文", meta: "图文 2分钟",
    topics: ["复查随访", "疼痛与消肿"],
    cover: "linear-gradient(135deg,#7c3aed,#f472b6)",
  },
];

/* ============ 骨安健康服务包 ============ */

const SERVICE_PACKS: { title: string; desc: string; icon: React.ElementType; tint: string }[] = [
  { title: "康复方案", desc: "治疗师定制动作与角度", icon: Dumbbell, tint: "text-primary bg-primary/10" },
  { title: "营养 · 药食同源", desc: "配餐与菜品可更换", icon: Utensils, tint: "text-emerald-600 bg-emerald-500/10" },
  { title: "上门康复", desc: "居家一对一指导预约", icon: HeartHandshake, tint: "text-rose-600 bg-rose-500/10" },
  { title: "专家复诊", desc: "主任号源优先预约", icon: Stethoscope, tint: "text-sky-600 bg-sky-500/10" },
  { title: "随访关怀", desc: "术后 1/3/6 月随访", icon: Phone, tint: "text-amber-600 bg-amber-500/10" },
  { title: "宣教百科", desc: "图文视频科普库", icon: BookOpen, tint: "text-violet-600 bg-violet-500/10" },
];


/* ============ 主组件 ============ */

export function PatientWorkbench() {
  const [tab, setTab] = useState("home");
  const flow = useCaseFlow();
  const patient = getDemoPatient();

  const inpatient = flow.created && flow.stage !== "discharged" ? true : flow.stage === "discharged" ? false : true;
  const stageLabel = STAGE_STEPS[Math.max(stageIndex(flow.stage), 0)]?.label ?? "术后康复";

  const todos: SimpleTodo[] = useMemo(() => {
    if (flow.todos.length) {
      return flow.todos.map((t) => ({
        id: t.id,
        title: t.title,
        detail: t.detail,
        time: t.time,
        cat: mapCat(t.category),
        done: t.done,
      }));
    }
    return FALLBACK_TODOS;
  }, [flow.todos]);

  const [localDone, setLocalDone] = useState<Record<string, boolean>>({});
  const isDone = (t: SimpleTodo) => localDone[t.id] ?? t.done;
  const onToggle = (t: SimpleTodo) => {
    if (flow.todos.some((x) => x.id === t.id)) toggleTodo(t.id);
    else setLocalDone((s) => ({ ...s, [t.id]: !isDone(t) }));
  };

  const name = patient?.name ?? DEMO_PATIENT_NAME;
  const bed = patient?.bedNo ? `${patient.bedNo} 床` : "12 床";
  const days = useMemo(() => {
    if (!patient?.admissionDate) return 5;
    const d = new Date(patient.admissionDate);
    const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000) + 1;
    return Number.isFinite(diff) && diff > 0 ? diff : 1;
  }, [patient?.admissionDate]);

  const tabs = [
    { key: "home", label: "首页", icon: Home },
    { key: "schedule", label: "日程", icon: CalendarCheck },
    { key: "ai", label: "骨灵", icon: Sparkles },
    { key: "edu", label: "科普", icon: BookOpen },
    { key: "me", label: "我的", icon: User },
  ];

  return (
    <PhoneShell
      title="骨安 · 患者"
      subtitle={inpatient ? "住院中" : "居家康复"}
      bottom={<TabBar items={tabs} activeKey={tab} onChange={setTab} />}
    >
      {tab === "home" && (
        <HomeTab
          name={name}
          bed={bed}
          days={days}
          inpatient={inpatient}
          stageLabel={stageLabel}
          stageIdx={Math.max(stageIndex(flow.stage), 0)}
          todos={todos}
          isDone={isDone}
          onToggle={onToggle}
        />
      )}
      {tab === "schedule" && <ScheduleTab todos={todos} isDone={isDone} />}
      {tab === "ai" && <AiTab name={name} />}
      {tab === "edu" && <EduTab inpatient={inpatient} stageLabel={stageLabel} />}
      {tab === "me" && <MeTab name={name} bed={bed} inpatient={inpatient} days={days} />}
    </PhoneShell>
  );
}

/* ============ 首页 ============ */

function HomeTab({
  name,
  bed,
  days,
  inpatient,
  stageLabel,
  stageIdx,
  todos,
  isDone,
  onToggle,
}: {
  name: string;
  bed: string;
  days: number;
  inpatient: boolean;
  stageLabel: string;
  stageIdx: number;
  todos: SimpleTodo[];
  isDone: (t: SimpleTodo) => boolean;
  onToggle: (t: SimpleTodo) => void;
}) {
  const [pathOpen, setPathOpen] = useState(false);
  const remaining = todos.filter((t) => !isDone(t)).length;

  return (
    <div className="space-y-4 p-3 pb-6">
      {/* 状态卡 */}
      <section
        className="rounded-3xl p-5 text-white"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-[16px] font-bold ring-1 ring-white/30">
            {inpatient ? "住院中" : "居家康复"}
          </span>
          <span className="text-[16px] font-semibold text-white/90">{bed}</span>
        </div>
        <p className="mt-3 text-[24px] font-bold leading-snug">{name}，您好</p>
        <p className="mt-1 text-[18px] text-white/90">
          {inpatient ? `入院第 ${days} 天` : `出院后第 ${days} 天`} · 今日待办 {remaining} 项
        </p>

        <button
          onClick={() => setPathOpen(true)}
          className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white/15 px-4 py-3 text-left ring-1 ring-white/25 active:scale-[0.99]"
        >
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-white/85">当前阶段</div>
            <div className="mt-0.5 whitespace-nowrap text-[20px] font-bold">{stageLabel}</div>
          </div>
          <ChevronRight className="size-6 shrink-0" />
        </button>
      </section>

      {/* 分类待办 */}
      {CAT_ORDER.map((cat) => {
        const list = todos.filter((t) => t.cat === cat);
        if (!list.length) return null;
        const meta = CAT_META[cat];
        const Icon = meta.icon;
        const doneCount = list.filter(isDone).length;
        return (
          <section key={cat} className="overflow-hidden rounded-2xl border bg-card">
            <header className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className={cn("grid size-10 place-items-center rounded-xl", meta.tint)}>
                  <Icon className="size-5" />
                </span>
                <h3 className="text-[19px] font-bold">{cat}</h3>
              </div>
              <span className="text-[16px] font-semibold text-muted-foreground">
                {doneCount}/{list.length}
              </span>
            </header>
            <ul className="divide-y">
              {list.map((t) => {
                const done = isDone(t);
                return (
                  <li key={t.id} className="flex items-start gap-3 px-4 py-3.5">
                    <button
                      onClick={() => onToggle(t)}
                      aria-label={done ? "取消打卡" : "打卡"}
                      className={cn(
                        "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ring-2 active:scale-95",
                        done
                          ? "bg-success text-white ring-success"
                          : "bg-background text-transparent ring-border",
                      )}
                    >
                      <Check className="size-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[18px] font-bold leading-snug", done && "text-muted-foreground line-through")}>
                        {t.title}
                      </p>
                      <p className="mt-1 text-[16px] leading-snug text-muted-foreground">{t.detail}</p>
                      {t.time && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[15px] font-semibold text-primary">
                          <Clock className="size-4" /> {t.time}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {pathOpen && (
        <Sheet title="我的住院路径" onClose={() => setPathOpen(false)}>
          <ol className="space-y-2">
            {STAGE_STEPS.map((s, i) => {
              const state = i < stageIdx ? "done" : i === stageIdx ? "current" : "todo";
              return (
                <li
                  key={s.key}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3.5",
                    state === "current" && "border-primary bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full text-[16px] font-bold",
                      state === "done" && "bg-success/15 text-success",
                      state === "current" && "bg-primary text-primary-foreground",
                      state === "todo" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {state === "done" ? <Check className="size-5" /> : i + 1}
                  </span>
                  <span className="text-[18px] font-bold">{s.label}</span>
                  {state === "current" && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-1 text-[15px] font-bold text-primary">
                      当前
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </Sheet>
      )}
    </div>
  );
}

/* ============ 日程（统计分析） ============ */

function ScheduleTab({ todos, isDone }: { todos: SimpleTodo[]; isDone: (t: SimpleTodo) => boolean }) {
  const total = todos.length;
  const done = todos.filter(isDone).length;
  const rate = total ? Math.round((done / total) * 100) : 0;

  const week = [
    { d: "周一", rate: 100 },
    { d: "周二", rate: 88 },
    { d: "周三", rate: 75 },
    { d: "周四", rate: 92 },
    { d: "周五", rate: 80 },
    { d: "周六", rate: 100 },
    { d: "今日", rate },
  ];

  return (
    <div className="space-y-4 p-3 pb-6">
      <section className="rounded-3xl border bg-card p-5">
        <h2 className="text-[20px] font-bold">今日完成情况</h2>
        <div className="mt-4 flex items-center gap-5">
          <div
            className="grid size-28 shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--primary) ${rate * 3.6}deg, var(--muted) 0deg)`,
            }}
          >
            <div className="grid size-20 place-items-center rounded-full bg-card">
              <span className="text-[24px] font-bold text-primary">{rate}%</span>
            </div>
          </div>
          <div className="space-y-1.5 text-[18px]">
            <p className="font-bold">
              已完成 <span className="text-success">{done}</span> / {total} 项
            </p>
            <p className="text-muted-foreground">未完成 {total - done} 项</p>
            <p className="text-muted-foreground">连续打卡 6 天</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border bg-card">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-[20px] font-bold">今日时间安排</h2>
          <span className="text-[16px] font-semibold text-muted-foreground">按时间顺序</span>
        </header>
        <ul className="divide-y">
          {[...todos]
            .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"))
            .map((t) => {
              const d = isDone(t);
              const Icon = CAT_META[t.cat].icon;
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="w-[62px] shrink-0 text-[17px] font-bold text-primary">{t.time ?? "全天"}</span>
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", CAT_META[t.cat].tint)}>
                    <Icon className="size-5" />
                  </span>
                  <p className={cn("min-w-0 flex-1 text-[18px] font-semibold leading-snug", d && "text-muted-foreground line-through")}>
                    {t.title}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[15px] font-bold",
                      d ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {d ? "已完成" : "待完成"}
                  </span>
                </li>
              );
            })}
        </ul>
      </section>



      <section className="rounded-3xl border bg-card p-5">
        <h2 className="text-[20px] font-bold">本周打卡趋势</h2>
        <div className="mt-4 flex h-40 items-end justify-between gap-2">
          {week.map((w) => (
            <div key={w.d} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[15px] font-bold text-primary">{w.rate}%</span>
              <div className="flex h-24 w-full items-end rounded-lg bg-muted">
                <div
                  className="w-full rounded-lg"
                  style={{ height: `${w.rate}%`, background: "var(--gradient-primary)" }}
                />
              </div>
              <span className="text-[15px] text-muted-foreground">{w.d}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-5">
        <h2 className="text-[20px] font-bold">分类完成率</h2>
        <ul className="mt-3 space-y-3">
          {CAT_ORDER.map((cat) => {
            const list = todos.filter((t) => t.cat === cat);
            if (!list.length) return null;
            const d = list.filter(isDone).length;
            const pct = Math.round((d / list.length) * 100);
            const Icon = CAT_META[cat].icon;
            return (
              <li key={cat}>
                <div className="mb-1.5 flex items-center justify-between text-[17px] font-semibold">
                  <span className="flex items-center gap-2">
                    <Icon className="size-5 text-primary" /> {cat}
                  </span>
                  <span className="text-muted-foreground">
                    {d}/{list.length}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ============ 骨灵（AI 会话） ============ */

const AI_CHIPS = ["膝盖肿了怎么办", "今天能下地走路吗", "康复动作做几组", "抗凝药漏服了"];

function AiTab({ name }: { name: string }) {
  const [msgs, setMsgs] = useState<{ role: "ai" | "me"; text: string }[]>([]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setMsgs((m) => [...m, { role: "me", text: q }]);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          role: "ai",
          text: "我已记录您的情况。术后早期肿胀属常见现象：请抬高患肢 20-30cm、每次冰敷 15-20 分钟，并按时完成踝泵运动。若出现明显红肿热痛或发热，请立即联系您的主管医生。",
        },
      ]);
    }, 600);
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {msgs.length === 0 && (
          <div className="space-y-4">
            <div
              className="rounded-3xl p-5 text-white"
              style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}
            >
              <div className="flex items-center gap-2 text-[16px] font-semibold text-white/90">
                <Sparkles className="size-5" /> 骨灵 · AI 主治医生
              </div>
              <p className="mt-2 text-[22px] font-bold leading-snug">{name}，我在这里</p>
              <p className="mt-1 text-[17px] text-white/90">康复、用药、饮食、复查都可以问我</p>
            </div>
            <div className="space-y-2">
              {AI_CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  className="flex w-full items-center justify-between rounded-2xl border bg-card px-4 py-3.5 text-left text-[18px] font-semibold active:scale-[0.99]"
                >
                  {c}
                  <ChevronRight className="size-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "me" ? "justify-end" : "justify-start")}>
            <p
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-[17px] leading-relaxed",
                m.role === "me" ? "bg-primary text-primary-foreground" : "border bg-card",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t bg-card p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="说说您的问题…"
          className="h-12 min-w-0 flex-1 rounded-full border bg-background px-4 text-[17px] outline-none focus:border-primary"
        />
        <button
          onClick={() => send(input)}
          aria-label="发送"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground active:scale-95"
        >
          <Send className="size-5" />
        </button>
      </div>
    </div>
  );
}

/* ============ 科普 ============ */

function EduTab({ inpatient, stageLabel }: { inpatient: boolean; stageLabel: string }) {
  const flow = useCaseFlow();
  const scope: "院内" | "居家" = inpatient ? "院内" : "居家";
  const list = EDU_LIB.filter((e) => e.scope === scope);
  const other = EDU_LIB.filter((e) => e.scope !== scope);
  const [open, setOpen] = useState<{ title: string; desc: string; tag: string } | null>(null);

  return (
    <div className="space-y-4 p-3 pb-6">
      <div className="rounded-2xl bg-primary/10 p-4">
        <p className="text-[18px] font-bold text-primary">
          当前状态：{scope} · {stageLabel}
        </p>
        <p className="mt-1 text-[16px] text-muted-foreground">以下宣教按您当前状态推荐，建议逐条阅读</p>
      </div>

      {flow.eduPushes.length > 0 && (
        <EduGroup title="医护为您推送">
          {flow.eduPushes.map((e) => (
            <EduRow
              key={e.id}
              title={e.title}
              desc={e.desc}
              tag={e.tag}
              unread={!e.read}
              onOpen={() => {
                markEduRead(e.id);
                setOpen(e);
              }}
            />
          ))}
        </EduGroup>
      )}

      <EduGroup title={`${scope}必读宣教`}>
        {list.map((e) => (
          <EduRow key={e.title} title={e.title} desc={e.desc} tag={e.tag} onOpen={() => setOpen(e)} />
        ))}
      </EduGroup>

      <EduGroup title={scope === "院内" ? "出院后可提前了解" : "住院期间回顾"}>
        {other.map((e) => (
          <EduRow key={e.title} title={e.title} desc={e.desc} tag={e.tag} onOpen={() => setOpen(e)} />
        ))}
      </EduGroup>

      {open && (
        <Sheet title={open.title} onClose={() => setOpen(null)}>
          <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-[16px] font-bold text-primary">
            {open.tag}
          </span>
          <p className="mt-3 text-[18px] font-semibold leading-relaxed">{open.desc}</p>
          <ul className="mt-4 space-y-3 text-[17px] leading-relaxed text-muted-foreground">
            <li>1. 训练前先热身，动作缓慢，不追求角度和次数。</li>
            <li>2. 每次训练后如疼痛评分超过 4 分，请减少组数并告知治疗师。</li>
            <li>3. 出现伤口红肿热痛、发热、小腿肿胀，请立即联系医护。</li>
            <li>4. 如有疑问可在【骨灵】中随时提问，或联系病区护士站。</li>
          </ul>
          <button
            onClick={() => setOpen(null)}
            className="mt-5 w-full rounded-2xl py-3.5 text-[18px] font-bold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            我已阅读
          </button>
        </Sheet>
      )}
    </div>

  );
}

function EduGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <header className="border-b px-4 py-3">
        <h3 className="text-[19px] font-bold">{title}</h3>
      </header>
      <ul className="divide-y">{children}</ul>
    </section>
  );
}

function EduRow({
  title,
  desc,
  tag,
  unread,
  onOpen,
}: {
  title: string;
  desc: string;
  tag: string;
  unread?: boolean;
  onOpen?: () => void;
}) {
  return (
    <li>
      <button onClick={onOpen} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-muted/50">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-600">
          <BookOpen className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-bold leading-snug">{title}</p>
          <p className="mt-1 text-[16px] leading-snug text-muted-foreground">{desc}</p>
          <span className="mt-1.5 inline-block rounded-md bg-muted px-2 py-0.5 text-[15px] font-semibold text-muted-foreground">
            {tag}
          </span>
        </div>
        {unread && <span className="size-3 shrink-0 rounded-full bg-rose-500" />}
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </button>
    </li>
  );
}

/* ============ 我的 ============ */

const CONSENTS = [
  { title: "住院知情同意书", status: "已签署" },
  { title: "手术及麻醉知情同意书", status: "已签署" },
  { title: "康复训练风险告知书", status: "已签署" },
  { title: "个人健康信息使用授权", status: "待确认" },
];

function MeTab({ name, bed, inpatient, days }: { name: string; bed: string; inpatient: boolean; days: number }) {
  const patient = getDemoPatient();
  const flow = useCaseFlow();
  const [openConsent, setOpenConsent] = useState<string | null>(null);
  const [panel, setPanel] = useState<"messages" | "record" | "settings" | null>(null);
  const [bigFont, setBigFont] = useState(true);
  const [remind, setRemind] = useState(true);
  const unread = flow.messages.filter((m) => !m.read).length;


  const rows = [
    { k: "姓名", v: name },
    { k: "年龄 / 性别", v: `${patient?.age ?? 68} 岁 · ${patient?.gender ?? "男"}` },
    { k: "手机号", v: patient?.phone ?? "138****6021" },
    { k: "诊断", v: patient?.diagnosis ?? "右膝骨关节炎（重度）" },
    { k: "手术", v: patient?.surgeryName ?? "右膝人工关节置换术" },
    { k: "主管医生", v: patient?.responsibleDoctor ?? "秦江辉" },
    { k: "康复治疗师", v: patient?.responsibleTherapist ?? "王渭君" },
  ];

  return (
    <div className="space-y-4 p-3 pb-6">
      <section
        className="rounded-3xl p-5 text-white"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-16 place-items-center rounded-2xl bg-white/20 text-[24px] font-bold ring-1 ring-white/30">
            {name.slice(0, 1)}
          </span>
          <div>
            <p className="text-[22px] font-bold">{name}</p>
            <p className="mt-1 text-[17px] text-white/90">
              {inpatient ? `住院中 · ${bed} · 第 ${days} 天` : `居家康复 · 第 ${days} 天`}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <BedDouble className="size-5 text-primary" />
          <h3 className="text-[19px] font-bold">基本情况</h3>
        </header>
        <ul className="divide-y">
          {rows.map((r) => (
            <li key={r.k} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-[17px] text-muted-foreground">{r.k}</span>
              <span className="text-right text-[18px] font-semibold">{r.v}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <HeartPulse className="size-5 text-primary" />
          <h3 className="text-[19px] font-bold">更多服务</h3>
        </header>
        <ul className="divide-y">
          <MeRow icon={MessageSquare} label="消息中心" badge={unread ? `${unread} 条未读` : undefined} onClick={() => setPanel("messages")} />
          <MeRow icon={FileText} label={inpatient ? "住院记录" : "出院小结"} onClick={() => setPanel("record")} />
          <MeRow icon={Bell} label="提醒与字体设置" onClick={() => setPanel("settings")} />
        </ul>
      </section>



      <section className="overflow-hidden rounded-2xl border bg-card">
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <FileSignature className="size-5 text-primary" />
          <h3 className="text-[19px] font-bold">知情同意</h3>
        </header>
        <ul className="divide-y">
          {CONSENTS.map((c) => (
            <li key={c.title}>
              <button
                onClick={() => setOpenConsent(c.title)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-muted/50"
              >
                <ShieldCheck className="size-5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 text-[18px] font-semibold leading-snug">{c.title}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[15px] font-bold",
                    c.status === "已签署" ? "bg-success/10 text-success" : "bg-amber-500/10 text-amber-600",
                  )}
                >
                  {c.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <button className="flex w-full items-center justify-center gap-2 rounded-2xl border bg-card py-4 text-[18px] font-bold text-primary active:bg-muted/50">
        <Phone className="size-5" /> 联系病区护士站
      </button>

      {openConsent && (
        <Sheet title={openConsent} onClose={() => setOpenConsent(null)}>
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            本知情同意书已由患者本人或家属签署确认，内容包含诊疗方案、可能风险、替代方案及费用说明。如需纸质版本，请联系病区护士站打印。
          </p>
          <div className="mt-4 rounded-2xl bg-muted/50 p-4 text-[17px]">
            <p className="font-bold">签署人：{name}（本人）</p>
            <p className="mt-1 text-muted-foreground">见证医生：秦江辉 · 骨科关节外科</p>
          </div>
        </Sheet>
      )}

      {panel === "messages" && (
        <Sheet title="消息中心" onClose={() => setPanel(null)}>
          {flow.messages.length === 0 ? (
            <p className="py-6 text-center text-[18px] text-muted-foreground">暂无新消息</p>
          ) : (
            <ul className="space-y-3">
              {flow.messages.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => markMessageRead(m.id)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left",
                      !m.read && "border-primary bg-primary/5",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 flex-1 text-[18px] font-bold leading-snug">{m.title}</p>
                      {!m.read && <span className="size-3 shrink-0 rounded-full bg-rose-500" />}
                    </div>
                    <p className="mt-1.5 text-[17px] leading-snug text-muted-foreground">{m.body}</p>
                    <p className="mt-1.5 text-[15px] text-muted-foreground">{m.at}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      )}

      {panel === "record" && (
        <Sheet title={inpatient ? "住院记录" : "出院小结"} onClose={() => setPanel(null)}>
          <div className="space-y-3 text-[17px]">
            <div className="rounded-2xl bg-muted/50 p-4">
              <p className="text-[18px] font-bold">
                {name} · {bed} · {inpatient ? `入院第 ${days} 天` : `出院后第 ${days} 天`}
              </p>
              <p className="mt-1 text-muted-foreground">
                入院日期：{patient?.admissionDate ?? "—"} · 手术日期：{patient?.surgeryDate ?? "—"}
              </p>
            </div>
            <ul className="space-y-2.5 text-muted-foreground">
              <li>诊断：{patient?.diagnosis ?? "右膝骨关节炎（重度）"}</li>
              <li>手术：{patient?.surgeryName ?? "右膝人工关节置换术"}</li>
              <li>康复方案：{flow.planApproved ? flow.planName : "待治疗师审核"}</li>
              <li>康复评估记录：{flow.dailyRehab.length} 次</li>
              <li>护理记录：{flow.nurseRecords.length} 条</li>
              {flow.dischargeNote && <li>出院意见：{flow.dischargeNote}</li>}
            </ul>
          </div>
        </Sheet>
      )}

      {panel === "settings" && (
        <Sheet title="提醒与字体设置" onClose={() => setPanel(null)}>
          <ul className="space-y-3">
            <SettingRow icon={Bell} label="每日待办提醒" desc="按任务时间语音＋弹窗提醒" on={remind} onToggle={() => setRemind((v) => !v)} />
            <SettingRow icon={Type} label="大字模式" desc="全局字体放大，适合老年人阅读" on={bigFont} onToggle={() => setBigFont((v) => !v)} />
          </ul>
        </Sheet>
      )}
    </div>
  );
}

function MeRow({
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-muted/50">
        <Icon className="size-5 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 text-[18px] font-semibold">{label}</span>
        {badge && (
          <span className="shrink-0 rounded-full bg-rose-500/10 px-2.5 py-1 text-[15px] font-bold text-rose-600">
            {badge}
          </span>
        )}
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </button>
    </li>
  );
}

function SettingRow({
  icon: Icon,
  label,
  desc,
  on,
  onToggle,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border p-4">
      <Icon className="size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-[18px] font-bold">{label}</p>
        <p className="mt-0.5 text-[16px] text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        aria-label={label}
        className={cn("h-8 w-14 shrink-0 rounded-full p-1 transition-colors", on ? "bg-primary" : "bg-muted")}
      >
        <span className={cn("block size-6 rounded-full bg-card transition-transform", on && "translate-x-6")} />
      </button>
    </li>
  );
}


/* ============ 通用弹层 ============ */

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative max-h-[80%] overflow-y-auto rounded-t-3xl bg-background p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[21px] font-bold">{title}</h3>
          <button onClick={onClose} aria-label="关闭" className="grid size-10 place-items-center rounded-full bg-muted">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
