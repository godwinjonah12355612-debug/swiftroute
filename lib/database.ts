import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

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

const databasePath = join(
  process.cwd(),
  "data",
  "shipments.db"
);

const globalDatabase = globalThis as unknown as {
  shipmentDb?: DatabaseSync;
};

mkdirSync(
  join(process.cwd(), "data"),
  { recursive: true }
);

const db =
  globalDatabase.shipmentDb ??
  new DatabaseSync(databasePath);

globalDatabase.shipmentDb = db;

/* ----------------------------------
   SHIPMENTS TABLE
---------------------------------- */

db.exec(`
  CREATE TABLE IF NOT EXISTS shipments (
  tracking_number TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL DEFAULT '',
  sender_phone TEXT NOT NULL DEFAULT '',
  receiver_name TEXT NOT NULL DEFAULT '',
  receiver_phone TEXT NOT NULL DEFAULT '',
  receiver_email TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL,
  service TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL,
  package_weight TEXT NOT NULL DEFAULT '',
  package_dimensions TEXT NOT NULL DEFAULT '',
  package_count TEXT NOT NULL DEFAULT '',
  current_location TEXT NOT NULL DEFAULT '',
  estimated_delivery TEXT NOT NULL DEFAULT '',
  package_image TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
`);
try {
  db.exec(`
    ALTER TABLE shipments
    ADD COLUMN updated_at TEXT
  `);

  db.exec(`
    UPDATE shipments
    SET updated_at = created_at
    WHERE updated_at IS NULL
  `);
} catch (error) {
  // Column already exists, so we can safely continue.
}

/* ----------------------------------
   NOTIFICATION SUBSCRIPTIONS TABLE
---------------------------------- */

db.exec(`
  CREATE TABLE IF NOT EXISTS notification_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_number TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT NOT NULL,

    UNIQUE(tracking_number, email)
  )
`);

/* ----------------------------------
   SAFE DATABASE UPGRADES
---------------------------------- */
const columns = db
  .prepare("PRAGMA table_info(shipments)")
  .all() as Array<{ name: string }>;

if (!columns.some((column) => column.name === "customer_email")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN customer_email TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "origin")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN origin TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "current_location")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN current_location TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "estimated_delivery")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN estimated_delivery TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "package_image")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN package_image TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "package_weight")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN package_weight TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "package_dimensions")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN package_dimensions TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "package_count")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN package_count TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "sender_phone")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN sender_phone TEXT NOT NULL DEFAULT ''"
  );
}

/* ADD THESE THREE BLOCKS */

if (!columns.some((column) => column.name === "receiver_name")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN receiver_name TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "receiver_phone")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN receiver_phone TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "receiver_email")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN receiver_email TEXT NOT NULL DEFAULT ''"
  );
}

/* THEN YOUR EXISTING CODE CONTINUES */

if (!columns.some((column) => column.name === "shipping_cost")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN shipping_cost TEXT NOT NULL DEFAULT ''"
  );
}

if (!columns.some((column) => column.name === "payment_status")) {
  db.exec(
    "ALTER TABLE shipments ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'Pending'"
  );
}

/* ----------------------------------
   CUSTOMER MESSAGES TABLE
---------------------------------- */

db.exec(`
  CREATE TABLE IF NOT EXISTS customer_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_number TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TEXT NOT NULL,
    reply TEXT,
    replied_at TEXT
  )
`);

/* ----------------------------------
   SAFE CUSTOMER MESSAGE UPGRADES
---------------------------------- */

const messageColumns = db
  .prepare("PRAGMA table_info(customer_messages)")
  .all() as Array<{ name: string }>;

if (
  !messageColumns.some(
    (column) => column.name === "status"
  )
) {
  db.exec(
    "ALTER TABLE customer_messages ADD COLUMN status TEXT NOT NULL DEFAULT 'Open'"
  );
}


/* ----------------------------------
   TRACKING EVENTS TABLE
---------------------------------- */

db.exec(`
  CREATE TABLE IF NOT EXISTS tracking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_number TEXT NOT NULL,
    status TEXT NOT NULL,
    location TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);


/* ----------------------------------
   SHIPMENT FUNCTIONS
---------------------------------- */

function mapShipment(
  row: unknown
): Shipment | undefined {
  if (!row || typeof row !== "object") {
    return undefined;
  }

  const value = row as Record<string, string>;

 return {
  trackingNumber: value.tracking_number,
  customerName: value.customer_name,
  customerEmail: value.customer_email,
  senderPhone: value.sender_phone,

  receiverName: value.receiver_name,
  receiverPhone: value.receiver_phone,
  receiverEmail: value.receiver_email,

  origin: value.origin,
  destination: value.destination,

  service: value.service,
  status: value.status,

  description: value.description,
  packageWeight: value.package_weight,
  packageDimensions: value.package_dimensions,
  packageCount: value.package_count,

  currentLocation: value.current_location,
  estimatedDelivery: value.estimated_delivery,

  packageImage: value.package_image,
  shippingCost: value.shipping_cost,
  paymentStatus: value.payment_status,

  createdAt: value.created_at,
  updatedAt: value.updated_at,
};
}

export function getShipment(
  trackingNumber: string
) {
  return mapShipment(
    db
      .prepare(
        "SELECT * FROM shipments WHERE tracking_number = ?"
      )
      .get(trackingNumber)
  );
}


export function listShipments() {
  return db
    .prepare(
      "SELECT * FROM shipments ORDER BY created_at DESC"
    )
    .all()
    .map(mapShipment)
    .filter(
      (shipment): shipment is Shipment =>
        Boolean(shipment)
    );
}
export function createShipment(
  shipment: Shipment
) {
  db
    .prepare(`
      INSERT INTO shipments (
        tracking_number,
        customer_name,
        customer_email,
        sender_phone,

        receiver_name,
        receiver_phone,
        receiver_email,

        origin,
        destination,
        service,
        status,
        description,
        package_weight,
        package_dimensions,
        package_count,
        current_location,
        estimated_delivery,
        package_image,
        shipping_cost,
        payment_status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      shipment.trackingNumber,
      shipment.customerName,
      shipment.customerEmail,
      shipment.senderPhone,

      shipment.receiverName,
      shipment.receiverPhone,
      shipment.receiverEmail,

      shipment.origin,
      shipment.destination,
      shipment.service,
      shipment.status,
      shipment.description,
      shipment.packageWeight,
      shipment.packageDimensions,
      shipment.packageCount,
      shipment.currentLocation,
      shipment.estimatedDelivery,
      shipment.packageImage,
      shipment.shippingCost,
      shipment.paymentStatus,
      shipment.createdAt,
      shipment.updatedAt
    );
}

export function updateShipmentLocation(
  trackingNumber: string,
  status: string,
  location: string,
  estimatedDelivery: string,
  note: string
) {
  const now = new Date().toISOString();

  db
    .prepare(`
      UPDATE shipments
      SET
        status = ?,
        current_location = ?,
        estimated_delivery = ?,
        updated_at = ?
      WHERE tracking_number = ?
    `)
    .run(
      status,
      location,
      estimatedDelivery,
      now,
      trackingNumber
    );

  db
    .prepare(`
      INSERT INTO tracking_events (
        tracking_number,
        status,
        location,
        note,
        created_at
      )
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      trackingNumber,
      status,
      location,
      note,
      now
    );
}

/* ----------------------------------
   TRACKING EVENTS
---------------------------------- */

export function createTrackingEvent(
  event: Omit<TrackingEvent, "id">
) {
  db
    .prepare(`
      INSERT INTO tracking_events (
        tracking_number,
        status,
        location,
        note,
        created_at
      )
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      event.trackingNumber,
      event.status,
      event.location,
      event.note,
      event.createdAt
    );
}


export function listTrackingEvents(
  trackingNumber: string
) {
  return db
    .prepare(`
      SELECT *
      FROM tracking_events
      WHERE tracking_number = ?
      ORDER BY created_at DESC
    `)
    .all(trackingNumber)
    .map((row) => {
      const value =
        row as Record<string, string | number>;

      return {
        id: Number(value.id),
        trackingNumber: String(
          value.tracking_number
        ),
        status: String(value.status),
        location: String(value.location),
        note: String(value.note),
        createdAt: String(value.created_at),
      };
    });
}


/* ----------------------------------
   CUSTOMER MESSAGES
---------------------------------- */

function mapMessage(
  row: unknown
): CustomerMessage | undefined {
  if (!row || typeof row !== "object") {
    return undefined;
  }

  const value =
    row as Record<string, string | number | null>;

  return {
    id: Number(value.id),
    trackingNumber: String(
      value.tracking_number
    ),
    senderName: String(value.sender_name),
    senderEmail: String(value.sender_email),
    message: String(value.message),
    status: String(value.status),
    createdAt: String(value.created_at),
    reply: value.reply
      ? String(value.reply)
      : null,
    repliedAt: value.replied_at
      ? String(value.replied_at)
      : null,
  };
}




export function createCustomerMessage(
  message: Omit<
    CustomerMessage,
    "id" | "reply" | "repliedAt"
  >
) {
  db
    .prepare(`
      INSERT INTO customer_messages (
        tracking_number,
        sender_name,
        sender_email,
        message,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(
      message.trackingNumber,
      message.senderName,
      message.senderEmail,
      message.message,
      message.status ?? "Open",
      message.createdAt
    );
}


export function listCustomerMessages() {
  return db
    .prepare(`
      SELECT *
      FROM customer_messages
      ORDER BY created_at DESC
    `)
    .all()
    .map(mapMessage)
    .filter(
      (message): message is CustomerMessage =>
        Boolean(message)
    );
}


export function replyToCustomerMessage(
  id: number,
  reply: string
) {
  db
    .prepare(`
      UPDATE customer_messages
      SET
        reply = ?,
        replied_at = ?
      WHERE id = ?
    `)
    .run(
      reply,
      new Date().toISOString(),
      id
    );
}

export function subscribeToShipmentUpdates(
  trackingNumber: string,
  email: string
) {
  const now = new Date().toISOString();

  db.prepare(`
    INSERT OR IGNORE INTO notification_subscriptions (
      tracking_number,
      email,
      created_at
    )
    VALUES (?, ?, ?)
  `).run(
    trackingNumber,
    email,
    now
  );
}

export function getShipmentSubscribers(
  trackingNumber: string
) {
  const shipment = db
    .prepare(`
      SELECT
        customer_email,
        receiver_email
      FROM shipments
      WHERE tracking_number = ?
    `)
    .get(trackingNumber) as
    | {
        customer_email: string | null;
        receiver_email: string | null;
      }
    | undefined;

  if (!shipment) {
    return [];
  }

  return [
    shipment.customer_email,
    shipment.receiver_email,
  ]
    .filter(
      (email): email is string =>
        Boolean(email?.trim())
    )
    .filter(
      (email, index, emails) =>
        emails.indexOf(email) === index
    );
}