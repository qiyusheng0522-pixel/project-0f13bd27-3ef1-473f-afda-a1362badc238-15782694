import { useState } from "react";
import {
  Stethoscope,
  Search,
  Lock,
  MessageSquare,
  Phone,
  Video,
  CheckCircle2,
  Shield,
  CalendarClock,
  BedDouble,
  Sparkles,
  Inbox,
} from "lucide-react";
import { QuickSheet, QuickToast } from "@/components/quick/QuickSheet";

type Doctor = {
  id: string;
  name: string;
  title: string;
  dept: string;
  hospital: string;
  tags: string[];
  rating: number;
  reviews: number;
  online: boolean;
  price: string;
  avatar: string;
};

const DOCTORS: Doctor[] = [
  {
    id: "d-zhang",
    name: "张敏 主任",
    title: "主任医师 · 博导",
    dept: "骨科·关节外科",
    hospital: "市第一人民医院",
    tags: ["膝髋关节置换", "关节镜", "20年经验"],
    rating: 4.9,
    reviews: 1284,
    online: true,
    price: "￥68 / 次",
    avatar: "👩‍⚕️",
  },
  {
    id: "d-li",
    name: "李文博 副主任",
    title: "副主任医师",
    dept: "骨科·关节外科",
    hospital: "市第一人民医院",
    tags: ["术后康复", "DVT 预防"],
    rating: 4.8,
    reviews: 932,
    online: true,
    price: "￥48 / 次",
    avatar: "👨‍⚕️",
  },
  {
    id: "d-wang",
    name: "王慧 主治",
    title: "主治医师",
    dept: "骨科·关节外科",
    hospital: "中心医院",
    tags: ["髋关节置换", "老年康复"],
    rating: 4.9,
    reviews: 612,
    online: false,
    price: "￥38 / 次",
    avatar: "👩‍⚕️",
  },
  {
    id: "d-chen",
    name: "陈昊 治疗师",
    title: "康复治疗师",
    dept: "康复科",
    hospital: "市第二人民医院",
    tags: ["关节康复训练", "步态评估"],
    rating: 4.7,
    reviews: 401,
    online: true,
    price: "￥38 / 次",
    avatar: "🦵",
  },
];

const ADMITTED_DOCTOR: Doctor = {
  id: "d-zhang",
  name: "张敏 主任",
  title: "主治医生 · 入院主管",
  dept: "骨科·关节外科 · 3号楼 12床",
  hospital: "市第一人民医院",
  tags: ["主管医生", "查房 08:30"],
  rating: 4.9,
  reviews: 1284,
  online: true,
  price: "院内服务 · 免费",
  avatar: "👩‍⚕️",
};

const ADMITTED_NURSE = {
  id: "n-liu",
  name: "刘静 护士长",
  title: "责任护士 · N4级",
  dept: "骨科·关节外科 · 12床责任护理",
  tags: ["床旁护理", "术后康复指导"],
  avatar: "👩‍⚕️",
};

export function ConsultRefView({ onClose }: { onClose: () => void }) {
  const [admitted, setAdmitted] = useState(false);
  const [tab, setTab] = useState("全部");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showAi, setShowAi] = useState(false);

  function fireToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(null), 1500);
  }

  const list = DOCTORS.filter(
    (d) =>
      !query.trim() ||
      d.name.includes(query) ||
      d.dept.includes(query) ||
      d.tags.some((t) => t.includes(query)),
  );

  return (
    <QuickSheet
      title="在线咨询"
      subtitle={admitted ? "入院期间 · 已锁定主管医护" : "可自由选择医生发起咨询"}
      onClose={onClose}
      right={
        <div className="flex items-center gap-2">
          <button
            onClick={() => fireToast("我的消息：共 3 条未读")}
            className="relative size-9 rounded-full grid place-items-center bg-muted active:scale-95"
            aria-label="我的消息"
          >
            <Inbox className="size-4" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center">
              3
            </span>
          </button>
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-muted text-[12px] font-semibold">
            <button
              onClick={() => setAdmitted(false)}
              className={`px-2.5 py-1.5 rounded-full transition whitespace-nowrap ${
                !admitted ? "bg-card shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              未入院
            </button>
            <button
              onClick={() => setAdmitted(true)}
              className={`px-2.5 py-1.5 rounded-full transition whitespace-nowrap ${
                admitted ? "bg-card shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              入院中
            </button>
          </div>
        </div>
      }
    >
      <div className="relative min-h-full bg-background text-foreground pb-6">
        {admitted ? (
          <AdmittedView fireToast={fireToast} />
        ) : (
          <UnadmittedView
            query={query}
            setQuery={setQuery}
            list={list}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            fireToast={fireToast}
            onAskAi={() => setShowAi(true)}
          />
        )}
        {toast && <QuickToast text={toast} />}
        {showAi && (
          <div className="absolute inset-0 z-[55] bg-background flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Sparkles className="size-10 text-primary" />
            <div className="text-[16px] font-bold">AI 主治医生</div>
            <div className="text-[13px] text-muted-foreground">该功能位于「AI 问诊」入口，敬请前往体验</div>
            <button
              onClick={() => setShowAi(false)}
              className="mt-2 h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-bold active:scale-95"
            >
              知道了
            </button>
          </div>
        )}
      </div>
    </QuickSheet>
  );
}

function UnadmittedView({
  query,
  setQuery,
  list,
  selectedId,
  setSelectedId,
  fireToast,
  onAskAi,
}: {
  query: string;
  setQuery: (v: string) => void;
  list: Doctor[];
  selectedId: string | null;
  setSelectedId: (v: string) => void;
  fireToast: (t: string) => void;
  onAskAi: () => void;
}) {
  return (
    <>
      <section className="px-4 mt-3">
        <div className="rounded-2xl p-3.5 text-primary-foreground bg-primary">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary-foreground/20 grid place-items-center ring-1 ring-primary-foreground/30 shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold leading-tight">先问 AI 主治医生</div>
              <div className="text-[12px] text-primary-foreground/85 mt-0.5">免费 · 秒回 · 结合您的骨科康复档案给建议</div>
            </div>
            <button
              onClick={onAskAi}
              className="shrink-0 h-9 px-3.5 rounded-full bg-card text-primary text-[13px] font-bold inline-flex items-center active:scale-95 whitespace-nowrap"
            >
              去提问
            </button>
          </div>
          <div className="mt-2.5 flex gap-1.5 overflow-x-auto">
            {["我该挂哪个科", "帮我解读复查报告", "推荐合适的医生"].map((q) => (
              <button
                key={q}
                onClick={onAskAi}
                className="shrink-0 px-2.5 py-1.5 rounded-full bg-primary-foreground/15 text-primary-foreground text-[12px] font-semibold ring-1 ring-primary-foreground/25 active:scale-95 whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 mt-3">
        <div className="flex items-center gap-2 px-3.5 py-3 rounded-full bg-muted">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索医生 / 科室 / 擅长"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
        </div>
      </section>

      <section className="px-4 mt-3 flex gap-1.5 overflow-x-auto">
        {["全部", "鼓楼医生", "社区医院"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
            }`}
          >
            {t}
          </button>
        ))}
      </section>

      <section className="px-4 mt-4 grid gap-2.5">
        <h2 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1">
          可咨询医生 · {list.length}
        </h2>
        {list.map((d) => (
          <DoctorCard
            key={d.id}
            d={d}
            selected={selectedId === d.id}
            onSelect={() => setSelectedId(d.id)}
            fireToast={fireToast}
          />
        ))}
        {list.length === 0 && (
          <div className="text-center text-[13px] text-muted-foreground py-8">未找到匹配医生</div>
        )}
      </section>
    </>
  );
}

function DoctorCard({
  d,
  selected,
  onSelect,
  fireToast,
}: {
  d: Doctor;
  selected: boolean;
  onSelect: () => void;
  fireToast: (t: string) => void;
}) {
  return (
    <div
      className={`text-left rounded-2xl bg-card p-3.5 ring-1 transition ${
        selected ? "ring-primary shadow-md" : "ring-border"
      }`}
    >
      <button onClick={onSelect} className="w-full text-left">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 grid place-items-center text-2xl">
              {d.avatar}
            </div>
            {d.online && (
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success ring-2 ring-card" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-bold truncate">{d.name}</span>
              <span className="text-[12px] text-muted-foreground truncate">· {d.title}</span>
            </div>
            <div className="text-[12.5px] text-muted-foreground mt-0.5 truncate">
              {d.dept} · {d.hospital}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {d.tags.map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-primary/8 text-primary whitespace-nowrap"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                ★ {d.rating} · {d.reviews} 评价
              </span>
              <span className="text-[13px] font-bold text-primary whitespace-nowrap">{d.price}</span>
            </div>
          </div>
        </div>
      </button>

      {selected && (
        <div className="mt-3 pt-3 border-t border-dashed border-border grid grid-cols-3 gap-2">
          <ActionBtn icon={<MessageSquare className="size-4" />} label="图文" primary onClick={() => fireToast("正在发起图文咨询…")} />
          <ActionBtn icon={<Phone className="size-4" />} label="电话" onClick={() => fireToast("正在拨打电话…")} />
          <ActionBtn icon={<Video className="size-4" />} label="视频" onClick={() => fireToast("正在发起视频通话…")} />
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  primary,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1 whitespace-nowrap active:scale-95 ${
        primary ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function AdmittedView({ fireToast }: { fireToast: (t: string) => void }) {
  return (
    <>
      <section className="px-4 mt-3">
        <article className="rounded-[22px] p-4 text-primary-foreground bg-primary overflow-hidden relative">
          <BedDouble className="absolute -right-3 -bottom-3 size-24 opacity-15" />
          <div className="flex items-center gap-1.5">
            <Shield className="size-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-90 whitespace-nowrap">
              入院中 · 专人专护
            </span>
          </div>
          <h2 className="text-[17px] font-bold mt-1.5">市第一人民医院 · 骨科·关节外科</h2>
          <p className="text-[12px] opacity-90 mt-0.5">3号楼 5层 · 12床 · 住院号 H20260611</p>
          <div className="mt-3 flex items-center gap-3 text-[12px]">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <CalendarClock className="size-3.5" />
              <span>入院 06-09 14:20</span>
            </div>
            <span className="opacity-60">·</span>
            <div className="whitespace-nowrap">已住院 2 天</div>
          </div>
        </article>
      </section>

      <section className="px-4 mt-3">
        <div className="rounded-xl px-3 py-2.5 bg-warning/10 ring-1 ring-warning/30 flex items-start gap-2">
          <Lock className="size-4 text-warning mt-0.5 shrink-0" />
          <div className="text-[13px] leading-relaxed text-foreground/90">
            入院期间为保障医疗连续性，咨询将<b>仅限主管医生与责任护士</b>，不可改约其他医生。出院后自动解锁。
          </div>
        </div>
      </section>

      <section className="px-4 mt-4">
        <h2 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
          您的主管医生
        </h2>
        <article className="rounded-2xl bg-card p-4 ring-1 ring-primary/20 relative overflow-hidden">
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center gap-1 whitespace-nowrap">
            <CheckCircle2 className="size-3" />
            主管
          </span>
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 grid place-items-center text-3xl">
                {ADMITTED_DOCTOR.avatar}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success ring-2 ring-card" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold">{ADMITTED_DOCTOR.name}</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">{ADMITTED_DOCTOR.title}</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">{ADMITTED_DOCTOR.dept}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {ADMITTED_DOCTOR.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary whitespace-nowrap">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <ActionBtn icon={<MessageSquare className="size-4" />} label="图文" primary onClick={() => fireToast("正在发起图文咨询…")} />
            <ActionBtn icon={<Phone className="size-4" />} label="电话" onClick={() => fireToast("正在拨打电话…")} />
            <ActionBtn icon={<Video className="size-4" />} label="视频" onClick={() => fireToast("正在发起视频通话…")} />
          </div>
        </article>
      </section>

      <section className="px-4 mt-3">
        <h2 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
          您的责任护士
        </h2>
        <article className="rounded-2xl bg-card p-4 ring-1 ring-success/20 relative overflow-hidden">
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-success text-primary-foreground text-[11px] font-bold flex items-center gap-1 whitespace-nowrap">
            <CheckCircle2 className="size-3" />
            责任
          </span>
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-success/15 to-primary/10 grid place-items-center text-3xl">
                {ADMITTED_NURSE.avatar}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success ring-2 ring-card" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold">{ADMITTED_NURSE.name}</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">{ADMITTED_NURSE.title}</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">{ADMITTED_NURSE.dept}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {ADMITTED_NURSE.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-success/10 text-success whitespace-nowrap">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ActionBtn icon={<MessageSquare className="size-4" />} label="呼叫护士" primary onClick={() => fireToast("正在呼叫责任护士…")} />
            <ActionBtn icon={<Phone className="size-4" />} label="床旁来人" onClick={() => fireToast("已通知护士站，请稍候")} />
          </div>
        </article>
      </section>

      <section className="px-4 mt-5">
        <h2 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2 flex items-center gap-1.5">
          <Lock className="size-3.5" />
          其他医生 · 入院期间不可选
        </h2>
        <div className="grid gap-2 opacity-50 pointer-events-none select-none">
          {DOCTORS.filter((d) => d.id !== ADMITTED_DOCTOR.id).slice(0, 2).map((d) => (
            <div key={d.id} className="rounded-2xl bg-card p-3 ring-1 ring-border flex items-center gap-3 relative">
              <div className="size-10 rounded-xl bg-muted grid place-items-center text-xl">
                {d.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold truncate">{d.name}</div>
                <div className="text-[12px] text-muted-foreground truncate">{d.dept} · {d.hospital}</div>
              </div>
              <Lock className="size-4 text-muted-foreground" />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground text-center">
          预计 06-13 出院后自动解锁全部医生
        </p>
      </section>
    </>
  );
}
