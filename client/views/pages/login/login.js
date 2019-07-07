Template.login.rendered = function() {
  $('.menu .item')
  .tab();
  if (FlowRouter.getParam('network') == 'dtube')
    $("#dtube-tab").click()
  if (FlowRouter.getParam('network') == 'steem')
    $("#steem-tab").click()
}