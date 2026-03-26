const STATUS_ID = "ikl-stale-sw-recovery";

function renderStatus(message: string) {
  const markup = `
    <div id="${STATUS_ID}" style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f8fafc;color:#0f172a;font-family:'Noto Sans KR',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:460px;padding:24px 28px;border:1px solid rgba(148,163,184,0.25);border-radius:18px;background:rgba(255,255,255,0.96);box-shadow:0 18px 40px rgba(15,23,42,0.08);">
        <strong style="display:block;font-size:1rem;margin-bottom:10px;">브라우저 캐시를 정리하는 중입니다.</strong>
        <p style="margin:0;font-size:0.94rem;line-height:1.7;color:#475569;">${message}</p>
      </div>
    </div>
  `;

  if (document.body) {
    document.body.innerHTML = markup;
    return;
  }

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      document.body.innerHTML = markup;
    },
    { once: true },
  );
}

async function recoverFromStaleServiceWorker() {
  renderStatus("이전 localhost 앱의 서비스워커를 지우고 새 화면으로 다시 연결하고 있어요.");

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)));
  }

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => {
        const normalized = cacheName.toLowerCase();

        if (
          normalized.includes("workbox") ||
          normalized.includes("vite") ||
          normalized.includes("pwa") ||
          normalized.includes("localhost")
        ) {
          return caches.delete(cacheName).catch(() => false);
        }

        return Promise.resolve(false);
      }),
    );
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("__recovered", Date.now().toString());
  window.location.replace(nextUrl.toString());
}

void recoverFromStaleServiceWorker().catch(() => {
  renderStatus("자동 복구에 실패했습니다. 브라우저에서 localhost:3000 사이트 데이터를 지운 뒤 다시 열어주세요.");
});
