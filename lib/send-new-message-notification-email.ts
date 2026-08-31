import { brevo } from "@/lib/brevo";

type NewMessageNotificationData = {
  email: string;
  shipmentSenderName: string;
  customerName: string;
  customerEmail: string;
  trackingNumber: string;
  message: string;
};

export async function sendNewMessageNotificationEmail(
  data: NewMessageNotificationData
) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!senderEmail) {
    throw new Error(
      "BREVO_SENDER_EMAIL is missing from .env.local"
    );
  }

  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: "SwiftRoute Support",
      email: senderEmail,
    },

    to: [
      {
        email: data.email,
        name: "SwiftRoute Admin",
      },
    ],

    subject: `New customer message - ${data.trackingNumber}`,

    htmlContent: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      ">
        <h2 style="color: #2563eb;">
          New customer message received
        </h2>

        <p>
          Hello <strong>SwiftRoute Admin</strong>,
        </p>

        <p>
          A customer has sent a new message regarding a shipment.
        </p>

        <p>
          <strong>Tracking number:</strong>
          ${data.trackingNumber}
        </p>

        <p>
          <strong>Customer name:</strong>
          ${data.customerName}
        </p>

        <p>
          <strong>Customer email:</strong>
          ${data.customerEmail}
        </p>

        <p>
          <strong>Message:</strong>
        </p>

        <div style="
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          white-space: pre-wrap;
        ">
          ${data.message}
        </div>

        <br />

        <p>
          Please log in to the SwiftRoute administration
          dashboard to reply to this customer.
        </p>

        <hr />

        <p>
          <strong>SwiftRoute Support</strong>
        </p>
      </div>
    `,
  });
}