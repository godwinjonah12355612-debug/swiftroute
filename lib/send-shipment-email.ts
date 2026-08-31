import { brevo } from "@/lib/brevo";

type ShipmentEmailData = {
  email: string;
  trackingNumber: string;
  status: string;
  location: string;
  estimatedDelivery: string;
  note: string;
};

export async function sendShipmentUpdateEmail(
  data: ShipmentEmailData
) {
  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: "SwiftRoute",
      email: process.env.BREVO_SENDER_EMAIL!,
    },

    to: [
      {
        email: data.email,
      },
    ],

    subject: `Shipment Update: ${data.trackingNumber}`,

    htmlContent: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">

    <h2 style="color: #2563eb;">
      Your shipment has been updated
    </h2>

    <p>
      Your shipment
      <strong>${data.trackingNumber}</strong>
      has a new tracking update.
    </p>

    <p>
      <strong>Status:</strong> ${data.status}
    </p>

    <p>
      <strong>Current location:</strong> ${data.location}
    </p>

    <p>
      <strong>Estimated delivery:</strong>
      ${data.estimatedDelivery}
    </p>

    <p>
      <strong>Update:</strong> ${data.note}
    </p>

    <br />

    <a
      href="${process.env.NEXT_PUBLIC_SITE_URL}/track?number=${encodeURIComponent(data.trackingNumber)}"
      style="
        display: inline-block;
        padding: 14px 24px;
        background-color: #2563eb;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
      "
    >
      🔎 View Shipment Tracking
    </a>

    <br />
    <br />

    <p>
      Click the button above to view your complete shipment
      tracking history and latest updates.
    </p>

    <hr />

    <p>
      Thank you for choosing SwiftRoute.
    </p>

  </div>
`,
  });
}