"use client";

import { useState } from "react";

type Op = "+" | "-" | "×" | "÷";

function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
  }
}

const KEYS: { label: string; kind: "digit" | "op" | "action"; span?: boolean }[] = [
  { label: "C", kind: "action" },
  { label: "±", kind: "action" },
  { label: "%", kind: "action" },
  { label: "÷", kind: "op" },
  { label: "7", kind: "digit" },
  { label: "8", kind: "digit" },
  { label: "9", kind: "digit" },
  { label: "×", kind: "op" },
  { label: "4", kind: "digit" },
  { label: "5", kind: "digit" },
  { label: "6", kind: "digit" },
  { label: "-", kind: "op" },
  { label: "1", kind: "digit" },
  { label: "2", kind: "digit" },
  { label: "3", kind: "digit" },
  { label: "+", kind: "op" },
  { label: "0", kind: "digit", span: true },
  { label: ".", kind: "digit" },
  { label: "=", kind: "op" },
];

/** A real, working calculator — the classic macOS dock app. */
export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<Op | null>(null);
  const [freshEntry, setFreshEntry] = useState(true);

  const inputDigit = (d: string) => {
    if (freshEntry) {
      setDisplay(d === "." ? "0." : d);
      setFreshEntry(false);
      return;
    }
    if (d === "." && display.includes(".")) return;
    setDisplay((cur) => (cur === "0" && d !== "." ? d : cur + d));
  };

  const clear = () => {
    setDisplay("0");
    setStored(null);
    setPendingOp(null);
    setFreshEntry(true);
  };

  const toggleSign = () => setDisplay((cur) => (cur.startsWith("-") ? cur.slice(1) : `-${cur}`));

  const percent = () => setDisplay((cur) => String(parseFloat(cur) / 100));

  const chooseOp = (op: Op | "=") => {
    const current = parseFloat(display);

    if (op === "=") {
      if (pendingOp && stored !== null) {
        setDisplay(String(compute(stored, current, pendingOp)));
        setStored(null);
        setPendingOp(null);
        setFreshEntry(true);
      }
      return;
    }

    if (pendingOp && stored !== null && !freshEntry) {
      setStored(compute(stored, current, pendingOp));
    } else {
      setStored(current);
    }
    setPendingOp(op);
    setFreshEntry(true);
  };

  const onKey = (label: string) => {
    if (label === "C") return clear();
    if (label === "±") return toggleSign();
    if (label === "%") return percent();
    if (label === "=" || label === "+" || label === "-" || label === "×" || label === "÷") {
      return chooseOp(label as Op | "=");
    }
    inputDigit(label);
  };

  // Shown above the main display so the pending operation is never ambiguous.
  const pendingLine =
    pendingOp && stored !== null ? `${stored} ${pendingOp}${freshEntry ? "" : " " + display}` : "";

  return (
    <div className="flex h-full flex-col bg-[#1c1c1e] p-3">
      <div className="flex flex-1 flex-col items-end justify-end px-2 pb-2">
        <span className="h-5 truncate text-[15px] text-white/40" style={{ direction: "rtl" }}>
          {pendingLine}
        </span>
        <span className="truncate text-[42px] font-light text-white" style={{ direction: "rtl" }}>
          {display}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {KEYS.map((k) => {
          const isActiveOp = k.kind === "op" && k.label !== "=" && pendingOp === k.label && freshEntry;
          return (
            <button
              key={k.label}
              onClick={() => onKey(k.label)}
              className={`rounded-full py-3 text-[17px] font-medium transition active:scale-95 ${
                k.span ? "col-span-2 !rounded-full text-left pl-6" : ""
              } ${
                isActiveOp
                  ? "bg-white text-[#ff9f0a]"
                  : k.kind === "op"
                    ? "bg-[#ff9f0a] text-white hover:brightness-110"
                    : k.kind === "action"
                      ? "bg-[#5c5c5e] text-white hover:brightness-110"
                      : "bg-[#3a3a3c] text-white hover:brightness-110"
              }`}
            >
              {k.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
