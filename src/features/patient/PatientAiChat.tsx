import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Send,
  Mic,
  Sparkles,
  Stethoscope,
  Pill,
  FileSearch,
  HeartPulse,
  PersonStanding,
  Target,
  ClipboardList,
  UtensilsCrossed,
} from "lucide-react";

import aiDoctor from "@/assets/ai-doctor.jpg";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "ai"; text: string };

const CATS = [
  {
    key: "find",
    label: "寻医",
    icon: <Stethoscope className="size-4" />,
    prompt: "帮我推荐一位关节外科主治医生",
  },
  {
    key: "drug",
    label: "问药",
    icon: <Pill className="size-4" />,
    prompt: "塞来昔布应该怎么服用？有哪些副作用？",
  },
  {
    key: "report",
    label: "报告解读",
    icon: <FileSearch className="size-4" />,
    prompt: "请帮我解读最近的膝关节 X 光报告",
  },
  {
    key: "plan",
    label: "健康方案",
    icon: <HeartPulse className="size-4" />,
    prompt: "结合我的档案，给我一份本周的康复方案",
  },
];

function answerFor(query: string): string {
  const map: { k: string; a: string }[] = [
    {
      k: "肿",
      a: "术后肿胀属常见现象。建议：1) 抬高患肢高于心脏 20 分钟；2) 冰敷 15 分钟，每日 3-4 次；3) 加做踝泵运动促进回流。如 24 小时无缓解、伴有发热或伤口渗液，请立即联系主管医生。",
    },
    {
      k: "走",
      a: "您目前处于术后第 3 天，可在助行器辅助、护士陪同下床边站立与短距离行走（每次 5-10 分钟，每日 3 次），患肢按医嘱部分负重，避免单腿支撑与扭转动作。",
    },
    {
      k: "吃",
      a: "推荐今日午餐：杂粮饭 100g + 清蒸鲈鱼 + 蒜蓉西兰花 + 黄芪炖鸡汤。高蛋白、高钙，有助伤口愈合与骨质修复；忌辛辣生冷与烟酒。",
    },
    {
      k: "塞来昔布",
      a: "塞来昔布常规 200mg 每日 1-2 次，建议饭后服用以减少胃肠刺激。常见副作用：胃部不适、水肿。有心血管病史或胃溃疡史者需告知医生。请勿与其他非甾体抗炎药同服。",
    },
    {
      k: "医生",
      a: "为您匹配到 3 位关节外科医生：\n· 王渭君（主任医师）· 本周三上午门诊\n· 秦江辉（副主任医师）· 明日下午可预约\n· 宋凯（主治医师）· 病区随时可咨询\n点击「消息」可直接发起图文咨询。",
    },
    {
      k: "报告",
      a: "已识别您上传的膝关节 X 光报告：假体位置良好，力线正常，未见明显松动。结论：术后恢复符合预期。建议：继续按阶段完成康复训练，6 周后复查。",
    },
    {
      k: "方案",
      a: "本周专属康复方案：\n1) 运动：踝泵每小时 1 组；股四头肌等长收缩 15 次 ×3 组；直腿抬高 15 次 ×3 组\n2) 关节活动度：被动屈伸 0-60°，逐步增加\n3) 饮食：每日鸡蛋 1 个 + 牛奶 250ml，药食同源汤品 3 次/周\n4) 注意：避免下蹲跪地，上楼好腿先上、下楼患腿先下",
    },
    {
      k: "复查",
      a: "按鼓楼医院路径：出院后第 2 周门诊换药复查，第 6 周复查关节活动度与 X 光，第 3 个月做功能评估。复查前一天会在小程序推送提醒。",
    },
    {
      k: "组",
      a: "当前阶段建议：踝泵每小时 1 组（每组 30 次）；股四头肌等长收缩每次 10 秒 ×15 次，每日 3 组；直腿抬高 15 次 ×3 组。训练中疼痛评分超过 4 分请减量并告知治疗师。",
    },
  ];
  const hit = map.find((m) => query.includes(m.k));
  return (
    hit?.a ??
    "已收到您的问题，正在结合您的健康档案与康复阶段分析。建议先记录相关症状与近期指标，稍后由骨灵 AI 主治医生给出个性化建议。"
  );
}

export function PatientAiChat({
  initialQuestion,
}: {
  onClose?: () => void;
  initialQuestion?: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const handledRef = useRef<string | undefined>(undefined);

  const send = (text: string, key?: string) => {
    if (key) setActiveKey(key);
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: answerFor(t) }]);
    }, 450);
  };

  useEffect(() => {
    if (initialQuestion && handledRef.current !== initialQuestion) {
      handledRef.current = initialQuestion;
      send(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  useEffect(() => {
    if (msgs.length === 0) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);


  const hour = new Date().getHours();
  const greet = hour < 6 ? "凌晨好呀" : hour < 12 ? "上午好呀" : hour < 18 ? "下午好呀" : "晚上好呀";
  const SUGGESTS = [
    {
      q: "膝关节术后多久可以下地走路？",
      sub: "结合您的情况给建议",
      icon: <PersonStanding className="size-6 text-primary" />,
      tint: "bg-primary/10",
    },
    {
      q: "今天的康复动作怎么做才标准？",
      sub: "动作要点与注意事项",
      icon: <Target className="size-6 text-emerald-600" />,
      tint: "bg-emerald-500/10",
    },
    {
      q: "钙片和止痛药能一起吃吗？",
      sub: "用药搭配与禁忌",
      icon: <Pill className="size-6 text-amber-600" />,
      tint: "bg-amber-500/10",
    },
  ];

  const QUICK = [
    { label: "快速问医", sub: "联系医生", icon: <Stethoscope className="size-6 text-emerald-600" />, tint: "bg-emerald-500/10", prompt: "帮我推荐一位关节外科主治医生" },
    { label: "用药提醒", sub: "按时吃药", icon: <Pill className="size-6 text-violet-600" />, tint: "bg-violet-500/10", prompt: "塞来昔布应该怎么服用？有哪些副作用？" },
    { label: "报告管理", sub: "查看报告", icon: <ClipboardList className="size-6 text-primary" />, tint: "bg-primary/10", prompt: "请帮我解读最近的膝关节 X 光报告" },
    { label: "饮食建议", sub: "科学营养", icon: <UtensilsCrossed className="size-6 text-amber-600" />, tint: "bg-amber-500/10", prompt: "术后这一周我该怎么吃？给我一份药食同源食谱" },
  ];

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* 消息区 */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {msgs.length === 0 && (
          <div className="space-y-3">
            {/* AI 主治医生卡 */}
            <div
              className="flex items-center gap-3 rounded-3xl px-4 py-4"
              style={{ background: "linear-gradient(135deg, hsl(214 90% 62%), hsl(206 92% 72%))" }}
            >
              <div className="size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white/70">
                <img src={aiDoctor} alt="骨灵" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[19px] font-bold text-primary-foreground">AI 主治医生 · 骨灵</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-300" />
                  <span className="text-[17px] text-primary-foreground/90">在线为您服务</span>
                </div>
              </div>
            </div>

            {/* 问候 */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10">
                <HeartPulse className="size-6 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-[20px] font-bold leading-tight">{greet}</div>
                <div className="mt-0.5 text-[17px] text-muted-foreground">
                  康复动作、用药、饮食都可以问我
                </div>
              </div>
            </div>

            {/* 推荐提问 */}
            <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-black/[0.05]" style={{ boxShadow: "var(--shadow-card)" }}>
              {SUGGESTS.map((s, i) => (
                <button
                  key={s.q}
                  onClick={() => send(s.q, s.q)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3.5 py-3.5 text-left active:bg-muted/50",
                    i > 0 && "border-t",
                    activeKey === s.q && "bg-primary/10",
                  )}
                >
                  <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", s.tint)}>
                    {s.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-bold leading-snug">{s.q}</span>
                    <span className="mt-0.5 block text-[17px] text-muted-foreground">{s.sub}</span>
                  </span>
                  <ChevronLeft className="size-5 shrink-0 rotate-180 text-primary" />
                </button>
              ))}
            </div>

            {/* 快捷服务 */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK.map((q) => (
                <button
                  key={q.label}
                  onClick={() => send(q.prompt, q.label)}
                  className={cn(
                    "rounded-2xl bg-card px-1 py-3 ring-1 active:scale-95",
                    activeKey === q.label ? "ring-2 ring-primary bg-primary/10" : "ring-black/[0.05]",
                  )}
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <span className={cn("mx-auto grid size-11 place-items-center rounded-full", q.tint)}>
                    {q.icon}
                  </span>
                  <span className="mt-1.5 block text-[17px] font-bold">{q.label}</span>
                  <span className="block text-[16px] text-muted-foreground">{q.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[84%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[17px] leading-relaxed",
                m.role === "user"
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md bg-card ring-1 ring-black/[0.06]",
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* 输入区 */}
      <div className="shrink-0 border-t bg-card/95 px-3 pb-3 pt-2 backdrop-blur">
        <div className="scrollbar-hide mb-2 flex gap-1.5 overflow-x-auto">
          {CATS.map((c) => (
            <button
              key={c.key}
              onClick={() => send(c.prompt, c.key)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-1 rounded-full px-3 text-[17px] font-semibold ring-1 active:scale-95",
                activeKey === c.key
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-primary/10 text-primary ring-primary/15",
              )}
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-muted/60 py-1 pl-3 pr-1 ring-1 ring-black/[0.05]">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="向骨灵提问，例如：术后腿肿怎么办"
            className="min-w-0 flex-1 bg-transparent py-2 text-[17px] outline-none placeholder:text-muted-foreground/70"
          />
          <button
            aria-label="语音输入"
            className="grid size-9 place-items-center rounded-full text-primary/70 active:scale-95"
          >
            <Mic className="size-4" />
          </button>
          <button
            onClick={() => send(input)}
            aria-label="发送"
            className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground active:scale-95"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

