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
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New SwiftRoute Customer Message</title>
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
          Administration Notification
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
          New Customer Message
        </p>

        <h1 style="
          margin: 0 0 15px;
          font-size: 27px;
          line-height: 1.3;
          color: #111827;
        ">
          A customer contacted SwiftRoute
        </h1>

        <p style="
          margin: 0 0 28px;
          font-size: 16px;
          line-height: 1.7;
          color: #4b5563;
        ">
          A new customer message has been received regarding a shipment.
          Please review the details below.
        </p>


        <!-- TRACKING NUMBER -->
        <div style="
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          padding: 18px 20px;
          margin-bottom: 25px;
        ">

          <div style="
            font-size: 12px;
            color: #1d4ed8;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 7px;
            font-weight: 700;
          ">
            Tracking Number
          </div>

          <div style="
            font-size: 21px;
            font-weight: 700;
            color: #111827;
            letter-spacing: 0.5px;
          ">
            ${data.trackingNumber}
          </div>

        </div>


        <!-- CUSTOMER INFORMATION -->
        <div style="
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 25px;
        ">

          <div style="
            background-color: #f8fafc;
            padding: 14px 20px;
            border-bottom: 1px solid #e5e7eb;
          ">

            <strong style="
              font-size: 14px;
              color: #111827;
            ">
              Customer Information
            </strong>

          </div>


          <!-- CUSTOMER NAME -->
          <div style="
            padding: 17px 20px;
            border-bottom: 1px solid #e5e7eb;
          ">

            <div style="
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.7px;
              margin-bottom: 6px;
            ">
              Customer Name
            </div>

            <div style="
              font-size: 16px;
              font-weight: 600;
              color: #111827;
            ">
              ${data.customerName}
            </div>

          </div>


          <!-- CUSTOMER EMAIL -->
          <div style="
            padding: 17px 20px;
          ">

            <div style="
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.7px;
              margin-bottom: 6px;
            ">
              Customer Email
            </div>

            <div style="
              font-size: 16px;
              font-weight: 600;
              color: #2563eb;
              word-break: break-word;
            ">
              ${data.customerEmail}
            </div>

          </div>

        </div>


        <!-- CUSTOMER MESSAGE -->
        <div style="
          margin-bottom: 30px;
        ">

          <div style="
            font-size: 13px;
            font-weight: 700;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.7px;
            margin-bottom: 10px;
          ">
            Customer Message
          </div>

          <div style="
            background-color: #f8fafc;
            border: 1px solid #e5e7eb;
            border-left: 4px solid #2563eb;
            border-radius: 0 10px 10px 0;
            padding: 20px;
            font-size: 15px;
            line-height: 1.8;
            color: #374151;
            white-space: pre-wrap;
            word-break: break-word;
          ">
            ${data.message}
          </div>

        </div>


        <!-- ACTION NOTICE -->
        <div style="
          background-color: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 12px;
          padding: 18px 20px;
          margin-bottom: 30px;
        ">

          <div style="
            font-size: 14px;
            font-weight: 700;
            color: #9a3412;
            margin-bottom: 6px;
          ">
            Action Required
          </div>

          <div style="
            font-size: 14px;
            line-height: 1.7;
            color: #7c2d12;
          ">
            Please log in to the SwiftRoute administration dashboard
            to review and reply to this customer.
          </div>

        </div>


        <!-- FOOTER -->
        <div style="
          border-top: 1px solid #e5e7eb;
          padding-top: 22px;
          text-align: center;
        ">

          <div style="
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 7px;
          ">
            SwiftRoute Support
          </div>

          <p style="
            margin: 0;
            font-size: 12px;
            line-height: 1.6;
            color: #9ca3af;
          ">
            Automated administration notification
          </p>

        </div>

      </div>

    </div>

  </div>

</body>
</html>
`,
  });
}