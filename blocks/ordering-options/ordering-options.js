import { detectStore, getCartItemCount, setCookie } from '../../scripts/scripts.js';
import {
  a, div, domEl, h3, i, p, span,
} from '../../scripts/dom-helpers.js';

const SHOP_BASE_URL = 'https://shop.moleculardevices.com';
const COOKIE_NAME_CART_ITEM_COUNT = 'cart-item-count';

function increaseAndDecreaseCounter(event) {
  const btnContainer = event.target.closest('span');
  const counterEl = btnContainer.parentElement.querySelector('.count');
  const counter = parseInt(counterEl.textContent, 10) || 1;
  if (btnContainer.classList.contains('up')) {
    counterEl.textContent = counter + 1;
  } else {
    counterEl.textContent = (counter > 1) ? counter - 1 : 1;
  }
}

async function updateCounters() {
  const count = getCartItemCount();
  const cartCounters = document.querySelectorAll('.cart-count');
  if (cartCounters) {
    cartCounters.forEach((cartCounter) => {
      cartCounter.textContent = count;
    });
  }
}

async function getCartDetails() {
  return new Promise((resolve) => {
    const script = domEl('script',
      {
        src: `${SHOP_BASE_URL}/cart.json?callback=cartDetails`,
      },
    );

    /* eslint-disable dot-notation */
    window['cartDetails'] = (data) => {
      document.getElementsByTagName('head')[0].removeChild(script);
      delete window['cartDetails'];
      setCookie(COOKIE_NAME_CART_ITEM_COUNT, data.item_count || 0);
      resolve(data);
    };
    /* eslint-enable dot-notation */

    document.getElementsByTagName('head')[0].appendChild(script);
  });
}

async function addToCart(event) {
  const el = event.target;
  const counterEl = el.closest('.variant-item-store-content').querySelector('.variant-item-store-count .count');
  const counter = parseInt(counterEl.textContent, 10) || 1;
  const itemId = el.getAttribute('id');

  await new Promise((resolve) => {
    const script = domEl('script',
      {
        src: `${SHOP_BASE_URL}/cart/add.js?${new URLSearchParams({
          id: itemId,
          quantity: counter,
          _: Date.now(),
          callback: 'addToCart',
        })}`,
        onload: () => {
          resolve();
        },
      },
    );
    document.getElementsByTagName('head')[0].appendChild(script);
    setTimeout(() => document.getElementsByTagName('head')[0].removeChild(script));
  });

  await getCartDetails();
  updateCounters();
}

function renderAddToCart(item) {
  if (!item) return '';

  return (
    div({ class: 'variant-item-store' },
      div({ class: 'variant-item-store-header' },
        p({ class: 'legend' }, `$${(item.price / 100).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })} USD`),
      ),
      div({ class: 'variant-item-store-content' },
        div({ class: 'variant-item-store-count' },
          span({ class: 'down' }, i({ class: 'fa fa-minus', data: item.id })),
          span({ class: 'count', id: item.id }, 1),
          span({ class: 'up' }, i({ class: 'fa fa-plus', data: item.id })),
        ),
        div({ class: 'variant-item-store-add-to-cart' },
          a({
            class: 'button primary',
            id: item.id,
            name: 'Add to cart',
          }, 'Add to cart'),
        ),
      ),
    )
  );
}

function renderItem(item, showStore, itemDescriptionsMap) {
  if (!item) return '';
  return (
    div({ class: 'ordering-option-item', id: item.handle },
      div({ class: 'header' },
        h3({ class: 'title' }, item.title),
      ),
      div({ class: 'ordering-option-item-variants' },
        ...item.variants.map((variant) => (
          div({ class: 'variant-item' },
            div({ class: 'title-variant' },
              p({ class: 'legend' }, variant.public_title || variant.name),
              div({ class: 'specs' },
                itemDescriptionsMap.get(`#${variant.sku}`) || '',
              ),
            ),
            div({ class: 'sku-variant' },
              p({ class: 'legend' }, `#${variant.sku}`),
            ),
            (showStore) ? renderAddToCart(variant) : '',
          )
        )),
      ),
    )
  );
}

function renderCartWidget() {
  return (
    div({ class: 'cart-widget' },
      span({ class: 'cart-count' }, getCartItemCount()),
      a({
        href: `${SHOP_BASE_URL}/cart`,
        target: '_blank',
        name: 'Cart',
        rel: 'noopener noreferrer',
      }, i({ class: 'fa fa-shopping-cart' }),
      ),
    )
  );
}

function fetchOption(option) {
  return fetch(`${SHOP_BASE_URL}/products/${option}.js`, {
    mode: 'cors',
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn(`Could not fetch ordering details for option ${option}, got status ${err.status}.`, err.statusText);
  });
}

async function fetchOptionIntoArray(array, idx, option) {
  array[idx] = await fetchOption(option.trim());
}

async function getOrderingOptions(refs) {
  const options = new Array(refs.length);
  await Promise.all(refs
    .map((option, idx) => fetchOptionIntoArray(options, idx, option)),
  );
  return options;
}

async function renderList(refs, showStore, container, itemDescriptionsMap) {
  const options = await getOrderingOptions(refs);
  const items = [];
  options.forEach((option) => {
    items.push(renderItem(option, showStore, itemDescriptionsMap));
  });
  container.append(...items);

  const counterButtons = document.querySelectorAll('.ordering-options .variant-item-store-count > span > i');
  [...counterButtons].forEach((counterButton) => {
    counterButton.addEventListener('click', (e) => {
      increaseAndDecreaseCounter(e);
    });
  });

  const addToCartButtons = document.querySelectorAll('.ordering-options .variant-item-store-add-to-cart > a');
  [...addToCartButtons].forEach((addToCartButton) => {
    addToCartButton.addEventListener('click', (e) => {
      addToCart(e);
    });
  });
}

export default async function decorate(block) {
  // first table should be  | shopify-handles | comma separated values |
  const shopifyHandlesValues = block.children[0].children[1];
  const refs = shopifyHandlesValues.textContent
    .replace(' ', '')
    .split(',')
    .map((ref) => ref.trim());

  const itemDescriptionsMap = new Map();
  [...block.children].forEach((item, idx) => {
    if (!idx) return; // first line is with shopify handlers.

    const productCode = item.children[0].textContent.trim();
    const productDescription = item.children[1];
    itemDescriptionsMap.set(productCode, productDescription);
  });

  block.innerHTML = '';

  const container = div({ class: 'ordering-options-list' });
  block.append(container);

  const showStore = detectStore();
  await renderList(refs, showStore, container, itemDescriptionsMap);

  if (showStore) {
    block.classList.add('cart-store');
    await getCartDetails();
    updateCounters();

    // cart visible everywhere in product page
    const productsMain = document.querySelector('.product main');
    if (productsMain) productsMain.append(renderCartWidget());
  }
}
