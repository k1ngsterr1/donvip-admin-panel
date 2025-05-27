"use client";

import { UsersTable } from "@/components/users/users-table";
import { useUserCount } from "@/services";

export default function UsersPage() {
  const { data: count } = useUserCount();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl flex items-center justify-center gap-2 font-bold tracking-tight text-primary">
            Пользователи - {count}
          </h1>
          <p className="text-muted-foreground">Управляйте пользователями</p>
        </div>
      </div>
      <UsersTable />
    </div>
  );
}
