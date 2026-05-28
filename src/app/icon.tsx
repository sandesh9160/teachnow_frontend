import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

// Fallback icon — actual favicon is served from /public/favicon.svg via layout.tsx metadata
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
          borderRadius: 7,
          color: "white",
          fontSize: 16,
          fontWeight: 800,
        }}
      >
        T
      </div>
    ),
    size
  );
}
