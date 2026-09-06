import React from 'react';

export default function ImportConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-pop-in">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Import JSON?</h3>
        <p className="text-sm text-gray-600 mb-6">
          This will <span className="font-bold text-red-600">replace all current data</span> with the imported file. Make sure you have exported a backup first if you want to keep your current data.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium"
          >
            Import &amp; Replace
          </button>
        </div>
      </div>
    </div>
  );
}
