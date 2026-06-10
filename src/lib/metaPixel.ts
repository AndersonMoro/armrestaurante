declare global {
  interface Window {
    fbq?: MetaPixelFn;
    _fbq?: MetaPixelFn;
  }
}

type MetaPixelFn = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  push?: MetaPixelFn;
  loaded?: boolean;
  version?: string;
  queue: unknown[];
};

const pixelId = import.meta.env.VITE_META_PIXEL_ID;
let initialized = false;

export function initMetaPixel() {
  if (!pixelId || initialized || typeof window === "undefined") return;

  if (!window.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue.push(args);
      }
    }) as MetaPixelFn;

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [] as unknown[];

    window.fbq = fbq as typeof window.fbq;
    window._fbq = window.fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  window.fbq?.("init", pixelId);
  initialized = true;
}

export function trackMetaPageView() {
  if (!pixelId || typeof window === "undefined") return;

  initMetaPixel();
  window.fbq?.("track", "PageView");
}

export function trackMetaEvent(eventName: string, payload?: Record<string, unknown>) {
  if (!pixelId || typeof window === "undefined") return;

  initMetaPixel();
  window.fbq?.("track", eventName, payload);
}
