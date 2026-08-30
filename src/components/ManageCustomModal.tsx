import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Tag } from 'lucide-react';

interface ManageCustomModalProps {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  items: string[];
  onAddItem: (type: string, item: string) => void;
  onDeleteItem: (type: string, item: string) => void;
  onResetDefaults?: (type: string) => void;
}

export const ManageCustomModal: React.FC<ManageCustomModalProps> = ({
  type,
  isOpen,
  onClose,
  items = [],
  onAddItem,
  onDeleteItem,
  onResetDefaults,
}) => {
  const safeItems = Array.isArray(items) ? items : [];
  const [newItem, setNewItem] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.trim()) return;
    onAddItem(type, newItem.trim().toUpperCase());
    setNewItem('');
  };

  const title =
    type === 'pairs'
      ? 'จัดการคู่เงิน / สินทรัพย์ (Manage Pairs)'
      : type === 'emotions'
      ? 'จัดการอารมณ์ / สภาพจิตใจ (Emotions)'
      : `จัดการข้อมูล (${type})`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#06080e] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b] bg-[#030407]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-mono">{title}</h3>
              <p className="text-[11px] text-slate-400">เพิ่ม ลบ หรือรีเซ็ตค่าเริ่มต้น</p>
            </div>
          </div>
          <button
            id="btn-close-manage-custom"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0e131f] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Input Form */}
        <form onSubmit={handleAdd} className="p-4 border-b border-[#1e293b] bg-[#080b12]">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="input-new-custom-item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={type === 'pairs' ? 'เช่น XAUUSD, BTCUSDT, EURUSD' : 'ระบุชื่อรายการ'}
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#030407] border border-[#1e293b] text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-slate-400 transition-colors"
            />
            <button
              type="submit"
              id="btn-add-custom-item"
              className="px-4 py-2 bg-gradient-to-r from-slate-100 via-slate-300 to-slate-200 hover:from-white hover:to-slate-300 text-black rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)] active:scale-95 border border-white"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>เพิ่ม</span>
            </button>
          </div>
        </form>

        {/* Items List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {safeItems.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              ยังไม่มีรายการ กรุณาเพิ่มรายการด้านบน
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {safeItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#030407] border border-[#1e293b] text-xs font-mono text-white group hover:border-slate-500 transition-all"
                >
                  <span className="font-semibold">{item}</span>
                  {itemToDelete === item ? (
                    <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-red-500">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteItem(type, item);
                          setItemToDelete(null);
                        }}
                        className="text-red-400 hover:underline font-bold text-[10px]"
                      >
                        ลบ
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemToDelete(null)}
                        className="text-slate-400 hover:text-white text-[10px]"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
                      title={`ลบ ${item}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1e293b] bg-[#030407] flex items-center justify-between">
          {onResetDefaults ? (
            showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-300">คืนค่าเริ่มต้น?</span>
                <button
                  type="button"
                  onClick={() => {
                    onResetDefaults(type);
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-mono font-bold border border-slate-500"
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
                id="btn-reset-custom-defaults"
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-1.5 rounded-xl bg-[#0e131f] border border-[#1e293b] hover:border-slate-500 text-slate-400 hover:text-white text-xs font-mono flex items-center space-x-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>คืนค่าเริ่มต้น</span>
              </button>
            )
          ) : (
            <div />
          )}

          <button
            type="button"
            id="btn-close-custom-modal"
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(203,213,225,0.15)]"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
