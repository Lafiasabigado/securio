"use client";

interface ScoreRadarProps {
  score: number;
  grade?: string;
  size?: "sm" | "md" | "lg";
  showGradeBadge?: boolean;
}

export function ScoreRadar({
  score,
  grade,
  size = "md",
  showGradeBadge = true,
}: ScoreRadarProps) {
  const radius = 48;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // ~301.59
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
  const offset = circumference * (1 - boundedScore / 100);

  // Dynamic semantic color based on score thresholds
  let strokeColor = "text-blue-600";
  let badgeBg = "bg-blue-50 text-blue-700 border-blue-200";
  let gradeLabel = "Bon niveau";

  if (boundedScore >= 90) {
    strokeColor = "text-emerald-600";
    badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
    gradeLabel = "Excellent";
  } else if (boundedScore >= 75) {
    strokeColor = "text-blue-600";
    badgeBg = "bg-blue-50 text-blue-800 border-blue-200";
    gradeLabel = "Sécurisé";
  } else if (boundedScore >= 50) {
    strokeColor = "text-amber-500";
    badgeBg = "bg-amber-50 text-amber-800 border-amber-200";
    gradeLabel = "À améliorer";
  } else {
    strokeColor = "text-red-600";
    badgeBg = "bg-red-50 text-red-800 border-red-200";
    gradeLabel = "Vulnérable";
  }

  const dimensionClasses = {
    sm: "w-28 h-28",
    md: "w-36 h-36 sm:w-40 sm:h-40",
    lg: "w-44 h-44 sm:w-48 sm:h-48",
  }[size];

  const scoreTextClasses = {
    sm: "text-2xl sm:text-3xl",
    md: "text-3xl sm:text-4xl",
    lg: "text-4xl sm:text-5xl",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center select-none shrink-0">
      <div className={`relative ${dimensionClasses} flex items-center justify-center`}>
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
          {/* Background track */}
          <circle
            className="text-slate-100"
            cx="60"
            cy="60"
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          {/* Animated fill circle */}
          <circle
            className={`${strokeColor} transition-all duration-1000 ease-out`}
            cx="60"
            cy="60"
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>

        {/* Content precisely inside circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`${scoreTextClasses} text-slate-900 font-extrabold tracking-tight leading-none`}>
            {boundedScore}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
            / 100
          </span>
        </div>
      </div>

      {/* Grade badge placed cleanly below the circle, leaving breathing room */}
      {showGradeBadge && grade && (
        <div className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs ${badgeBg}`}>
          <span>Note {grade}</span>
          <span className="opacity-60">•</span>
          <span>{gradeLabel}</span>
        </div>
      )}
    </div>
  );
}
