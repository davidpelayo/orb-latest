/** @jsx React.DOM */

/* global module, require, React */

'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

module.exports.PivotTableRowButtons = React.createClass({
  render: function() {
    var self = this;
    var PivotButton = comps.PivotButton;
    var DropTarget = comps.DropTarget;

    var config = this.props.pivotTableComp.pgridwidget.pgrid.config;

    var rowButtons = config.rowFields.map(function(field, index) {
      return <PivotButton key={field.name}
                          field={field}
                          axetype={axe.Type.ROWS}
                          position={index}
                          pivotTableComp={self.props.pivotTableComp}>
             </PivotButton>;
    });

    return  <DropTarget buttons={rowButtons} axetype={axe.Type.ROWS}>
            </DropTarget>;
  }
});
