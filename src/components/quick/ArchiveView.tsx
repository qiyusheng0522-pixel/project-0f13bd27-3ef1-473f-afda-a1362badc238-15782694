import { useMemo, useState } from "react";
import {
  Camera,
  FileText,
  ClipboardList,
  Stethoscope,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import { QuickSheet } from "@/components/quick/QuickSheet";
import { useMiniToast } from "@/components/quick/MiniToast";
import { cn } from "@/lib/utils";

type DocKey = "lab" | "admission" | "exam" | "checkup";

type DocCat = {
  key: DocKey;
  title: string;
  icon: React.ElementType;
  required?: boolean;
  /** 示例说明 */
  hint: string;
};

const CATS: DocCat[] = [
  { key: "lab", title: "化验单", icon: FileText, hint: "血常规 / 生化 / 凝血" },
  { key: "admission", title: "入院单", icon: ClipboardList, required: true, hint: "入院证 / 诊断证明" },
  { key: "exam", title: "检查单", icon: Stethoscope, required: true, hint: "X 线 / CT / MRI 报告" },
  { key: "checkup", title: "体检单", icon: HeartPulse, hint: "年度体检报告" },
];

type HistoryItem = {
  id: string;
  cat: DocKey;
  title: string;
  date: string;
  detail: string;
  ago: string;
  recognized: boolean;
};

const CAT_LABEL: Record<DocKey, string> = {
  lab: "化验单",
  admission: "入院单",
  exam: "检查单",
  checkup: "体检单",
};

const INITIAL_HISTORY: HistoryItem[] = [
  { id: "h1", cat: "lab", title: "生化全套 · 2026-07-10", date: "2026-07-10", detail: "血钙 2.21 · CRP 6.8 mg/L", ago: "3 天前", recognized: true },
  { id: "h2", cat: "exam", title: "右膝 MRI 报告 · 2026-07-08", date: "2026-07-08", detail: "半月板后角损伤 · 关节腔积液", ago: "5 天前", recognized: true },
  { id: "h3", cat: "lab", title: "血常规 + 凝血 · 2026-07-06", date: "2026-07-06", detail: "Hb 118 g/L · D-二聚体 0.6", ago: "7 天前", recognized: true },
  { id: "h4", cat: "checkup", title: "年度体检报告 · 2026-05-20", date: "2026-05-20", detail: "骨密度 T 值 -2.1 · BMI 26.4", ago: "2 个月前", recognized: true },
  { id: "h5", cat: "exam", title: "双膝正侧位 X 线 · 2026-05-18", date: "2026-05-18", detail: "右膝 K-L Ⅲ 级 · 内侧间隙变窄", ago: "2 个月前", recognized: true },
  { id: "h6", cat: "admission", title: "入院证（待识别）", date: "2026-07-12", detail: "等待影像清晰度校验", ago: "1 天前", recognized: false },
];

export function ArchiveView({ onClose, onUploaded }: { onClose: () => void; onUploaded?: () => void }) {
  const [counts, setCounts] = useState<Record<DocKey, number>>({ lab: 3, admission: 0, exam: 1, checkup: 0 });
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [active, setActive] = useState<DocKey>("admission");
  const toast = useMiniToast();

  const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
  const progress = useMemo(() => {
    const need = CATS.filter((c) => c.required);
    const base = Math.min(60, total * 12);
    const req = need.filter((c) => counts[c.key] > 0).length * 20;
    return Math.min(100, base + req);
  }, [counts, total]);

  const missing = CATS.filter((c) => c.required && counts[c.key] === 0).map((c) => c.title);

  function handleFile(cat: DocKey, file: File) {
    setCounts((c) => ({ ...c, [cat]: c[cat] + 1 }));
    setHistory((h) => [
      {
        id: `n-${Date.now()}`,
        cat,
        title: `${CAT_LABEL[cat]} · ${file.name.replace(/\.[^.]+$/, "").slice(0, 14) || "新上传"}`,
        date: new Date().toLocaleDateString("zh-CN"),
        detail: "AI 正在识别关键指标…",
        ago: "刚刚",
        recognized: true,
      },
      ...h,
    ]);
    toast(`${CAT_LABEL[cat]}已上传，AI 识别中`);
    onUploaded?.();
  }

  return (
    <QuickSheet title="完善健康档案" subtitle="拍照上传 · AI 自动识别归档" onClose={onClose}>
      <div className="space-y-4 p-4 pb-10">
        {/* AI 建档卡 */}
        <section
          className="relative overflow-hidden rounded-3xl border bg-card p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[14px] font-bold tracking-[0.18em] text-primary">AI 建档 · 拍一拍</p>
              <h2 className="mt-1 font-display text-[22px] font-bold leading-snug">
                拍照上传化验单 /<br />入院单 / 检查单 / 体检单
              </h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                AI 自动识别并归档，主诊医生随访前即可查看
              </p>
            </div>
            <label className="grid size-14 shrink-0 cursor-pointer place-items-center rounded-2xl bg-primary text-primary-foreground active:scale-95">
              <Camera className="size-6" />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(active, f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-muted-foreground">健康档案完成度</span>
              <span className="text-[17px] font-bold text-primary">{progress}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {CATS.map((c) => {
              const has = counts[c.key] > 0;
              const isActive = active === c.key;
              return (
                <label
                  key={c.key}
                  onClick={() => setActive(c.key)}
                  className={cn(
                    "relative cursor-pointer rounded-2xl border-2 p-3 text-center active:scale-[0.98]",
                    has ? "border-transparent bg-success/10" : "border-transparent bg-warning/10",
                    isActive && "border-primary",
                  )}
                >
                  {c.required && !has && (
                    <span className="absolute -right-1 -top-2 rounded-md bg-destructive px-1.5 py-0.5 text-[11px] font-bold text-destructive-foreground">
                      必填
                    </span>
                  )}
                  <c.icon className={cn("mx-auto size-5", has ? "text-success" : "text-warning")} />
                  <p className="mt-1 whitespace-nowrap text-[17px] font-bold">{c.title}</p>
                  <p className={cn("text-[15px] font-bold", has ? "text-success" : "text-warning")}>
                    {has ? `已识别 ${counts[c.key]}` : "待上传"}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{c.hint}</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(c.key, f);
                      e.target.value = "";
                    }}
                  />
                </label>
              );
            })}
          </div>

          <label className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 py-3 text-[17px] font-bold active:scale-[0.98]">
            <ImageIcon className="size-5" /> 从相册选择（{CAT_LABEL[active]}）
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(active, f);
                e.target.value = "";
              }}
            />
          </label>
        </section>

        {/* AI 归档摘要 */}
        <section className="rounded-3xl bg-primary/8 p-4">
          <p className="text-[16px] leading-relaxed">
            <Sparkles className="mr-1 inline size-4 text-primary" />
            <b className="text-primary">AI 归档摘要</b> · 共 {total} 份材料已识别
            {missing.length > 0 ? (
              <>
                ，请补充必填项 <b>{missing.join("、")}</b>，以便档案更完整。
              </>
            ) : (
              <>，必填项已齐全，档案可提交医护核对。</>
            )}
          </p>
        </section>

        {/* 历史上传 */}
        <section>
          <div className="flex items-end justify-between">
            <h3 className="font-display text-[20px] font-bold">历史上传</h3>
            <span className="text-[15px] text-muted-foreground">共 {history.length} 项</span>
          </div>
          <div className="mt-3 space-y-3">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-start gap-3 rounded-3xl border bg-card p-3"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="whitespace-nowrap rounded-md bg-muted px-2 py-0.5 text-[13px] font-bold">
                      {CAT_LABEL[h.cat]}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[13px] font-bold",
                        h.recognized ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
                      )}
                    >
                      {h.recognized ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}
                      {h.recognized ? "已识别" : "待识别"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[17px] font-bold">{h.title}</p>
                  <p className="truncate text-[15px] text-muted-foreground">{h.detail}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
                    <Clock3 className="size-3.5" /> {h.ago}
                  </p>
                </div>
                <button
                  onClick={() => toast(h.recognized ? "已打开识别详情" : "已提醒助手协助识别")}
                  className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full bg-primary px-3 py-1.5 text-[15px] font-bold text-primary-foreground active:scale-95"
                >
                  {h.recognized ? "详情" : "引导"}
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </QuickSheet>
  );
}
