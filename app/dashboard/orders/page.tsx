import { OrdersTable } from "@/components/orders/orders-table";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Заказы
          </h1>
          <p className="text-muted-foreground">Управляйте заказами</p>
        </div>
      </div>
      <OrdersTable />
    </div>
  );
}
