/** @jsx React.DOM */

/* global module, require, React */

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

module.exports.PivotTableUpperButtons = React.createClass({
  render: function () {
    const self = this;
    const PivotButton = comps.PivotButton;
    const DropTarget = comps.DropTarget;

    const config = this.props.pivotTableComp.pgridwidget.pgrid.config;

    let fieldsDropTarget;
    if (config.canMoveFields) {
      const fieldsButtons = config.availablefields().map((field, index) => {
        return (
          <PivotButton
            key={field.name}
            field={field}
            axetype={null}
            position={index}
            pivotTableComp={self.props.pivotTableComp}
          ></PivotButton>
        );
      });
      fieldsDropTarget = (
        <tr>
          <td className="flds-grp-cap av-flds text-muted">
            <div>Fields</div>
          </td>
          <td className="av-flds">
            <DropTarget buttons={fieldsButtons} axetype={null}></DropTarget>
          </td>
        </tr>
      );
    } else {
      fieldsDropTarget = null;
    }

    const dataButtons = config.dataFields.map((field, index) => {
      return (
        <PivotButton
          key={field.name}
          field={field}
          axetype={axe.Type.DATA}
          position={index}
          pivotTableComp={self.props.pivotTableComp}
        ></PivotButton>
      );
    });

    const dataDropTarget = (
      <tr>
        <td className="flds-grp-cap text-muted">
          <div>Data</div>
        </td>
        <td className="empty">
          <DropTarget buttons={dataButtons} axetype={axe.Type.DATA}></DropTarget>
        </td>
      </tr>
    );

    return (
      <table className="inner-table upper-buttons">
        <tbody>
          {fieldsDropTarget}
          {dataDropTarget}
        </tbody>
      </table>
    );
  },
});
