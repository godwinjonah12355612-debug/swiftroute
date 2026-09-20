"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
};

export default function PackageMedia({ src, alt }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Support multiple media URLs separated by commas
  const mediaItems = src
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const isVideo = (url: string) => {
    const cleanUrl = url.split("?")[0].toLowerCase();

    return (
      cleanUrl.endsWith(".mp4") ||
      cleanUrl.endsWith(".webm") ||
      cleanUrl.endsWith(".mov")
    );
  };

  // If there is no media
  if (mediaItems.length === 0) {
    return null;
  }

  // Video
  if (isVideo(mediaItems[0])) {
    return (
      <div className="package-media-container">
        <video
          className="package-media"
          controls
          preload="metadata"
        >
          <source src={mediaItems[0]} />
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  // Photos
  return (
    <>
      <div className="package-media-grid">
        {mediaItems.slice(0, 2).map((image, index) => (
          <button
            key={image}
            type="button"
            className="package-image-button"
            onClick={() => setIsOpen(true)}
            aria-label={`View package image ${index + 1}`}
          >
            <img
              src={image}
              alt={`${alt} ${index + 1}`}
              className="package-media"
            />

            <span className="media-view-label">
              Click to view larger
            </span>
          </button>
        ))}
      </div>

      {isOpen && (
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

            <div className="media-modal-images">
              {mediaItems.slice(0, 2).map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt={`${alt} ${index + 1}`}
                  className="media-modal-image"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}