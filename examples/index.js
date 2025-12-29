/* eslint-disable no-undef */
document.getElementById('iframe').onload = () => {
  const inspector = new DomInspector.DomInspector({
    selected: [
      '/html[1]/body[1]/div[3]',
      '/html[1]/body[1]/div[1]/span[1]',
      '/html[1]/body[1]/div[10]/div[4]',
      '/html[1]/body[1]/div[9]/span[1]',
      '/html[1]/body[1]/iframe[1]',
      '/html[1]/body[1]/div[1]',
    ],
    onClick: (el) => {
      console.log(el);
    },
  });
  inspector.enable();
  inspector.enableSelected();
};
