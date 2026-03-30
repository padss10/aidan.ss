import { useMemo } from 'react';
import { InventoryItem } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, Layers, Clock, Download, FileText, Table
} from 'lucide-react';
import { format, eachDayOfInterval, subDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { translations, Language } from '../lib/translations';

interface DashboardProps {
  items: InventoryItem[];
  lang: Language;
}

const COLORS = ['#2b6cb0', '#4299e1', '#63b3ed', '#90cdf4', '#bee3f8'];

export function Dashboard({ items, lang }: DashboardProps) {
  const t = translations[lang];

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const cat = item.category || 'N/A';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  const timelineData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    const counts: Record<string, number> = {};
    items.forEach(item => {
      const day = format(item.createdAt, 'yyyy-MM-dd');
      counts[day] = (counts[day] || 0) + 1;
    });

    return last7Days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      return {
        date: format(day, 'dd/MM'),
        count: counts[dayStr] || 0
      };
    });
  }, [items]);

  const stats = [
    { label: t.totalItems, value: items.length, icon: Table, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: t.categories, value: categoryData.length, icon: Layers, iconColor: 'text-blue-500', bg: 'bg-blue-50' },
    { label: t.insertionsToday, value: items.filter(i => format(i.createdAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length, icon: TrendingUp, iconColor: 'text-blue-400', bg: 'bg-blue-50' },
    { label: t.lastActivity, value: items.length > 0 ? format(Math.max(...items.map(i => i.createdAt)), 'HH:mm') : '--:--', icon: Clock, iconColor: 'text-blue-300', bg: 'bg-blue-50' },
  ];

  const exportToCSV = () => {
    const headers = [
      'ID', t.code, t.description, t.category, t.unit, 
      t.weight, t.ean, t.dun, t.length, t.width, t.height,
      t.nfe, t.quantity, t.totalValue, t.orderNumber, 
      t.requester, t.supplier, t.seal, t.date
    ];
    const rows = items.map(item => [
      item.id,
      item.code,
      item.description,
      item.category,
      item.unit,
      item.weight,
      item.ean,
      item.dun,
      item.length,
      item.width,
      item.height,
      item.nfe,
      item.quantity,
      item.totalValue,
      item.orderNumber,
      item.requester,
      item.supplier,
      item.seal,
      format(item.createdAt, 'dd/MM/yyyy HH:mm')
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${val || ''}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `estoque_aidan_ss_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(43, 108, 176);
    doc.text(t.reportTitle, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${t.generatedAt}: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
    doc.text(`${t.totalItems}: ${items.length}`, 14, 35);

    autoTable(doc, {
      startY: 45,
      head: [[t.code, t.description, t.category, t.quantity, t.totalValue, t.date]],
      body: items.map(item => [
        item.code,
        item.description,
        item.category,
        item.quantity,
        item.totalValue,
        format(item.createdAt, 'dd/MM/yyyy')
      ]),
      headStyles: { fillColor: [43, 108, 176] },
      alternateRowStyles: { fillColor: [247, 250, 252] },
      styles: { fontSize: 8 }
    });

    doc.save(`estoque_aidan_ss_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h2 className="text-2xl font-bold text-blue-900">{t.stockDashboard}</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-100 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
          >
            <Table className="w-4 h-4" />
            {t.exportCSV}
          </button>
          <button 
            onClick={exportToPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 gradient-bg text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            <FileText className="w-4 h-4" />
            {t.exportPDF}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl flex flex-col items-center text-center">
            <div className={cn("p-3 rounded-xl mb-3", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.iconColor || stat.color)} />
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">{stat.label}</span>
            <span className="text-xl sm:text-2xl font-black text-blue-900">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            {t.categoryDistribution}
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4a5568', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4a5568', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f7fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#2b6cb0', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#2b6cb0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            {t.activityLast7Days}
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#4a5568', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4a5568', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#4299e1', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#4299e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
