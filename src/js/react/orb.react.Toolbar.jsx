/** @jsx React.DOM */

/* global module, require, react */
/*jshint node: true, eqnull: true*/

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

module.exports.Toolbar = React.createClass({
  _toInit: [],
  componentDidMount: function () {
    for (let i = 0; i < this._toInit.length; i++) {
      const btn = this._toInit[i];
      btn.init(this.props.pivotTableComp, ReactDOM.findDOMNode(this.refs[btn.ref]));
    }
  },
  componentDidUpdate: function () {
    for (let i = 0; i < this._toInit.length; i++) {
      const btn = this._toInit[i];
      btn.init(this.props.pivotTableComp, ReactDOM.findDOMNode(this.refs[btn.ref]));
    }
  },
  createCallback: function (action) {
    if (action != null) {
      const pgridComponent = this.props.pivotTableComp;
      return function (e) {
        action(pgridComponent, e.target);
      };
    }
    return null;
  },
  render: function () {
    const config = this.props.pivotTableComp.pgridwidget.pgrid.config;

    if (config.toolbar && config.toolbar.visible) {
      const configButtons = config.toolbar.buttons
        ? defaultToolbarConfig.buttons.concat(config.toolbar.buttons)
        : defaultToolbarConfig.buttons;

      const buttons = [];
      for (let i = 0; i < configButtons.length; i++) {
        const btnConfig = configButtons[i];
        const refName = 'btn' + i;

        if (btnConfig.type == 'separator') {
          buttons.push(<div key={i} className="orb-tlbr-sep"></div>);
        } else if (btnConfig.type == 'label') {
          buttons.push(
            <div key={i} className="orb-tlbr-lbl">
              {btnConfig.text}
            </div>
          );
        } else {
          buttons.push(
            <div
              key={i}
              className={'orb-tlbr-btn ' + btnConfig.cssClass}
              title={btnConfig.tooltip}
              ref={refName}
              onClick={this.createCallback(btnConfig.action)}
            ></div>
          );
        }
        if (btnConfig.init) {
          this._toInit.push({
            ref: refName,
            init: btnConfig.init,
          });
        }
      }

      return <div>{buttons}</div>;
    }

    return <div></div>;
  },
});

const excelExport = require('../orb.export.excel');

var defaultToolbarConfig = {
  exportToExcel: function (pgridComponent, button) {
    const a = document.createElement('a');
    a.download = 'orbpivotgrid.xls';
    a.href = excelExport(pgridComponent.props.pgridwidget);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
  expandAllRows: function (pgridComponent, button) {
    pgridComponent.toggleFieldExpansion(axe.Type.ROWS, null, true);
  },
  collapseAllRows: function (pgridComponent, button) {
    pgridComponent.toggleFieldExpansion(axe.Type.ROWS, null, false);
  },
  expandAllColumns: function (pgridComponent, button) {
    pgridComponent.toggleFieldExpansion(axe.Type.COLUMNS, null, true);
  },
  collapseAllColumns: function (pgridComponent, button) {
    pgridComponent.toggleFieldExpansion(axe.Type.COLUMNS, null, false);
  },
  updateSubtotalsButton: function (axetype, pgridComponent, button) {
    const subTotalsState = pgridComponent.pgridwidget.areSubtotalsVisible(axetype);
    button.style.display = subTotalsState === null ? 'none' : '';

    let classToAdd = '';
    let classToRemove = '';
    if (subTotalsState) {
      classToAdd = 'subtotals-visible';
      classToRemove = 'subtotals-hidden';
    } else {
      classToAdd = 'subtotals-hidden';
      classToRemove = 'subtotals-visible';
    }

    reactUtils.removeClass(button, classToRemove);
    reactUtils.addClass(button, classToAdd);
  },
  initSubtotals: function (axetype) {
    const self = this;
    return function (pgridComponent, button) {
      self.updateSubtotalsButton(axetype, pgridComponent, button);
    };
  },
  toggleSubtotals: function (axetype) {
    const self = this;
    return function (pgridComponent, button) {
      pgridComponent.toggleSubtotals(axetype);
      self.updateSubtotalsButton(axetype, pgridComponent, button);
    };
  },
  updateGrandtotalButton: function (axetype, pgridComponent, button) {
    const subTotalsState = pgridComponent.pgridwidget.isGrandtotalVisible(axetype);
    button.style.display = subTotalsState === null ? 'none' : '';

    let classToAdd = '';
    let classToRemove = '';
    if (subTotalsState) {
      classToAdd = 'grndtotal-visible';
      classToRemove = 'grndtotal-hidden';
    } else {
      classToAdd = 'grndtotal-hidden';
      classToRemove = 'grndtotal-visible';
    }

    reactUtils.removeClass(button, classToRemove);
    reactUtils.addClass(button, classToAdd);
  },
  initGrandtotal: function (axetype) {
    const self = this;
    return function (pgridComponent, button) {
      self.updateGrandtotalButton(axetype, pgridComponent, button);
    };
  },
  toggleGrandtotal: function (axetype) {
    const self = this;
    return function (pgridComponent, button) {
      pgridComponent.toggleGrandtotal(axetype);
      self.updateGrandtotalButton(axetype, pgridComponent, button);
    };
  },
};

defaultToolbarConfig.buttons = [
  { type: 'label', text: 'Rows:' },
  {
    type: 'button',
    tooltip: 'Expand all rows',
    cssClass: 'expand-all',
    action: defaultToolbarConfig.expandAllRows,
  },
  {
    type: 'button',
    tooltip: 'Collapse all rows',
    cssClass: 'collapse-all',
    action: defaultToolbarConfig.collapseAllRows,
  },
  {
    type: 'button',
    tooltip: 'Toggle rows sub totals',
    init: defaultToolbarConfig.initSubtotals(axe.Type.ROWS),
    action: defaultToolbarConfig.toggleSubtotals(axe.Type.ROWS),
  },
  {
    type: 'button',
    tooltip: 'Toggle rows grand total',
    init: defaultToolbarConfig.initGrandtotal(axe.Type.ROWS),
    action: defaultToolbarConfig.toggleGrandtotal(axe.Type.ROWS),
  },
  { type: 'separator' },
  { type: 'label', text: 'Columns:' },
  {
    type: 'button',
    tooltip: 'Expand all columns',
    cssClass: 'expand-all',
    action: defaultToolbarConfig.expandAllColumns,
  },
  {
    type: 'button',
    tooltip: 'Collapse all columns',
    cssClass: 'collapse-all',
    action: defaultToolbarConfig.collapseAllColumns,
  },
  {
    type: 'button',
    tooltip: 'Toggle columns sub totals',
    init: defaultToolbarConfig.initSubtotals(axe.Type.COLUMNS),
    action: defaultToolbarConfig.toggleSubtotals(axe.Type.COLUMNS),
  },
  {
    type: 'button',
    tooltip: 'Toggle columns grand total',
    init: defaultToolbarConfig.initGrandtotal(axe.Type.COLUMNS),
    action: defaultToolbarConfig.toggleGrandtotal(axe.Type.COLUMNS),
  },
  { type: 'separator' },
  { type: 'label', text: 'Export:' },
  {
    type: 'button',
    tooltip: 'Export to Excel',
    cssClass: 'export-xls',
    action: defaultToolbarConfig.exportToExcel,
  },
];
