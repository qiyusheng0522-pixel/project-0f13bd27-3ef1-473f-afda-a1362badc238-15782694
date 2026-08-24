import { useState } from "react";
import {
  Search,
  Phone,
  Video,
  Paperclip,
  Send,
  Image as ImageIcon,
  Stethoscope,
  ShieldCheck,
  CheckCheck,
  ChevronLeft,
  Inbox,
} from "lucide-react";
import { QuickSheet, QuickToast } from "@/components/quick/QuickSheet";

type Msg = {
  id: string;
  from: "doctor" | "me" | "system";
  text: string;
  time: string;
  kind?: "text" | "image" | "call";
};

type Thread = {
  id: string;
  name: string;
  role: string;
  dept: string;
  avatar: string;
  online: boolean;
  unread: number;
  last: string;
  lastTime: string;
  pinned?: boolean;
  badge?: "主管" | "责任" | "在线";
  messages: Msg[];
};

const THREADS: Thread[] = [
  {
    id: "t-zhang",
    name: "张敏 主任",
    role: "主治医生 · 入院主管",
    dept: "市第一人民医院 · 骨科·关节外科",
    avatar: "👩‍⚕️",
    online: true,
    unread: 2,
    last: "看了您今早的患肢肿胀情况，建议下午加做冰敷…",
    lastTime: "09:42",
    pinned: true,
    badge: "主管",
    messages: [
      { id: "m1", from: "system", text: "图文咨询已开启 · 张敏 主任 将在 30 分钟内回复", time: "昨天 21:08" },
      { id: "m2", from: "me", text: "张主任您好，右膝置换术后第3天，起身时仍有明显疼痛，是否正常？", time: "昨天 21:09", kind: "text" },
      { id: "m3", from: "me", text: "", time: "昨天 21:10", kind: "image" },
      { id: "m4", from: "doctor", text: "收到，已查看您上传的伤口和患肢照片。", time: "今天 09:38" },
      { id: "m5", from: "doctor", text: "看了您今早的患肢肿胀情况，属于术后正常反应，建议下午加做冰敷 20 分钟，并继续踝泵练习预防血栓。", time: "今天 09:41" },
      { id: "m6", from: "doctor", text: "止痛药按医嘱按时服用即可，如疼痛评分持续 >6 分或出现发热，请立即呼叫责任护士。", time: "今天 09:42" },
    ],
  },
  {
    id: "t-liu",
    name: "刘静 护士长",
    role: "责任护士 · N4级",
    dept: "骨科·关节外科 · 12床责任护理",
    avatar: "👩‍⚕️",
    online: true,
    unread: 1,
    last: "您今天 14:00 的抗凝药已在床旁执行，请记得配合下床活动。",
    lastTime: "14:05",
    badge: "责任",
    messages: [
      { id: "n1", from: "doctor", text: "王先生您好，我是您 12 床的责任护士刘静，有任何不适请随时呼叫。", time: "06-09 15:00" },
      { id: "n2", from: "doctor", text: "您今天 14:00 的抗凝药（预防DVT）已在床旁执行，请记得配合下床活动。", time: "14:05" },
    ],
  },
  {
    id: "t-li",
    name: "李文博 副主任",
    role: "副主任医师 · 骨科·关节外科",
    dept: "市第一人民医院",
    avatar: "👨‍⚕️",
    online: false,
    unread: 0,
    last: "[电话咨询] 通话时长 8 分 12 秒",
    lastTime: "昨天",
    badge: "在线",
    messages: [
      { id: "l1", from: "system", text: "电话咨询已结束 · 时长 8 分 12 秒", time: "昨天 19:22", kind: "call" },
      { id: "l2", from: "doctor", text: "刚刚电话里说的康复训练计划已发给您，请按新方案循序渐进 3 天后反馈。", time: "昨天 19:25" },
      { id: "l3", from: "me", text: "好的李医生，谢谢！", time: "昨天 19:26" },
    ],
  },
  {
    id: "t-chen",
    name: "陈昊 治疗师",
    role: "康复科 · 关节康复",
    dept: "市第二人民医院",
    avatar: "🦵",
    online: true,
    unread: 0,
    last: "本周髋关节康复训练方案已更新，可在【安家在护】查看。",
    lastTime: "06-12",
    messages: [
      { id: "c1", from: "doctor", text: "本周髋关节康复训练方案已根据您的活动度评估调整，可在【安家在护】查看。", time: "06-12 10:18" },
    ],
  },
];

export function MessagesView({ onClose }: { onClose: () => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [showConsult, setShowConsult] = useState(false);
  const active = THREADS.find((t) => t.id === activeId) ?? null;

  function fireToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(null), 1500);
  }

  return (
    <QuickSheet
      title={active ? active.name : "我的消息"}
      subtitle={active ? active.dept : "医生回复 / 护士通知 · 集中查看"}
      onClose={() => (active ? setActiveId(null) : onClose())}
      right={
        active ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fireToast("正在拨打电话…")}
              className="size-9 rounded-full grid place-items-center bg-muted active:scale-95"
              aria-label="电话"
            >
              <Phone className="size-4" />
            </button>
            <button
              onClick={() => fireToast("正在发起视频通话…")}
              className="size-9 rounded-full grid place-items-center bg-muted active:scale-95"
              aria-label="视频"
            >
              <Video className="size-4" />
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="relative flex min-h-full flex-col bg-background">
        {active ? (
          <ThreadView thread={active} draft={draft} setDraft={setDraft} onSend={() => {
            if (!draft.trim()) return;
            fireToast("消息已发送");
            setDraft("");
          }} />
        ) : (
          <InboxView onOpen={setActiveId} onNewConsult={() => setShowConsult(true)} />
        )}
        {toast && <QuickToast text={toast} />}
        {showConsult && (
          <div className="absolute inset-0 z-[55] bg-background flex flex-col items-center justify-center gap-3 p-6 text-center">
            <Stethoscope className="size-10 text-primary" />
            <div className="text-[16px] font-bold">发起新的咨询</div>
            <div className="text-[13px] text-muted-foreground">请前往「在线咨询」页面选择骨科·关节外科医生</div>
            <button
              onClick={() => setShowConsult(false)}
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

function InboxView({ onOpen, onNewConsult }: { onOpen: (id: string) => void; onNewConsult: () => void }) {
  const totalUnread = THREADS.reduce((s, t) => s + t.unread, 0);
  return (
    <div className="flex-1 pb-6">
      <section className="px-4 mt-3">
        <div className="flex items-center gap-2 px-3.5 py-3 rounded-full bg-muted">
          <Search className="size-4 text-muted-foreground" />
          <input
            placeholder="搜索医生 / 消息内容"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
        </div>
      </section>

      <section className="px-4 mt-3">
        <div className="rounded-xl px-3 py-2.5 bg-primary/[0.06] ring-1 ring-primary/15 flex items-start gap-2">
          <ShieldCheck className="size-4 text-primary mt-0.5 shrink-0" />
          <div className="text-[13px] leading-relaxed text-foreground/80">
            所有咨询记录加密保存 · 共 <b className="text-primary">{totalUnread}</b> 条未读医生回复
          </div>
        </div>
      </section>

      <section className="px-4 mt-3 flex gap-1.5 overflow-x-auto">
        {["全部", "医生", "护士", "系统通知"].map((t, i) => (
          <button
            key={t}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
            }`}
          >
            {t}
          </button>
        ))}
      </section>

      <section className="px-4 mt-4 grid gap-2">
        <h2 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider px-1">
          会话 · {THREADS.length}
        </h2>
        {THREADS.map((t) => (
          <button
            key={t.id}
            onClick={() => onOpen(t.id)}
            className="text-left rounded-2xl bg-card p-3 ring-1 ring-border active:scale-[0.99] transition"
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div className="size-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 grid place-items-center text-2xl">
                  {t.avatar}
                </div>
                {t.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success ring-2 ring-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold truncate">{t.name}</span>
                  {t.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary shrink-0 whitespace-nowrap">
                      {t.badge}
                    </span>
                  )}
                  {t.pinned && (
                    <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">置顶</span>
                  )}
                  <span className="ml-auto text-[12px] text-muted-foreground shrink-0 whitespace-nowrap">{t.lastTime}</span>
                </div>
                <div className="text-[12.5px] text-muted-foreground truncate mt-0.5">{t.role}</div>
                <div className="mt-1 flex items-end gap-2">
                  <p className="flex-1 text-[13px] text-foreground/75 line-clamp-2 leading-snug">
                    {t.last}
                  </p>
                  {t.unread > 0 && (
                    <span className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold grid place-items-center whitespace-nowrap">
                      {t.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </section>

      <section className="px-4 mt-5">
        <button
          onClick={onNewConsult}
          className="w-full flex items-center justify-between rounded-2xl bg-card px-3.5 py-3 ring-1 ring-border"
        >
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl grid place-items-center bg-primary/10">
              <Stethoscope className="size-4 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-[14px] font-bold leading-tight">发起新的咨询</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">选择骨科·关节外科医生 · 图文 / 电话 / 视频</div>
            </div>
          </div>
          <ChevronLeft className="size-4 text-muted-foreground rotate-180" />
        </button>
      </section>
    </div>
  );
}

function ThreadView({
  thread,
  draft,
  setDraft,
  onSend,
}: {
  thread: Thread;
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col min-h-full">
      <section className="px-4 mt-3">
        <div className="rounded-2xl bg-card p-3 ring-1 ring-primary/15 flex items-center gap-3">
          <div className="size-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 grid place-items-center text-2xl">
            {thread.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold">{thread.name} · {thread.role}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">{thread.dept}</div>
          </div>
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-bold whitespace-nowrap">
            查看主页
          </span>
        </div>
      </section>

      <section className="flex-1 px-4 mt-3 pb-3 space-y-3">
        {thread.messages.map((m) => {
          if (m.from === "system") {
            return (
              <div key={m.id} className="text-center">
                <span className="inline-block px-2.5 py-1 rounded-full bg-muted text-[11px] text-muted-foreground whitespace-nowrap">
                  {m.kind === "call" ? "📞 " : ""}
                  {m.text} · {m.time}
                </span>
              </div>
            );
          }
          const isMe = m.from === "me";
          return (
            <div key={m.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className="size-7 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 grid place-items-center text-base shrink-0">
                {isMe ? "🧑" : thread.avatar}
              </div>
              <div className={`max-w-[78%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <span className="text-[11px] text-muted-foreground px-1">{m.time}</span>
                {m.kind === "image" ? (
                  <div className="size-32 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 grid place-items-center ring-1 ring-border">
                    <ImageIcon className="size-6 text-amber-700/60" />
                  </div>
                ) : (
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card ring-1 ring-border rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                )}
                {isMe && (
                  <span className="text-[11px] text-muted-foreground px-1 flex items-center gap-0.5 whitespace-nowrap">
                    <CheckCheck className="size-3" /> 已读
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border px-3 py-2.5 flex items-center gap-2">
        <button className="size-9 rounded-full grid place-items-center bg-muted" aria-label="图片">
          <ImageIcon className="size-4" />
        </button>
        <button className="size-9 rounded-full grid place-items-center bg-muted" aria-label="附件">
          <Paperclip className="size-4" />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
          placeholder="输入消息…"
          className="flex-1 px-3.5 py-2.5 rounded-full bg-muted text-[14px] outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={onSend}
          className="size-9 rounded-full grid place-items-center bg-primary text-primary-foreground active:scale-95"
          aria-label="发送"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
