Template.popupvoter.helpers({
    votePercentage: function(number) {
        return parseInt(number) / 100
    },
})


Template.popupvoter.events({
    'click .item.votenetwork': function(event) {
        $('.votenetwork.tab').removeClass('active');
        $('.votenetwork.item').removeClass('active');
        $('.votenetwork.item.' + event.target.dataset.tab).addClass('active');
        $('.votenetwork.tab.' + event.target.dataset.tab).addClass('active');
    },
})