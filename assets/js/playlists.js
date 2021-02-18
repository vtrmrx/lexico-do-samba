document.addEventListener("DOMContentLoaded", function() {

  let sliderPlaylists = tns({
    container: '.tns-playlists',
    items: 1,
    gutter: 24,
    nav: false,
    controls: false,
    edgePadding: 32,
    loop: false,
    preventScrollOnTouch: 'auto',
    responsive: {
      768: {
        disable: true
      }
    }
  });

  let playlistsNavContainer = d3.select(".tns-playlists-nav");

  let playlistLabels = ["Samba", "Samba-raiz", "Pagode", "Samba-enredo"];

  let playlistsNavButtons = playlistsNavContainer
    .selectAll("a").data(playlistLabels)
    .enter().append("a")
      .attr("class", "tns-custom-nav__button")
      .text(function(d) {
        return d
      });

  playlistsNavButtons["_groups"][0][0].classList.add("active");

  playlistsNavButtons["_groups"][0].forEach((button, i) => {
    button.addEventListener('click', function (event) {
      sliderPlaylists.goTo(i);
      document.querySelector(".tns-playlists-nav .tns-custom-nav__button.active").classList.remove("active");
      button.classList.add("active");
    });
  });

  sliderPlaylists.events.on('indexChanged', function (event) {
    let slideIndex = event.displayIndex - 1;
    let lastSlideIndex = event.indexCached - event.cloneCount;
    let buttons = document.querySelectorAll(".tns-playlists-nav .tns-custom-nav__button");
    buttons[lastSlideIndex].classList.remove("active");
    buttons[slideIndex].classList.add("active");
  });

});
