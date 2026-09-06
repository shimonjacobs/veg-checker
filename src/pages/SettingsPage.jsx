import React from 'react';
import HoldResetButton from '../components/HoldResetButton';

export default function SettingsPage({
  onNavigateToDatabase,
  exportJSON,
  importJSON,
  resetDay
}) {
  return (
    <div className="space-y-4">
      {/* Vegetable Database Navigation */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Vegetable Database</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add or remove vegetables from your default quick-add list, and configure their required testing stages.
        </p>
        <button
          onClick={onNavigateToDatabase}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium"
        >
          Manage Database
        </button>
      </div>

      {/* Backup / Restore Data */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Backup / Restore Data</h2>
        <p className="text-sm text-gray-600 mb-4">
          Export your current batches and database settings, or restore from a previous JSON file. Ensure you export before clearing data.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportJSON}
            className="px-4 py-3 rounded-xl bg-gray-200 font-medium"
          >
            Export JSON
          </button>
          <label className="px-4 py-3 rounded-xl bg-gray-200 cursor-pointer flex items-center font-medium">
            Import JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={importJSON}
            />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow p-4 border border-red-100">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Wipes all active and completed batches.<br />
          <span className="text-sm text-red-600 font-bold">
            WARNING: This action cannot be undone unless you have exported a JSON backup.
          </span>
        </p>
        <HoldResetButton
          onConfirm={resetDay}
          className="px-4 py-3 rounded-xl bg-red-600 text-white font-bold w-full"
        />
      </div>
    </div>
  );
}
