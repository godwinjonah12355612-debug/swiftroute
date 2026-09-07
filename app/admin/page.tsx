import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
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
  deleteShipment,
  getShipmentSubscribers,
  listCustomerMessages,
  listShipments,
  replyToCustomerMessage,
  updateShipmentLocation,
  updateShipmentPayment,
} from "@/lib/database";
import {
  sendShipmentUpdateEmail,
} from "@/lib/send-shipment-email";
import {
  sendCustomerReplyEmail,
} from "@/lib/send-customer-reply-email";
import DeleteShipmentButton from "@/components/DeleteShipmentButton";

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

const receiverName = String(
  data.get("receiverName") ?? ""
).trim();

const receiverPhone = String(
  data.get("receiverPhone") ?? ""
).trim();

const receiverEmail = String(
  data.get("receiverEmail") ?? ""
).trim();

const senderPhone = String(
  data.get("senderPhone") ?? ""
).trim();

const origin = String(
  data.get("origin") ?? ""
).trim();

const destination = String(
  data.get("destination") ?? ""
).trim();

// The receiver is the customer who receives shipment updates




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
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

  if (!allowedTypes.includes(packageImageFile.type)) {
    redirect("/admin?error=invalid-image");
  }

 let extension = "jpg";

if (packageImageFile.type === "image/png") {
  extension = "png";
} else if (packageImageFile.type === "image/webp") {
  extension = "webp";
} else if (packageImageFile.type === "video/mp4") {
  extension = "mp4";
} else if (packageImageFile.type === "video/webm") {
  extension = "webm";
} else if (packageImageFile.type === "video/quicktime") {
  extension = "mov";
}

const filePath = `${randomUUID()}.${extension}`;

const fileBuffer = Buffer.from(
  await packageImageFile.arrayBuffer()
);

const { error: uploadError } =
  await supabaseAdmin.storage
    .from("package-media")
    .upload(filePath, fileBuffer, {
      contentType: packageImageFile.type,
      upsert: false,
    });

if (uploadError) {
  console.error(
    "Package upload failed:",
    uploadError
  );

  redirect("/admin?error=upload-failed");
}

const {
  data: publicUrlData,
} = supabaseAdmin.storage
  .from("package-media")
  .getPublicUrl(filePath);

packageImage =
  publicUrlData.publicUrl;

} // <-- ADD THIS CLOSING BRACKET

/* Payment information */
const shippingCost = String(
  data.get("shippingCost") ?? ""
).trim();

const amountPaid = String(
  data.get("amountPaid") ?? "0"
).trim();

const paymentStatus = String(
  data.get("paymentStatus") ?? "Pending"
).trim();



const shippingCostNumber =
  Number(shippingCost.replace(/[^0-9.]/g, "")) || 0;

const amountPaidNumber =
  Number(amountPaid.replace(/[^0-9.]/g, "")) || 0;

const remainingBalance = String(
  Math.max(0, shippingCostNumber - amountPaidNumber)
);

const calculatedPaymentStatus =
  remainingBalance === "0"
    ? "Fully paid"
    : amountPaidNumber > 0
    ? "Partially paid"
    : "Pending";

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
await createShipment({
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
amountPaid,
remainingBalance,
paymentStatus: calculatedPaymentStatus,
createdAt,
updatedAt,
});

  /* Create first tracking event */
await createTrackingEvent({
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

await updateShipmentLocation(  trackingNumber,
  status,
  location,
  estimatedDelivery,
  updateNote
);
const subscribers =
  await getShipmentSubscribers(trackingNumber);
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

async function updatePayment(data: FormData) {
  "use server";

  if (!(await isAdmin())) {
    redirect("/admin");
  }

  const trackingNumber = String(
    data.get("trackingNumber") ?? ""
  ).trim();

  const shippingCost = String(
    data.get("shippingCost") ?? ""
  ).trim();

  const amountPaid = String(
    data.get("amountPaid") ?? ""
  ).trim();
const paymentStatus = String(
  data.get("paymentStatus") ?? ""
).trim();

if (!trackingNumber || !shippingCost || !amountPaid || !paymentStatus) {    
    redirect("/admin?error=payment-details");
  }

  await updateShipmentPayment(
  trackingNumber,
  shippingCost,
  amountPaid,
  paymentStatus
);

  revalidatePath("/admin");
  revalidatePath("/track");

  redirect("/admin?paymentUpdated=1");
}



async function removeShipment(data: FormData) {
  "use server";

  if (!(await isAdmin())) {
    redirect("/admin");
  }

  const trackingNumber = String(
    data.get("trackingNumber") ?? ""
  ).trim();

  if (!trackingNumber) {
    redirect("/admin?error=delete-failed");
  }

const deleted = await deleteShipment(trackingNumber);
  if (!deleted) {
    redirect("/admin?error=delete-failed");
  }

  revalidatePath("/admin");
  revalidatePath("/track");

  redirect("/admin?deleted=1");
}
async function reply(data: FormData) {
  "use server";

  if (!(await isAdmin())) {
    redirect("/admin");
  }

  const id = Number(data.get("messageId") ?? 0);

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

  if (
    !id ||
    !text ||
    !senderEmail ||
    !senderName ||
    !trackingNumber
  ) {
    redirect("/admin?error=reply-required");
  }

  try {
    await sendCustomerReplyEmail({
      email: senderEmail,
      senderName,
      trackingNumber,
      reply: text,
    });

await replyToCustomerMessage(  
      id,
      text
    );

    revalidatePath("/admin");

  } catch (error) {
    console.error(
      "Failed to send customer reply:",
      error
    );

    redirect("/admin?error=reply-failed");
  }

  redirect("/admin?replied=1");
}

export default async function AdminPage(
  props: PageProps<"/admin">
) {
  const {
  error,
  created,
  locationUpdated,
  paymentUpdated,
  replied,
  deleted,
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


const shipments = await listShipments();
const messages = await listCustomerMessages();


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
{paymentUpdated === "1" && (
  <p className="success-message">
    Payment information updated successfully.
  </p>
)}

{replied === "1" && (
  <p className="success-message">
    Reply saved.
  </p>
)}

{deleted === "1" && (
  <p className="success-message">
    Shipment deleted successfully.
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
  accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
/>
</label>


         <p className="eyebrow">
  PAYMENT INFORMATION
</p>

<label>
  Total shipping cost

  <input
    name="shippingCost"
    placeholder="Example: $150"
    required
  />
</label>

<label>
  Amount paid

  <input
    name="amountPaid"
    placeholder="Example: $50"
    defaultValue="0"
    required
  />
</label>

<label>
  Payment status

  <select
    name="paymentStatus"
    defaultValue="Pending"
  >
    <option>Pending</option>
    <option>Partially paid</option>
    <option>Fully paid</option>
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
  key={shipment.trackingNumber}
>
  <strong>
    {shipment.trackingNumber}
  </strong>

  <span>
    {shipment.currentLocation ||
      shipment.origin ||
      "No location yet"}

    {" → "}

    {shipment.destination}
  </span>

  <span className="status-pill">
    {shipment.status}
  </span>

  <DeleteShipmentButton
  action={removeShipment}
  trackingNumber={shipment.trackingNumber}
/>
</article>

            ))

          ) : (

            <p>
              No shipments yet.
            </p>

          )}

        </section>

      </section>


         {/* Payment management */}

<section className="message-inbox">

  <p className="eyebrow">
    PAYMENT MANAGEMENT
  </p>

  <h2>
    Update shipment payment
  </h2>

  <p>
    Update the shipping cost and amount paid.
    The remaining balance and payment status
    will be calculated automatically.
  </p>

  {shipments.map((shipment) => (

    <form
      action={updatePayment}
      className="payment-update-form"
      key={shipment.trackingNumber}
    >

      <strong>
        {shipment.trackingNumber}
      </strong>

      <input
        type="hidden"
        name="trackingNumber"
        value={shipment.trackingNumber}
      />

      <input
        name="shippingCost"
        defaultValue={shipment.shippingCost}
        placeholder="Total shipping cost"
        required
      />

      <input
        name="amountPaid"
        defaultValue={shipment.amountPaid}
        placeholder="Amount paid"
        required
      />

      <p>
        Remaining balance:{" "}
        <strong>
          {shipment.remainingBalance}
        </strong>
      </p>

      <label>
  Payment status

  <select
    name="paymentStatus"
    defaultValue={shipment.paymentStatus}
    required
  >
    <option>Pending</option>
    <option>Partially paid</option>
    <option>Fully paid</option>
  </select>
</label>

      <button>
        Update payment
      </button>

    </form>

  ))}

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
  className="tracking-update-form"
  key={shipment.trackingNumber}
>
  <div className="tracking-number">
    <span>Tracking number</span>

    <strong>
      {shipment.trackingNumber}
    </strong>
  </div>

  <input
    type="hidden"
    name="trackingNumber"
    value={shipment.trackingNumber}
  />

  <div className="tracking-fields">

    <label>
      Shipment status

      <select
  name="status"
  defaultValue={shipment.status}
>
  <option>Shipment created</option>
  <option>In transit</option>
  <option>Hold</option>
  <option>At local hub</option>
  <option>Out for delivery</option>
  <option>Delivered</option>
</select>
    </label>

    <label>
      Current location

      <input
        name="location"
        defaultValue={shipment.currentLocation}
        placeholder="Current city or hub"
        required
      />
    </label>

    <label>
      Estimated delivery

      <input
        name="estimatedDelivery"
        defaultValue={shipment.estimatedDelivery}
        placeholder="Estimated delivery"
        required
      />
    </label>

    <label>
      Update note

      <input
        name="note"
        placeholder="Tracking update note"
      />
    </label>

  </div>

  <button type="submit">
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