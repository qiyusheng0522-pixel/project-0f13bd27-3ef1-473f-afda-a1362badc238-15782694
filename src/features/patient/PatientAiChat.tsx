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
  onClose,
  initialQuestion,
}: {
  onClose: () => void;
  initialQuestion?: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: "您好，我是骨安 · 骨灵 AI 主治医生。可以问我康复动作、用药、饮食运动或报告解读相关的问题。",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const handledRef = useRef<string | undefined>(undefined);

  const send = (text: string) => {
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* 顶栏 */}
      <header className="flex shrink-0 items-center gap-2.5 border-b bg-card px-3 py-3">
        <button
          onClick={onClose}
          aria-label="返回"
          className="grid size-9 place-items-center rounded-full active:scale-95"
        >
          <ChevronLeft className="size-6" />
        </button>
        <div className="size-10 overflow-hidden rounded-xl ring-1 ring-primary/20">
          <img src={aiDoctor} alt="骨灵 AI 主治医生" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-bold leading-tight">骨安 · 骨灵大模型</div>
          <div className="mt-0.5 text-[12.5px] text-muted-foreground">
            结合您的档案给出个性化建议
          </div>
        </div>
      </header>

      {/* 消息区 */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[84%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[16px] leading-relaxed",
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

      {/* 分类 + 输入 */}
      <div className="shrink-0 border-t bg-card/95 px-3 pb-3 pt-2 backdrop-blur">
        <div className="scrollbar-hide mb-2 flex gap-1.5 overflow-x-auto">
          {CATS.map((c) => (
            <button
              key={c.key}
              onClick={() => send(c.prompt)}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 text-[14px] font-semibold text-primary ring-1 ring-primary/15 active:scale-95"
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
            placeholder="向骨灵大模型提问…"
            className="min-w-0 flex-1 bg-transparent py-2 text-[16px] outline-none placeholder:text-muted-foreground/70"
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
