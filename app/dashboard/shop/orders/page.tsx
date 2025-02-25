import Orders from "@/components/ui/shop/orders";
import { ICheckoutDetails, IOrderItems } from "@/models/checkout_details";
import { createClient } from "@/utils/supabase/client";

export const revalidate = 60;

export default async function Page() {
  const supabase = createClient();
  const { data: checkoutDetails, error: checkoutDetailsError } = await supabase
    .from("checkout_details")
    .select("*")
    .order("created_at", { ascending: true });

  if (checkoutDetailsError) {
    return <div>{`An error occurred: ${checkoutDetailsError.message}`}</div>;
  }

  return (
    <div>
      <h1 className="text-lg">Orders</h1>
      <Orders checkoutDetails={checkoutDetails} />
    </div>
  );
}
