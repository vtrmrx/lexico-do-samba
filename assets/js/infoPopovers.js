document.addEventListener("DOMContentLoaded", function() {
  let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  let popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
      trigger: "focus",
      container: "body",
      boundary: "viewport",
      html: true,
      sanitize: false
    })
  });
  document.addEventListener('mousedown', event => {
    event.path.forEach(function(element, index) {
      if(element.classList && element.classList.contains('popover-body')) {
        event.preventDefault();
        return;
      }
    });
  });
});
