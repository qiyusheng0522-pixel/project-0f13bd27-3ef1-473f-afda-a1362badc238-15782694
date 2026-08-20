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
  { id: "t5", title: "高蛋白午餐", detail: "鸡蛋羹 + 清蒸鱼 + 蔬菜汤", category: "饮食", time: "中午 12:00" },
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

        {tab === "me" && <MeTab mode={mode} doneCount={doneCount} total={currentTodos.length} />}

        {/* 换菜弹层 */}
        {swapDish && (
          <SwapDishSheet dish={swapDish} onClose={() => setSwapDish(null)} onPick={swapDishTo} />
        )}

        {/* AI 弹层 */}
        {aiOpen && <BoneAISheet onClose={() => setAiOpen(false)} />}

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
}) {
  const currentStage = stages[currentStageIdx];
  const doing = todos.filter((t) => !t.done);
  const finished = todos.filter((t) => t.done);

  return (
    <div className="space-y-4 p-3">
      {/* 患者信息卡（两版共用） */}
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
            <div className="mb-3 flex items-center gap-2 text-[18px] font-bold">
              <MapPin className="h-5 w-5 text-primary" />
              我的住院路径
            </div>

            {/* 紧凑 S 弯：两行蛇形排列 */}
            <div className="relative">
              <svg
                className="absolute left-0 top-0 h-full w-full"
                viewBox="0 0 320 110"
                fill="none"
                aria-hidden="true"
                style={{ overflow: "visible" }}
              >
                <path
                  d="M40 22 H280 M280 22 V55 M280 55 H40 M40 55 V88 M40 88 H280"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="text-muted-foreground/30"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>

              <div className="relative grid grid-cols-3 gap-x-2 gap-y-10">
                {stages.map((s, idx) => {
                  const done = idx < currentStageIdx;
                  const active = idx === currentStageIdx;
                  const row = idx < 3 ? 0 : 1;
                  const col = row === 0 ? idx : 5 - idx; // 第二行从右往左
                  const order = row * 3 + (row === 0 ? col : 2 - col);
                  return (
                    <div
                      key={s.key}
                      className={cn(
                        "flex flex-col items-center gap-1.5",
                        row === 1 && "flex-col-reverse",
                      )}
                      style={{ gridColumn: col + 1, gridRow: row + 1 }}
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold shadow-sm",
                          done && "bg-success text-white",
                          active && "bg-primary text-white ring-[3px] ring-primary/25",
                          !done && !active && "bg-muted text-muted-foreground",
                        )}
                      >
                        {done ? <CheckCircle2 className="h-5 w-5" /> : order + 1}
                      </div>
                      <div
                        className={cn(
                          "text-center text-[14px] leading-tight",
                          active ? "font-bold text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {s.label}
                      </div>
                      {active && (
                        <div className="text-[11px] font-bold text-primary">当前</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ===== 门诊 / 居家版专属：AI 扫描 + 常用服务 ===== */}
      {mode === "home" && (
        <>
          <button
            onClick={onUpload}
            className="w-full rounded-2xl border-2 border-dashed border-primary/50 bg-card p-5 text-center active:bg-primary/5"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ScanLine className="h-9 w-9" />
            </div>
            <div className="mt-3 text-[20px] font-bold">AI 扫描，智能识别就诊信息</div>
            <div className="mt-2 text-[16px] font-bold text-warning">
              * 我们将为您定制更全面的营养方案
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <QuickCard
              icon={Stethoscope}
              title="专科服务"
              desc="骨科门诊 · 康复评估"
              tint="bg-emerald-50 text-emerald-700"
            />
            <QuickCard icon={Watch} title="智能设备" desc="护具 · 手环 · 监测" tint="bg-sky-50 text-sky-700" />
            <QuickCard icon={Pill} title="用药提醒" desc="添加提醒" tint="bg-violet-50 text-violet-700" />
            <QuickCard icon={HeartPulse} title="健康评估" desc="立即评估" tint="bg-rose-50 text-rose-700" />
          </div>
        </>
      )}

      {/* ===== 两版共用：我的任务（进行中 / 已完成） ===== */}
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

      {/* ===== 两版共用：疾病史 / 既往治疗 / 随访 ===== */}
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
      <div className="rounded-2xl bg-destructive/10 p-4">
        <div className="text-[16px] text-destructive">疾病：</div>
        <div className="mt-1 text-[20px] font-bold text-destructive">
          {patient.diseaseHistory.map((d) => d.name).join("、")}
        </div>
      </div>

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

// ---------- 健康方案 ----------
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
  const [section, setSection] = useState<"rehab" | "nutrition">("rehab");

  return (
    <div className="space-y-4 p-3">
      <div
        className="rounded-2xl p-4 text-white"
        style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}
      >
        <div className="text-[18px] font-bold">{rehab.title}</div>
        <div className="mt-1 text-[17px] opacity-95">🎯 {rehab.goal}</div>
      </div>

      {/* 院外才显示营养方案切换 */}
      {mode === "home" && (
        <div className="flex gap-2 rounded-2xl bg-muted p-1">
          <button
            onClick={() => setSection("rehab")}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-[18px] font-bold",
              section === "rehab" ? "bg-card text-foreground shadow" : "text-muted-foreground",
            )}
          >
            🏃 康复运动
          </button>
          <button
            onClick={() => setSection("nutrition")}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-[18px] font-bold",
              section === "nutrition" ? "bg-card text-foreground shadow" : "text-muted-foreground",
            )}
          >
            🍲 营养药膳
          </button>
        </div>
      )}

      {(mode === "inpatient" || section === "rehab") && (
        <>
          {/* 运动 */}
          <Section icon={Dumbbell} title="康复运动" tint="bg-sky-50 text-sky-700">
            {rehab.exercises.map((e, i) => (
              <div key={i} className="rounded-xl border bg-background p-3">
                <div className="text-[18px] font-bold">{i + 1}. {e.name}</div>
                <div className="mt-1 text-[16px] text-muted-foreground">{e.dose}</div>
              </div>
            ))}
          </Section>

          {/* 注意事项 */}
          <Section icon={AlertTriangle} title="注意事项" tint="bg-orange-50 text-orange-700">
            {rehab.cautions.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[17px]">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                <span>{c}</span>
              </div>
            ))}
          </Section>

          {/* 饮食 */}
          <Section icon={Apple} title="饮食建议" tint="bg-emerald-50 text-emerald-700">
            {rehab.diet.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[17px]">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span>{c}</span>
              </div>
            ))}
          </Section>
        </>
      )}

      {mode === "home" && section === "nutrition" && (
        <>
          <Section icon={Leaf} title="营养方案 · 药食同源" tint="bg-emerald-50 text-emerald-700">
            <div className="text-[16px] text-muted-foreground">
              依据您的康复阶段定制 · 不喜欢的菜可一键更换
            </div>
            {dishes.map((d) => (
              <div key={d.id} className="rounded-xl border bg-background p-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[15px] font-bold text-primary">
                    {d.meal}
                  </span>
                  <button
                    onClick={() => onSwap(d)}
                    className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[15px] font-medium text-foreground"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    换一道
                  </button>
                </div>
                <div className="mt-2 text-[19px] font-bold">{d.name}</div>
                <div className="mt-1 text-[16px] text-muted-foreground">💚 {d.benefit}</div>
              </div>
            ))}
          </Section>
        </>
      )}

      <button
        onClick={onSyncToTodo}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[19px] font-bold text-primary-foreground shadow-lg active:scale-[0.98]"
      >
        <CheckCircle2 className="h-5 w-5" />
        一键同步为今日打卡待办
      </button>
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
function MeTab({ mode, doneCount, total }: { mode: Mode; doneCount: number; total: number }) {
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
