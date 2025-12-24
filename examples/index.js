/* eslint-disable no-undef */
document.getElementById('iframe').onload = () => {
  const inspector = new DomInspector.DomInspector({
    onClick: (el) => {
      console.log(el);
    },
  });
  inspector.enable();
};
