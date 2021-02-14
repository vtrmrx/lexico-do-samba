let sliderKing = tns({
  container: '.tns-king',
  items: 1,
  gutter: 24,
  nav: false,
  controls: false,
  edgePadding: 32,
  preventScrollOnTouch: 'auto',
  responsive: {
    992: {
      disable: true
    }
  }
});

let kingNavContainer = d3.select(".tns-king-nav");

d3.csv("../data/reis-das-palavras.csv").then( function(data) {

  let kingData = data;

  let kingNavButtons = kingNavContainer
    .selectAll("a").data(kingData)
    .enter().append("a")
      .attr("class", "tns-custom-nav__button")
      .text(function(d) {
        return d.palavra
      });

  kingNavButtons["_groups"][0][0].classList.add("active");

  kingNavButtons["_groups"][0].forEach((button, i) => {
    button.addEventListener('click', function (event) {
      sliderKing.goTo(i);
      document.querySelector(".tns-king-nav .tns-custom-nav__button.active").classList.remove("active");
      button.classList.add("active");
    });
  });

  sliderKing.events.on('indexChanged', function (event) {
    let slideIndex = event.displayIndex - 1;
    let lastSlideIndex = event.indexCached - event.cloneCount;
    let buttons = document.querySelectorAll(".tns-king-nav .tns-custom-nav__button");
    buttons[lastSlideIndex].classList.remove("active");
    buttons[slideIndex].classList.add("active");
  });

});
