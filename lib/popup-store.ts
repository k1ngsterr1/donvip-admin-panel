import type React from "react";
import { create } from "zustand";

export type PopupType =
  | "createOrder"
  | "editOrder"
  | "deleteConfirmation"
  | "productDetails"
  | "custom";

export interface PopupData {
  createOrder?: {
    productId?: number;
    preselectedItemId?: number;
  };
  editOrder?: {
    orderId: number;
    data: any;
  };
  deleteConfirmation?: {
    id: number;
    type: "product" | "order" | "user" | "coupon";
    title: string;
    message: string;
    onConfirm: () => void;
  };
  productDetails?: {
    productId: number;
  };
  custom?: {
    title: string;
    content: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  };
}

interface PopupState {
  activePopups: {
    [key in PopupType]?: boolean;
  };
  popupData: PopupData;
  // Actions
  openPopup: (type: PopupType, data?: any) => void;
  closePopup: (type: PopupType) => void;
  closeAllPopups: () => void;
  updatePopupData: (type: PopupType, data: any) => void;
}

export const usePopupStore = create<PopupState>((set) => ({
  activePopups: {},
  popupData: {},

  openPopup: (type, data) =>
    set((state) => ({
      activePopups: {
        ...state.activePopups,
        [type]: true,
      },
      popupData: {
        ...state.popupData,
        [type]: data,
      },
    })),

  closePopup: (type) =>
    set((state) => ({
      activePopups: {
        ...state.activePopups,
        [type]: false,
      },
    })),

  closeAllPopups: () =>
    set({
      activePopups: {},
    }),

  updatePopupData: (type, data) =>
    set((state) => ({
      popupData: {
        ...state.popupData,
        [type]: {
          ...state.popupData[type],
          ...data,
        },
      },
    })),
}));
