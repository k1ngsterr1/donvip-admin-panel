import { UsersTable } from "@/components/users/users-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Пользователи
          </h1>
          <p className="text-muted-foreground">Управляйте пользователями</p>
        </div>
      </div>
      <UsersTable />
    </div>
  );
}
