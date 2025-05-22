"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ThumbsUp, ThumbsDown, Trash } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data - in a real app, this would come from your API
const feedbacks = [
  {
    id: 1,
    user: "John Doe",
    userInitials: "JD",
    product: "Mobile Legends",
    reaction: true,
    text: "Great service, received my diamonds instantly!",
    date: "2023-06-15",
  },
  {
    id: 2,
    user: "Alice Smith",
    userInitials: "AS",
    product: "Bigo LIVE",
    reaction: true,
    text: "Very fast delivery, will use again.",
    date: "2023-06-14",
  },
  {
    id: 3,
    user: "Bob Johnson",
    userInitials: "BJ",
    product: "PUBG Mobile",
    reaction: false,
    text: "Had some issues with the delivery, took longer than expected.",
    date: "2023-06-13",
  },
  {
    id: 4,
    user: "Emma Wilson",
    userInitials: "EW",
    product: "Free Fire",
    reaction: true,
    text: "Excellent service and good prices!",
    date: "2023-06-12",
  },
  {
    id: 5,
    user: "Michael Brown",
    userInitials: "MB",
    product: "Clash of Clans",
    reaction: true,
    text: "Very satisfied with my purchase.",
    date: "2023-06-11",
  },
];

export function FeedbackTable() {
  const [data, setData] = useState(feedbacks);

  const handleDelete = (id: number) => {
    setData(data.filter((feedback) => feedback.id !== id));
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Reaction</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((feedback) => (
            <TableRow key={feedback.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{feedback.userInitials}</AvatarFallback>
                  </Avatar>
                  <span>{feedback.user}</span>
                </div>
              </TableCell>
              <TableCell>{feedback.product}</TableCell>
              <TableCell>
                {feedback.reaction ? (
                  <ThumbsUp className="h-5 w-5 text-green-500" />
                ) : (
                  <ThumbsDown className="h-5 w-5 text-red-500" />
                )}
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="truncate">{feedback.text}</p>
              </TableCell>
              <TableCell>{feedback.date}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(feedback.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
