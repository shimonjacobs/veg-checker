import React, { useState } from 'react';

export default function DatabasePage({ vegDB, setVegDB, onBack }) {
  const [newName, setNewName] = useState("");
  const [needsBang, setNeedsBang] = useState(false);
  const [needsVisual, setNeedsVisual] = useState(false);
  const [needsHotWater, setNeedsHotWater] = useState(false);
  const [needsDoubleWash, setNeedsDoubleWash] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const addVeg = () => {
    const n = newName.trim();
    if (!n) return;
    if (vegDB.some(v => v.name.toLowerCase() === n.toLowerCase())) {
      setNewName("");
      return;
    }
    setVegDB([
      ...vegDB,
      {
        name: n,
        requiresBang: needsBang,
        requiresVisual: needsVisual,
        requiresHotWater: needsHotWater,
        requiresDoubleWash: needsDoubleWash
      }
    ]);
    setNewName("");
    setNeedsBang(false);
    setNeedsVisual(false);
    setNeedsHotWater(false);
    setNeedsDoubleWash(false);
  };

  const confirmRemove = () => {
    setVegDB(vegDB.filter(x => x.name !== itemToDelete));
    setItemToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="p-2 bg-white border shadow-sm rounded-full text-gray-600 active:bg-gray-100"
          aria-label="Back to settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold">Vegetable Database</h2>
      </div>
      <p className="text-sm text-gray-600">
        Add or remove vegetables from your default quick-add list, and configure their required testing stages.
      </p>

      <div className="space-y-6">
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 border-b">
              <tr>
                <th className="p-3 font-semibold">Vegetable</th>
                <th className="p-3 font-semibold">Checks</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vegDB.map(v => (
                <tr key={v.name} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{v.name}</td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {v.requiresVisual && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                          Visual
                        </span>
                      )}
                      {v.requiresBang && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                          Bang
                        </span>
                      )}
                      {!v.requiresBang && !v.requiresVisual && !v.requiresHotWater && (
                        <span className="text-[10px] text-gray-400">Standard</span>
                      )}
                      {v.requiresDoubleWash && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                          Second check
                        </span>
                      )}
                      {v.requiresHotWater && (
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
                          Hot
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setItemToDelete(v.name)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-medium text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {vegDB.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    Database is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 p-4 bg-white shadow-sm rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-700 text-sm">Add New Item</h3>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Vegetable name"
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          <div className="flex flex-col gap-2 mt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={needsBang}
                onChange={e => setNeedsBang(e.target.checked)}
                className="rounded w-4 h-4 text-blue-600"
              />
              Requires 'Banging check' stage
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={needsVisual}
                onChange={e => setNeedsVisual(e.target.checked)}
                className="rounded w-4 h-4 text-blue-600"
              />
              Requires 'Visual check' stage
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={needsHotWater}
                onChange={e => setNeedsHotWater(e.target.checked)}
                className="rounded w-4 h-4 text-blue-600"
              />
              Requires hot water
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={needsDoubleWash}
                onChange={e => setNeedsDoubleWash(e.target.checked)}
                className="rounded w-4 h-4 text-blue-600"
              />
              Requires second wash (Water 2 + Thrip 2)
            </label>
          </div>
          <button
            onClick={addVeg}
            className="py-3 mt-2 rounded-xl bg-blue-600 text-white font-medium w-full"
          >
            Add Item
          </button>
        </div>

        {itemToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-pop-in">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete {itemToDelete}?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to remove this vegetable from the database? This won't affect existing jobs.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
