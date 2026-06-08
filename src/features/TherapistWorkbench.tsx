import { useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  TrendingUp,
  Home,
  HeartPulse,
  User,
  Users,
  ChevronRight,
  Sparkles,
  Edit3,
  Trash2,
  FileText,
  MessageCircle,
  FileSearch,
  PlusCircle,
  Mic,
  Save,
  Activity,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { PhoneShell, TabBar } from "@/components/PhoneShell";
import { Card, MiniStat, QuickAction } from "./SecretaryWorkbench";
import { BarChart, ChartCard, HBarRow, LineChart, StatTile } from "@/components/WorkStats";
import { PatientChatSheet } from "@/components/PatientChatSheet";
import { PatientChatListSheet, PatientChatEntryCard } from "@/components/PatientChatListSheet";
import { PatientArchiveSheet } from "@/components/PatientArchiveSheet";
import { PatientListSheet } from "@/components/PatientListSheet";
import { RehabRecordSheet } from "@/components/RehabRecordSheet";
import { ActionSheet, ToastBanner } from "@/components/ActionSheet";
import { patients, todayTasks } from "@/lib/mock-data";
import type { Patient } from "@/lib/types";
import { cn } from "@/lib/utils";

type TabKey = "home" | "plans" | "records" | "me";
type Overlay =
  | { kind: "chat"; patient: Patient }
  | { kind: "chat-list" }
  | { kind: "archive"; patient: Patient }
  | { kind: "patient-list" }
  | { kind: "discharge"; patient: Patient }
  | null;

// 康复方案数据结构（基于鼓楼医院《膝关节僵硬术后康复 3.0》模板）
export type RehabExercise = {
  id: string;
  name: string; // 例：踝泵练习
  description: string; // 动作描述
  dosage: string; // 次数与组数
  frequency: string; // 频率
  intensity: string; // 强度
  notes: string; // 注意事项
};

export type RehabPlan = {
  templateName: string;
  goal: string;
  weightBearing: string; // 负重相关注意事项
  exercises: RehabExercise[];
  painSwellingTips: string[]; // 疼痛肿胀处理
  iceTips: string[]; // 冰敷提醒
  reminders: string[]; // 康复提醒
};

let _eid = 0;
const eid = () => `ex_${++_eid}`;

// AI 生成的康复方案（模拟，参考鼓楼医院《膝关节僵硬术后康复 3.0》）
const aiRehabPlan = (patient: Patient): RehabPlan => ({
  templateName: "膝关节僵硬术后康复 3.0（鼓楼医院·运动医学）",
  goal: `${patient.surgeryName ?? "术后"} · 14 日内屈膝 ≥110°，独立行走 100m，可上下楼梯`,
  weightBearing:
    "术后即可拄拐下地行走，患肢可耐受下负重，无明显疼痛肿胀反复；必要时使用助行器/拐杖。步行时患侧支撑膝关节伸直，离地时弯腿——该伸直时伸直，该弯曲时弯曲。",
  exercises: [
    {
      id: eid(),
      name: "踝泵练习",
      description: "足背用力向下压，脚趾同时下压，至最大角度保持 3 秒；再缓缓勾脚，至最大角度保持 3 秒。",
      dosage: "20 个 × 10 组，每天 200 个",
      frequency: "清醒即开始，每天多次（约 20~30 次/小时）",
      intensity: "小腿前、后侧肌肉收缩用力感，无不适",
      notes: "用力、缓慢，逐渐增加活动范围与力度",
    },
    {
      id: eid(),
      name: "髌骨滑动",
      description: "膝关节放松，向髌骨上下左右四个方向推动髌骨（感受髌骨活动，而非皮肤移动），滑动范围逐渐与健侧一致。",
      dosage: "5 分钟/次",
      frequency: "2 次/天",
      intensity: "无痛、可耐受",
      notes: "避免重手法，注意区分皮肤位移与髌骨真实滑动",
    },
    {
      id: eid(),
      name: "膝关节伸直练习",
      description: "仰卧，足跟下垫枕使膝关节后方悬空压直；如有伸直障碍可在膝盖上加适量沙袋加大强度。",
      dosage: "每次 20-30 分钟",
      frequency: "每天 3-5 次",
      intensity: "轻度牵伸感，VAS ≤3",
      notes: "训练中监测疼痛，出现刺痛及时停止",
    },
    {
      id: eid(),
      name: "股四头肌激活训练",
      description: "仰卧或坐位，主动收缩股四头肌，髌骨向大腿根滑动、足跟欲抬起、锁住膝关节，保持 5-10 秒后放松 5-10 秒。膝下垫毛巾卷效果更佳。",
      dosage: "20 次 × 3 组",
      frequency: "每天 3 组",
      intensity: "以无明显疼痛为度",
      notes: "动作末端尽量伸直，避免代偿性抬髋",
    },
    {
      id: eid(),
      name: "弓步拉伸",
      description: "站立位，患腿在后，弓步拉伸，脚后跟踩实，感受患侧膝后及小腿拉伸感。",
      dosage: "30 秒 × (6-10) 个",
      frequency: "上午、下午、晚上各一次",
      intensity: "轻度牵伸感",
      notes: "脚跟不离地，膝关节保持伸直",
    },
    {
      id: eid(),
      name: "站立位伸膝",
      description: "站直，患侧腿用力伸直并维持。",
      dosage: "维持 10 秒 × 20 个",
      frequency: "上午、下午、晚上均需进行",
      intensity: "股四头肌明显收缩",
      notes: "保持躯干直立，避免锁膝代偿",
    },
    {
      id: eid(),
      name: "屈膝练习（配合勾脚）",
      description: "早期可在辅助下或主动完成，屈至最大角度保持 1-2-5 分钟，重复 3-5 次，组间休息 2 分钟。2 周后无明显肿痛可下蹲压角度。",
      dosage: "3-5 次/组",
      frequency: "上午、下午、晚上各一次",
      intensity: "末端轻中度牵伸感，VAS ≤3",
      notes: "目标：逐渐增加至与健侧一致，不反弹后可暂停",
    },
  ],
  painSwellingTips: [
    "日常及康复中疼痛 ≤ 3/10，以酸胀痛为主，避免刺痛/撕裂样痛",
    "疼痛明显持续可适当使用止痛药，及时复诊",
    "关节红肿热痛明显时，冰敷加压 15-20 分钟",
    "平躺时患肢整体抬高，膝后垫高高于心脏 20cm，20-30 分钟",
    "由踝关节向大腿根方向轻柔提拉皮肤，避免重手法",
    "下地时可穿弹力袜，适当加压减少肿胀",
  ],
  iceTips: [
    "术后 3-5 天：每天冰敷 3-5 次，每次 15-20 分钟，间隔 1-2 小时",
    "冰袋与皮肤之间隔一层毛巾，避免冻伤",
    "后期：运动或下地后出现发胀/疼/皮温升高即可冰敷 15-20 分钟",
  ],
  reminders: [
    "所有运动（尤其下地类）务必循序渐进，早期注意疼痛肿胀管理",
    "行走中或行走后膝关节轻微肿、轻微痛属正常现象",
  ],
});

type PlanStatus = "ai-draft" | "confirmed" | "edited" | "empty";

export function TherapistWorkbench() {
  const [tab, setTab] = useState<TabKey>("home");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [actionPatient, setActionPatient] = useState<Patient | null>(null);
  const [planEditor, setPlanEditor] = useState<Patient | null>(null);
  const [recordFor, setRecordFor] = useState<Patient | null>(null);
  const [planStatuses, setPlanStatuses] = useState<Record<string, PlanStatus>>({
    p7: "ai-draft",
    p8: "confirmed",
    p9: "edited",
  });
  // 出院评估完成的患者，保留 3 天用于后续追踪
  const [dischargedAt, setDischargedAt] = useState<Record<string, number>>({});
  // 康复方案内联编辑：key = `${patientId}_${exerciseId}` → 自定义动作描述/角度 + 注意事项
  const [planEdits, setPlanEdits] = useState<Record<string, { dosage?: string; notes?: string }>>({});
  const [toast, setToast] = useState<string | null>(null);

  // 住院 + 门诊康复患者
  const inpatientList = patients.filter(
    (p) => p.department === "inpatient" && ["in-surgery", "post-op", "rehab"].includes(p.status),
  );
  const outpatientList = patients.filter((p) => p.department === "outpatient" && p.status === "rehab");
  const myPatients = [...inpatientList, ...outpatientList];
  const tasks = todayTasks.therapist;
  // 明日手术（提供给治疗师作为术前康复参考，但治疗师不再做手术决策）
  const tomorrowSurgery = patients.filter((p) => p.status === "admitted" && p.preOpFindings);

  const showToast = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <PhoneShell
      title="治疗师工作台"
      subtitle="朱年鑫 · 康复治疗师"
      bottom={
        <TabBar
          activeKey={tab}
          onChange={(k) => setTab(k as TabKey)}
          items={[
            { key: "home", label: "首页", icon: Home, badge: tasks.length },
            { key: "plans", label: "康复方案", icon: HeartPulse, badge: myPatients.filter((p) => planStatuses[p.id] === "ai-draft").length },
            { key: "records", label: "院内评估", icon: FileText, badge: inpatientList.length },
            { key: "me", label: "我的", icon: User },
          ]}
        />
      }
    >
      {tab === "home" && (
        <HomeTab
          tasks={tasks}
          inpatientCount={inpatientList.length}
          outpatientCount={outpatientList.length}
          planPendingCount={myPatients.filter((p) => planStatuses[p.id] === "ai-draft").length}
          chatPendingCount={3}
          onOpenPatients={() => setOverlay({ kind: "patient-list" })}
          onOpenChat={() => setOverlay({ kind: "chat-list" })}
          onOpenPlans={() => setTab("plans")}
          onOpenRecords={() => setTab("records")}
        />
      )}
      {tab === "plans" && (
        <PlansTab
          list={myPatients}
          statuses={planStatuses}
          edits={planEdits}
          onEditExercise={(pid, eid, patch) =>
            setPlanEdits((s) => ({ ...s, [`${pid}_${eid}`]: { ...s[`${pid}_${eid}`], ...patch } }))
          }
          onEdit={(p) => setPlanEditor(p)}
          onConfirm={(p) => {
            setPlanStatuses((s) => ({ ...s, [p.id]: "confirmed" }));
            showToast(`已确认 AI 方案：${p.name}`);
          }}
          onClear={(p) => {
            setPlanStatuses((s) => ({ ...s, [p.id]: "empty" }));
            showToast(`已清空方案：${p.name}`);
          }}
          onChat={(p) => setOverlay({ kind: "chat", patient: p })}
          onArchive={(p) => setOverlay({ kind: "archive", patient: p })}
        />
      )}
      {tab === "records" && (
        <RecordsTab
          inpatientList={inpatientList}
          tomorrowSurgery={tomorrowSurgery}
          dischargedAt={dischargedAt}
          onSelect={(p) => setActionPatient(p)}
          onAddRecord={(p) => setRecordFor(p)}
          onDischarge={(p) => setOverlay({ kind: "discharge", patient: p })}
          onArchive={(p) => setOverlay({ kind: "archive", patient: p })}
        />
      )}
      {tab === "me" && <MeTab />}

      {planEditor && (
        <PlanEditorSheet
          patient={planEditor}
          onClose={() => setPlanEditor(null)}
          onSave={() => {
            setPlanStatuses((s) => ({ ...s, [planEditor.id]: "edited" }));
            showToast(`已保存修改：${planEditor.name}`);
            setPlanEditor(null);
          }}
        />
      )}
      {recordFor && (
        <RehabRecordSheet
          patient={recordFor}
          onClose={() => setRecordFor(null)}
          onSave={() => {
            showToast(`已保存院内康复记录：${recordFor.name}`);
            setRecordFor(null);
          }}
        />
      )}
      {overlay?.kind === "chat" && (
        <PatientChatSheet
          patient={overlay.patient}
          onClose={() => setOverlay(null)}
          selfRole="治"
        />
      )}
      {overlay?.kind === "archive" && (
        <PatientArchiveSheet
          patient={overlay.patient}
          onClose={() => setOverlay(null)}
          selfRole="治疗师"
          selfName="朱年鑫"
        />
      )}
      {/* 手术确认现已作为独立 Tab，不再作为 overlay */}
      {overlay?.kind === "discharge" && (
        <DischargeSheet
          patient={overlay.patient}
          onClose={() => setOverlay(null)}
          onConfirm={(note) => {
            showToast(`已确认 ${overlay.patient.name} 出院 · 备注已同步`);
            setOverlay(null);
          }}
        />
      )}
      {overlay?.kind === "patient-list" && (
        <PatientListSheet
          inpatientList={inpatientList}
          outpatientList={outpatientList}
          onClose={() => setOverlay(null)}
          onArchive={(p) => setOverlay({ kind: "archive", patient: p })}
          onChat={(p) => setOverlay({ kind: "chat", patient: p })}
        />
      )}
      {overlay?.kind === "chat-list" && (
        <PatientChatListSheet
          subtitle="与负责患者直接沟通"
          patients={myPatients}
          unread={{ [myPatients[0]?.id ?? ""]: 2, [myPatients[1]?.id ?? ""]: 1 }}
          onClose={() => setOverlay(null)}
          onOpen={(p) => setOverlay({ kind: "chat", patient: p })}
        />
      )}
      <ActionSheet
        open={!!actionPatient}
        title={actionPatient ? `${actionPatient.name}${actionPatient.bedNo ? ` · ${actionPatient.bedNo}床` : " · 门诊"}` : ""}
        onClose={() => setActionPatient(null)}
        actions={[
          { label: "在线沟通", tone: "primary", onClick: () => actionPatient && setOverlay({ kind: "chat", patient: actionPatient }) },
          { label: "查看患者档案", onClick: () => actionPatient && setOverlay({ kind: "archive", patient: actionPatient }) },
          {
            label: "新增院内治疗记录",
            onClick: () => {
              if (actionPatient) {
                setRecordFor(actionPatient);
                setActionPatient(null);
              }
            },
          },
          { label: "发起康复评估", onClick: () => showToast("已发起评估") },
        ]}
      />
      {toast && <ToastBanner text={toast} />}
    </PhoneShell>
  );
}

function HomeTab({
  tasks,
  inpatientCount,
  outpatientCount,
  planPendingCount,
  chatPendingCount,
  onOpenPatients,
  onOpenChat,
  onOpenPlans,
  onOpenRecords,
}: {
  tasks: typeof todayTasks.therapist;
  inpatientCount: number;
  outpatientCount: number;
  planPendingCount: number;
  chatPendingCount: number;
  onOpenPatients: () => void;
  onOpenChat: () => void;
  onOpenPlans: () => void;
  onOpenRecords: () => void;
}) {
  const assessPendingCount = tasks.filter((t) => t.type === "discharge").length;
  return (
    <div className="space-y-3 p-3">
      <div className="rounded-2xl p-4 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
        <div className="text-[10px] opacity-80">康复治疗师 · 工作概览</div>
        <div className="mt-1 text-base font-bold">朱年鑫, 加油 💪</div>
        <div className="mt-0.5 text-[11px] opacity-90">
          住院 {inpatientCount} · 门诊 {outpatientCount} · 今日待办 {tasks.length} 项
        </div>
      </div>

      {/* 工作台统计入口 */}
      <div className="grid grid-cols-2 gap-2">
        <StatEntry
          icon={Users}
          label="患者管理"
          sub={`住院 ${inpatientCount} · 门诊 ${outpatientCount}`}
          value={inpatientCount + outpatientCount}
          tone="bg-info/10 text-info"
          onClick={onOpenPatients}
        />
        <StatEntry
          icon={HeartPulse}
          label="康复方案"
          sub={planPendingCount > 0 ? `${planPendingCount} 份待确认` : "全部已确认"}
          value={planPendingCount}
          badge={planPendingCount > 0}
          tone="bg-primary/10 text-primary"
          onClick={onOpenPlans}
        />
        <StatEntry
          icon={ClipboardCheck}
          label="康复评估"
          sub={assessPendingCount > 0 ? `${assessPendingCount} 项待评估` : "今日已完成"}
          value={assessPendingCount}
          badge={assessPendingCount > 0}
          tone="bg-warning/15 text-warning-foreground"
          onClick={onOpenRecords}
        />
        <StatEntry
          icon={Sparkles}
          label="今日待办"
          sub={`${tasks.length} 项任务`}
          value={tasks.length}
          tone="bg-info/10 text-info"
          onClick={onOpenRecords}
        />
      </div>

      <PatientChatEntryCard
        unreadCount={chatPendingCount}
        patientCount={Math.min(chatPendingCount, 3)}
        onClick={onOpenChat}
      />

      <Card title="今日待办" rightLabel={`${tasks.length} 项`}>
        <div className="divide-y">
          {tasks.map((t) => (
            <div key={t.id} className="px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    t.priority === "high" ? "bg-destructive" : "bg-muted-foreground",
                  )}
                />
                <div className="text-[12px] font-medium">{t.title}</div>
                {t.type === "plan" && <Sparkles className="h-3 w-3 text-info" />}
                {t.type === "discharge" && <CheckCircle2 className="h-3 w-3 text-success" />}
              </div>
              <div className="ml-3.5 mt-0.5 text-[10px] text-muted-foreground">
                {t.patientName && `${t.patientName}${t.bedNo ? ` · ${t.bedNo}床` : ""}`}
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}

function StatEntry({
  icon: Icon,
  label,
  sub,
  value,
  badge,
  tone,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  value: number;
  badge?: boolean;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2.5 rounded-2xl border bg-card p-3 text-left active:bg-muted/30"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-[12px] font-semibold">{label}</span>
          {badge && value > 0 && (
            <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-bold text-destructive-foreground">
              {value}
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{sub}</div>
      </div>
    </button>
  );
}

function PlansTab({
  list,
  statuses,
  onEdit,
  onConfirm,
  onClear,
  onChat,
  onArchive,
}: {
  list: typeof patients;
  statuses: Record<string, PlanStatus>;
  onEdit: (p: Patient) => void;
  onConfirm: (p: Patient) => void;
  onClear: (p: Patient) => void;
  onChat: (p: Patient) => void;
  onArchive: (p: Patient) => void;
}) {
  return (
    <div className="space-y-3 p-3">
      <div className="rounded-2xl border bg-info/5 p-3 text-[11px] text-info">
        <Sparkles className="mr-1 inline h-3 w-3" />
        AI 已根据术中量表与医生建议自动生成康复方案，请确认、修改或清空。
      </div>

      {list.map((p) => {
        const status = statuses[p.id] ?? "ai-draft";
        const plan = aiRehabPlan(p);
        return (
          <div key={p.id} className="overflow-hidden rounded-2xl border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-start justify-between gap-2 border-b p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {p.bedNo && (
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                      {p.bedNo}床
                    </span>
                  )}
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.gender}·{p.age}</span>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {p.surgeryName} · 术日 {p.surgeryDate}
                </div>
              </div>
              <PlanStatusBadge status={status} />
            </div>

            {status === "empty" ? (
              <div className="flex flex-col items-center gap-1.5 p-4 text-[11px] text-muted-foreground">
                <Trash2 className="h-4 w-4" />
                方案已清空
                <button
                  onClick={() => onConfirm(p)}
                  className="mt-1 flex items-center gap-1 rounded-full bg-info/10 px-3 py-1 text-[10px] text-info"
                >
                  <Sparkles className="h-3 w-3" />重新生成 AI 方案
                </button>
              </div>
            ) : (
              <>
                <div className="border-b bg-info/5 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-info">康复目标</div>
                    <span className="rounded-full bg-info/10 px-1.5 py-0.5 text-[9px] text-info">
                      模板：{plan.templateName.split("（")[0]}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px]">{plan.goal}</div>
                </div>
                {plan.weightBearing && (
                  <div className="border-b px-3 py-2">
                    <div className="text-[10px] font-bold text-warning">负重注意事项</div>
                    <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                      {plan.weightBearing}
                    </div>
                  </div>
                )}
                <div className="space-y-1.5 p-3">
                  <div className="text-[10px] font-bold text-foreground">训练动作 · {plan.exercises.length} 项</div>
                  {plan.exercises.slice(0, 4).map((ex, idx) => (
                    <div key={ex.id} className="flex items-start gap-1.5 text-[11px]">
                      <span className="mt-[2px] inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground">{ex.name}</div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          {ex.dosage}
                          {ex.frequency ? ` · ${ex.frequency}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                  {plan.exercises.length > 4 && (
                    <div className="text-[10px] text-muted-foreground">
                      + 还有 {plan.exercises.length - 4} 项动作...
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex items-center justify-between border-t bg-muted/20 px-3 py-1.5">
              <div className="flex gap-1">
                <button onClick={() => onArchive(p)} className="rounded-full bg-muted p-1.5 text-muted-foreground active:bg-muted/70">
                  <FileSearch className="h-3 w-3" />
                </button>
                <button onClick={() => onChat(p)} className="rounded-full bg-info/10 p-1.5 text-info active:opacity-80">
                  <MessageCircle className="h-3 w-3" />
                </button>
              </div>
              <div className="flex gap-1">
                {status !== "empty" && (
                  <button
                    onClick={() => onClear(p)}
                    className="flex items-center gap-1 rounded-full border border-destructive/30 px-2 py-1 text-[10px] text-destructive active:bg-destructive/5"
                  >
                    <Trash2 className="h-3 w-3" />清空
                  </button>
                )}
                {status !== "empty" && (
                  <button
                    onClick={() => onEdit(p)}
                    className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] text-foreground active:bg-muted/70"
                  >
                    <Edit3 className="h-3 w-3" />修改
                  </button>
                )}
                {status === "ai-draft" && (
                  <button
                    onClick={() => onConfirm(p)}
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-primary-foreground active:opacity-80"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <CheckCircle2 className="h-3 w-3" />确认方案
                  </button>
                )}
                {status === "confirmed" && (
                  <span className="flex items-center gap-1 rounded-full border border-success/40 px-2 py-1 text-[11px] text-success">
                    <CheckCircle2 className="h-3 w-3" />已确认
                  </span>
                )}
                {status === "edited" && (
                  <span className="flex items-center gap-1 rounded-full border border-primary/40 px-2 py-1 text-[11px] text-primary">
                    <Edit3 className="h-3 w-3" />已修改
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecordsTab({
  inpatientList,
  tomorrowSurgery,
  onSelect,
  onAddRecord,
  onDischarge,
  onArchive,
}: {
  inpatientList: Patient[];
  tomorrowSurgery: Patient[];
  onSelect: (p: Patient) => void;
  onAddRecord: (p: Patient) => void;
  onDischarge: (p: Patient) => void;
  onArchive: (p: Patient) => void;
}) {
  const [sub, setSub] = useState<"tomorrow" | "postop">("postop");
  // 术后康复 = 已手术 / 术后观察 / 康复中
  const postOpList = inpatientList;
  const visible = sub === "tomorrow" ? tomorrowSurgery : postOpList;

  return (
    <div className="space-y-3 p-3">
      <div className="rounded-2xl border bg-info/5 p-2.5 text-[11px] text-info">
        <ClipboardCheck className="mr-1 inline h-3 w-3" />
        住院康复分为「明日手术」（术前 AI 评估）与「术后康复」（每日评估）。
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-full border bg-muted/30 p-0.5 text-[12px]">
        <button
          onClick={() => setSub("tomorrow")}
          className={cn(
            "rounded-full py-1.5 font-medium transition-colors",
            sub === "tomorrow" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          明日手术 · {tomorrowSurgery.length}
        </button>
        <button
          onClick={() => setSub("postop")}
          className={cn(
            "rounded-full py-1.5 font-medium transition-colors",
            sub === "postop" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          术后康复 · {postOpList.length}
        </button>
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border bg-card p-6 text-center text-[12px] text-muted-foreground">
          {sub === "tomorrow" ? "暂无明日手术患者" : "暂无术后康复患者"}
        </div>
      )}

      {/* 明日手术：展示患者基本信息 + AI 术前康复评估 */}
      {sub === "tomorrow" &&
        visible.map((p) => {
          const ai = aiPreOpRehabAssessment(p);
          const s = p.preOpSymptoms;
          return (
            <div key={p.id} className="overflow-hidden rounded-2xl border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
              <button onClick={() => onArchive(p)} className="block w-full border-b p-3 text-left active:bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                    {p.bedNo}床
                  </span>
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.gender}·{p.age}</span>
                  {p.side && (
                    <span className="rounded bg-warning/20 px-1 py-0.5 text-[9px] font-bold text-warning-foreground">
                      患侧 {p.side}
                    </span>
                  )}
                  <span className="ml-auto rounded bg-info/15 px-1.5 py-0.5 text-[9px] font-bold text-info">
                    明日手术
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {p.surgeryName} · 术日 {p.surgeryDate} · 主刀 {p.director}
                </div>
              </button>

              {/* 术前症状指标 */}
              {s && (
                <div className="grid grid-cols-3 gap-2 border-b p-3">
                  <Metric label="疼痛 VAS" value={`${s.painVAS ?? "—"}/10`} trend={(s.painVAS ?? 0) >= 5 ? "down" : "up"} />
                  <Metric label="肿胀" value={s.swelling ?? "—"} trend={s.swelling === "中" || s.swelling === "重" ? "down" : "up"} />
                  <Metric label="ROM" value={s.rom ?? "—"} trend="up" />
                  {s.strength && <Metric label="肌力" value={s.strength} trend="up" />}
                  {s.dailyFunction && (
                    <div className="col-span-3 rounded-lg border bg-muted/20 p-2 text-[10px] text-muted-foreground">
                      <span className="font-medium text-foreground">日常功能：</span>
                      {s.dailyFunction}
                    </div>
                  )}
                </div>
              )}

              {/* AI 术前评估结论 */}
              <div className={cn(
                "border-b p-3",
                ai.level === "良好" ? "bg-success/5" : ai.level === "尚可" ? "bg-warning/5" : "bg-destructive/5",
              )}>
                <div className={cn("flex items-center gap-1 text-[11px] font-bold", ai.tone)}>
                  <Sparkles className="h-3 w-3" />
                  {ai.summary}
                </div>
                <ul className="mt-1 space-y-0.5 pl-3 text-[10px] text-muted-foreground">
                  {ai.reasons.map((r, i) => (
                    <li key={i} className="list-disc">{r}</li>
                  ))}
                </ul>
                <div className="mt-1.5 rounded-lg bg-card p-2 text-[10px]">
                  <div className="mb-0.5 text-[9px] font-bold text-info">康复建议</div>
                  {ai.suggestions.map((s, i) => (
                    <div key={i}>· {s}</div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0 border-t">
                <button
                  onClick={() => onArchive(p)}
                  className="flex items-center justify-center gap-1 py-2.5 text-[11px] text-foreground active:bg-muted/40"
                >
                  <FileSearch className="h-3 w-3" />患者档案
                </button>
                <button
                  onClick={() => onAddRecord(p)}
                  className="flex items-center justify-center gap-1 border-l py-2.5 text-[11px] font-medium text-primary active:bg-muted/40"
                >
                  <PlusCircle className="h-3 w-3" />术前评估
                </button>
              </div>
            </div>
          );
        })}

      {/* 术后康复：增加筛选与排序 */}
      {sub === "postop" && <PostOpList list={visible} onSelect={onSelect} onAddRecord={onAddRecord} onDischarge={onDischarge} />}
    </div>
  );
}

/* ---------- 术后康复列表（含状态/病症筛选 + 时间排序） ---------- */
function PostOpList({
  list,
  onSelect,
  onAddRecord,
  onDischarge,
}: {
  list: Patient[];
  onSelect: (p: Patient) => void;
  onAddRecord: (p: Patient) => void;
  onDischarge: (p: Patient) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | "in-surgery" | "post-op" | "rehab">("all");
  const [diseaseFilter, setDiseaseFilter] = useState<string>("all");
  const [sort, setSort] = useState<"surgery-asc" | "surgery-desc" | "postdays-desc">("postdays-desc");

  // 提取所有"病症"（按 diagnosis 简短关键字）
  const diseases = Array.from(
    new Set(list.map((p) => (p.diagnosis ?? "").split(/[,，;；]/)[0].trim()).filter(Boolean)),
  );

  // 计算 周几 与 术后 X 天
  const today = new Date("2024-04-22");
  const weekdayCN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const enrich = (p: Patient) => {
    const d = p.surgeryDate ? new Date(p.surgeryDate) : null;
    const days = d ? Math.max(0, Math.floor((today.getTime() - d.getTime()) / 86400000)) : 0;
    const wk = d ? weekdayCN[d.getDay()] : "—";
    return { p, days, wk, dateNum: d ? d.getTime() : 0 };
  };

  let rows = list.map(enrich);
  if (statusFilter !== "all") rows = rows.filter((r) => r.p.status === statusFilter);
  if (diseaseFilter !== "all") rows = rows.filter((r) => (r.p.diagnosis ?? "").includes(diseaseFilter));
  if (sort === "surgery-asc") rows.sort((a, b) => a.dateNum - b.dateNum);
  else if (sort === "surgery-desc") rows.sort((a, b) => b.dateNum - a.dateNum);
  else rows.sort((a, b) => b.days - a.days);

  return (
    <>
      {/* 快速筛选 */}
      <div className="space-y-1.5 rounded-2xl border bg-card p-2.5">
        <FilterRow label="状态">
          {[
            { k: "all", l: "全部" },
            { k: "in-surgery", l: "今日术后" },
            { k: "post-op", l: "术后观察" },
            { k: "rehab", l: "康复中" },
          ].map((o) => (
            <Chip key={o.k} active={statusFilter === o.k} onClick={() => setStatusFilter(o.k as typeof statusFilter)}>
              {o.l}
            </Chip>
          ))}
        </FilterRow>
        {diseases.length > 0 && (
          <FilterRow label="病症">
            <Chip active={diseaseFilter === "all"} onClick={() => setDiseaseFilter("all")}>全部</Chip>
            {diseases.map((d) => (
              <Chip key={d} active={diseaseFilter === d} onClick={() => setDiseaseFilter(d)}>
                {d}
              </Chip>
            ))}
          </FilterRow>
        )}
        <FilterRow label="排序">
          <Chip active={sort === "postdays-desc"} onClick={() => setSort("postdays-desc")}>术后天数 ↓</Chip>
          <Chip active={sort === "surgery-desc"} onClick={() => setSort("surgery-desc")}>手术日期 ↓</Chip>
          <Chip active={sort === "surgery-asc"} onClick={() => setSort("surgery-asc")}>手术日期 ↑</Chip>
        </FilterRow>
      </div>

      {rows.length === 0 && (
        <div className="rounded-2xl border bg-card p-6 text-center text-[12px] text-muted-foreground">
          无符合条件的患者
        </div>
      )}

      {rows.map(({ p, days, wk }) => (
        <div key={p.id} className="overflow-hidden rounded-2xl border bg-card" style={{ boxShadow: "var(--shadow-card)" }}>
          <button onClick={() => onSelect(p)} className="block w-full border-b p-3 text-left">
            <div className="flex flex-wrap items-center gap-1.5">
              {p.bedNo ? (
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                  {p.bedNo}床
                </span>
              ) : (
                <span className="rounded-md bg-info/10 px-1.5 py-0.5 text-[10px] font-bold text-info">门诊</span>
              )}
              <span className="text-sm font-bold">{p.name}</span>
              <span className="text-[10px] text-muted-foreground">{p.gender}·{p.age}</span>
              {p.side && (
                <span className="rounded bg-warning/20 px-1 py-0.5 text-[9px] font-bold text-warning-foreground">
                  患侧 {p.side}
                </span>
              )}
              {p.status === "rehab" && p.department === "inpatient" && <Pill cls="bg-success/15 text-success">康复达标</Pill>}
              {p.status === "post-op" && <Pill cls="bg-info/15 text-info">术后观察</Pill>}
              {p.status === "in-surgery" && <Pill cls="bg-warning/20 text-warning-foreground">今日术后</Pill>}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              {p.surgeryName ?? p.diagnosis}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
              {p.surgeryDate && <span>手术日 {p.surgeryDate}（{wk}）</span>}
              <span>· 术后第 {days} 天</span>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-2 p-3">
            <Metric label="疼痛 VAS" value="3/10" trend="down" />
            <Metric label="屈膝角度" value="85°" trend="up" />
            <Metric label="SLR" value="可独立" trend="up" />
            <Metric label="是否下地" value={p.status === "in-surgery" ? "未" : "已下地"} trend="up" />
          </div>

          <div className="grid grid-cols-2 gap-0 border-t">
            <button
              onClick={() => onAddRecord(p)}
              className="flex items-center justify-center gap-1 py-2.5 text-[11px] text-foreground active:bg-muted/40"
            >
              <PlusCircle className="h-3 w-3" />治疗记录
            </button>
            {p.status === "rehab" ? (
              <button
                onClick={() => onDischarge(p)}
                className="flex items-center justify-center gap-1 border-l py-2.5 text-[11px] font-medium text-primary-foreground active:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                <CheckCircle2 className="h-3 w-3" />出院评估
              </button>
            ) : (
              <button
                onClick={() => onAddRecord(p)}
                className="flex items-center justify-center gap-1 border-l py-2.5 text-[11px] font-medium text-primary active:bg-muted/40"
              >
                <PlusCircle className="h-3 w-3" />治疗记录
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5">
      <div className="mt-1 w-9 shrink-0 text-[10px] font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground active:bg-muted/40",
      )}
    >
      {children}
    </button>
  );
}

function PlanEditorSheet({ patient, onClose, onSave }: { patient: Patient; onClose: () => void; onSave: () => void }) {
  const initial = aiRehabPlan(patient);
  const [templateName, setTemplateName] = useState(initial.templateName);
  const [goal, setGoal] = useState(initial.goal);
  const [weightBearing, setWeightBearing] = useState(initial.weightBearing);
  const [exercises, setExercises] = useState<RehabExercise[]>(initial.exercises);
  const [painTips, setPainTips] = useState(initial.painSwellingTips.join("\n"));
  const [iceTips, setIceTips] = useState(initial.iceTips.join("\n"));
  const [reminders, setReminders] = useState(initial.reminders.join("\n"));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const updateEx = (id: string, patch: Partial<RehabExercise>) =>
    setExercises((arr) => arr.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEx = (id: string) => setExercises((arr) => arr.filter((e) => e.id !== id));
  const moveEx = (id: string, dir: -1 | 1) =>
    setExercises((arr) => {
      const i = arr.findIndex((e) => e.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return arr;
      const next = [...arr];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const addEx = () =>
    setExercises((arr) => [
      ...arr,
      { id: eid(), name: "新增训练动作", description: "", dosage: "", frequency: "", intensity: "", notes: "" },
    ]);

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-background">
      <div className="flex items-center justify-between border-b bg-card px-3 py-2.5">
        <button onClick={onClose} className="text-[12px] text-muted-foreground">取消</button>
        <div className="text-[13px] font-semibold">编辑康复方案 · {patient.name}</div>
        <button
          onClick={onSave}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground active:opacity-90"
        >
          <Save className="h-3 w-3" />保存
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-3">
        <div className="rounded-2xl border bg-info/5 p-2.5 text-[11px] text-info">
          <Sparkles className="mr-1 inline h-3 w-3" />
          AI 已按鼓楼医院《膝关节僵硬术后康复 3.0》生成方案；所有字段均可自定义，麦克风可语音输入。
        </div>

        {/* 模板 / 目标 / 负重 */}
        <SectionBox label="方案模板">
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="h-9 w-full rounded-lg border bg-muted/20 px-2 text-[12px] outline-none focus:border-primary"
          />
        </SectionBox>

        <SectionBox label="康复目标">
          <VoiceTextarea
            rows={2}
            value={goal}
            onChange={setGoal}
            voiceSample={`${patient.surgeryName ?? "术后"} · 14 日内屈膝 ≥110°，独立行走 100m，可上下楼梯`}
          />
        </SectionBox>

        <SectionBox label="负重相关注意事项">
          <VoiceTextarea
            rows={3}
            value={weightBearing}
            onChange={setWeightBearing}
            voiceSample="术后即可拄拐下地行走，患肢可耐受下负重；步行时该伸直时伸直、该弯曲时弯曲。"
          />
        </SectionBox>

        {/* 动作列表 */}
        <div>
          <div className="mb-1.5 flex items-center justify-between px-1">
            <div className="text-[11px] font-semibold text-foreground">
              训练动作 · {exercises.length} 项
            </div>
          </div>
          <div className="space-y-2">
            {exercises.map((ex, idx) => {
              const isCollapsed = collapsed[ex.id];
              return (
                <div key={ex.id} className="overflow-hidden rounded-2xl border bg-card">
                  <div className="flex items-center gap-1.5 border-b bg-muted/30 px-2.5 py-1.5">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {idx + 1}
                    </span>
                    <input
                      value={ex.name}
                      onChange={(e) => updateEx(ex.id, { name: e.target.value })}
                      placeholder="动作名称（如：踝泵练习）"
                      className="h-7 min-w-0 flex-1 rounded border bg-card px-2 text-[12px] font-medium outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => moveEx(ex.id, -1)}
                      disabled={idx === 0}
                      className="rounded p-1 text-muted-foreground disabled:opacity-30 active:bg-muted/40"
                      aria-label="上移"
                    >▲</button>
                    <button
                      onClick={() => moveEx(ex.id, 1)}
                      disabled={idx === exercises.length - 1}
                      className="rounded p-1 text-muted-foreground disabled:opacity-30 active:bg-muted/40"
                      aria-label="下移"
                    >▼</button>
                    <button
                      onClick={() => setCollapsed((c) => ({ ...c, [ex.id]: !c[ex.id] }))}
                      className="rounded p-1 text-muted-foreground active:bg-muted/40"
                      aria-label="折叠"
                    >
                      <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", !isCollapsed && "rotate-90")} />
                    </button>
                    <button
                      onClick={() => removeEx(ex.id)}
                      className="rounded p-1 text-destructive active:bg-destructive/10"
                      aria-label="删除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {!isCollapsed && (
                    <div className="space-y-2 p-2.5">
                      <ExField label="动作描述" rows={2} value={ex.description} onChange={(v) => updateEx(ex.id, { description: v })} sample="足背用力向下压，至最大角度保持 3 秒；再缓缓勾脚，至最大角度保持 3 秒。" />
                      <div className="grid grid-cols-2 gap-2">
                        <ExField label="次数与组数" value={ex.dosage} onChange={(v) => updateEx(ex.id, { dosage: v })} sample="20 个 × 10 组" />
                        <ExField label="频率" value={ex.frequency} onChange={(v) => updateEx(ex.id, { frequency: v })} sample="每天 3 次" />
                      </div>
                      <ExField label="强度" value={ex.intensity} onChange={(v) => updateEx(ex.id, { intensity: v })} sample="肌肉收缩感，无不适" />
                      <ExField label="注意事项" rows={2} value={ex.notes} onChange={(v) => updateEx(ex.id, { notes: v })} sample="缓慢用力，逐步加大活动范围" />
                    </div>
                  )}
                </div>
              );
            })}
            <button
              onClick={addEx}
              className="flex w-full items-center justify-center gap-1 rounded-2xl border border-dashed bg-card py-2 text-[11px] text-muted-foreground active:bg-muted/30"
            >
              <PlusCircle className="h-3.5 w-3.5" />新增训练动作
            </button>
          </div>
        </div>

        {/* 疼痛肿胀处理 / 冰敷 / 提醒 */}
        <SectionBox label="疼痛肿胀处理（每行一条）">
          <VoiceTextarea
            rows={4}
            value={painTips}
            onChange={setPainTips}
            voiceSample={"日常及康复中疼痛 ≤ 3/10，以酸胀痛为主\n关节红肿热痛明显时，冰敷加压 15-20 分钟"}
            small
          />
        </SectionBox>

        <SectionBox label="冰敷提醒（每行一条）">
          <VoiceTextarea
            rows={3}
            value={iceTips}
            onChange={setIceTips}
            voiceSample={"术后 3-5 天：每天冰敷 3-5 次，每次 15-20 分钟\n冰袋与皮肤之间隔一层毛巾"}
            small
          />
        </SectionBox>

        <SectionBox label="康复提醒（每行一条）">
          <VoiceTextarea
            rows={2}
            value={reminders}
            onChange={setReminders}
            voiceSample={"所有运动循序渐进，早期注意疼痛肿胀管理"}
            small
          />
        </SectionBox>
      </div>
    </div>
  );
}

function SectionBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-3">
      <div className="mb-1 text-[10px] font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function ExField({
  label,
  value,
  onChange,
  sample,
  rows = 1,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  sample: string;
  rows?: number;
}) {
  return (
    <div>
      <div className="mb-0.5 text-[10px] text-muted-foreground">{label}</div>
      <VoiceTextarea rows={rows} value={value} onChange={onChange} voiceSample={sample} small />
    </div>
  );
}

function VoiceTextarea({
  rows,
  value,
  onChange,
  voiceSample,
  small,
}: {
  rows: number;
  value: string;
  onChange: (v: string) => void;
  voiceSample: string;
  small?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const triggerVoice = () => {
    setRecording(true);
    setTimeout(() => {
      onChange(value ? `${value}\n${voiceSample}` : voiceSample);
      setRecording(false);
    }, 1200);
  };
  return (
    <div>
      <div className="flex items-start gap-1.5">
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex-1 rounded-lg border bg-muted/20 p-2 outline-none focus:border-primary",
            small ? "text-[11px]" : "text-[12px]",
          )}
        />
        <button
          onClick={triggerVoice}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            recording ? "animate-pulse bg-destructive text-destructive-foreground" : "bg-card text-muted-foreground active:bg-muted/40",
          )}
          aria-label="语音输入"
        >
          <Mic className="h-3.5 w-3.5" />
        </button>
      </div>
      {recording && <div className="mt-1 text-[10px] text-destructive">● 正在录音，自动转文字...</div>}
    </div>
  );
}

function MeTab() {
  const weeklyPlan = [
    { label: "周一", value: 5 },
    { label: "周二", value: 7 },
    { label: "周三", value: 6 },
    { label: "周四", value: 8 },
    { label: "周五", value: 4 },
    { label: "周六", value: 3 },
    { label: "周日", value: 2 },
  ];
  const reachRate = [
    { label: "1月", value: 88 },
    { label: "2月", value: 90 },
    { label: "3月", value: 92 },
    { label: "4月", value: 94 },
  ];
  return (
    <div className="space-y-3 p-3">
      <div className="rounded-2xl border bg-card p-4 text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          朱
        </div>
        <div className="mt-2 text-base font-bold">朱年鑫</div>
        <div className="text-[11px] text-muted-foreground">康复治疗师 · 5 年经验</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatTile icon={Sparkles} label="AI 方案确认" value={35} delta="↑ 12%" tone="info" />
        <StatTile icon={ClipboardCheck} label="康复评估" value={48} tone="primary" />
        <StatTile icon={CheckCircle2} label="出院评估通过" value={18} delta="达标 94%" tone="success" />
        <StatTile icon={Edit3} label="方案修订" value={7} tone="warning" />
      </div>

      <ChartCard title="本周方案处理量" subtitle="共 35 份 · AI 直接采纳 28 份">
        <BarChart data={weeklyPlan} unit="份" color="var(--info)" />
      </ChartCard>

      <ChartCard title="康复达标率趋势" subtitle="近 4 个月">
        <LineChart data={reachRate} stroke="var(--success)" />
      </ChartCard>

      <ChartCard title="工作类型占比（本月）">
        <div className="space-y-2">
          <HBarRow label="AI 方案确认" value={35} total={108} color="var(--info)" />
          <HBarRow label="康复评估" value={48} total={108} color="var(--primary)" />
          <HBarRow label="出院评估" value={18} total={108} color="var(--success)" />
          <HBarRow label="方案修订" value={7} total={108} color="var(--warning)" />
        </div>
      </ChartCard>

    </div>
  );
}

function Metric({ label, value, trend }: { label: string; value: string; trend: "up" | "down" }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-2">
      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
        <span>{label}</span>
        <TrendingUp className={cn("h-3 w-3", trend === "up" ? "text-success" : "rotate-180 text-info")} />
      </div>
      <div className="mt-0.5 text-[12px] font-bold text-foreground">{value}</div>
    </div>
  );
}

function Pill({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium", cls)}>{children}</span>;
}

function PlanStatusBadge({ status }: { status: PlanStatus }) {
  if (status === "ai-draft")
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-info/15 px-1.5 py-0.5 text-[9px] font-medium text-info">
        <Sparkles className="h-2.5 w-2.5" />AI 草稿
      </span>
    );
  if (status === "confirmed")
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-medium text-success">
        <CheckCircle2 className="h-2.5 w-2.5" />已确认
      </span>
    );
  if (status === "edited")
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
        <Edit3 className="h-2.5 w-2.5" />已修改
      </span>
    );
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
      <Trash2 className="h-2.5 w-2.5" />已清空
    </span>
  );
}

/* ---------- 明日手术患者 - AI 术前康复评估（基于疼痛、肿胀、ROM） ---------- */
export function aiPreOpRehabAssessment(p: Patient): { level: "良好" | "尚可" | "欠佳"; tone: string; summary: string; reasons: string[]; suggestions: string[] } {
  const s = p.preOpSymptoms;
  if (!s) {
    return {
      level: "尚可",
      tone: "text-info",
      summary: "AI 术前评估：暂无症状数据",
      reasons: ["未录入疼痛 / 肿胀 / 关节活动度等指标"],
      suggestions: ["建议术前完成基础康复评估，便于制定术后方案"],
    };
  }
  const issues: string[] = [];
  if ((s.painVAS ?? 0) >= 5) issues.push(`疼痛 VAS ${s.painVAS}/10 偏高`);
  if (s.swelling === "中" || s.swelling === "重") issues.push(`关节肿胀 ${s.swelling}度`);
  if (s.rom && /0-([0-9]+)/.test(s.rom)) {
    const m = s.rom.match(/0-([0-9]+)/);
    if (m && parseInt(m[1]) < 100) issues.push(`关节活动度 ${s.rom} 受限`);
  }
  if (issues.length === 0) {
    return {
      level: "良好",
      tone: "text-success",
      summary: "AI 术前评估：康复条件良好",
      reasons: ["疼痛轻、关节活动度满意、肌力充分"],
      suggestions: ["可按计划手术，术后康复预后乐观", "术前继续维持现有训练强度"],
    };
  }
  if (issues.length === 1) {
    return {
      level: "尚可",
      tone: "text-warning-foreground",
      summary: "AI 术前评估：康复条件尚可，需重点关注",
      reasons: issues,
      suggestions: [
        "建议术前 1-2 日加强消肿与镇痛干预",
        "术后注意尽早恢复关节活动度",
      ],
    };
  }
  return {
    level: "欠佳",
    tone: "text-destructive",
    summary: `AI 术前评估：康复条件欠佳（${issues.length} 项异常）`,
    reasons: issues,
    suggestions: [
      "建议与主刀沟通是否需延迟手术",
      "术前先行消肿、止痛、ROM 强化训练",
      "术后康复方案需更循序渐进",
    ],
  };
}

/* ---------- 出院备注 ---------- */
function DischargeSheet({
  patient,
  onClose,
  onConfirm,
}: {
  patient: Patient;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const [understanding, setUnderstanding] = useState<"优" | "良" | "差">("良");
  const [compliance, setCompliance] = useState<"高" | "中" | "低">("高");
  const [transfer, setTransfer] = useState("");
  const [note, setNote] = useState("");
  const [remark, setRemark] = useState("");
  const canSave = note.trim().length > 0;
  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-background">
      <div className="flex items-center justify-between border-b bg-card px-3 py-2.5">
        <button onClick={onClose} className="text-[12px] text-muted-foreground">取消</button>
        <div className="text-[13px] font-semibold">康复出院评估 · {patient.name}</div>
        <button
          disabled={!canSave}
          onClick={() =>
            onConfirm(
              `[理解配合度:${understanding} / 医从性:${compliance}${transfer ? ` / 转院:${transfer}` : ""}${remark ? ` / 备注:${remark}` : ""}] ${note.trim()}`,
            )
          }
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground disabled:opacity-40"
        >
          <Save className="h-3 w-3" />确认出院
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-3">
        <div className="rounded-2xl border bg-warning/5 p-2.5 text-[11px] text-warning-foreground">
          <AlertTriangle className="mr-1 inline h-3 w-3" />
          出院评估完成后，该患者仍在「术后康复」中保留 <b>3 天</b>，便于后续追踪。
        </div>
        <div className="rounded-2xl border bg-card p-3 text-[11px]">
          <div className="font-semibold">
            {patient.bedNo && `${patient.bedNo}床 · `}{patient.name} · {patient.surgeryName ?? patient.diagnosis}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            术日 {patient.surgeryDate ?? "—"} · 患侧 {patient.side ?? "—"}
          </div>
        </div>

        <SectionBox label="理解配合度">
          <div className="flex gap-1.5">
            {(["优", "良", "差"] as const).map((k) => (
              <Chip key={k} active={understanding === k} onClick={() => setUnderstanding(k)}>
                {k}
              </Chip>
            ))}
          </div>
        </SectionBox>

        <SectionBox label="医从性">
          <div className="flex gap-1.5">
            {(["高", "中", "低"] as const).map((k) => (
              <Chip key={k} active={compliance === k} onClick={() => setCompliance(k)}>
                {k}
              </Chip>
            ))}
          </div>
        </SectionBox>

        <SectionBox label="转院记录（如有）">
          <input
            value={transfer}
            onChange={(e) => setTransfer(e.target.value)}
            placeholder="如：转往社区医院康复科 · 张医生"
            className="h-9 w-full rounded-lg border bg-muted/20 px-2 text-[12px] outline-none focus:border-primary"
          />
        </SectionBox>

        <SectionBox label="备注（团队可见）">
          <textarea
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="对家属交代、心理状态、特殊注意事项..."
            className="w-full rounded-lg border bg-muted/20 p-2 text-[11px] outline-none focus:border-primary"
          />
        </SectionBox>

        <SectionBox label="出院备注说明 *">
          <textarea
            rows={5}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="请填写康复达标情况、居家训练计划、复诊安排、注意事项..."
            className="w-full rounded-lg border bg-muted/20 p-2 text-[12px] outline-none focus:border-primary"
          />
        </SectionBox>
      </div>
    </div>
  );
}



