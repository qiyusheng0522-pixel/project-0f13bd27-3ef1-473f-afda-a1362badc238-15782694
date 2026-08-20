import { useState } from "react";
import {
  Crown,
  IdCard,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Activity,
  History,
  Info,
  Salad,
  RefreshCw,
  Utensils,
  CheckCircle2,
  Clock,
  HeartPulse,
  Footprints,
  Play,
  X,
  FileText,
  Lock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CareDish = {
  id: string;
  meal: "早餐" | "午餐" | "晚餐" | "加餐";
  name: string;
  benefit: string;
  alternates: string[];
};

export type CareRehabPlan = {
  title: string;
  goal: string;
  exercises: { name: string; dose: string }[];
  cautions: string[];
  diet: string[];
};

// ---------- 标签数据 ----------
type TagEvent = { date: string; text: string };
type TagItem = {
  name: string;
  kind: "disease" | "lifestyle";
  obtainedReason: string;
  obtainedSource: string;
  since?: string;
  events: TagEvent[];
};

const DISEASE_TAGS: TagItem[] = [
  {
    name: "膝骨关节炎",
    kind: "disease",
    obtainedReason: "门诊 X 光提示关节间隙变窄、骨赘形成，符合 K-L III 级。",
    obtainedSource: "南京鼓楼医院 · 关节外科门诊",
    since: "2026-02-18",
    events: [
      { date: "2026-02-18", text: "首次诊断，建议阶梯治疗" },
      { date: "2026-03-16", text: "行全膝关节置换术" },
      { date: "2026-03-19", text: "术后第 3 天，进入院内康复" },
    ],
  },
  {
    name: "肩袖肌腱损伤",
    kind: "disease",
    obtainedReason: "MRI 提示冈上肌腱部分撕裂，伴肩峰下滑囊炎。",
    obtainedSource: "运动医学门诊 · MRI 报告",
    since: "2026-03-16",
    events: [{ date: "2026-03-16", text: "确诊，保守治疗 + 康复训练" }],
  },
  {
    name: "骨质疏松风险",
    kind: "disease",
    obtainedReason: "骨密度 T 值 -2.3，处于骨量减少向骨质疏松过渡阶段。",
    obtainedSource: "骨密度检测报告",
    since: "2026-01-09",
    events: [{ date: "2026-01-09", text: "建议补钙 + 维生素 D，负重训练" }],
  },
];

const LIFESTYLE_TAGS: TagItem[] = [
  {
    name: "抽烟",
    kind: "lifestyle",
    obtainedReason: "入院评估问卷自述每日 10 支，吸烟影响骨愈合与伤口恢复。",
    obtainedSource: "入院护理评估",
    since: "2026-03-16",
    events: [{ date: "2026-03-16", text: "已纳入戒烟干预计划" }],
  },
  {
    name: "饮水量不足",
    kind: "lifestyle",
    obtainedReason: "每日饮水约 700ml，低于术后推荐的 1500ml。",
    obtainedSource: "术后生活方式随访",
    events: [{ date: "2026-03-18", text: "护士宣教，设置饮水提醒" }],
  },
  {
    name: "久坐少动",
    kind: "lifestyle",
    obtainedReason: "日均步数不足 2000 步，肌力下降增加跌倒风险。",
    obtainedSource: "手环步数同步",
    events: [{ date: "2026-03-17", text: "加入下肢肌力训练计划" }],
  },
];

const REMOVED_TAGS: TagItem[] = [
  {
    name: "夜间疼痛影响睡眠",
    kind: "lifestyle",
    obtainedReason: "术前夜间静息痛评分 6 分。",
    obtainedSource: "术前疼痛评估",
    events: [
      { date: "2026-03-16", text: "术后镇痛泵 + 冰敷" },
      { date: "2026-03-19", text: "夜间疼痛降至 2 分，标签移除" },
    ],
  },
];

const DATES = ["06/11", "06/12", "06/13", "06/14", "06/15"];

const MACROS = { carb: 168.5, fat: 41.2, protein: 92.4, kcal: 1428.6 };

const GENERIC_MEALS: Record<string, { intro: string; groups: { label: string; portion: string; examples: string[]; note?: string }[] }> = {
  早餐: {
    intro: "术后早餐以优质蛋白 + 慢碳为主，帮助伤口愈合与晨起体力。",
    groups: [
      { label: "优质蛋白", portion: "1 份", examples: ["鸡蛋", "牛奶", "豆浆"], note: "每日至少 1 个鸡蛋 + 250ml 牛奶" },
      { label: "主食", portion: "80-100g", examples: ["小米粥", "燕麦", "杂粮馒头"] },
    ],
  },
  午餐: {
    intro: "午餐补足蛋白质与钙质，配合药食同源汤品促进骨修复。",
    groups: [
      { label: "肉/鱼", portion: "100-150g", examples: ["清蒸鲈鱼", "鸡胸肉", "瘦牛肉"] },
      { label: "蔬菜", portion: "200g", examples: ["西兰花", "菠菜", "油菜"], note: "深色蔬菜占一半以上" },
      { label: "药膳汤", portion: "1 碗", examples: ["黄芪炖鸡", "杜仲腰花汤"] },
    ],
  },
  晚餐: {
    intro: "晚餐清淡易消化，控制总量，减轻关节负担。",
    groups: [
      { label: "主食", portion: "75g", examples: ["糙米饭", "藜麦饭", "紫薯"] },
      { label: "蛋白", portion: "80g", examples: ["豆腐", "鲫鱼", "虾仁"] },
    ],
  },
  加餐: {
    intro: "加餐补钙与坚果类健康脂肪，注意控制总热量。",
    groups: [{ label: "补钙加餐", portion: "1 份", examples: ["牛奶", "酸奶", "核桃 2 颗"] }],
  },
};

const EXERCISE_RISKS = [
  "伤口未拆线，避免大幅度屈曲与跪地",
  "训练中疼痛评分 > 4 分请立即停止并联系治疗师",
  "下地活动务必使用助行器，家属陪同防跌倒",
];

export function PatientCareScreen({
  mode,
  rehab,
  dishes,
  onSwap,
  onSyncToTodo,
}: {
  mode: "inpatient" | "home";
  rehab: CareRehabPlan;
  dishes: CareDish[];
  onSwap: (d: CareDish) => void;
  onSyncToTodo: () => void;
}) {
  const [purchased, setPurchased] = useState(false);
  const [plan, setPlan] = useState<"nutrition" | "herbal">("nutrition");
  const [activeDate, setActiveDate] = useState(DATES[0]);
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const meals: CareDish["meal"][] = ["早餐", "午餐", "晚餐", "加餐"];

  return (
    <div
      className="min-h-full pb-4"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.96 0.03 220) 0%, oklch(0.97 0.02 200) 30%, var(--background) 60%)",
      }}
    >
      <header className="px-4 pb-3 pt-4 text-center">
        <h1 className="text-[19px] font-bold tracking-wide">健康方案</h1>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-card p-0.5 text-[13px] font-bold ring-1 ring-black/10">
          <button
            onClick={() => setPurchased(false)}
            className={cn(
              "rounded-full px-3 py-1.5 transition-colors",
              !purchased ? "bg-foreground text-background" : "text-muted-foreground",
            )}
          >
            未开通预览
          </button>
          <button
            onClick={() => setPurchased(true)}
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors",
              purchased ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <Crown className="size-3.5" />已开通预览
          </button>
        </div>
      </header>

      {/* 健康档案入口 */}
      <section className="px-4">
        <button
          onClick={() => setArchiveOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl bg-card/80 px-4 py-3.5 ring-1 ring-black/5 backdrop-blur transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-full bg-primary/10">
              <IdCard className="size-5 text-primary" />
            </div>
            <span className="text-[14px] text-muted-foreground">
              骨<span className="font-bold text-primary">安</span> · 个人健康画像
            </span>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[15px] font-semibold text-primary">
            我的健康档案 <ChevronRight className="size-4" />
          </span>
        </button>
      </section>

      {/* 健康分析 · 标签 */}
      <section className="mt-3 px-4">
        <div
          className="rounded-2xl p-4 ring-1 ring-primary/15"
          style={{
            background: "linear-gradient(160deg, oklch(0.95 0.04 230) 0%, oklch(0.96 0.03 200) 100%)",
          }}
        >
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="text-primary">◆</span>
            <p className="text-[15px] font-bold">更好的康复从生活方式纠偏开始</p>
            <span className="text-primary">◆</span>
          </div>

          <div className="rounded-xl bg-card p-3.5 ring-1 ring-black/5">
            <TagBlock
              icon={<AlertTriangle className="size-4" />}
              title="疾病"
              tags={DISEASE_TAGS}
              tagClass="text-destructive bg-destructive/10 ring-destructive/15"
              onTagClick={setSelectedTag}
            />
            <div className="my-3 h-px bg-border/60" />
            <TagBlock
              icon={<Activity className="size-4" />}
              title="不良生活方式"
              tags={LIFESTYLE_TAGS}
              tagClass="text-warning bg-warning/10 ring-warning/20"
              onTagClick={setSelectedTag}
            />
            <div className="my-3 h-px bg-border/60" />
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex w-full items-center justify-between text-[14px] text-muted-foreground active:opacity-70"
            >
              <span className="inline-flex items-center gap-1.5">
                <History className="size-4 text-primary" />
                查看标签变更历史
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">
                  {REMOVED_TAGS.length} 项已移除
                </span>
              </span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 服务包 */}
      <section className="mt-4 px-4">
        <ServicePlanCard purchased={purchased} onBuy={() => setPurchased(true)} />
      </section>

      {/* 饮食方案 */}
      <section className="mt-4 px-4">
        <div
          className="overflow-hidden rounded-2xl ring-1 ring-black/5"
          style={{
            background: "linear-gradient(180deg, oklch(0.95 0.05 220) 0%, oklch(0.98 0.02 210) 100%)",
          }}
        >
          <div className="flex items-start justify-between gap-3 p-4 pb-2">
            <div className="min-w-0">
              <div className="inline-flex flex-wrap items-center gap-1.5">
                <h2 className="text-[19px] font-extrabold tracking-tight">
                  {purchased ? "专属饮食方案" : "通用饮食方案"}
                </h2>
                {purchased ? (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary ring-1 ring-primary/20">
                    <Crown className="size-3 text-amber-500" />专属定制
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground ring-1 ring-black/10">
                    通用方案 · 免费
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {purchased
                  ? "根据您的骨关节档案与口味偏好定制"
                  : "基于骨科术后营养指南的通用建议"}
              </p>
            </div>
            <Salad className="size-7 shrink-0 text-emerald-600" />
          </div>

          <div className="mt-2 flex gap-1 px-4">
            {(
              [
                { k: "nutrition", l: "营养方案" },
                { k: "herbal", l: "药食同源" },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setPlan(t.k)}
                className={cn(
                  "rounded-t-xl px-4 py-2 text-[15px] font-bold transition-colors",
                  plan === t.k ? "bg-card text-primary" : "text-foreground/55",
                )}
              >
                {t.l}
              </button>
            ))}
          </div>

          <div className="bg-card px-4 pb-4 pt-4">
            <p className="text-center text-[14px] text-muted-foreground">
              当前您执行的是{" "}
              <span className="font-bold text-warning">
                {plan === "nutrition" ? "营养方案" : "药食同源方案"}
              </span>
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-[14px]">
                <span className="text-muted-foreground">用餐时间：</span>
                <span className="font-bold tabular-nums">07:30–18:30</span>
              </p>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[13px] font-bold text-primary">
                已选择该方案
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <NutritionRing {...MACROS} />
              <div className="flex-1 space-y-2 text-[14px]">
                <Legend color="#F59E0B" label="碳水化合物" value={`${MACROS.carb}g`} />
                <Legend color="#2563EB" label="脂肪" value={`${MACROS.fat}g`} />
                <Legend color="#38BDF8" label="蛋白质" value={`${MACROS.protein}g`} />
              </div>
            </div>

            <div className="scrollbar-hide -mx-1 mt-4 overflow-x-auto">
              <div className="flex gap-1 px-1">
                {DATES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setActiveDate(d)}
                    className={cn(
                      "shrink-0 rounded-lg px-3 py-2 text-[14px] tabular-nums",
                      activeDate === d
                        ? "bg-primary/10 font-bold text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={() => dishes[0] && onSwap(dishes[0])}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-3 text-[15px] font-bold text-primary active:bg-primary/15"
              >
                <RefreshCw className="size-4" /> 不想吃全部换
              </button>
              <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-warning/10 py-3 text-[15px] font-bold text-warning active:bg-warning/15">
                去买菜 <ChevronRight className="size-4" />
              </button>
            </div>

            <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
              带 <Info className="inline size-3 align-[-2px] text-destructive" />{" "}
              食谱包含卫健委公布的药食同源药材，点击查看功效
            </p>

            <div className="mt-3 space-y-3">
              {meals.map((m, i) => (
                <MealCard
                  key={m}
                  title={m}
                  defaultOpen={i === 0}
                  purchased={purchased}
                  dishes={dishes.filter((d) => d.meal === m)}
                  onSwap={onSwap}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 运动方案 */}
      <section className="mt-4 px-4">
        <WorkoutPlan purchased={purchased} rehab={rehab} />
      </section>

      <div className="mt-4 px-4">
        <button
          onClick={onSyncToTodo}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-[18px] font-bold text-primary-foreground shadow-lg active:scale-[0.98]"
        >
          <CheckCircle2 className="size-5" />
          一键同步为今日打卡待办
        </button>
        <p className="mt-2 pb-2 text-center text-[13px] text-muted-foreground">
          {mode === "inpatient" ? "住院版" : "居家版"} · 方案内容一致，按当前阶段自动更新
        </p>
      </div>

      {/* 弹层 */}
      {selectedTag && (
        <InFrameSheet onClose={() => setSelectedTag(null)}>
          <TagDetailContent tag={selectedTag} />
        </InFrameSheet>
      )}
      {historyOpen && (
        <InFrameSheet onClose={() => setHistoryOpen(false)}>
          <TagHistoryContent />
        </InFrameSheet>
      )}
      {archiveOpen && (
        <InFrameSheet onClose={() => setArchiveOpen(false)}>
          <ArchiveContent rehab={rehab} />
        </InFrameSheet>
      )}
    </div>
  );
}

// ---------- 子组件 ----------
function TagBlock({
  icon,
  title,
  tags,
  tagClass,
  onTagClick,
}: {
  icon: React.ReactNode;
  title: string;
  tags: TagItem[];
  tagClass: string;
  onTagClick: (t: TagItem) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-primary">
        {icon}
        <span className="text-[15px] font-bold text-foreground">{title}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <button
            key={t.name}
            onClick={() => onTagClick(t)}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[14px] font-semibold ring-1 transition-transform active:scale-95",
              tagClass,
            )}
          >
            {t.name}
            <Info className="size-3 opacity-60" />
          </button>
        ))}
      </div>
    </div>
  );
}

function InFrameSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative max-h-[82%] overflow-y-auto rounded-t-2xl bg-background shadow-2xl">
        <button
          onClick={onClose}
          aria-label="关闭"
          className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-muted/70 active:bg-muted"
        >
          <X className="size-4 text-foreground/70" />
        </button>
        {children}
      </div>
    </div>
  );
}

function TagDetailContent({ tag }: { tag: TagItem }) {
  const isDisease = tag.kind === "disease";
  return (
    <div>
      <div
        className="px-5 pb-4 pt-5"
        style={{
          background: isDisease
            ? "linear-gradient(160deg, oklch(0.95 0.04 25) 0%, oklch(0.98 0.02 25) 100%)"
            : "linear-gradient(160deg, oklch(0.95 0.05 65) 0%, oklch(0.98 0.02 65) 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-[15px] font-bold ring-1",
              isDisease
                ? "bg-destructive/10 text-destructive ring-destructive/20"
                : "bg-warning/10 text-warning ring-warning/20",
            )}
          >
            {tag.name}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {isDisease ? "疾病标签" : "生活方式标签"}
          </span>
        </div>
        <h3 className="mt-2 text-[17px] font-bold">获得原因</h3>
        <p className="mt-1 text-[14px] leading-relaxed text-foreground/75">{tag.obtainedReason}</p>
        <div className="flex items-center gap-1.5 pt-2 text-[12.5px] text-muted-foreground">
          <FileText className="size-3.5" />
          来源：{tag.obtainedSource}
          {tag.since && <span className="ml-1">· 标记于 {tag.since}</span>}
        </div>
      </div>
      <div className="bg-card px-5 py-4">
        <div className="mb-3 flex items-center gap-1.5">
          <Clock className="size-4 text-primary" />
          <span className="text-[15px] font-bold">该标签的变化记录</span>
        </div>
        <TimelineList events={tag.events} />
      </div>
    </div>
  );
}

function TagHistoryContent() {
  return (
    <div className="p-5">
      <h3 className="text-[18px] font-bold">标签变更历史</h3>
      <p className="mt-1 text-[14px] text-muted-foreground">
        您已成功移除 {REMOVED_TAGS.length} 个标签，继续保持！
      </p>
      <div className="mt-4 space-y-3">
        {REMOVED_TAGS.map((t) => (
          <div key={t.name} className="rounded-xl bg-muted/30 p-3 ring-1 ring-black/5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-muted-foreground line-through decoration-muted-foreground/60">
                  {t.name}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCircle2 className="size-3" /> 已移除
                </span>
              </div>
              <span className="text-[12px] text-muted-foreground">
                {t.kind === "disease" ? "疾病" : "生活方式"}
              </span>
            </div>
            <TimelineList events={t.events} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchiveContent({ rehab }: { rehab: CareRehabPlan }) {
  return (
    <div className="p-5">
      <h3 className="text-[18px] font-bold">我的健康档案</h3>
      <p className="mt-1 text-[14px] text-muted-foreground">{rehab.title}</p>
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl bg-card p-4 ring-1 ring-black/5">
          <div className="text-[15px] font-bold">康复目标</div>
          <p className="mt-1 text-[14px] text-foreground/75">{rehab.goal}</p>
        </div>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-black/5">
          <div className="text-[15px] font-bold">饮食注意事项</div>
          <ul className="mt-2 space-y-1.5">
            {rehab.diet.map((d) => (
              <li key={d} className="flex items-start gap-2 text-[14px]">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-card p-4 ring-1 ring-black/5">
          <div className="text-[15px] font-bold">康复注意事项</div>
          <ul className="mt-2 space-y-1.5">
            {rehab.cautions.map((d) => (
              <li key={d} className="flex items-start gap-2 text-[14px]">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TimelineList({ events, compact = false }: { events: TagEvent[]; compact?: boolean }) {
  return (
    <ol className="relative space-y-3 pl-4">
      <span className="absolute bottom-1 left-[3px] top-1 w-px bg-border" />
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-4 top-1.5 size-[7px] rounded-full bg-primary ring-2 ring-background" />
          <div className={cn("text-muted-foreground", compact ? "text-[12px]" : "text-[12.5px]")}>
            {e.date}
          </div>
          <div className={cn("text-foreground/85", compact ? "text-[13px]" : "text-[14px]")}>
            {e.text}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
      <span className="text-foreground/75">{label}</span>
      <span className="ml-auto text-[13px] tabular-nums text-foreground/55">{value}</span>
    </div>
  );
}

function NutritionRing({
  carb,
  fat,
  protein,
  kcal,
}: {
  carb: number;
  fat: number;
  protein: number;
  kcal: number;
}) {
  const total = carb + fat + protein;
  const c = (carb / total) * 100;
  const f = (fat / total) * 100;
  const r = 38;
  const C = 2 * Math.PI * r;
  return (
    <div className="relative size-[124px] shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#F1F5F9" strokeWidth="11" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${(c / 100) * C} ${C}`}
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#2563EB"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${(f / 100) * C} ${C}`}
          strokeDashoffset={-((c / 100) * C)}
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#38BDF8"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${((100 - c - f) / 100) * C} ${C}`}
          strokeDashoffset={-(((c + f) / 100) * C)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[18px] font-extrabold tabular-nums">{kcal.toFixed(2)}</div>
          <div className="text-[11px] text-muted-foreground">Kcal</div>
        </div>
      </div>
    </div>
  );
}

function MealCard({
  title,
  dishes,
  defaultOpen = false,
  purchased = false,
  onSwap,
}: {
  title: CareDish["meal"];
  dishes: CareDish[];
  defaultOpen?: boolean;
  purchased?: boolean;
  onSwap: (d: CareDish) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const generic = GENERIC_MEALS[title];
  const kcal = dishes.length * 320;
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex flex-1 items-center gap-2 text-left active:opacity-70"
        >
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", !open && "-rotate-90")}
          />
          <span className="text-[16px] font-bold">{title}</span>
          <span className="text-[13px] tabular-nums text-muted-foreground">约 {kcal} 千卡</span>
          <span className="ml-1 text-[12px] text-muted-foreground/80">
            · {purchased ? `${dishes.length} 道菜` : "推荐结构"}
          </span>
        </button>
        {purchased && (
          <button className="inline-flex shrink-0 items-center gap-0.5 text-[14px] font-bold text-primary">
            <CheckCircle2 className="size-4" /> 去打卡
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2">
          {!purchased && generic ? (
            <div className="space-y-2.5 rounded-lg bg-card p-3 ring-1 ring-black/5">
              <p className="text-[13px] leading-snug text-muted-foreground">{generic.intro}</p>
              {generic.groups.map((g) => (
                <div key={g.label} className="rounded-md bg-muted/40 px-2.5 py-2 ring-1 ring-black/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold">{g.label}</span>
                    <span className="text-[12px] font-semibold tabular-nums text-primary">
                      {g.portion}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {g.examples.map((ex) => (
                      <span
                        key={ex}
                        className="rounded-full bg-card px-2 py-0.5 text-[12px] text-foreground/75 ring-1 ring-black/10"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                  {g.note && (
                    <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                      提示：{g.note}
                    </p>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-md bg-primary/5 px-2.5 py-2 ring-1 ring-dashed ring-primary/25">
                <Lock className="size-3.5 shrink-0 text-primary" />
                <p className="flex-1 text-[12px] leading-snug text-foreground/75">
                  开通后将基于您的口味与禁忌，生成
                  <span className="font-bold text-primary">具体菜品</span> 与
                  <span className="font-bold text-primary">名厨做法</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/60 rounded-lg bg-card ring-1 ring-black/5">
              {dishes.length === 0 && (
                <p className="px-3 py-3 text-[13px] text-muted-foreground">本餐次暂无安排</p>
              )}
              {dishes.map((d) => (
                <div key={d.id} className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-warning/10">
                      <Utensils className="size-5 text-warning" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 truncate text-[15px] font-semibold">
                        {d.name}
                        <Info className="size-3.5 text-destructive" />
                      </div>
                      <div className="text-[13px] text-muted-foreground">{d.benefit}</div>
                    </div>
                    <button
                      onClick={() => onSwap(d)}
                      className="shrink-0 rounded-full border border-primary/40 px-3 py-1.5 text-[14px] font-bold text-primary active:bg-primary/10"
                    >
                      换一换
                    </button>
                  </div>
                  {purchased && (
                    <div className="ml-[60px] mt-2 rounded-lg bg-emerald-50/60 p-2.5 ring-1 ring-emerald-200/60">
                      <div className="mb-1 inline-flex items-center gap-1 text-[12px] font-bold text-emerald-700">
                        <Sparkles className="size-3" />手把手做法
                      </div>
                      <p className="text-[13px] leading-relaxed text-foreground/80">
                        食材洗净备好 → 中火煮 / 蒸 15-20 分钟 → 少油少盐调味，出锅前撒少许枸杞。
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ServicePlanCard({ purchased, onBuy }: { purchased: boolean; onBuy: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-black/5">
      <div
        className="flex items-center justify-between p-4 text-white"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div>
          <div className="inline-flex items-center gap-1.5 text-[13px] opacity-90">
            <Crown className="size-4" /> 骨关节管理服务包
          </div>
          <div className="mt-1 text-[19px] font-extrabold">
            {purchased ? "已开通 · 专属方案生效中" : "解锁专属康复 + 饮食定制"}
          </div>
          <div className="mt-1 text-[13px] opacity-85">
            医生审核 · 治疗师随访 · 营养师配餐
          </div>
        </div>
        {!purchased && (
          <button
            onClick={onBuy}
            className="shrink-0 rounded-full bg-white px-4 py-2 text-[15px] font-bold text-primary active:scale-95"
          >
            立即开通
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 divide-x divide-border/60">
        {[
          { l: "关节僵硬风险", v: "72%", tone: "text-destructive" },
          { l: "跌倒风险", v: "中", tone: "text-warning" },
          { l: "康复达标率", v: "68%", tone: "text-primary" },
        ].map((s) => (
          <div key={s.l} className="px-2 py-3 text-center">
            <div className={cn("text-[19px] font-extrabold tabular-nums", s.tone)}>{s.v}</div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutPlan({ purchased, rehab }: { purchased: boolean; rehab: CareRehabPlan }) {
  const [done, setDone] = useState<number[]>([0]);
  const [authed, setAuthed] = useState(false);
  const [authing, setAuthing] = useState(false);
  const total = rehab.exercises.length;
  const pct = Math.round((done.length / Math.max(total, 1)) * 100);
  const steps = 3268;
  const goal = 5000;
  const stepPct = Math.min(100, Math.round((steps / goal) * 100));

  return (
    <div
      className="overflow-hidden rounded-2xl ring-1 ring-black/5"
      style={{
        background: "linear-gradient(160deg, oklch(0.94 0.04 220) 0%, oklch(0.97 0.025 215) 100%)",
      }}
    >
      <div className="flex items-start justify-between p-4 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5">
            <h2 className="text-[19px] font-extrabold tracking-tight">今日运动</h2>
            {purchased ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary ring-1 ring-primary/20">
                <Crown className="size-3 text-amber-500" />AI 定制
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground ring-1 ring-black/10">
                通用方案 · 免费
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{rehab.goal}</p>
        </div>
        <div className="grid size-11 place-items-center rounded-xl bg-primary/15">
          <HeartPulse className="size-6 text-primary" />
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-xl bg-card p-3 ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">今日打卡进度</p>
              <p className="mt-0.5 text-[20px] font-extrabold tabular-nums">
                {done.length}
                <span className="text-[13px] font-semibold text-muted-foreground"> / {total} 项</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-muted-foreground">完成度</p>
              <p className="text-[18px] font-extrabold tabular-nums text-primary">{pct}%</p>
            </div>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* 风险提示 */}
        <div className="mt-3 rounded-xl bg-destructive/5 p-3 ring-1 ring-destructive/20">
          <div className="mb-1.5 inline-flex items-center gap-1.5 text-[14px] font-bold text-destructive">
            <AlertTriangle className="size-4" /> 运动风险提示
          </div>
          <ul className="space-y-1">
            {EXERCISE_RISKS.map((r) => (
              <li key={r} className="flex items-start gap-2 text-[13.5px] text-foreground/80">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive/70" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* 步数授权 */}
        <div className="mt-3 rounded-xl bg-card p-3 ring-1 ring-black/5">
          {!authed ? (
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-500/15">
                <Footprints className="size-5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold">授权微信步数</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  同步每日步数，自动计入活动量
                </p>
              </div>
              <button
                onClick={() => {
                  setAuthing(true);
                  setTimeout(() => {
                    setAuthing(false);
                    setAuthed(true);
                  }, 700);
                }}
                disabled={authing}
                className="rounded-full bg-emerald-500 px-3.5 py-2 text-[13.5px] font-bold text-white disabled:opacity-60"
              >
                {authing ? "授权中…" : "立即授权"}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid size-8 place-items-center rounded-md bg-emerald-500/15">
                    <Footprints className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[13.5px] font-bold">微信步数</p>
                    <p className="text-[11.5px] text-muted-foreground">已授权 · 实时同步</p>
                  </div>
                </div>
                <p className="text-[20px] font-extrabold tabular-nums text-emerald-600">
                  {steps.toLocaleString()}
                  <span className="text-[12px] font-semibold text-muted-foreground"> 步</span>
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-emerald-500" style={{ width: `${stepPct}%` }} />
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                今日目标 {goal.toLocaleString()} 步 · 已完成 {stepPct}%
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="size-4 text-primary" />
            <span className="text-[16px] font-extrabold tracking-tight">今日运动清单</span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[12px] font-bold text-primary ring-1 ring-primary/20">
              {total} 项
            </span>
          </div>
          <button className="inline-flex items-center text-[13.5px] font-bold text-primary">
            打卡记录 <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {rehab.exercises.map((e, i) => {
            const isDone = done.includes(i);
            return (
              <button
                key={e.name}
                onClick={() =>
                  setDone((arr) => (arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]))
                }
                className={cn(
                  "flex w-full overflow-hidden rounded-xl bg-card text-left ring-1",
                  isDone ? "ring-emerald-200" : "ring-black/5",
                )}
              >
                <span
                  className="relative grid w-[110px] shrink-0 place-items-center"
                  style={{ background: "linear-gradient(160deg, #fbbf24, #f97316)" }}
                >
                  <span className="grid size-10 place-items-center rounded-full bg-white/90 shadow">
                    <Play className="size-5 translate-x-[1px] fill-foreground text-foreground" />
                  </span>
                  {isDone && (
                    <span className="absolute right-1 top-1 inline-flex items-center gap-0.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      <CheckCircle2 className="size-3" />已完成
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1 p-3">
                  <span className="block truncate text-[17px] font-extrabold leading-tight">
                    {e.name}
                  </span>
                  <span className="mt-1 block text-[14px] text-muted-foreground">{e.dose}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5">
                      <Clock className="size-3" />
                      {purchased ? "AI 排期" : "全天可做"}
                    </span>
                    <span className="text-primary">{isDone ? "已完成打卡" : "点击完成打卡"}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 注意事项 */}
        <div className="mt-3 rounded-xl bg-card p-3 ring-1 ring-black/5">
          <div className="mb-1.5 inline-flex items-center gap-1.5 text-[15px] font-bold">
            <AlertTriangle className="size-4 text-warning" /> 注意事项
          </div>
          <ul className="space-y-1">
            {rehab.cautions.map((c) => (
              <li key={c} className="flex items-start gap-2 text-[14px] text-foreground/80">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
