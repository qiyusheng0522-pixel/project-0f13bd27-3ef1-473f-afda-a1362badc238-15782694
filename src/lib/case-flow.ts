/**
 * 全流程演示数据中心（mock，module-level store + 订阅）。
 *
 * 用于「杨阳」这一条闭环病例：
 * 值班医生住院录入/术前量表 → 手术团队确认与术中记录 → 治疗师康复方案与每日评估
 * → 患者端打卡待办 → 护士每日备注/指标 → 交班单 → 治疗师确认出院（进入历史出院）
 *
 * 所有角色端读写同一份数据，异常指标天然多端同步（刷新即重置，仅用于演示）。
 */
import { useEffect, useState } from "react";
import { patients } from "./mock-data";
import type { Patient } from "./types";

export const DEMO_PATIENT_ID = "p-yang";
export const DEMO_PATIENT_NAME = "杨阳";

export type CaseStage =
  | "none"
  | "admitted"
  | "pushed-team"
  | "surgery-confirmed"
  | "in-surgery"
  | "post-op"
  | "rehab"
  | "discharged";

export const STAGE_STEPS: { key: CaseStage; label: string }[] = [
  { key: "admitted", label: "住院录入" },
  { key: "pushed-team", label: "推送团队" },
  { key: "surgery-confirmed", label: "手术确认" },
  { key: "in-surgery", label: "术中记录" },
  { key: "post-op", label: "推送治疗师" },
  { key: "rehab", label: "康复执行" },
  { key: "discharged", label: "已出院" },
];

export interface FlowEvent {
  id: string;
  at: string;
  role: string;
  text: string;
}

export interface AbnormalIndicator {
  id: string;
  source: "值班医生" | "护士" | "手术团队" | "治疗师";
  label: string;
  value: string;
  at: string;
  note?: string;
}

export interface SurgeryImage {
  id: string;
  url: string;
  label: string;
  by: string;
  at: string;
}

export interface IntraOpRecord {
  by: string;
  at: string;
  anesthesia: string;
  bleeding: string;
  implant: string;
  duration: string;
  complication: string;
  advice: string;
}

export interface DailyRehabRecord {
  id: string;
  date: string;
  painLevel: number;
  extension: string;
  flexion: string;
  content: string;
  therapist: string;
}

export interface NurseRecord {
  id: string;
  date: string;
  at: string;
  nurse: string;
  note: string;
  abnormalCount: number;
}

export interface HandoverRecord {
  id: string;
  date: string;
  createdAt: string;
  items: string[];
}

export interface CaseTodo {
  id: string;
  title: string;
  detail: string;
  time?: string;
  category: "运动" | "宣教" | "评估" | "用药";
  done: boolean;
}

/** 推送给患者的宣教（护士 / 治疗师推送，患者端【消息】提醒） */
export interface EduPush {
  id: string;
  title: string;
  desc: string;
  tag: string;
  by: string;
  at: string;
  read: boolean;
}

/** 患者端消息中心 */
export interface CaseMessage {
  id: string;
  at: string;
  kind: "edu" | "info";
  title: string;
  body: string;
  eduId?: string;
  read: boolean;
}

export interface CaseFlowState {
  stage: CaseStage;
  created: boolean;
  pushedToTeam: boolean;
  teamDecision: "go" | "hold" | "return" | null;
  teamDecisionNote: string;
  intraOp: IntraOpRecord | null;
  images: SurgeryImage[];
  pushedToTherapist: boolean;
  planApproved: boolean;
  planName: string;
  todos: CaseTodo[];
  dailyRehab: DailyRehabRecord[];
  nurseRecords: NurseRecord[];
  handovers: HandoverRecord[];
  abnormal: AbnormalIndicator[];
  eduPushes: EduPush[];
  messages: CaseMessage[];
  readmitCount: number;
  dischargeNote: string;
  /** 入院与手术同一天：跳过值班医生术前录入，直接推送手术团队 */
  sameDaySurgery: boolean;
  /** 出院时间戳（3 天内支持重新变更为入院状态） */
  dischargedAt: number | null;
  /** 康复未达预期，继续住院的说明 */
  continueStayNote: string;
  events: FlowEvent[];
}


const initial = (): CaseFlowState => ({
  stage: "none",
  created: false,
  pushedToTeam: false,
  teamDecision: null,
  teamDecisionNote: "",
  intraOp: null,
  images: [],
  pushedToTherapist: false,
  planApproved: false,
  planName: "",
  todos: [],
  dailyRehab: [],
  nurseRecords: [],
  handovers: [],
  abnormal: [],
  eduPushes: [],
  messages: [],
  readmitCount: 0,
  dischargeNote: "",
  sameDaySurgery: false,
  dischargedAt: null,
  continueStayNote: "",

  events: [],
});

let state: CaseFlowState = initial();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const uid = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const pad = (n: number) => String(n).padStart(2, "0");
export const nowStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const log = (role: string, text: string) => {
  state.events = [{ id: uid("e"), at: nowStr(), role, text }, ...state.events];
};

export function getCaseFlow() {
  return state;
}

export function getDemoPatient(): Patient | undefined {
  return patients.find((p) => p.id === DEMO_PATIENT_ID);
}

function patchPatient(patch: Partial<Patient>) {
  const p = getDemoPatient();
  if (p) Object.assign(p, patch);
}

/* ---------------- 1. 值班医生：住院录入 ---------------- */
export interface AdmitDraft {
  name: string;
  age: number;
  gender: "男" | "女";
  phone: string;
  bedNo: string;
  diagnosis: string;
  surgeryName: string;
  side: "左" | "右" | "双";
  director: string;
  surgeryDate: string;
  findings: { label: string; value: string; abnormal: boolean }[];
}

export const defaultAdmitDraft = (): AdmitDraft => ({
  name: DEMO_PATIENT_NAME,
  age: 63,
  gender: "男",
  phone: "137****6620",
  bedNo: "06",
  diagnosis: "右膝重度骨关节炎（内翻畸形）",
  surgeryName: "右膝人工全膝关节置换术（TKA）",
  side: "右",
  director: "王主任",
  surgeryDate: todayStr(),
  findings: [
    { label: "血红蛋白", value: "92 g/L", abnormal: true },
    { label: "血压", value: "165/95 mmHg", abnormal: true },
    { label: "心电图", value: "窦性心律，正常", abnormal: false },
    { label: "凝血 (INR)", value: "1.1", abnormal: false },
  ],
});

export function admitPatient(d: AdmitDraft) {
  const abnormalFindings = d.findings.filter((f) => f.abnormal);
  const record: Patient = {
    id: DEMO_PATIENT_ID,
    outpatientId: "MZ-DEMO-0001",
    name: d.name,
    age: d.age,
    gender: d.gender,
    phone: d.phone,
    diagnosis: d.diagnosis,
    surgeryName: d.surgeryName,
    side: d.side,
    director: d.director,
    responsibleDoctor: "朱医生",
    responsibleTherapist: "朱年鑫",
    bedNo: d.bedNo,
    admissionDate: todayStr(),
    surgeryDate: d.surgeryDate,
    status: "admitted",
    department: "inpatient",
    isNew: true,
    preOpAbnormal: abnormalFindings.length > 0,
    preOpFindings: d.findings,
    notes: "全流程演示病例",
    preOpSymptoms: { painVAS: 7, swelling: "中", rom: "5-95°", strength: "股四头肌 4 级", dailyFunction: "行走 200m 需助行器" },
  };
  const idx = patients.findIndex((p) => p.id === DEMO_PATIENT_ID);
  if (idx >= 0) patients[idx] = record;
  else patients.unshift(record);

  // 入院时间与手术时间同一天 → 不进入值班医生环节，直接推送手术团队
  const sameDay = d.surgeryDate === todayStr();

  state = {
    ...initial(),
    created: true,
    stage: sameDay ? "pushed-team" : "admitted",
    sameDaySurgery: sameDay,
    pushedToTeam: sameDay,
    abnormal: abnormalFindings.map((f) => ({
      id: uid("ab"),
      source: "值班医生" as const,
      label: f.label,
      value: f.value,
      at: nowStr(),
      note: "术前检查异常",
    })),
  };
  log("值班医生", `住院录入 ${d.name}（${d.bedNo}床）· 术前量表 ${abnormalFindings.length} 项异常`);
  if (sameDay) log("系统", `${d.name} 入院与手术同为 ${d.surgeryDate}，跳过值班医生术前录入，已直接推送手术团队`);
  notify();
}

export function pushPreOpToTeam() {
  state.pushedToTeam = true;
  if (state.stage === "admitted") state.stage = "pushed-team";
  log("值班医生", "术前量表已推送至 王主任团队 + 朱年鑫治疗师，等待手术确认");
  notify();
}

/* ---------------- 2. 手术团队 ---------------- */
export function setTeamDecision(decision: "go" | "hold" | "return", note = "") {
  state.teamDecision = decision;
  state.teamDecisionNote = note;
  if (decision === "go") {
    state.stage = "in-surgery";
    patchPatient({ status: "in-surgery", surgeryDate: todayStr() });
    log("手术团队", "术前异常已评估，确认如期手术（术中加强血压监测 + 备血）");
  } else {
    state.stage = "pushed-team";
    log("手术团队", decision === "hold" ? `暂缓手术：${note}` : `退回待排：${note}`);
  }
  notify();
}

export function addSurgeryImages(files: { url: string; label: string }[], by: string) {
  state.images = [
    ...state.images,
    ...files.map((f) => ({ id: uid("img"), url: f.url, label: f.label, by, at: nowStr() })),
  ];
  log(by, `上传术中影像 ${files.length} 张`);
  notify();
}

export function removeSurgeryImage(id: string) {
  state.images = state.images.filter((i) => i.id !== id);
  notify();
}

export function saveIntraOp(rec: Omit<IntraOpRecord, "at">) {
  state.intraOp = { ...rec, at: nowStr() };
  log(rec.by, "术中记录已保存");
  notify();
}

export function pushToTherapist() {
  state.pushedToTherapist = true;
  state.stage = "post-op";
  patchPatient({ status: "post-op" });
  log("手术团队", "手术结束，术中记录与影像已推送至 朱年鑫 治疗师，进入术后康复评估");
  notify();
}

/* ---------------- 3. 治疗师：康复方案 → 患者待办 ---------------- */
const planTodos = (): CaseTodo[] => [
  { id: uid("td"), title: "踝泵练习", detail: "20 个 × 10 组，清醒时每小时做", category: "运动", time: "全天", done: false },
  { id: uid("td"), title: "股四头肌等长收缩", detail: "20 次 × 3 组，保持 5-10 秒", category: "运动", time: "09:00", done: false },
  { id: uid("td"), title: "膝关节伸直练习", detail: "足跟垫枕 20 分钟", category: "运动", time: "10:30", done: false },
  { id: uid("td"), title: "屈膝训练 0-60°", detail: "床边屈伸 15 次 × 2 组，疼痛 VAS ≤4", category: "运动", time: "15:00", done: false },
  { id: uid("td"), title: "助行器辅助行走", detail: "10 米 × 3 次，家属陪同", category: "运动", time: "16:30", done: false },
  { id: uid("td"), title: "观看《膝关节置换术后康复》", detail: "宣教视频 3 分钟", category: "宣教", time: "19:00", done: false },
  { id: uid("td"), title: "今日康复自评", detail: "记录疼痛评分与屈膝角度", category: "评估", time: "20:00", done: false },
];

export function approvePlan(planName: string) {
  state.planApproved = true;
  state.planName = planName;
  state.stage = "rehab";
  state.todos = planTodos();
  patchPatient({ status: "rehab" });
  log("治疗师", `康复方案已审核通过：${planName} · 已生成患者端 ${state.todos.length} 项打卡待办`);
  notify();
}

export function toggleTodo(id: string) {
  state.todos = state.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  notify();
}

export function addDailyRehab(rec: Omit<DailyRehabRecord, "id">) {
  state.dailyRehab = [{ ...rec, id: uid("dr") }, ...state.dailyRehab];
  log("治疗师", `${rec.date} 康复评估：屈膝 ${rec.flexion} · 疼痛 ${rec.painLevel} 分`);
  if (rec.painLevel >= 6) {
    state.abnormal = [
      { id: uid("ab"), source: "治疗师", label: "康复疼痛 VAS", value: `${rec.painLevel}/10`, at: nowStr(), note: "训练后疼痛偏高，需减量" },
      ...state.abnormal,
    ];
  }
  notify();
}

export function dischargePatient(note: string) {
  state.dischargeNote = note;
  state.stage = "discharged";
  patchPatient({ status: "discharged", dischargeDate: todayStr() });
  log("治疗师", "出院评估达标，确认出院，进入历史出院患者列表");
  notify();
}

/** 历史出院患者重新入院：沿用原床位，重新进入院内康复，治疗师/护士可继续每日录入 */
export function readmitPatient() {
  const p = getDemoPatient();
  state.readmitCount += 1;
  state.stage = state.planApproved ? "rehab" : "post-op";
  state.dischargeNote = "";
  patchPatient({
    status: state.planApproved ? "rehab" : "post-op",
    dischargeDate: undefined,
    admissionDate: todayStr(),
    isNew: true,
  });
  pushMessage({
    kind: "info",
    title: "您已重新入院",
    body: `床位沿用 ${p?.bedNo ?? "--"} 床，治疗师与护士将继续每日康复记录与住院指标录入。`,
  });
  log("治疗师", `${p?.name ?? DEMO_PATIENT_NAME} 重新入院（第 ${state.readmitCount} 次），沿用 ${p?.bedNo ?? "--"} 床，继续院内康复`);
  notify();
}

/* ---------------- 宣教推送 + 患者端消息 ---------------- */
function pushMessage(m: Omit<CaseMessage, "id" | "at" | "read">) {
  state.messages = [{ ...m, id: uid("msg"), at: nowStr(), read: false }, ...state.messages];
}

export function pushEducation(items: { title: string; desc: string; tag: string }[], by: string) {
  const pushes: EduPush[] = items.map((i) => ({ ...i, id: uid("edu"), by, at: nowStr(), read: false }));
  state.eduPushes = [...pushes, ...state.eduPushes];
  pushes.forEach((p) =>
    pushMessage({
      kind: "edu",
      title: `【必读宣教】${p.title}`,
      body: `${by} 为您推送了宣教内容：${p.desc}，请点击查看。`,
      eduId: p.id,
    }),
  );
  log(by, `推送宣教 ${items.length} 条至患者端（已生成消息提醒）`);
  notify();
}

export function markEduRead(eduId: string) {
  state.eduPushes = state.eduPushes.map((e) => (e.id === eduId ? { ...e, read: true } : e));
  state.messages = state.messages.map((m) => (m.eduId === eduId ? { ...m, read: true } : m));
  notify();
}

export function markMessageRead(id: string) {
  state.messages = state.messages.map((m) => (m.id === id ? { ...m, read: true } : m));
  notify();
}

/** 各住院阶段的必读宣教（患者端住院版按当前阶段展示） */
export const STAGE_EDU: Record<string, { title: string; desc: string; tag: string }[]> = {
  admitted: [
    { title: "入院须知与陪护安排", desc: "病区作息 / 携带物品 / 陪护登记", tag: "入院" },
    { title: "术前准备与禁食水", desc: "术前 8 小时禁食、皮肤准备要点", tag: "术前" },
  ],
  "pushed-team": [
    { title: "术前一日宣教", desc: "皮肤准备 / 禁食水 / 心理准备", tag: "术前" },
    { title: "麻醉方式与术中配合", desc: "麻醉前评估、术中体位配合", tag: "术前" },
  ],
  "surgery-confirmed": [
    { title: "术前一日宣教", desc: "皮肤准备 / 禁食水 / 心理准备", tag: "术前" },
  ],
  "in-surgery": [
    { title: "术后返病房注意事项", desc: "体位摆放 / 引流管保护 / 疼痛告知", tag: "术后" },
  ],
  "post-op": [
    { title: "术后第一天：踝泵与直腿抬高", desc: "预防血栓的关键动作示范", tag: "术后" },
    { title: "DVT（下肢血栓）预防宣教", desc: "下肢活动 / 弹力袜 / 抗凝用药注意", tag: "术后" },
  ],
  rehab: [
    { title: "院内康复：屈膝角度进阶训练", desc: "0-90° 循序渐进，疼痛 VAS ≤4", tag: "康复" },
    { title: "助行器使用与防跌倒", desc: "起身三步法、上下床安全要点", tag: "安全" },
  ],
  discharged: [
    { title: "出院随访注意事项", desc: "复查时间 / 用药 / 饮食", tag: "出院" },
    { title: "居家康复计划与红旗症状", desc: "红肿热痛、发热需立即就诊", tag: "居家" },
  ],
};

/* ---------------- 4. 护士：每日备注 / 指标 / 交班 ---------------- */

export function addNurseRecord(input: {
  note: string;
  nurse: string;
  abnormal: { label: string; value: string; note?: string }[];
  date?: string;
}) {
  const date = input.date ?? todayStr();
  state.nurseRecords = [
    { id: uid("nr"), date, at: nowStr(), nurse: input.nurse, note: input.note, abnormalCount: input.abnormal.length },
    ...state.nurseRecords,
  ];
  if (input.abnormal.length) {
    state.abnormal = [
      ...input.abnormal.map((a) => ({
        id: uid("ab"),
        source: "护士" as const,
        label: a.label,
        value: a.value,
        at: nowStr(),
        note: a.note,
      })),
      ...state.abnormal,
    ];
  }
  log(input.nurse, `${date} 术后护理记录${input.abnormal.length ? ` · ${input.abnormal.length} 项指标异常（已同步多端）` : ""}`);
  notify();
}

export function generateHandover(date = todayStr()) {
  const p = getDemoPatient();
  const recs = state.nurseRecords.filter((r) => r.date === date);
  const items = [
    `${p?.bedNo ?? "--"}床 ${p?.name ?? DEMO_PATIENT_NAME} · ${p?.surgeryName ?? "—"} · 术后第 ${Math.max(1, state.dailyRehab.length)} 日`,
    ...recs.map((r) => `${r.at.slice(11)} ${r.nurse}：${r.note}`),
    ...state.abnormal.slice(0, 6).map((a) => `⚠ 异常指标（${a.source}）${a.label} ${a.value}${a.note ? ` · ${a.note}` : ""}`),
    state.planApproved ? `康复方案：${state.planName} · 待办完成 ${state.todos.filter((t) => t.done).length}/${state.todos.length}` : "康复方案：待治疗师审核",
  ];
  state.handovers = [{ id: uid("ho"), date, createdAt: nowStr(), items }, ...state.handovers.filter((h) => h.date !== date)];
  log("护士", `${date} 交班记录已生成（含 ${state.abnormal.length} 项异常指标）`);
  notify();
}

export function resetCaseFlow() {
  const idx = patients.findIndex((p) => p.id === DEMO_PATIENT_ID);
  if (idx >= 0) patients.splice(idx, 1);
  state = initial();
  notify();
}

/* ---------------- 订阅 ---------------- */
export function useCaseFlow(): CaseFlowState {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((x) => x + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return state;
}

/** 依据术中量表内容提炼术中评估项，并判定异常（多端共用，异常需高亮） */
export function intraOpAssessment(
  rec: Pick<IntraOpRecord, "anesthesia" | "bleeding" | "implant" | "duration" | "complication">,
): { label: string; value: string; abnormal: boolean; note: string }[] {
  const num = (v: string) => Number((v.match(/[\d.]+/) ?? ["0"])[0]);
  const complication = rec.complication.trim();
  const hasComplication = complication !== "" && !/^(无|否|未见|正常)/.test(complication);
  return [
    { label: "麻醉方式", value: rec.anesthesia, abnormal: false, note: "" },
    {
      label: "术中出血",
      value: rec.bleeding,
      abnormal: num(rec.bleeding) >= 400,
      note: "出血量偏多，警惕术后血红蛋白下降",
    },
    {
      label: "手术时长",
      value: rec.duration,
      abnormal: num(rec.duration) >= 120,
      note: "手术时间偏长，注意感染与深静脉血栓预防",
    },
    {
      label: "术中并发症",
      value: complication || "无",
      abnormal: hasComplication,
      note: "存在术中并发症，需调整康复强度",
    },
    { label: "假体型号", value: rec.implant, abnormal: false, note: "" },
  ];
}

export function stageIndex(stage: CaseStage) {

  return STAGE_STEPS.findIndex((s) => s.key === stage);
}
