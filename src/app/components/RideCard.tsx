"use client";

type Props = {
  provider: string;
  estimateUsd: number;
  etaMin: number;
  deepLink: string;
  webLink: string;
  baselinePriceUsd?: number; // for comparison
};

export default function RideCard({ provider, estimateUsd, etaMin, deepLink, webLink, baselinePriceUsd }: Props) {
  const isUber = provider.toLowerCase().includes("uber");
  const isLyft = provider.toLowerCase().includes("lyft");
  const brandColor = isUber ? "bg-neutral-900" : isLyft ? "bg-[#ff00bf]" : "bg-blue-600";
  const brandText = "text-white";

  let etaBadge = "text-neutral-300 ring-neutral-700";
  if (etaMin <= 10) {
    etaBadge = "text-emerald-300 ring-emerald-500/40";
  } else if (etaMin <= 30) {
    etaBadge = "text-amber-300 ring-amber-500/40";
  } else {
    etaBadge = "text-rose-300 ring-rose-500/40";
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 flex items-center justify-between shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-7 h-7 rounded-full ${brandColor} ${brandText} grid place-items-center text-xs font-semibold shrink-0`}>
          {isUber ? "U" : isLyft ? "L" : provider[0]}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium truncate text-neutral-200">{provider}</div>
          <div className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] bg-neutral-800 ring-1 ${etaBadge}`}>ETA {etaMin} min</div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow ring-1 ring-emerald-400/60">
          ${""}{estimateUsd.toFixed(2)}
          {typeof baselinePriceUsd === 'number' && baselinePriceUsd > 0 && (
            <div className={`text-[10px] mt-0.5 ${estimateUsd - baselinePriceUsd <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {estimateUsd - baselinePriceUsd <= 0 ? '-' : '+'}{Math.abs(estimateUsd - baselinePriceUsd).toFixed(2)}
            </div>
          )}
        </div>
        <a
          href={deepLink}
          aria-label={`Open ${provider} app`}
          className="text-[12px] px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow transition-all duration-150 hover:shadow-lg hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          Open App
        </a>
        <a
          href={webLink}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${provider} web`}
          className="text-[12px] px-3 py-1.5 rounded-lg bg-neutral-800/70 text-neutral-100 border border-neutral-600 transition-colors duration-150 hover:bg-neutral-700 hover:border-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 inline-flex items-center gap-1"
        >
          <span aria-hidden>🌐</span>
          <span>Open Web</span>
        </a>
      </div>
    </div>
  );
}


