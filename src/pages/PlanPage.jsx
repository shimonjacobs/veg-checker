import React, { useState } from 'react';

export default function PlanPage({
  vegDB,
  quickAdd,
  completed,
  planned,
  discarded,
  startFromPlan,
  deleteBatch
}) {
  const [selectedQty, setSelectedQty] = useState(1);
  const [customOpen, setCustomOpen] = useState(false);
  const [veg, setVeg] = useState("");
  const [qty, setQty] = useState("1");
  const [customRequiresBang, setCustomRequiresBang] = useState(false);
  const [customRequiresVisual, setCustomRequiresVisual] = useState(false);
  const [customRequiresHotWater, setCustomRequiresHotWater] = useState(false);
  const [customRequiresDoubleWash, setCustomRequiresDoubleWash] = useState(false);

  const handleAddBatch = () => {
    const name = veg.trim();
    if (!name) return;
    quickAdd(
      {
        name,
        requiresBang: customRequiresBang,
        requiresVisual: customRequiresVisual,
        requiresHotWater: customRequiresHotWater,
        requiresDoubleWash: customRequiresDoubleWash
      },
      qty
    );
    setVeg("");
    setQty("1");
    setCustomRequiresBang(false);
    setCustomRequiresVisual(false);
    setCustomRequiresHotWater(false);
    setCustomRequiresDoubleWash(false);
  };

  const handleQuickAdd = (vegObj) => {
    quickAdd(vegObj, selectedQty);
    setSelectedQty(1);
  };

  return (
    <div className="space-y-4">
      {/* Produce Presets Quick-Add */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Produce Presets</h2>
          <div className="flex items-center gap-2 text-sm">
            <span>Qty:</span>
            {[1, 2, 4, 6, 8].map(n => (
              <button
                key={n}
                onClick={() => setSelectedQty(n)}
                className={
                  "px-2 py-1 rounded-lg border " +
                  (selectedQty === n
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-800")
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {vegDB.map(vegObj => (
            <button
              key={vegObj.name}
              onClick={() => handleQuickAdd(vegObj)}
              className="px-2 py-2 rounded-xl bg-blue-600 text-white text-sm"
            >
              {vegObj.name}
            </button>
          ))}
        </div>
      </div>

      {/* One-off Custom Veg */}
      <div className="bg-white rounded-2xl shadow p-4">
        <button
          onClick={() => setCustomOpen(o => !o)}
          className="flex items-center justify-between w-full"
        >
          <h2 className="text-lg font-semibold">One-off Custom Veg</h2>
          <span className="text-gray-400 text-sm">{customOpen ? "▲" : "▼"}</span>
        </button>
        {customOpen && (
          <div className="mt-3 space-y-3">
            <input
              value={veg}
              onChange={e => setVeg(e.target.value)}
              placeholder="Veg name (e.g., Rare Mushroom)"
              className="w-full border rounded-xl p-3"
            />
            <input
              type="number"
              min="1"
              max="500"
              inputMode="numeric"
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="Quantity (jobs to create)"
              className="w-full border rounded-xl p-3"
            />
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={customRequiresBang}
                  onChange={e => setCustomRequiresBang(e.target.checked)}
                  className="rounded w-4 h-4"
                />
                Requires 'Banging check' stage
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={customRequiresVisual}
                  onChange={e => setCustomRequiresVisual(e.target.checked)}
                  className="rounded w-4 h-4"
                />
                Requires 'Visual check' stage
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={customRequiresHotWater}
                  onChange={e => setCustomRequiresHotWater(e.target.checked)}
                  className="rounded w-4 h-4"
                />
                Requires hot water
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={customRequiresDoubleWash}
                  onChange={e => setCustomRequiresDoubleWash(e.target.checked)}
                  className="rounded w-4 h-4"
                />
                Requires second wash (Water 2 + Thrip 2)
              </label>
            </div>
            <button
              onClick={handleAddBatch}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium"
            >
              Add temporary job
            </button>
          </div>
        )}
      </div>

      {/* Complete */}
      <div className="bg-white rounded-2xl shadow">
        <div className="px-4 py-3 text-lg font-semibold border-b flex items-center gap-2">
          Complete
          {completed.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
              {completed.length}
            </span>
          )}
        </div>
        <div className="p-4">
          {completed.length === 0 ? (
            <p className="text-sm text-gray-500">No completed jobs.</p>
          ) : (
            <ul className="space-y-2">
              {completed.map(b => (
                <li
                  key={b.id}
                  className="relative flex items-center justify-between bg-gray-50 p-3 rounded-xl overflow-hidden"
                >
                  <span
                    className="absolute top-0 left-0 w-0 h-0 border-t-[28px] border-t-green-600 border-r-[28px] border-r-transparent"
                    title="Completed"
                  ></span>
                  <div>
                    <div className="font-medium">{b.veg}</div>
                    <div className="text-xs text-gray-500">{b.qty || ""}</div>
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">Passed</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Incomplete */}
      <div className="bg-white rounded-2xl shadow">
        <div className="px-4 py-3 text-lg font-semibold border-b flex items-center gap-2">
          Incomplete
          {planned.length + discarded.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
              {planned.length + discarded.length}
            </span>
          )}
        </div>
        <div className="p-4">
          {planned.length === 0 && discarded.length === 0 ? (
            <p className="text-sm text-gray-500">No incomplete jobs.</p>
          ) : (
            <div className="space-y-3">
              {planned.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Planned</p>
                  <ul className="space-y-2">
                    {planned.map(b => (
                      <li
                        key={b.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-xl"
                      >
                        <div>
                          <div className="font-medium">{b.veg}</div>
                          <div className="text-xs text-gray-500">{b.qty || ""}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startFromPlan(b.id)}
                            className="px-3 py-2 rounded-xl bg-blue-600 text-white"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => deleteBatch(b.id)}
                            className="px-3 py-2 rounded-xl bg-gray-200"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {discarded.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Discarded</p>
                  <ul className="space-y-2">
                    {discarded.map(b => (
                      <li
                        key={b.id}
                        className="relative flex items-center justify-between bg-gray-50 p-3 rounded-xl overflow-hidden"
                      >
                        <span
                          className="absolute top-0 left-0 w-0 h-0 border-t-[28px] border-t-red-600 border-r-[28px] border-r-transparent"
                        ></span>
                        <div>
                          <div className="font-medium">{b.veg}</div>
                          <div className="text-xs text-gray-500">{b.qty || ""}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-red-700">Discarded</span>
                          <button
                            onClick={() => deleteBatch(b.id)}
                            className="px-3 py-2 rounded-xl bg-gray-200"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
