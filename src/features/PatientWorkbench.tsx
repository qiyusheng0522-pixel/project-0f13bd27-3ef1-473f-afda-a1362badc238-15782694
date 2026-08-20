import { useMemo, useState } from "react";
import {
  Home,
  ClipboardList,
  Activity,
  User,
  Upload,
  CheckCircle2,
  Circle,
  Sparkles,
  Send,
  ArrowLeft,
  Dumbbell,
  Apple,
  AlertTriangle,
  Soup,
  Leaf,
  Pill,
  MapPin,
  Camera,
  PlayCircle,
  Bell,
  RefreshCw,
  X,
  Stethoscope,
  ScanLine,
  Watch,
  HeartPulse,
  FileText,
  History,
  CalendarCheck,
  Cigarette,
  ChevronRight,
} from "lucide-react";
import { PhoneShell, TabBar } from "@/components/PhoneShell";
import { PatientHomeScreen } from "@/features/patient/PatientHomeScreen";
import { CaseFlowBanner, AbnormalPanel } from "@/components/CaseFlowBanner";
import {
  useCaseFlow,
  toggleTodo as toggleFlowTodo,
  markEduRead,
  markMessageRead,
  STAGE_EDU,
  STAGE_STEPS,
} from "@/lib/case-flow";
import { PatientCareScreen } from "@/features/patient/PatientCareScreen";
import { PatientAiChat } from "@/features/patient/PatientAiChat";
import { cn } from "@/lib/utils";

type Mode = "inpatient" | "home";
type TabKey = "home" | "plan" | "me";

// ---------- 路径图阶段 ----------
const INPATIENT_STAGES = [
  { key: "admit", label: "入院登记" },
  { key: "preop", label: "术前检查" },
  { key: "surgery", label: "手术" },
  { key: "postop", label: "术后观察" },
  { key: "rehab", label: "院内康复" },
  { key: "discharge", label: "出院" },
] as const;

const HOME_STAGES = [
  { key: "early", label: "居家早期 (1-2周)" },
  { key: "middle", label: "中期恢复 (3-6周)" },
  { key: "late", label: "强化期 (2-3月)" },
  { key: "back", label: "回归生活" },
] as const;

// ---------- 院内今日任务 ----------
type TodoItem = {
  id: string;
  title: string;
  detail: string;
  category: "运动" | "宣教" | "用药" | "饮食" | "复查";
  time?: string;
  done?: boolean;
};

const INPATIENT_TODOS: TodoItem[] = [
  { id: "t1", title: "踝泵运动", detail: "每次 30 下 · 上下午各 3 组", category: "运动", time: "上午 09:00" },
  { id: "t2", title: "直腿抬高", detail: "每次 15 下 · 缓慢抬起 5 秒", category: "运动", time: "上午 10:30" },
  { id: "t3", title: "术后护理宣教视频", detail: "约 3 分钟 · 看完点完成", category: "宣教", time: "上午 11:00" },
  { id: "t4", title: "服用止痛药", detail: "塞来昔布 1 粒 · 饭后", category: "用药", time: "中午 12:30" },
  { id: "t5", title: "助行器行走训练", detail: "床边站立 + 助行器行走 10 分钟", category: "运动", time: "中午 12:00" },
  { id: "t6", title: "下午冰敷", detail: "膝关节冰敷 15 分钟", category: "运动", time: "下午 15:00" },
];

const HOME_TODOS: TodoItem[] = [
  { id: "h1", title: "晨起股四头肌训练", detail: "靠墙静蹲 30 秒 × 5 组", category: "运动", time: "早上 07:30" },
  { id: "h2", title: "早餐:小米南瓜粥 + 鸡蛋", detail: "药食同源 · 健脾养胃", category: "饮食", time: "早上 08:00" },
  { id: "h3", title: "中药补益 (黄芪炖鸡)", detail: "药食同源 · 补气强筋", category: "饮食", time: "中午 12:00" },
  { id: "h4", title: "户外散步", detail: "20 分钟 · 拄拐缓行", category: "运动", time: "下午 16:00" },
  { id: "h5", title: "学习:居家防跌倒", detail: "图文宣教 2 分钟", category: "宣教", time: "晚上 19:00" },
  { id: "h6", title: "钙片 + 维生素 D", detail: "饭后 1 粒", category: "用药", time: "晚上 19:30" },
];

// ---------- 康复方案 ----------
type Exercise = { name: string; dose: string };
type RehabPlan = {
  title: string;
  goal: string;
  exercises: Exercise[];
  cautions: string[];
  diet: string[];
};

const INPATIENT_REHAB: RehabPlan = {
  title: "院内康复方案 · 术后第 3 天",
  goal: "消肿止痛 · 防止血栓 · 早期活动",
  exercises: [
    { name: "踝泵运动", dose: "每小时 1 组,每组 30 次" },
    { name: "股四头肌等长收缩", dose: "每次 10 秒 × 15 次,3 组/天" },
    { name: "直腿抬高 (SLR)", dose: "15 次 × 3 组" },
    { name: "膝关节被动屈伸", dose: "0-60° · 由治疗师协助" },
  ],
  cautions: [
    "下床需护士陪同,避免跌倒",
    "患肢避免负重",
    "保持伤口干燥清洁",
    "出现剧烈疼痛或发热立即呼叫护士",
  ],
  diet: [
    "高蛋白:鸡蛋、鱼肉、瘦肉",
    "高钙:牛奶、豆制品",
    "多纤维:蔬菜水果,预防便秘",
    "忌辛辣、生冷、烟酒",
  ],
};

const HOME_REHAB: RehabPlan = {
  title: "居家康复方案 · 出院后第 2 周",
  goal: "恢复关节活动度 · 增强肌力 · 安全回归生活",
  exercises: [
    { name: "靠墙静蹲", dose: "30 秒 × 5 组,每天 2 次" },
    { name: "坐位伸膝", dose: "保持 5 秒 × 15 次,3 组/天" },
    { name: "侧卧抬腿", dose: "15 次 × 3 组" },
    { name: "踏步训练", dose: "10 分钟/次,每天 2 次" },
  ],
  cautions: [
    "上下楼梯:好腿先上,患腿先下",
    "避免长时间下蹲、跪地",
    "运动前热身,运动后冰敷",
    "如有红肿热痛及时复诊",
  ],
  diet: [
    "保证每日 1 个鸡蛋 + 250ml 牛奶",
    "深海鱼每周 2 次 (补充欧米伽-3)",
    "饮水 1500ml 以上",
    "控制体重,减轻关节负担",
  ],
};

// ---------- 营养方案 / 药食同源 ----------
type Dish = {
  id: string;
  meal: "早餐" | "午餐" | "晚餐" | "加餐";
  name: string;
  benefit: string;
  alternates: string[]; // 可替换菜品
};

const INITIAL_DISHES: Dish[] = [
  {
    id: "d1",
    meal: "早餐",
    name: "小米南瓜粥 + 水煮蛋",
    benefit: "健脾养胃,优质蛋白",
    alternates: ["燕麦牛奶 + 鸡蛋", "山药薏米粥 + 蒸蛋羹", "红枣桂圆粥 + 卤蛋"],
  },
  {
    id: "d2",
    meal: "午餐",
    name: "黄芪炖鸡汤 + 杂粮饭",
    benefit: "药食同源 · 补气强筋骨",
    alternates: ["当归生姜羊肉汤", "枸杞炖排骨", "杜仲腰花汤"],
  },
  {
    id: "d3",
    meal: "午餐",
    name: "清蒸鲈鱼 + 西兰花",
    benefit: "高蛋白 · 促进伤口愈合",
    alternates: ["三文鱼 + 芦笋", "蒜蓉虾仁 + 菠菜", "豆腐烧鸡胸肉"],
  },
  {
    id: "d4",
    meal: "晚餐",
    name: "黑豆核桃糙米饭 + 时蔬",
    benefit: "补肾健骨 · 富含钙镁",
    alternates: ["紫薯藜麦饭 + 蘑菇", "山药排骨 + 油菜", "豆腐鲫鱼汤 + 杂粮"],
  },
  {
    id: "d5",
    meal: "加餐",
    name: "牛奶 + 核桃 2 颗",
    benefit: "补钙 · 健脑安神",
    alternates: ["酸奶 + 蓝莓", "豆浆 + 红枣", "牛奶 + 杏仁"],
  },
];

// ---------- 患者档案（后台状态，用于自动识别院内 / 院外版本） ----------
type PatientProfile = {
  name: string;
  gender: "男" | "女";
  age: number;
  birthday: string;
  hospital: string;
  /** 后台同步的就诊状态，决定自动切换到哪一版 */
  status: "admitted" | "post-op" | "rehab" | "discharged" | "outpatient";
  diseaseHistory: { name: string; date: string }[];
  pastTreatments: { date: string; note: string }[];
  followUps: { date: string; note: string }[];
  lifestyleRisks: string[];
};

const PATIENT: PatientProfile = {
  name: "石美平",
  gender: "女",
  age: 64,
  birthday: "1962年04月19日",
  hospital: "南京鼓楼医院",
  status: "post-op",
  diseaseHistory: [{ name: "肩袖肌腱损伤", date: "2026-03-16" }],
  pastTreatments: [{ date: "2026年03月16日", note: "住院处理建议：无" }],
  followUps: [],
  lifestyleRisks: ["膝关节疼痛", "抽烟", "饮水量不足", "消瘦"],
};

/** 由就诊状态自动判定版本：在院 → 住院版，其余 → 门诊/居家版 */
function detectMode(status: PatientProfile["status"]): Mode {
  return status === "admitted" || status === "post-op" || status === "rehab" ? "inpatient" : "home";
}

// ---------- 主组件 ----------
export function PatientWorkbench() {
  const flow = useCaseFlow();
  const [status, setStatus] = useState<PatientProfile["status"]>(PATIENT.status);
  const mode = detectMode(status);
  const [tab, setTab] = useState<TabKey>("home");
  const [admissionUploaded, setAdmissionUploaded] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>(INPATIENT_TODOS);
  const [homeTodos, setHomeTodos] = useState<TodoItem[]>(HOME_TODOS);
  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState<string | undefined>(undefined);
  const [pathOpen, setPathOpen] = useState(false);
  const [swapDish, setSwapDish] = useState<Dish | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // 新用户使用引导（1/3 ~ 3/3）
  const [guideStep, setGuideStep] = useState<1 | 2 | 3 | null>(1);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [scaleOpen, setScaleOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [eduDetail, setEduDetail] = useState<{ id?: string; title: string; desc: string; tag: string } | null>(null);


  // 演示病例：治疗师审核康复方案后，患者端待办由方案自动生成
  const flowTodos: TodoItem[] = flow.todos.map((t) => ({
    id: t.id,
    title: t.title,
    detail: t.detail,
    category: t.category === "评估" ? "复查" : t.category,
    time: t.time,
    done: t.done,
  }));
  const useFlowTodos = mode === "inpatient" && flow.planApproved && flowTodos.length > 0;
  const currentTodos = useFlowTodos ? flowTodos : mode === "inpatient" ? todos : homeTodos;
  const setCurrentTodos = mode === "inpatient" ? setTodos : setHomeTodos;
  const stages = mode === "inpatient" ? INPATIENT_STAGES : HOME_STAGES;
  const currentStageIdx = mode === "inpatient" ? 3 : 1; // 演示当前阶段
  const rehab = mode === "inpatient" ? INPATIENT_REHAB : HOME_REHAB;

  const doneCount = currentTodos.filter((t) => t.done).length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const toggleTodo = (id: string) => {
    if (useFlowTodos) {
      toggleFlowTodo(id);
      return;
    }
    setCurrentTodos((arr) => arr.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const swapDishTo = (newName: string) => {
    if (!swapDish) return;
    setDishes((arr) =>
      arr.map((d) =>
        d.id === swapDish.id
          ? { ...d, name: newName, alternates: [swapDish.name, ...d.alternates.filter((a) => a !== newName)] }
          : d,
      ),
    );
    setSwapDish(null);
    showToast("已为您更换菜品");
  };

  const tabItems = [
    { key: "home", label: "首页", icon: Home },
    { key: "ai", label: "骨灵", icon: Sparkles },
    { key: "plan", label: "方案", icon: ClipboardList },
    { key: "me", label: "我的", icon: User },
  ];

  return (
    <PhoneShell
      title="骨安 · 患者端"
      subtitle={`${mode === "inpatient" ? "住院版" : "门诊版"} · 自动识别 · 大字适老`}
      hideHeader={aiOpen}
      overlay={
        archiveOpen || scaleOpen || aiOpen ? null : guideStep ? (
          <GuideSheet
            step={guideStep}
            onSkip={() => setGuideStep(null)}
            onAction={() => {
              if (guideStep === 1) setArchiveOpen(true);
              else if (guideStep === 2) setScaleOpen(true);
              else {
                setGuideStep(null);
                setTab("plan");
              }
            }}
          />
        ) : (
          <div className="flex justify-end">
            <button
              onClick={() => setGuideStep(1)}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[17px] font-bold text-primary-foreground shadow-lg active:scale-95"
              style={{ boxShadow: "var(--shadow-elevated)" }}
            >
              <Sparkles className="h-5 w-5" />
              引导
            </button>
          </div>
        )
      }

      bottom={
        <TabBar
          items={tabItems}
          activeKey={aiOpen ? "ai" : tab}
          onChange={(k) => {
            if (k === "ai") {
              setAiOpen(true);
              return;
            }
            setAiOpen(false);
            setAiQuestion(undefined);
            setTab(k as TabKey);
          }}
        />
      }
    >

      {/* 骨灵会话（全屏占满内容区） */}
      {aiOpen && (
        <div className="h-full">
          <PatientAiChat
            initialQuestion={aiQuestion}
            onClose={() => {
              setAiOpen(false);
              setAiQuestion(undefined);
            }}
          />
        </div>
      )}

      <div className={cn("relative pb-24 text-[17px] leading-relaxed", aiOpen && "hidden")}>

        {/* 就诊状态胶囊（自动识别，住院/非住院） */}
        <div className="flex items-center justify-between px-4 pt-3">
          <span
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-glow px-4 py-2.5 text-[17px] font-bold text-white shadow-md"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <Activity className="h-5 w-5" />
            {mode === "inpatient" ? "骨安 · 住院中" : "骨安 · 非住院"}
          </span>
          <button
            onClick={() => setStatus(mode === "inpatient" ? "outpatient" : "post-op")}
            className="rounded-full border px-3 py-1.5 text-[16px] text-muted-foreground active:bg-muted"
          >
            演示切换
          </button>
        </div>


        {tab === "home" && mode === "inpatient" && flow.created && (
          <div className="space-y-2 px-4 pt-1">
            <CaseFlowBanner
              hint={
                flow.planApproved
                  ? `康复方案「${flow.planName}」已生效 · 今日 ${flow.todos.length} 项打卡待办`
                  : "手术已完成，治疗师正在制定康复方案"
              }
            />
            <AbnormalPanel compact />
          </div>
        )}

        {tab === "home" && mode === "inpatient" && (
          <InpatientHomeTab
            patient={PATIENT}
            stages={stages as unknown as { key: string; label: string }[]}
            currentStageIdx={currentStageIdx}
            todos={currentTodos}

            onToggle={toggleTodo}
            onAskAI={() => {
              setAiQuestion(undefined);
              setAiOpen(true);
            }}
            onOpenPath={() => setPathOpen(true)}
            onOpenMessages={() => setMsgOpen(true)}
            onOpenEdu={(e) => setEduDetail(e)}
          />
        )}

        {tab === "home" && mode === "home" && (
          <PatientHomeScreen
            mode={mode}
            patientName={PATIENT.name}
            bedInfo={`${PATIENT.hospital} · 门诊随访`}
            stageLabel={stages[currentStageIdx].label}
            stageIdx={currentStageIdx}
            stageTotal={stages.length}
            onOpenPath={() => setPathOpen(true)}
            admissionUploaded={admissionUploaded}
            onUpload={() => {
              setAdmissionUploaded(true);
              showToast("入院单上传成功");
            }}
            todos={currentTodos}
            onToggle={toggleTodo}
            onAskAI={(q) => {
              setAiQuestion(q);
              setAiOpen(true);
            }}
            onOpenScale={() => setScaleOpen(true)}
            onOpenGuide={() => setGuideStep(1)}
            eduSlot={<EduSection />}
          />
        )}


        {tab === "plan" && (
          <PatientCareScreen
            mode={mode}
            rehab={rehab}
            dishes={dishes}
            onSwap={setSwapDish}
            onSyncToTodo={() => showToast("已同步到我的打卡待办")}
          />
        )}

        {tab === "me" && (
          <MeTab
            mode={mode}
            doneCount={doneCount}
            total={currentTodos.length}
            patient={PATIENT}
            todos={currentTodos}
            onToggle={toggleTodo}
          />
        )}

        {/* 换菜弹层 */}
        {swapDish && (
          <SwapDishSheet dish={swapDish} onClose={() => setSwapDish(null)} onPick={swapDishTo} />
        )}

        {/* 完整住院路径 */}
        {pathOpen && (
          <PathSheet
            stages={stages as unknown as { key: string; label: string }[]}
            currentStageIdx={currentStageIdx}
            onClose={() => setPathOpen(false)}
          />
        )}

        {msgOpen && (
          <MessagesSheet
            onClose={() => setMsgOpen(false)}
            onOpenEdu={(e) => {
              setEduDetail(e);
              setMsgOpen(false);
            }}
          />
        )}

        {eduDetail && <EduDetailSheet edu={eduDetail} onClose={() => setEduDetail(null)} />}





        {/* 第 1 步：健康档案上传 */}
        {archiveOpen && (
          <ArchiveUploadSheet
            onClose={() => {
              setArchiveOpen(false);
              setGuideStep(2);
            }}
          />
        )}

        {/* 第 2 步：专病量表 */}
        {scaleOpen && (
          <ScaleSheet
            onClose={() => {
              setScaleOpen(false);
              setGuideStep(3);
            }}
            onSubmit={() => {
              setScaleOpen(false);
              setGuideStep(3);
              showToast("量表已提交，AI 正在生成风险报告");
            }}
          />
        )}





        {/* Toast */}
        {toast && (
          <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-full bg-foreground/90 px-4 py-2.5 text-[17px] font-medium text-background shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </PhoneShell>
  );
}


// ---------- 健康百科 ----------
type EduKind = "视频" | "图文" | "直播";
const EDU_FILTERS: ("全部" | EduKind)[] = ["全部", "视频", "图文", "直播"];
const EDU_ITEMS: {
  id: string;
  kind: EduKind;
  title: string;
  author: string;
  tag: string;
  icon: React.ElementType;
  tint: string;
  tagTint: string;
}[] = [
  {
    id: "e1",
    kind: "视频",
    title: "膝关节置换术后第一周：踝泵与直腿抬高怎么做",
    author: "康复治疗师 李敏 · 4 分钟",
    tag: "必看",
    icon: Dumbbell,
    tint: "from-sky-400 to-blue-600",
    tagTint: "bg-primary/10 text-primary",
  },
  {
    id: "e2",
    kind: "图文",
    title: "骨科术后补钙怎么吃？药食同源 5 款汤品",
    author: "临床营养师 张薇 · 6 分钟",
    tag: "食谱",
    icon: Soup,
    tint: "from-emerald-400 to-teal-600",
    tagTint: "bg-success/10 text-success",
  },
  {
    id: "e3",
    kind: "图文",
    title: "居家防跌倒 8 个细节：浴室、楼梯、夜间起夜",
    author: "护士长 王芳 · 3 分钟",
    tag: "安全",
    icon: AlertTriangle,
    tint: "from-orange-400 to-amber-600",
    tagTint: "bg-warning/10 text-warning",
  },
  {
    id: "e4",
    kind: "直播",
    title: "本周四 19:30 · 人工关节使用寿命与日常保养",
    author: "关节外科 王渭君主任 · 直播预约",
    tag: "预约",
    icon: HeartPulse,
    tint: "from-violet-400 to-purple-600",
    tagTint: "bg-primary/10 text-primary",
  },
];

// ---------- 住院版首页（保持原有样式） ----------
function InpatientHomeTab({
  patient,
  stages,
  currentStageIdx,
  todos,
  onToggle,
  onAskAI,
  onOpenPath,
  onOpenMessages,
  onOpenEdu,
}: {
  patient: PatientProfile;
  stages: { key: string; label: string }[];
  currentStageIdx: number;

  todos: TodoItem[];
  onToggle: (id: string) => void;
  onAskAI: () => void;
  onOpenPath: () => void;
  onOpenMessages?: () => void;
  onOpenEdu?: (e: { id?: string; title: string; desc: string; tag: string }) => void;
}) {
  const currentStage = stages[currentStageIdx];
  const doing = todos.filter((t) => !t.done);
  const finished = todos.filter((t) => t.done);

  return (
    <div className="space-y-4 p-3">
      {/* 患者信息 + 住院状态 + 当前阶段（融合卡） */}
      <div
        className="relative overflow-hidden rounded-[26px] p-4 text-white"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elevated)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-16 size-48 rounded-full opacity-30 blur-3xl"
          style={{ background: "oklch(0.85 0.12 220)" }}
        />
        <div className="relative flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[16px] font-bold ring-1 ring-white/25">
            <Activity className="h-4 w-4" /> 骨安 · 住院中
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-[16px] font-bold text-primary">
            第 {currentStageIdx + 1}/{stages.length} 阶段
          </span>
        </div>

        <div className="relative mt-3 flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-[24px] font-bold backdrop-blur">
            {patient.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="text-[26px] font-bold leading-tight">{patient.name}</div>
            <div className="mt-1 text-[17px] opacity-95">
              性别：{patient.gender}　年龄：{patient.age}岁
            </div>
            <div className="text-[17px] opacity-90">出生日期：{patient.birthday}</div>
          </div>
        </div>

        <button
          onClick={onOpenPath}
          className="relative mt-3 flex w-full items-center gap-2 rounded-2xl bg-white/20 px-3 py-3 text-left backdrop-blur active:scale-[0.99]"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <MapPin className="h-5 w-5 shrink-0" />
            <span className="shrink-0 text-[17px]">当前阶段：</span>
            <b className="whitespace-nowrap text-[19px]">{currentStage.label}</b>
          </div>
          <span className="flex shrink-0 items-center whitespace-nowrap text-[16px] font-bold">
            <ChevronRight className="h-5 w-5" />
          </span>
        </button>

        <div className="relative mt-2 text-[17px] opacity-90">{patient.hospital} · 关节外科</div>
      </div>


      {/* 我的任务 */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center justify-between bg-teal-500 px-4 py-3 text-white">
          <div className="flex items-center gap-2 text-[20px] font-bold">
            <Bell className="h-6 w-6" />
            我的任务
          </div>
          <div className="text-[17px]">
            {finished.length}/{todos.length}
          </div>
        </div>
        <div className="space-y-2.5 p-3">
          {doing.length === 0 && (
            <div className="py-4 text-center text-[17px] text-muted-foreground">今日任务已全部完成 🎉</div>
          )}
          {doing.map((t) => (
            <TodoRow key={t.id} todo={t} onToggle={onToggle} />
          ))}
        </div>
      </section>

      {/* 消息提醒（护士推送的宣教在此提醒查看） */}
      <MessageEntry onOpen={onOpenMessages} />

      {/* 本阶段必读宣教 */}
      <StageEduSection onOpenEdu={onOpenEdu} />

      {/* 宣教：健康百科 */}
      <EduSection />


      {/* 健康服务包 */}
      <section className="overflow-hidden rounded-2xl border bg-card p-3">
        <div className="mb-2.5 flex items-center gap-2">
          <div className="text-[20px] font-bold">骨安健康服务包</div>
          <button className="ml-auto flex items-center text-[17px] font-medium text-primary">
            全部服务
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          className="relative w-full overflow-hidden rounded-2xl p-4 text-left text-white active:scale-[0.99]"
          style={{ background: "linear-gradient(135deg, #1677d2, #0b62c4)" }}
        >
          <div className="flex items-center gap-2 text-[17px] opacity-95">
            <Sparkles className="h-5 w-5" />
            骨科医生 &amp; 营养师联合甄选
          </div>
          <div className="mt-2 text-[24px] font-bold">骨安健康服务包</div>
          <div className="mt-1 text-[17px] opacity-90">营养餐 · 专病服务包 · 院内可对接</div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1.5 text-[17px] backdrop-blur">
              已为 12,488 位骨友服务
            </span>
            <span className="flex items-center text-[17px] font-bold">
              查看服务
              <ChevronRight className="h-5 w-5" />
            </span>
          </div>
        </button>
      </section>

      {/* 骨灵快捷入口 */}
      <button
        onClick={onAskAI}
        className="flex w-full items-center gap-3 rounded-2xl p-4 text-left text-white active:scale-[0.99]"
        style={{ background: "linear-gradient(135deg, #f97316, #e11d48)" }}
      >
        <Sparkles className="h-10 w-10 shrink-0" />
        <div>
          <div className="text-[20px] font-bold">问问骨灵</div>
          <div className="text-[17px] opacity-95">可以说话提问，随时解答康复疑问</div>
        </div>
      </button>
    </div>
  );
}

function EduSection() {


  const [filter, setFilter] = useState<"全部" | EduKind>("全部");
  const list = EDU_ITEMS.filter((i) => filter === "全部" || i.kind === filter);
  return (
    <section className="overflow-hidden rounded-2xl border bg-card p-3">
      <div className="flex items-center gap-2">
        <div className="text-[20px] font-bold">健康百科</div>
        <button className="ml-auto flex items-center text-[17px] font-medium text-primary">
          进入百科
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 分类 */}
      <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
        {EDU_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[17px] font-medium",
              filter === f
                ? "border-transparent bg-primary text-white"
                : "bg-background text-muted-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="mt-1 space-y-2.5">
        {list.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              className="flex w-full items-center gap-3 rounded-2xl bg-muted/40 p-2.5 text-left active:bg-muted"
            >
              <div
                className={cn(
                  "relative flex h-[76px] w-[104px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                  it.tint,
                )}
              >
                <Icon className="h-9 w-9 opacity-90" />
                <span className="absolute left-1 top-1 rounded-md bg-black/45 px-1.5 py-0.5 text-[16px] font-bold backdrop-blur">
                  {it.kind}
                </span>
                {it.kind === "视频" && (
                  <PlayCircle className="absolute bottom-1 right-1 h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[18px] font-bold leading-snug">{it.title}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={cn("rounded-md px-2 py-0.5 text-[17px] font-bold", it.tagTint)}
                  >
                    {it.tag}
                  </span>
                  <span className="truncate text-[17px] text-muted-foreground">{it.author}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}



/** 消息入口：护士 / 治疗师推送的宣教会在此提醒 */
function MessageEntry({ onOpen }: { onOpen?: () => void }) {
  const flow = useCaseFlow();
  const unread = flow.messages.filter((m) => !m.read).length;
  if (flow.messages.length === 0) return null;
  const latest = flow.messages[0];
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left active:bg-muted/40"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bell className="h-7 w-7" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1 text-[15px] font-bold text-white">
            {unread}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[20px] font-bold">消息{unread > 0 ? ` · ${unread} 条未读` : ""}</div>
        <div className="truncate text-[17px] text-muted-foreground">{latest.title}</div>
      </div>
      <ChevronRight className="h-6 w-6 shrink-0 text-muted-foreground" />
    </button>
  );
}

/** 按当前住院阶段展示的必读宣教 */
function StageEduSection({
  onOpenEdu,
}: {
  onOpenEdu?: (e: { id?: string; title: string; desc: string; tag: string }) => void;
}) {
  const flow = useCaseFlow();
  const stageKey = flow.created ? flow.stage : "post-op";
  const stageLabel = STAGE_STEPS.find((s) => s.key === stageKey)?.label ?? "术后观察";
  const required = STAGE_EDU[stageKey] ?? STAGE_EDU["post-op"];
  const pushed = flow.eduPushes;
  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center justify-between gap-2 bg-violet-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2 text-[20px] font-bold">
          <PlayCircle className="h-6 w-6" />
          本阶段必读宣教
        </div>
        <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-[16px] font-bold">{stageLabel}</span>
      </div>
      <div className="space-y-2.5 p-3">
        {pushed.map((e) => (
          <button
            key={e.id}
            onClick={() => onOpenEdu?.({ id: e.id, title: e.title, desc: e.desc, tag: e.tag })}
            className="flex w-full items-start gap-3 rounded-2xl border-2 border-primary/40 bg-primary/5 p-3 text-left active:bg-primary/10"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Bell className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[18px] font-bold leading-snug">{e.title}</div>
              <div className="mt-1 text-[17px] text-muted-foreground">{e.desc}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[16px] font-bold text-white">
                  {e.read ? "已阅读" : "护士推送 · 待查看"}
                </span>
                <span className="text-[16px] text-muted-foreground">{e.at}</span>
              </div>
            </div>
            <ChevronRight className="mt-2 h-6 w-6 shrink-0 text-muted-foreground" />
          </button>
        ))}
        {required.map((e) => (
          <button
            key={e.title}
            onClick={() => onOpenEdu?.(e)}
            className="flex w-full items-start gap-3 rounded-2xl bg-muted/40 p-3 text-left active:bg-muted"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <PlayCircle className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[18px] font-bold leading-snug">{e.title}</div>
              <div className="mt-1 text-[17px] text-muted-foreground">{e.desc}</div>
              <span className="mt-1.5 inline-block rounded-full bg-violet-100 px-2.5 py-0.5 text-[16px] font-bold text-violet-700">
                必读 · {e.tag}
              </span>
            </div>
            <ChevronRight className="mt-2 h-6 w-6 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </section>
  );
}

/** 消息中心 */
function MessagesSheet({
  onClose,
  onOpenEdu,
}: {
  onClose: () => void;
  onOpenEdu: (e: { id?: string; title: string; desc: string; tag: string }) => void;
}) {
  const flow = useCaseFlow();
  return (
    <div className="absolute inset-0 z-[70] flex flex-col bg-background">
      <div className="flex items-center gap-2 border-b bg-card px-4 py-3">
        <button onClick={onClose} className="flex items-center gap-1 text-[18px] text-muted-foreground">
          <ArrowLeft className="h-6 w-6" />返回
        </button>
        <div className="flex-1 text-center text-[20px] font-bold">消息</div>
        <div className="w-14" />
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {flow.messages.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-[18px] text-muted-foreground">
            暂无消息
          </div>
        )}
        {flow.messages.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              if (m.kind === "edu" && m.eduId) {
                const e = flow.eduPushes.find((x) => x.id === m.eduId);
                if (e) {
                  onOpenEdu({ id: e.id, title: e.title, desc: e.desc, tag: e.tag });
                  return;
                }
              }
              markMessageRead(m.id);
            }}
            className={cn(
              "block w-full rounded-2xl border-2 p-4 text-left active:bg-muted/40",
              m.read ? "border-border bg-card" : "border-primary/40 bg-primary/5",
            )}
          >
            <div className="flex items-center gap-2">
              {!m.read && <span className="h-3 w-3 shrink-0 rounded-full bg-destructive" />}
              <div className="text-[19px] font-bold leading-snug">{m.title}</div>
            </div>
            <div className="mt-1.5 text-[17px] leading-relaxed text-muted-foreground">{m.body}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[16px] text-muted-foreground">{m.at}</span>
              {m.kind === "edu" && (
                <span className="flex items-center text-[17px] font-bold text-primary">
                  查看宣教
                  <ChevronRight className="h-5 w-5" />
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/** 宣教详情（大字适老） */
function EduDetailSheet({
  edu,
  onClose,
}: {
  edu: { id?: string; title: string; desc: string; tag: string };
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-[80] flex flex-col bg-background">
      <div className="flex items-center gap-2 border-b bg-card px-4 py-3">
        <button onClick={onClose} className="flex items-center gap-1 text-[18px] text-muted-foreground">
          <ArrowLeft className="h-6 w-6" />返回
        </button>
        <div className="flex-1 truncate text-center text-[20px] font-bold">宣教详情</div>
        <div className="w-14" />
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4 text-[18px] leading-relaxed">
        <div
          className="rounded-2xl p-4 text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          <span className="rounded-full bg-white/20 px-3 py-1 text-[16px] font-bold">必读 · {edu.tag}</span>
          <div className="mt-2 text-[24px] font-bold leading-snug">{edu.title}</div>
          <div className="mt-1.5 text-[17px] opacity-95">{edu.desc}</div>
        </div>
        <div className="flex h-44 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
          <PlayCircle className="h-16 w-16" />
        </div>
        <div className="space-y-2.5 rounded-2xl border bg-card p-4">
          <div className="text-[20px] font-bold">要点提示</div>
          <div>1. 请在护士或家属陪同下练习，避免独自下床。</div>
          <div>2. 每个动作缓慢完成，疼痛评分超过 4 分请暂停并告知护士。</div>
          <div>3. 观看后请点击下方按钮确认已读，医护可看到您的完成情况。</div>
        </div>
      </div>
      <div className="border-t bg-card p-4">
        <button
          onClick={() => {
            if (edu.id) markEduRead(edu.id);
            onClose();
          }}
          className="w-full rounded-full py-4 text-[20px] font-bold text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          我已阅读
        </button>
      </div>
    </div>
  );
}

function ColorSection({

  title,
  icon: Icon,
  bar,
  children,
}: {
  title: string;
  icon: React.ElementType;
  bar: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className={cn("flex items-center gap-2 px-4 py-3 text-[20px] font-bold text-white", bar)}>
        <Icon className="h-6 w-6" />
        {title}
      </div>
      <div className="space-y-2.5 p-3">{children}</div>
    </section>
  );
}


function categoryStyle(c: TodoItem["category"]) {
  switch (c) {
    case "运动":
      return { icon: Dumbbell, color: "text-sky-600 bg-sky-50" };
    case "宣教":
      return { icon: PlayCircle, color: "text-violet-600 bg-violet-50" };
    case "用药":
      return { icon: Pill, color: "text-rose-600 bg-rose-50" };
    case "饮食":
      return { icon: Soup, color: "text-amber-600 bg-amber-50" };
    case "复查":
      return { icon: AlertTriangle, color: "text-orange-600 bg-orange-50" };
  }
}

function TodoRow({ todo, onToggle }: { todo: TodoItem; onToggle: (id: string) => void }) {
  const { icon: Icon, color } = categoryStyle(todo.category);
  return (
    <button
      onClick={() => onToggle(todo.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98]",
        todo.done ? "border-success/30 bg-success/5" : "border-border bg-background",
      )}
    >
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[18px] font-bold",
              todo.done ? "text-muted-foreground line-through" : "text-foreground",
            )}
          >
            {todo.title}
          </span>
        </div>
        <div className="mt-0.5 text-[17px] text-muted-foreground">{todo.detail}</div>
        {todo.time && <div className="mt-0.5 text-[17px] text-primary">⏰ {todo.time}</div>}
      </div>
      {todo.done ? (
        <CheckCircle2 className="h-7 w-7 shrink-0 text-success" />
      ) : (
        <Circle className="h-7 w-7 shrink-0 text-muted-foreground/40" />
      )}
    </button>
  );
}

// ---------- 健康方案（住院 / 居家 展示同一套内容） ----------
function MeTab({
  mode,
  doneCount,
  total,
  patient,
  todos,
  onToggle,
}: {
  mode: Mode;
  doneCount: number;
  total: number;
  patient: PatientProfile;
  todos: TodoItem[];
  onToggle: (id: string) => void;
}) {
  const finished = todos.filter((t) => t.done);
  return (

    <div className="space-y-4 p-3">
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-[24px] font-bold text-primary">
          张
        </div>
        <div>
          <div className="text-[18px] font-bold">张建国</div>
          <div className="text-[17px] text-muted-foreground">
            68 岁 · 右膝关节置换术后 · 主管医生:王主任
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="连续打卡" value="12 天" />
        <Stat label="今日完成" value={`${doneCount}/${total}`} />
      </div>

      <div className="rounded-2xl border bg-card">
        {[
          { icon: User, label: "联系我的医生 / 治疗师" },
          { icon: PlayCircle, label: "宣教视频回看" },
          { icon: Bell, label: "用药 / 复查提醒设置" },
          { icon: ClipboardList, label: "我的康复档案" },
        ].map((it, i, arr) => (
          <button
            key={it.label}
            className={cn(
              "flex w-full items-center gap-3 p-4 text-left active:bg-muted/50",
              i < arr.length - 1 && "border-b",
            )}
          >
            <it.icon className="h-6 w-6 text-primary" />
            <span className="flex-1 text-[18px] font-medium">{it.label}</span>
            <span className="text-[17px] text-muted-foreground">›</span>
          </button>
        ))}
      </div>

      {/* 已完成任务 */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center gap-2 bg-success px-4 py-3 text-[20px] font-bold text-white">
          <CheckCircle2 className="h-6 w-6" />
          已完成
        </div>
        <div className="space-y-2.5 p-3">
          {finished.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <FileText className="h-10 w-10 opacity-40" />
              <span className="text-[17px]">暂无数据</span>
            </div>
          ) : (
            finished.map((t) => <TodoRow key={t.id} todo={t} onToggle={onToggle} />)
          )}
        </div>
      </section>

      {/* 疾病史 / 既往治疗 / 随访 */}
      <ColorSection title="疾病史" icon={FileText} bar="bg-orange-400">
        {patient.diseaseHistory.map((d) => (
          <div key={d.name} className="rounded-xl bg-muted/60 p-3.5">
            <div className="text-[18px] font-bold">疾病名称：{d.name}</div>
            <div className="mt-1 text-[17px]">诊断日期：{d.date}</div>
          </div>
        ))}
      </ColorSection>

      <ColorSection title="既往治疗情况" icon={History} bar="bg-emerald-400">
        {patient.pastTreatments.map((t) => (
          <div key={t.date} className="flex items-start gap-3 rounded-xl bg-muted/60 p-3.5">
            <span className="mt-2 h-4 w-4 shrink-0 rounded-full border-[3px] border-primary" />
            <div>
              <div className="text-[18px] font-bold">{t.date}</div>
              <div className="mt-0.5 text-[17px] text-muted-foreground">{t.note}</div>
            </div>
          </div>
        ))}
      </ColorSection>

      <ColorSection title="随访记录" icon={CalendarCheck} bar="bg-purple-400">
        {patient.followUps.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <FileText className="h-10 w-10 opacity-40" />
            <span className="text-[17px]">暂无数据</span>
          </div>
        ) : (
          patient.followUps.map((f) => (
            <div key={f.date} className="rounded-xl bg-muted/60 p-3.5 text-[17px]">
              {f.date} · {f.note}
            </div>
          ))
        )}
      </ColorSection>

      <div className="rounded-2xl bg-muted/60 p-4">
        <div className="flex items-center gap-2 text-[17px] text-muted-foreground">
          <Cigarette className="h-5 w-5" />
          不良生活方式：
        </div>
        <div className="mt-1 text-[19px] font-bold">{patient.lifestyleRisks.join("，")}</div>
      </div>

      <div className="px-2 text-center text-[17px] text-muted-foreground">
        当前模式:{mode === "inpatient" ? "院内陪护" : "居家康复"} · 数据已加密
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-[17px] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[22px] font-bold text-primary">{value}</div>
    </div>
  );
}

// ---------- 换菜弹层 ----------
function SwapDishSheet({
  dish,
  onClose,
  onPick,
}: {
  dish: Dish;
  onClose: () => void;
  onPick: (name: string) => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b bg-card px-3 py-3">
        <button onClick={onClose} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-[19px] font-bold">更换菜品</div>
        <div className="w-5" />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl bg-muted p-3 text-[17px]">
          当前:<b>{dish.name}</b>
        </div>
        <div className="mt-3 text-[17px] font-bold text-muted-foreground">为您推荐</div>
        <div className="mt-2 space-y-2">
          {dish.alternates.map((a) => (
            <button
              key={a}
              onClick={() => onPick(a)}
              className="flex w-full items-center justify-between rounded-2xl border bg-card p-4 text-left active:bg-muted/50"
            >
              <div>
                <div className="text-[19px] font-bold">{a}</div>
                <div className="mt-0.5 text-[17px] text-muted-foreground">药食同源 · 营养均衡</div>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-[17px] font-bold text-primary-foreground">
                选它
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- 骨灵 ----------
function PathSheet({
  stages,
  currentStageIdx,
  onClose,
}: {
  stages: { key: string; label: string }[];
  currentStageIdx: number;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b bg-card px-3 py-3">
        <button onClick={onClose} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-[19px] font-bold">我的完整住院路径</div>
        <div className="w-5" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* 进度概览 */}
        <div
          className="mt-3 rounded-2xl border bg-card p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-baseline justify-between">
            <div className="text-[17px] font-bold text-foreground">
              当前：{stages[currentStageIdx]?.label}
            </div>
            <div className="text-[17px] font-bold text-primary">
              第 {currentStageIdx + 1} / {stages.length} 步
            </div>
          </div>
          <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((currentStageIdx + 1) / stages.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 步骤列表 */}
        <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
          {stages.map((s, idx) => {
            const done = idx < currentStageIdx;
            const active = idx === currentStageIdx;
            const last = idx === stages.length - 1;
            return (
              <div
                key={s.key}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3",
                  !last && "border-b",
                  active && "bg-primary/5",
                )}
              >
                {/* 竖向连线 */}
                {!last && (
                  <div className="absolute left-[31px] top-[38px] bottom-0 w-0.5 bg-border" />
                )}
                {idx > 0 && <div className="absolute left-[31px] top-0 h-[14px] w-0.5 bg-border" />}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[17px] font-bold",
                    done && "bg-success text-success-foreground",
                    active && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                    !done && !active && "border bg-background text-muted-foreground",
                  )}
                >
                  {done ? <CheckCircle2 className="h-4.5 w-4.5" /> : idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-[18px] font-bold leading-snug",
                      active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[16px] font-bold",
                    active && "bg-primary text-primary-foreground",
                    done && "bg-success/12 text-success",
                    !done && !active && "bg-muted text-muted-foreground",
                  )}
                >
                  {active ? "进行中" : done ? "已完成" : "待进行"}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-3 px-1 text-[17px] leading-relaxed text-muted-foreground">
          路径由医护团队根据您的手术与恢复情况自动更新，无需手动填写。
        </p>
      </div>

    </div>
  );
}

// ---------- 新用户使用引导 ----------
const GUIDE_STEPS = [
  {
    icon: Camera,
    title: "第 1 步 · 档案上传",
    desc: "拍照上传出院小结 / 病历，OCR 自动识别",
    action: "去拍照",
  },
  {
    icon: ClipboardList,
    title: "第 2 步 · 风险评估",
    desc: "填写专病量表，AI 结合档案生成风险报告",
    action: "去填写",
  },
  {
    icon: HeartPulse,
    title: "第 3 步 · 查看健康方案",
    desc: "在「安家在护」中查看专属健康方案",
    action: "去查看",
  },
] as const;

function GuideSheet({
  step,
  onSkip,
  onAction,
}: {
  step: 1 | 2 | 3;
  onSkip: () => void;
  onAction: () => void;
}) {
  const cfg = GUIDE_STEPS[step - 1];
  const Icon = cfg.icon;
  return (
    <div className="z-50">
      <div
        className="flex items-center gap-2.5 rounded-2xl bg-card px-3 py-2.5 shadow-2xl ring-1 ring-primary/25"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[15px] font-bold text-primary-foreground">
              {step}/3
            </span>
            <span className="truncate text-[18px] font-bold">{cfg.title.replace(/^第 \d 步 · /, "")}</span>
          </div>
          <div className="truncate text-[16px] text-muted-foreground">{cfg.desc}</div>
        </div>
        <button
          onClick={onAction}
          className="flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[17px] font-bold text-white active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #1677d2, #0b62c4)" }}
        >
          {cfg.action}
          <ChevronRight className="h-4 w-4" />
        </button>
        <button onClick={onSkip} aria-label="关闭引导" className="shrink-0 text-muted-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}


// ---------- 第 1 步：完善健康档案（拍照上传） ----------
function ArchiveUploadSheet({ onClose }: { onClose: () => void }) {
  const [uploaded, setUploaded] = useState(0);
  const progress = Math.min(62 + uploaded * 15, 100);
  const cards = [
    { label: "化验单", sub: "已识别 3", tone: "ok" },
    { label: "用药", sub: "已识别 2", tone: "ok" },
    { label: "既往病史", sub: "待上传", tone: "todo" },
    { label: "身份证", sub: "待上传", tone: "todo" },
  ];
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b bg-card px-3 py-3">
        <button onClick={onClose} className="text-muted-foreground" aria-label="返回">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="text-[20px] font-bold">完善健康档案</div>
        <div className="w-6" />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <section className="rounded-2xl border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[17px] font-bold text-primary">AI 建档 · 拍一拍</div>
              <div className="mt-1 text-[22px] font-bold leading-tight">
                拍照上传化验单 / 用药盒 / 既往病历
              </div>
              <div className="mt-1.5 text-[17px] text-muted-foreground">
                AI 自动识别并归档，主诊医生随访前即可查看
              </div>
            </div>
            <button
              onClick={() => setUploaded((n) => n + 1)}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lg active:scale-95"
              aria-label="拍照上传"
            >
              <Camera className="h-7 w-7" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-[17px]">
            <span className="text-muted-foreground">健康档案完成度</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {cards.map((c) => (
              <div
                key={c.label}
                className={cn(
                  "relative rounded-xl border p-3 text-center",
                  c.tone === "ok"
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-amber-200 bg-amber-50/70",
                )}
              >
                {c.tone === "todo" && (
                  <span className="absolute -right-1 -top-2 rounded-md bg-destructive px-1.5 py-0.5 text-[16px] font-bold text-destructive-foreground">
                    必填
                  </span>
                )}
                <div className="text-[18px] font-bold">{c.label}</div>
                <div
                  className={cn(
                    "mt-0.5 text-[17px]",
                    c.tone === "ok" ? "text-emerald-700" : "text-amber-700",
                  )}
                >
                  {c.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl bg-primary/10 p-4 text-[17px] leading-relaxed">
          <span className="font-bold text-primary">AI 归档摘要 </span>· 共 5 份材料已识别，请补充必填项
          <b> 既往病史、身份证</b>，以便档案更完整。
        </div>

        <section>
          <div className="flex items-end justify-between">
            <div className="text-[22px] font-bold">历史上传</div>
            <div className="text-[17px] text-muted-foreground">共 6 项</div>
          </div>
          <div className="mt-2 space-y-2.5">
            {[
              { tag: "化验单", name: "生化全套 · 2026-07-10", sub: "空腹血糖 6.8 · HbA1c 7.2%", ago: "3 天前" },
              { tag: "用药", name: "钙尔奇 D · 2026-07-08", sub: "每日 1 片 · 餐后", ago: "5 天前" },
            ].map((r) => (
              <div key={r.name} className="flex items-start gap-3 rounded-2xl border bg-card p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[17px]">{r.tag}</span>
                    <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[17px] text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      已识别
                    </span>
                  </div>
                  <div className="mt-1 text-[19px] font-bold">{r.name}</div>
                  <div className="text-[17px] text-muted-foreground">{r.sub}</div>
                  <div className="mt-0.5 text-[17px] text-muted-foreground">⏱ {r.ago}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t bg-card p-3">
        <button
          onClick={onClose}
          className="w-full rounded-full py-3.5 text-[20px] font-bold text-white shadow-lg active:scale-[0.99]"
          style={{ background: "linear-gradient(135deg, #1677d2, #0b62c4)" }}
        >
          上传完成，下一步
        </button>
      </div>
    </div>
  );
}

// ---------- 第 2 步：专病量表 ----------
const SCALE_QUESTIONS = [
  { q: "近一周患侧关节疼痛程度", options: ["无痛", "轻度", "中度", "重度"] },
  { q: "关节活动时是否有明显僵硬", options: ["没有", "偶尔", "经常", "持续"] },
  { q: "日常行走能力", options: ["正常行走", "需扶拐", "需搀扶", "无法行走"] },
  { q: "上下楼梯是否困难", options: ["不困难", "轻度困难", "较困难", "无法完成"] },
  { q: "夜间是否因疼痛醒来", options: ["从不", "偶尔", "经常", "每晚"] },
];

function ScaleSheet({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const doneCount = Object.keys(answers).length;
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b bg-card px-3 py-3">
        <button onClick={onClose} className="text-muted-foreground" aria-label="返回">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="text-[20px] font-bold">专病评估量表</div>
        <div className="w-6" />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div
          className="rounded-2xl p-4 text-white"
          style={{ background: "linear-gradient(135deg, #1677d2, #0b62c4)" }}
        >
          <div className="text-[20px] font-bold">膝 / 肩专病功能量表</div>
          <div className="mt-1 text-[17px] opacity-95">
            共 {SCALE_QUESTIONS.length} 题 · 已填 {doneCount} 题，AI 将结合档案生成风险报告
          </div>
        </div>

        {SCALE_QUESTIONS.map((item, i) => (
          <section key={item.q} className="rounded-2xl border bg-card p-4">
            <div className="text-[19px] font-bold">
              {i + 1}. {item.q}
            </div>
            <div className="mt-3 space-y-2">
              {item.options.map((o, oi) => {
                const picked = answers[i] === oi;
                return (
                  <button
                    key={o}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-[18px] active:scale-[0.99]",
                      picked ? "border-primary bg-primary/5 font-bold text-primary" : "bg-background",
                    )}
                  >
                    {o}
                    {picked ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="border-t bg-card p-3">
        <button
          onClick={onSubmit}
          className="w-full rounded-full py-3.5 text-[20px] font-bold text-white shadow-lg active:scale-[0.99]"
          style={{ background: "linear-gradient(135deg, #1677d2, #0b62c4)" }}
        >
          提交量表
        </button>
      </div>
    </div>
  );
}
