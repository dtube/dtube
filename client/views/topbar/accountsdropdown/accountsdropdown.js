Template.accountsdropdown.rendered = () => {
    $('.dropdownaccounts').dropdown({
        
    })
}

Template.accountsdropdown.helpers({
    hasAnyLogins: () => {
        if (Session.get('activeUsernameSteem') || Session.get('activeUsername')) return true
        else return false
    },
    topbarAvatarUrl: () => {
        if (Session.get('activeUsername')) return 'https://image.d.tube/u/' + Session.get('activeUsername') + '/avatar'
        else if (Session.get('activeUsernameSteem')) return 'https://steemitimages.com/u/' + Session.get('activeUsernameSteem') + '/avatar'
        else return 'https://image.d.tube/u/null/avatar'
    },
    topbarUsername: () => {
        if (Session.get('activeUsername')) return Session.get('activeUsername')
        else if (Session.get('activeUsernameSteem')) return Session.get('activeUsernameSteem')
        else return ''
    }
})