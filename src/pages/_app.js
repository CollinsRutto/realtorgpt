import React, { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  // Service worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('ServiceWorker registration successful');
          })
          .catch(error => {
            console.log('ServiceWorker registration failed: ', error);
          });
      });
    }
  }, []);

  // Service worker is properly registered above, no need for additional useEffect hooks

  return <Component {...pageProps} />;
}

export default MyApp;