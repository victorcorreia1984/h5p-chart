/*global H5P,d3*/

/**
 * Graph Cake module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.GraphCake = (function ($, EventDispatcher) {

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   *
   * @returns {Object} GraphCake Graph Cake instance
   */
  function GraphCake(params, id) {
    this.$ = $(this);
    this.id = id;

    // Inheritance
    EventDispatcher.call(this);

    // Set default behavior.
    this.params = $.extend({
      listOfTypes: [
        {
          text: 'Cat',
          value: '1',
          color: 'black',
          fontColor: 'white'
        },
        {
          name: 'Dog',
          value: '2',
          color: 'green',
          fontColor: 'white'
        },
        {
          text: 'Mouse',
          value: '3',
          color: 'blue',
          fontColor: 'white'
        }
      ]
    }, params);

    this.colors = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
  }

  // Inheritance
  GraphCake.prototype = Object.create(EventDispatcher.prototype);
  GraphCake.prototype.constructor = GraphCake;

  /**
   * Append field to wrapper.
   * @param {jQuery} $container the jQuery object which this module will attach itself to.
   */
  GraphCake.prototype.attach = function ($container) {
    this.$container = $container;
    this.$inner = $container;
    this.addChart();
  };

  GraphCake.prototype.addChart = function () {
    if (this.params.graphMode === 'pieChart'){
      this.createPie();
    }
    else {
      this.createBars();
    }
  };

  GraphCake.prototype.createPie = function () {
    $('.chart').remove();

    $('<div/>', {'class': 'chart'})
      .appendTo(this.$inner);

    var self = this;
    var dataset = this.params.listOfTypes;

    var width = 400;
    var height = 400;
    var padding = {top: 20, bottom: 20, right: 20, left: 20};
    var w = width - padding.left;
    var h = height - padding.bottom;
    var radius = Math.min(w, h) / 2;

    var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d.value; });

    var svg = d3.select(".chart").append("svg")
      .attr('class', 'svg')
      .attr("width", width+'px')
      .attr("height", height+'px')
      .append("g")
      .attr("class", "translater")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
      .data(pie(dataset))
      .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("class", "path")
      .attr("d", arc)
      .style("fill", function(d) {
        if (d.data.color !== undefined) {
          return d.data.color;
        }
        return self.colors(dataset.indexOf(d.data) % 7);
      });

    g.append("svg:text")
      .attr("class", "typeText")
      .attr("transform", function(d) {
        d.innerRadius = 0;
        d.outerRadius = radius;
        return "translate(" + arc.centroid(d) + ")";
      })
      .attr("text-anchor", "middle")
      .text(function(d, i) { return dataset[i].value + ': ' + dataset[i].text; })
      .attr("fill", function (d) {
        if (d.data.fontColor !== undefined) {
          return d.data.fontColor;
        }
      });

    function resize() {
      var scaleTo = self.$container.width();
      var innerHeight = self.$container.height();
      if (innerHeight < scaleTo) {
        scaleTo = innerHeight;
      }

      width = scaleTo;
      height = scaleTo;
      padding = {top: 20, bottom: 20, right: 20, left: 20};
      w = width - padding.left;
      h = height - padding.bottom;
      radius = Math.min(w, h) / 2;

      arc.outerRadius(radius - 10)
        .innerRadius(0);

      d3.select('.chart')
        .attr("width", width + "px")
        .attr("height", height + "px");

      d3.select('.svg')
        .attr('width', width + 'px')
        .attr('height', height + 'px');

      d3.select('.translater')
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      d3.selectAll("path")
        .attr("d", arc);

      d3.select(".typeText")
        .attr("transform", function(d) {
          d.innerRadius = 0;
          d.outerRadius = radius - 10;
          return "translate(" + arc.centroid(d) + ")";
        })
        .text(function(d, i) { return dataset[i].value + ': ' + dataset[i].text; });
    }

    this.on('resize', function () {
      resize();
    });
    resize();
  };

  GraphCake.prototype.createBars = function () {
    var self = this;
    $('.chart').remove();

    $('<div/>', {'class': 'chart'})
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

    var margin = {top: 30, right: 20, bottom: 30, left: 20};
    var width = w - margin.left - margin.right;
    var height = h - margin.bottom;

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
        return self.colors(dataset.indexOf(d) % 7);
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

    function resize() {
      w = self.$inner.width();
      width = w;
      height = (w * aspect) - margin.bottom;
      h = w * aspect;
      h = self.$inner.height();
      height = h - margin.bottom;

      xScale.rangeRoundBands([0, width], 0.05);

      yScale.range([0, height]);

      x.range([0, width]);
      y.range([height, 0]);

      svg.attr("width", w)
        .attr("height", h);

      d3.select('.chart')
        .attr("width", function () { return w; });

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

    this.on('resize', function () {
      resize();
    });
    resize();
  };

    return GraphCake;
})(H5P.jQuery, H5P.EventDispatcher);
