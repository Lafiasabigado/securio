"use client";

interface ScoreRadarProps {
  score: number;
  grade?: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreRadar({ score, grade, size = "md" }: ScoreRadarProps) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.159
  const boundedScore = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - boundedScore / 100);

  // Dynamic semantic color based on score thresholds
  let strokeColor = "text-blue-600";
  let badgeBg = "bg-blue-50 text-blue-700 border-blue-200";

  if (boundedScore >= 90) {
    strokeColor = "text-emerald-600";
    badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (boundedScore >= 75) {
    strokeColor = "text-blue-600";
    badgeBg = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (boundedScore >= 50) {
    strokeColor = "text-amber-500";
    badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
  } else {
    strokeColor = "text-red-600";
    badgeBg = "bg-red-50 text-red-700 border-red-200";
  }

  const dimensionClasses = {
    sm: "w-28 h-28",
    md: "w-36 h-36 sm:w-44 sm:h-44",
    lg: "w-44 h-44 sm:w-52 sm:h-52",
  }[size];

  const scoreTextClasses = {
    sm: "text-2xl",
    md: "text-3xl sm:text-[36px]",
    lg: "text-4xl sm:text-[44px]",
  }[size];

  return (
    <div className={`relative ${dimensionClasses} flex-shrink-0 flex items-center justify-center select-none`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Background track */}
        <circle
          className="text-slate-100"
          cx="60"
          cy="60"
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
        />
        {/* Animated fill circle */}
        <circle
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          cx="60"
          cy="60"
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-metric-stat ${scoreTextClasses} text-slate-900 leading-none font-bold`}>
          {boundedScore}
        </span>
        <span className="font-label-code-sm text-slate-400 mt-0.5">/ 100</span>
        {grade && (
          <span className={`mt-1 font-label-code-sm font-semibold px-2 py-0.5 rounded-full border text-xs ${badgeBg}`}>
            Grade {grade}
          </span>
        )}
      </div>
    </div>
  );
}
