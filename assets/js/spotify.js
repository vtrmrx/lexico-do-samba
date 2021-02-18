document.addEventListener("DOMContentLoaded", function() {

  let sliderSpotify = tns({
    container: '.tns-spotify',
    items: 1,
    gutter: 24,
    nav: false,
    controls: false,
    edgePadding: 32,
    loop: false,
    preventScrollOnTouch: 'auto',
    responsive: {
      768: {
        items: 3
      },
      992: {
        items: 4
      }
    }
  });

  let spotifyNavContainer = d3.select(".tns-spotify-nav");

  let spotifyLabels = ["Samba", "Samba-raiz", "Pagode", "Samba-enredo"];

  let spotifyNavButtons = spotifyNavContainer
    .selectAll("a").data(spotifyLabels)
    .enter().append("a")
      .attr("class", "tns-custom-nav__button")
      .text(function(d) {
        return d
      });

  spotifyNavButtons["_groups"][0][0].classList.add("active");

  spotifyNavButtons["_groups"][0].forEach((button, i) => {
    button.addEventListener('click', function (event) {
      sliderSpotify.goTo(i);
      document.querySelector(".tns-spotify-nav .tns-custom-nav__button.active").classList.remove("active");
      button.classList.add("active");
    });
  });

  sliderSpotify.events.on('indexChanged', function (event) {
    let slideIndex = event.displayIndex - 1;
    let lastSlideIndex = event.indexCached - event.cloneCount;
    let buttons = document.querySelectorAll(".tns-spotify-nav .tns-custom-nav__button");
    buttons[lastSlideIndex].classList.remove("active");
    buttons[slideIndex].classList.add("active");
  });

});
