"use client";

const STEPS = ["OPEN", "ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED"];

export function ProjectStatusBar({ status }) {
  const current = STEPS.indexOf(status);

  return (
    <div className="flex items-center my-5 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <div key={step} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? "1" : "none" }}>
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${done ? "bg-brand text-white" : "bg-border text-text-light"}`}>
                {i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap
                ${done ? "text-brand" : "text-text-light"}`}>
                {step.replace("_", " ")}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${done && i < current ? "bg-brand" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
