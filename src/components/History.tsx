import { useState, useMemo, FormEvent } from 'react';
import { InventoryItem } from '../types';
import { Search, Filter, Calendar as CalendarIcon, Package, Tag, Hash, Edit2, Trash2, X, Save } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../lib/translations';

interface HistoryProps {
  items: InventoryItem[];
  onUpdate: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  lang: Language;
}

export function History({ items, onUpdate, onDelete, lang }: HistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const t = translations[lang];

  const categories = useMemo(() => {
    const cats = new Set(items.map(item => item.category));
    return Array.from(cats).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
      
      let matchesDate = true;
      if (startDate || endDate) {
        const itemDate = new Date(item.createdAt);
        const start = startDate ? startOfDay(new Date(startDate)) : new Date(0);
        const end = endDate ? endOfDay(new Date(endDate)) : new Date();
        matchesDate = isWithinInterval(itemDate, { start, end });
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [items, searchTerm, categoryFilter, startDate, endDate]);

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdate(editingItem);
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-900">{t.advancedSearch}</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{t.descriptionOrCode}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{t.category}</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 appearance-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">{t.allCategories}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{t.startDate}</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{t.endDate}</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <Package className="w-12 h-12 text-blue-200 mx-auto mb-4" />
            <p className="text-blue-400 font-medium">{t.noItemsFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="glass-card p-5 rounded-2xl hover:shadow-2xl transition-all duration-300 group border-l-4 border-l-blue-500 relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                      {format(item.createdAt, 'dd/MM/yyyy HH:mm')}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                        title={t.edit}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(t.confirmDelete)) {
                            onDelete(item.id);
                          }
                        }}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm"
                        title={t.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-1">{item.description}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Tag className="w-4 h-4" />
                    <span>{item.category}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-blue-400">
                    <span>{t.unit}: {item.unit}</span>
                    <span>{t.weight}: {item.weight}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-mono text-blue-500 bg-blue-50/50 p-2 rounded-md">
                    <Hash className="w-4 h-4" />
                    <span>{item.code}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-2xl p-8 rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-blue-900">{t.editItem}</h3>
                <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-blue-400" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.code}</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editingItem.code}
                      onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.description}</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.category}</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.date}</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={format(new Date(editingItem.createdAt), "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setEditingItem({ ...editingItem, createdAt: new Date(e.target.value).getTime() })}
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-blue-50 pt-4">
                  <h4 className="text-xs font-black text-blue-300 uppercase tracking-[0.2em] mb-4">{lang === 'pt' ? 'Dimensões e Identificação' : 'Dimensions & Identification'}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.unit}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.unit}
                        onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.weight}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.weight}
                        onChange={(e) => setEditingItem({ ...editingItem, weight: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.ean}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.ean}
                        onChange={(e) => setEditingItem({ ...editingItem, ean: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.dun}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.dun}
                        onChange={(e) => setEditingItem({ ...editingItem, dun: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.length}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.length}
                        onChange={(e) => setEditingItem({ ...editingItem, length: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.width}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.width}
                        onChange={(e) => setEditingItem({ ...editingItem, width: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.height}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.height}
                        onChange={(e) => setEditingItem({ ...editingItem, height: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-blue-50 pt-4">
                  <h4 className="text-xs font-black text-blue-300 uppercase tracking-[0.2em] mb-4">{lang === 'pt' ? 'Informações de Movimentação' : 'Movement Information'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.nfe}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.nfe}
                        onChange={(e) => setEditingItem({ ...editingItem, nfe: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.orderNumber}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.orderNumber}
                        onChange={(e) => setEditingItem({ ...editingItem, orderNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.quantity}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.quantity}
                        onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.totalValue}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.totalValue}
                        onChange={(e) => setEditingItem({ ...editingItem, totalValue: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.seal}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.seal}
                        onChange={(e) => setEditingItem({ ...editingItem, seal: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.requester}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.requester}
                        onChange={(e) => setEditingItem({ ...editingItem, requester: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">{t.supplier}</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        value={editingItem.supplier}
                        onChange={(e) => setEditingItem({ ...editingItem, supplier: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-3 border border-blue-100 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {t.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
