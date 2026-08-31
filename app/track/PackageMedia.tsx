"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
};

export default function PackageMedia({ src, alt }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const isVideo =
    src.toLowerCase().endsWith(".mp4") ||
    src.toLowerCase().endsWith(".webm") ||
    src.toLowerCase().endsWith(".mov");

  return (
    <>
      <div className="package-media-container">
        {isVideo ? (
          <video
            className="package-media"
            controls
            preload="metadata"
          >
            <source src={src} />
            Your browser does not support video playback.
          </video>
        ) : (
          <button
            type="button"
            className="package-image-button"
            onClick={() => setIsOpen(true)}
            aria-label="View package image"
          >
            <img
              src={src}
              alt={alt}
              className="package-media"
            />

            <span className="media-view-label">
              Click to view larger
            </span>
          </button>
        )}
      </div>

      {isOpen && !isVideo && (
        <div
          className="media-modal"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="media-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="media-close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close image"
            >
              ×
            </button>

            <img
              src={src}
              alt={alt}
              className="media-modal-image"
            />
          </div>
        </div>
      )}
    </>
  );
}