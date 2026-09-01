"use client";

type DeleteShipmentButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  trackingNumber: string;
};

export default function DeleteShipmentButton({
  action,
  trackingNumber,
}: DeleteShipmentButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Are you sure you want to delete this shipment?"
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input
        type="hidden"
        name="trackingNumber"
        value={trackingNumber}
      />

      <button
        type="submit"
        className="delete-button"
      >
        Delete shipment
      </button>
    </form>
  );
}