import React from "react";
import clsx from "clsx";

interface SubtleQuoteProps {
  quote: string;
  attribution?: string;
  context?: string;
  className?: string;
}

export function SubtleQuote({
  quote,
  attribution,
  context,
  className,
}: SubtleQuoteProps) {
  return (
    <div
      className={clsx(
        "border-l-2 border-slate-700/80 pl-4 py-1 my-3 text-slate-300 font-normal",
        className
      )}
    >
      <p className="text-sm italic leading-relaxed text-slate-300/90">
        &ldquo;{quote}&rdquo;
      </p>
      {(attribution || context) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 font-normal">
          {attribution && <span>&mdash; {attribution}</span>}
          {attribution && context && <span>&bull;</span>}
          {context && <span className="text-slate-500/80">{context}</span>}
        </div>
      )}
    </div>
  );
}
