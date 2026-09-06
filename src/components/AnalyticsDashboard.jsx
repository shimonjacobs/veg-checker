import React, { useState } from 'react';
import DonutChart from './DonutChart';

const PRODUCE_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#eab308', '#6366f1', '#64748b'
];

export default function AnalyticsDashboard({ batches }) {
  const [chartView, setChartView] = useState("outcomes");

  const completedBatches = batches.filter(b => b.status === "Passed" || b.status === "Discarded");
  const totalCompleted = completedBatches.length;
  const passedFirstTry = completedBatches.filter(b => b.status === "Passed" && b.attempt === 0).length;
  const passedRewash = completedBatches.filter(b => b.status === "Passed" && b.attempt > 0).length;
  const fpy = totalCompleted > 0 ? Math.round((passedFirstTry / totalCompleted) * 100) : 0;
  const totalDiscards = completedBatches.filter(b => b.status === "Discarded").length;
  const inProgressCount = batches.filter(b => b.status === "In Progress").length;
  const totalBangingRejects = batches.reduce((sum, b) => sum + (b.bangingRejects || 0), 0);

  const stageFails = {};
  batches.forEach(b => {
    if (b.firstFailStage) stageFails[b.firstFailStage] = (stageFails[b.firstFailStage] || 0) + 1;
  });
  const topBottleneck = Object.keys(stageFails).sort((a, b) => stageFails[b] - stageFails[a])[0] || "None";
  const totalFails = Object.values(stageFails).reduce((sum, count) => sum + count, 0);

  const vegStats = {};
  batches.forEach(b => {
    if (!vegStats[b.veg]) vegStats[b.veg] = { total: 0, passedFirstTry: 0, discards: 0 };
    vegStats[b.veg].total += 1;
    if (b.status === "Passed" && b.attempt === 0) vegStats[b.veg].passedFirstTry += 1;
    if (b.status === "Discarded") vegStats[b.veg].discards += 1;
  });
  const vegArray = Object.keys(vegStats).map(veg => {
    const s = vegStats[veg];
    return {
      veg,
      total: s.total,
      fpy: s.total > 0 ? Math.round((s.passedFirstTry / s.total) * 100) : 0,
      discardRate: s.total > 0 ? Math.round((s.discards / s.total) * 100) : 0
    };
  }).sort((a, b) => b.total - a.total);

  let totalMs = 0, validTimes = 0;
  completedBatches.forEach(b => {
    if (b.timerStart && b.history.length > 0) {
      const endTs = b.history[b.history.length - 1].ts;
      if (endTs > b.timerStart) {
        totalMs += (endTs - b.timerStart);
        validTimes += 1;
      }
    }
  });
  const avgMs = validTimes > 0 ? totalMs / validTimes : 0;
  const avgMins = Math.floor(avgMs / 60000);
  const avgSecs = String(Math.floor((avgMs % 60000) / 1000)).padStart(2, '0');

  // Chart datasets
  const outcomesData = [
    { label: "Passed (1st Try)", value: passedFirstTry, color: "#10b981" },
    { label: "Passed (Rewash)", value: passedRewash, color: "#3b82f6" },
    { label: "Discarded", value: totalDiscards, color: "#ef4444" },
    ...(inProgressCount > 0 ? [{ label: "In Progress", value: inProgressCount, color: "#f59e0b" }] : [])
  ];

  const stageColors = {
    "Water": "#06b6d4",
    "Thrip cloth": "#8b5cf6",
    "Banging check": "#f97316",
    "Visual check": "#ec4899"
  };

  const failuresData = Object.keys(stageFails).map((stage, idx) => ({
    label: stage,
    value: stageFails[stage],
    color: stageColors[stage] || PRODUCE_COLORS[idx % PRODUCE_COLORS.length]
  }));

  const produceData = vegArray.map((v, idx) => ({
    label: v.veg,
    value: v.total,
    color: PRODUCE_COLORS[idx % PRODUCE_COLORS.length]
  }));

  let currentChartData = outcomesData;
  let currentCenterValue = String(totalCompleted);
  let currentCenterLabel = "Completed";

  if (chartView === "failures") {
    currentChartData = failuresData;
    currentCenterValue = String(totalFails);
    currentCenterLabel = "Failures";
  } else if (chartView === "produce") {
    currentChartData = produceData;
    currentCenterValue = String(batches.length);
    currentCenterLabel = "Batches";
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-bold mb-4">Operations Dashboard</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 rounded-xl p-3 border">
          <div className="text-xs font-semibold text-gray-500 mb-1">First-Pass Yield</div>
          <div className={`text-2xl font-bold ${fpy >= 90 ? 'text-emerald-600' : 'text-red-600'}`}>{fpy}%</div>
          <div className="text-[10px] text-gray-400 mt-1">Goal: 90%+</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border">
          <div className="text-xs font-semibold text-gray-500 mb-1">Avg Process Time</div>
          <div className="text-2xl font-bold text-gray-800">{avgMins}m {avgSecs}s</div>
          <div className="text-[10px] text-gray-400 mt-1">Per completed batch</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border">
          <div className="text-xs font-semibold text-gray-500 mb-1">Total Waste</div>
          <div className="text-lg font-bold text-red-600">{totalDiscards} Batches</div>
          <div className="text-sm font-semibold text-orange-500">+ {totalBangingRejects} items</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border">
          <div className="text-xs font-semibold text-gray-500 mb-1">Top Bottleneck</div>
          <div className="text-lg font-bold text-gray-800 break-words">{topBottleneck}</div>
          <div className="text-[10px] text-gray-400 mt-1">Most common failure stage</div>
        </div>
      </div>

      {/* Visual Breakdown Donut Chart */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Breakdown</h3>
          <div className="flex bg-gray-200/80 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setChartView("outcomes")}
              className={`px-3 py-1 rounded-lg transition-all ${
                chartView === "outcomes" ? "bg-white text-gray-900 shadow-xs font-semibold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Outcomes
            </button>
            <button
              onClick={() => setChartView("failures")}
              className={`px-3 py-1 rounded-lg transition-all ${
                chartView === "failures" ? "bg-white text-gray-900 shadow-xs font-semibold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Failures
            </button>
            <button
              onClick={() => setChartView("produce")}
              className={`px-3 py-1 rounded-lg transition-all ${
                chartView === "produce" ? "bg-white text-gray-900 shadow-xs font-semibold" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Produce
            </button>
          </div>
        </div>

        <DonutChart
          data={currentChartData}
          centerValue={currentCenterValue}
          centerLabel={currentCenterLabel}
        />
      </div>

      <h3 className="text-md font-bold mb-2">Problematic Produce</h3>
      {vegArray.length === 0 ? (
        <p className="text-sm text-gray-500">No batches yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-2 rounded-tl-lg rounded-bl-lg">Veg</th>
                <th className="p-2">Vol</th>
                <th className="p-2">FPY</th>
                <th className="p-2 rounded-tr-lg rounded-br-lg">Discard</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vegArray.map(v => (
                <tr key={v.veg}>
                  <td className="p-2 font-medium">{v.veg}</td>
                  <td className="p-2">{v.total}</td>
                  <td className={`p-2 font-bold ${v.fpy < 90 ? 'text-red-500' : 'text-emerald-500'}`}>{v.fpy}%</td>
                  <td className="p-2 text-gray-600">{v.discardRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
