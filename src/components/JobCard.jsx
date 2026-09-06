import React from 'react';
import { nextStage } from '../utils/batchUtils';

function Badge({ children, color }) {
  return <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + color}>{children}</span>;
}

function TimerChip({ b, now }) {
  if (!(b.status === "In Progress" && b.timerStart)) return null;
  const curStage = nextStage(b);
  if (!curStage.includes("Water")) return null;
  const rem = Math.max(0, 180000 - (now - b.timerStart));
  const m = Math.floor(rem / 60000);
  const s = String(Math.floor((rem % 60000) / 1000)).padStart(2, "0");
  return (
    <span className={"text-xs px-1.5 py-0.5 rounded " + (rem === 0 ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800")}>
      {m}:{s}
    </span>
  );
}

export default function JobCard({ b, isExpanded, onToggleExpand, onDelete, onRecordResult, now }) {
  const currentStage = nextStage(b);

  return (
    <div className="relative bg-white rounded-2xl shadow p-4">
      {b.attempt > 0 && (
        <span
          className="absolute top-0 left-0 w-0 h-0 border-t-[28px] border-t-black border-r-[28px] border-r-transparent"
          title="Rewash"
        ></span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold flex items-center gap-2">
            {b.veg} <TimerChip b={b} now={now} />
          </div>
          <div className="mt-1 flex gap-2 items-center">
            {b.status === "In Progress" && <Badge color="bg-blue-100 text-blue-700">In Progress</Badge>}
            {b.status === "Passed" && <Badge color="bg-emerald-100 text-emerald-700">Passed</Badge>}
            {b.status === "Discarded" && <Badge color="bg-red-100 text-red-700">Discarded</Badge>}
            {(currentStage.includes("Water") || currentStage.includes("Thrip")) && (
              <span className="text-[11px] text-gray-400">Attempt {b.attempt + 1}</span>
            )}
            {b.status === "In Progress" && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {currentStage}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {b.status === "In Progress" && (
            <button
              onClick={onToggleExpand}
              className="px-3 py-2 rounded-xl bg-emerald-600 text-white"
            >
              {isExpanded ? "Hide" : "Check"}
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-3 py-2 rounded-xl bg-gray-200"
          >
            Delete
          </button>
        </div>
      </div>
      {isExpanded && b.status === "In Progress" && (
        currentStage === "Banging check" ? (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-xl border border-gray-200">
              <span className="font-semibold text-gray-700">Items failed at banging:</span>
              <span className="text-xl font-bold text-red-600">{b.bangingRejects || 0}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onRecordResult(b.id, "RejectItem")}
                className="h-20 text-lg leading-tight font-bold rounded-2xl text-white bg-orange-500 active:scale-[.99]"
              >
                REJECT<br />ITEM
              </button>
              <button
                onClick={() => onRecordResult(b.id, "FinishBanging")}
                className="h-20 text-lg leading-tight font-bold rounded-2xl text-white bg-emerald-600 active:scale-[.99]"
              >
                FINISH<br />BANGING
              </button>
            </div>
          </div>
        ) : currentStage === "Visual check" ? (
          <div className="mt-4">
            <button
              onClick={() => onRecordResult(b.id, "CompleteVisual")}
              className="w-full h-24 text-2xl font-bold rounded-2xl text-white bg-blue-600 active:scale-[.99]"
            >
              COMPLETE<br />VISUAL CHECK
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {b.hotWater && currentStage.includes("Water") && (
              <div className="flex items-center justify-center gap-2 bg-orange-100 border border-orange-300 rounded-xl px-4 py-3">
                <span className="text-orange-600 font-bold text-base">HOT WATER REQUIRED</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onRecordResult(b.id, "Pass")}
                className="h-24 text-2xl font-bold rounded-2xl text-white bg-emerald-600 active:scale-[.99]"
              >
                PASS
              </button>
              <button
                onClick={() => onRecordResult(b.id, "Fail")}
                className="h-24 text-2xl font-bold rounded-2xl text-white bg-red-600 active:scale-[.99]"
              >
                FAIL
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
