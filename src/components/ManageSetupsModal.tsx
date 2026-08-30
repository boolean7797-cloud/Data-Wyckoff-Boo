import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Edit2, Check, RotateCcw } from 'lucide-react';
import { SetupItem } from '../types';

interface ManageSetupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  setups: SetupItem[];
  onAddSetup: (newSetup: SetupItem) => void;
  onUpdateSetup: (updatedSetup: SetupItem) => void;
  onDeleteSetup: (setupId: string) => void;
  onResetDefaults?: () => void;
}

export const ManageSetupsModal: React.FC<ManageSetupsModalProps> = ({
  isOpen,
  onClose,
  setups = [],
  onAddSetup,
  onUpdateSetup,
  onDeleteSetup,
  onResetDefaults,
}) => {
  const safeSetups = Array.isArray(setups) ? setups : [];
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [setupToDelete, setSetupToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (safeSetups.some((s) => s.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert(`มีท่าเทรด "${trimmedName}" อยู่แล้ว`);
      return;
    }

    const newSetup: SetupItem = {
      id: `setup_${Date.now()}`,
      name: trimmedName,
      enabled: true,
    };

    onAddSetup(newSetup);
    setName('');
  };

  const handleSaveEdit = (setup: SetupItem) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    onUpdateSetup({
      ...setup,
      name: trimmed,
    });
    setEditingId(null);
    setEditName('');
  };

  const startEdit = (setup: SetupItem) => {
    setEditingId(setup.id);
    setEditName(setup.name);
    setSetupToDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-[#06080e] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 animate-fade-in my-6 max-h-[90vh] flex flex-col font-['Outfit',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0e131f] border border-slate-700 flex items-center justify-center">
              <Tag className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#f8fafc]">
                จัดการท่าเทรด (Setups)
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                เพิ่ม ลบ หรือแก้ไขตัวเลือกท่าเทรดสำหรับใช้บันทึกไม้
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0e131f] hover:bg-[#1e293b] text-slate-400 hover:text-white border border-[#1e293b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add New Setup Inline Form */}
        <form onSubmit={handleAddNew} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="พิมพ์ชื่อท่าเทรดใหม่ เช่น Breakout, Order Block, Wyckoff..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-[#030407] border border-[#1e293b] focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-mono text-[#f8fafc] focus:outline-none placeholder-slate-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,255,255,0.2)] shrink-0 transition-all border border-white"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>เพิ่ม</span>
          </button>
        </form>

        {/* Setups List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1 flex-1">
          {safeSetups.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-mono">
              ไม่มีท่าเทรดในรายการ กรุณาพิมพ์ชื่อด้านบนเพื่อเพิ่มท่าเทรด
            </div>
          ) : (
            safeSetups.map((setup) => {
              const isEnabled = setup.enabled !== false;
              const isEditing = editingId === setup.id;
              const isConfirmingDelete = setupToDelete === setup.id;

              return (
                <div
                  key={setup.id}
                  className={`p-3 rounded-xl bg-[#030407] border transition-all flex items-center justify-between gap-2 ${
                    isEnabled
                      ? 'border-[#1e293b] hover:border-slate-500'
                      : 'border-[#1e293b]/40 opacity-60 bg-[#030407]/60'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-[#0e131f] border border-slate-400 rounded-lg px-2.5 py-1 text-xs font-mono text-[#f8fafc] focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(setup)}
                        className="p-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 border border-slate-500"
                        title="บันทึก"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditName('');
                        }}
                        className="p-1.5 bg-[#0e131f] text-slate-400 hover:text-white rounded-lg border border-[#1e293b]"
                        title="ยกเลิก"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Checkbox toggle enabled/disabled */}
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateSetup({
                              ...setup,
                              enabled: !isEnabled,
                            })
                          }
                          className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                            isEnabled
                              ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]'
                              : 'bg-[#0e131f] border-[#1e293b] text-transparent hover:border-slate-500'
                          }`}
                          title={isEnabled ? 'คลิกเพื่อปิดใช้งานท่านี้' : 'คลิกเพื่อเปิดใช้งานท่านี้'}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <span
                          className={`text-xs font-mono font-bold truncate ${
                            isEnabled ? 'text-[#f8fafc]' : 'text-slate-500 line-through'
                          }`}
                        >
                          {setup.name}
                        </span>

                        {!isEnabled && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0e131f] text-slate-500 border border-[#1e293b] shrink-0">
                            ปิดใช้งาน
                          </span>
                        )}
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-red-500 animate-fade-in">
                            <span className="text-[10px] font-mono text-red-400 font-bold">
                              ลบท่านี้?
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteSetup(setup.id);
                                setSetupToDelete(null);
                              }}
                              className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-mono font-bold rounded hover:bg-red-500"
                            >
                              ลบ
                            </button>
                            <button
                              type="button"
                              onClick={() => setSetupToDelete(null)}
                              className="px-1.5 py-0.5 bg-[#0e131f] text-slate-400 hover:text-white text-[10px] font-mono rounded"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(setup)}
                              className="p-1.5 text-slate-400 hover:text-[#38bdf8] hover:bg-[#0e131f] rounded-lg transition-colors"
                              title="แก้ไขชื่อท่าเทรด"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSetupToDelete(setup.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                              title="ลบท่าเทรดนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]">
          {onResetDefaults ? (
            showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-300">คืนค่าเริ่มต้น?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetDefaults();
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 text-white text-xs font-mono font-bold border border-slate-500"
                >
                  ใช่ คืนค่า
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 rounded-lg bg-[#0e131f] text-slate-400 hover:text-white text-xs font-mono border border-[#1e293b]"
                >
                  ยกเลิก
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-[11px] font-mono text-slate-400 hover:text-white hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>คืนค่าเริ่มต้นท่าเทรด</span>
              </button>
            )
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0e131f] hover:bg-[#1e293b] text-xs font-mono text-[#f8fafc] rounded-xl border border-[#1e293b]"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
