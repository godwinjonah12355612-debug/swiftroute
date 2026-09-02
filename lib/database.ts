import { supabaseAdmin as supabase } from "./supabase-admin";
export type Shipment = {
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  senderPhone: string;

  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;

  origin: string;
  destination: string;

  service: string;
  status: string;

  description: string;
  packageWeight: string;
  packageDimensions: string;
  packageCount: string;

  currentLocation: string;
  estimatedDelivery: string;
  packageImage: string;
    
  shippingCost: string;
amountPaid: string;
remainingBalance: string;
paymentStatus: string;

  createdAt: string;
  updatedAt: string;
};

export type CustomerMessage = {
  id: number;
  trackingNumber: string;
  senderName: string;
  senderEmail: string;
  message: string;
  status: string;
  createdAt: string;
  reply: string | null;
  repliedAt: string | null;
};

export type TrackingEvent = {
  id: number;
  trackingNumber: string;
  status: string;
  location: string;
  note: string;
  createdAt: string;
};

/* ----------------------------------
   SHIPMENT MAPPER
---------------------------------- */

function mapShipment(row: Record<string, unknown>): Shipment {
  return {
    trackingNumber: String(row.tracking_number ?? ""),
    customerName: String(row.customer_name ?? ""),
    customerEmail: String(row.customer_email ?? ""),
    senderPhone: String(row.sender_phone ?? ""),

    receiverName: String(row.receiver_name ?? ""),
    receiverPhone: String(row.receiver_phone ?? ""),
    receiverEmail: String(row.receiver_email ?? ""),

    origin: String(row.origin ?? ""),
    destination: String(row.destination ?? ""),

    service: String(row.service ?? ""),
    status: String(row.status ?? ""),

    description: String(row.description ?? ""),
    packageWeight: String(row.package_weight ?? ""),
    packageDimensions: String(row.package_dimensions ?? ""),
    packageCount: String(row.package_count ?? ""),

    currentLocation: String(row.current_location ?? ""),
    estimatedDelivery: String(row.estimated_delivery ?? ""),
    packageImage: String(row.package_image ?? ""),
     
    shippingCost: String(row.shipping_cost ?? ""),
amountPaid: String(row.amount_paid ?? "0"),
remainingBalance: String(row.remaining_balance ?? "0"),
paymentStatus: String(row.payment_status ?? ""),

    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

/* ----------------------------------
   SHIPMENT FUNCTIONS
---------------------------------- */

export async function getShipment(
  trackingNumber: string
): Promise<Shipment | undefined> {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("tracking_number", trackingNumber)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return undefined;
  }

  return mapShipment(data);
}

export async function listShipments(): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapShipment);
}

export async function deleteShipment(
  trackingNumber: string
) {
  const { error: eventsError } = await supabase
    .from("tracking_events")
    .delete()
    .eq("tracking_number", trackingNumber);

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  const { error: messagesError } = await supabase
    .from("customer_messages")
    .delete()
    .eq("tracking_number", trackingNumber);

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const { error: subscriptionsError } = await supabase
    .from("notification_subscriptions")
    .delete()
    .eq("tracking_number", trackingNumber);

  if (subscriptionsError) {
    throw new Error(subscriptionsError.message);
  }

  const { error: shipmentError } = await supabase
    .from("shipments")
    .delete()
    .eq("tracking_number", trackingNumber);

  if (shipmentError) {
    throw new Error(shipmentError.message);
  }

  return true;
}

export async function createShipment(
  shipment: Shipment
) {
  const { error } = await supabase
    .from("shipments")
    .insert({
      tracking_number: shipment.trackingNumber,
      customer_name: shipment.customerName,
      customer_email: shipment.customerEmail,
      sender_phone: shipment.senderPhone,

      receiver_name: shipment.receiverName,
      receiver_phone: shipment.receiverPhone,
      receiver_email: shipment.receiverEmail,

      origin: shipment.origin,
      destination: shipment.destination,

      service: shipment.service,
      status: shipment.status,

      description: shipment.description,
      package_weight: shipment.packageWeight,
      package_dimensions: shipment.packageDimensions,
      package_count: shipment.packageCount,

      current_location: shipment.currentLocation,
      estimated_delivery: shipment.estimatedDelivery,
      package_image: shipment.packageImage,

       shipping_cost: shipment.shippingCost,
amount_paid: shipment.amountPaid,
remaining_balance: shipment.remainingBalance,
payment_status: shipment.paymentStatus,

      created_at: shipment.createdAt,
      updated_at: shipment.updatedAt,
    });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function updateShipmentLocation(
  trackingNumber: string,
  status: string,
  location: string,
  estimatedDelivery: string,
  note: string
) {
  const now = new Date().toISOString();

  const { error: shipmentError } = await supabase
    .from("shipments")
    .update({
      status,
      current_location: location,
      estimated_delivery: estimatedDelivery,
      updated_at: now,
    })
    .eq("tracking_number", trackingNumber);

  if (shipmentError) {
    throw new Error(shipmentError.message);
  }

  const { error: eventError } = await supabase
    .from("tracking_events")
    .insert({
      tracking_number: trackingNumber,
      status,
      location,
      note,
      created_at: now,
    });

  if (eventError) {
    throw new Error(eventError.message);
  }

  return true;
}



export async function updateShipmentPayment(
  trackingNumber: string,
  shippingCost: string,
  amountPaid: string
) {
  const shippingCostNumber =
    Number(shippingCost.replace(/[^0-9.]/g, "")) || 0;

  const amountPaidNumber =
    Number(amountPaid.replace(/[^0-9.]/g, "")) || 0;

  const remainingBalance = String(
    Math.max(0, shippingCostNumber - amountPaidNumber)
  );

  const paymentStatus =
    Number(remainingBalance) === 0 && shippingCostNumber > 0
      ? "Fully paid"
      : amountPaidNumber > 0
      ? "Partially paid"
      : "Pending";

  const { error } = await supabase
    .from("shipments")
    .update({
      shipping_cost: shippingCost,
      amount_paid: amountPaid,
      remaining_balance: remainingBalance,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("tracking_number", trackingNumber);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}




/* ----------------------------------
   TRACKING EVENTS
---------------------------------- */

export async function createTrackingEvent(
  event: Omit<TrackingEvent, "id">
) {
  const { error } = await supabase
    .from("tracking_events")
    .insert({
      tracking_number: event.trackingNumber,
      status: event.status,
      location: event.location,
      note: event.note,
      created_at: event.createdAt,
    });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function listTrackingEvents(
  trackingNumber: string
): Promise<TrackingEvent[]> {
  const { data, error } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("tracking_number", trackingNumber)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: Number(row.id),
    trackingNumber: String(row.tracking_number),
    status: String(row.status),
    location: String(row.location),
    note: String(row.note),
    createdAt: String(row.created_at),
  }));
}

/* ----------------------------------
   CUSTOMER MESSAGES
---------------------------------- */

function mapMessage(
  row: Record<string, unknown>
): CustomerMessage {
  return {
    id: Number(row.id),
    trackingNumber: String(row.tracking_number ?? ""),
    senderName: String(row.sender_name ?? ""),
    senderEmail: String(row.sender_email ?? ""),
    message: String(row.message ?? ""),
    status: String(row.status ?? "Open"),
    createdAt: String(row.created_at ?? ""),
    reply: row.reply ? String(row.reply) : null,
    repliedAt: row.replied_at
      ? String(row.replied_at)
      : null,
  };
}

export async function createCustomerMessage(
  message: Omit<
    CustomerMessage,
    "id" | "reply" | "repliedAt"
  >
) {
  const { error } = await supabase
    .from("customer_messages")
    .insert({
      tracking_number: message.trackingNumber,
      sender_name: message.senderName,
      sender_email: message.senderEmail,
      message: message.message,
      status: message.status ?? "Open",
      created_at: message.createdAt,
    });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function listCustomerMessages(): Promise<
  CustomerMessage[]
> {
  const { data, error } = await supabase
    .from("customer_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapMessage);
}

export async function replyToCustomerMessage(
  id: number,
  reply: string
) {
  const { error } = await supabase
    .from("customer_messages")
    .update({
      reply,
      replied_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

/* ----------------------------------
   NOTIFICATION SUBSCRIPTIONS
---------------------------------- */

export async function subscribeToShipmentUpdates(
  trackingNumber: string,
  email: string
) {
  const { error } = await supabase
    .from("notification_subscriptions")
    .upsert(
      {
        tracking_number: trackingNumber,
        email,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: "tracking_number,email",
        ignoreDuplicates: true,
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function getShipmentSubscribers(
  trackingNumber: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("shipments")
    .select("receiver_email")
    .eq("tracking_number", trackingNumber)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.receiver_email?.trim()) {
    return [];
  }

  return [data.receiver_email.trim()];
}