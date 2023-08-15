import { decorateIcons } from '../../scripts/lib-franklin.js';
import { div, span } from '../../scripts/dom-helpers.js';

export default async function decorate(block) {
  const wrapper = block.parentElement;
  const body = document.querySelector('body');

  const lightboxOverlay = div({ class: 'image-gallery-lightbox-overlay', 'aria-hidden': true });
  body.append(lightboxOverlay);
  const innerBlock = block.cloneNode(true);

  const right = span({ class: 'icon icon-icon_link gallery-button-right' });
  const left = span({ class: 'icon icon-icon_link gallery-button-left' });
  const close = span({ class: 'icon icon-close-circle-outline gallery-button-close' });
  const lightboxWrapper = div(innerBlock, close, right, left);
  lightboxOverlay.append(lightboxWrapper);

  const childrenLength = block.children.length;
  const scroll = (leftScroll) => {
    let resultingLeftScroll = leftScroll;
    if (leftScroll < 0) {
      resultingLeftScroll = leftScroll + innerBlock.offsetWidth * childrenLength;
    } else if (leftScroll + innerBlock.offsetWidth > innerBlock.offsetWidth * childrenLength) {
      resultingLeftScroll = 0;
    }
    innerBlock.scrollTo({ top: 0, left: resultingLeftScroll, behavior: 'smooth' });
  };

  right.addEventListener('click', () => {
    console.log('right');
    scroll(innerBlock.scrollLeft + innerBlock.offsetWidth);
  });
  left.addEventListener('click', () => {
    console.log('left');
    scroll(innerBlock.scrollLeft - innerBlock.offsetWidth);
  });
  close.addEventListener('click', () => {
    lightboxOverlay.setAttribute('aria-hidden', true);
    body.classList.remove('no-scroll');
  });

  innerBlock.querySelectorAll('p.picture:nth-of-type(2)').forEach((element) => {
    console.log('removing sibling for element', element, element.previousElementSibling);
    element.previousElementSibling.remove();
  });
  [...block.children].slice(5).forEach((row) => {
    block.removeChild(row);
  });

  [...block.children].forEach((row, i) => {
    row.querySelector('img:first-of-type').addEventListener('click', () => {
      body.classList.add('no-scroll');
      lightboxOverlay.removeAttribute('aria-hidden');

      console.log('overlay offset width', lightboxOverlay.offsetWidth);
      console.log('actual overlay offset width', innerBlock.offsetWidth);
      console.log('i', i);
      innerBlock.scrollTo({ top: 0, left: innerBlock.offsetWidth * i, behavior: 'instant' });
      console.log('clicked');
    });
  });
  await decorateIcons(wrapper);
}
