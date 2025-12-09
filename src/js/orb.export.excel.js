/**
 * @fileOverview Pivot Grid export to Excel
 * @author Najmeddine Nouri <najmno@gmail.com>
 */

'use strict';

/* global module, require */
/*jshint eqnull: true*/

const utils = require('./orb.utils');
const uiheaders = require('./orb.ui.header');
const themeManager = require('./orb.themes');

const uriHeader = 'data:application/vnd.ms-excel;base64,';
const docHeader =
  '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
  '<head>' +
  '<meta http-equiv=Content-Type content="text/html; charset=UTF-8">' +
  '<!--[if gte mso 9]><xml>' +
  ' <x:ExcelWorkbook>' +
  '  <x:ExcelWorksheets>' +
  '   <x:ExcelWorksheet>' +
  '    <x:Name>###sheetname###</x:Name>' +
  '    <x:WorksheetOptions>' +
  '     <x:ProtectContents>False</x:ProtectContents>' +
  '     <x:ProtectObjects>False</x:ProtectObjects>' +
  '     <x:ProtectScenarios>False</x:ProtectScenarios>' +
  '    </x:WorksheetOptions>' +
  '   </x:ExcelWorksheet>' +
  '  </x:ExcelWorksheets>' +
  '  <x:ProtectStructure>False</x:ProtectStructure>' +
  '  <x:ProtectWindows>False</x:ProtectWindows>' +
  ' </x:ExcelWorkbook>' +
  '</xml><![endif]-->' +
  '</head>' +
  '<body>';
const docFooter = '</body></html>';

/**
 * Creates a new instance of rows ui properties.
 * @class
 * @memberOf orb.ui
 * @param  {orb.axe} rowsAxe - axe containing all rows dimensions.
 */
module.exports = function (pgridwidget) {
  const config = pgridwidget.pgrid.config;

  let currTheme = themeManager.current();
  currTheme = currTheme === 'bootstrap' ? 'white' : currTheme;
  const override = currTheme === 'white';

  const buttonTextColor = override ? 'black' : 'white';
  const themeColor = themeManager.themes[currTheme];
  const themeFadeout = themeManager.utils.fadeoutColor(themeColor, 0.1);

  const buttonStyle =
    'style="font-weight: bold; color: ' +
    buttonTextColor +
    '; background-color: ' +
    themeColor +
    ';" bgcolor="' +
    themeColor +
    '"';
  const headerStyle =
    'style="background-color: ' + themeFadeout + ';" bgcolor="' + themeFadeout + '"';

  function createButtonCell(caption) {
    return (
      '<td ' + buttonStyle + '><font color="' + buttonTextColor + '">' + caption + '</font></td>'
    );
  }

  function createButtons(buttons, cellsCountBefore, cellsCountAfter, prefix) {
    let i;
    let str = prefix || '<tr>';
    for (i = 0; i < cellsCountBefore; i++) {
      str += '<td></td>';
    }

    str += buttons.reduce((tr, field) => {
      return (tr += createButtonCell(field.caption));
    }, '');

    for (i = 0; i < cellsCountAfter; i++) {
      str += '<td></td>';
    }
    return str + '</tr>';
  }

  const cellsHorizontalCount = Math.max(
    config.dataFields.length + 1,
    pgridwidget.layout.pivotTable.width
  );

  const dataFields = createButtons(
    config.dataFields,
    0,
    cellsHorizontalCount - config.dataFields.length,
    '<tr><td><font color="#ccc">Data</font></td>'
  );

  const sep = '<tr><td style="height: 22px;" colspan="' + cellsHorizontalCount + '"></td></tr>';

  const columnFields = createButtons(
    config.columnFields,
    pgridwidget.layout.rowHeaders.width,
    cellsHorizontalCount - (pgridwidget.layout.rowHeaders.width + config.columnFields.length)
  );

  const columnHeaders = (function () {
    let str = '';
    let j;
    for (let i = 0; i < pgridwidget.columns.headers.length; i++) {
      const currRow = pgridwidget.columns.headers[i];
      let rowStr = '<tr>';
      if (i < pgridwidget.columns.headers.length - 1) {
        for (j = 0; j < pgridwidget.layout.rowHeaders.width; j++) {
          rowStr += '<td></td>';
        }
      } else {
        rowStr += config.rowFields.reduce((tr, field) => {
          return (tr += createButtonCell(field.caption));
        }, '');
      }

      rowStr += currRow.reduce((tr, header) => {
        const value =
          header.type === uiheaders.HeaderType.DATA_HEADER ? header.value.caption : header.value;
        return (tr +=
          '<td ' +
          headerStyle +
          ' colspan="' +
          header.hspan(true) +
          '" rowspan="' +
          header.vspan(true) +
          '">' +
          value +
          '</td>');
      }, '');
      str += rowStr + '</tr>';
    }
    return str;
  })();

  const rowHeadersAndDataCells = (function () {
    let str = '';
    let j;
    for (let i = 0; i < pgridwidget.rows.headers.length; i++) {
      const currRow = pgridwidget.rows.headers[i];
      let rowStr = '<tr>';
      rowStr += currRow.reduce((tr, header) => {
        return (tr +=
          '<td ' +
          headerStyle +
          ' colspan="' +
          header.hspan(true) +
          '" rowspan="' +
          header.vspan(true) +
          '">' +
          header.value +
          '</td>');
      }, '');
      const dataRow = pgridwidget.dataRows[i];
      rowStr += dataRow.reduce((tr, dataCell, index) => {
        const formatFunc = config.dataFields[(index = index % config.dataFields.length)].formatFunc;
        const value =
          dataCell.value == null ? '' : formatFunc ? formatFunc()(dataCell.value) : dataCell.value;
        return (tr += '<td>' + value + '</td>');
      }, '');
      str += rowStr + '</tr>';
    }
    return str;
  })();

  function toBase64(str) {
    return utils.btoa(unescape(encodeURIComponent(str)));
  }

  return (
    uriHeader +
    toBase64(
      docHeader +
        '<table>' +
        dataFields +
        sep +
        columnFields +
        columnHeaders +
        rowHeadersAndDataCells +
        '</table>' +
        docFooter
    )
  );
};
