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

export function TelemetryTerminal({ logs, speed = "3.2 kbit/s", isStreaming = true }: TelemetryTerminalProps) {
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="rounded-xl bg-[#f8fafc] border border-slate-300 p-space-md shadow-sm flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between pb-space-sm mb-space-xs border-b border-slate-200">
        <div className="flex items-center gap-space-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <span className="font-label-code-sm text-slate-600 ml-2 font-medium">
            telemetry_stdout.stream
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-label-code-sm text-emerald-600 font-medium">
          {isStreaming && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
          <span>{speed}</span>
        </div>
      </div>

      {/* Stream Viewport */}
      <div
        ref={streamRef}
        className="font-label-code-sm text-slate-700 space-y-2 max-h-80 overflow-y-auto pr-1 select-text scroll-smooth"
      >
        <div className="text-slate-400 select-none">// Initialisation des handshakes TLS et routines de diagnostic passif...</div>
        {logs.map((log, index) => {
          if (log.level === "pass") {
            return (
              <div key={index} className="flex items-baseline gap-1.5">
                <span className="text-slate-400 font-mono select-none">[{log.timestamp}]</span>
                <span className="text-emerald-700 font-medium">{log.message}</span>
              </div>
            );
          }
          if (log.level === "warn") {
            return (
              <div key={index} className="text-amber-800 bg-amber-50/70 px-1.5 py-0.5 rounded border-l-2 border-amber-500 flex items-baseline gap-1.5">
                <span className="text-slate-400 font-mono select-none">[{log.timestamp}]</span>
                <span>{log.message}</span>
              </div>
            );
          }
          if (log.level === "fail") {
            return (
              <div key={index} className="text-red-700 bg-red-50/70 px-1.5 py-0.5 rounded border-l-2 border-red-500 flex items-baseline gap-1.5">
                <span className="text-slate-400 font-mono select-none">[{log.timestamp}]</span>
                <span>{log.message}</span>
              </div>
            );
          }
          return (
            <div key={index} className="flex items-baseline gap-1.5">
              <span className="text-slate-400 font-mono select-none">[{log.timestamp}]</span>
              <span className="text-slate-800">{log.message}</span>
            </div>
          );
        })}
        {isStreaming && (
          <div className="flex items-center gap-1 text-blue-700 bg-blue-50/70 px-1.5 py-0.5 rounded border-l-2 border-blue-500 animate-pulse">
            <span className="text-slate-400 font-mono">[flux actif]</span>
            <span>Évaluation des en-têtes et directives en cours...</span>
            <span className="inline-block w-1.5 h-3.5 bg-blue-600 ml-1"></span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-space-sm mt-space-sm text-slate-400 border-t border-slate-200 font-label-code-sm">
        <span>Moteur : Analyseur passif RFC 7230</span>
        <span>Mémoire tampon : 8.4 Ko</span>
      </div>
    </div>
  );
}
