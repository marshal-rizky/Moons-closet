import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCustomerConfirmationNotification, sendCustomerShippingNotification } from "@/lib/email";
import type { Order } from "@/lib/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await request.json();
  const validStatuses = ["pending", "confirmed", "shipped", "done"];
  if (!validStatuses.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (status === "confirmed") {
    await sendCustomerConfirmationNotification(data as Order);
  } else if (status === "shipped") {
    await sendCustomerShippingNotification(data as Order);
  }

  return NextResponse.json(data);
}
