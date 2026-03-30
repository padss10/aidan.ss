export interface InventoryItem {
  id: string;
  code: string;
  description: string;
  category: string;
  unit: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  ean: string;
  dun: string;
  nfe: string;
  quantity: string;
  totalValue: string;
  orderNumber: string;
  requester: string;
  supplier: string;
  seal: string;
  createdAt: number; // timestamp
}

export type TabType = 'home' | 'history' | 'dashboard';
