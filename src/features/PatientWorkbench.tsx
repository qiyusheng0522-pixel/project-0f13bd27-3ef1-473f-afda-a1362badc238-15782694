import { useMemo, useRef, useState } from "react";
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
  Search,
  Play,
  Camera,
  Utensils,
  HeartHandshake,
  ImagePlus,
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

/* ============ 住院流程（患者视角 6 步） ============ */

const PATH_STEPS: { no: string; line1: string; line2: string; desc: string }[] = [
  { no: "01", line1: "住院", line2: "准备", desc: "证件与用品准备、术前检查预约" },
  { no: "02", line1: "住院", line2: "办理", desc: "入院登记、床位分配、护理评估" },
  { no: "03", line1: "手术", line2: "宣教", desc: "麻醉与手术配合、禁食水要点" },
  { no: "04", line1: "术后", line2: "须知", desc: "体位摆放、疼痛管理、踝泵练习" },
  { no: "05", line1: "出院", line2: "引导", desc: "出院评估、用药与复查安排" },
  { no: "06", line1: "院后", line2: "康复", desc: "居家康复计划与随访提醒" },
];

/** 后台 7 个环节 → 患者 6 步流程 */
const PATH_MAP = [0, 1, 2, 2, 3, 3, 5];
const toPathIdx = (i: number) => PATH_MAP[Math.max(0, Math.min(i, PATH_MAP.length - 1))] ?? 0;

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

/* 骨关节服务包 —— 横幅样式入口 */
function ServicePackBanner({
  activated,
  onOpenAll,
  onPick,
}: {
  activated: boolean;
  onOpenAll: () => void;
  onPick: (s: (typeof SERVICE_PACKS)[number]) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="whitespace-nowrap font-display text-[21px] font-bold">骨关节服务包</h3>
        <span
          className={cn(
            "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[14px] font-bold",
            activated ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
          )}
        >
          {activated ? "医生甄选" : "未开通"}
        </span>
        <button onClick={onOpenAll} className="ml-auto flex shrink-0 items-center whitespace-nowrap text-[15px] font-bold text-primary">
          全部服务 <ChevronRight className="size-4" />
        </button>
      </div>

      <button
        onClick={onOpenAll}
        className="relative w-full overflow-hidden rounded-[26px] p-6 text-left active:scale-[0.99]"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}
      >
        <span className="pointer-events-none absolute -bottom-6 -right-6 size-28 rounded-full bg-white/10" />
        <span className="pointer-events-none absolute right-8 top-3 size-10 rounded-full bg-white/5" />
        <span className="relative block">
          <span className="block font-display text-[22px] font-bold leading-snug text-primary-foreground">
            骨关节康复全周期服务包
          </span>
          <span className="mt-1.5 block whitespace-nowrap text-[15px] text-primary-foreground/85">
            专家定制 · 周期跟踪 · 效果评估
          </span>
          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-card px-4 py-2 text-[15px] font-bold text-primary">
            {activated ? "查看服务" : "了解详情"} <ChevronRight className="size-4" />
          </span>
        </span>
      </button>

    </section>
  );
}


function ServicePackAllSheet({
  activated,
  onClose,
  onPick,
}: {
  activated: boolean;
  onClose: () => void;
  onPick: (s: (typeof SERVICE_PACKS)[number]) => void;
}) {
  return (
    <Sheet title="骨关节服务包 · 全部服务" onClose={onClose}>
      <p className="text-[17px] leading-relaxed text-muted-foreground">
        {activated ? "以下服务已为您开通，可直接预约使用。" : "建档后即可预约以下服务。"}
      </p>
      <div className="mt-4 space-y-2.5">
        {SERVICE_PACKS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              onClick={() => onPick(s)}
              className="flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left active:bg-muted/50"
            >
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", s.tint)}>
                <Icon className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-[18px] font-bold">{s.title}</span>
                <span className="mt-0.5 block text-[16px] text-muted-foreground">{s.desc}</span>
              </span>
              <ChevronRight className="ml-auto size-5 shrink-0 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

const SCALE_ITEMS = [
  "静息疼痛评分（0-10）",
  "活动时疼痛评分（0-10）",
  "膝关节主动屈曲角度",
  "膝关节伸直受限角度",
  "夜间睡眠受影响程度",
  "步行距离（米）",
  "上下楼梯是否需要扶手",
  "日常生活自理程度",
];

function ScaleSheet({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  return (
    <Sheet title="专科评估量表" onClose={onClose}>
      <p className="text-[17px] leading-relaxed text-muted-foreground">共 8 项，约 3 分钟，提交后由治疗师生成康复方案。</p>
      <ol className="mt-4 space-y-2.5">
        {SCALE_ITEMS.map((q, i) => (
          <li key={q} className="rounded-2xl border p-3.5">
            <p className="text-[18px] font-bold leading-snug">
              {i + 1}. {q}
            </p>
            <input
              className="mt-2 w-full rounded-xl border bg-background px-3 py-2.5 text-[17px]"
              placeholder="请填写"
            />
          </li>
        ))}
      </ol>
      <button
        onClick={onSubmit}
        className="mt-5 w-full rounded-2xl py-3.5 text-[18px] font-bold text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        提交量表
      </button>
    </Sheet>
  );
}




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

  const [view, setView] = useState<"guest" | "member">("guest");
  const guest = view === "guest";

  return (
    <PhoneShell
      title="骨安 · 患者"
      subtitle={guest ? "新用户 · 未建档" : inpatient ? "住院中" : "居家康复"}
      bottom={<TabBar items={tabs} activeKey={tab} onChange={setTab} />}
    >
      {/* 演示视角切换：新用户（未建档） / 已建档患者 */}
      <div className="sticky top-0 z-20 bg-card/85 px-3 py-2.5 backdrop-blur-xl">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
          {([
            { key: "guest", label: "新用户 · 未建档" },
            { key: "member", label: "已建档患者" },
          ] as const).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                "whitespace-nowrap rounded-xl py-2 text-[15px] font-bold transition-all active:scale-[0.98]",
                view === v.key ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>


      {tab === "home" &&
        (guest ? (
          <GuestHomeTab onOpenEdu={() => setTab("edu")} onDone={() => setView("member")} />
        ) : (
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
            hasArchive
            onOpenEdu={() => setTab("edu")}
          />
        ))}
      {tab === "schedule" &&
        (guest ? <GuestLock title="暂无日程统计" desc="建档并生成康复方案后，这里会展示您的每日打卡完成情况与趋势。" onGo={() => setTab("home")} /> : <ScheduleTab todos={todos} isDone={isDone} />)}
      {tab === "ai" && <AiTab name={name} />}
      {tab === "edu" && (
        <EduTab
          inpatient={!guest && inpatient}
          diagnosis={patient?.diagnosis ?? "膝关节置换术后"}
          stageLabel={stageLabel}
        />
      )}
      {tab === "me" &&
        (guest ? <GuestLock title="还未建立健康档案" desc="拍照上传入院单 / 诊断证明，医生确认后可查看个人信息、住院记录与知情同意。" onGo={() => setTab("home")} /> : <MeTab name={name} bed={bed} inpatient={inpatient} days={days} />)}
    </PhoneShell>
  );
}

/* ============ 新用户（未建档）视角 ============ */

function GuestLock({ title, desc, onGo }: { title: string; desc: string; onGo: () => void }) {
  return (
    <div className="p-3 pb-6">
      <section className="rounded-3xl border-2 border-dashed p-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-muted text-muted-foreground">
          <Camera className="size-8" />
        </span>
        <h2 className="mt-4 text-[20px] font-bold">{title}</h2>
        <p className="mt-2 text-[17px] leading-relaxed text-muted-foreground">{desc}</p>
        <button
          onClick={onGo}
          className="mt-5 w-full rounded-2xl py-3.5 text-[18px] font-bold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          去建档
        </button>
      </section>
    </div>
  );
}

const GUEST_STEPS = [
  { n: 1, title: "拍照上传档案", desc: "入院单 / 诊断证明 / 检查报告" },
  { n: 2, title: "填写评估量表", desc: "疼痛、活动度等 8 项，约 3 分钟" },
  { n: 3, title: "查看康复方案", desc: "医生确认后生成每日打卡待办" },
];

function GuestHomeTab({ onOpenEdu, onDone }: { onOpenEdu: () => void; onDone: () => void }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [scaleOpen, setScaleOpen] = useState(false);
  const [scaleDone, setScaleDone] = useState(false);
  const [allOpen, setAllOpen] = useState(false);


  return (
    <div className="pb-8">
      {/* Hero：白底 + 大字标题 */}
      <header className="bg-card px-6 pb-7 pt-7">
        <h1 className="font-display text-[34px] font-bold leading-none tracking-tight text-primary">你好，</h1>
        <p className="mt-2 text-[19px] font-medium text-muted-foreground">欢迎开始康复旅程</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-[15px] font-bold text-primary ring-1 ring-primary/10">
          <span className="size-2 animate-pulse rounded-full bg-warning" />
          康复状态：{photo ? "资料核对中" : "待建档"}
        </div>
      </header>

      <div className="space-y-5 px-5 pt-5">
        {/* 建档入口 */}
        {!photo ? (
          <label
            className="flex items-center justify-between rounded-3xl bg-primary p-5 active:scale-[0.99]"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <span className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/20 text-primary-foreground">
                <Camera className="size-6" />
              </span>
              <span className="text-primary-foreground">
                <span className="block whitespace-nowrap text-[19px] font-bold">拍照建档</span>
                <span className="mt-0.5 block text-[15px] text-primary-foreground/80">上传入院单 · 智能录入</span>
              </span>
            </span>
            <ChevronRight className="size-6 text-primary-foreground/70" />
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
        ) : (
          <section className="rounded-3xl border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-3">
              <img src={photo} alt="入院单照片" className="size-16 rounded-2xl object-cover" />
              <div className="min-w-0">
                <p className="text-[18px] font-bold text-success">入院单已上传</p>
                <p className="mt-0.5 text-[15px] text-muted-foreground">医护正在核对，建档完成后消息通知您</p>
              </div>
            </div>
            <button
              onClick={onDone}
              className="mt-3 w-full rounded-2xl bg-primary py-3.5 text-[18px] font-bold text-primary-foreground active:scale-[0.98]"
            >
              查看已建档患者视角
            </button>
          </section>
        )}

        {/* 三步时间线 */}
        <section>
          <h2 className="font-display text-[21px] font-bold">三步开始康复</h2>
          <div className="mt-5 space-y-5">
            {GUEST_STEPS.map((s, idx) => {
              const done = s.n === 1 ? !!photo : s.n === 2 ? scaleDone : false;
              const active = s.n === 1 ? !photo : s.n === 2 ? !!photo && !scaleDone : !!photo && scaleDone;
              const last = idx === GUEST_STEPS.length - 1;
              return (
                <div key={s.n} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 bg-card text-[17px] font-bold",
                        done
                          ? "border-success text-success"
                          : active
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="size-5" /> : s.n}
                    </span>
                    {!last && <span className="-mb-5 mt-2 w-0.5 flex-1 bg-border" />}
                  </div>

                  <div
                    className={cn(
                      "flex-1 rounded-[26px] border bg-card p-5",
                      !done && !active && "opacity-60",
                    )}
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[19px] font-bold leading-snug">{s.title}</h3>
                        <p className="mt-1 text-[15px] leading-snug text-muted-foreground">{s.desc}</p>
                      </div>
                      {done && (
                        <span className="ml-auto shrink-0 whitespace-nowrap rounded-full bg-success/10 px-2.5 py-1 text-[14px] font-bold text-success">
                          已完成
                        </span>
                      )}
                    </div>

                    {s.n === 1 && (
                      <label
                        className={cn(
                          "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[18px] font-bold active:scale-[0.98]",
                          photo ? "border-2 text-foreground" : "bg-primary text-primary-foreground",
                        )}
                      >
                        <Camera className="size-5" /> {photo ? "重新拍照上传" : "拍照上传入院单"}
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
                    )}

                    {s.n === 2 && (
                      <button
                        onClick={() => setScaleOpen(true)}
                        className={cn(
                          "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[18px] font-bold active:scale-[0.98]",
                          scaleDone ? "border-2 text-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        <ClipboardList className="size-5" /> {scaleDone ? "查看/修改量表" : "填写专科量表"}
                      </button>
                    )}

                    {s.n === 3 && (
                      <button
                        onClick={onDone}
                        className={cn(
                          "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[18px] font-bold active:scale-[0.98]",
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        <CalendarCheck className="size-5" /> 查看今日待办清单
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[26px] border-2 border-dashed bg-muted/30 px-6 py-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-card text-muted-foreground">
            <CalendarCheck className="size-6" />
          </span>
          <p className="mt-3 text-[18px] font-bold text-muted-foreground">今日待办暂未生成</p>
          <p className="mt-1 text-[15px] leading-snug text-muted-foreground/80">完成建档与量表后自动出现康复动作、用药、护理与问卷</p>
        </section>


      <ServicePackBanner activated={false} onOpenAll={() => setAllOpen(true)} onPick={(s) => (s.title === "宣教百科" ? onOpenEdu() : setAllOpen(true))} />

      {allOpen && (
        <ServicePackAllSheet
          activated={false}
          onClose={() => setAllOpen(false)}
          onPick={(s) => {
            setAllOpen(false);
            if (s.title === "宣教百科") onOpenEdu();
          }}
        />
      )}

      {scaleOpen && (
        <ScaleSheet
          onClose={() => setScaleOpen(false)}
          onSubmit={() => {
            setScaleDone(true);
            setScaleOpen(false);
          }}
        />
      )}
      </div>
    </div>

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
  hasArchive,
  onOpenEdu,
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
  hasArchive: boolean;
  onOpenEdu: () => void;
}) {
  const [pathOpen, setPathOpen] = useState(false);
  const [archivePhoto, setArchivePhoto] = useState<string | null>(null);
  const [pack, setPack] = useState<(typeof SERVICE_PACKS)[number] | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const todoRef = useRef<HTMLDivElement>(null);


  const remaining = todos.filter((t) => !isDone(t)).length;
  const archived = hasArchive || !!archivePhoto;


  return (
    <div className="pb-8">
      {/* Hero：白底 + 大字状态 */}
      <header className="bg-card px-6 pb-7 pt-7">
        <h1 className="font-display text-[34px] font-bold leading-none tracking-tight text-primary">{name}，您好</h1>
        <p className="mt-2 text-[19px] font-medium text-muted-foreground">
          {inpatient ? `入院第 ${days} 天 · ${bed}` : `出院后第 ${days} 天 · 居家康复`}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-[15px] font-bold text-primary ring-1 ring-primary/10">
            <span className="size-2 animate-pulse rounded-full bg-success" />
            {inpatient ? "住院中" : "居家康复"}
          </span>
          <button
            onClick={() => todoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-4 py-2 text-[15px] font-bold text-primary ring-1 ring-primary/15 active:scale-[0.98]"
          >
            今日待办 {remaining} 项 <ChevronRight className="size-4" />
          </button>

        </div>
      </header>

      <div className="space-y-5 px-5 pt-5">
        {/* 未建档：拍照建档提醒 */}
        {!archived && (
          <section className="rounded-3xl border-2 border-warning bg-warning/10 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-warning/25 text-warning-foreground">
                <Camera className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="whitespace-nowrap text-[19px] font-bold text-warning-foreground">您还没有建立健康档案</p>
                <p className="mt-1 text-[15px] leading-snug text-warning-foreground/80">
                  请拍照上传「入院单 / 诊断证明」，医生确认后即可查看康复方案与每日待办。
                </p>
              </div>
            </div>
            <label className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[18px] font-bold text-primary-foreground active:scale-[0.98]">
              <Camera className="size-6" /> 立即拍照建档
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setArchivePhoto(URL.createObjectURL(f));
                }}
              />
            </label>
            <label className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-warning py-3 text-[17px] font-bold text-warning-foreground">
              <ImagePlus className="size-5" /> 从相册选择照片
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setArchivePhoto(URL.createObjectURL(f));
                }}
              />
            </label>
          </section>
        )}
        {!hasArchive && archivePhoto && (
          <section className="flex items-center gap-3 rounded-3xl border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
            <img src={archivePhoto} alt="入院单照片" className="size-16 rounded-2xl object-cover" />
            <div className="min-w-0">
              <p className="text-[18px] font-bold text-success">入院单已上传</p>
              <p className="mt-0.5 text-[15px] text-muted-foreground">医护正在核对，建档完成后将消息通知您</p>
            </div>
          </section>
        )}

        {/* 当前阶段 + 住院流程轨道 */}
        <button
          onClick={() => setPathOpen(true)}
          className="w-full rounded-3xl bg-primary p-5 text-left active:scale-[0.99]"
          style={{ boxShadow: "var(--shadow-elevated)" }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-primary-foreground/80">当前阶段</span>
              <span className="mt-0.5 block whitespace-nowrap font-display text-[22px] font-bold text-primary-foreground">
                {PATH_STEPS[toPathIdx(stageIdx)]!.no} {PATH_STEPS[toPathIdx(stageIdx)]!.line1}
                {PATH_STEPS[toPathIdx(stageIdx)]!.line2}
              </span>
            </span>
            <ChevronRight className="size-6 shrink-0 text-primary-foreground/70" />
          </div>
          <PathRail current={toPathIdx(stageIdx)} onDark />
        </button>



        {/* 分类待办 */}
        <div ref={todoRef} className="scroll-mt-3">
          <h2 className="font-display text-[21px] font-bold">今日待办</h2>
        </div>

        {CAT_ORDER.map((cat) => {
          const list = todos.filter((t) => t.cat === cat);
          if (!list.length) return null;
          const meta = CAT_META[cat];
          const Icon = meta.icon;
          const doneCount = list.filter(isDone).length;
          const all = doneCount === list.length;
          return (
            <section
              key={cat}
              className="overflow-hidden rounded-[26px] border bg-card"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <header className="flex items-center justify-between px-5 pb-2 pt-4">
                <div className="flex items-center gap-2.5">
                  <span className={cn("grid size-10 place-items-center rounded-2xl", meta.tint)}>
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-display text-[19px] font-bold">{cat}</h3>
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap rounded-full px-2.5 py-1 text-[14px] font-bold",
                    all ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                  )}
                >
                  {doneCount}/{list.length}
                </span>
              </header>
              <ul className="space-y-2 p-3">
                {list.map((t) => {
                  const done = isDone(t);
                  return (
                    <li
                      key={t.id}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl p-3 transition-colors",
                        done ? "bg-muted/40" : "bg-secondary/40",
                      )}
                    >
                      <button
                        onClick={() => onToggle(t)}
                        aria-label={done ? "取消打卡" : "打卡"}
                        className={cn(
                          "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border-2 active:scale-95",
                          done ? "border-success bg-success text-primary-foreground" : "border-border bg-card text-transparent",
                        )}
                      >
                        <Check className="size-5" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-[18px] font-bold leading-snug", done && "text-muted-foreground line-through")}>
                          {t.title}
                        </p>
                        <p className="mt-1 text-[15px] leading-snug text-muted-foreground">{t.detail}</p>
                        {t.time && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[14px] font-bold text-primary ring-1 ring-primary/15">
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


      {/* 骨关节服务包 */}
      <ServicePackBanner
        activated
        onOpenAll={() => setAllOpen(true)}
        onPick={(s) => (s.title === "宣教百科" ? onOpenEdu() : setPack(s))}
      />

      {allOpen && (
        <ServicePackAllSheet
          activated
          onClose={() => setAllOpen(false)}
          onPick={(s) => {
            setAllOpen(false);
            if (s.title === "宣教百科") onOpenEdu();
            else setPack(s);
          }}
        />
      )}


      {pack && (
        <Sheet title={pack.title} onClose={() => setPack(null)}>
          <p className="text-[18px] font-semibold leading-relaxed">{pack.desc}</p>
          <ul className="mt-4 space-y-3 text-[17px] leading-relaxed text-muted-foreground">
            <li>· 服务由您的主管治疗师与病区护士团队提供。</li>
            <li>· 预约或调整请在【骨灵】中留言，或联系护士站。</li>
            <li>· 服务完成后会自动生成您的打卡待办与记录。</li>
          </ul>
          <button
            onClick={() => setPack(null)}
            className="mt-5 w-full rounded-2xl py-3.5 text-[18px] font-bold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            我知道了
          </button>
        </Sheet>
      )}

      {pathOpen && (
        <Sheet title="住院流程" onClose={() => setPathOpen(false)}>
          <PathRail current={toPathIdx(stageIdx)} />
          <div className="mt-4 flex items-center gap-4 text-[15px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-success" /> 已完成
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-primary" /> 进行中
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-muted-foreground/30" /> 待进行
            </span>
          </div>

          <ol className="mt-4 space-y-2">
            {PATH_STEPS.map((s, i) => {
              const pi = toPathIdx(stageIdx);
              const state = i < pi ? "done" : i === pi ? "current" : "todo";
              return (
                <li
                  key={s.no}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-3.5",
                    state === "current" && "border-primary bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full text-[15px] font-bold",
                      state === "done" && "bg-success/15 text-success",
                      state === "current" && "bg-primary text-primary-foreground",
                      state === "todo" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {state === "done" ? <Check className="size-5" /> : s.no}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[18px] font-bold">
                        {s.line1}
                        {s.line2}
                      </span>
                      {state === "current" && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[14px] font-bold text-primary">
                          当前
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[15px] leading-snug text-muted-foreground">{s.desc}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </Sheet>
      )}

      </div>
    </div>

  );
}

/* ============ 日程（过往打卡记录明细） ============ */

interface DayRecord {
  date: string;
  label: string;
  items: { id: string; title: string; cat: TodoCat; time?: string; done: boolean }[];
}

function buildHistory(todos: SimpleTodo[], isDone: (t: SimpleTodo) => boolean): DayRecord[] {
  const today = new Date();
  const days: DayRecord[] = [];
  // 生成近 7 天（含今天）的打卡明细
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()];
    const isToday = i === 0;

    // 每天按当前待办模板生成记录，完成状态按日期做一点波动，今天用真实状态
    const items = todos.map((t, idx) => {
      const hash = (idx + i * 7) % 10;
      const simulatedDone = isToday ? isDone(t) : hash > 2; // 历史完成率约 70%
      return {
        id: `${t.id}-${i}`,
        title: t.title,
        cat: t.cat,
        time: t.time,
        done: simulatedDone,
      };
    });
    days.push({ date: dateStr, label: isToday ? "今天" : week, items });
  }
  return days;
}

function ScheduleTab({ todos, isDone }: { todos: SimpleTodo[]; isDone: (t: SimpleTodo) => boolean }) {
  const flow = useCaseFlow();
  const history = useMemo(() => buildHistory(todos, isDone), [todos, isDone]);
  const [sel, setSel] = useState(history.length - 1);
  const [showRehab, setShowRehab] = useState(false);
  const day = history[Math.min(sel, history.length - 1)];
  const totalDone = history.reduce((sum, d) => sum + d.items.filter((x) => x.done).length, 0);
  const totalItems = history.reduce((sum, d) => sum + d.items.length, 0);
  const rate = totalItems ? Math.round((totalDone / totalItems) * 100) : 0;

  const dayItems = day
    ? [...day.items].sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"))
    : [];
  const dayDone = dayItems.filter((x) => x.done).length;

  return (
    <div className="space-y-4 p-3 pb-6">
      {/* 总览 */}
      <section className="rounded-3xl border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <h2 className="text-[20px] font-bold">近 7 天打卡</h2>
        <div className="mt-4 flex items-center gap-5">
          <div
            className="grid size-24 shrink-0 place-items-center rounded-full"
            style={{ background: `conic-gradient(var(--primary) ${rate * 3.6}deg, var(--muted) 0deg)` }}
          >
            <div className="grid size-[68px] place-items-center rounded-full bg-card">
              <span className="text-[22px] font-bold text-primary">{rate}%</span>
            </div>
          </div>
          <div className="space-y-1 text-[17px]">
            <p className="font-bold">
              完成 <span className="text-success">{totalDone}</span> / {totalItems} 项
            </p>
            <p className="text-muted-foreground">连续打卡 6 天</p>
            <button
              onClick={() => setShowRehab(true)}
              className="whitespace-nowrap rounded-full bg-secondary px-3 py-1.5 text-[15px] font-bold text-primary"
            >
              康复方案 ›
            </button>
          </div>
        </div>
      </section>

      {/* 日期选择：横向一周，点选查看当天明细，无需长滑 */}
      <section className="rounded-3xl border bg-card p-3" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-stretch gap-2">
          {history.map((d, i) => {
            const dDone = d.items.filter((x) => x.done).length;
            const full = d.items.length > 0 && dDone === d.items.length;
            const active = i === Math.min(sel, history.length - 1);
            return (
              <button
                key={d.date}
                onClick={() => setSel(i)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 transition-colors",
                  active ? "bg-primary text-primary-foreground" : "bg-muted/50",
                )}
              >
                <span className={cn("whitespace-nowrap text-[13px] font-bold", !active && "text-muted-foreground")}>
                  {d.label}
                </span>
                <span className="text-[15px] font-bold">{d.date.slice(3)}</span>
                <span
                  className={cn(
                    "size-2 rounded-full",
                    active ? "bg-primary-foreground" : full ? "bg-success" : "bg-border",
                  )}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* 选中日明细 */}
      {day && (
        <section className="overflow-hidden rounded-3xl border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
          <header className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-5 text-primary" />
              <span className="text-[19px] font-bold">
                {day.date} · {day.label}
              </span>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[15px] font-bold text-primary">
              {dayDone}/{dayItems.length}
            </span>
          </header>
          <ul className="divide-y">
            {dayItems.map((t) => {
              const Icon = CAT_META[t.cat].icon;
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-[56px] shrink-0 text-[16px] font-bold text-primary">{t.time ?? "全天"}</span>
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", CAT_META[t.cat].tint)}>
                    <Icon className="size-4" />
                  </span>
                  <p
                    className={cn(
                      "min-w-0 flex-1 text-[17px] font-semibold leading-snug",
                      t.done && "text-muted-foreground line-through",
                    )}
                  >
                    {t.title}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[14px] font-bold",
                      t.done ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {t.done ? "已打卡" : "未打卡"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {showRehab && (
        <Sheet title="康复方案" onClose={() => setShowRehab(false)}>
          <p className="text-[17px] leading-relaxed text-muted-foreground">
            由您的主管治疗师制定，动作与角度会随恢复情况调整。
          </p>
          <h3 className="mt-4 text-[18px] font-bold">今日康复动作</h3>
          {todos.filter((t) => t.cat === "康复动作").length === 0 ? (
            <p className="mt-2 text-[17px] text-muted-foreground">暂无康复动作，方案生成后会显示在这里。</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {todos
                .filter((t) => t.cat === "康复动作")
                .map((t) => (
                  <li key={t.id} className="rounded-2xl border p-3.5">
                    <p className="text-[18px] font-bold leading-snug">{t.title}</p>
                    <p className="mt-1 text-[16px] leading-snug text-muted-foreground">{t.detail}</p>
                    {t.time && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[14px] font-bold text-primary">
                        <Clock className="size-4" /> {t.time}
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          )}

          <h3 className="mt-5 text-[18px] font-bold">治疗师评估调整记录</h3>
          {flow.dailyRehab.length === 0 ? (
            <p className="mt-2 text-[17px] text-muted-foreground">暂无评估记录，治疗师评估后会显示在这里。</p>
          ) : (
            <ul className="mt-2 space-y-3">
              {flow.dailyRehab.map((r) => (
                <li key={r.id} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[17px] font-bold">{r.date}</span>
                    <span className="text-[15px] text-muted-foreground">评估师：{r.therapist}</span>
                  </div>
                  <p className="mt-1 text-[16px] leading-relaxed text-muted-foreground">
                    疼痛 {r.painLevel} 分 · 伸 {r.extension} · 屈 {r.flexion}
                  </p>
                  <p className="mt-1 text-[16px]">{r.content}</p>
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      )}

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
      <div
        className={cn(
          "flex-1 space-y-3 p-4",
          msgs.length === 0 ? "overflow-hidden" : "overflow-y-auto",
        )}
      >
        {msgs.length === 0 && (
          <div className="flex h-full flex-col gap-3">
            <div
              className="shrink-0 rounded-3xl p-4 text-white"
              style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}
            >
              <div className="flex items-center gap-2 text-[15px] font-semibold text-white/90">
                <Sparkles className="size-4" /> 骨灵 · AI 主治医生
              </div>
              <p className="mt-1.5 text-[20px] font-bold leading-snug">{name}，我在这里</p>
              <p className="mt-0.5 whitespace-nowrap text-[15px] text-white/90">康复 · 用药 · 饮食 · 复查都可问</p>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-2">
              {AI_CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  className="flex h-full min-h-16 items-center justify-center rounded-2xl border bg-card px-3 text-center text-[16px] font-semibold leading-snug active:scale-[0.99]"
                >
                  {c}
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

type EduOpen = (EduItem & { unread?: boolean }) | null;

/** 结合病症 + 当前阶段推导相关宣教主题 */
function relevantTopics(diagnosis: string, stageLabel: string, inpatient: boolean): string[] {
  const t = new Set<string>();
  if (/膝|置换|TKA/.test(diagnosis)) {
    t.add("关节置换术后");
    t.add("屈膝角度");
  }
  if (/髋|股/.test(diagnosis)) t.add("行走与防跌倒");
  if (/韧带|ACL|肩/.test(diagnosis)) t.add("关节置换术后");
  if (/术前|入院|准备|办理/.test(stageLabel)) {
    t.add("用药安全");
  } else if (/术后|康复|手术/.test(stageLabel)) {
    t.add("疼痛与消肿");
    t.add("血栓预防");
    t.add("用药安全");
  }
  if (!inpatient || /出院|居家|院后|随访/.test(stageLabel)) {
    t.add("行走与防跌倒");
    t.add("饮食营养");
    t.add("复查随访");
  }
  return [...t];
}

function EduTab({
  inpatient,
  diagnosis,
  stageLabel,
}: {
  inpatient: boolean;
  diagnosis: string;
  stageLabel: string;
}) {
  const flow = useCaseFlow();
  const scope: "院内" | "居家" = inpatient ? "院内" : "居家";
  const [kw, setKw] = useState("");
  const [topic, setTopic] = useState("全部");
  const [open, setOpen] = useState<EduOpen>(null);
  const [showRest, setShowRest] = useState(false);

  const filtered = useMemo(() => {
    const q = kw.trim();
    return EDU_LIB.filter((e) => {
      const okKw = !q || e.title.includes(q) || e.desc.includes(q) || e.tag.includes(q) || e.topics.some((t) => t.includes(q));
      const okTopic = topic === "全部" || e.topics.includes(topic);
      return okKw && okTopic;
    });
  }, [kw, topic]);

  const searching = kw.trim() !== "" || topic !== "全部";

  /** 默认视图：只展示与病症/阶段匹配的宣教，避免无用内容 */
  const { recommended, rest } = useMemo(() => {
    const topics = relevantTopics(diagnosis, stageLabel, inpatient);
    const hit = (e: EduItem) => e.scope === scope && e.topics.some((t) => topics.includes(t));
    let rec = EDU_LIB.filter(hit).slice(0, 4);
    if (!rec.length) rec = EDU_LIB.filter((e) => e.scope === scope).slice(0, 4);
    return { recommended: rec, rest: EDU_LIB.filter((e) => !rec.includes(e)) };
  }, [diagnosis, stageLabel, inpatient, scope]);


  return (
    <div className="space-y-4 p-3 pb-6">
      {/* 搜索 */}
      <div className="flex items-center gap-2 rounded-2xl border-2 bg-card px-4 py-3">
        <Search className="size-6 shrink-0 text-muted-foreground" />
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="搜索：屈膝、消肿、抗凝药…"
          className="min-w-0 flex-1 bg-transparent text-[18px] font-semibold outline-none placeholder:text-muted-foreground/70"
        />
        {kw && (
          <button onClick={() => setKw("")} aria-label="清空" className="shrink-0 text-muted-foreground">
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* 骨关节问题筛选 */}
      <div className="space-y-2">
        <p className="text-[17px] font-bold">按骨关节问题查看</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {EDU_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border-2 px-3.5 py-2 text-[16px] font-bold",
                topic === t ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {!searching && flow.eduPushes.length > 0 && (
        <EduGroup title="医护为您推送">
          {flow.eduPushes.map((e) => {
            const item: EduItem = {
              title: e.title, desc: e.desc, tag: e.tag, scope, media: "图文", meta: "图文 2分钟",
              topics: [], cover: "linear-gradient(135deg,#2563eb,#22d3ee)",
            };
            return (
              <EduCard
                key={e.id}
                item={item}
                unread={!e.read}
                onOpen={() => {
                  markEduRead(e.id);
                  setOpen(item);
                }}
              />
            );
          })}
        </EduGroup>
      )}

      {searching ? (
        filtered.length ? (
          <EduGroup title={`搜索结果 ${filtered.length} 条`}>
            {filtered.map((e) => (
              <EduCard key={e.title} item={e} onOpen={() => setOpen(e)} />
            ))}
          </EduGroup>
        ) : (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="text-[18px] font-bold">没有找到相关科普</p>
            <p className="mt-1.5 text-[16px] text-muted-foreground">换个关键字，或到【骨灵】里直接提问</p>
          </div>
        )
      ) : (
        <>
          <div className="rounded-2xl bg-secondary/60 px-4 py-3">
            <p className="text-[16px] font-bold text-primary">
              按您的病症与当前阶段推荐：{diagnosis} · {stageLabel}
            </p>
          </div>

          <EduGroup title={`${scope}必读（${recommended.length} 条）`}>
            {recommended.map((e) => (
              <EduCard key={e.title} item={e} onOpen={() => setOpen(e)} />
            ))}
          </EduGroup>

          {rest.length > 0 && (
            <>
              <button
                onClick={() => setShowRest((v) => !v)}
                className="flex w-full items-center justify-center gap-1 rounded-2xl border-2 py-3 text-[17px] font-bold text-primary"
              >
                {showRest ? "收起其他宣教" : `查看其他宣教 ${rest.length} 条`}
                <ChevronRight className={cn("size-5", showRest && "rotate-90")} />
              </button>
              {showRest && (
                <EduGroup title="其他宣教">
                  {rest.map((e) => (
                    <EduCard key={e.title} item={e} onOpen={() => setOpen(e)} />
                  ))}
                </EduGroup>
              )}
            </>
          )}
        </>
      )}


      {open && (
        <Sheet title={open.title} onClose={() => setOpen(null)}>
          <div
            className="relative grid h-44 w-full place-items-center rounded-2xl text-white"
            style={{ background: open.cover }}
          >
            {open.media === "视频" ? (
              <button className="grid size-16 place-items-center rounded-full bg-white/25 ring-2 ring-white/60 active:scale-95">
                <Play className="size-8" />
              </button>
            ) : (
              <BookOpen className="size-12 opacity-80" />
            )}
            <span className="absolute bottom-2 right-3 rounded-full bg-black/35 px-2.5 py-1 text-[15px] font-bold">
              {open.meta}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[16px] font-bold text-primary">{open.tag}</span>
            {open.topics.map((t) => (
              <span key={t} className="rounded-md bg-muted px-2.5 py-1 text-[16px] font-semibold text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
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

function EduCard({ item, unread, onOpen }: { item: EduItem; unread?: boolean; onOpen?: () => void }) {
  return (
    <li>
      <button onClick={onOpen} className="flex w-full items-center gap-3 px-3 py-3.5 text-left active:bg-muted/50">
        <span
          className="relative grid size-24 shrink-0 place-items-center rounded-2xl text-white"
          style={{ background: item.cover }}
        >
          {item.media === "视频" ? <Play className="size-8" /> : <BookOpen className="size-7 opacity-85" />}
          <span className="absolute bottom-1 right-1 rounded-md bg-black/35 px-1.5 py-0.5 text-[13px] font-bold">
            {item.media}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-bold leading-snug">{item.title}</p>
          <p className="mt-1 text-[16px] leading-snug text-muted-foreground">{item.desc}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="whitespace-nowrap rounded-md bg-muted px-2 py-0.5 text-[15px] font-semibold text-muted-foreground">
              {item.tag}
            </span>
            <span className="whitespace-nowrap text-[15px] font-semibold text-muted-foreground">{item.meta}</span>
          </div>
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
