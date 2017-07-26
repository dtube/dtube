Template.masterLayout.events({
   'click':function(event){
      if (event.target.id == 'dsearch' && event.target.value.length > 0) {
        $('.results').show()
      } else {
        $('.results').hide()
      }
   }
});
