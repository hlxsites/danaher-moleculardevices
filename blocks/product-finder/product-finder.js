import ffetch from '../../scripts/ffetch.js';
import {
  decorateIcons, toClassName,
} from '../../scripts/lib-franklin.js';
import {
  a, div, h3, img, li, span, strong,
} from '../../scripts/dom-helpers.js';
import { createCard } from '../card/card.js';
import renderFiltersRow from './filters.js';

const STEP_PREFIX = 'step';
const ACTIVE_CLASS = 'active';
const HIDDEN_CLASS = 'hidden';
const CHECKED_CLASS = 'checked';
const DEFAULT_TITLE = 'Select a Product Type';
const PRODUCT_FINDER_URL = '/product-finder/product-finder.json';

function getListIdentifier(tabName) {
  return toClassName(tabName);
}

function renderIconItem(item, progressStep, callback) {
  return (
    div(
      { class: 'card icon-card' },
      a({
        class: 'icon-link',
        id: item.id,
        href: progressStep === 'step-1' ? '#step-2' : '#step-3',
        'data-tab': item.type,
        'data-title': item.title,
        onclick: callback,
      },
      span({ class: 'icon-img' },
        img({
          src: item.image,
          alt: item.title,
        }),
      ),
      span({ class: 'icon-title' }, item.title),
      ),
    )
  );
}

async function renderIconCards(listArr, progressStep, tabName, callback) {
  const list = div({
    class: 'product-finder-list',
    'data-card-type': getListIdentifier(tabName),
  });

  listArr.forEach((item) => {
    item.title = progressStep === `${STEP_PREFIX}-1` ? item.title : item.category;
    item.id = toClassName(item.type);
  });

  const cardRenderer = await createCard({
    renderItem: renderIconItem,
  });
  listArr.forEach((rfq) => {
    list.append(cardRenderer.renderItem(rfq, progressStep, callback));
  });
  return list;
}

function startOver(e) {
  e.preventDefault();

  const currentTab = document.querySelector('.product-finder-step-wrapper.active');
  const firstTab = document.getElementById(`${STEP_PREFIX}-1`);
  const backBtn = document.querySelector('.product-finder-container .reset');
  currentTab.style.display = 'none';
  firstTab.style.display = 'block';
  backBtn.classList.add(HIDDEN_CLASS);
  firstTab.classList.add(ACTIVE_CLASS);
  currentTab.classList.remove(ACTIVE_CLASS);

  const titleEl = document.querySelector('.product-finder-wrapper .product-finder-tab-title');
  titleEl.innerHTML = DEFAULT_TITLE;

  const progressCheckList = document.querySelectorAll(`.product-finder-container a.${CHECKED_CLASS}`);
  progressCheckList.forEach((check) => {
    check.classList.remove(CHECKED_CLASS);
  });

  const progressCustomTexts = document.querySelectorAll('.product-finder-container .step-custom-text');
  progressCustomTexts.forEach((progressCustomText) => {
    progressCustomText.remove();
  });

  firstTab.querySelector('.product-finder-list').classList.remove(HIDDEN_CLASS);
}

function renderResetButton(callback) {
  return a(
    {
      id: 'start-over',
      class: 'reset',
      href: `#${STEP_PREFIX}-1`,
      onclick: callback,
    },
    span({ class: 'icon icon-fa-arrow-circle-left' }),
    'Start Over',
  );
}

function getTabName(el) {
  const linkEl = el.classList.contains('.icon-link') ? el : el.closest('.icon-link');
  return linkEl.getAttribute('data-tab');
}

function getTabTitle(el) {
  const linkEl = el.classList.contains('.icon-link') ? el : el.closest('.icon-link');
  return linkEl.getAttribute('data-title');
}

function switchTab(tab, stepNum, prevStepNum, title) {
  const root = document.getElementById(stepNum);
  const prevRoot = document.getElementById(prevStepNum);
  const backBtn = document.querySelector('.product-finder-container .reset');
  root.style.display = 'block';
  prevRoot.style.display = 'none';
  backBtn.classList.remove(HIDDEN_CLASS);
  prevRoot.classList.remove(ACTIVE_CLASS);
  root.classList.add(ACTIVE_CLASS);

  if (title) {
    const titleEl = document.querySelector('.product-finder-wrapper .product-finder-tab-title');
    titleEl.innerHTML = title.replace('tab', tab);
  }

  document.querySelector(`.product-finder-container .progress-${prevStepNum}`).classList.add(CHECKED_CLASS);
  document.querySelector(`.product-finder-container .progress-${prevStepNum} + span.step-text`).append(
    span({ class: 'step-custom-text' }, ': ', strong(tab),
    ),
  );

  const iconLists = prevRoot.querySelectorAll('.product-finder-list');
  iconLists.forEach((iconList) => {
    iconList.classList.add(HIDDEN_CLASS);
  });

  return root;
}

async function getCategories(tab) {
  const categories = await ffetch(PRODUCT_FINDER_URL).sheet('categories').all();
  return categories.filter(({ type }) => type.includes(tab) > 0);
}

async function getProducts(filterType, filterCategory) {
  return ffetch('/query-index.json')
    .sheet('product-finder')
    .withFetch(fetch)
    .filter(({ productType }) => productType.includes(filterType))
    .filter(({ category }) => category.includes(filterCategory))
    .all();
}

// This is needed because Reagents and Media categories use the same type and category
// They are present in the same step as Assay Kits, which uses a different category and type
// In order to solve this without code we would need a new column in the
// product-finder categories sheet, to represent the name of the product finder card
// and change category to 'Culture Media and Reagents' for the Reagents and Media
// We would also need to change the types sheet because we need the type to be Media, but we also
// need it to be present in the same second step as Assay kits. This is not supported by the logic.
function handleReagentsAndMediaDataInconsistency(type, category) {
  if (type === 'Assay Kits' && (category === 'Reagents' || category === 'Media')) {
    return ['Media', 'Culture Media and Reagents'];
  }
  return [type, category];
}

/* step three */
async function stepThree(e) {
  e.preventDefault();

  const stepNum = `${STEP_PREFIX}-3`;
  const prevStepNum = `${STEP_PREFIX}-2`;

  let type = getTabName(e.target);
  let category = getTabTitle(e.target);
  const root = switchTab(category, stepNum, prevStepNum, 'Select Product');

  const originalType = type;
  const originalCategory = category;
  [type, category] = handleReagentsAndMediaDataInconsistency(type, category);

  root.setAttribute('data-type', type);
  root.setAttribute('data-category', category);

  const dataCardType = getListIdentifier(`${type}-${category}-products`);
  const lists = root.querySelectorAll('.product-finder-list');
  lists.forEach((list) => {
    const listCardType = list.attributes['data-card-type'].value;
    if (listCardType !== dataCardType) {
      list.remove();
      const count = root.querySelector(`.result-count[data-card-type="${listCardType}"]`);
      count.remove();
      const filters = root.querySelector(`.finder-filters[data-card-type="${listCardType}"]`);
      if (filters) filters.remove();
    }
  });

  const products = await getProducts(type, category);

  let list = root.querySelector(`.product-finder-list[data-card-type="${dataCardType}"]`);
  if (list) {
    list.classList.remove(HIDDEN_CLASS);
  } else {
    list = div({
      class: 'product-finder-list',
      'data-card-type': dataCardType,
    });
    const cardRenderer = await createCard({
      c2aLinkStyle: true,
      defaultButtonText: 'Request Quote',
    });
    products.forEach((product) => {
      product.c2aLinkConfig = {
        href: `https://www.moleculardevices.com/quote-request?pid=${product.familyID}`,
        'aria-label': 'Request Quote',
        target: '_blank',
        rel: 'noopener noreferrer',
      };
      const card = cardRenderer.renderItem(product);
      // add product path attribute
      card.setAttribute('data-product-path', product.path);
      list.append(card);
    });
  }

  const count = root.querySelector(`.result-count[data-card-type="${dataCardType}"]`);
  if (count) count.remove();

  let filters = root.querySelector(`.finder-filters[data-card-type="${dataCardType}"]`);
  if (!filters) {
    filters = await renderFiltersRow(originalCategory, originalType, products, dataCardType);
  }

  const totalCount = span(
    { class: 'result-count', 'data-card-type': dataCardType },
    `${list.children.length} Results`,
  );

  if (filters) root.append(filters);
  root.append(totalCount);
  root.append(list);
}

/* step two */
async function stepTwo(e) {
  e.preventDefault();

  const type = getTabName(e.target);
  const title = getTabTitle(e.target);
  const stepNum = `${STEP_PREFIX}-2`;
  const prevStepNum = `${STEP_PREFIX}-1`;
  const root = switchTab(title, stepNum, prevStepNum, 'Select tab Category');

  // generate the icons only once
  const dataCardType = getListIdentifier(`${type}`);

  // get all product-finder-list
  const lists = root.querySelectorAll('.product-finder-list');
  lists.forEach((list) => {
    if (list.attributes['data-card-type'].value !== dataCardType) {
      list.remove();
    }
  });

  const list = root.querySelector(`.product-finder-list[data-card-type="${dataCardType}"]`);
  if (list) {
    list.classList.remove(HIDDEN_CLASS);
  } else {
    const categories = await getCategories(type);
    root.append(await renderIconCards(categories, stepNum, type, stepThree));
  }
}

/* step one */
async function stepOne(callback) {
  const stepNum = `${STEP_PREFIX}-1`;
  const root = document.getElementById(stepNum);

  const types = await ffetch(PRODUCT_FINDER_URL).sheet('types').all();
  root.append(await renderIconCards(types, stepNum, '', callback));
}

export default async function decorate(block) {
  block.prepend(
    h3({ class: 'product-finder-tab-title' }, DEFAULT_TITLE),
  );

  const progressSteps = block.querySelectorAll('ul li');
  progressSteps.forEach((progressStep, idx) => {
    const step = li(
      a({ class: `progress-step progress-step-${idx + 1}` }),
      span({ class: 'step-text' }, progressStep.innerHTML),
    );
    progressStep.replaceWith(step);
  });

  const resetBtn = renderResetButton(startOver);
  block.append(resetBtn);
  decorateIcons(resetBtn);

  block.appendChild(
    div(
      div({
        id: `${STEP_PREFIX}-1`,
        class: 'product-finder-step-wrapper active',
      }),
      div({
        id: `${STEP_PREFIX}-2`,
        class: 'product-finder-step-wrapper',
        style: 'display: none;',
      }),
      div({
        id: `${STEP_PREFIX}-3`,
        class: 'product-finder-step-wrapper',
        style: 'display: none;',
      }),
    ),
  );
  stepOne(stepTwo);
}
