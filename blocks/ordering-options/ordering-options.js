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

function renderItem(item, showStore) {
  if (!item) return '';

  return (
    div({ class: 'ordering-option-item', id: item.handle },
      div({ class: 'header' },
        h3({ class: 'title' }, item.title),
      ),
      div({ class: 'ordering-option-item-variants' },
        ...item.variants.map((variant) => div({ class: 'variant-item' },
          div({ class: 'title-variant' },
            p({ class: 'legend' }, variant.public_title),
          ),
          div({ class: 'sku-variant' },
            p({ class: 'legend' }, `#${variant.sku}`),
          ),
          (showStore) ? renderAddToCart(variant) : '',
        ),
        ),
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

async function renderList(options, showStore, container) {
  const items = [];
  options.forEach((option) => {
    items.push(renderItem(option, showStore));
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

function buildOrderingForm(options) {
  const orderContainer = document.querySelector('.order-container');
  if (!orderContainer) return;
  const optionTitles = options.map((option) => option.title);
  let variants = [];
  let selectedOption = null;
  let selectedVariant = null;

  const orderFormContainer = document.createElement('div');
  orderFormContainer.classList.add('order-container');
  orderContainer.appendChild(orderFormContainer);

  function updateVariantsDropdownLabel() {
    const variantDropDown = document.querySelector('#variantDropDown');
    if (variantDropDown) {
      variantDropDown.innerHTML = selectedVariant.title;
    }
  }

  function updateDropdownInnerHTML() {
    const optionsDropdown = document.querySelector('#optionsDropDown');
    if (optionsDropdown) {
      optionsDropdown.innerHTML = selectedOption.title;
    }
  }

  function handleVariantSelection(variant) {
    selectedVariant = variant;
    updateVariantsDropdownLabel();
    const priceContent = document.querySelector('.price');
    priceContent.innerHTML = `$ ${(variant.price / 100).toLocaleString('en-US')}.00`;
  }

  function checkOptionValidity() {
    if (selectedOption === 'Product Options') {
      const variantDropDown = document.getElementById('variantDropDown');
      variantDropDown.classList.toggle('not-allowed');
      selectedVariant = 'Select Variant';
      updateVariantsDropdownLabel();
    } else if (selectedOption !== 'Product Options') {
      const variantDropDown = document.getElementById('variantDropDown');
      variantDropDown.classList.add('allowed');
    }
  }

  function openDropdownMenu(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const optionsDropdown = document.querySelector('#optionsDropDown');
    if (dropdown && optionsDropdown.innerHTML !== 'Product Options') {
      dropdown.classList.toggle('show');
      if (dropdownId === 'variantsDropdown') {
        dropdown.style.left = '550px';
      }
    } else if (dropdownId === 'optionsDropdownContent') {
      dropdown.classList.toggle('show');
    }
    checkOptionValidity();
  }

  function handleOptionSelection(option) {
    selectedOption = option;
    updateDropdownInnerHTML();
    checkOptionValidity();
    const variantsContent = document.querySelector('#variantsDropdown');
    variantsContent.replaceChildren();
    for (let j = 0; j < option.variants.length; j += 1) {
      const variant = document.createElement('a');
      variant.innerHTML = option.variants[j].title;
      variant.classList.add('option');
      variant.addEventListener('click', () => handleVariantSelection(option.variants[j]));
      variantsContent.appendChild(variant);
    }
  }

  window.onclick = function CloseDropDownMenu(event) {
    if (!event.target.matches('.drop-down')) {
      const dropdowns = document.getElementsByClassName('product-options-content');
      for (let k = 0; k < dropdowns.length; k += 1) {
        const openDropdown = dropdowns[k];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  };

  // Options dropdown
  const optionsDropdown = document.createElement('button');
  optionsDropdown.innerHTML = 'Product Options';
  optionsDropdown.id = 'optionsDropDown';
  optionsDropdown.onclick = () => openDropdownMenu('optionsDropdownContent');
  optionsDropdown.classList.add('drop-down');
  orderFormContainer.appendChild(optionsDropdown);

  const optionsContent = document.createElement('div');
  optionsContent.classList.add('product-options-content');
  optionsContent.id = 'optionsDropdownContent';
  orderFormContainer.appendChild(optionsContent);
  for (let l = 0; l < optionTitles.length; l += 1) {
    const option = document.createElement('a');
    option.innerHTML = optionTitles[l];
    option.classList.add('option');
    option.addEventListener('click', () => handleOptionSelection(options[l]));
    optionsContent.appendChild(option);
  }
  // Variants dropdown
  const variantDropDown = document.createElement('button');
  variantDropDown.innerHTML = 'Select Variation';
  variantDropDown.id = 'variantDropDown';
  variantDropDown.onclick = () => openDropdownMenu('variantsDropdown');
  variantDropDown.classList.add('drop-down');
  orderFormContainer.appendChild(variantDropDown);

  const variantsContent = document.createElement('div');
  variantsContent.classList.add('product-options-content');
  variantsContent.id = 'variantsDropdown';
  orderFormContainer.appendChild(variantsContent);

  const priceLabel = document.createElement('label');
  priceLabel.classList.add('price-label');
  priceLabel.innerHTML = 'PRICE';
  orderFormContainer.appendChild(priceLabel);

  const quantityLabel = document.createElement('label');
  quantityLabel.classList.add('quantity-label');
  quantityLabel.innerHTML = 'QUANTITY';
  orderFormContainer.appendChild(quantityLabel);

  const price = document.createElement('span');
  price.classList.add('price');
  price.innerHTML = '$ 0.00';
  orderFormContainer.appendChild(price);

  const quantityContainer = document.createElement('div');
  quantityContainer.classList.add('quantity-container');
  orderFormContainer.appendChild(quantityContainer);

  const decreaseButton = document.createElement('a');
  decreaseButton.classList.add('quantity-button');
  decreaseButton.innerHTML = '-';
  quantityContainer.appendChild(decreaseButton);

  const quantityNumber = document.createElement('span');
  quantityNumber.classList.add('quantity-number');
  quantityNumber.innerHTML = '1';
  quantityContainer.appendChild(quantityNumber);

  const increaseButton = document.createElement('a');
  increaseButton.classList.add('quantity-button');
  increaseButton.innerHTML = '+';
  quantityContainer.appendChild(increaseButton);

  increaseButton.addEventListener('click', () => {
    let currentQuantity = parseInt(quantityNumber.innerHTML, 10);
    currentQuantity += 1;
    quantityNumber.innerHTML = currentQuantity;
  });

  decreaseButton.addEventListener('click', () => {
    let currentQuantity = parseInt(quantityNumber.innerHTML, 10);
    if (currentQuantity > 1) {
      currentQuantity -= 1;
      quantityNumber.innerHTML = currentQuantity;
    }
  });
  const addToCartButton = document.createElement('button');
  addToCartButton.addEventListener('click', () => addToCart(selectedVariant, quantityNumber));
  addToCartButton.classList.add('add-to-cart');
  addToCartButton.innerHTML = 'Add to cart';
  orderFormContainer.appendChild(addToCartButton);
}

export default async function decorate(block) {
  const refs = [...block.querySelectorAll('.ordering-options > div > div')]
    .map((ref) => (ref.innerHTML).split(', '))
    .reduce((x, y) => x.concat(y), []);

  block.innerHTML = '';

  const container = div({ class: 'ordering-options-list' });
  block.append(container);

  const showStore = detectStore();
  const orderingOptions = await getOrderingOptions(refs);
  renderList(orderingOptions, showStore, container);
  const options = orderingOptions.filter((o) => !!o);
  buildOrderingForm(options);
  if (showStore) {
    block.classList.add('cart-store');
    await getCartDetails();
    updateCounters();

    // cart visible everywhere in product page
    const productsMain = document.querySelector('.product main');
    if (productsMain) productsMain.append(renderCartWidget());
  }
}
