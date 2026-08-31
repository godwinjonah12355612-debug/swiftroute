"use client";

import { useState } from "react";

export default function CopyTrackingButton({
  trackingNumber,
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          trackingNumber
        );
      } else {
        const textArea =
          document.createElement("textarea");

        textArea.value = trackingNumber;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand("copy");

        document.body.removeChild(textArea);
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to copy tracking number:",
        error
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
    >
      {copied
        ? "Tracking number copied!"
        : "Copy tracking number"}
    </button>
  );
}