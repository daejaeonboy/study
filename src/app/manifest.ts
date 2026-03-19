import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "지능형 지식 라이브러리",
    short_name: "IKL",
    description: "이어지는 학습 경로를 설계하는 범용 지식 학습 플랫폼",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fff7ed",
    theme_color: "#c7642c",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
