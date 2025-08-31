self[`appKey`] = "0dfe2d2694bbb2135dd41c39eb43d34a";
self[`hostUrl`] = "https://cdn.gravitec.net/sw";
self.importScripts(`${self[`hostUrl`]}/worker.js`);
// uncomment and set path to your service worker
// if you have one with precaching functionality (has oninstall, onactivate event listeners)
// self.importScripts('path-to-your-sw-with-precaching')
