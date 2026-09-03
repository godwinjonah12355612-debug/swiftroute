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
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const trackingUrl =
    `${siteUrl}/track?number=${encodeURIComponent(
      data.trackingNumber
    )}`;

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
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SwiftRoute Shipment Update</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f7fb;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
">

  <div style="
    width: 100%;
    padding: 40px 15px;
    box-sizing: border-box;
  ">

    <div style="
      max-width: 620px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    ">

      <!-- HEADER -->
      <div style="
        background-color: #2563eb;
        padding: 28px 30px;
        text-align: center;
      ">

        <div style="
          font-size: 25px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.5px;
        ">
          SwiftRoute
        </div>

        <div style="
          margin-top: 6px;
          font-size: 13px;
          color: #dbeafe;
          letter-spacing: 1px;
          text-transform: uppercase;
        ">
          Shipment Tracking & Delivery
        </div>

      </div>


      <!-- MAIN CONTENT -->
      <div style="
        padding: 35px 30px;
      ">

        <p style="
          margin: 0 0 8px;
          font-size: 13px;
          font-weight: 700;
          color: #2563eb;
          letter-spacing: 1px;
          text-transform: uppercase;
        ">
          Shipment Update
        </p>

        <h1 style="
          margin: 0 0 15px;
          font-size: 28px;
          line-height: 1.3;
          color: #111827;
        ">
          Your shipment has been updated
        </h1>

        <p style="
          margin: 0 0 25px;
          font-size: 16px;
          line-height: 1.7;
          color: #4b5563;
        ">
          Your shipment
          <strong style="color: #111827;">
            ${data.trackingNumber}
          </strong>
          has a new tracking update.
        </p>


        <!-- TRACKING NUMBER -->
        <div style="
          background-color: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 18px 20px;
          margin-bottom: 25px;
        ">

          <div style="
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 6px;
          ">
            Tracking Number
          </div>

          <div style="
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            letter-spacing: 0.5px;
          ">
            ${data.trackingNumber}
          </div>

        </div>


        <!-- SHIPMENT STATUS -->
        <div style="
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 25px;
        ">

          <!-- STATUS -->
          <div style="
            padding: 18px 20px;
            border-bottom: 1px solid #e5e7eb;
          ">

            <div style="
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.7px;
              margin-bottom: 7px;
            ">
              Current Status
            </div>

            <div style="
              display: inline-block;
              background-color: #dbeafe;
              color: #1d4ed8;
              padding: 7px 13px;
              border-radius: 999px;
              font-size: 14px;
              font-weight: 700;
            ">
              ${data.status}
            </div>

          </div>


          <!-- LOCATION -->
          <div style="
            padding: 18px 20px;
            border-bottom: 1px solid #e5e7eb;
          ">

            <div style="
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.7px;
              margin-bottom: 7px;
            ">
              Current Location
            </div>

            <div style="
              font-size: 16px;
              font-weight: 600;
              color: #111827;
            ">
              📍 ${data.location}
            </div>

          </div>


          <!-- DELIVERY -->
          <div style="
            padding: 18px 20px;
          ">

            <div style="
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.7px;
              margin-bottom: 7px;
            ">
              Estimated Delivery
            </div>

            <div style="
              font-size: 16px;
              font-weight: 600;
              color: #111827;
            ">
              📅 ${data.estimatedDelivery}
            </div>

          </div>

        </div>


        <!-- UPDATE NOTE -->
        <div style="
          background-color: #eff6ff;
          border-left: 4px solid #2563eb;
          padding: 18px 20px;
          margin-bottom: 30px;
          border-radius: 0 10px 10px 0;
        ">

          <div style="
            font-size: 12px;
            color: #1d4ed8;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.7px;
            margin-bottom: 8px;
          ">
            Latest Update
          </div>

          <div style="
            font-size: 15px;
            line-height: 1.7;
            color: #374151;
          ">
            ${data.note}
          </div>

        </div>


        <!-- TRACKING BUTTON -->
        <div style="
          text-align: center;
          margin: 35px 0;
        ">

          <a
            href="${trackingUrl}"
            style="
              display: inline-block;
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              padding: 15px 28px;
              border-radius: 9px;
              font-size: 16px;
              font-weight: 700;
              box-shadow: 0 4px 10px rgba(37,99,235,0.25);
            "
          >
            🔎 View Shipment Tracking
          </a>

        </div>


        <p style="
          margin: 0;
          text-align: center;
          font-size: 14px;
          line-height: 1.7;
          color: #6b7280;
        ">
          Click the button above to view your complete shipment
          tracking history and the latest information about your delivery.
        </p>

      </div>


      <!-- FOOTER -->
      <div style="
        background-color: #f8fafc;
        border-top: 1px solid #e5e7eb;
        padding: 25px 30px;
        text-align: center;
      ">

        <div style="
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        ">
          SwiftRoute
        </div>

        <p style="
          margin: 0 0 10px;
          font-size: 13px;
          line-height: 1.6;
          color: #6b7280;
        ">
          Thank you for choosing SwiftRoute for your shipment.
        </p>

        <p style="
          margin: 0;
          font-size: 12px;
          color: #9ca3af;
        ">
          This is an automated shipment notification.
          Please do not reply directly to this email.
        </p>

      </div>

    </div>

  </div>

</body>
</html>
`,
  });
}