import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

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
          borderRadius: "28%",
          background:
            "radial-gradient(circle at 30% 28%, #ffe7cf 0%, #f4b178 34%, #de8554 64%, #12222d 100%)",
          color: "#fff8ef",
          fontFamily: "serif",
          fontSize: 220,
          fontWeight: 700,
          letterSpacing: "-0.08em",
          boxShadow: "inset 0 0 0 14px rgba(255, 248, 239, 0.24)",
        }}
      >
        IKL
      </div>
    ),
    size,
  );
}
