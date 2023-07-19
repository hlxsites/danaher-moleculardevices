import {
  domEl, div, span, a, p,
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const specURLs = [...block.querySelectorAll('a')].map((link) => link.href);
  const attributes = [...block.querySelectorAll('.product-comparison > div:last-child > div:last-child > p')]
    .map((attrP) => attrP.textContent.trim());

  block.innerHTML = '';
  const productSpecs = {};
  await Promise.all(specURLs.map(async (url) => {
    const response = await fetch(url);
    const specData = await response.json();
    specData[':names'].forEach(((group) => {
      specData[group].data.forEach((item) => {
        if (!productSpecs[item.identifier]) {
          productSpecs[item.identifier] = {};
        }
        productSpecs[item.identifier] = { ...productSpecs[item.identifier], ...item };
      });
    }));
    return specData;
  }));

  const attributeMapping = productSpecs.Identifier;
  delete productSpecs.Identifier;
  const productIdentifiers = Object.keys(productSpecs);

  // render table head
  const headRow = domEl('tr',
    domEl('th', ''),
  );
  productIdentifiers.forEach((productIdentifier) => {
    const productSpec = productSpecs[productIdentifier];
    headRow.append(domEl('th',
      div({ class: 'product-heading' },
        a({ href: productSpec.path },
          createOptimizedPicture(productSpec.thumbnail),
          p(productSpec.title),
        ),
      ),
    ));
  });

  // render table body
  const tBodyBlock = domEl('tbody');
  attributes.forEach((attribute) => {
    const thisRow = domEl('tr');
    thisRow.append(domEl('td', attributeMapping[attribute]));
    productIdentifiers.forEach((productIdentifier) => {
      let rowValue = productSpecs[productIdentifier][attribute] || '';
      rowValue = rowValue.replace(/true/gi, '<img src="/images/check-icon.png" alt="true" width="30" height="30">');
      rowValue = rowValue.replace(/false/gi, '<img src="/images/false-icon.png" alt="false" width="30" height="30">');
      const rowBlock = span();
      rowBlock.innerHTML = rowValue;
      thisRow.append(domEl('td', rowBlock));
    });
    tBodyBlock.append(thisRow);
  });

  const tHeadBlock = domEl('thead', { class: 'table-head' }, headRow,
  );
  block.append(div({ class: 'table-container' },
    domEl('table', { class: 'responsive-table' }, tHeadBlock, tBodyBlock),
  ));

  return block;
}
