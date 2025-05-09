"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CouponForm } from "@/components/coupons/coupon-form"

interface Coupon {
  id: number
  code: string
  discount: number
  limit: number | null
  used: number
  active: boolean
  created: string
}

export function CouponsTable() {
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const response = await api.coupons.getAll()
      return response.data
    },
  })

  const deleteCouponMutation = useMutation({
    mutationFn: (id: number) => api.coupons.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
      toast({
        title: "Промокод удален",
        description: "Промокод был успешно удален.",
      })
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить промокод. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      })
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => {
      return api.coupons.update(id, { active: !active })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
      toast({
        title: "Статус промокода изменен",
        description: "Статус промокода был успешно изменен.",
      })
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус промокода. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      })
    },
  })

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот промокод?")) {
      deleteCouponMutation.mutate(id)
    }
  }

  const handleToggleActive = (id: number, active: boolean) => {
    toggleActiveMutation.mutate({ id, active })
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
  }

  const handleEditSuccess = () => {
    setEditingCoupon(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">Ошибка загрузки промокодов. Пожалуйста, попробуйте снова.</div>
  }

  // For demo purposes, using mock data if API call isn't implemented yet
  const coupons: Coupon[] = data || [
    {
      id: 1,
      code: "SUMMER20",
      discount: 20,
      limit: 100,
      used: 45,
      active: true,
      created: "2023-06-01",
    },
    {
      id: 2,
      code: "WELCOME10",
      discount: 10,
      limit: 200,
      used: 120,
      active: true,
      created: "2023-05-15",
    },
    {
      id: 3,
      code: "FLASH30",
      discount: 30,
      limit: 50,
      used: 50,
      active: false,
      created: "2023-04-20",
    },
    {
      id: 4,
      code: "NEWUSER15",
      discount: 15,
      limit: null,
      used: 78,
      active: true,
      created: "2023-03-10",
    },
    {
      id: 5,
      code: "HOLIDAY25",
      discount: 25,
      limit: 150,
      used: 0,
      active: true,
      created: "2023-06-10",
    },
  ]

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Код</TableHead>
              <TableHead>Скидка</TableHead>
              <TableHead>Использование</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-medium">
                  <div className="font-mono uppercase">{coupon.code}</div>
                </TableCell>
                <TableCell>{coupon.discount}%</TableCell>
                <TableCell>
                  <div>
                    <p>{coupon.used} использовано</p>
                    {coupon.limit ? (
                      <p className="text-sm text-muted-foreground">
                        Лимит: {coupon.limit} ({Math.round((coupon.used / coupon.limit) * 100)}%)
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Без лимита</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={coupon.active ? "default" : "secondary"}>
                    {coupon.active ? "Активен" : "Неактивен"}
                  </Badge>
                </TableCell>
                <TableCell>{coupon.created}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(coupon.id, coupon.active)}>
                        {coupon.active ? (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Деактивировать
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Активировать
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(coupon.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingCoupon} onOpenChange={(open) => !open && setEditingCoupon(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать промокод</DialogTitle>
            <DialogDescription>Измените детали промокода. Нажмите сохранить, когда закончите.</DialogDescription>
          </DialogHeader>
          {editingCoupon && (
            <CouponForm
              couponId={editingCoupon.id}
              defaultValues={{
                code: editingCoupon.code,
                discount: editingCoupon.discount,
                limit: editingCoupon.limit || undefined,
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
