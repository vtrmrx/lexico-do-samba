document.addEventListener("DOMContentLoaded", function() {
  let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  let popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  })
});
