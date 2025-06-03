export interface Order {
  id: string;
  orderId?: string;
  price: number;
  amount: number;
  type: string;
  payment: string;
  account_id?: string;
  playerId?: string;
  server_id?: string;
  serverId?: string | null;
  time: any;
  status: string;
  method: string;
  date: string;
  customer: string;
  response?: any;
  user?: {
    id: string;
  };
}
