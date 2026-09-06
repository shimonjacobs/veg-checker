import React from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function ReportsPage({ batches, addToast }) {
  const makeEODText = () => {
    const byVeg = new Map();
    for (const b of batches) {
      const k = b.veg;
      if (!byVeg.has(k)) byVeg.set(k, { total: 0, rewashWater: 0, rewashThrip: 0, rejects: 0, bangingRejects: 0 });
      const r = byVeg.get(k);
      r.total += 1;
      if (b.firstFailStage && b.firstFailStage.includes("Water")) r.rewashWater += 1;
      if (b.firstFailStage && b.firstFailStage.includes("Thrip cloth")) r.rewashThrip += 1;
      if (b.status === "Discarded") r.rejects += 1;
      if (b.bangingRejects > 0) r.bangingRejects += b.bangingRejects;
    }
    const lines = [];
    const order = [...byVeg.keys()].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    for (const veg of order) {
      const r = byVeg.get(veg);
      const parts = [];
      if (r.rewashWater === 0 && r.rewashThrip === 0 && r.rejects === 0 && r.bangingRejects === 0) {
        parts.push("all clean");
      } else {
        const issues = [];
        if (r.bangingRejects > 0) issues.push(`${r.bangingRejects} failed at banging`);
        if (r.rewashWater > 0) issues.push(`${r.rewashWater} rewash (Water)`);
        if (r.rewashThrip > 0) issues.push(`${r.rewashThrip} rewash (Thrip cloth)`);
        if (issues.length > 0) parts.push(issues.join(", "));
        if (r.rejects > 0) parts.push(`${r.rejects} reject${r.rejects > 1 ? "s" : ""}`);
      }
      lines.push(`${veg} (${r.total} bowls) ${parts.join(" ")}`.trim());
    }
    return lines.join("\n");
  };

  const downloadEOD = () => {
    const blob = new Blob([makeEODText()], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veg_eod_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyEOD = async () => {
    try {
      await navigator.clipboard.writeText(makeEODText());
      addToast("Summary copied.", "success");
    } catch {
      addToast("Could not copy. Use Download TXT.", "error");
    }
  };

  const makeCSV = () => {
    const byVeg = new Map();
    for (const b of batches) {
      const k = b.veg;
      if (!byVeg.has(k)) byVeg.set(k, { planned: 0, passed: 0, discarded: 0, firstFailWater: 0, firstFailThrip: 0, rewashes: 0, bangingRejects: 0 });
      const r = byVeg.get(k);
      r.planned += 1;
      if (b.status === "Passed") r.passed += 1;
      if (b.status === "Discarded") r.discarded += 1;
      if (b.firstFailStage && b.firstFailStage.includes("Water")) r.firstFailWater += 1;
      if (b.firstFailStage && b.firstFailStage.includes("Thrip cloth")) r.firstFailThrip += 1;
      if (b.attempt > 0) r.rewashes += 1;
      if (b.bangingRejects > 0) r.bangingRejects += b.bangingRejects;
    }
    const rows = [
      ["Veg", "Planned", "Passed", "Discarded", "Failed at Banging", "First fail: Water", "First fail: Thrip cloth", "Had rewash (>=1 fail)"],
      ...Array.from(byVeg.entries()).map(([k, r]) => [k, r.planned, r.passed, r.discarded, r.bangingRejects, r.firstFailWater, r.firstFailThrip, r.rewashes]),
      [],
      ["Details"],
      ["ID", "Veg", "Qty/Notes", "Status", "Attempt", "BangingRejects", "FirstFailStage", "EventTime", "Stage", "Result", "Attempt#"],
      ...batches.flatMap(b => b.history.length === 0
        ? [[b.id, b.veg, b.qty ?? "", b.status, b.attempt, b.bangingRejects || 0, b.firstFailStage ?? "", "", "", "", ""]]
        : b.history.map(h => [b.id, b.veg, b.qty ?? "", b.status, b.attempt, b.bangingRejects || 0, b.firstFailStage ?? "", new Date(h.ts).toLocaleString(), h.stage, h.result, h.attempt]))
    ];
    const NL = "\r\n";
    const toCSV = rs => rs.map(r => r.map(v => {
      const s = String(v ?? "");
      return /[,\"\n]/.test(s) ? ('"' + s.replace(/"/g, '""') + '"') : s;
    }).join(",")).join(NL);
    const csv = toCSV(rows) + NL;
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veg_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <AnalyticsDashboard batches={batches} />

      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">End of day summary</h2>
        <div className="flex gap-2 flex-wrap mb-3">
          <button onClick={copyEOD} className="px-4 py-2 rounded-xl bg-gray-200">
            Copy text
          </button>
          <button onClick={downloadEOD} className="px-4 py-2 rounded-xl bg-gray-200">
            Download TXT
          </button>
          <button onClick={makeCSV} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium">
            Download CSV
          </button>
        </div>
        <pre className="whitespace-pre-wrap text-sm bg-gray-50 rounded-xl p-3 max-h-64 overflow-auto border">
          {makeEODText()}
        </pre>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-1">Historical Analytics</h2>
        <p className="text-sm text-gray-500 mb-3">
          Export a JSON backup, then load it into the analytics tool to view long-term trends across multiple days.
        </p>
        <a
          href="analytics.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Analytics Tool
        </a>
      </div>
    </div>
  );
}
