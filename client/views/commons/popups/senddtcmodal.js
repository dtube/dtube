Template.senddtcmodal.helpers({
    recipient: function(){
        if (this.author) return this.author
        if (this.name) return this.name
    }
})