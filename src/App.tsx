import { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, History as HistoryIcon, LayoutDashboard, 
  Scan, Save, X, Package, Tag, Hash, ChevronRight,
  Languages, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Scanner } from './components/Scanner';
import { History } from './components/History';
import { Dashboard } from './components/Dashboard';
import { InventoryItem, TabType } from './types';
import { cn } from './lib/utils';
import { translations, Language } from './lib/translations';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<Language>('pt');
  const [newItem, setNewItem] = useState({
    code: '',
    description: '',
    category: '',
    unit: '',
    length: '',
    width: '',
    height: '',
    weight: '',
    ean: '',
    dun: '',
    nfe: '',
    quantity: '',
    totalValue: '',
    orderNumber: '',
    requester: '',
    supplier: '',
    seal: ''
  });

  const t = translations[lang];

  // Load from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
      } else if (data) {
        // Map snake_case from DB to camelCase for the app
        const mappedItems: InventoryItem[] = data.map(item => ({
          id: item.id,
          code: item.code,
          description: item.description || item.name || '',
          category: item.category,
          unit: item.unit || '',
          length: item.length || '',
          width: item.width || '',
          height: item.height || '',
          weight: item.weight || '',
          ean: item.ean || '',
          dun: item.dun || '',
          nfe: item.nfe || '',
          quantity: item.quantity || '',
          totalValue: item.total_value || '',
          orderNumber: item.order_number || '',
          requester: item.requester || '',
          supplier: item.supplier || '',
          seal: item.seal || '',
          createdAt: item.created_at
        }));
        setItems(mappedItems);
      }
      setIsLoading(false);
    };

    fetchData();

    const savedLang = localStorage.getItem('aidan_ss_lang') as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aidan_ss_lang', lang);
  }, [lang]);

  const handleAddItem = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.code || !newItem.description || !newItem.category) return;

    if (!isSupabaseConfigured || !supabase) {
      alert(lang === 'pt' ? 'Supabase não configurado. Verifique as chaves no painel Secrets.' : 'Supabase not configured. Check keys in the Secrets panel.');
      return;
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([
        { 
          code: newItem.code, 
          description: newItem.description, 
          category: newItem.category,
          unit: newItem.unit,
          length: newItem.length,
          width: newItem.width,
          height: newItem.height,
          weight: newItem.weight,
          ean: newItem.ean,
          dun: newItem.dun,
          nfe: newItem.nfe,
          quantity: newItem.quantity,
          total_value: newItem.totalValue,
          order_number: newItem.orderNumber,
          requester: newItem.requester,
          supplier: newItem.supplier,
          seal: newItem.seal,
          created_at: Date.now()
        }
      ])
      .select();

    if (error) {
      console.error('Error adding item:', error);
      alert('Error adding item to Supabase');
    } else if (data) {
      const item: InventoryItem = {
        id: data[0].id,
        code: data[0].code,
        description: data[0].description,
        category: data[0].category,
        unit: data[0].unit,
        length: data[0].length,
        width: data[0].width,
        height: data[0].height,
        weight: data[0].weight,
        ean: data[0].ean,
        dun: data[0].dun,
        nfe: data[0].nfe,
        quantity: data[0].quantity,
        totalValue: data[0].total_value,
        orderNumber: data[0].order_number,
        requester: data[0].requester,
        supplier: data[0].supplier,
        seal: data[0].seal,
        createdAt: data[0].created_at
      };
      setItems(prev => [item, ...prev]);
      setNewItem({ 
        code: '', 
        description: '', 
        category: '',
        unit: '',
        length: '',
        width: '',
        height: '',
        weight: '',
        ean: '',
        dun: '',
        nfe: '',
        quantity: '',
        totalValue: '',
        orderNumber: '',
        requester: '',
        supplier: '',
        seal: ''
      });
      setIsScanning(false);
    }
  };

  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase
      .from('inventory_items')
      .update({
        code: updatedItem.code,
        description: updatedItem.description,
        category: updatedItem.category,
        unit: updatedItem.unit,
        length: updatedItem.length,
        width: updatedItem.width,
        height: updatedItem.height,
        weight: updatedItem.weight,
        ean: updatedItem.ean,
        dun: updatedItem.dun,
        nfe: updatedItem.nfe,
        quantity: updatedItem.quantity,
        total_value: updatedItem.totalValue,
        order_number: updatedItem.orderNumber,
        requester: updatedItem.requester,
        supplier: updatedItem.supplier,
        seal: updatedItem.seal,
        created_at: updatedItem.createdAt
      })
      .eq('id', updatedItem.id);

    if (error) {
      console.error('Error updating item:', error);
      alert('Error updating item in Supabase');
    } else {
      setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      if (!isSupabaseConfigured || !supabase) return;

      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item from Supabase');
      } else {
        setItems(prev => prev.filter(item => item.id !== id));
      }
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
      <main className="min-h-[400px]">
        {!isSupabaseConfigured && (
          <div className="max-w-2xl mx-auto mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest mb-1">
                {lang === 'pt' ? 'Configuração Pendente' : 'Configuration Pending'}
              </h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                {lang === 'pt' 
                  ? 'Para salvar os dados no banco de dados, você precisa configurar as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel de Secrets.' 
                  : 'To save data to the database, you need to configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.'}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">
              {lang === 'pt' ? 'Carregando dados...' : 'Loading data...'}
            </p>
          </div>
        ) : (
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
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.description}</label>
                        <div className="relative">
                          <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                          <input
                            type="text"
                            placeholder={t.descriptionPlaceholder}
                            className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-blue-900 font-medium"
                            value={newItem.description}
                            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
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

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.unit}</label>
                        <input
                          type="text"
                          placeholder={t.unitPlaceholder}
                          className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-medium"
                          value={newItem.unit}
                          onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.weight}</label>
                        <input
                          type="text"
                          placeholder="0.00kg"
                          className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-medium"
                          value={newItem.weight}
                          onChange={(e) => setNewItem(prev => ({ ...prev, weight: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.ean}</label>
                        <input
                          type="text"
                          placeholder="EAN-13"
                          className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-medium"
                          value={newItem.ean}
                          onChange={(e) => setNewItem(prev => ({ ...prev, ean: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.dun}</label>
                        <input
                          type="text"
                          placeholder="DUN-14"
                          className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-medium"
                          value={newItem.dun}
                          onChange={(e) => setNewItem(prev => ({ ...prev, dun: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.length}</label>
                        <input
                          type="text"
                          placeholder="0cm"
                          className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-medium"
                          value={newItem.length}
                          onChange={(e) => setNewItem(prev => ({ ...prev, length: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.width}</label>
                        <input
                          type="text"
                          placeholder="0cm"
                          className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-medium"
                          value={newItem.width}
                          onChange={(e) => setNewItem(prev => ({ ...prev, width: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">{t.height}</label>
                        <input
                          type="text"
                          placeholder="0cm"
                          className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-blue-900 font-medium"
                          value={newItem.height}
                          onChange={(e) => setNewItem(prev => ({ ...prev, height: e.target.value }))}
                        />
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
                            <p className="font-bold text-blue-900 truncate">{item.description}</p>
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
        )}
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
