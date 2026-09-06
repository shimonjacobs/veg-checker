import React, { useState } from 'react';
import JobCard from '../components/JobCard';
import { getRequiredStages } from '../utils/batchUtils';

export default function JobsPage({
  active,
  planned,
  expanded,
  toggleExpand,
  deleteBatch,
  startFromPlan,
  recordResult,
  now
}) {
  const [batchToDelete, setBatchToDelete] = useState(null);

  const confirmDelete = () => {
    if (batchToDelete) {
      deleteBatch(batchToDelete);
      setBatchToDelete(null);
    }
  };

  return (
    <div className="space-y-3">
      {batchToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-pop-in">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete job?</h3>
            <p className="text-sm text-gray-600 mb-6">This will permanently remove the job and its history.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setBatchToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {active.length === 0 && (
        <p className="text-sm text-gray-500">No jobs in progress. Start some below.</p>
      )}

      {active.map(b => (
        <JobCard
          key={b.id}
          b={b}
          isExpanded={expanded.includes(b.id)}
          onToggleExpand={() => toggleExpand(b.id)}
          onDelete={() => setBatchToDelete(b.id)}
          onRecordResult={recordResult}
          now={now}
        />
      ))}

      {planned.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
            Available jobs
            <span className="bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
              {planned.length}
            </span>
          </h3>
          <div className="space-y-2">
            {(() => {
              const sorted = [...planned].sort((a, b) => a.veg.toLowerCase().localeCompare(b.veg.toLowerCase()));
              const groups = [];
              const keyMap = {};
              sorted.forEach(b => {
                const reqs = getRequiredStages(b);
                const needsBang = reqs.includes("Banging check");
                const isBanged = b.history.some(h => h.attempt === b.attempt && h.stage === "Banging check" && h.result === "Pass");
                const needsVisual = reqs.includes("Visual check");
                const isVisualDone = b.history.some(h => h.attempt === b.attempt && h.stage === "Visual check" && h.result === "Pass");
                const key = `${b.veg}|${b.attempt}|${needsBang}|${isBanged}|${needsVisual}|${isVisualDone}`;
                if (!keyMap[key]) {
                  const g = { key, veg: b.veg, count: 0, batches: [], attempt: b.attempt, needsBang, isBanged, needsVisual, isVisualDone };
                  keyMap[key] = g;
                  groups.push(g);
                }
                keyMap[key].count++;
                keyMap[key].batches.push(b);
              });
              return groups.map(g => (
                <div key={g.key} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-medium">{g.veg}</span>
                    {g.count > 1 && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                        ×{g.count}
                      </span>
                    )}
                    {g.attempt > 0 && (
                      <span className="text-[10px] bg-gray-700 text-white px-1.5 py-0.5 rounded font-bold leading-none shrink-0">
                        Rewash
                      </span>
                    )}
                    {g.needsBang && !g.isBanged && (
                      <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold leading-none shrink-0">
                        Bang
                      </span>
                    )}
                    {g.isBanged && (
                      <span className="text-[10px] bg-blue-800 text-white px-1.5 py-0.5 rounded font-bold leading-none shrink-0">
                        Banged
                      </span>
                    )}
                    {g.needsVisual && !g.isVisualDone && (
                      <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-bold leading-none shrink-0">
                        Visual
                      </span>
                    )}
                    {g.isVisualDone && (
                      <span className="text-[10px] bg-blue-800 text-white px-1.5 py-0.5 rounded font-bold leading-none shrink-0">
                        Visual Done
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => startFromPlan(g.batches[0].id)}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm shrink-0 ml-2"
                  >
                    Start
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
