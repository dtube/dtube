Template.circularprogressbar.rendered = function () {
  $('head style[type="text/css"]').attr('type', 'text/less');
  less.refreshStyles();

    $('.radial-progress').attr('data-progress', 40);
  
}
