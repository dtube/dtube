Template.registerHelper('equals', function (one, two) {
  if (one == two) return true;
  return false;
});

Template.registerHelper('customSyntax', function (description) {
  if (!description) return;
  return description.replace(/(?:\r\n|\r|\n)/g, '<br />');
});
