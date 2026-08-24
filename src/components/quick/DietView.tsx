import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Mic,
  ScanLine,
  Sparkles,
  Sun,
  Soup,
  Moon,
  Cookie,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Flame,
  Beef,
  Bone,
  Droplets,
  X,
  Loader2,
  Plus,
  ChevronRight,
  Clock3,
  ChefHat,
  Flag,
  Heart,
} from "lucide-react";
import { QuickSheet } from "@/components/quick/QuickSheet";

type DietCategory = "nutrition" | "tcm";
type MealKey = "breakfast" | "lunch" | "dinner" | "snack";
type Method = "camera" | "voice" | "scan";

type MealEntry = {
  name: string;
  kcal: number;
  protein: number; // g
  calcium: number; // mg
  fat: number; // g
};

type MealSlot = {
  key: MealKey;
  id: string;
  title: string;
  window: string;
  icon: React.ReactNode;
  tone: string;
  fg: string;
  target: number; // kcal target
  entries: MealEntry[];
};

const INITIAL_MEALS: MealSlot[] = [
  {
    key: "breakfast",
    id: "breakfast",
    title: "早餐",
    window: "06:30 – 09:00",
    icon: <Sun className="size-5" />,
    tone: "bg-warning/10",
    fg: "text-warning",
    target: 420,
    entries: [
      { name: "牛奶 1 杯", kcal: 150, protein: 8, calcium: 280, fat: 8 },
      { name: "水煮蛋 1 个", kcal: 78, protein: 6.3, calcium: 28, fat: 5.3 },
    ],
  },
  {
    key: "lunch",
    id: "lunch",
    title: "午餐",
    window: "11:30 – 13:30",
    icon: <Soup className="size-5" />,
    tone: "bg-primary/10",
    fg: "text-primary",
    target: 560,
    entries: [],
  },
  {
    key: "dinner",
    id: "dinner",
    title: "晚餐",
    window: "18:00 – 20:00",
    icon: <Moon className="size-5" />,
    tone: "bg-accent/10",
    fg: "text-accent",
    target: 480,
    entries: [],
  },
];

const makeSnackSlot = (n: number): MealSlot => ({
  key: "snack",
  id: `snack-${Date.now()}-${n}`,
  title: n > 1 ? `加餐 #${n}` : "加餐 / 零食",
  window: "全天",
  icon: <Cookie className="size-5" />,
  tone: "bg-success/10",
  fg: "text-success",
  target: 180,
  entries: [],
});

type Dish = {
  id: string;
  name: string;
  slot: "早餐" | "午餐" | "晚餐" | "加餐";
  category: DietCategory;
  kcal: number;
  calcium: number;
  tags: string[];
  tone: string;
  fg: string;
  why: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  tips: string[];
};

const DISHES: Dish[] = [
  {
    id: "milk-bowl",
    name: "牛奶芝麻糊",
    slot: "早餐",
    category: "nutrition",
    kcal: 300,
    calcium: 320,
    tags: ["高钙", "易消化"],
    tone: "bg-warning/10",
    fg: "text-warning",
    why: "牛奶+黑芝麻富含钙质，帮助术后骨骼修复。",
    ingredients: [
      { name: "纯牛奶", amount: "250 ml" },
      { name: "黑芝麻糊", amount: "30 g" },
    ],
    steps: ["牛奶加热至温热。", "冲入芝麻糊搅拌均匀即可。"],
    tips: ["晨起空腹饮用吸收更好。"],
  },
  {
    id: "beef-tofu",
    name: "牛肉豆腐煲",
    slot: "午餐",
    category: "nutrition",
    kcal: 480,
    calcium: 220,
    tags: ["高蛋白", "促进愈合"],
    tone: "bg-primary/10",
    fg: "text-primary",
    why: "牛肉高蛋白促进伤口愈合，豆腐补钙且易咀嚼。",
    ingredients: [
      { name: "牛肉", amount: "100 g" },
      { name: "豆腐", amount: "150 g" },
      { name: "香葱", amount: "适量" },
    ],
    steps: [
      "牛肉切片焯水去血沫。",
      "豆腐切块与牛肉同炖 15 分钟。",
      "出锅撒葱花即可。",
    ],
    tips: ["术后早期建议炖煮软烂，方便消化。"],
  },
  {
    id: "salmon-broccoli",
    name: "清蒸三文鱼 + 西兰花",
    slot: "晚餐",
    category: "nutrition",
    kcal: 380,
    calcium: 90,
    tags: ["优质蛋白", "维生素D"],
    tone: "bg-accent/10",
    fg: "text-accent",
    why: "三文鱼富含维生素D，促进钙吸收，助力骨骼愈合。",
    ingredients: [
      { name: "三文鱼", amount: "150 g" },
      { name: "西兰花", amount: "150 g" },
      { name: "姜丝", amount: "适量" },
    ],
    steps: ["三文鱼铺姜丝，上锅蒸 8 分钟。", "西兰花焯水 1 分钟摆盘。"],
    tips: ["每周吃 2-3 次深海鱼，补充维D与Omega-3。"],
  },
  {
    id: "yogurt-nuts",
    name: "酸奶坚果杯",
    slot: "加餐",
    category: "nutrition",
    kcal: 180,
    calcium: 200,
    tags: ["高钙", "控体重"],
    tone: "bg-success/10",
    fg: "text-success",
    why: "低脂高钙加餐，控制体重减轻关节负担。",
    ingredients: [
      { name: "无糖酸奶", amount: "150 g" },
      { name: "混合坚果", amount: "10 g" },
    ],
    steps: ["酸奶倒入杯中。", "撒上坚果碎即可。"],
    tips: ["选择低糖或无糖酸奶，避免额外热量。"],
  },
  {
    id: "tcm-walnut-congee",
    name: "核桃杜仲粥",
    slot: "早餐",
    category: "tcm",
    kcal: 260,
    calcium: 60,
    tags: ["补肾壮骨", "药食同源"],
    tone: "bg-warning/10",
    fg: "text-warning",
    why: "杜仲补肝肾、强筋骨，核桃健脑，适合术后恢复期。",
    ingredients: [
      { name: "核桃仁", amount: "20 g" },
      { name: "杜仲", amount: "10 g" },
      { name: "大米", amount: "50 g" },
    ],
    steps: [
      "杜仲加水煎煮 20 分钟取汁。",
      "药汁与大米同煮成粥。",
      "出锅前加入核桃仁碎。",
    ],
    tips: ["阴虚火旺者少量食用。"],
  },
  {
    id: "tcm-goji-bone-soup",
    name: "枸杞黑豆排骨汤",
    slot: "午餐",
    category: "tcm",
    kcal: 420,
    calcium: 260,
    tags: ["强筋壮骨", "药食同源"],
    tone: "bg-primary/10",
    fg: "text-primary",
    why: "黑豆补肾、排骨补钙，枸杞滋阴，适合骨关节术后调养。",
    ingredients: [
      { name: "排骨", amount: "200 g" },
      { name: "黑豆", amount: "30 g" },
      { name: "枸杞", amount: "5 g" },
    ],
    steps: [
      "黑豆提前浸泡 2 小时。",
      "排骨焯水后与黑豆同炖 40 分钟。",
      "出锅前撒枸杞。",
    ],
    tips: ["汤汁油脂较高，建议撇去浮油后食用。"],
  },
  {
    id: "tcm-yam-soup",
    name: "山药枸杞鸡汤",
    slot: "晚餐",
    category: "tcm",
    kcal: 300,
    calcium: 80,
    tags: ["健脾益气", "药食同源"],
    tone: "bg-accent/10",
    fg: "text-accent",
    why: "山药健脾益气，鸡肉优质蛋白，帮助术后体力恢复。",
    ingredients: [
      { name: "鸡腿肉", amount: "150 g" },
      { name: "鲜山药", amount: "100 g" },
      { name: "枸杞", amount: "5 g" },
    ],
    steps: ["鸡肉焯水去腥。", "与山药同炖 30 分钟。", "出锅前加枸杞。"],
    tips: ["术后体虚乏力者可每周食用 2-3 次。"],
  },
  {
    id: "tcm-tea",
    name: "杜仲续断茶",
    slot: "加餐",
    category: "tcm",
    kcal: 15,
    calcium: 10,
    tags: ["强筋骨", "药食同源"],
    tone: "bg-success/10",
    fg: "text-success",
    why: "杜仲、续断均为传统强筋壮骨药材，适合术后恢复饮用。",
    ingredients: [
      { name: "杜仲", amount: "5 g" },
      { name: "续断", amount: "5 g" },
    ],
    steps: ["药材用 90℃ 热水焖泡 10 分钟即可饮用。"],
    tips: ["建议咨询医师后长期饮用。"],
  },
];

const VOICE_PRESET: MealEntry[] = [
  { name: "清炖牛肉", kcal: 260, protein: 28, calcium: 30, fat: 12 },
  { name: "米饭 1 碗", kcal: 232, protein: 4.8, calcium: 10, fat: 0.5 },
  { name: "清炒西兰花", kcal: 78, protein: 4, calcium: 60, fat: 3 },
];

const CAMERA_PRESET: MealEntry[] = [
  { name: "排骨汤（识别）", kcal: 380, protein: 26, calcium: 180, fat: 20 },
];

const SCAN_PRESET: MealEntry[] = [
  { name: "高钙奶 1 盒", kcal: 150, protein: 8, calcium: 300, fat: 8 },
];

export function DietView({ onClose }: { onClose: () => void }) {
  const [meals, setMeals] = useState<MealSlot[]>(INITIAL_MEALS);
  const [active, setActive] = useState<MealSlot | null>(null);
  const [method, setMethod] = useState<Method>("camera");
  const [toast, setToast] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{ meal: string; entries: MealEntry[] } | null>(null);
  const [recipe, setRecipe] = useState<Dish | null>(null);
  const [category, setCategory] = useState<DietCategory>("nutrition");

  const totals = useMemo(() => {
    const flat = meals.flatMap((m) => m.entries);
    return {
      kcal: flat.reduce((a, e) => a + e.kcal, 0),
      protein: flat.reduce((a, e) => a + e.protein, 0),
      calcium: flat.reduce((a, e) => a + e.calcium, 0),
      fat: flat.reduce((a, e) => a + e.fat, 0),
    };
  }, [meals]);

  const targetKcal = meals.reduce((a, m) => a + m.target, 0);
  const recordedSlots = meals.filter((m) => m.entries.length > 0).length;

  const pushToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 1800);
  };

  const onSaved = (slotId: string, entries: MealEntry[]) => {
    const slot = meals.find((m) => m.id === slotId)!;
    setMeals((prev) =>
      prev.map((m) => (m.id === slotId ? { ...m, entries: [...m.entries, ...entries] } : m)),
    );
    setActive(null);
    setAnalysis({ meal: slot.title, entries });
    pushToast(`已记录 ${entries.length} 项到${slot.title}`);
  };

  return (
    <QuickSheet
      title="饮食打卡"
      subtitle="骨科术后营养 · 高蛋白补钙"
      onClose={onClose}
      right={
        <span className="mr-1 shrink-0 whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-1.5 text-[11px] font-bold text-primary">
          营养餐 ›
        </span>
      }
    >
      <div className="min-h-full bg-background pb-4">
        <section className="px-4 pt-4 mb-3">
          <CategorySwitch value={category} onChange={setCategory} />
        </section>

        <section className="px-4">
          <div
            className="rounded-3xl p-5 text-primary-foreground shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, oklch(0.5 0.18 250) 100%)",
              boxShadow: "0 18px 40px -18px color-mix(in oklab, var(--primary) 60%, transparent)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="whitespace-nowrap bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em]">
                今日饮食 · {recordedSlots}/{meals.length} 餐
              </span>
              <Clock3 className="size-4 text-white/70" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[34px] font-extrabold tabular-nums leading-none">
                {Math.round(totals.kcal)}
              </span>
              <span className="text-[12px] font-semibold text-white/80">/ {targetKcal} kcal</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/20 mt-3 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${Math.min(100, (totals.kcal / targetKcal) * 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <MacroPill label="蛋白" value={`${Math.round(totals.protein)}g`} icon={<Beef className="size-3" />} />
              <MacroPill label="钙" value={`${Math.round(totals.calcium)}mg`} icon={<Bone className="size-3" />} />
              <MacroPill label="脂肪" value={`${Math.round(totals.fat)}g`} icon={<Droplets className="size-3" />} />
            </div>
          </div>
        </section>

        <section className="px-4 mt-5 space-y-3">
          {totals.kcal > 0 && (
            <DailyAISummary
              protein={totals.protein}
              calcium={totals.calcium}
              fat={totals.fat}
              targetKcal={targetKcal}
              kcal={totals.kcal}
            />
          )}
          {meals.map((m, idx) => (
            <MealCard
              key={m.id}
              meal={m}
              isFirst={idx === 0}
              category={category}
              onOpenDish={(d) => setRecipe(d)}
              onAdd={() => {
                setMethod("camera");
                setActive(m);
              }}
            />
          ))}
          <button
            onClick={() =>
              setMeals((prev) => [
                ...prev,
                makeSnackSlot(prev.filter((m) => m.key === "snack").length + 1),
              ])
            }
            className="w-full rounded-3xl bg-card ring-1 ring-dashed ring-foreground/15 p-4 flex items-center justify-center gap-2 text-[13px] font-bold text-foreground/60 active:bg-muted/40"
          >
            <Plus className="size-4" strokeWidth={3} />
            {meals.some((m) => m.key === "snack") ? "再加一次加餐" : "添加加餐 / 零食"}
            <span className="whitespace-nowrap text-[11px] font-semibold text-muted-foreground ml-1">
              （可选 · 可多次）
            </span>
          </button>
        </section>
      </div>

      {active && (
        <EntrySheet
          slot={active}
          method={method}
          onMethod={setMethod}
          onClose={() => setActive(null)}
          onSaved={(entries) => onSaved(active.id, entries)}
        />
      )}

      {analysis && (
        <AnalysisSheet mealName={analysis.meal} entries={analysis.entries} onClose={() => setAnalysis(null)} />
      )}

      {recipe && <RecipeSheet dish={recipe} onClose={() => setRecipe(null)} />}

      {toast && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-[60] pointer-events-none">
          <div className="whitespace-nowrap px-3.5 py-2 rounded-xl bg-foreground text-background text-[13px] font-semibold shadow-lg inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" /> {toast}
          </div>
        </div>
      )}
    </QuickSheet>
  );
}

function MacroPill({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/15 backdrop-blur rounded-xl py-2">
      <div className="whitespace-nowrap text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/70 inline-flex items-center gap-1 justify-center">
        {icon}
        {label}
      </div>
      <div className="text-[14px] font-extrabold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

function CategorySwitch({ value, onChange }: { value: DietCategory; onChange: (v: DietCategory) => void }) {
  const items: { k: DietCategory; label: string; desc: string }[] = [
    { k: "nutrition", label: "营养均衡", desc: "热量 · 蛋白 · 钙" },
    { k: "tcm", label: "药食同源", desc: "补肾 · 强筋 · 壮骨" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => {
        const isActive = value === it.k;
        return (
          <button
            key={it.k}
            onClick={() => onChange(it.k)}
            className={`rounded-2xl p-3 text-left ring-1 transition-all active:scale-[0.98] ${
              isActive ? "bg-primary text-primary-foreground ring-primary shadow-md" : "bg-card ring-black/[0.05] text-foreground/70"
            }`}
          >
            <div className="text-[14px] font-extrabold leading-tight">{it.label}</div>
            <div className={`whitespace-nowrap text-[11px] mt-0.5 ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
              {it.desc}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function DailyAISummary({
  kcal,
  targetKcal,
  protein,
  calcium,
  fat,
}: {
  kcal: number;
  targetKcal: number;
  protein: number;
  calcium: number;
  fat: number;
}) {
  const proteinTarget = 90; // g/day for post-op recovery
  const calciumTarget = 1000; // mg/day
  const proteinLow = protein < proteinTarget * 0.7;
  const calciumLow = calcium < calciumTarget * 0.6;
  void fat;
  void kcal;
  void targetKcal;

  const headline = proteinLow
    ? "蛋白摄入不足，建议增加肉蛋豆类"
    : calciumLow
      ? "钙摄入偏低，建议增加奶制品/豆制品"
      : "营养结构均衡，继续保持";

  return (
    <div className="rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 ring-1 ring-primary/15 bg-primary/[0.06]">
      <div className="size-7 rounded-xl grid place-items-center bg-primary text-primary-foreground shrink-0">
        <Sparkles className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-primary/80">AI 总结</div>
        <div className="text-[13px] font-bold text-foreground leading-snug truncate">{headline}</div>
      </div>
      <div className="whitespace-nowrap text-[11px] text-foreground/55 tabular-nums shrink-0 text-right leading-tight">
        <div>蛋白 {Math.round(protein)}g</div>
        <div className="text-[10px] text-muted-foreground">钙 {Math.round(calcium)}mg</div>
      </div>
    </div>
  );
}

function MealCard({
  meal,
  onAdd,
  onOpenDish,
  category = "nutrition",
}: {
  meal: MealSlot;
  onAdd: () => void;
  isFirst?: boolean;
  onOpenDish?: (d: Dish) => void;
  category?: DietCategory;
}) {
  const kcal = meal.entries.reduce((a, e) => a + e.kcal, 0);
  const empty = meal.entries.length === 0;
  const proG = Math.round((meal.target * 0.3) / 4);
  const fatG = Math.round((meal.target * 0.25) / 9);
  const calMg = Math.round(meal.target * 0.6);
  const dishes = DISHES.filter((d) => d.slot === meal.title && d.category === category);
  return (
    <div className="rounded-3xl bg-card ring-1 ring-black/[0.04] p-4" style={{ boxShadow: "0 4px 20px -6px rgba(15, 23, 42, 0.06)" }}>
      <div className="flex items-center gap-3">
        <div className={`size-11 rounded-2xl grid place-items-center shrink-0 ${meal.tone} ${meal.fg}`}>{meal.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-bold">{meal.title}</span>
            <span className="whitespace-nowrap text-[11px] text-muted-foreground">{meal.window}</span>
          </div>
          <div className="text-[12px] text-muted-foreground mt-0.5 tabular-nums">
            {empty ? (
              <span className="text-foreground/40">未打卡</span>
            ) : (
              <>
                {Math.round(kcal)} / {meal.target} kcal · {meal.entries.length} 项
              </>
            )}
          </div>
        </div>
        <button
          onClick={onAdd}
          aria-label={`记录${meal.title}`}
          className={`size-10 rounded-2xl grid place-items-center shrink-0 active:scale-95 transition-transform ${
            empty ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          <Plus className="size-5" strokeWidth={3} />
        </button>
      </div>

      {!empty && (
        <div className="mt-3 pt-3 border-t border-black/[0.05] space-y-1.5">
          {meal.entries.map((e, i) => (
            <div key={i} className="flex items-center justify-between text-[13px]">
              <span className="text-foreground/80 truncate">{e.name}</span>
              <span className="text-foreground/50 tabular-nums shrink-0 ml-2">{Math.round(e.kcal)} kcal</span>
            </div>
          ))}
          <MealSummaryInline meal={meal} />
        </div>
      )}

      {empty && (
        <div className="mt-3 pt-3 border-t border-black/[0.05]">
          <div className="flex items-center justify-between mb-2">
            <div className="whitespace-nowrap inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Sparkles className="size-3 text-primary" />
              本餐建议结构
            </div>
            <div className="whitespace-nowrap text-[11px] text-foreground/55 tabular-nums">≈ {meal.target} kcal</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <MacroChip tone="primary" label="蛋白" value={`${proG}g`} />
            <MacroChip tone="warning" label="钙" value={`${calMg}mg`} />
            <MacroChip tone="accent" label="脂肪" value={`${fatG}g`} />
          </div>

          {dishes.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="whitespace-nowrap inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <ChefHat className="size-3 text-primary" />
                  本餐推荐菜品
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {dishes.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onOpenDish?.(d)}
                    className="snap-start shrink-0 w-[170px] text-left rounded-2xl ring-1 ring-black/[0.05] bg-background p-2.5 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`size-9 rounded-xl grid place-items-center ${d.tone} ${d.fg}`}>
                        <ChefHat className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold tracking-tight truncate">{d.name}</div>
                        <div className="whitespace-nowrap text-[10.5px] text-muted-foreground tabular-nums">
                          {d.kcal} kcal · 钙 {d.calcium}mg
                        </div>
                      </div>
                    </div>
                    <div className="mt-1.5 text-[11px] text-foreground/55 leading-snug line-clamp-2">{d.why}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MealSummaryInline({ meal }: { meal: MealSlot }) {
  const kcal = meal.entries.reduce((a, e) => a + e.kcal, 0);
  const protein = meal.entries.reduce((a, e) => a + e.protein, 0);
  const calcium = meal.entries.reduce((a, e) => a + e.calcium, 0);
  const over = kcal > meal.target * 1.1;
  const tip = over
    ? `超出目标 ${Math.round(kcal - meal.target)} kcal，下一餐适当减少`
    : protein < 20
      ? "蛋白略低，补一份肉/蛋/豆制品"
      : calcium < 150
        ? "钙摄入偏低，建议加一杯牛奶或豆制品"
        : "结构均衡，继续保持";
  return (
    <div className="mt-2 rounded-2xl bg-primary/[0.06] ring-1 ring-primary/15 px-3 py-2 flex items-center gap-2">
      <div className="size-6 rounded-lg grid place-items-center bg-primary text-primary-foreground shrink-0">
        <Sparkles className="size-3" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-primary/80">本餐 AI 总结</div>
        <div className="text-[13px] font-bold text-foreground/85 leading-snug truncate">{tip}</div>
      </div>
      <div className="whitespace-nowrap text-[11px] tabular-nums text-foreground/55 shrink-0 text-right leading-tight">
        <div>蛋白 {Math.round(protein)}g</div>
        <div className="text-[10px] text-muted-foreground">钙 {Math.round(calcium)}mg</div>
      </div>
    </div>
  );
}

function MacroChip({ tone, label, value }: { tone: "warning" | "primary" | "accent"; label: string; value: string }) {
  const toneCls =
    tone === "warning" ? "bg-warning/10 text-warning" : tone === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent";
  return (
    <div className="rounded-xl bg-muted/40 py-1.5">
      <div className={`whitespace-nowrap inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold ${toneCls}`}>{label}</div>
      <div className="mt-0.5 text-[13px] font-extrabold tabular-nums leading-none">{value}</div>
    </div>
  );
}

function EntrySheet({
  slot,
  method,
  onMethod,
  onClose,
  onSaved,
}: {
  slot: MealSlot;
  method: Method;
  onMethod: (m: Method) => void;
  onClose: () => void;
  onSaved: (entries: MealEntry[]) => void;
}) {
  const [recognizing, setRecognizing] = useState(false);
  const [recognized, setRecognized] = useState<MealEntry[]>([]);
  const [voiceText, setVoiceText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecognized([]);
    setRecognizing(false);
    setVoiceText("");
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [method, slot.key]);

  const startRecognize = (preset: MealEntry[], voiceLine?: string) => {
    setRecognizing(true);
    setRecognized([]);
    if (voiceLine) setVoiceText(voiceLine);
    timerRef.current = setTimeout(() => {
      setRecognizing(false);
      setRecognized(preset);
    }, 1100);
  };

  const canSave = recognized.length > 0;

  return (
    <div className="absolute inset-0 z-[55] flex flex-col justify-end">
      <button aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative w-full mt-auto bg-background rounded-t-[32px] shadow-2xl h-[88%] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="pt-3 pb-2 grid place-items-center">
          <div className="w-12 h-1.5 rounded-full bg-foreground/15" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <div className="flex items-center gap-3">
            <div className={`size-11 rounded-2xl grid place-items-center ${slot.tone} ${slot.fg}`}>{slot.icon}</div>
            <div>
              <div className="text-[17px] font-bold leading-tight tracking-tight">记录{slot.title}</div>
              <div className="whitespace-nowrap text-[10.5px] font-bold text-muted-foreground uppercase tracking-[0.12em] mt-0.5">
                目标 {slot.target} kcal · {slot.window}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full grid place-items-center bg-muted active:bg-muted/70">
            <X className="size-4 text-foreground/60" />
          </button>
        </div>

        <div className="px-5">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-muted/70">
            {(
              [
                { k: "camera", l: "拍照", i: <Camera className="size-3.5" /> },
                { k: "voice", l: "语音", i: <Mic className="size-3.5" /> },
                { k: "scan", l: "扫码", i: <ScanLine className="size-3.5" /> },
              ] as { k: Method; l: string; i: React.ReactNode }[]
            ).map((t) => {
              const isActive = method === t.k;
              return (
                <button
                  key={t.k}
                  onClick={() => onMethod(t.k)}
                  className={`flex items-center justify-center gap-1 py-2 rounded-xl text-[13px] font-bold transition-colors ${
                    isActive ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {t.i}
                  {t.l}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 mt-4 overflow-y-auto" style={{ maxHeight: "55vh" }}>
          {method === "camera" && (
            <button
              onClick={() => startRecognize(CAMERA_PRESET)}
              disabled={recognizing}
              className="w-full aspect-[5/3] rounded-2xl ring-1 ring-dashed ring-primary/40 bg-primary/[0.04] grid place-items-center text-center px-6"
            >
              {recognizing ? (
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Loader2 className="size-7 animate-spin" />
                  <div className="text-[13px] font-bold">AI 识别中…</div>
                </div>
              ) : recognized.length > 0 ? (
                <div className="flex flex-col items-center gap-1 text-foreground/70">
                  <CheckCircle2 className="size-7 text-success" />
                  <div className="text-[13px] font-bold">识别完成 · 可重新拍照</div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-foreground/60">
                  <div className="size-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-lg">
                    <Camera className="size-5" />
                  </div>
                  <div className="text-[14px] font-bold text-foreground">点击拍照</div>
                  <div className="text-[11px]">对准餐盘，AI 自动识别食物与份量</div>
                </div>
              )}
            </button>
          )}

          {method === "voice" && (
            <div className="space-y-3">
              <button
                onClick={() => startRecognize(VOICE_PRESET, "我中午吃了清炖牛肉、一碗米饭，还有清炒西兰花")}
                disabled={recognizing}
                className="w-full rounded-2xl ring-1 ring-dashed ring-accent/50 bg-accent/[0.05] py-7 grid place-items-center"
              >
                {recognizing ? (
                  <div className="flex flex-col items-center gap-2 text-accent">
                    <Loader2 className="size-7 animate-spin" />
                    <div className="text-[13px] font-bold">理解中…</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-foreground/60">
                    <div className="size-14 rounded-full grid place-items-center text-primary-foreground shadow-lg bg-accent">
                      <Mic className="size-6" />
                    </div>
                    <div className="text-[14px] font-bold text-foreground">按住说话</div>
                    <div className="text-[11px]">"我中午吃了一碗排骨汤 + 一份青菜"</div>
                  </div>
                )}
              </button>
              {voiceText && (
                <div className="rounded-xl bg-muted/60 px-3 py-2.5 text-[13px] text-foreground/75 leading-relaxed">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground mr-2">识别</span>
                  {voiceText}
                </div>
              )}
            </div>
          )}

          {method === "scan" && (
            <button
              onClick={() => startRecognize(SCAN_PRESET)}
              disabled={recognizing}
              className="w-full aspect-square max-h-[260px] rounded-2xl ring-1 ring-dashed ring-foreground/20 bg-foreground/[0.03] grid place-items-center"
            >
              {recognizing ? (
                <Loader2 className="size-7 animate-spin text-primary" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-foreground/60">
                  <ScanLine className="size-9" />
                  <div className="text-[14px] font-bold text-foreground">对准包装条码</div>
                  <div className="text-[11px]">自动读取热量与营养成分表</div>
                </div>
              )}
            </button>
          )}

          {recognized.length > 0 && (
            <div className="mt-4">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">AI 识别结果（可编辑）</div>
              <div className="rounded-2xl ring-1 ring-black/[0.05] bg-card overflow-hidden">
                {recognized.map((e, i) => (
                  <div key={i} className={`flex items-center justify-between px-3.5 py-3 ${i > 0 ? "border-t border-black/[0.05]" : ""}`}>
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold truncate">{e.name}</div>
                      <div className="whitespace-nowrap text-[11px] text-muted-foreground tabular-nums">
                        蛋白 {e.protein}g · 钙 {e.calcium}mg · 脂肪 {e.fat}g
                      </div>
                    </div>
                    <div className="text-[14px] font-extrabold tabular-nums text-foreground/80 shrink-0 ml-3">
                      {Math.round(e.kcal)}
                      <span className="text-[10px] font-bold text-muted-foreground ml-0.5">kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pt-3 pb-5 mt-2 border-t border-black/[0.04] bg-background">
          <button
            onClick={() => onSaved(recognized)}
            disabled={!canSave}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-[15px] font-bold disabled:opacity-40 disabled:cursor-not-allowed active:bg-primary/90"
          >
            保存到 {slot.title}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecipeSheet({ dish, onClose }: { dish: Dish; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-[55] flex flex-col justify-end">
      <button aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative w-full bg-background rounded-t-[32px] shadow-2xl h-[88%] flex flex-col animate-in slide-in-from-bottom duration-300 mt-auto">
        <div className="pt-3 pb-2 grid place-items-center">
          <div className="w-12 h-1.5 rounded-full bg-foreground/15" />
        </div>

        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <div className="flex items-center gap-3">
            <div className={`size-12 rounded-2xl grid place-items-center ${dish.tone} ${dish.fg}`}>
              <ChefHat className="size-6" />
            </div>
            <div>
              <div className="text-[17px] font-bold leading-tight tracking-tight">{dish.name}</div>
              <div className="whitespace-nowrap text-[10.5px] font-bold text-muted-foreground uppercase tracking-[0.12em] mt-0.5">
                {dish.slot} · {dish.kcal} kcal · 钙 {dish.calcium}mg
              </div>
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full grid place-items-center bg-muted active:bg-muted/70">
            <X className="size-4 text-foreground/60" />
          </button>
        </div>

        <div className="px-5 overflow-y-auto pb-6 flex-1 min-h-0">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {dish.tags.map((t) => (
              <span key={t} className={`whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-bold ${dish.tone} ${dish.fg}`}>
                {t}
              </span>
            ))}
          </div>

          <div className="rounded-2xl bg-primary/[0.06] ring-1 ring-primary/15 p-3 flex items-start gap-2">
            <Heart className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="text-[13px] text-foreground/80 leading-relaxed">
              <b className="text-primary">为什么推荐：</b>
              {dish.why}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">食材清单</div>
            <div className="rounded-2xl ring-1 ring-black/[0.05] bg-card overflow-hidden">
              {dish.ingredients.map((it, i) => (
                <div key={i} className={`flex items-center justify-between px-3.5 py-2.5 text-[13px] ${i > 0 ? "border-t border-black/[0.05]" : ""}`}>
                  <span className="text-foreground/80">{it.name}</span>
                  <span className="text-foreground/55 tabular-nums">{it.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">做法步骤</div>
            <ol className="space-y-2.5">
              {dish.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="shrink-0 size-6 rounded-full bg-primary text-primary-foreground text-[12px] font-extrabold grid place-items-center tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-[13px] text-foreground/85 leading-relaxed pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {dish.tips.length > 0 && (
            <div className="mt-5 rounded-2xl bg-warning/[0.08] ring-1 ring-warning/20 p-3">
              <div className="whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.12em] text-warning mb-1.5 inline-flex items-center gap-1">
                <Flag className="size-3" />
                健康提示
              </div>
              {dish.tips.map((t, i) => (
                <div key={i} className="text-[13px] text-foreground/80 leading-relaxed">
                  · {t}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisSheet({ mealName, entries, onClose }: { mealName: string; entries: MealEntry[]; onClose: () => void }) {
  const totals = entries.reduce(
    (a, e) => ({
      kcal: a.kcal + e.kcal,
      protein: a.protein + e.protein,
      calcium: a.calcium + e.calcium,
      fat: a.fat + e.fat,
    }),
    { kcal: 0, protein: 0, calcium: 0, fat: 0 },
  );

  const proteinLow = totals.protein < 20;
  const calciumLow = totals.calcium < 150;
  const fatHigh = totals.fat > 25;

  return (
    <div className="absolute inset-0 z-[56] flex flex-col justify-end">
      <button aria-label="关闭" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full mt-auto bg-background rounded-t-[32px] shadow-2xl max-h-[94%] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="pt-3 pb-2 grid place-items-center">
          <div className="w-12 h-1.5 rounded-full bg-foreground/15" />
        </div>

        <div className="flex items-center justify-between px-5 pt-1 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-2xl grid place-items-center text-primary-foreground bg-accent">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="text-[16px] font-bold leading-tight">{mealName}饮食结构分析</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">AI 营养师 · 基于您的康复档案</div>
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full grid place-items-center bg-muted">
            <X className="size-4 text-foreground/60" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-6 space-y-4">
          <div
            className="rounded-3xl p-5 text-primary-foreground"
            style={{ background: "linear-gradient(135deg, oklch(0.62 0.16 215), oklch(0.58 0.16 250))" }}
          >
            <div className="flex items-baseline gap-1.5">
              <Flame className="size-4 mt-0.5" />
              <span className="text-[28px] font-extrabold tabular-nums leading-none">{Math.round(totals.kcal)}</span>
              <span className="text-[12px] font-semibold text-white/80">kcal 本餐</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-[11px]">
              <Legend label="蛋白" value={`${Math.round(totals.protein)}g`} />
              <Legend label="钙" value={`${Math.round(totals.calcium)}mg`} />
              <Legend label="脂肪" value={`${Math.round(totals.fat)}g`} />
            </div>
          </div>

          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">结构评估</div>
            <div className="space-y-2">
              <Finding
                ok={!proteinLow}
                title={proteinLow ? "蛋白质不足" : "蛋白摄入足够"}
                desc={proteinLow ? `蛋白仅 ${Math.round(totals.protein)}g，建议增加肉/蛋/豆制品。` : "有助于伤口愈合与肌肉维持。"}
              />
              <Finding
                ok={!calciumLow}
                title={calciumLow ? "钙摄入不足" : "钙摄入充足"}
                desc={calciumLow ? `本餐钙仅 ${Math.round(totals.calcium)}mg，建议搭配奶制品或豆制品。` : "有助于骨骼修复与骨密度维持。"}
              />
              <Finding
                ok={!fatHigh}
                title={fatHigh ? "脂肪偏高" : "脂肪比例合理"}
                desc={fatHigh ? "脂肪较高不利于体重控制，建议减少油炸与肥肉。" : "控制体重有助于减轻关节负担。"}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-card ring-1 ring-black/[0.05] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-7 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <Sparkles className="size-3.5" />
              </div>
              <div className="text-[14px] font-bold">下一餐建议</div>
            </div>
            <ul className="space-y-2 text-[13px] text-foreground/75 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">●</span>
                优先摄入优质蛋白（鱼 / 鸡胸 / 豆腐）≥ 80g，助力伤口愈合。
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">●</span>
                每日保证 1-2 杯牛奶或等量豆制品，补充钙质。
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-0.5">●</span>
                控制总热量与油脂摄入，减轻关节负担。
              </li>
            </ul>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-black/[0.04] bg-background">
          <button onClick={onClose} className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-[15px] font-bold active:bg-primary/90">
            知道了，继续记录
          </button>
        </div>
      </div>
    </div>
  );
}

function Finding({ ok, title, desc }: { ok: boolean; title: string; desc: string }) {
  return (
    <div className={`rounded-2xl p-3 flex items-start gap-2.5 ring-1 ${ok ? "bg-success/[0.06] ring-success/15" : "bg-warning/[0.07] ring-warning/20"}`}>
      <div className={`size-7 rounded-xl grid place-items-center shrink-0 ${ok ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
        {ok ? <TrendingDown className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-bold leading-tight">{title}</div>
        <div className="text-[12px] text-foreground/65 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

function Legend({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-xl py-1.5 text-center">
      <div className="whitespace-nowrap inline-flex items-center gap-1 text-white/85">{label}</div>
      <div className="font-extrabold tabular-nums text-[13px] mt-0.5 whitespace-nowrap">{value}</div>
    </div>
  );
}
