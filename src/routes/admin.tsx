import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Activity,
  Upload,
  FileSpreadsheet,
  ChevronLeft,
  CalendarDays,
  Stethoscope,
  ClipboardList,
  Sparkles,
  Trash2,
  Download,
} from "lucide-react";
import { matchRule, surgeryScaleRules } from "@/lib/surgery-scale-map";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "手术排程后台 · 骨安 BoneCare" },
      { name: "description", content: "第二天手术安排导入 · 病症与手术关系 · 手术量表映射" },
    ],
  }),
  component: AdminPage,
});

interface SurgeryRow {
  admissionId: string;
  bedNo: string;
  name: string;
  age: string;
  gender: string;
  diagnosis: string;
  surgery: string;
  leader: string;
}

const LEADERS = ["王渭君", "秦江辉", "宋凯"];

const sampleRows: SurgeryRow[] = [
  { admissionId: "5633364", bedNo: "11", name: "彭兴喜", age: "49", gender: "男", diagnosis: "髋关节假体植入感染", surgery: "THA 翻修 + 感染清创", leader: "王渭君" },
  { admissionId: "5633378", bedNo: "15", name: "唐怀玲", age: "69", gender: "女", diagnosis: "原发性单侧膝关节病", surgery: "TKA", leader: "秦江辉" },
  { admissionId: "5633934", bedNo: "16", name: "吴昊", age: "43", gender: "男", diagnosis: "膝关节前十字韧带损伤", surgery: "ACLR", leader: "宋凯" },
  { admissionId: "5202953", bedNo: "26", name: "陈礼翠", age: "80", gender: "女", diagnosis: "股骨假体周围骨折", surgery: "THA 翻修 + 骨折内固定", leader: "王渭君" },
];

const COLUMN_ALIASES: Record<keyof SurgeryRow, string[]> = {
  admissionId: ["住院号", "住院", "住院编号"],
  bedNo: ["床号", "床位"],
  name: ["姓名", "患者姓名"],
  age: ["年龄", "年龄岁", "年岁"],
  gender: ["性别"],
  diagnosis: ["入院诊断", "诊断", "病症"],
  surgery: ["手术名称", "手术", "拟行手术"],
  leader: ["医疗组组长", "组长", "医疗组", "主刀"],
};

function normalize(v: unknown) {
  return String(v ?? "").replace(/\s+/g, "").replace(/岁$/, "");
}

function parseSheet(rows: unknown[][]): SurgeryRow[] {
  if (!rows.length) return [];
  // 查找表头行（含"姓名"或"住院号"）
  const headerIdx = rows.findIndex((r) =>
    r.some((c) => typeof c === "string" && (c.includes("姓名") || c.includes("住院号"))),
  );
  if (headerIdx < 0) return [];
  const header = rows[headerIdx].map((c) => String(c ?? "").trim());
  const colIndex: Partial<Record<keyof SurgeryRow, number>> = {};
  (Object.keys(COLUMN_ALIASES) as (keyof SurgeryRow)[]).forEach((key) => {
    const idx = header.findIndex((h) => COLUMN_ALIASES[key].some((a) => h.includes(a)));
    if (idx >= 0) colIndex[key] = idx;
  });

  const out: SurgeryRow[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const name = normalize(r[colIndex.name ?? -1]);
    const surgery = normalize(r[colIndex.surgery ?? -1]);
    if (!name && !surgery) continue;
    out.push({
      admissionId: normalize(r[colIndex.admissionId ?? -1]),
      bedNo: normalize(r[colIndex.bedNo ?? -1]),
      name,
      age: normalize(r[colIndex.age ?? -1]),
      gender: normalize(r[colIndex.gender ?? -1]),
      diagnosis: normalize(r[colIndex.diagnosis ?? -1]),
      surgery,
      leader: normalize(r[colIndex.leader ?? -1]) || LEADERS[out.length % LEADERS.length],
    });
  }
  return out;
}

function AdminPage() {
  const [rows, setRows] = useState<SurgeryRow[]>([]);
  const [importedAt, setImportedAt] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: false }) as unknown[][];
    const parsed = parseSheet(raw);
    if (parsed.length === 0) {
      alert("未识别到有效行，请检查表头是否包含：姓名 / 住院号 / 手术名称 等字段");
      return;
    }
    setRows(parsed);
    setFileName(file.name);
    setImportedAt(new Date().toLocaleString("zh-CN"));
  }

  function loadSample() {
    setRows(sampleRows);
    setFileName("示例数据 · 第二天手术安排.xlsx");
    setImportedAt(new Date().toLocaleString("zh-CN"));
  }

  function clearAll() {
    setRows([]);
    setFileName(null);
    setImportedAt(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  // 从导入数据聚合出：病症 → 手术
  const diagnosisMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    rows.forEach((r) => {
      if (!r.diagnosis || !r.surgery) return;
      if (!map.has(r.diagnosis)) map.set(r.diagnosis, new Set());
      map.get(r.diagnosis)!.add(r.surgery);
    });
    return Array.from(map.entries()).map(([diagnosis, set]) => ({
      diagnosis,
      surgeries: Array.from(set),
    }));
  }, [rows]);

  // 手术 → 量表（匹配规则库）
  const surgeryScaleMap = useMemo(() => {
    const seen = new Map<string, { surgery: string; rule: ReturnType<typeof matchRule>; patients: SurgeryRow[] }>();
    rows.forEach((r) => {
      if (!r.surgery) return;
      const key = r.surgery;
      if (!seen.has(key)) seen.set(key, { surgery: key, rule: matchRule(key), patients: [] });
      seen.get(key)!.patients.push(r);
    });
    return Array.from(seen.values());
  }, [rows]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold">骨安 · 手术排程后台</div>
              <div className="text-[10px] text-muted-foreground">Admin · 第二天手术安排导入</div>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
            <ChevronLeft className="h-3.5 w-3.5" />
            返回入口
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {/* 导入卡片 */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-base font-bold">
                <CalendarDays className="h-4 w-4 text-primary" />
                第二天手术安排 · Excel 导入
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                支持导入含【住院号 / 床号 / 姓名 / 年龄 / 性别 / 入院诊断 / 手术名称】的 Excel 表，系统自动生成：
                <span className="text-foreground"> 病症↔手术关系 </span>和
                <span className="text-foreground"> 手术↔量表关系</span>。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                <Upload className="h-3.5 w-3.5" />
                导入 Excel
              </button>
              <button
                onClick={loadSample}
                className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                <Sparkles className="h-3.5 w-3.5" />
                载入示例
              </button>
              {rows.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  清空
                </button>
              )}
            </div>
          </div>
          {fileName && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              已导入：<b>{fileName}</b> · {rows.length} 条 · {importedAt}
            </div>
          )}
        </section>

        {/* 手术安排列表 */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <ClipboardList className="h-4 w-4 text-primary" />
              明日手术安排
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {rows.length}
              </span>
            </div>
            {rows.length > 0 && (
              <button
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(rows);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "明日手术");
                  XLSX.writeFile(wb, "明日手术安排.xlsx");
                }}
                className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] hover:bg-muted"
              >
                <Download className="h-3 w-3" />
                导出
              </button>
            )}
          </div>
          {rows.length === 0 ? (
            <div className="p-10 text-center text-xs text-muted-foreground">
              暂无数据 · 请导入 Excel 或载入示例
            </div>
          ) : (
            <div className="overflow-x-auto">
              <datalist id="leader-options">
                {LEADERS.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-muted-foreground">
                  <tr className="text-left">
                    <th className="px-4 py-2 font-medium">住院号</th>
                    <th className="px-4 py-2 font-medium">床号</th>
                    <th className="px-4 py-2 font-medium">姓名</th>
                    <th className="px-4 py-2 font-medium">年龄</th>
                    <th className="px-4 py-2 font-medium">性别</th>
                    <th className="px-4 py-2 font-medium">入院诊断</th>
                    <th className="px-4 py-2 font-medium">手术名称</th>
                    <th className="px-4 py-2 font-medium">医疗组组长</th>
                    <th className="px-4 py-2 font-medium">匹配量表</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const rule = matchRule(r.surgery);
                    return (
                      <tr key={i} className="border-t hover:bg-slate-50/60">
                        <td className="px-4 py-2 font-mono text-[11px]">{r.admissionId}</td>
                        <td className="px-4 py-2">{r.bedNo}</td>
                        <td className="px-4 py-2 font-medium">{r.name}</td>
                        <td className="px-4 py-2">{r.age}</td>
                        <td className="px-4 py-2">{r.gender}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.diagnosis}</td>
                        <td className="px-4 py-2">{r.surgery}</td>
                        <td className="px-4 py-2">
                          <input
                            list="leader-options"
                            value={r.leader}
                            onChange={(e) =>
                              setRows((arr) =>
                                arr.map((row, idx) => (idx === i ? { ...row, leader: e.target.value } : row)),
                              )
                            }
                            placeholder="选择或输入组长"
                            className="w-28 rounded-md border bg-white px-2 py-1 text-[11px] outline-none focus:border-primary"
                          />
                        </td>
                        <td className="px-4 py-2">
                          {rule ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              {rule.rehabTag}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              未匹配
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 关系映射 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 病症 → 手术 */}
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b px-5 py-3 text-sm font-bold">
              <Stethoscope className="h-4 w-4 text-primary" />
              病症 ↔ 手术关系
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {diagnosisMap.length}
              </span>
            </div>
            {diagnosisMap.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">导入后自动生成</div>
            ) : (
              <ul className="divide-y">
                {diagnosisMap.map((item) => (
                  <li key={item.diagnosis} className="px-5 py-3">
                    <div className="text-xs font-semibold text-foreground">{item.diagnosis}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {item.surgeries.map((s) => (
                        <span key={s} className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">
                          → {s}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 手术 → 量表 */}
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b px-5 py-3 text-sm font-bold">
              <ClipboardList className="h-4 w-4 text-primary" />
              手术 ↔ 量表关系
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {surgeryScaleMap.length}
              </span>
            </div>
            {surgeryScaleMap.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">导入后自动生成</div>
            ) : (
              <ul className="divide-y">
                {surgeryScaleMap.map(({ surgery, rule, patients }) => (
                  <li key={surgery} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold">{surgery}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {patients.length} 位患者
                      </div>
                    </div>
                    {rule ? (
                      <div className="mt-2">
                        <ScaleRow label="量表" tone="sky" items={rule.scales} />
                      </div>
                    ) : (
                      <div className="mt-2 text-[11px] text-amber-700">
                        规则库未匹配 · 请补充该手术的量表对应关系
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

      </main>
    </div>
  );
}

function ScaleRow({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "sky" | "violet" | "emerald";
  items: string[];
}) {
  const toneMap = {
    sky: "bg-sky-100 text-sky-700",
    violet: "bg-violet-100 text-violet-700",
    emerald: "bg-emerald-100 text-emerald-700",
  } as const;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", toneMap[tone])}>{label}</span>
      {items.map((s) => (
        <span key={s} className="rounded bg-white px-1.5 py-0.5 text-[11px] text-foreground ring-1 ring-slate-200">
          {s}
        </span>
      ))}
    </div>
  );
}
