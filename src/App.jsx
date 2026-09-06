import React, { useState, useEffect } from 'react';
import {
  APP_VERSION,
  STORAGE_KEY,
  VEG_DB_KEY,
  META_KEY,
  DEFAULT_VEG_DB
} from './constants';
import { uid, getRequiredStages, nextStage } from './utils/batchUtils';
import ImportConfirmModal from './components/ImportConfirmModal';
import JobsPage from './pages/JobsPage';
import PlanPage from './pages/PlanPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import DatabasePage from './pages/DatabasePage';

const TABS = [
  { id: "Jobs", label: "Jobs" },
  { id: "Plan", label: "Plan" },
  { id: "Reports", label: "Reports" },
  {
    id: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
];

export default function App() {
  const [batches, setBatches] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [vegDB, setVegDB] = useState(() => {
    try {
      const raw = localStorage.getItem(VEG_DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_VEG_DB;
  });

  const [tab, setTab] = useState("Jobs");
  const [toasts, setToasts] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [pendingImport, setPendingImport] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem(VEG_DB_KEY, JSON.stringify(vegDB));
  }, [vegDB]);

  useEffect(() => {
    try {
      localStorage.setItem(META_KEY, JSON.stringify({ version: APP_VERSION, savedAt: new Date().toISOString() }));
    } catch (e) {}
  }, []);

  const planned = batches.filter(b => b.status === "Planned");
  const active = batches.filter(b => b.status === "In Progress");
  const completed = batches.filter(b => b.status === "Passed");
  const discarded = batches.filter(b => b.status === "Discarded");

  const addToast = (msg, type = "success") => {
    const id = uid();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 1700);
  };

  const quickAdd = (vegObj, count) => {
    let n = parseInt(count, 10);
    if (!Number.isFinite(n) || n < 1) n = 1;
    if (n > 500) n = 500;

    let reqStages = [];
    if (vegObj.requiresDoubleWash || /broccoli|tenderstem/i.test(vegObj.name)) {
      if (vegObj.requiresVisual) reqStages.push("Visual check");
      if (vegObj.requiresBang) reqStages.push("Banging check");
      reqStages.push("Water 1", "Thrip cloth 1", "Water 2", "Thrip cloth 2");
    } else {
      if (vegObj.requiresVisual) reqStages.push("Visual check");
      if (vegObj.requiresBang) reqStages.push("Banging check");
      reqStages.push("Water", "Thrip cloth");
    }

    const newOnes = Array.from({ length: n }, (_, i) => ({
      id: uid(),
      veg: vegObj.name,
      qty: n > 1 ? `#${i + 1} of ${n}` : undefined,
      status: "Planned",
      attempt: 0,
      history: [],
      requiredStages: reqStages,
      bangingRejects: 0,
      hotWater: !!vegObj.requiresHotWater
    }));
    setBatches(prev => [...newOnes, ...prev]);
    addToast(`Added ${n} ${vegObj.name}`);
  };

  const startFromPlan = (id) => {
    const ts = Date.now();
    setBatches(prev => prev.map(b => b.id === id ? { ...b, status: "In Progress", timerStart: ts } : b));
    setTab("Jobs");
    setExpanded(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const deleteBatch = (id) => {
    setBatches(prev => prev.filter(b => b.id !== id));
    setExpanded(prev => prev.filter(x => x !== id));
  };

  const toggleExpand = (id) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const recordResult = (id, result) => {
    const batch = batches.find(b => b.id === id);
    if (!batch) return;
    const stage = nextStage(batch);

    if (result === "RejectItem") {
      setBatches(prev => prev.map(b => b.id === id ? { ...b, bangingRejects: (b.bangingRejects || 0) + 1 } : b));
      return;
    }

    let finalResult = result;
    if (result === "FinishBanging") {
      finalResult = "Pass";
      addToast(`${batch.veg}: Finished Banging`, "success");
    } else if (result === "CompleteVisual") {
      finalResult = "Pass";
      addToast(`${batch.veg}: Visual Check Completed`, "success");
    } else if (result === "Pass") {
      addToast(`${batch.veg}: Passed ${stage}`, "success");
    } else {
      addToast(`${batch.veg}: Failed ${stage}`, "error");
    }

    setExpanded(prev => prev.filter(x => x !== id));
    setBatches(prev => prev.map(b => {
      if (b.id !== id || b.status !== "In Progress") return b;

      const ev = { ts: Date.now(), stage, result: finalResult, attempt: b.attempt };
      const history = [...b.history, ev];

      if (finalResult === "Fail") {
        if (b.attempt === 0) return { ...b, firstFailStage: b.firstFailStage || stage, status: "Planned", attempt: 1, history };
        return { ...b, firstFailStage: b.firstFailStage || stage, status: "Discarded", history };
      } else {
        const cur = history.filter(h => h.attempt === b.attempt);
        const reqs = getRequiredStages(b);
        const allPassed = reqs.every(reqStage => cur.some(h => h.stage === reqStage && h.result === "Pass"));

        if (allPassed) return { ...b, status: "Passed", history };
        if (result === "FinishBanging" || result === "CompleteVisual") return { ...b, status: "Planned", history };

        const ns = nextStage({ ...b, history });
        if (ns.includes("Water")) return { ...b, status: "In Progress", timerStart: Date.now(), history };

        return { ...b, status: "In Progress", history };
      }
    }));
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(batches, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veg_batches_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data)) throw new Error("Not an array");
        setPendingImport(data);
      } catch {
        addToast("Could not read JSON file", "error");
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (pendingImport) {
      setBatches(pendingImport);
      addToast("Data imported successfully");
    }
    setPendingImport(null);
  };

  const resetDay = () => {
    setBatches([]);
    setExpanded([]);
    addToast("All data cleared", "success");
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {pendingImport && (
        <ImportConfirmModal
          onConfirm={confirmImport}
          onCancel={() => setPendingImport(null)}
        />
      )}

      {/* Floating Notifications */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col w-1/2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="toast-wrapper">
            <div
              className={`px-4 py-3 rounded-2xl shadow-lg text-white text-center font-medium animate-bounce-in ${
                t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            >
              {t.msg}
            </div>
          </div>
        ))}
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm sm:text-lg font-bold">Veg Batch Checker</h1>
          <div className="flex items-center gap-3">
            <nav className="flex gap-0.5 sm:gap-1 text-sm items-center">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={
                    "px-2 sm:px-3 py-1.5 rounded-xl flex items-center justify-center " +
                    (tab === t.id ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-800")
                  }
                  aria-label={t.id}
                >
                  {t.icon ? t.icon : t.label}
                </button>
              ))}
            </nav>
            <span className="hidden sm:inline text-xs text-gray-500">v{APP_VERSION}</span>
          </div>
        </div>
      </header>

      {/* Page Routing */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-4">
        {tab === "Jobs" && (
          <JobsPage
            active={active}
            discarded={discarded}
            planned={planned}
            expanded={expanded}
            toggleExpand={toggleExpand}
            deleteBatch={deleteBatch}
            startFromPlan={startFromPlan}
            recordResult={recordResult}
            now={now}
          />
        )}

        {tab === "Plan" && (
          <PlanPage
            vegDB={vegDB}
            quickAdd={quickAdd}
            completed={completed}
            planned={planned}
            discarded={discarded}
            startFromPlan={startFromPlan}
            deleteBatch={deleteBatch}
          />
        )}

        {tab === "Reports" && (
          <ReportsPage
            batches={batches}
            addToast={addToast}
          />
        )}

        {tab === "Settings" && (
          <SettingsPage
            onNavigateToDatabase={() => setTab("Database")}
            exportJSON={exportJSON}
            importJSON={importJSON}
            resetDay={resetDay}
          />
        )}

        {tab === "Database" && (
          <DatabasePage
            vegDB={vegDB}
            setVegDB={setVegDB}
            onBack={() => setTab("Settings")}
          />
        )}
      </main>

      <div className="h-4"></div>
    </div>
  );
}