export interface Order {
  product?: any;
  id: string;
  itemId?: number;
  orderId?: string;
  price?: number | string;
  amount?: number;
  diamonds?: number;
  type?: string;
  payment?: string;
  account_id?: string;
  playerId?: string;
  server_id?: string;
  serverId?: string | null;
  time?: any;
  status?: string;
  method?: string;
  date?: string;
  customer?: string;
  response?: any;
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    username?: string;
  };
}
