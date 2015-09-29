/*global H5P,d3*/

/**
 * Graph Cake module
 * @external {jQuery} $ H5P.jQuery
 * @external {EventDispatcher} EventDispatcher H5P.EventDispatcher
 */
H5P.GraphCake = (function ($, EventDispatcher) {

  /**
   * Initialize module.
   *
   * @class
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   */
  function GraphCake(params, id) {
    var self = this;

    // Inheritance
    EventDispatcher.call(self);

    // Set default behavior.
    self.params = $.extend(true, {
      graphMode: 'pieChart',
      listOfTypes: [
        {
          text: 'Cat',
          value: '1',
          color: '#D3D3D3',
          fontColor: '#000'
        },
        {
          text: 'Dog',
          value: '2',
          color: '#ADD8E6',
          fontColor: '#000'
        },
        {
          text: 'Mouse',
          value: '3',
          color: '#90EE90',
          fontColor: '#000'
        }
      ]
    }, params);

    self.type = (self.params.graphMode === 'pieChart' ? 'Pie' : 'Bar');
  }

  // Inheritance
  GraphCake.prototype = Object.create(EventDispatcher.prototype);
  GraphCake.prototype.constructor = GraphCake;

  /**
   * Append field to wrapper.
   *
   * @param {H5P.jQuery} $container
   */
  GraphCake.prototype.attach = function ($container) {
    var self = this;

    // Create chart on first attach
    if (self.$wrapper === undefined) {
      self.$wrapper = $('<div/>', {'class': 'h5p-graphcake-chart h5p-graphcake-' + self.type.toLowerCase()});
      self.chart = new H5P.GraphCake[self.type + 'Chart'](self.params.listOfTypes, self.$wrapper);
    }

    // Prepare container
    self.$container = $container.html('').addClass('h5p-graphcake').append(self.$wrapper);

    // Handle resizing
    self.on('resize', function () {
      if (!self.$container.is(':visible')) {
        return; // Only handle if visible
      }
      // Resize existing chart
      self.chart.resize();
    });
  };

  return GraphCake;
})(H5P.jQuery, H5P.EventDispatcher);
