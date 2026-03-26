import { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, History as HistoryIcon, LayoutDashboard, 
  Scan, Save, X, Package, Tag, Hash, ChevronRight,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Scanner } from './components/Scanner';
import { History } from './components/History';
import { Dashboard } from './components/Dashboard';
import { InventoryItem, TabType } from './types';
import { cn } from './lib/utils';
import { translations, Language } from './lib/translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lang, setLang] = useState<Language>('pt');
  const [newItem, setNewItem] = useState({
    code: '',
    name: '',
    category: ''
  });

  const t = translations[lang];

  // Load from localStorage for now
  useEffect(() => {
    const saved = localStorage.getItem('aidan_ss_inventory');
    const savedLang = localStorage.getItem('aidan_ss_lang') as Language;
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse inventory", e);
      }
    }
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('aidan_ss_inventory', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('aidan_ss_lang', lang);
  }, [lang]);

  const handleAddItem = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.code || !newItem.name || !newItem.category) return;

    const item: InventoryItem = {
      id: crypto.randomUUID(),
      ...newItem,
      createdAt: Date.now()
    };

    setItems(prev => [item, ...prev]);
    setNewItem({ code: '', name: '', category: '' });
    setIsScanning(false);
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleScan = (code: string) => {
    setNewItem(prev => ({ ...prev, code }));
    setIsScanning(false);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'pt' ? 'en' : 'pt');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
            <Package className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tighter">Aidan.SS</h1>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">{t.inventoryManagement}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-full text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
          >
            <Languages className="w-4 h-4" />
            {lang === 'pt' ? 'Português' : 'English'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="glass-card p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
                
                <h2 className="text-2xl font-bold text-blue-900 mb-8 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-blue-500" />
                  {t.newItem}
                </h2>

                <form onSubmit={handleAddItem} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.itemCode}</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input
                          type="text"
                          placeholder={t.itemCodePlaceholder}
                          className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-blue-900 font-medium"
                          value={newItem.code}
                          onChange={(e) => setNewItem(prev => ({ ...prev, code: e.target.value }))}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsScanning(!isScanning)}
                        className={cn(
                          "py-4 sm:px-6 rounded-2xl flex items-center justify-center transition-all shadow-md",
                          isScanning ? "bg-red-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                      >
                        {isScanning ? <X className="w-6 h-6" /> : <Scan className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>

                  {isScanning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Scanner onScan={handleScan} />
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.itemName}</label>
                      <div className="relative">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input
                          type="text"
                          placeholder={t.itemNamePlaceholder}
                          className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-blue-900 font-medium"
                          value={newItem.name}
                          onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.category}</label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input
                          type="text"
                          placeholder={t.categoryPlaceholder}
                          className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-blue-900 font-medium"
                          value={newItem.category}
                          onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 gradient-bg text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <Save className="w-6 h-6" />
                    {t.saveToStock}
                  </button>
                </form>
              </div>

              {/* Recent Activity Mini List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">{t.recentlyAdded}</h3>
                  <button onClick={() => setActiveTab('history')} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                    {t.viewAll} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center py-8 glass-card rounded-2xl border-dashed border-blue-200">
                      <p className="text-blue-300 text-sm font-medium">{t.noItemsAdded}</p>
                    </div>
                  ) : (
                    items.slice(0, 3).map(item => (
                      <div key={item.id} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-blue-900 truncate">{item.name}</p>
                            <p className="text-xs text-blue-400 truncate">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-mono text-blue-500">{item.code}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <History 
                items={items} 
                onUpdate={handleUpdateItem} 
                onDelete={handleDeleteItem} 
                lang={lang}
              />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Dashboard items={items} lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 glass-card rounded-full p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2 shadow-2xl border-white/40 z-50 max-w-[95vw] sm:max-w-none">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')}
          icon={Plus}
          label={t.home}
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
          icon={HistoryIcon}
          label={t.history}
        />
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
          icon={LayoutDashboard}
          label={t.dashboard}
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300",
        active 
          ? "gradient-bg text-white shadow-lg shadow-blue-200" 
          : "text-blue-400 hover:bg-blue-50 hover:text-blue-600"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "scale-110" : "")} />
      {active && <span className="font-bold text-xs sm:text-sm tracking-tight">{label}</span>}
    </button>
  );
}
