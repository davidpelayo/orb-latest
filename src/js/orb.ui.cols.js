/**
 * @fileOverview Pivot Grid columns viewmodel
 * @author Najmeddine Nouri <najmno@gmail.com>
 */

'use strict';

/* global module, require */
/*jshint eqnull: true*/

const axe = require('./orb.axe');
const axeUi = require('./orb.ui.axe');
const uiheaders = require('./orb.ui.header');

/**
 * Creates a new instance of columns ui properties.
 * @class
 * @memberOf orb.ui
 * @param  {orb.axe} columnsAxe - axe containing all columns dimensions.
 */
module.exports = function (columnsAxe) {
  const self = this;

  axeUi.call(self, columnsAxe);

  this.leafsHeaders = null;

  this.build = function () {
    self.headers = [];

    if (self.axe != null) {
      // Fill columns layout infos
      if (self.axe.root.values.length > 0 || self.axe.pgrid.config.grandTotal.columnsvisible) {
        for (let depth = self.axe.root.depth; depth > 1; depth--) {
          self.headers.push([]);
          getUiInfo(depth, self.headers);
        }

        if (self.axe.pgrid.config.grandTotal.columnsvisible) {
          // add grandtotal header
          (self.headers[0] = self.headers[0] || []).push(
            new uiheaders.header(
              axe.Type.COLUMNS,
              uiheaders.HeaderType.GRAND_TOTAL,
              self.axe.root,
              null,
              self.dataFieldsCount()
            )
          );
        }
      }

      if (self.headers.length === 0) {
        self.headers.push([
          new uiheaders.header(
            axe.Type.COLUMNS,
            uiheaders.HeaderType.INNER,
            self.axe.root,
            null,
            self.dataFieldsCount()
          ),
        ]);
      }

      // generate leafs headers
      generateLeafsHeaders();
    }
  };

  function generateLeafsHeaders() {
    const leafsHeaders = [];

    function pushsubtotal(pheader) {
      if (pheader && pheader.dim.field.subTotal.visible) {
        leafsHeaders.push(pheader.subtotalHeader);
      }
    }

    if (self.headers.length > 0) {
      // last headers row
      const infos = self.headers[self.headers.length - 1];
      let header = infos[0];

      if (header) {
        let currparent,
          prevpar = header.parent;

        for (let i = 0; i < infos.length; i++) {
          header = infos[i];
          currparent = header.parent;
          // if current header parent is different than previous header parent,
          // add previous parent
          if (currparent != prevpar) {
            pushsubtotal(prevpar);
            if (currparent != null) {
              // walk up parent hierarchy and add grand parents if different
              // than current header grand parents
              let grandpar = currparent.parent;
              let prevgrandpar = prevpar ? prevpar.parent : null;
              while (grandpar != prevgrandpar && prevgrandpar != null) {
                pushsubtotal(prevgrandpar);
                grandpar = grandpar ? grandpar.parent : null;
                prevgrandpar = prevgrandpar ? prevgrandpar.parent : null;
              }
            }
            // update previous parent variable
            prevpar = currparent;
          }
          // push current header
          leafsHeaders.push(infos[i]);

          // if it's the last header, add all of its parents up to the top
          if (i === infos.length - 1) {
            while (prevpar != null) {
              pushsubtotal(prevpar);
              prevpar = prevpar.parent;
            }
          }
        }
        // grandtotal is visible for columns and if there is more than one dimension in this axe
        if (self.axe.pgrid.config.grandTotal.columnsvisible && self.axe.dimensionsCount > 1) {
          // push also grand total header
          leafsHeaders.push(self.headers[0][self.headers[0].length - 1]);
        }
      }
    }

    // add data headers if more than 1 data field and they willbe the leaf headers
    if (self.isMultiDataFields()) {
      self.leafsHeaders = [];
      for (let leafIndex = 0; leafIndex < leafsHeaders.length; leafIndex++) {
        for (let datafieldindex = 0; datafieldindex < self.dataFieldsCount(); datafieldindex++) {
          self.leafsHeaders.push(
            new uiheaders.dataHeader(
              self.axe.pgrid.config.dataFields[datafieldindex],
              leafsHeaders[leafIndex]
            )
          );
        }
      }
      self.headers.push(self.leafsHeaders);
    } else {
      self.leafsHeaders = leafsHeaders;
    }
  }

  this.build();

  /**
   * Fills the infos array given in argument with the dimension layout infos as column.
   * @param  {orb.dimension}  dimension - the dimension to get ui info for
   * @param  {int}  depth - the depth of the dimension that it's subdimensions will be returned
   * @param  {object}  infos - array to fill with ui dimension info
   */
  function getUiInfo(depth, headers) {
    const infos = headers[headers.length - 1];
    const parents =
      self.axe.root.depth === depth
        ? [null]
        : headers[self.axe.root.depth - depth - 1].filter(p => {
            return p.type !== uiheaders.HeaderType.SUB_TOTAL;
          });

    for (let pi = 0; pi < parents.length; pi++) {
      const parent = parents[pi];
      const parentDim = parent == null ? self.axe.root : parent.dim;

      for (let di = 0; di < parentDim.values.length; di++) {
        const subvalue = parentDim.values[di];
        const subdim = parentDim.subdimvals[subvalue];

        var subtotalHeader;
        if (!subdim.isLeaf && subdim.field.subTotal.visible) {
          subtotalHeader = new uiheaders.header(
            axe.Type.COLUMNS,
            uiheaders.HeaderType.SUB_TOTAL,
            subdim,
            parent,
            self.dataFieldsCount()
          );
        } else {
          subtotalHeader = null;
        }

        const header = new uiheaders.header(
          axe.Type.COLUMNS,
          null,
          subdim,
          parent,
          self.dataFieldsCount(),
          subtotalHeader
        );
        infos.push(header);

        if (!subdim.isLeaf && subdim.field.subTotal.visible) {
          infos.push(subtotalHeader);
        }
      }
    }
  }
};
