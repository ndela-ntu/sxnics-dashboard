import { ICheckoutDetails } from "@/models/checkout_details";
import { createClient } from "@/utils/supabase/server";
import { Trash } from "lucide-react";

export default function Orders({
  checkoutDetails,
}: {
  checkoutDetails: ICheckoutDetails[];
}) {
  const supabase = createClient();
  return (
    <div className="w-full flex flex-col space-y-2.5">
      {checkoutDetails.map((detail) => {
        const createdAt = new Date(detail.created_at).toLocaleDateString();
        return (
          <div
            key={detail.id}
            className={`${detail.status === "PENDING" ? "bg-white text-black" : "bg-black text-white border"} m-1 p-1`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{createdAt}</span>
              {detail.status === "PENDING" ? (
                <span className="text-sm">Pending</span>
              ) : (
                <span className="bg-white text-black rounded-full p-1">
                  <Trash className="h-5 w-5" />
                </span>
              )}
            </div>
            <h2>{detail.fullname}</h2>
            <div className="flex space-x-2 flex-wrap text-sm">
              <span>{detail.streetAddress}</span>
              <span>{detail.suburb}</span>
            </div>
            <div className="w-full flex flex-col space-y-1">
              <button className="text-sm p-1 border bg-black text-white">
                More Details
              </button>
              {detail.status === "PENDING" && (
                <button className="text-sm p-1 border-2 border-black bg-white text-black">
                  Approve
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
