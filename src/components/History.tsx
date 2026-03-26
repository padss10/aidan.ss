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
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.code.toLowerCase().includes(searchTerm.toLowerCase());
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
            <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{t.nameOrCode}</label>
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
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingItem(item)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest pr-16">
                    {format(item.createdAt, 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-1">{item.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Tag className="w-4 h-4" />
                    <span>{item.category}</span>
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
              className="glass-card w-full max-w-md p-8 rounded-[2rem] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-blue-900">{t.editItem}</h3>
                <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                  <X className="w-5 h-5 text-blue-400" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
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
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.name}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    required
                  />
                </div>
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
