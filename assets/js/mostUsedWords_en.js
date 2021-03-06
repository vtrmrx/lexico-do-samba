document.addEventListener("DOMContentLoaded", function() {

  let viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
      containerWidth = document.getElementById("mostUsedViz").offsetWidth,
      aspectRatio = (viewportHeight > viewportWidth) ? 1 : viewportHeight / viewportWidth,
      svgWidth = containerWidth,
      svgHeight = svgWidth * aspectRatio;

  let svg = d3.select("#mostUsedViz")
              .append("svg")
              .style("width", "100%")
              .style("overflow", "visible")
              .attr("viewBox", `0 0 ${svgWidth} ${Math.round(svgHeight)}`);

  svg.append("g").attr("class", "circle-nodes");
  svg.append("g").attr("class", "label-nodes");

  d3.csv("../data/palavras-mais-usadas_en.csv").then( function(data) {

    let dataSet = data,
        rangeMin = ( containerWidth > 700 ) ? containerWidth / 40 : containerWidth / 20 ,
        rangeMax = ( containerWidth > 700 ) ? containerWidth / 8 : containerWidth / 6;

    let Tooltip = d3.select("#mostUsedViz")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip-most-used");

    setNodes(dataSet, svg, rangeMin, rangeMax, aspectRatio, Tooltip);

    let filtersContainer = d3.select("[data-filter-desktop]");

    let filters = filtersContainer.selectAll("[data-filter-dynamic]");

    let availableOptions = setFilterOptions(dataSet, filters);

    setFilters(availableOptions, filtersContainer);

    let filterTabs = document.querySelectorAll('#mostUsedTabs button[data-bs-toggle="tab"]');
    filterTabs.forEach(tab => tab.addEventListener('show.bs.tab', function (event) {
      filters["_groups"][0].forEach(function(filter, index) {
        filter.value = "all";
      });
      updateFilters("desktop", dataSet, filtersContainer, rangeMin, rangeMax, aspectRatio, Tooltip);
    }));

    filters.on("change", function() {
      updateFilters("desktop", dataSet, filtersContainer, rangeMin, rangeMax, aspectRatio, Tooltip);
    });

    let resizeTimeout;
    window.addEventListener("resize", function(event) {
      let newViewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      if ( newViewportWidth !== viewportWidth ) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function(){
          containerWidth = document.getElementById("mostUsedViz").offsetWidth,
          viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
          viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
          aspectRatio = (viewportHeight > viewportWidth) ? 1 : viewportHeight / viewportWidth,
          svgWidth = containerWidth,
          svgHeight = svgWidth * aspectRatio,
          rangeMin = ( containerWidth > 700 ) ? containerWidth / 40 : containerWidth / 20 ,
          rangeMax = ( containerWidth > 700 ) ? containerWidth / 8 : containerWidth / 6;
          svg.attr("viewBox", `0 0 ${svgWidth} ${ Math.round(svgHeight) }`);
          updateFilters("desktop", dataSet, filtersContainer, rangeMin, rangeMax, aspectRatio, Tooltip);
          viewportWidth = newViewportWidth;
        }, 1500);
      }
    });

  });

  function sortBy(arr, prop) {
    return arr.sort((a, b) => b[prop] - a[prop]);
  }

  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  function setFilterOptions(data, filters) {
    let filterOptions = [];
    filters["_groups"][0].forEach(function(filter, index) {
      let optionKey = filter.getAttribute("data-filter-key");
      let optionList = [...new Set(data.map(item => item[optionKey]))];
      optionList = optionList.filter(option => option!=="");
      optionList.sort();
      filterOptions.push({key: optionKey, values: optionList});
    });
    return filterOptions;
  }

  function setFilters(filtersData, filtersContainer) {
    filtersData.forEach(function(filter, i) {
      filtersContainer.select(`[data-filter-key="${filter.key}"]`)
        .selectAll("option:not([value=all])").data(filter.values)
        .enter().append("option")
          .text(function(d) { return d });
    });
  }

  function updateFilters(eventSource, dataSet, filtersContainer, rangeMin, rangeMax, aspectRatio, Tooltip) {
    let dataSubset = dataSet;
    let filterArray = [],
        filterTarget = filtersContainer,
        filters = filterTarget.selectAll("[data-filter-dynamic]"),
        filterName = filterTarget.select('[data-filter-key="Nome"]'),
        filterNameValue = filterName["_groups"][0][0].value;
    if (filterNameValue !== "all") {
      dataSubset = dataSubset.filter(function( obj ) {
        return obj["Nome"] == filterNameValue;
      });
      filters["_groups"][0].forEach(function(filter, index) {
        let filterKey = filter.getAttribute("data-filter-key");
        if(filterKey !== "Nome") {
          filter.value = "all";
        }
      });
    } else {
      filters["_groups"][0].forEach(function(filter, index) {
        let filterKey = filter.getAttribute("data-filter-key");
        if (filter.value !== "all") {
          dataSubset = dataSubset.filter(function( obj ) {
            return obj[filterKey] == filter.value;
          });
        }
      });
    }
    let svgContainer = document.getElementById("mostUsedViz");
    if (svgContainer.classList.contains('no-results')) {
      svgContainer.classList.remove('no-results');
    }
    let n = dataSubset.length;
    if(n > 0) {
      resetNodes(dataSubset, svg, rangeMin, rangeMax, aspectRatio, Tooltip);
    } else {
      if (!svgContainer.classList.contains('no-results')) {
        svgContainer.classList.add('no-results');
      }
    }
  }

  function sortWords(data) {
    let filteredData = data,
        filteredWords = [...new Set(filteredData.map( function(item) {
          return item.Palavra;
        }))],
        quantifiedWords = [];
    let filteredNonEmptyWords = filteredWords.filter(function(value, index, array){
      return value !== "";
    });
    filteredNonEmptyWords.forEach(function(word){
      let wordValue = 0;
      filteredData.filter(function(d) {
        if( d["Palavra"] == word) {
          wordValue = wordValue + parseInt(d["Quantidade_y"]);
        }
      });
      quantifiedWords.push({name: word, size: wordValue});
    });
    let sortedWords = sortBy(quantifiedWords, 'size');
    sortedWords.length = (sortedWords.length > 30) ? 30 : sortedWords.length;
    return sortedWords;
  }

  function setNodes(data, svg, rangeMin, rangeMax, aspectRatio, Tooltip) {

    let mouseover = function(d) {
      Tooltip
        .style("opacity", 1)
    }

    let mousemove = function(d) {
      let thisData = d3.select(this).data()[0];
      Tooltip
        .html(`<p class="tooltip-most-used__word">${thisData.name}</p><p class="tooltip-most-used__value">${thisData.size} ocurrences</p>`)
        .style("left", (d3.pointer(d)[0]) + "px")
        .style("top", (d3.pointer(d)[1]) + "px");
    }

    let mouseleave = function(d) {
      Tooltip
        .style("opacity", 0)
    }

    let sortedWords = sortWords(data);
    let domainMax = sortedWords[0].size;
    let domainMin = sortedWords[29].size;

    let scaleSize = d3.scaleLinear().domain([domainMin, domainMax]).range([rangeMin, rangeMax]);
    let scaleForce = d3.scaleLinear().domain([1, 0.5]).range([0, 0.05]);

    //.attr("cx", function(d){ return getRandom(0, svgWidth)})

    let circles = svg.select(".circle-nodes")
      .selectAll("circle")
      .data(sortedWords, function(d){ return d.name})
      .enter().append("circle")
        .attr("data-word", function(d){ return d.name})
        .attr("cx", svgWidth / 2)
        .attr("cy", svgHeight / 2)
        .attr("fill", "#FFA1BC")
        .attr("r", function(d) { return scaleSize(d.size); })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    let labels = svg.select(".label-nodes")
      .selectAll("text")
      .data(sortedWords)
      .enter().append("text")
        .attr("width", function(d){ return scaleSize(d.size * 2)})
        .attr("height", function(d){ return scaleSize(d.size * 2)})
        .attr("x", svgWidth / 2)
        .attr("y", svgHeight / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-family", "Source Sans Pro, Arial, Helvetica, sans-serif")
        .attr("font-weight", "700")
        .attr("font-size", "16px")
        .style("pointer-events", "none")
        .text(function(d){ return d.name})
        .attr("font-size", function (d, i) {
          let areaUtil = svg.selectAll("circle")["_groups"][0][i].getBBox().width - 20,
              boundingBox = svg.selectAll("text")["_groups"][0][i].getBBox().width,
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

    simulation.nodes(sortedWords)
      .alpha(1).alphaTarget(0)
      .force("y", d3.forceY().strength(.1).y(svgHeight / 2).strength(function(d) {
        return scaleForce(aspectRatio)
      }))
      .force("center", d3.forceCenter().x(svgWidth / 2).y(svgHeight / 2))
      .force("charge", d3.forceManyBody().strength(.1))
      .force("collide", d3.forceCollide().strength(.2).radius(function(d){
        return scaleSize(d.size)
      })
      .iterations(1));

  }

  function resetNodes(newData, svg, rangeMin, rangeMax, aspectRatio, Tooltip) {

    let mouseover = function(d) {
      Tooltip
        .style("opacity", 1)
    }

    let mousemove = function(d) {
      let thisData = d3.select(this).data()[0];
      Tooltip
        .html(`<p class="tooltip-most-used__word">${thisData.name}</p><p class="tooltip-most-used__value">${thisData.size} ocurrences</p>`)
        .style("left", (d3.pointer(d)[0]) + "px")
        .style("top", (d3.pointer(d)[1]) + "px");
    }

    let mouseleave = function(d) {
      Tooltip
        .style("opacity", 0)
    }

    let sortedWords = sortWords(newData);
    let n = sortedWords.length;
    if(n < 30) {
      for (let step = 0; step < (30 - n); step++) {
        sortedWords.push({
          "name": "",
          "size": 0
        });
      }
    }

    let domainMax = sortedWords[0].size;
    let domainMin = sortedWords[n - 1].size;

    let scaleSize = d3.scaleLinear().domain([domainMin, domainMax]).range([rangeMin, rangeMax]);
    let scaleForce = d3.scaleLinear().domain([1, 0.5]).range([0, 0.05]);

    let circles = svg.select(".circle-nodes")
      .selectAll("circle")
      .data(sortedWords)
      .attr("r", function(d) {
        if(d.size > 0) {
          return scaleSize(d.size)
        } else {
          return 0;
        }
      })
      .attr("data-word", function(d){
        return d.name;
      });

    circles
      .enter().append("circle")
        .attr("data-word", function(d){ return d.name})
        .attr("cx", svgWidth / 2)
        .attr("cy", svgHeight / 2)
        .attr("fill", "#FFA1BC")
        .attr("r", function(d) { return scaleSize(d.size); })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    circles.exit().remove();

    let labels = svg.select(".label-nodes")
      .selectAll("text")
      .data(sortedWords)
      .attr("width", function(d){
        if(d.size > 0) {
          return scaleSize(d.size * 2)
        } else {
          return 0;
        }
      })
      .attr("height", function(d){
        return scaleSize(d.size * 2)
      })
      .attr("font-size", "16px")
      .text(function(d){
        return d.name;
      })
      .attr("font-size", function (d, i) {
        let areaUtil = svg.selectAll("circle")["_groups"][0][i].getBBox().width - 20,
            boundingBox = svg.selectAll("text")["_groups"][0][i].getBBox().width,
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

    labels.enter().append("text")
      .attr("width", function(d){ return scaleSize(d.size * 2)})
      .attr("height", function(d){ return scaleSize(d.size * 2)})
      .attr("x", svgWidth / 2)
      .attr("y", svgHeight / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-family", "Source Sans Pro, Arial, Helvetica, sans-serif")
      .attr("font-weight", "700")
      .attr("font-size", "16px")
      .style("pointer-events", "none")
      .text(function(d){ return d.name})
      .attr("font-size", function (d, i) {
        let areaUtil = svg.selectAll("circle")["_groups"][0][i].getBBox().width - 20,
            boundingBox = svg.selectAll("text")["_groups"][0][i].getBBox().width,
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

    labels.exit().remove();

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

    simulation.nodes(sortedWords)
      .alpha(1).alphaTarget(0)
      .force("y", d3.forceY().strength(.1).y(svgHeight / 2).strength(function(d) {
        return scaleForce(aspectRatio)
      }))
      .force("center", d3.forceCenter().x(svgWidth / 2).y(svgHeight / 2))
      .force("charge", d3.forceManyBody().strength(.1))
      .force("collide", d3.forceCollide().strength(.2).radius(function(d){
        if(d.size > 0) {
          return scaleSize(d.size)
        } else {
          return 0;
        }
      })
      .iterations(1));

  }

});
