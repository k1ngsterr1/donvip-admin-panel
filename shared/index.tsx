"use client";

import { CreateOrderPopup } from "@/components/products/create-order-popup";
import { usePopupStore } from "@/lib/popup-store";

export function PopupProvider() {
  const { activePopups } = usePopupStore();

  return (
    <>
      {/* Render popups based on active state */}
      {activePopups.createOrder && <CreateOrderPopup />}

      {/* Add more popups here as needed */}
      {/* {activePopups.editOrder && <EditOrderPopup />} */}
      {/* {activePopups.deleteConfirmation && <DeleteConfirmationPopup />} */}
      {/* {activePopups.productDetails && <ProductDetailsPopup />} */}
      {/* {activePopups.custom && <CustomPopup />} */}
    </>
  );
}
