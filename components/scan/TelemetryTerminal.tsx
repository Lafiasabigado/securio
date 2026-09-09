"use client";

import { useEffect, useRef } from "react";

export interface LogEntry {
  timestamp: string;
  level?: "info" | "pass" | "warn" | "fail" | "neutral";
  message: string;
}

interface TelemetryTerminalProps {
  logs: LogEntry[];
  speed?: string;
  isStreaming?: boolean;
}

export function TelemetryTerminal({ logs, speed = "En direct", isStreaming = true }: TelemetryTerminalProps) {
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <span className="text-xs font-bold text-slate-700 ml-1">
            Journal de vérification en direct
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
          {isStreaming && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
          <span>{speed}</span>
        </div>
      </div>

      {/* Stream Viewport */}
      <div
        ref={streamRef}
        className="text-xs font-mono text-slate-700 space-y-2 max-h-72 overflow-y-auto pr-1 select-text scroll-smooth"
      >
        <div className="text-slate-400 select-none">// Démarrage de l&apos;analyse non-intrusive...</div>
        {logs.map((log, index) => {
          if (log.level === "pass") {
            return (
              <div key={index} className="flex items-baseline gap-2">
                <span className="text-slate-400 select-none text-[11px]">[{log.timestamp}]</span>
                <span className="text-emerald-700 font-semibold">{log.message}</span>
              </div>
            );
          }
          if (log.level === "warn") {
            return (
              <div key={index} className="text-amber-800 bg-amber-50/70 px-2 py-0.5 rounded border-l-2 border-amber-500 flex items-baseline gap-2">
                <span className="text-slate-400 select-none text-[11px]">[{log.timestamp}]</span>
                <span>{log.message}</span>
              </div>
            );
          }
          if (log.level === "fail") {
            return (
              <div key={index} className="text-red-700 bg-red-50/70 px-2 py-0.5 rounded border-l-2 border-red-500 flex items-baseline gap-2">
                <span className="text-slate-400 select-none text-[11px]">[{log.timestamp}]</span>
                <span>{log.message}</span>
              </div>
            );
          }
          return (
            <div key={index} className="flex items-baseline gap-2">
              <span className="text-slate-400 select-none text-[11px]">[{log.timestamp}]</span>
              <span className="text-slate-800">{log.message}</span>
            </div>
          );
        })}
        {isStreaming && (
          <div className="flex items-center gap-2 text-blue-700 bg-blue-50/70 px-2 py-1 rounded border-l-2 border-blue-500 animate-pulse text-xs">
            <span className="text-slate-400 text-[11px]">[en cours]</span>
            <span>Vérification des en-têtes et directives...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 text-slate-400 border-t border-slate-100 text-[11px]">
        <span>Méthode : Audit passif sans intrusion</span>
        <span>Sécurisé</span>
      </div>
    </div>
  );
}
