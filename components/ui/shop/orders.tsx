"use client";

import { ICheckoutDetails } from "@/models/checkout_details";
import { IShopItemVariant } from "@/models/shop_item_variant";
import { createClient } from "@/utils/supabase/client";
import { Trash } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { approveOrder, deleteOrder } from "@/app/actions";
import { toast } from "sonner";

export default function Orders({
  checkoutDetails,
}: {
  checkoutDetails: ICheckoutDetails[];
}) {
  const supabase = createClient();
  const [activeCheckout, setActiveCheckout] = useState<ICheckoutDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const [itemVariants, setItemVariants] = useState<Record<string, any>[]>([]);

  const openModal = (detail: ICheckoutDetails) => {
    setActiveCheckout(detail);

    if (modalRef.current) {
      modalRef.current.showModal();
    } else {
      console.error("Modal not found");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!activeCheckout?.items) return;

      try {
        const itemsWithData = await Promise.all(
          activeCheckout.items.map(async (item) => {
            const { data, error } = await supabase
              .from("shop_item_variant")
              .select("*")
              .eq("id", item.id);

            if (error) throw error;

            return { ...item, variant: data[0] };
          })
        );
        console.log(itemsWithData);

        setItemVariants(itemsWithData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [activeCheckout]);

  // Handle Approve Order
  const handleApproveOrder = async (orderId: number) => {
    setLoading(true);
    const result = await approveOrder(orderId);
    setLoading(false);

    if (result && !result.success) {
      toast.error(result.message || "Failed to approve order."); // Sonner error toast (destructive)
    } else {
      toast.success("Order approved successfully!");
    }
  };

  // Handle Delete Order
  const handleDeleteOrder = async (orderId: number) => {
    setLoading(true);
    const result = await deleteOrder(orderId);
    setLoading(false);

    if (result && !result.success) {
      toast.error(result.message || "Failed to delete order.");
    } else {
      toast.success("Order deleted successfully!");
    }
  };

  return (
    <div>
      <div className="w-full flex flex-col space-y-2.5">
        {checkoutDetails.map((detail) => {
          const createdAt = new Date(detail.created_at).toLocaleDateString();
          return (
            <div
              key={detail.id}
              className={`${
                detail.status === "PENDING"
                  ? "bg-white text-black"
                  : "bg-black text-white border"
              } m-1 p-1`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{createdAt}</span>
                {detail.status === "PENDING" ? (
                  <span className="text-sm">Pending</span>
                ) : (
                  <button
                  disabled={loading}
                    onClick={() => handleDeleteOrder(detail.id)}
                    className="bg-white text-black rounded-full p-1"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                )}
              </div>
              <h2>{detail.fullname}</h2>
              <div className="flex flex-wrap text-sm">
                <span>{detail.streetAddress}</span>
                <span> - </span>
                <span>{detail.suburb}</span>
              </div>
              <div className="w-full flex flex-col space-y-1">
                <button
                  onClick={() => openModal(detail)}
                  className="text-sm p-1 border bg-black text-white"
                >
                  More Details
                </button>
                {detail.status === "PENDING" && (
                  <button
                  disabled={loading}
                    onClick={() => handleApproveOrder(detail.id)}
                    className="text-sm p-1 border-2 border-black bg-white text-black"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed Modal */}
      <dialog ref={modalRef} className="modal text-black text-sm">
        <div className="modal-box flex flex-col">
          <span className="font-bold">
            {new Date(activeCheckout?.created_at ?? 0).toLocaleDateString()}
          </span>
          <div className="border-t border-black" />
          <h2>{activeCheckout?.fullname}</h2>
          <div className="flex flex-wrap font-bold">
            <span>{activeCheckout?.streetAddress}</span>
            <span> - </span>
            <span>{activeCheckout?.suburb}</span>
          </div>
          <span>{activeCheckout?.email}</span>
          <span>{activeCheckout?.phone}</span>
          <div className="border-t border-black" />
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-bold">{activeCheckout?.total}</span>
          </div>
          <div className="border-t border-black" />
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-bold">{activeCheckout?.status}</span>
          </div>
          <div className="border-t border-black mb-2" />
          <div className="grid grid-cols-2 md:grid-cols-3">
            {itemVariants.map((item) => (
              <div key={item.id} className="flex flex-col border border-black">
                <h1 className="bg-black text-white rounded-full max-w-fit p-2">{`#${item.id}`}</h1>
                <div className="relative aspect-square">
                  <Image
                    src={item.variant.image_url}
                    alt="Image of item"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <span className="bg-black text-white border max-w-fit py-1 px-2">
                  {item.quantity}
                </span>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </div>
  );
}
