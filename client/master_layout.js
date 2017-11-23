Template.masterLayout.events({
   'click':function(event){
      if (event.target.id == 'dsearch' && event.target.value.length > 0) {
        $('.results').show()
      } else {
        $('.results').hide()
      }
   }
});


// document.addEventListener('touchstart', handleTouchStart, false);        
// document.addEventListener('touchmove', handleTouchMove, false);

// var xDown = null;                                                        
// var yDown = null;                                                        

// function handleTouchStart(evt) {                                         
//     xDown = evt.touches[0].clientX;                                      
//     yDown = evt.touches[0].clientY;                                      
// };                                                

// function handleTouchMove(evt) {
//     if ( ! xDown || ! yDown ) {
//         return;
//     }

//     var xUp = evt.originalEvent.touches[0].clientX;                                    
//     var yUp = evt.originalEvent.touches[0].clientY;

//     var xDiff = xDown - xUp;
//     var yDiff = yDown - yUp;

//     if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
//         if ( xDiff > 0 ) {
//             /* left swipe */ 
//         } else {
//             /* right swipe */
//         }                       
//     } else {
//         if ( yDiff > 0 ) {
//             /* up swipe */ 
//         } else { 
//             /* down swipe */
//         }                                                                 
//     }
//     /* reset values */
//     xDown = null;
//     yDown = null;                                             
// };
