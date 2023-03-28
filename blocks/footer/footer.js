import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

function addEventListeners(container) {
  const h3s = container.querySelectorAll('h3');
  [...h3s].forEach((h3) => {
    h3.addEventListener('click', (e) => {
      toggleNewsEvents(container, e.target);
    });
  })
}

function toggleNewsEvents(container, target) {
  if (!target.parentElement.classList.contains('on')) {
    const items = container.querySelectorAll('.toggle');
    [...items].forEach((item) => {
      item.classList.toggle('on');
    });
  }
}

function buildNewsEvents(container) {
  [...container.children].forEach((row, y) => {
    [...row.children].forEach((column, x) => {
      column.classList.add('toggle');
      if (x === 0) {
        column.classList.add('on');
      }
    });
  });
  addEventListeners(container);
}

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;

  const footerWrap = document.createElement('div');
  const footerBottom = document.createElement('div');
  footerWrap.classList.add('footer-wrap');
  footerBottom.classList.add('footer-bottom');
  block.appendChild(footerWrap);
  block.appendChild(footerBottom);

  [...footer.children].forEach((row, i) => {
    row.classList.add(`row-${i + 1}`);
    if (i <= 3) {
      footerWrap.appendChild(row);
    } else {
      footerBottom.appendChild(row);
    }
  });

  const footerNewsEvents = block.querySelector('.footer-news-events');
  buildNewsEvents(footerNewsEvents);

  await decorateIcons(footer);
  block.append(footer);
}
