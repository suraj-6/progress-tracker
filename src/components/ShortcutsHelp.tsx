import React, { useState } from 'react';
import { Keyboard, X, HelpCircle } from 'lucide-react';
import { getShortcutsList } from '../hooks/useKeyboardShortcuts';

export const ShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const shortcuts = getShortcutsList();

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-3 bg-slate-800 hover:bg-slate-700 rounded-full shadow-lg transition-all z-40 group"
        title="Keyboard Shortcuts (Press ?)"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-xs text-slate-300 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Keyboard Shortcuts (?)
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-900 rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Keyboard className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close shortcuts help"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <span className="text-slate-300">{shortcut.description}</span>
                  <kbd className="px-3 py-1 bg-slate-700 text-slate-200 rounded-md font-mono text-sm border border-slate-600 shadow-sm">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800/30">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <HelpCircle className="w-4 h-4" />
                <span>Press <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">?</kbd> to toggle this help</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};