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

  // Remove this empty useEffect as it's not doing anything
  // useEffect(() => {
  //   // Your code that was previously at the top level
  //   // For example, registering service worker or analytics
  // }, []);

  return <Component {...pageProps} />;
}

export default MyApp;