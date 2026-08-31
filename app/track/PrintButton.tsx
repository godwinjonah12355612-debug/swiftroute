'use client'

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-print">
      🖨️ Print Receipt
    </button>
  )
}