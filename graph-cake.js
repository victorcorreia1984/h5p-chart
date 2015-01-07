var H5P = H5P || {};

/**
 * Graph Cake module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.GraphCake = (function ($) {
  var pieChart = 'pieChart',
    barChart = 'barChart';

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   *
   * @returns {Object} C Graph Cake instance
   */
  function C(params, id) {
    this.$ = $(this);
    this.id = id;

    // Set default behavior.
    this.params = $.extend({}, params);
  }

  /**
   * Append field to wrapper.
   * @param {jQuery} $container the jQuery object which this module will attach itself to.
   */
  C.prototype.attach = function ($container) {
    this.$inner = $container
        .html('<div><div></div></div>')
        .children();
    this.addChart();
  };

  C.prototype.addChart = function () {

    if (this.params.graphMode === 'pieChart'){
      this.createPie();
    }
    else {
      this.createBars();
    }

  };

  C.prototype.createPie = function () {
    $('.chart').remove();

    var $chart = $('<div/>', {'class': 'chart'})
      .appendTo(this.$inner);

    var dataset = this.params.listOfTypes;

    var width = 400,
      height = 400,
      padding = {top: 20, bottom: 20, right: 20, left: 20},
      w = width - padding.left,
      h = height - padding.bottom,
      radius = Math.min(w, h) / 2;

    var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d.value; });

    var svg = d3.select(".chart").append("svg")
      .attr("width", width+'px')
      .attr("height", height+'px')
      .append("g")
      .attr("class", "translater")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
      .data(pie(dataset))
      .enter().append("g")
      .attr("class", "arc");

    var path = g.append("path")
      .attr("class", "path")
      .attr("d", arc)
      .style("fill", function(d) {
        if (d.data.color !== undefined) {
          return d.data.color;
        }
        return color(dataset.indexOf(d.data) % 7);
      });

    var pos = d3.svg.arc().innerRadius(0).outerRadius(radius/1.5);

    var getAngle = function (d) {
      return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
    };

    g.append("text")
      .attr("class", "typeText")
      .attr("transform", function(d) {
        return "translate(" + pos.centroid(d) + ") " +
          "rotate(" + getAngle(d) + ")"; })
      .attr("dy", 5)
      .style("text-anchor", "start")
      .text(function(d) {
        return d.value+': '+d.data.text;
      })
      .attr("fill", function (d) {
        if (d.data.fontColor !== undefined) {
          return d.data.fontColor;
        }
        return '#000000';
      });

    var aspect = height / width;

    d3.select(window).on('resize', resize);

    function resize() {
      //Only resize if smaller than initial size.
      if (parseInt(d3.select('.chart').style('width'), 10)> 400) {
        return false;
      }

      var width = parseInt(d3.select('.chart').style('width'), 10),
        height = width*aspect,
        padding = {top: 20, bottom: 20, right: 20, left: 20},
        w = width - padding.left,
        h = height - padding.bottom,
        radius = Math.min(w, h) / 2;

      arc.outerRadius(radius - 10)
        .innerRadius(0);

      d3.select('.chart')
        .attr("width", width)
        .attr("height", height);

      d3.select('.translater')
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      d3.selectAll("path")
        .attr("d", arc);

      var pos = d3.svg.arc().innerRadius(0).outerRadius(radius/1.5);

      var getAngle = function (d) {
        return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
      };

      d3.select('.typeText')
        .attr("transform", function(d) {
          return "translate(" + pos.centroid(d) + ") " +
            "rotate(" + getAngle(d) + ")"; })

    };

    resize();
  };

  C.prototype.createBars = function () {
    $('.chart').remove();

    var $chart = $('<div/>', {'class': 'chart'})
      .appendTo(this.$inner);

    var w = 600;
    var h = 250;

    var dataset = this.params.listOfTypes;

    var key = function(d) {
      return dataset.indexOf(d);
    };

    var formatData = function(d) {
      return dataset[d % dataset.length].text;
    };

    var margin = {top: 30, right: 20, bottom: 30, left: 20}
      , width = 600 - margin.left - margin.right
      , height = 250 - margin.bottom;

    var barWidth = width / dataset.length;

    var xScale = d3.scale.ordinal()
      .domain(d3.range(dataset.length))
      .rangeRoundBands([0, width], 0.05);

    var yScale = d3.scale.linear()
      .domain([0, d3.max(dataset, function(d) {return d.value;})])
      .range([0, height]);

    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .tickFormat(formatData);

    //Create SVG element
    var svg = d3.select(".chart")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    //Create bars
    svg.selectAll("rect")
      .data(dataset, key)
      .enter()
      .append("rect")
      .attr("x", function(d, i) {
        return xScale(i);
      })
      .attr("y", function(d) {
        return height - yScale(d.value);
      })
      .attr("width", xScale.rangeBand())
      .attr("height", function(d) {
        return yScale(d.value);
      })
      .attr("fill", function(d) {
        if (d.color !== undefined) {
          return d.color;
        }
        return '#000000';
      });

    //Create labels
    svg.selectAll("text")
      .data(dataset, key)
      .enter()
      .append("text")
      .text(function(d) {
        return d.value;
      })
      .attr("class", "barAmount")
      .attr("text-anchor", "middle")
      .attr("x", function(d, i) {
        return xScale(i) + xScale.rangeBand() / 2;
      })
      .attr("y", function(d) {
        return height - yScale(d.value) + 14;
      })
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("fill", function (d) {
        if (d.fontColor !== undefined) {
          return d.fontColor;
        }
        return '#FFFFFF';
      });

    var aspect = height / width;

    d3.select(window).on('resize', resize);

    function resize() {
      //Only resize if smaller than initial size.
      if (parseInt(d3.select('.chart').style('width'), 10)> 600) {
        return false;
      }
      var width = parseInt(d3.select('.chart').style('width'), 10) -margin.left - margin.right;
      var w = parseInt(d3.select('.chart').style('width'), 10);
      var height = (w * aspect) - margin.bottom;
      var h = w * aspect

      xScale.rangeRoundBands([0, width], 0.05);

      yScale.range([0, height]);

      x.range([0, width]);
      y.range([height, 0]);

      svg.attr("width", w)
        .attr("height", h);

      d3.select('.chart')
        .attr("width", function (d) { return w; });

      d3.select('.x.axis')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      d3.selectAll("rect")
        .attr("x", function(d, i) {
          return xScale(i);
        })
        .attr("y", function(d) {
          return height - yScale(d.value);
        })
        .attr("width", xScale.rangeBand())
        .attr("height", function(d) {
          return yScale(d.value);
        });

      svg.selectAll(".barAmount")
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
          return xScale(i) + xScale.rangeBand() / 2;
        })
        .attr("y", function(d) {
          return height - yScale(d.value) + 14;
        });

    }

    resize();
  };

    return C;
})(H5P.jQuery);