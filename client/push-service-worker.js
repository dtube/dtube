// 'use strict';

// function endpointWorkaround(pushSubscription) {
//   // Make sure we only mess with GCM
//   if (pushSubscription.endpoint.indexOf('https://android.googleapis.com/gcm/send') !== 0) {
//     return pushSubscription.endpoint;
//   }

//   var mergedEndpoint = pushSubscription.endpoint;
//   // Chrome 42 + 43 will not have the subscriptionId attached
//   // to the endpoint.
//   if (pushSubscription.subscriptionId &&
//     pushSubscription.endpoint.indexOf(pushSubscription.subscriptionId) === -1) {
//     // Handle version 42 where you have separate subId and Endpoint
//     mergedEndpoint = pushSubscription.endpoint + '/' +
//       pushSubscription.subscriptionId;
//   }

//   var endpointSections = mergedEndpoint.split('/');
//   var subscriptionId = endpointSections[endpointSections.length - 1];
//   return subscriptionId;
// };

// function messageListener(event) {
//   console.log('messageListener', event.data);
//   switch(event.data.type) {
//     case 'SET_USER':
//       try {
//         var user = event.data.user;
//         self.token = user.services.resume.loginTokens.pop().hashedToken;
//         event.ports[0].postMessage(self.token);
//       } catch (e) {
//         console.log(e);
//         event.ports[0].postMessage({error: e});
//       }
//       break;
//     default:
//       event.ports[0].postMessage(event.data);
//       break;
//   }
// };

// function pushListener(event) {
//   console.log('Received a push message', event);
//   console.log('token', self.token);
//   if (!self.token) {
//     return;
//   }

//   event.waitUntil(
//     self.registration.pushManager.getSubscription()
//       .then(function(subscription) {
//         console.log('subscription', subscription);
//         console.log('subscriptionId', endpointWorkaround(subscription));
//         fetch('/methods/getNotification', {
//           method: 'post',
//           headers: {
//             'Authorization': 'Bearer ' + self.token,
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             subscriptionId: endpointWorkaround(subscription),
//           }),
//         })
//         .then(function(response) {
//           return response.json();
//         })
//         .then(function(notification) {
//           var notificationObject = {
//             body: notification.data.body,
//             icon: notification.data.icon,
//             tag: notification._id,
//             data: '/room/' + notification.data.room,
//           };
//           console.log(notificationObject);
//           self.registration.showNotification(notification.data.title, notificationObject);
//         })
//         .catch(function(err) {
//           console.log('err');
//           console.log(err);
//         });
//       })
//   );
// };

// function notificationClickListener(event) {
//   // Android doesn’t close the notification when you click on it
//   // See: http://crbug.com/463146
//   event.notification.close();

//   console.log(event.notification);

//   // This looks to see if the current is already open and
//   // focuses if it is
//   event.waitUntil(clients.matchAll({
//     type: 'window',
//   }).then(function(clientList) {
//     console.log('clientList', clientList);
//     var client = null;
//     for (var i = 0; i < clientList.length; i++) {
//       var client = clientList[i];
//       console.log('client', client);
//       if ('focus' in client) {
//         // TODO: just focus client
//         // sendMessage that will force router to change instead of page reload
//         return client.navigate(event.notification.data)
//           .then(function(client) {
//             return client.focus();
//           });
//       }
//     }

//     return clients.openWindow(event.notification.data);
//   }));
// };

// self.addEventListener('message', messageListener);
// self.addEventListener('notificationclick', notificationClickListener);
// self.addEventListener('push', pushListener);

// self.addEventListener('install', function(event) {
//   console.log('Service Worker installing.');
//   event.waitUntil(self.skipWaiting()); // Activate worker immediately
// });

// self.addEventListener('activate', function(event) {
//   console.log('Service Worker activating.');  
//   event.waitUntil(self.clients.claim()); // Become available to all pages
// });