import ffetch from '../../scripts/ffetch.js';
import { loadScript, getCookie } from '../../scripts/scripts.js';
import {
  div, h3, p, ul, li, img, a, span, i, iframe, button,
} from '../../scripts/dom-helpers.js';

const url = '/quote-request/global-rfq.json';
const rfqTypes = await ffetch(url).sheet('types').all();
const rfqCategories = await ffetch(url).sheet('categories').all();

/* CREATE RFQ LIST BOX */
function createRFQListBox(listArr, checkStep, callback) {
  const list = ul({ class: 'rfq-icon-list' });

  listArr.forEach((rfq) => {
    const id = rfq.Type.toLowerCase().replace(',', '').trim();
    list.appendChild(
      li(
        { class: 'rfq-icon-item' },
        a(
          {
            class: 'rfq-icon-link',
            id: id.split(' ').join('-'),
            href: checkStep === 'step-1' ? '#step-2' : '#step-3',
            'data-tab': checkStep === 'step-1' ? rfq.Type : rfq.Category,
            onclick: callback,
          },
          img({
            class: 'rfq-icon-img',
            src: rfq['RFQ-Image'],
            alt: checkStep === 'step-1' ? rfq.Type : rfq.Category,
          }),
          span({ class: 'rfq-icon-title' }, checkStep === 'step-1' ? rfq.Type : rfq.Category),
        ),
      ),
    );
  });
  return list;
}
/* CREATE RFQ LIST BOX */

/* CREATE PROGRESS BAR */
function createProgessBar(val, checkStep) {
  return div(
    { class: 'progress-wrapper' },
    checkStep === 'step-1' ? div({ class: 'progress-bullet' }) : '',
    div(
      { class: 'progress-bar' },
      div({ class: 'progress', id: 'progressBar', style: `width: ${val}%` }),
    ),
  );
}
/* CREATE PROGRESS BAR */

function backOneStep(stepNum) {
  const currentTab = document.getElementById(stepNum);
  const prevTab = currentTab.previousElementSibling;

  currentTab.style.display = 'none';
  prevTab.style.display = 'block';
}

function createBackBtn(stepNum) {
  return button(
    {
      class: 'back-step-btn',
      onclick: () => {
        backOneStep(stepNum);
      },
    },
    i({ class: 'fa-angle-left fa' }),
  );
}

function iframeResizehandler(formUrl, id, root) {
  root.querySelector('iframe').addEventListener('load', () => {
    if (formUrl) {
      /* global iFrameResize */
      iFrameResize({ log: false }, id);
    }
  });
}

function loadIframeForm(stepNum, tab) {
  loadScript('/blocks/quote-request/iframeResizer.min.js');
  const root = document.getElementById(stepNum);
  root.innerHTML = '';

  const formUrl = 'https://info.moleculardevices.com/rfq';

  const productFamily = rfqCategories.filter(({ Category }) => Category.includes(tab) > 0);
  const sfdcProductFamily = productFamily[0].ProductFamily;

  const cmpValue = getCookie('cmp') ? getCookie('cmp') : '70170000000hlRa';

  const hubSpotQuery = {
    product_family__c: sfdcProductFamily,
    product_selection__c: sfdcProductFamily,
    product_primary_application__c: sfdcProductFamily,
    cmp: cmpValue,
    google_analytics_medium__c: getCookie('utm_medium') ? getCookie('utm_medium') : '',
    google_analytics_source__c: getCookie('utm_source') ? getCookie('utm_source') : '',
    keyword_ppc__c: getCookie('utm_keyword') ? getCookie('utm_keyword') : '',
    gclid__c: getCookie('gclid') ? getCookie('gclid') : '',
    product_image: 'NA',
    requested_qdc_discussion__c: 'Quote',
    return_url: `https://www.moleculardevices.com/quote-request-success?cat=${tab}&cmp=${cmpValue}`,
  };

  root.appendChild(
    div(
      h3("Got it. Now, let's get in touch."),
      p(
        'A team member will contact you within 24-business hours regarding your product inquiry for: ',
        span({ style: 'display: block;font-weight: bold;' }, tab),
      ),
      iframe({
        class: 'contact-quote-request',
        id: 'contactQuoteRequest',
        src: `${formUrl}?${new URLSearchParams(hubSpotQuery).toString()}`,
      }),
    ),
  );
  root.appendChild(createBackBtn(stepNum));
  iframeResizehandler(formUrl, '#contactQuoteRequest', root);
}

/* step one */
function stepOne(callback) {
  const stepNum = 'step-1';
  const root = document.getElementById(stepNum);
  const defaultProgessValue = 40;

  const fetchRQFTypes = createRFQListBox(rfqTypes, stepNum, callback);
  const progressBarHtml = createProgessBar(defaultProgessValue, stepNum);

  root.appendChild(h3('What type of product are you interested in?'));
  root.appendChild(fetchRQFTypes);
  root.appendChild(progressBarHtml);
}

/* step three */
function stepThree(e) {
  e.preventDefault();
  let tab = '';
  if (e.target.getAttribute('data-tab')) {
    tab = e.target.getAttribute('data-tab');
  } else {
    tab = e.target.closest('.rfq-icon-link').getAttribute('data-tab');
  }

  const stepNum = 'step-3';
  const prevRoot = document.getElementById('step-2');
  const root = document.getElementById(stepNum);
  root.innerHTML = '';

  loadIframeForm(stepNum, tab);

  root.style.display = 'block';
  prevRoot.style.display = 'none';
}

/* step two */
function stepTwo(e) {
  e.preventDefault();

  let tab = '';
  if (e.target.getAttribute('data-tab')) {
    tab = e.target.getAttribute('data-tab');
  } else {
    tab = e.target.closest('.rfq-icon-link').getAttribute('data-tab');
  }

  const stepNum = 'step-2';
  const prevRoot = document.getElementById('step-1');
  const root = document.getElementById(stepNum);
  root.innerHTML = '';
  const filterData = rfqCategories.filter(({ Type }) => Type.includes(tab) > 0);

  const defaultProgessValue = 70;
  const fetchRQFTypes = createRFQListBox(filterData, stepNum, stepThree);
  const progressBarHtml = createProgessBar(defaultProgessValue, stepNum);

  root.appendChild(h3('Please select the Instrument category'));
  root.appendChild(fetchRQFTypes);
  root.appendChild(progressBarHtml);
  root.appendChild(createBackBtn(stepNum));
  root.style.display = 'block';
  prevRoot.style.display = 'none';
}

export default async function decorate(block) {
  const isThankyouPage = block.classList.contains('thankyou');
  const htmlContentRoot = block.children[0].children[0].children[0];
  const parentSection = block.parentElement.parentElement;

  if (isThankyouPage) {
    parentSection.prepend(htmlContentRoot.children[0]);
    htmlContentRoot.remove();
    const htmlContent = block.children[0].children[0].innerHTML.trim();
    block.innerHTML = `<div class="rfq-product-wrapper">
    <div class="rfq-thankyou-msg">${htmlContent}</div>
    </div>`;
  } else {
    parentSection.prepend(htmlContentRoot);
    block.innerHTML = `
    <div id="step-1" class="rfq-product-wrapper"></div>
    <div id="step-2" class="rfq-product-wrapper" style="display: none;"></div>
    <div id="step-3" class="rfq-product-wrapper request-quote-form" style="display: none;"></div>`;
    stepOne(stepTwo);
  }
}
