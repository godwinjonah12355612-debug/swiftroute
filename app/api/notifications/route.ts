import { NextResponse } from "next/server";
import { subscribeToShipmentUpdates } from "@/lib/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const trackingNumber = String(
      body.trackingNumber ?? ""
    ).trim();

    const email = String(
      body.email ?? ""
    )
      .trim()
      .toLowerCase();

    if (!trackingNumber || !email) {
      return NextResponse.json(
        {
          error: "Tracking number and email are required.",
        },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    subscribeToShipmentUpdates(
      trackingNumber,
      email
    );

    return NextResponse.json({
      success: true,
      message:
        "You are now subscribed to shipment updates.",
    });
  } catch (error) {
    console.error(
      "Notification subscription error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to subscribe. Please try again.",
      },
      { status: 500 }
    );
  }
}