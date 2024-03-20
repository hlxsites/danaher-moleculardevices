import {
  div, img, iframe, h3, p, h5,
} from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/lib-franklin.js';
import { addNewsletterInParams, decorateModal, iframeResizeHandler } from '../../blocks/modal/modal.js';

async function newsletterModal(formURL, modalIframeID) {
  const iframeSrc = await addNewsletterInParams(formURL);

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
  const modalBody = div({ class: 'columns columns-2-cols' }, leftColumn, rightColumn);

  decorateModal(formURL, modalIframeID, modalBody, 'newsletter-inner-wrapper', true);
  iframeResizeHandler(formURL, modalIframeID, rightColumn);
}

export default async function decorate() {
  const newsletterMetaData = getMetadata('newsletter-modal');
  const hasNewsletterMetaData = newsletterMetaData.toLowerCase() === 'hide';

  const spectraNewsletter = document.querySelector('.spectra-newsletter-column');
  const formURL = 'https://info.moleculardevices.com/lab-notes-popup';
  const modalIframeID = 'newsletter-modal';

  if (spectraNewsletter) {
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
    iframeResizeHandler(formURL, sidebarIframeID, spectraNewsletter);
  }

  if (!hasNewsletterMetaData) {
    setTimeout(async () => {
      newsletterModal(formURL, modalIframeID);
    }, 500);
  }

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
