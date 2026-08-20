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
  const [status, setStatus] = useState<PatientProfile["status"]>(PATIENT.status);
  const mode = detectMode(status);
  const [tab, setTab] = useState<TabKey>("home");
  const [admissionUploaded, setAdmissionUploaded] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>(INPATIENT_TODOS);
  const [homeTodos, setHomeTodos] = useState<TodoItem[]>(HOME_TODOS);
  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
  const [aiOpen, setAiOpen] = useState(false);
  const [swapDish, setSwapDish] = useState<Dish | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // 新用户使用引导（1/3 ~ 3/3）
  const [guideStep, setGuideStep] = useState<1 | 2 | 3 | null>(1);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [scaleOpen, setScaleOpen] = useState(false);


  const currentTodos = mode === "inpatient" ? todos : homeTodos;
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
    { key: "ai", label: "骨灵大模型", icon: Sparkles },
    { key: "plan", label: "方案", icon: ClipboardList },
    { key: "me", label: "我的", icon: User },
  ];

  return (
    <PhoneShell
      title="骨安 · 患者端"
      subtitle={`${mode === "inpatient" ? "住院版" : "门诊版"} · 自动识别 · 大字适老`}
      overlay={
        guideStep && !archiveOpen && !scaleOpen ? (
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
        ) : null
      }
      bottom={
        <TabBar
          items={tabItems}
          activeKey={tab}
          onChange={(k) => {
            if (k === "ai") {
              setAiOpen(true);
              return;
            }
            setTab(k as TabKey);
          }}
        />
      }
    >

      <div className="relative pb-24 text-[17px] leading-relaxed">
        {/* 自动识别版本提示（不再让老人手动切换） */}
        <div className="sticky top-0 z-10 border-b bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              {mode === "inpatient" ? <Stethoscope className="h-6 w-6" /> : <Home className="h-6 w-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[19px] font-bold">
                {mode === "inpatient" ? "住院版" : "门诊 / 居家版"}
              </div>
              <div className="text-[14px] text-muted-foreground">
                已根据您的就诊状态自动为您切换
              </div>
            </div>
            <button
              onClick={() => setStatus(mode === "inpatient" ? "outpatient" : "post-op")}
              className="shrink-0 rounded-full border px-3 py-2 text-[13px] text-muted-foreground active:bg-muted"
            >
              演示切换
            </button>
          </div>
        </div>

        {tab === "home" && (
          <HomeTab
            mode={mode}
            patient={PATIENT}
            stages={stages as unknown as { key: string; label: string }[]}
            currentStageIdx={currentStageIdx}
            admissionUploaded={admissionUploaded}
            onUpload={() => {
              setAdmissionUploaded(true);
              showToast("入院单上传成功");
            }}
            todos={currentTodos}
            onToggle={toggleTodo}
            onAskAI={() => setAiOpen(true)}
          />
        )}

        {tab === "plan" && (
          <PlanTab
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

        {/* AI 弹层 */}
        {aiOpen && <BoneAISheet onClose={() => setAiOpen(false)} />}

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
          <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-full bg-foreground/90 px-4 py-2.5 text-[15px] font-medium text-background shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </PhoneShell>
  );
}


// ---------- 首页 ----------
function HomeTab({
  mode,
  patient,
  stages,
  currentStageIdx,
  admissionUploaded,
  onUpload,
  todos,
  onToggle,
  onAskAI,
  onOpenScale,
}: {
  mode: Mode;
  patient: PatientProfile;
  stages: { key: string; label: string }[];
  currentStageIdx: number;
  admissionUploaded: boolean;
  onUpload: () => void;
  todos: TodoItem[];
  onToggle: (id: string) => void;
  onAskAI: () => void;
  onOpenScale: () => void;
}) {
  const currentStage = stages[currentStageIdx];
  const [pathOpen, setPathOpen] = useState(false);
  const doing = todos.filter((t) => !t.done);
  const finished = todos.filter((t) => t.done);

  return (
    <div className="space-y-4 p-3">
      {/* 患者信息卡（住院版） */}
      {mode === "inpatient" && (
        <div
          className="rounded-2xl p-4 text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-[24px] font-bold backdrop-blur">
              {patient.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="text-[26px] font-bold leading-tight">{patient.name}</div>
              <div className="mt-1 text-[16px] opacity-95">
                性别：{patient.gender}　年龄：{patient.age}岁
              </div>
              <div className="text-[15px] opacity-90">出生日期：{patient.birthday}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2.5 text-[16px] backdrop-blur">
            <MapPin className="h-5 w-5 shrink-0" />
            当前阶段：<b className="text-[18px]">{currentStage.label}</b>
          </div>
          <div className="mt-2 text-[14px] opacity-90">{patient.hospital} · 关节外科</div>
        </div>
      )}

      {/* ===== 院内版专属：入院单上传 + 住院路径 ===== */}
      {mode === "inpatient" && (
        <>
          <button
            onClick={admissionUploaded ? undefined : onUpload}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl border-2 border-dashed p-4 text-left",
              admissionUploaded ? "border-success bg-success/5" : "border-primary/50 bg-primary/5",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl",
                  admissionUploaded ? "bg-success text-white" : "bg-primary text-white",
                )}
              >
                {admissionUploaded ? <CheckCircle2 className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
              </div>
              <div>
                <div className="text-[19px] font-bold">
                  {admissionUploaded ? "入院单已上传" : "上传入院单"}
                </div>
                <div className="text-[15px] text-muted-foreground">
                  {admissionUploaded ? "护士已收到，正在为您办理" : "拍照上传，护士为您预办入院"}
                </div>
              </div>
            </div>
            {!admissionUploaded && <Camera className="h-7 w-7 text-primary" />}
          </button>

          <section className="rounded-2xl border bg-card p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[18px] font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                我的住院进度
              </div>
              <span className="text-[15px] text-muted-foreground">
                第 {currentStageIdx + 1} / {stages.length} 阶段
              </span>
            </div>

            <button
              onClick={() => setPathOpen(true)}
              className="flex w-full items-center justify-between rounded-xl bg-primary/5 p-3 text-left active:bg-primary/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-[20px] font-bold text-white shadow-sm">
                  {currentStageIdx + 1}
                </div>
                <div>
                  <div className="text-[15px] text-muted-foreground">当前所处阶段</div>
                  <div className="text-[22px] font-bold text-foreground">{currentStage.label}</div>
                </div>
              </div>
              <div className="flex flex-col items-center text-primary">
                <span className="text-[13px] font-medium">查看完整路径</span>
                <ChevronRight className="h-6 w-6" />
              </div>
            </button>
          </section>

          {pathOpen && (
            <PathSheet
              stages={stages}
              currentStageIdx={currentStageIdx}
              onClose={() => setPathOpen(false)}
            />
          )}
        </>
      )}

      {/* ===== 居家版专属：AI 主治医生 + 今日打卡轮播 + 咨询 + 评估中心 ===== */}
      {mode === "home" && (
        <>
          <HomeHeroCard
            patient={patient}
            todos={todos}
            onToggle={onToggle}
            onAskAI={onAskAI}
            onScan={onUpload}
          />

          <div className="flex gap-3">
            <button className="flex flex-1 items-center gap-3 rounded-2xl border bg-card p-4 text-left active:bg-muted/40">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[19px] font-bold leading-snug">咨询关节外科医生？</div>
                <div className="mt-0.5 text-[16px] leading-snug text-muted-foreground">
                  选择主任 / 主治医生 1v1 · 住院期间锁定主管医护
                </div>
              </div>
            </button>
            <button className="relative flex w-[92px] shrink-0 flex-col items-center justify-center rounded-2xl border bg-card p-3 active:bg-muted/40">
              <Bell className="h-7 w-7 text-primary" />
              <span className="mt-1 text-[17px] font-bold">消息</span>
              <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-[13px] font-bold text-white">
                3
              </span>
            </button>
          </div>

          {/* 评估中心 */}
          <section className="rounded-2xl border bg-card p-3">
            <div className="flex items-center">
              <div className="text-[21px] font-bold">评估中心</div>
              <button
                onClick={onOpenScale}
                className="ml-auto flex items-center text-[17px] font-medium text-primary"
              >
                全部 12 项
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2.5 rounded-2xl border p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-destructive/10 px-2 py-1 text-[15px] font-bold text-destructive">
                  待完成 7
                </span>
                <span className="text-[16px] text-muted-foreground">已填 5/12 项</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[20px] font-bold">骨灵智慧大脑</div>
                  <div className="mt-1 text-[16px] leading-snug text-muted-foreground">
                    7 题 · 约 3 分钟，完成后同步主诊医生
                  </div>
                </div>
                <button
                  onClick={onOpenScale}
                  className="shrink-0 rounded-full bg-primary px-5 py-3 text-[18px] font-bold text-primary-foreground"
                >
                  去填写
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ===== 住院版：我的任务 ===== */}
      {mode === "inpatient" && (
        <section className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center justify-between bg-teal-500 px-4 py-3 text-white">
            <div className="flex items-center gap-2 text-[20px] font-bold">
              <Bell className="h-6 w-6" />
              我的任务
            </div>
            <div className="text-[16px]">
              {finished.length}/{todos.length}
            </div>
          </div>
          <div className="space-y-2.5 p-3">
            {doing.length === 0 && (
              <div className="py-4 text-center text-[16px] text-muted-foreground">今日任务已全部完成 🎉</div>
            )}
            {doing.map((t) => (
              <TodoRow key={t.id} todo={t} onToggle={onToggle} />
            ))}
          </div>
        </section>
      )}

      {/* ===== 宣教：健康百科 ===== */}
      <EduSection />

      {/* ===== 健康服务包 ===== */}
      <section className="overflow-hidden rounded-2xl border bg-card p-3">
        <div className="mb-2.5 flex items-center gap-2">
          <div className="text-[20px] font-bold">骨安健康服务包</div>

          <button className="ml-auto flex items-center text-[16px] font-medium text-primary">
            全部服务
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          className="relative w-full overflow-hidden rounded-2xl p-4 text-left text-white active:scale-[0.99]"
          style={{ background: "linear-gradient(135deg, #1677d2, #0b62c4)" }}
        >
          <div className="flex items-center gap-2 text-[16px] opacity-95">
            <Sparkles className="h-5 w-5" />
            骨科医生 &amp; 营养师联合甄选
          </div>
          <div className="mt-2 text-[24px] font-bold">骨安健康服务包</div>
          <div className="mt-1 text-[16px] opacity-90">营养餐 · 专病服务包 · 院内可对接</div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1.5 text-[15px] backdrop-blur">
              已为 12,488 位骨友服务
            </span>
            <span className="flex items-center text-[17px] font-bold">
              查看服务
              <ChevronRight className="h-5 w-5" />
            </span>
          </div>
        </button>
      </section>


      {/* 骨灵大模型快捷入口 */}
      <button
        onClick={onAskAI}
        className="flex w-full items-center gap-3 rounded-2xl p-4 text-left text-white active:scale-[0.99]"
        style={{ background: "linear-gradient(135deg, #f97316, #e11d48)" }}
      >
        <Sparkles className="h-8 w-8 shrink-0" />
        <div>
          <div className="text-[20px] font-bold">问问骨灵大模型</div>
          <div className="text-[15px] opacity-95">可以说话提问，随时解答康复疑问</div>
        </div>
      </button>
    </div>
  );
}

function QuickCard({
  icon: Icon,
  title,
  desc,
  tint,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  tint: string;
}) {
  return (
    <button className="rounded-2xl border bg-card p-4 text-left active:bg-muted/50">
      <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl", tint)}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="mt-2.5 text-[19px] font-bold">{title}</div>
      <div className="text-[15px] text-muted-foreground">{desc}</div>
    </button>
  );
}

// ---------- 宣教：健康百科 ----------
type EduKind = "视频" | "图文" | "直播";
const EDU_FILTERS: ("全部" | EduKind)[] = ["全部", "视频", "图文", "直播"];
const EDU_ITEMS: {
  id: string;
  kind: EduKind;
  title: string;
  tag: string;
  tagTint: string;
  author: string;
  tint: string;
  icon: React.ElementType;
}[] = [
  {
    id: "e1",
    kind: "视频",
    title: "膝关节置换术后如何正确做直腿抬高",
    tag: "必读",
    tagTint: "bg-sky-50 text-sky-700",
    author: "康复治疗师 · 王老师",
    tint: "from-teal-400 to-emerald-500",
    icon: Dumbbell,
  },
  {
    id: "e2",
    kind: "图文",
    title: "骨关节炎患者 5 款高钙护骨家常菜",
    tag: "食谱",
    tagTint: "bg-emerald-50 text-emerald-700",
    author: "营养师 · 李老师",
    tint: "from-amber-400 to-orange-500",
    icon: Soup,
  },
  {
    id: "e3",
    kind: "直播",
    title: "本周四 20:00 · 骨质疏松与跌倒预防公开课",
    tag: "预约",
    tagTint: "bg-orange-50 text-orange-700",
    author: "主任医师 · 张主任",
    tint: "from-sky-400 to-indigo-500",
    icon: HeartPulse,
  },
  {
    id: "e4",
    kind: "图文",
    title: "术后拐杖、助行器怎么用才安全不摔倒",
    tag: "护理",
    tagTint: "bg-violet-50 text-violet-700",
    author: "骨科专科护士 · 赵老师",
    tint: "from-rose-400 to-pink-500",
    icon: MapPin,
  },
];

function EduSection() {
  const [filter, setFilter] = useState<"全部" | EduKind>("全部");
  const list = EDU_ITEMS.filter((i) => filter === "全部" || i.kind === filter);
  return (
    <section className="overflow-hidden rounded-2xl border bg-card p-3">
      <div className="flex items-center gap-2">
        <div className="text-[20px] font-bold">健康百科</div>
        <button className="ml-auto flex items-center text-[16px] font-medium text-primary">
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
              "shrink-0 rounded-full border px-4 py-2 text-[16px] font-medium",
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
                <span className="absolute left-1 top-1 rounded-md bg-black/45 px-1.5 py-0.5 text-[13px] font-bold backdrop-blur">
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
                    className={cn("rounded-md px-2 py-0.5 text-[14px] font-bold", it.tagTint)}
                  >
                    {it.tag}
                  </span>
                  <span className="truncate text-[15px] text-muted-foreground">{it.author}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
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
        <div className="mt-0.5 text-[16px] text-muted-foreground">{todo.detail}</div>
        {todo.time && <div className="mt-0.5 text-[15px] text-primary">⏰ {todo.time}</div>}
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
const PLAN_DAYS = ["06/11", "06/12", "06/13", "06/14"];
const PLAN_MACROS = [
  { label: "碳水化合物", value: "177.3 g", dot: "bg-amber-400" },
  { label: "脂肪", value: "43.4 g", dot: "bg-blue-600" },
  { label: "蛋白质", value: "78.6 g", dot: "bg-sky-400" },
];

function PlanTab({
  mode,
  rehab,
  dishes,
  onSwap,
  onSyncToTodo,
}: {
  mode: Mode;
  rehab: RehabPlan;
  dishes: Dish[];
  onSwap: (d: Dish) => void;
  onSyncToTodo: () => void;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [dietTab, setDietTab] = useState<"营养方案" | "药食同源">("营养方案");
  const [day, setDay] = useState(0);
  const [riskOpen, setRiskOpen] = useState(true);
  const [doneEx, setDoneEx] = useState<number[]>([0]);

  const meals: Dish["meal"][] = ["早餐", "午餐", "晚餐", "加餐"];
  const exDone = doneEx.length;

  return (
    <div className="space-y-4 p-3">
      {/* 开通状态预览切换 */}
      <div className="flex gap-2 rounded-full bg-muted p-1">
        {[false, true].map((v) => (
          <button
            key={String(v)}
            onClick={() => setUnlocked(v)}
            className={cn(
              "flex-1 rounded-full py-2.5 text-[17px] font-bold",
              unlocked === v ? "bg-foreground text-background" : "text-muted-foreground",
            )}
          >
            {v ? "已开通预览" : "未开通预览"}
          </button>
        ))}
      </div>

      {/* 个人健康画像 */}
      <button className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left active:bg-muted/40">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <User className="h-6 w-6" />
        </div>
        <div className="text-[18px] text-muted-foreground">个人健康画像</div>
        <span className="ml-auto flex items-center text-[18px] font-bold text-primary">
          我的健康档案
          <ChevronRight className="h-5 w-5" />
        </span>
      </button>

      {/* 报告 / 方案 双卡 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: FileText, title: "专病体检报告", desc: "风险结论 · 最需关注问题 · 就医建议", link: "查看报告" },
          { icon: ClipboardList, title: "健康管理方案", desc: "用药 · 营养 · 运动 · 监测随访", link: "查看方案" },
        ].map((c) => (
          <button key={c.title} className="rounded-2xl border bg-card p-4 text-left active:bg-muted/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <c.icon className="h-6 w-6" />
            </div>
            <div className="mt-2.5 text-[19px] font-bold leading-snug">{c.title}</div>
            <div className="mt-1 text-[15px] leading-snug text-muted-foreground">{c.desc}</div>
            <span className="mt-2 flex items-center text-[16px] font-bold text-primary">
              {c.link}
              <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>

      {/* 专病服务包 · 风险识别 */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div
          className="flex items-start justify-between p-4 text-white"
          style={{ background: "linear-gradient(90deg, #dc2626, #ea580c)" }}
        >
          <div>
            <div className="text-[20px] font-bold">骨关节管理服务包</div>
            <div className="mt-1 flex items-center gap-1.5 text-[16px] opacity-95">
              <AlertTriangle className="h-4 w-4" />
              系统识别：术后并发症风险偏高
            </div>
          </div>
          <button
            onClick={() => setRiskOpen((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {riskOpen && (
          <div className="space-y-3 p-3">
            <div className="rounded-2xl bg-destructive/5 p-3">
              <div className="flex items-end justify-between">
                <span className="text-[19px] font-bold text-destructive">关节僵硬 / 跌倒风险</span>
                <span className="text-[28px] font-bold leading-none text-destructive">72%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-destructive/15">
                <div className="h-full w-[72%] rounded-full bg-destructive" />
              </div>
              <div className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
                依据：术后屈膝 60° · 股四头肌力 3 级 · 久坐 · 抽烟。若不规范康复，未来关节活动受限风险将增加{" "}
                <b className="text-destructive underline">3.6 倍</b>，年均额外医疗支出或超{" "}
                <b className="text-destructive">¥9,800</b>。
              </div>
            </div>

            <div className="rounded-2xl border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[18px] font-bold">
                  <Sparkles className="h-5 w-5 text-primary" />
                  升级您的健康方案
                </div>
                <span className="text-[15px] text-muted-foreground">逐项对比</span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-[16px]">
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="font-bold">通用方案 · 免费</div>
                  <div className="mt-1.5 space-y-1 text-muted-foreground">
                    <div>通用康复动作</div>
                    <div>通用饮食建议</div>
                    <div>自助打卡</div>
                  </div>
                </div>
                <div className="rounded-xl bg-primary/5 p-3">
                  <div className="font-bold text-primary">专属跟踪</div>
                  <div className="mt-1.5 space-y-1 text-foreground">
                    <div>治疗师 1v1 调整</div>
                    <div>药食同源定制餐</div>
                    <div>异常自动预警</div>
                  </div>
                </div>
              </div>
              {!unlocked && (
                <button className="mt-3 w-full rounded-xl bg-primary py-3 text-[18px] font-bold text-primary-foreground">
                  立即开通专属方案
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 饮食方案 */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <div className="text-[21px] font-bold">
              {unlocked ? "专属饮食方案" : "通用饮食方案"}
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[14px] font-bold text-muted-foreground">
              {unlocked ? "专属方案 · 已开通" : "通用方案 · 免费"}
            </span>
            <Soup className="ml-auto h-7 w-7 text-emerald-600" />
          </div>
          <div className="mt-1 text-[16px] text-muted-foreground">
            基于骨科术后营养指南与药食同源建议
          </div>
        </div>

        {/* 营养方案 / 药食同源 */}
        <div className="flex border-b">
          {(["营养方案", "药食同源"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDietTab(t)}
              className={cn(
                "flex-1 py-3 text-[18px] font-bold",
                dietTab === t
                  ? "border-b-[3px] border-primary text-primary"
                  : "text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-3 p-3">
          <div className="text-center text-[17px]">
            当前您执行的是 <b className="text-warning">{dietTab}</b>
          </div>
          <div className="flex items-center justify-between text-[17px]">
            <span>
              用餐时间：<b>07:30 - 18:00</b>
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[15px] font-bold text-primary">
              已选择该方案
            </span>
          </div>

          {/* 热量环 + 三大营养素 */}
          <div className="flex items-center gap-4">
            <div
              className="relative flex h-[110px] w-[110px] shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  "conic-gradient(#fb923c 0turn 0.55turn, #1d4ed8 0.55turn 0.72turn, #38bdf8 0.72turn 1turn)",
              }}
            >
              <div className="flex h-[82px] w-[82px] flex-col items-center justify-center rounded-full bg-card">
                <span className="text-[20px] font-bold leading-none">1434</span>
                <span className="text-[14px] text-muted-foreground">Kcal</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {PLAN_MACROS.map((m) => (
                <div key={m.label} className="flex items-center gap-2 text-[17px]">
                  <span className={cn("h-2.5 w-2.5 rounded-full", m.dot)} />
                  <span className="font-medium">{m.label}</span>
                  <span className="ml-auto text-muted-foreground">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 日期 */}
          <div className="flex gap-2 overflow-x-auto">
            {PLAN_DAYS.map((d, i) => (
              <button
                key={d}
                onClick={() => setDay(i)}
                className={cn(
                  "shrink-0 px-3 pb-1.5 text-[19px] font-bold",
                  i === day
                    ? "border-b-[3px] border-primary text-primary"
                    : "text-muted-foreground",
                )}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={() => dishes[0] && onSwap(dishes[0])}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-3.5 text-[19px] font-bold text-primary active:bg-primary/15"
          >
            <RefreshCw className="h-5 w-5" />
            不想吃全部换
          </button>

          <div className="flex items-start gap-1.5 text-[15px] leading-snug text-muted-foreground">
            <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>带标记的食谱包含卫健委公布的药食同源药材，点击查看功效</span>
          </div>

          {/* 各餐 */}
          {meals.map((m) => {
            const list = dishes.filter((d) => d.meal === m);
            if (!list.length) return null;
            return (
              <div key={m} className="rounded-2xl bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-[19px] font-bold">
                  {m}
                  <span className="text-[15px] font-normal text-muted-foreground">
                    约 {m === "加餐" ? 180 : 430} 千卡 · 推荐结构
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                  {list.map((d) => (
                    <div key={d.id} className="rounded-xl border bg-card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[19px] font-bold leading-snug">{d.name}</div>
                          <div className="mt-1 text-[16px] text-muted-foreground">💚 {d.benefit}</div>
                        </div>
                        <button
                          onClick={() => onSwap(d)}
                          className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-3 py-2 text-[15px] font-bold"
                        >
                          <RefreshCw className="h-4 w-4" />
                          更换
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 今日运动 */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="bg-sky-50 p-4">
          <div className="flex items-center gap-2">
            <div className="text-[21px] font-bold">今日运动</div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[14px] font-bold text-muted-foreground">
              {unlocked ? "专属方案" : "通用方案 · 免费"}
            </span>
            <HeartPulse className="ml-auto h-7 w-7 text-sky-600" />
          </div>
          <div className="mt-1 text-[16px] text-muted-foreground">{rehab.title} · {rehab.goal}</div>
        </div>

        <div className="space-y-3 p-3">
          <div className="rounded-2xl border p-3">
            <div className="flex items-center justify-between text-[17px]">
              <span className="text-muted-foreground">今日打卡进度</span>
              <span className="text-muted-foreground">完成度</span>
            </div>
            <div className="mt-1 flex items-end justify-between">
              <span className="text-[24px] font-bold">
                {exDone}
                <span className="text-[17px] text-muted-foreground"> / {rehab.exercises.length} 项</span>
              </span>
              <span className="text-[22px] font-bold text-primary">
                {Math.round((exDone / rehab.exercises.length) * 100)}%
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(exDone / rehab.exercises.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-destructive/5 p-3 text-[17px]">
            <span className="font-bold text-destructive">⚠ 运动风险提示：</span>
            <span className="text-muted-foreground">
              出现剧烈疼痛、关节肿胀或头晕请立即停止并联系医护
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl border p-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Activity className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[18px] font-bold">授权微信步数</div>
              <div className="text-[15px] text-muted-foreground">同步每日步数，自动计入运动量</div>
            </div>
            <button className="shrink-0 rounded-full bg-emerald-600 px-4 py-2.5 text-[16px] font-bold text-white">
              立即授权
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-[19px] font-bold">今日运动清单</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[15px] font-bold text-primary">
              {rehab.exercises.length} 项
            </span>
            <span className="ml-auto flex items-center text-[16px] font-medium text-primary">
              打卡记录
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>

          {rehab.exercises.map((e, i) => {
            const done = doneEx.includes(i);
            return (
              <button
                key={i}
                onClick={() =>
                  setDoneEx((arr) => (arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]))
                }
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-left",
                  done ? "border-success/40 bg-success/5" : "bg-background",
                )}
              >
                <div className="flex h-[70px] w-[92px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                  <PlayCircle className="h-8 w-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[19px] font-bold leading-snug">{e.name}</div>
                  <div className="mt-1 text-[16px] text-muted-foreground">{e.dose}</div>
                  <div className="mt-1 text-[15px] text-primary">
                    {done ? "已完成打卡" : "点击完成打卡"}
                  </div>
                </div>
                {done ? (
                  <CheckCircle2 className="h-7 w-7 shrink-0 text-success" />
                ) : (
                  <Circle className="h-7 w-7 shrink-0 text-muted-foreground/40" />
                )}
              </button>
            );
          })}

          <Section icon={AlertTriangle} title="注意事项" tint="bg-orange-50 text-orange-700">
            {rehab.cautions.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[17px]">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                <span>{c}</span>
              </div>
            ))}
          </Section>
        </div>
      </section>

      <button
        onClick={onSyncToTodo}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[19px] font-bold text-primary-foreground shadow-lg active:scale-[0.98]"
      >
        <CheckCircle2 className="h-5 w-5" />
        一键同步为今日打卡待办
      </button>

      <div className="pb-2 text-center text-[14px] text-muted-foreground">
        {mode === "inpatient" ? "住院版" : "居家版"} · 方案内容一致，按当前阶段自动更新
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  tint,
  children,
}: {
  icon: React.ElementType;
  title: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tint)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-[19px] font-bold">{title}</div>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

// ---------- 我的 ----------
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
          <div className="text-[16px] text-muted-foreground">
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
            <span className="text-[16px] text-muted-foreground">›</span>
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
              <span className="text-[16px]">暂无数据</span>
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
            <span className="mt-2 h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-primary" />
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
            <span className="text-[16px]">暂无数据</span>
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
        <div className="flex items-center gap-2 text-[16px] text-muted-foreground">
          <Cigarette className="h-5 w-5" />
          不良生活方式：
        </div>
        <div className="mt-1 text-[19px] font-bold">{patient.lifestyleRisks.join("，")}</div>
      </div>

      <div className="px-2 text-center text-[15px] text-muted-foreground">
        当前模式:{mode === "inpatient" ? "院内陪护" : "居家康复"} · 数据已加密
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-[16px] text-muted-foreground">{label}</div>
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
                <div className="mt-0.5 text-[15px] text-muted-foreground">药食同源 · 营养均衡</div>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-[16px] font-bold text-primary-foreground">
                选它
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- 骨灵大模型 ----------
function BoneAISheet({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "您好,我是骨灵 🦴 您的骨科康复助手。可以问我饮食、运动、用药、复查等任何问题~" },
  ]);
  const [input, setInput] = useState("");
  const quick = ["膝盖肿了怎么办?", "今天可以下地走路吗?", "能吃海鲜吗?", "什么时候复查?"];

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text:
            "根据您的术后阶段建议:适当冰敷 15 分钟,抬高患肢促进消肿;若 24 小时无缓解或伴有发热,请及时联系您的主管医生王主任。",
        },
      ]);
    }, 600);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      <div
        className="flex items-center justify-between px-3 py-3 text-white"
        style={{ background: "linear-gradient(135deg, #f97316, #e11d48)" }}
      >
        <button onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-[19px] font-bold">
          <Sparkles className="h-5 w-5" />
          骨灵大模型
        </div>
        <div className="w-5" />
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3 py-2.5 text-[18px] leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border text-foreground",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t bg-card p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quick.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[15px] text-primary"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="请输入您的问题…"
            className="flex-1 rounded-full border bg-background px-4 py-2.5 text-[18px] outline-none focus:border-primary"
          />
          <button
            onClick={() => send(input)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white"
            style={{ background: "linear-gradient(135deg, #f97316, #e11d48)" }}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- 完整住院路径 ----------
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
      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative space-y-6 pl-1">
          {stages.map((s, idx) => {
            const done = idx < currentStageIdx;
            const active = idx === currentStageIdx;
            const last = idx === stages.length - 1;
            return (
              <div key={s.key} className="relative flex items-start gap-4">
                {!last && (
                  <div className="absolute left-5 top-10 h-[calc(100%+1.5rem)] w-0 border-l-2 border-dashed border-muted-foreground/30" />
                )}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[16px] font-bold",
                    done && "bg-success text-white",
                    active && "bg-primary text-white ring-4 ring-primary/20",
                    !done && !active && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                </div>
                <div
                  className={cn(
                    "flex-1 rounded-2xl border p-3.5",
                    active ? "border-primary bg-primary/5" : "bg-card",
                  )}
                >
                  <div className={cn("text-[18px] font-bold", active && "text-primary")}>
                    {s.label}
                  </div>
                  {active && (
                    <div className="mt-1 text-[15px] font-bold text-primary">当前所处阶段</div>
                  )}
                  {done && <div className="mt-1 text-[14px] text-muted-foreground">已完成</div>}
                  {!done && !active && (
                    <div className="mt-1 text-[14px] text-muted-foreground">待进行</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
      <div className="overflow-hidden rounded-2xl bg-card shadow-2xl">
        <div
          className="flex items-center justify-between px-4 py-3 text-white"
          style={{ background: "linear-gradient(135deg, #1677d2, #0b62c4)" }}
        >
          <div className="flex items-center gap-2 text-[19px] font-bold">
            <Sparkles className="h-5 w-5" />
            使用引导
            <span className="rounded-md bg-white/25 px-2 py-0.5 text-[15px] font-bold">
              {step}/3
            </span>
          </div>
          <button onClick={onSkip} aria-label="关闭引导">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {/* 步骤条 */}
          <div className="flex items-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[17px] font-bold",
                    s === step
                      ? "bg-primary text-white"
                      : s < step
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={cn(
                      "mx-2 h-[3px] flex-1 rounded-full",
                      s < step ? "bg-primary/40" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 当前步骤卡片 */}
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="text-[21px] font-bold leading-tight">{cfg.title}</div>
              <div className="mt-1.5 text-[17px] leading-relaxed text-muted-foreground">
                {cfg.desc}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button onClick={onSkip} className="text-[18px] font-medium text-muted-foreground">
              跳过引导
            </button>
            <button
              onClick={onAction}
              className="flex items-center gap-1 rounded-full px-6 py-3 text-[19px] font-bold text-white shadow-lg active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #1677d2, #0b62c4)" }}
            >
              {cfg.action}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
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
              <div className="mt-1.5 text-[16px] text-muted-foreground">
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
                  <span className="absolute -right-1 -top-2 rounded-md bg-destructive px-1.5 py-0.5 text-[13px] font-bold text-destructive-foreground">
                    必填
                  </span>
                )}
                <div className="text-[18px] font-bold">{c.label}</div>
                <div
                  className={cn(
                    "mt-0.5 text-[16px]",
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
            <div className="text-[16px] text-muted-foreground">共 6 项</div>
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
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[15px]">{r.tag}</span>
                    <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[15px] text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      已识别
                    </span>
                  </div>
                  <div className="mt-1 text-[19px] font-bold">{r.name}</div>
                  <div className="text-[16px] text-muted-foreground">{r.sub}</div>
                  <div className="mt-0.5 text-[15px] text-muted-foreground">⏱ {r.ago}</div>
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
          <div className="mt-1 text-[16px] opacity-95">
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
