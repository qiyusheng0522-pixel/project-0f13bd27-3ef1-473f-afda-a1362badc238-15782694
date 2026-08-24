import { useEffect, useState } from "react";
import { Pause, Play, X, RotateCcw, CheckCircle2 } from "lucide-react";

/** 通用视频/跟练播放弹层（模拟播放进度） */
export function VideoSheet({
  title,
  subtitle,
  duration = "03:20",
  onClose,
  onFinish,
}: {
  title: string;
  subtitle?: string;
  duration?: string;
  onClose: () => void;
  onFinish?: () => void;
}) {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          return 100;
        }
        return p + 2;
      });
    }, 120);
    return () => clearInterval(id);
  }, [playing]);

  const finished = progress >= 100;

  return (
    <div className="absolute inset-0 z-[70] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative rounded-t-3xl bg-background p-4 pb-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-bold">{title}</h3>
            {subtitle && <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="关闭" className="grid size-9 shrink-0 place-items-center rounded-full bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600">
          <button
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? "暂停" : "播放"}
            className="grid size-16 place-items-center rounded-full bg-white/90 text-slate-900 active:scale-95"
          >
            {playing && !finished ? <Pause className="size-7" /> : <Play className="size-7 translate-x-[2px]" />}
          </button>
          <span className="absolute bottom-2 right-3 rounded-full bg-black/45 px-2 py-0.5 text-[12px] font-bold text-white">
            {duration}
          </span>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setProgress(0);
              setPlaying(true);
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-muted py-3 text-[15px] font-bold active:scale-[0.98]"
          >
            <RotateCcw className="size-4" /> 重新播放
          </button>
          <button
            onClick={() => {
              onFinish?.();
              onClose();
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-[15px] font-bold text-primary-foreground active:scale-[0.98]"
          >
            <CheckCircle2 className="size-4" /> 完成跟练并打卡
          </button>
        </div>
      </div>
    </div>
  );
}
