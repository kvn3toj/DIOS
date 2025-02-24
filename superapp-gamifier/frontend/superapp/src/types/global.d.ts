interface Workbox {
  addEventListener: (event: string, callback: (event: any) => void) => void;
  register: () => Promise<void>;
}

declare global {
  interface Window {
    workbox: Workbox;
  }
}

export {};
