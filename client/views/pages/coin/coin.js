Template.coin.helpers({
  coinSupply: function() {
    return (Math.round(Session.get('coinSupply'))/100).toLocaleString()
  },
  coinMarketcap: function() {
    let mc = Session.get('coinPrice') * Session.get('coinSupply') / 100;
    mc = formatter.format(mc)
    return mc
  }
})

Template.coin.events({

})

var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});
