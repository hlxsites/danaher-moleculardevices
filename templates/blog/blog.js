import {
  div, img, span, iframe, h3, p, button, h5,
} from '../../scripts/dom-helpers.js';
// import { loadScript } from '../../scripts/scripts.js';
import ffetch from '../../scripts/ffetch.js';

function showNewsletterModal() {
  const newsletterModalOverlay = document.querySelector('.newsletter-modal-overlay');
  newsletterModalOverlay.removeAttribute('aria-hidden');
  document.body.classList.add('no-scroll');
}

function hideNewsletterModal() {
  const newsletterModalOverlay = document.querySelector('.newsletter-modal-overlay');
  newsletterModalOverlay.setAttribute('aria-hidden', true);
  document.body.classList.remove('no-scroll');
}

function stopProp(e) {
  e.stopPropagation();
}

function triggerModalBtn() {
  const scrollFromTop = window.scrollY;
  const midHeightOfViewport = Math.floor(document.body.getBoundingClientRect().height / 2.25);

  const modalBtn = document.getElementById('show-newsletter-modal');

  if (scrollFromTop > midHeightOfViewport) {
    if (modalBtn) {
      modalBtn.click(showNewsletterModal);
      modalBtn.remove();
    }
  }
}

async function getLatestNewsletter() {
  return ffetch('/query-index.json')
    .sheet('resources')
    .filter((resource) => resource.type === 'Newsletter')
    .limit(1)
    .all();
}

async function setParams(formURL) {
  const latestNewsletter = await getLatestNewsletter();
  const queryString = window.location.search;
  let cmpID = new URLSearchParams(queryString).get('cmp');
  if (!cmpID) cmpID = '';
  const iframeSrc = `${formURL}?latest_newsletter=${latestNewsletter[0].gatedURL}&cmp=${cmpID}`;
  return iframeSrc;
}

// function iframeResizeHandler(formUrl, id, container) {
//   const resizerPromise = new Promise((resolve) => {
//     loadScript('/scripts/iframeResizer.min.js', () => { resolve(); });
//   });

//   container.querySelector('iframe').addEventListener('load', async () => {
//     if (formUrl) {
//       await resizerPromise;
//       /* global iFrameResize */
//       iFrameResize({ log: false }, id);
//     }
//   });
// }

async function newsletterModal(formURL, modalIframeID) {
  const body = document.querySelector('body');
  const iframeSrc = await setParams(formURL);

  const modalBtn = button({ id: 'show-newsletter-modal' }, 'Show Modal');
  modalBtn.addEventListener('click', showNewsletterModal);
  body.append(modalBtn);

  const newsletterOverlay = div({ class: 'newsletter-modal-overlay', 'aria-hidden': true });
  newsletterOverlay.addEventListener('click', hideNewsletterModal);
  body.append(newsletterOverlay);

  const leftColumn = div(
    { class: 'newsletter-left-col newsletter-col' },
    img({ src: '/images/spectra-lab-notes.png', alt: 'Spectra' }),
    p(
      "Each month, we'll share trends our customers are setting in science and breakthroughs we're enabling together with promises of a brighter, healthier future.",
    ),
  );
  const rightColumn = div(
    { class: 'newsletter-right-col newsletter-col' },
    div(
      { class: 'modal-iframe-wrapper' },
      div(
        h3('Join our journey'),
        h3('of scientific discovery'),
        iframe({
          src: iframeSrc,
          id: modalIframeID,
          loading: 'lazy',
          title: 'Modal Newsletter',
        }),
      ),
    ),
  );
  const columnsWrapper = div({ class: 'columns columns-2-cols' }, leftColumn, rightColumn);
  const closeIconSvg = `<svg viewBox="0 0 20.71 20.71" class="close-video-icon">
  <polygon
    fill="#fff"
    points="20.71 0.71 20 0 10.35 9.65 0.71 0 0 0.71 9.65 10.35 0 20 0.71 20.71 10.35 11.06 20 20.71 20.71 20 11.06 10.35 20.71 0.71"
  ></polygon>
</svg>`;
  const closeBtn = span({ class: 'icon icon-close newsletter-button-close' });
  closeBtn.innerHTML = closeIconSvg;
  closeBtn.addEventListener('click', hideNewsletterModal);
  const innerWrapper = div({ class: 'newsletter-inner-wrapper' }, columnsWrapper, closeBtn);
  innerWrapper.addEventListener('click', stopProp);
  newsletterOverlay.append(innerWrapper);
  // iframeResizeHandler(formURL, modalIframeID, rightColumn);
}

window.addEventListener('scroll', triggerModalBtn);

export default async function decorate() {
  const spectraNewsletter = document.querySelector('.spectra-newsletter-column');
  const formURL = 'https://info.moleculardevices.com/lab-notes-popup';
  const modalIframeID = 'newsletter-modal';
  const sidebarIframeID = 'newsletter-sidebar';
  const iframeSrc = await setParams(formURL);
  const sidebar = div(
    { class: 'spectra-newsletter' },
    h3('Join our journey of scientific discovery'),
    h5('Each month, we’ll share trends our customers are setting in science and breakthroughs we’re enabling together with promises of a brighter, healthier future.'),
    iframe({
      src: iframeSrc,
      id: sidebarIframeID,
      loading: 'lazy',
      title: 'Newsletter',
    }),
  );
  spectraNewsletter.appendChild(sidebar);
  // iframeResizeHandler(formURL, sidebarIframeID, spectraNewsletter);

  setTimeout(async () => {
    newsletterModal(formURL, modalIframeID);
  }, 500);

  // add social share block
  const blogCarousel = document.querySelector('.recent-blogs-carousel');
  if (blogCarousel) {
    const blogCarouselSection = blogCarousel.parentElement;
    const socialShareSection = div(div({ class: 'social-share' }));

    blogCarouselSection.parentElement.insertBefore(socialShareSection, blogCarouselSection);
  }
  // add wave
  const main = document.querySelector('main');
  main.appendChild(
    div(div({ class: 'section-metadata' }, div(div('style'), div('wave, no padding top')))),
  );
}
