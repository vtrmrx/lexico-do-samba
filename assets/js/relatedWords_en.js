document.addEventListener("DOMContentLoaded", function() {

  let relatedTermsContainer = d3.select("#relatedTermsContainer");
  let relatedTermsNavContainer = d3.select(".tns-related-terms-nav");

  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  d3.json("../data/palavras-relacionadas_en.json").then( function(data) {

    let relatedTermsNavButtons = relatedTermsNavContainer
      .selectAll("a").data(data)
      .enter().append("a")
        .attr("class", "tns-custom-nav__button")
        .text(function(d) {
          return d.palavra
        });

    relatedTermsNavButtons["_groups"][0][0].classList.add("active");

    let termsContainers = relatedTermsContainer
      .selectAll("div").data(data)
      .enter().append("div")
        .attr("class", "col-lg-4")
        .append("svg")
          .style("width", "100%")
          .attr("viewBox", "0 0 800 800")
          .attr("class", "related-words-cloud");

    let sliderRelatedTerms = tns({
      container: '.tns-related-terms',
      items: 1,
      gutter: 24,
      nav: false,
      controlsText: ["",""],
      edgePadding: 32,
      preventScrollOnTouch: 'auto',
      responsive: {
        992: {
          disable: true
        }
      }
    });

    relatedTermsNavButtons["_groups"][0].forEach((button, i) => {
      button.addEventListener('click', function (event) {
        sliderRelatedTerms.goTo(i);
        document.querySelector(".tns-related-terms-nav .tns-custom-nav__button.active").classList.remove("active");
        button.classList.add("active");
      });
    });

    sliderRelatedTerms.events.on('indexChanged', function (event) {
      let slideIndex = event.displayIndex - 1;
      let lastSlideIndex = event.indexCached - event.cloneCount;
      let buttons = document.querySelectorAll(".tns-related-terms-nav .tns-custom-nav__button");
      buttons[lastSlideIndex].classList.remove("active");
      buttons[slideIndex].classList.add("active");
    });

    termsContainers["_groups"][0].forEach((containerElement, i) => {

      let circleFill;
      if (i % 2 == 0) {
        circleFill = "#FFA1BC";
      } else {
        circleFill = "#F94926";
      }

      let container = d3.select(containerElement);

      let circlesContainer = container.append("g").attr("class", "related-words-circles");
      let labelsContainer = container.append("g").attr("class", "related-words-labels");
      let relatedWords = data[i].relacionadas;

      let wordCount = relatedWords.length;

      let domainMax = relatedWords[0]["Valor"];
      let domainMin = relatedWords[wordCount - 1]["Valor"];

      let scaleSize = d3.scaleLinear().domain([domainMin, domainMax]).range([60, 120]);

      let termsTexts = container.append("text")
        .text(data[i].palavra)
        .attr("fill", "white")
        .attr("x", 400)
        .attr("y", 400)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-weight", "900")
        .attr("font-size", "120px")
        .attr("class", "related-words-term")
        .style("pointer-events", "none")
        .style("font-family", "'braveold', Georgia, serif");

      let circles = circlesContainer
        .selectAll("circle").data(data[i].relacionadas)
        .enter().append("circle")
          .attr("fill", circleFill)
          .attr("r", function(d) {
            return scaleSize(d.Valor)
          })
          .attr("cx", 400)
          .attr("cy", 400)
          .attr("data-word", function(d) {
            return d.Palavra;
          });

      let labels = labelsContainer
        .selectAll("text").data(data[i].relacionadas)
        .enter().append("text")
          .text(function(d) {
            return d.Palavra;
          })
          .attr("fill", "#025920")
          .attr("x", 400)
          .attr("y", 400)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .attr("font-weight", "900")
          .attr("font-size", "32px")
          .style("pointer-events", "none")
          .style("font-family", "'Source Sans Pro', Arial, Helvetica, sans-serif")
          .attr("font-size", function (d, index) {
            let areaUtil = circles["_groups"][0][index].getBBox().width - 20,
                boundingBox = labelsContainer.selectAll("text")["_groups"][0][index].getBBox().width,
                aproveitamento = boundingBox / areaUtil,
                novoCorpo = 16 / aproveitamento;
            if (novoCorpo < 0) {
              return "0"
            } else if (novoCorpo > 32) {
              return "32px";
            } else {
              return `${(16 / aproveitamento)}px`
            }
          });

      let simulation = d3.forceSimulation(circles).on("tick", function(d){
        circles
          .attr("cx", function(d) {
            return d.x;
          })
          .attr("cy", function(d) {
            return d.y;
          });
        labels
          .attr("x", function(d) {
            return d.x;
          })
          .attr("y", function(d) {
            return d.y;
          });
      });

      simulation.nodes(data[i].relacionadas)
        .alpha(1).alphaTarget(0)
        .force("center", d3.forceCenter().x(400).y(400))
        .force("collide", d3.forceCollide().strength(.2).radius(function(d){
          return scaleSize(d.Valor) + 1
        })
        .iterations(1));

    });

  });

});
