export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  createdAt: number; // timestamp
}

export type TabType = 'home' | 'history' | 'dashboard';
