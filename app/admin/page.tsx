import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";


import {
  clearAdminSession,
  createAdminSession,
  isAdmin,
  isAdminConfigured,
} from "@/lib/admin-auth";
import {
  createShipment,
  createTrackingEvent,
  getShipmentSubscribers,
  listCustomerMessages,
  listShipments,
  replyToCustomerMessage,
  updateShipmentLocation,
} from "@/lib/database";
import {
  sendShipmentUpdateEmail,
} from "@/lib/send-shipment-email";
import {
  sendCustomerReplyEmail,
} from "@/lib/send-customer-reply-email";

async function login(data: FormData) {
  "use server";

  const password = String(data.get("password") ?? "");

  const success = await createAdminSession(password);

  redirect(
    success
      ? "/admin"
      : "/admin?error=incorrect-password"
  );
}


async function logout() {
  "use server";

  await clearAdminSession();

  redirect("/admin");
}


async function addShipment(data: FormData) {
  "use server";

  if (!(await isAdmin())) {
    redirect("/admin");
  }

  /* Sender information */

  const customerName = String(
    data.get("customerName") ?? ""
  ).trim();

  const customerEmail = String(
    data.get("customerEmail") ?? ""
  ).trim();

  const senderPhone = String(
    data.get("senderPhone") ?? ""
  ).trim();

  const origin = String(
    data.get("origin") ?? ""
  ).trim();


  /* Receiver information */

  const receiverName = String(
    data.get("receiverName") ?? ""
  ).trim();

  const receiverPhone = String(
    data.get("receiverPhone") ?? ""
  ).trim();
  const receiverEmail = String(
  data.get("receiverEmail") ?? ""
).trim();

  const destination = String(
    data.get("destination") ?? ""
  ).trim();


  /* Package information */

  const service = String(
    data.get("service") ?? ""
  ).trim();

  const description = String(
    data.get("description") ?? ""
  ).trim();

  const packageWeight = String(
    data.get("packageWeight") ?? ""
  ).trim();
  const packageImageFile = data.get("packageImage");

let packageImage = "";

if (
  packageImageFile instanceof File &&
  packageImageFile.size > 0
) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(packageImageFile.type)) {
    redirect("/admin?error=invalid-image");
  }

  const extension =
    packageImageFile.type === "image/png"
      ? "png"
      : packageImageFile.type === "image/webp"
        ? "webp"
        : "jpg";

  const fileName = `${randomUUID()}.${extension}`;

  const uploadDirectory = join(
    process.cwd(),
    "public",
    "uploads"
  );

  await mkdir(uploadDirectory, {
    recursive: true,
  });

  const buffer = Buffer.from(
    await packageImageFile.arrayBuffer()
  );

  await writeFile(
    join(uploadDirectory, fileName),
    buffer
  );

  packageImage = `/uploads/${fileName}`;
}

  /* Payment information */

  const shippingCost = String(
    data.get("shippingCost") ?? ""
  ).trim();

  const paymentStatus = String(
    data.get("paymentStatus") ?? "Pending"
  ).trim();


  /* Validate required fields */

  if (
    !customerName ||
    !customerEmail ||
    !senderPhone ||
    !origin ||
    !receiverName ||
!receiverPhone ||
!receiverEmail ||
!destination ||
    !service ||
    !description ||
    !packageWeight ||
    !shippingCost
  ) {
    redirect("/admin?error=missing-details");
  }


  /* Create tracking number */

  const trackingNumber =
    `TRK-${randomUUID()
      .replaceAll("-", "")
      .slice(0, 9)
      .toUpperCase()}`;

  const createdAt = new Date().toISOString();




const updatedAt = createdAt;

createShipment({
  trackingNumber,
  customerName,
  customerEmail,
  senderPhone,

  receiverName,
  receiverPhone,
  receiverEmail,

  origin,
  destination,
  service,
  status: "Shipment created",
  description,
  packageWeight,
  packageDimensions: "",
  packageCount: "",
  currentLocation: origin,
  estimatedDelivery: "To be confirmed",
  packageImage,
  shippingCost,
  paymentStatus,
  createdAt,
  updatedAt,
});

  /* Create first tracking event */

  createTrackingEvent({
    trackingNumber,

    status: "Shipment created",

    location: origin,

    note: "Shipment record created and awaiting processing.",

    createdAt,
  });


  revalidatePath("/track");

  redirect(
    `/admin?created=${trackingNumber}`
  );
}


async function updateLocation(
  data: FormData
) {
  "use server";

  if (!(await isAdmin())) {
    redirect("/admin");
  }

  const trackingNumber = String(
    data.get("trackingNumber") ?? ""
  );

  const status = String(
    data.get("status") ?? ""
  ).trim();

  const location = String(
    data.get("location") ?? ""
  ).trim();

  const estimatedDelivery = String(
    data.get("estimatedDelivery") ?? ""
  ).trim();

  const note = String(
    data.get("note") ?? ""
  ).trim();


  if (
    !trackingNumber ||
    !status ||
    !location ||
    !estimatedDelivery
  ) {
    redirect("/admin?error=location-details");
  }


 const updateNote =
  note || "Shipment location updated.";

updateShipmentLocation(
  trackingNumber,
  status,
  location,
  estimatedDelivery,
  updateNote
);
const subscribers =
  getShipmentSubscribers(trackingNumber);
  console.log(
  "Shipment subscribers:",
  trackingNumber,
  subscribers
);
console.log("Subscribers found:", subscribers);

for (const email of subscribers) {
  try {
    console.log("Attempting to send shipment email to:", email);

    await sendShipmentUpdateEmail({
      email,
      trackingNumber,
      status,
      location,
      estimatedDelivery,
      note: updateNote,
    });

    console.log("Shipment email successfully sent to Brevo:", email);
  } catch (error) {
    console.error(
      `Failed to send shipment update to ${email}:`,
      error
    );
  }
}

  revalidatePath("/track");

  redirect(
    "/admin?locationUpdated=1"
  );
}


async function reply(
  data: FormData
) {
  "use server";

  if (!(await isAdmin())) {
    redirect("/admin");
  }

  const id = Number(
    data.get("messageId")
  );

  const text = String(
    data.get("reply") ?? ""
  ).trim();

  const senderEmail = String(
    data.get("senderEmail") ?? ""
  ).trim();

  const senderName = String(
    data.get("senderName") ?? ""
  ).trim();

  const trackingNumber = String(
    data.get("trackingNumber") ?? ""
  ).trim();

  if (!id || !text) {
    redirect(
      "/admin?error=reply-required"
    );
  }

  await sendCustomerReplyEmail({
    email: senderEmail,
    senderName,
    trackingNumber,
    reply: text,
  });

  replyToCustomerMessage(
    id,
    text
  );

  redirect("/admin?replied=1");
}


export default async function AdminPage(
  props: PageProps<"/admin">
) {
  const {
    error,
    created,
    locationUpdated,
    replied,
  } = await props.searchParams;


  /* Check configuration */

  if (!isAdminConfigured()) {
    return (
      <main className="admin-shell">
        <section className="setup-card">

          <h1>
            Secure the admin area
          </h1>

          <p>
            Create{" "}
            <code>.env.local</code>
            {" "}with the values from{" "}
            <code>.env.example</code>,
            then restart the development server.
          </p>

        </section>
      </main>
    );
  }


  /* Admin login */

  if (!(await isAdmin())) {
    return (
      <main className="admin-shell">

        <section className="setup-card">

          <p className="eyebrow">
            SwiftRoute administration
          </p>

          <h1>
            Admin sign in
          </h1>

          <form
            action={login}
            className="admin-form"
          >

            <label>
              Password

              <input
                name="password"
                type="password"
                required
              />

            </label>


            {error && (
              <p className="form-error">
                Password not accepted.
              </p>
            )}


            <button>
              Sign in
            </button>

          </form>

        </section>

      </main>
    );
  }


  const shipments = listShipments();

  const messages =
    listCustomerMessages();


  return (
    <main className="admin-shell">


      {/* Header */}

      <header className="admin-header">

        <div>

          <p className="eyebrow">
            SwiftRoute administration
          </p>

          <h1>
            Shipment dashboard
          </h1>

        </div>


        <form action={logout}>

          <button
            className="quiet-button"
          >
            Sign out
          </button>

        </form>

      </header>


      {/* Messages */}

      {created && (
        <p className="success-message">
          Shipment created:{" "}
          <strong>
            {created}
          </strong>
        </p>
      )}


      {locationUpdated === "1" && (
        <p className="success-message">
          Location and timeline updated.
        </p>
      )}


      {replied === "1" && (
        <p className="success-message">
          Reply saved.
        </p>
      )}


      {error &&
        error !== "incorrect-password" && (
          <p className="form-error">
            Please complete every required field.
          </p>
        )}


      {/* Shipment section */}

      <section className="admin-grid">


        {/* Create shipment */}

        <form
  action={addShipment}
  className="shipment-form"
>

          <h2>
            Create shipment
          </h2>


          <p className="eyebrow">
            SENDER INFORMATION
          </p>


          <label>
            Sender name

            <input
              name="customerName"
              required
            />

          </label>


          <label>
            Sender email

            <input
              name="customerEmail"
              type="email"
              required
            />

          </label>


          <label>
            Sender phone

            <input
              name="senderPhone"
              placeholder="+234..."
              required
            />

          </label>


          <label>
            Origin

            <input
              name="origin"
              placeholder="Port Harcourt, Nigeria"
              required
            />

          </label>


          <p className="eyebrow">
            RECEIVER INFORMATION
          </p>


          <label>
            Receiver name

            <input
              name="receiverName"
              required
            />

          </label>


          <label>
            Receiver phone

            <input
              name="receiverPhone"
              required
            />

          </label>
          <label>
  Receiver email

  <input
    name="receiverEmail"
    type="email"
    placeholder="receiver@example.com"
    required
  />
</label>


          <label>
            Destination

            <input
              name="destination"
              placeholder="Lagos, Nigeria"
              required
            />

          </label>


          <p className="eyebrow">
            PACKAGE INFORMATION
          </p>


          <label>
            Service

            <select
              name="service"
              required
              defaultValue=""
            >
              <option value="">
                Select service
              </option>

              <option>
                Standard delivery
              </option>

              <option>
                Express delivery
              </option>

              <option>
                International express
              </option>

              <option>
                Freight delivery
              </option>

            </select>

          </label>


          <label>
            Package description

            <textarea
              name="description"
              placeholder="Describe the shipment..."
              required
            />

          </label>


          <label>
  Package weight

  <input
    name="packageWeight"
    placeholder="Example: 5 kg"
    required
  />
</label>

<label>
  Package image

  <input
    name="packageImage"
    type="file"
    accept="image/png,image/jpeg,image/webp"
  />
</label>


          <p className="eyebrow">
            PAYMENT INFORMATION
          </p>


          <label>
            Shipping cost

            <input
              name="shippingCost"
              placeholder="Example: $150"
              required
            />

          </label>


          <label>
            Payment status

            <select
              name="paymentStatus"
              defaultValue="Pending"
            >

              <option>
                Pending
              </option>

              <option>
                Paid
              </option>

              <option>
                Partially paid
              </option>

            </select>

          </label>


          <button>
            Create shipment
          </button>

        </form>


        {/* Recent shipments */}

        <section className="shipment-list">

          <h2>
            Recent shipments
          </h2>


          {shipments.length ? (

            shipments.map((shipment) => (

              <article
                className="shipment-row"
                key={
                  shipment.trackingNumber
                }
              >

                <strong>
                  {
                    shipment.trackingNumber
                  }
                </strong>


                <span>
                  {
                    shipment.currentLocation ||
                    shipment.origin ||
                    "No location yet"
                  }

                  {" → "}

                  {
                    shipment.destination
                  }
                </span>


                <span
                  className="status-pill"
                >
                  {
                    shipment.status
                  }
                </span>

              </article>

            ))

          ) : (

            <p>
              No shipments yet.
            </p>

          )}

        </section>

      </section>


      {/* Tracking update */}

      <section className="message-inbox">

        <p className="eyebrow">
          MAP AND TIMELINE
        </p>


        <h2>
          Update current location
        </h2>


        <p>
          Each update changes the customer
          tracking status, current location,
          estimated delivery, and timeline.
        </p>


        {shipments.map((shipment) => (

          <form
            action={updateLocation}
            className="location-form"
            key={
              shipment.trackingNumber
            }
          >

            <strong>
              {
                shipment.trackingNumber
              }
            </strong>


            <input
              type="hidden"
              name="trackingNumber"
              value={
                shipment.trackingNumber
              }
            />


            <select
              name="status"
              defaultValue={
                shipment.status
              }
            >

              <option>
                Shipment created
              </option>

              <option>
                In transit
              </option>

              <option>
                At local hub
              </option>

              <option>
                Out for delivery
              </option>

              <option>
                Delivered
              </option>

            </select>


            <input
              name="location"
              defaultValue={
                shipment.currentLocation
              }
              placeholder="Current city or hub"
              required
            />


            <input
              name="estimatedDelivery"
              defaultValue={
                shipment.estimatedDelivery
              }
              placeholder="Estimated delivery"
              required
            />


            <input
              name="note"
              placeholder="Tracking update note"
            />


            <button>
              Update tracking
            </button>

          </form>

        ))}

      </section>


      {/* Customer messages */}

      <section className="message-inbox">

        <p className="eyebrow">
          CUSTOMER SUPPORT
        </p>


        <h2>
          Customer messages
        </h2>


        {messages.length ? (

          messages.map((message) => (

            <article
              className="message-card"
              key={message.id}
            >

              <p>

                <strong>
                  {message.senderName}
                </strong>

                {" · "}

                <a
                  href={`mailto:${message.senderEmail}`}
                >
                  {message.senderEmail}
                </a>

              </p>


              <p className="message-tracking">

                Shipment:{" "}

                {message.trackingNumber}

              </p>


              <p>
                {message.message}
              </p>


              {message.reply ? (

                <p className="admin-reply">

                  <strong>
                    Your reply:
                  </strong>

                  {" "}

                  {message.reply}

                </p>

              ) : (

                <form
                  action={reply}
                  className="reply-form"
                >

                  <input
                    type="hidden"
                    name="messageId"
                    value={message.id}
                  />
                  <input
  type="hidden"
  name="senderEmail"
  value={message.senderEmail}
/>

<input
  type="hidden"
  name="senderName"
  value={message.senderName}
/>

<input
  type="hidden"
  name="trackingNumber"
  value={message.trackingNumber}
/>



                  <textarea
                    name="reply"
                    placeholder="Write a reply"
                    required
                  />


                  <button>
                    Save reply
                  </button>

                </form>

              )}

            </article>

          ))

        ) : (

          <p>
            No customer messages yet.
          </p>

        )}

      </section>

    </main>
  );
}