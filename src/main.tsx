// Polyfill/guard para evitar 'Cannot set property fetch of #<Window> which has only a getter'
if (typeof window !== 'undefined') {
  try {
    const rawFetch = window.fetch;
    let activeFetch = function (...args: Parameters<typeof fetch>) {
      return rawFetch.apply(window, args);
    };

    const desc = {
      configurable: true,
      enumerable: true,
      get: () => activeFetch,
      set: (fn: any) => {
        if (typeof fn === 'function') activeFetch = fn;
      },
    };

    try {
      Object.defineProperty(window, 'fetch', desc);
    } catch {}

    if (typeof Window !== 'undefined' && Window.prototype) {
      try {
        Object.defineProperty(Window.prototype, 'fetch', desc);
      } catch {}
    }
  } catch {}
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
