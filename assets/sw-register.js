// Registers the offline service worker that lives at the site root.
(function () {
  if (!('serviceWorker' in navigator)) return;
  var here = document.currentScript && document.currentScript.src;
  if (!here) return;
  var swUrl = new URL('../sw.js', here);
  var scope = new URL('../', here);
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(swUrl.href, { scope: scope.pathname }).catch(function () {});
  });
})();
