import { useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronRight,
  Activity,
  AlertTriangle,
  Info,
  RefreshCw,
  CheckCircle2,
  Trophy,
  Utensils,
  History,
  Plus,
  Minus,
  Clock,
  FileText,
  Stethoscope,
  ChevronDown,
  X,
  Award,
  Play,
  CheckCircle,
  Crown,
  Sparkles,
  ShieldCheck,
  Lock,
  HeartPulse,
  Footprints,
  Dumbbell,
  Salad,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { QuickSheet, QuickToast } from "@/components/quick/QuickSheet";

/** ---------------- 类型 ---------------- */
type PlanKey = "nutrition" | "herbal";
type TagKind = "disease" | "lifestyle";
type TagEvent = { type: "added" | "removed"; date: string; reason: string; source: string };
type TagItem = {
  name: string;
  kind: TagKind;
  active: boolean;
  since?: string;
  obtainedReason: string;
  obtainedSource: string;
  events: TagEvent[];
};

/** ---------------- 数据（骨科 / 关节置换康复） ---------------- */
const DATES = [
  { d: "06/11", label: "今天" },
  { d: "06/12", label: "明天" },
  { d: "06/13" },
  { d: "06/14" },
  { d: "06/15" },
  { d: "06/16" },
  { d: "06/17" },
];

const DISEASE_TAGS: TagItem[] = [
  {
    name: "右膝关节置换术后",
    kind: "disease",
    active: true,
    since: "2026-03-02",
    obtainedReason: "全膝关节置换术（TKA）后第 18 天，处于中期康复阶段，屈膝角度 96°。",
    obtainedSource: "骨科住院病历 · 术后随访",
    events: [{ type: "added", date: "2026-03-02", source: "骨科 · 陈磊主任", reason: "右膝重度骨关节炎，行 TKA 手术，术后进入康复计划。" }],
  },
  {
    name: "骨质疏松",
    kind: "disease",
    active: true,
    since: "2025-11-20",
    obtainedReason: "骨密度检测 T 值 -2.8，符合骨质疏松诊断标准，术后骨愈合需重点关注。",
    obtainedSource: "骨密度检测报告（DXA）",
    events: [{ type: "added", date: "2025-11-20", source: "骨密度中心", reason: "腰椎 T 值 -2.8，股骨颈 T 值 -2.6，诊断骨质疏松。" }],
  },
];

const LIFESTYLE_TAGS: TagItem[] = [
  {
    name: "屈膝角度不足",
    kind: "lifestyle",
    active: true,
    since: "2026-03-10",
    obtainedReason: "康复评估显示主动屈膝角度 96°，低于术后 3 周目标值 100°。",
    obtainedSource: "康复治疗师 · 关节角度测量",
    events: [{ type: "added", date: "2026-03-10", source: "康复治疗师", reason: "术后 3 周主动屈膝 96°，需加强牵伸训练。" }],
  },
  {
    name: "股四头肌力弱",
    kind: "lifestyle",
    active: true,
    since: "2026-03-05",
    obtainedReason: "直腿抬高测试无法维持 10 秒，股四头肌肌力评级 3 级。",
    obtainedSource: "康复评估表",
    events: [{ type: "added", date: "2026-03-05", source: "康复评估", reason: "直腿抬高维持仅 4 秒，肌力 3 级，需强化训练。" }],
  },
  {
    name: "久坐少动",
    kind: "lifestyle",
    active: true,
    since: "2026-03-08",
    obtainedReason: "近 7 日日均下床活动时长不足 40 分钟，DVT（深静脉血栓）风险偏高。",
    obtainedSource: "护理站活动记录",
    events: [{ type: "added", date: "2026-03-08", source: "责任护士", reason: "近 7 日日均活动 38 分钟，低于建议 60 分钟。" }],
  },
  {
    name: "蛋白摄入不足",
    kind: "lifestyle",
    active: true,
    since: "2026-03-12",
    obtainedReason: "膳食记录显示日均蛋白质摄入约 48g，低于术后康复建议量 1.2g/kg。",
    obtainedSource: "饮食打卡 · 自动识别",
    events: [{ type: "added", date: "2026-03-12", source: "饮食打卡", reason: "近 7 天日均蛋白 48g，未达康复期目标。" }],
  },
];

const REMOVED_TAGS: TagItem[] = [
  {
    name: "术后剧烈疼痛",
    kind: "lifestyle",
    active: false,
    obtainedReason: "术后第 2 天 VAS 疼痛评分 7 分。",
    obtainedSource: "疼痛评估量表",
    events: [
      { type: "added", date: "2026-03-04", source: "护理评估", reason: "VAS 评分 7 分，需药物镇痛联合冰敷。" },
      { type: "removed", date: "2026-03-14", source: "疼痛随访", reason: "VAS 降至 2 分，改为按需口服镇痛。" },
    ],
  },
  {
    name: "行走需助行器",
    kind: "lifestyle",
    active: false,
    obtainedReason: "术后早期下肢负重能力不足，需借助助行器行走。",
    obtainedSource: "康复治疗师评估",
    events: [
      { type: "added", date: "2026-03-03", source: "康复评估", reason: "部分负重期，需助行器辅助行走。" },
      { type: "removed", date: "2026-03-20", source: "康复评估", reason: "可独立拄单拐行走 100 米，脱离助行器。" },
    ],
  },
  {
    name: "深静脉血栓风险",
    kind: "disease",
    active: false,
    obtainedReason: "D-二聚体 1.8 mg/L，卧床时间长，DVT 风险评分较高。",
    obtainedSource: "术后凝血功能检查",
    events: [
      { type: "added", date: "2026-03-02", source: "术后检验", reason: "D-二聚体升高，Caprini 评分 5 分，属高危。" },
      { type: "removed", date: "2026-03-16", source: "复查报告", reason: "规律抗凝 + 踝泵训练后复查 D-二聚体降至正常。" },
    ],
  },
];

type ExerciseVideo = { id: string; title: string; coach: string; badge: string; duration: string; views: string; kind: "champion" | "tutorial" };
type ExercisePlan = {
  id: string;
  name: string;
  icon: LucideIcon;
  cover: string;
  level: "入门" | "进阶";
  slot: string;
  duration: string;
  target: string;
  todayDone: boolean;
  streak: number;
  reasons: string[];
  videos: ExerciseVideo[];
};
const EXERCISE_PLANS: ExercisePlan[] = [
  {
    id: "p1",
    name: "踝泵运动",
    icon: Footprints,
    cover: "linear-gradient(135deg, #bae6fd 0%, #0284c7 100%)",
    level: "入门",
    slot: "全天多次 · 每小时 1 组",
    duration: "3-5 分钟/组",
    target: "10 组 × 每组 10 次",
    todayDone: true,
    streak: 12,
    reasons: ["术后早期", "预防深静脉血栓", "促进消肿"],
    videos: [
      { id: "v1a", title: "踝泵运动标准做法 · 防血栓", coach: "陈磊", badge: "骨科主任医师", duration: "03:12", views: "9.8 万", kind: "champion" },
      { id: "v1b", title: "卧床踝泵基础教程", coach: "康复治疗师", badge: "通用教学", duration: "02:30", views: "2.4 万", kind: "tutorial" },
    ],
  },
  {
    id: "p2",
    name: "直腿抬高训练",
    icon: Dumbbell,
    cover: "linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)",
    level: "入门",
    slot: "上午 09:30 / 下午 16:00",
    duration: "10 分钟",
    target: "3 组 × 每侧 10 次，维持 5 秒",
    todayDone: false,
    streak: 5,
    reasons: ["股四头肌力弱", "关节置换术后", "预防肌肉萎缩"],
    videos: [
      { id: "v2a", title: "直腿抬高强化股四头肌", coach: "邹凯", badge: "运动康复冠军团队", duration: "10:20", views: "6.5 万", kind: "champion" },
      { id: "v2b", title: "居家直腿抬高基础版", coach: "康复治疗师", badge: "通用教学", duration: "08:00", views: "1.5 万", kind: "tutorial" },
    ],
  },
  {
    id: "p3",
    name: "屈膝角度训练",
    icon: Activity,
    cover: "linear-gradient(135deg, #ddd6fe 0%, #7c3aed 100%)",
    level: "进阶",
    slot: "晚上 19:30",
    duration: "15 分钟",
    target: "屈膝 ≥ 100° · 维持 30 秒 × 5 次",
    todayDone: false,
    streak: 3,
    reasons: ["屈膝角度不足", "关节僵硬预防", "康复进度达标"],
    videos: [
      { id: "v3a", title: "术后屈膝角度渐进牵伸法", coach: "陈磊", badge: "骨科主任医师", duration: "15:00", views: "5.1 万", kind: "champion" },
      { id: "v3b", title: "床边屈膝训练教学", coach: "康复治疗师", badge: "通用教学", duration: "09:40", views: "1.1 万", kind: "tutorial" },
    ],
  },
];

const EXERCISE_RISKS = [
  { level: "停止", text: "训练中出现关节剧痛、明显肿胀发热或伤口渗液，立即停止并联系主刀医生" },
  { level: "暂缓", text: "体温 >38℃、切口红肿渗液、小腿肿胀伴压痛（警惕血栓）时暂缓运动并就医" },
  { level: "防护", text: "训练前热敷 10 分钟、佩戴护膝支具，避免深蹲、盘腿等大角度屈膝动作" },
];

type MealItem = { name: string; grams: string; kcal: number; herb?: boolean; steps?: string[]; tip?: string; video?: { title: string; chef: string; badge: string; duration: string } };
type GenericGroup = { label: string; portion: string; examples: string[]; note?: string };
const GENERIC_MEALS: Record<string, { intro: string; groups: GenericGroup[] }> = {
  b: {
    intro: "推荐结构：优质蛋白 + 高钙食物 + 粗细搭配主食",
    groups: [
      { label: "优质蛋白", portion: "1-2 份", examples: ["鸡蛋 1 个", "牛奶 250ml", "豆浆 300ml"] },
      { label: "高钙食物", portion: "1 份", examples: ["芝麻酱", "奶酪", "小虾皮"] },
      { label: "粗细搭配主食", portion: "50-75 克", examples: ["燕麦片", "全麦馒头", "杂粮粥"] },
    ],
  },
  l: {
    intro: "推荐结构：高蛋白主菜 + 补钙食材 + 深色蔬菜",
    groups: [
      { label: "高蛋白主菜", portion: "100-150 克", examples: ["鲈鱼", "鸡胸肉", "牛肉", "豆腐"], note: "术后康复期每日蛋白建议 1.2-1.5g/kg" },
      { label: "补钙食材", portion: "1 份", examples: ["虾皮豆腐汤", "牛奶炖蛋", "黑芝麻糊"] },
      { label: "深色蔬菜", portion: "≥ 200 克", examples: ["西兰花", "油菜", "紫甘蓝"] },
    ],
  },
  d: {
    intro: "推荐结构：易消化蛋白 + 药食同源汤品 + 适量主食",
    groups: [
      { label: "易消化蛋白", portion: "75-100 克", examples: ["清蒸鱼", "蒸蛋羹", "豆腐"] },
      { label: "药食同源汤品", portion: "1 份", examples: ["杜仲猪骨汤", "山药排骨汤"], note: "杜仲、骨碎补需遵医嘱使用" },
      { label: "适量主食", portion: "50 克", examples: ["小米粥", "山药", "红薯"] },
    ],
  },
};

const MEALS: { key: string; title: string; kcal: number; items: MealItem[] }[] = [
  {
    key: "b",
    title: "早餐",
    kcal: 410,
    items: [
      {
        name: "牛奶蒸蛋",
        grams: "220 克",
        kcal: 165,
        steps: ["鸡蛋 1 个打散，加入等量温牛奶搅匀", "过筛去泡，加保鲜膜蒸 8 分钟", "出锅后可撒少许亚麻籽"],
        tip: "牛奶+鸡蛋双重优质蛋白与钙，助骨愈合",
        video: { title: "术后高蛋白蒸蛋", chef: "李建国", badge: "临床营养师", duration: "03:10" },
      },
      {
        name: "全麦馒头",
        grams: "60 克",
        kcal: 145,
        steps: ["全麦面粉发酵 1 小时", "揉成小馒头蒸 15 分钟"],
        tip: "粗细搭配，避免久卧便秘",
        video: { title: "松软全麦馒头", chef: "王慧敏", badge: "三甲营养科主任", duration: "04:00" },
      },
      {
        name: "芝麻酱拌菠菜",
        grams: "100 克",
        kcal: 100,
        herb: true,
        steps: ["菠菜焯水后切段", "拌入芝麻酱、少许香油", "可加枸杞点缀（药食同源 · 补肝肾）"],
        tip: "芝麻酱富含钙质，助力骨骼修复",
        video: { title: "补钙凉拌菜做法", chef: "孙慧君", badge: "中医药膳师", duration: "03:30" },
      },
    ],
  },
  {
    key: "l",
    title: "午餐",
    kcal: 560,
    items: [
      {
        name: "杂粮饭",
        grams: "100 克(生重)",
        kcal: 230,
        steps: ["糙米、小米按 2:1 混合", "浸泡 30 分钟后蒸煮 40 分钟"],
        tip: "术后活动量少，主食适量控制体重减轻关节负担",
        video: { title: "杂粮饭软糯做法", chef: "王慧敏", badge: "三甲营养科主任", duration: "03:50" },
      },
      {
        name: "清蒸鲈鱼",
        grams: "150 克",
        kcal: 180,
        steps: ["鲈鱼洗净打花刀，姜丝铺底", "水开后蒸 8 分钟", "淋少许蒸鱼豉油，撒葱丝"],
        tip: "鱼肉优质蛋白+欧米伽3，助伤口愈合抗炎",
        video: { title: "术后高蛋白清蒸鱼", chef: "陈晓明", badge: "国家高级烹饪师", duration: "05:00" },
      },
      {
        name: "虾皮炒西兰花",
        grams: "200 克",
        kcal: 150,
        steps: ["西兰花掰小朵焯水", "虾皮温水泡洗", "热锅蒜末爆香，下西兰花与虾皮快炒"],
        tip: "虾皮补钙效果佳，适合骨质疏松人群",
        video: { title: "补钙快手炒菜", chef: "陈晓明", badge: "国家高级烹饪师", duration: "03:15" },
      },
    ],
  },
  {
    key: "d",
    title: "晚餐",
    kcal: 430,
    items: [
      {
        name: "山药排骨汤",
        grams: "300 克",
        kcal: 210,
        herb: true,
        steps: ["排骨焯水去血沫", "加姜片、山药炖煮 40 分钟", "出锅前加少量枸杞、杜仲（药食同源，遵医嘱适量）"],
        tip: "山药健脾益气，排骨补钙，适合术后康复期",
        video: { title: "术后康复汤品 · 山药排骨汤", chef: "孙慧君", badge: "中医药膳师", duration: "06:20" },
      },
      {
        name: "蒜蓉油麦菜",
        grams: "180 克",
        kcal: 90,
        steps: ["油麦菜洗净切段", "蒜末爆香大火快炒 30 秒", "少油少盐出锅"],
        tip: "夜间蔬菜促排便，减少久卧便秘风险",
        video: { title: "少油快炒绿叶菜", chef: "陈晓明", badge: "国家高级烹饪师", duration: "02:40" },
      },
      {
        name: "小米山药粥",
        grams: "200 克",
        kcal: 130,
        steps: ["小米淘洗，山药去皮切块", "同煮 30 分钟至软糯"],
        tip: "晚餐易消化，减轻卧床期肠胃负担",
        video: { title: "养胃小米山药粥", chef: "李建国", badge: "临床营养师", duration: "03:00" },
      },
    ],
  },
];

/** ---------------- 小组件 ---------------- */
function InFrameSheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-[55] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/45 animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative bg-background rounded-t-2xl max-h-[82%] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        <button onClick={onClose} className="absolute top-3 right-3 z-10 size-7 rounded-full bg-muted/70 grid place-items-center active:bg-muted" aria-label="关闭">
          <X className="size-3.5 text-foreground/70" />
        </button>
        {children}
      </div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="size-2.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-foreground/75">{label}</span>
      <span className="ml-auto tabular-nums text-foreground/55 text-[12px]">{value}</span>
    </div>
  );
}

function NutritionRing({ carb, fat, protein, kcal }: { carb: number; fat: number; protein: number; kcal: number }) {
  const total = carb + fat + protein;
  const c = (carb / total) * 100;
  const f = (fat / total) * 100;
  const r = 38;
  const C = 2 * Math.PI * r;
  return (
    <div className="relative size-[110px] shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="11" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#38BDF8" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${(c / 100) * C} ${C}`} />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#2563EB" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${(f / 100) * C} ${C}`} strokeDashoffset={-((c / 100) * C)} />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#F59E0B" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${((100 - c - f) / 100) * C} ${C}`} strokeDashoffset={-(((c + f) / 100) * C)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[16px] font-extrabold tabular-nums">{kcal}</div>
          <div className="text-[10px] text-muted-foreground">Kcal</div>
        </div>
      </div>
    </div>
  );
}

function TimelineList({ events, compact = false }: { events: TagEvent[]; compact?: boolean }) {
  return (
    <ol className="relative border-l-2 border-dashed border-border ml-2 space-y-3 pl-4">
      {events.map((e, i) => {
        const added = e.type === "added";
        return (
          <li key={i} className="relative">
            <span className={`absolute -left-[22px] top-0.5 size-4 rounded-full grid place-items-center ring-2 ring-background ${added ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
              {added ? <Plus className="size-2.5" /> : <Minus className="size-2.5" />}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[12.5px] font-bold ${added ? "text-warning" : "text-success"}`}>{added ? "新增标签" : "移除标签"}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">{e.date}</span>
            </div>
            <p className={`mt-0.5 text-foreground/80 leading-relaxed ${compact ? "text-[12px]" : "text-[13px]"}`}>{e.reason}</p>
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Stethoscope className="size-3" />
              {e.source}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function TagBlock({ icon, title, tags, tagClass, onTagClick }: { icon: ReactNode; title: string; tags: TagItem[]; tagClass: string; onTagClick: (t: TagItem) => void }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className="w-1 h-3.5 rounded-full bg-primary" />
        <span className="text-[14px] font-bold">{title}</span>
        <span className="text-primary/70">{icon}</span>
        <span className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap">点击查看获得原因</span>
      </div>
      <div className="flex flex-wrap gap-1.5 pl-2.5">
        {tags.map((t) => (
          <button key={t.name} onClick={() => onTagClick(t)} className={`text-[13px] font-semibold px-2.5 py-1 rounded-md ring-1 inline-flex items-center gap-1 whitespace-nowrap active:scale-95 transition-transform ${tagClass}`}>
            {t.name}
            <Info className="size-3 opacity-60 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function TagDetailContent({ tag }: { tag: TagItem }) {
  const isDisease = tag.kind === "disease";
  return (
    <div>
      <div className={`px-5 pt-5 pb-4 ${isDisease ? "bg-destructive/5" : "bg-warning/5"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[14px] font-bold px-2.5 py-1 rounded-md ring-1 whitespace-nowrap ${isDisease ? "text-destructive bg-destructive/10 ring-destructive/20" : "text-warning bg-warning/10 ring-warning/20"}`}>{tag.name}</span>
          <span className="text-[12px] text-muted-foreground">{isDisease ? "专病标签" : "生活方式标签"}</span>
        </div>
        <h3 className="mt-2 text-[16px] font-bold">获得原因</h3>
        <p className="mt-1 text-[13.5px] leading-relaxed text-foreground/75">{tag.obtainedReason}</p>
        <div className="flex items-center gap-1.5 pt-2 text-[12px] text-muted-foreground flex-wrap">
          <FileText className="size-3" />
          来源：{tag.obtainedSource}
          {tag.since && <span className="ml-1">· 标记于 {tag.since}</span>}
        </div>
      </div>
      <div className="px-5 py-4 bg-card">
        <div className="flex items-center gap-1.5 mb-3">
          <Clock className="size-3.5 text-primary" />
          <span className="text-[14px] font-bold">该标签的变化记录</span>
        </div>
        <TimelineList events={tag.events} />
      </div>
    </div>
  );
}

function TagHistoryContent() {
  return (
    <div className="p-5">
      <h3 className="text-[17px] font-bold">标签变更历史</h3>
      <p className="mt-1 text-[13px] text-muted-foreground">您已成功移除 {REMOVED_TAGS.length} 个标签，康复进展顺利！</p>
      <div className="mt-4 space-y-3">
        {REMOVED_TAGS.map((t) => (
          <div key={t.name} className="rounded-xl ring-1 ring-border bg-muted p-3">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold line-through decoration-muted-foreground/60 text-muted-foreground">{t.name}</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-success/10 text-success ring-1 ring-success/20 inline-flex items-center gap-0.5 whitespace-nowrap">
                  <CheckCircle2 className="size-2.5" /> 已移除
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">{t.kind === "disease" ? "专病" : "生活方式"}</span>
            </div>
            <TimelineList events={t.events} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

function MealCard({ meal, defaultOpen = false, purchased = false, mealKey, onSwap }: { meal: { title: string; kcal: number; items: MealItem[] }; defaultOpen?: boolean; purchased?: boolean; mealKey?: string; onSwap: (mealTitle: string, dish: string) => void }) {
  const [open, setOpen] = useState(defaultOpen);
  const generic = mealKey ? GENERIC_MEALS[mealKey] : undefined;
  return (
    <div className="rounded-xl bg-muted p-3">
      <div className="flex items-center justify-between px-1 gap-2">
        <button onClick={() => setOpen((v) => !v)} className="flex-1 flex items-center gap-2 text-left active:opacity-70 min-w-0" aria-expanded={open}>
          <ChevronDown className={`size-4 text-muted-foreground shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} />
          <span className="text-[15px] font-bold">{meal.title}</span>
          {purchased ? (
            <span className="text-[12px] text-muted-foreground tabular-nums whitespace-nowrap">{meal.kcal} 千卡</span>
          ) : (
            <span className="text-[12px] text-muted-foreground tabular-nums whitespace-nowrap">约 {Math.round(meal.kcal / 10) * 10} 千卡</span>
          )}
        </button>
        {purchased && (
          <button onClick={() => onSwap(meal.title, "全部")} className="text-[12.5px] font-bold text-primary inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap">
            <CheckCircle2 className="size-3.5" /> 去打卡
          </button>
        )}
      </div>
      <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          {!purchased && generic ? (
            <div className="rounded-lg bg-card ring-1 ring-border p-3 space-y-2.5">
              <p className="text-[12px] text-muted-foreground leading-snug">{generic.intro}</p>
              {generic.groups.map((g, gi) => (
                <div key={gi} className="rounded-md bg-muted ring-1 ring-border px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-bold">{g.label}</span>
                    <span className="text-[11.5px] text-primary font-semibold tabular-nums whitespace-nowrap">{g.portion}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {g.examples.map((ex) => (
                      <span key={ex} className="text-[11.5px] text-foreground/75 bg-card ring-1 ring-border px-1.5 py-0.5 rounded-full whitespace-nowrap">{ex}</span>
                    ))}
                  </div>
                  {g.note && <p className="mt-1 text-[11.5px] text-muted-foreground leading-snug">提示：{g.note}</p>}
                </div>
              ))}
              <div className="rounded-md bg-primary/[0.08] ring-1 ring-dashed ring-primary/25 px-2.5 py-2 flex items-center gap-2">
                <Lock className="size-3 text-primary shrink-0" />
                <p className="text-[11.5px] text-foreground/75 leading-snug flex-1">开通后将基于您的康复阶段与口味生成 <span className="font-bold text-primary">具体菜品</span> 与 <span className="font-bold text-primary">名厨做法</span></p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-card divide-y divide-border ring-1 ring-border">
              {meal.items.map((it, i) => (
                <div key={i} className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-lg bg-warning/10 grid place-items-center shrink-0">
                      <Utensils className="size-4 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold truncate flex items-center gap-1">
                        {it.name}
                        {it.herb && <Info className="size-3 text-destructive shrink-0" />}
                      </div>
                      <div className="text-[12px] text-muted-foreground">{it.grams} · {it.kcal} kcal</div>
                    </div>
                    <button onClick={() => onSwap(meal.title, it.name)} className="text-[12.5px] font-bold text-primary px-3 py-1 rounded-full border border-primary/40 active:bg-primary/10 shrink-0 whitespace-nowrap">
                      换一换
                    </button>
                  </div>
                  {purchased && it.steps && (
                    <div className="mt-2 ml-[56px] space-y-2">
                      <div className="rounded-lg bg-success/5 ring-1 ring-success/20 p-2.5">
                        <div className="inline-flex items-center gap-1 text-[11.5px] font-bold text-success mb-1">
                          <Sparkles className="size-3" />手把手做法
                        </div>
                        <ol className="space-y-0.5 list-decimal list-inside text-[12.5px] text-foreground/80 leading-relaxed marker:text-success marker:font-bold">
                          {it.steps.map((s, si) => <li key={si}>{s}</li>)}
                        </ol>
                        {it.tip && <p className="mt-1.5 text-[11.5px] text-success/90 leading-snug"><span className="font-bold">营养师叮嘱：</span>{it.tip}</p>}
                      </div>
                      {it.video && (
                        <button className="w-full rounded-lg ring-1 ring-warning/30 bg-warning/5 px-2.5 py-2 flex items-center gap-2 active:scale-[0.99] transition-transform">
                          <span className="relative size-9 rounded-md bg-warning/15 grid place-items-center shrink-0">
                            <Play className="size-3.5 text-warning fill-warning translate-x-[1px]" />
                          </span>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-[12.5px] font-bold leading-tight truncate">{it.video.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{it.video.chef} · {it.video.badge} · {it.video.duration}</p>
                          </div>
                          <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExerciseRiskTip() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-lg bg-destructive/5 ring-1 ring-destructive/20">
      <button onClick={() => setOpen((v) => !v)} className="w-full px-3 py-2 flex items-center gap-1.5 text-left">
        <AlertTriangle className="size-3.5 text-destructive shrink-0" />
        <span className="text-[12.5px] font-bold text-destructive whitespace-nowrap">运动风险提示</span>
        <span className="text-[11.5px] text-foreground/70 truncate flex-1">关节剧痛/小腿肿胀请立即停止就医</span>
        <ChevronDown className={`size-3.5 text-destructive/70 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-3 pb-2.5 space-y-1">
          {EXERCISE_RISKS.map((r) => (
            <div key={r.level} className="flex items-start gap-1.5 text-[12px]">
              <span className="shrink-0 mt-[2px] text-[10.5px] font-bold text-destructive bg-card ring-1 ring-destructive/20 px-1 py-0.5 rounded whitespace-nowrap">{r.level}</span>
              <span className="text-foreground/75 leading-snug">{r.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExercisePlanCard({ plan, purchased, onCheckin }: { plan: ExercisePlan; purchased: boolean; onCheckin: (name: string) => void }) {
  const [done, setDone] = useState(plan.todayDone);
  const champion = plan.videos.find((v) => v.kind === "champion");
  const tutorial = plan.videos.find((v) => v.kind === "tutorial");
  const headline = purchased ? champion : tutorial;
  return (
    <div className={`rounded-xl overflow-hidden ring-1 bg-card ${done ? "ring-success/30" : "ring-border"}`}>
      <div className="flex">
        <button className="relative w-[110px] shrink-0 grid place-items-center overflow-hidden" style={{ background: plan.cover }}>
          <plan.icon className="size-11 text-background drop-shadow" strokeWidth={1.75} />
          <span className="absolute size-9 rounded-full bg-card/90 grid place-items-center shadow">
            <Play className="size-4 text-foreground fill-foreground translate-x-[1px]" />
          </span>
          {purchased ? (
            <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 text-[9.5px] font-bold text-warning bg-card/95 px-1.5 py-0.5 rounded ring-1 ring-warning/30 whitespace-nowrap">
              <Award className="size-2.5" />康复冠军陪练
            </span>
          ) : (
            <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 text-[9.5px] font-bold text-foreground/70 bg-card/95 px-1.5 py-0.5 rounded ring-1 ring-border whitespace-nowrap">通用教学</span>
          )}
          {headline && <span className="absolute bottom-1 left-1 right-1 text-[10.5px] font-bold text-background leading-tight truncate">{headline.coach} · {headline.duration}</span>}
          {done && (
            <span className="absolute top-1 right-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-success text-background inline-flex items-center gap-0.5 whitespace-nowrap">
              <CheckCircle2 className="size-2.5" />已完成
            </span>
          )}
        </button>
        <div className="flex-1 min-w-0 p-2.5 pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14.5px] font-extrabold leading-tight truncate">{plan.name}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 shrink-0 whitespace-nowrap ${plan.level === "入门" ? "text-success bg-success/10 ring-success/25" : "text-info bg-info/10 ring-info/25"}`}>{plan.level}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {plan.reasons.map((r) => (
              <span key={r} className="text-[10.5px] text-primary bg-primary/8 ring-1 ring-primary/15 px-1.5 py-0.5 rounded-full whitespace-nowrap">#{r}</span>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-0.5 whitespace-nowrap"><Clock className="size-2.5" />{plan.slot}</span>
            <span className="inline-flex items-center gap-0.5 whitespace-nowrap"><Activity className="size-2.5" />{plan.duration}</span>
          </div>
        </div>
      </div>

      {purchased && champion && (
        <div className="mx-2.5 mb-2 rounded-lg ring-1 ring-warning/25 bg-warning/5 px-2.5 py-2 flex items-center gap-2">
          <span className="size-8 rounded-md bg-warning/15 grid place-items-center shrink-0">
            <Award className="size-4 text-warning" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold leading-tight truncate">{champion.title}</p>
            <p className="text-[10.5px] text-muted-foreground mt-0.5 truncate">{champion.coach} · {champion.badge} · {champion.views} 次学习</p>
          </div>
          <button className="text-[11.5px] font-bold text-warning px-2 py-1 rounded-full bg-warning/10 ring-1 ring-warning/25 inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap">
            <Play className="size-3 fill-current" />跟练
          </button>
        </div>
      )}
      {!purchased && (
        <div className="mx-2.5 mb-2 rounded-lg bg-muted ring-1 ring-dashed ring-border px-2.5 py-1.5 flex items-center gap-1.5">
          <Lock className="size-3 text-muted-foreground shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-snug">开通专属方案解锁 <span className="font-bold text-foreground/80">康复专家 1:1 陪练</span> 与个性化强度调整</p>
        </div>
      )}

      <div className="mx-2.5 mb-2 rounded-lg bg-muted px-2.5 py-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">今日目标</p>
          <p className="text-[12.5px] font-bold leading-tight truncate">{plan.target}</p>
          {plan.streak > 0 && (
            <p className="text-[10.5px] text-warning mt-0.5 inline-flex items-center gap-0.5 whitespace-nowrap">
              <Trophy className="size-2.5" />已连续 {plan.streak} 天
            </p>
          )}
        </div>
        <button
          onClick={() => { setDone((v) => !v); if (!done) onCheckin(plan.name); }}
          className={`shrink-0 inline-flex items-center gap-1 text-[12.5px] font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${done ? "bg-success/10 text-success ring-1 ring-success/25" : "bg-primary text-primary-foreground active:opacity-90"}`}
        >
          {done ? (<><CheckCircle2 className="size-3.5" />已打卡</>) : (<><CheckCircle className="size-3.5" />去打卡</>)}
        </button>
      </div>
    </div>
  );
}

function WorkoutPlan({ purchased, onCheckin }: { purchased: boolean; onCheckin: (name: string) => void }) {
  const total = EXERCISE_PLANS.length;
  const [doneCount] = useState(EXERCISE_PLANS.filter((p) => p.todayDone).length);
  const pct = Math.round((doneCount / total) * 100);
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-border bg-card">
      <div className="p-4 pb-3 flex items-start justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 flex-wrap">
            <h2 className="text-[17px] font-extrabold tracking-tight">今日康复运动</h2>
            {purchased ? (
              <span className="text-[10px] font-bold text-primary bg-primary/10 ring-1 ring-primary/20 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 whitespace-nowrap">
                <Crown className="size-2.5" />AI 定制
              </span>
            ) : (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted ring-1 ring-border px-1.5 py-0.5 rounded-full whitespace-nowrap">通用方案 · 免费</span>
            )}
          </div>
          <p className="text-[12px] text-muted-foreground mt-0.5">{purchased ? "根据您的康复阶段与关节角度定制，完成即可打卡" : "通用指南：踝泵+直腿抬高+屈膝渐进训练"}</p>
        </div>
        <div className="size-10 rounded-xl bg-primary/15 grid place-items-center shrink-0">
          <HeartPulse className="size-5 text-primary" />
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-xl bg-muted p-3 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12.5px] text-muted-foreground">今日打卡进度</p>
              <p className="mt-0.5 text-[19px] font-extrabold tabular-nums">{doneCount}<span className="text-[12.5px] text-muted-foreground font-semibold"> / {total} 项</span></p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">完成度</p>
              <p className="text-[17px] font-extrabold text-primary tabular-nums">{pct}%</p>
            </div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <ExerciseRiskTip />

        <div className="mt-4 flex items-center justify-between flex-wrap gap-1">
          <div className="flex items-center gap-1.5">
            <Activity className="size-4 text-primary" />
            <span className="text-[14.5px] font-extrabold tracking-tight">今日训练清单</span>
            <span className="text-[10.5px] font-bold text-primary bg-primary/10 ring-1 ring-primary/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">{total} 项</span>
          </div>
          <button className="text-[12.5px] text-primary inline-flex items-center font-bold whitespace-nowrap">打卡记录 <ChevronRight className="size-3.5" /></button>
        </div>

        <div className="mt-3 space-y-3">
          {EXERCISE_PLANS.map((p) => (
            <ExercisePlanCard key={p.id} plan={p} purchased={purchased} onCheckin={onCheckin} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DoctorReviewBanner({ review, onApprove }: { review: "pending" | "approved"; onApprove: () => void }) {
  if (review === "pending") {
    return (
      <div className="mt-3 rounded-2xl bg-card ring-1 ring-border overflow-hidden">
        <div className="flex items-center gap-2.5 px-3.5 py-3 bg-warning/5">
          <span className="size-10 rounded-xl bg-warning/15 text-warning grid place-items-center shrink-0">
            <Stethoscope className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold text-warning">陈磊 主任医师 正在为您审核方案</div>
            <div className="text-[11px] text-foreground/55 mt-0.5">市第一医院 骨科关节外科 · 关节置换康复组组长 · 从业 22 年</div>
          </div>
          <span className="text-[11px] font-bold text-warning bg-warning/15 px-2 py-1 rounded-full shrink-0 whitespace-nowrap">审核中</span>
        </div>
        <div className="px-3.5 py-3">
          <p className="text-[12.5px] text-foreground/65 leading-relaxed">审核通常在 30 分钟内完成，通过后将解锁专属饮食与康复运动方案。</p>
          <button onClick={onApprove} className="mt-3 w-full rounded-xl bg-primary/10 text-primary text-[13px] font-bold py-2.5 active:bg-primary/15">模拟：医生已审核通过</button>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-3 rounded-2xl bg-success/5 ring-1 ring-success/20 px-3.5 py-3 flex items-center gap-2.5">
      <span className="size-10 rounded-xl bg-success/15 text-success grid place-items-center shrink-0">
        <CheckCircle2 className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-bold text-success">陈磊主任医师已审核通过</div>
        <div className="text-[11px] text-foreground/60 mt-0.5">专属饮食与康复运动方案已生效</div>
      </div>
    </div>
  );
}

function TeamRow({ name, role, detail }: { name: string; role: string; detail: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="size-8 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center text-[13px] font-bold shrink-0">{name.slice(0, 1)}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold truncate">{name} <span className="text-muted-foreground font-normal">· {role}</span></div>
        <div className="text-[11px] text-muted-foreground truncate">{detail}</div>
      </div>
      <button className="size-7 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
        <Phone className="size-3.5" />
      </button>
    </div>
  );
}

function UnpurchasedBody({ onPurchase }: { onPurchase: () => void }) {
  return (
    <div className="p-4 space-y-3.5">
      <div className="rounded-xl bg-destructive/5 ring-1 ring-destructive/15 p-3.5">
        <div className="flex justify-between items-end mb-2 flex-wrap gap-1">
          <span className="text-destructive font-bold text-[14px] whitespace-nowrap">康复不达标并发症风险</span>
          <span className="text-destructive font-black text-[26px] leading-none tracking-tighter">72<span className="text-[14px]">%</span></span>
        </div>
        <div className="w-full bg-destructive/15 h-2 rounded-full overflow-hidden">
          <div className="bg-destructive h-full rounded-full" style={{ width: "72%" }} />
        </div>
        <p className="text-foreground/75 text-[12px] mt-2.5 leading-relaxed">
          依据：屈膝角度不足、股四头肌力弱、久坐少动。若不规范康复，未来关节僵硬 / 深静脉血栓风险将增加 <span className="font-bold text-destructive">3.6 倍</span>，二次手术概率明显上升。
        </p>
      </div>

      <div className="rounded-xl overflow-hidden ring-1 ring-primary/20 bg-card">
        <div className="px-3 py-2.5 bg-primary/5 flex items-center justify-between flex-wrap gap-1">
          <div className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-[14px] font-extrabold whitespace-nowrap">升级您的康复方案</span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {[
            { icon: Stethoscope, key: "谁在管", free: "全程自己看 · 无人跟踪", pro: "陈磊主任 + 康复治疗师 + 营养师 3 人小组全程负责" },
            { icon: Salad, key: "饮食", free: "通用食谱 · 无人指导", pro: "临床营养师 1v1 定制 · 每周随访调整" },
            { icon: Footprints, key: "运动", free: "视频跟练 · 无人监督", pro: "康复师检视动作 · 专家陪练 + 教练答疑" },
          ].map((row) => (
            <div key={row.key} className="grid grid-cols-[64px_1fr_1.15fr] items-stretch text-[12px]">
              <div className="px-2 py-2.5 flex items-center gap-1 bg-muted/20">
                <row.icon className="size-3.5 text-primary shrink-0" />
                <span className="font-extrabold text-foreground/85">{row.key}</span>
              </div>
              <div className="px-2 py-2.5 bg-muted/20 text-foreground/65 leading-snug">{row.free}</div>
              <div className="px-2 py-2.5 bg-primary/5 text-foreground/90 leading-snug font-medium">{row.pro}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-1">
        <div className="flex items-baseline justify-center gap-2 mb-2.5">
          <span className="text-warning font-black text-[28px] leading-none">¥299</span>
          <span className="text-muted-foreground text-[13px] line-through">¥599</span>
          <span className="bg-warning/15 text-warning text-[11px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">限时 5 折</span>
        </div>
        <button onClick={onPurchase} className="w-full bg-primary text-primary-foreground font-extrabold py-3.5 rounded-xl text-[16px] active:opacity-90 transition-all inline-flex items-center justify-center gap-1.5">
          升级为专属康复方案 <ChevronRight className="size-4" />
        </button>
        <p className="text-center text-muted-foreground text-[11px] mt-2">每天仅需 ¥3.3 · 已有 1.8 万骨科患者开通</p>
      </div>
    </div>
  );
}

function ServicePlanFlow({ purchased, setPurchased }: { purchased: boolean; setPurchased: (v: boolean) => void }) {
  return (
    <div className="rounded-2xl overflow-hidden ring-1 ring-border bg-card">
      {purchased ? (
        <>
          <div className="p-4 pb-3 flex items-start justify-between gap-3 bg-primary/5">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 flex-wrap">
                <h2 className="text-[17px] font-extrabold tracking-tight">膝关节置换康复服务包</h2>
                <span className="text-[10px] font-bold text-success bg-success/10 ring-1 ring-success/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">已开通 · 90 天</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">陈磊主任医师 · 康复治疗师团队 全程跟踪</p>
            </div>
          </div>
          <div className="p-3.5 pt-2">
            <div className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" />
                  <span className="text-[14px] font-bold">我的服务团队</span>
                </div>
                <span className="text-[11px] text-success inline-flex items-center gap-0.5 whitespace-nowrap">
                  <CheckCircle2 className="size-3" />在线
                </span>
              </div>
              <div className="mt-2.5 space-y-2">
                <TeamRow name="陈磊" role="主任医师 · 骨科关节外科" detail="市第一医院" />
                <TeamRow name="刘静" role="康复治疗师" detail="日常训练指导 · 关节角度评估" />
                <TeamRow name="陈悦" role="临床营养师" detail="高蛋白补钙食谱定制" />
              </div>
              <button className="mt-3 w-full rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold py-2.5 active:opacity-90 inline-flex items-center justify-center gap-1">
                联系我的团队 <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-gradient-to-r from-destructive to-warning p-4">
            <h2 className="text-background text-[17px] font-extrabold tracking-tight">膝关节置换康复服务包</h2>
            <p className="text-background/90 text-[12px] mt-0.5 inline-flex items-center gap-1">
              <AlertTriangle className="size-3" />系统识别：康复达标风险较高
            </p>
          </div>
          <UnpurchasedBody onPurchase={() => setPurchased(true)} />
        </>
      )}
    </div>
  );
}

/** ---------------- 换一换弹层 ---------------- */
function SwapDishSheet({ mealTitle, dish, onClose, onConfirm }: { mealTitle: string; dish: string; onClose: () => void; onConfirm: (name: string) => void }) {
  const options = dish === "全部"
    ? ["山药排骨汤套餐", "清蒸鲈鱼套餐", "杜仲牛骨汤套餐"]
    : ["虾仁豆腐羹", "清炖牛腩", "香菇蒸蛋", "凉拌木耳菠菜"];
  return (
    <div className="absolute inset-0 z-[55] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative bg-background rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-[16px] font-bold">{dish === "全部" ? `更换${mealTitle}全部菜品` : `更换「${dish}」`}</h3>
          <button onClick={onClose} className="size-7 rounded-full bg-muted/70 grid place-items-center">
            <X className="size-3.5" />
          </button>
        </div>
        <div className="px-4 pb-5 space-y-2">
          {options.map((o) => (
            <button key={o} onClick={() => onConfirm(o)} className="w-full flex items-center justify-between rounded-xl bg-muted/40 px-3.5 py-3 active:bg-muted/60">
              <span className="text-[14px] font-semibold">{o}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** ---------------- 主组件 ---------------- */
export function CarePlanView({ onClose }: { onClose: () => void }) {
  const [plan, setPlan] = useState<PlanKey>("nutrition");
  const [activeDate, setActiveDate] = useState("06/11");
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [review, setReview] = useState<"pending" | "approved">("pending");
  const [swap, setSwap] = useState<{ mealTitle: string; dish: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const personalized = purchased && review === "approved";

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 1600);
  };

  return (
    <QuickSheet title="健康方案" subtitle="安家在护 · 膝关节置换康复" onClose={onClose}>
      <div className="min-h-full pb-6 bg-background">
        <div className="px-4 pt-3">
          <div className="inline-flex items-center gap-1 rounded-full bg-card ring-1 ring-border p-0.5 text-[11px] font-bold">
            <button onClick={() => setPurchased(false)} className={`px-2.5 py-1.5 rounded-full transition-colors whitespace-nowrap ${!purchased ? "bg-foreground text-background" : "text-muted-foreground"}`}>未开通预览</button>
            <button onClick={() => setPurchased(true)} className={`px-2.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-0.5 whitespace-nowrap ${purchased ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <Crown className="size-3" />已开通预览
            </button>
          </div>
        </div>

        {/* 标签 */}
        <section className="px-4 mt-3">
          <div className="rounded-2xl p-4 ring-1 ring-primary/15 bg-card">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-primary">◆</span>
              <p className="text-[14px] font-bold">更好的康复从规律训练开始</p>
              <span className="text-primary">◆</span>
            </div>
            <div className="rounded-xl bg-muted p-3.5 ring-1 ring-border">
              <TagBlock icon={<AlertTriangle className="size-3.5" />} title="专病" tags={DISEASE_TAGS} tagClass="text-destructive bg-destructive/10 ring-destructive/15" onTagClick={setSelectedTag} />
              <div className="h-px bg-border my-3" />
              <TagBlock icon={<Activity className="size-3.5" />} title="待改善生活方式" tags={LIFESTYLE_TAGS} tagClass="text-warning bg-warning/10 ring-warning/20" onTagClick={setSelectedTag} />
              <div className="h-px bg-border my-3" />
              <button onClick={() => setHistoryOpen(true)} className="w-full flex items-center justify-between text-[12.5px] text-muted-foreground active:opacity-70 gap-2">
                <span className="inline-flex items-center gap-1.5 flex-wrap">
                  <History className="size-3.5 text-primary" />
                  查看标签变更历史
                  <span className="text-[10.5px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">{REMOVED_TAGS.length} 项已移除</span>
                </span>
                <ChevronRight className="size-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </section>

        {/* 方案与专家服务 */}
        <section className="px-4 mt-4">
          <ServicePlanFlow purchased={purchased} setPurchased={setPurchased} />
          {purchased && <DoctorReviewBanner review={review} onApprove={() => setReview("approved")} />}
        </section>

        {/* 饮食方案 */}
        <section className="px-4 mt-4">
          <div className="rounded-2xl overflow-hidden ring-1 ring-border bg-card">
            <div className="p-4 pb-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-[17px] font-extrabold tracking-tight">{personalized ? "专属康复饮食方案" : "通用康复饮食方案"}</h2>
                  {personalized ? (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 ring-1 ring-primary/20 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 whitespace-nowrap">
                      <Crown className="size-2.5" />专属定制
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted ring-1 ring-border px-1.5 py-0.5 rounded-full whitespace-nowrap">{purchased ? "医生审核中 · 暂用通用方案" : "通用方案 · 免费"}</span>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5">{personalized ? "根据您的康复阶段与口味偏好定制" : "基于骨科术后康复膳食通用建议"}</p>
              </div>
              <Salad className="size-7 text-success shrink-0" />
            </div>

            <div className="px-4 mt-2 flex gap-1">
              {([{ k: "nutrition", l: "营养方案" }, { k: "herbal", l: "药食同源" }] as const).map((t) => (
                <button key={t.k} onClick={() => setPlan(t.k)} className={`px-3.5 py-1.5 text-[13px] font-bold rounded-t-xl transition-colors whitespace-nowrap ${plan === t.k ? "bg-muted/30 text-primary" : "text-foreground/55"}`}>{t.l}</button>
              ))}
            </div>

            <div className="bg-muted px-4 pt-4 pb-4">
              <p className="text-center text-[13px] text-muted-foreground">当前您执行的是 <span className="text-warning font-bold">{plan === "nutrition" ? "营养方案" : "药食同源方案"}</span></p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-[13px]"><span className="text-muted-foreground">用餐时间：</span><span className="font-bold tabular-nums">07:30–18:00</span></p>
                <span className="text-[11.5px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">已选择该方案</span>
              </div>

              <div className="mt-3 flex items-center gap-4">
                <NutritionRing carb={160} fat={38} protein={95} kcal={1400} />
                <div className="flex-1 space-y-1.5">
                  <Legend color="#F59E0B" label="碳水化合物" value="160g" />
                  <Legend color="#2563EB" label="脂肪" value="38g" />
                  <Legend color="#38BDF8" label="蛋白质（康复期加量）" value="95g" />
                </div>
              </div>

              <div className="mt-4 -mx-1 overflow-x-auto">
                <div className="flex gap-1 px-1">
                  {DATES.map((d) => {
                    const active = activeDate === d.d;
                    return (
                      <button key={d.d} onClick={() => setActiveDate(d.d)} className={`shrink-0 px-3 py-1.5 rounded-lg text-[13px] tabular-nums whitespace-nowrap ${active ? "text-primary font-bold border-b-2 border-primary" : "text-muted-foreground"}`}>{d.d}</button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button onClick={() => setSwap({ mealTitle: "今日食谱", dish: "全部" })} className="rounded-xl py-2.5 text-[14px] font-bold text-primary bg-primary/10 inline-flex items-center justify-center gap-1.5 active:bg-primary/15 whitespace-nowrap">
                  <RefreshCw className="size-4" /> 不想吃全部换
                </button>
                <button onClick={() => showToast("已加入采购清单")} className="rounded-xl py-2.5 text-[14px] font-bold text-warning bg-warning/10 inline-flex items-center justify-center gap-1.5 active:bg-warning/15 whitespace-nowrap">
                  去买菜 <ChevronRight className="size-4" />
                </button>
              </div>

              <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
                带 <Info className="inline size-3 text-destructive align-[-2px]" /> 食谱包含卫健委公布的药食同源药材，点击查看功效
              </p>

              <div className="mt-3 space-y-3">
                {MEALS.map((m, i) => (
                  <MealCard key={m.key} meal={m} defaultOpen={i === 0} purchased={personalized} mealKey={m.key} onSwap={(mealTitle, dish) => setSwap({ mealTitle, dish })} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 运动方案 */}
        <section className="px-4 mt-4">
          <WorkoutPlan purchased={personalized} onCheckin={(name) => showToast(`「${name}」已打卡`)} />
        </section>
      </div>

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
      {swap && (
        <SwapDishSheet
          mealTitle={swap.mealTitle}
          dish={swap.dish}
          onClose={() => setSwap(null)}
          onConfirm={(name) => {
            setSwap(null);
            showToast(`已更换为「${name}」`);
          }}
        />
      )}
      {toast && <QuickToast text={toast} />}
    </QuickSheet>
  );
}
