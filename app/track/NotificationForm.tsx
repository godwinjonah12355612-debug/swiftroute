"use client";

import { useState } from "react";

type Props = {
  trackingNumber: string;
};

export default function NotificationForm({
  trackingNumber,
}: Props) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingNumber,
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Unable to subscribe. Please try again."
        );
        return;
      }

      setMessage(
        `Shipment updates for ${trackingNumber} will be sent to ${email.trim()}.`
      );

      setEmail("");
    } catch (error) {
      console.error(
        "Notification subscription request failed:",
        error
      );

      setMessage(
        "Unable to subscribe. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="notification-form"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        value={email}
        onChange={(event) =>
          setEmail(event.target.value)
        }
        placeholder="Enter your email address"
        className="notification-input"
        required
        disabled={loading}
      />

      <button
        type="submit"
        className="notification-button"
        disabled={loading}
      >
        {loading
          ? "Subscribing..."
          : "🔔 Get shipment updates"}
      </button>

      {message && (
        <p className="notification-message">
          {message}
        </p>
      )}
    </form>
  );
}