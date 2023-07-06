/* eslint-disable no-plusplus */
import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
import {
  detectStore,
  formatDate,
  isVideo,
  videoButton,
  getOrderingOptions,
  getCartDetails,
  updateCounters,
} from '../../scripts/scripts.js';
import { div, domEl, img } from '../../scripts/dom-helpers.js';

const SHOP_BASE_URL = 'https://shop.moleculardevices.com';

function addMetadata(container) {
  const metadataContainer = document.createElement('div');
  metadataContainer.classList.add('metadata');

  const publishDate = formatDate(getMetadata('publication-date'), { month: 'long' });

  const publishDateContainer = document.createElement('div');
  publishDateContainer.innerHTML = `
    <i class="fa fa-calendar"></i>
    <span class="blog-publish-date">${publishDate}</span>
  `;
  metadataContainer.appendChild(publishDateContainer);

  const author = getMetadata('author');
  if (author) {
    const authorContainer = document.createElement('div');
    authorContainer.innerHTML = `
      <i class="fa fa-user"></i>
      <span class="blog-author">${author}</span>
    `;
    metadataContainer.appendChild(authorContainer);
  }

  container.appendChild(metadataContainer);
}

async function addToCart(el, counterEl) {
  const counter = parseInt(counterEl.textContent, 10) || 1;
  const itemId = el.id;

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

async function addBlockSticker(container) {
  const stickerContainer = document.createElement('div');
  stickerContainer.classList.add('sticker');
  const sticker = document.createElement('a');
  sticker.href = '/lab-notes';

  const stickerPicture = document.createElement('picture');
  stickerPicture.innerHTML = `
    <source type="image/webp" srcset="/images/lab-notes-hero-sticker.webp">
    <img loading="lazy" alt="Molecular Devices Lab Notes" type="image/png" src="/images/lab-notes-hero-sticker.png">
  `;
  sticker.appendChild(stickerPicture);
  stickerContainer.appendChild(sticker);
  container.appendChild(stickerContainer);
}

async function loadBreadcrumbs(breadcrumbsContainer) {
  const breadCrumbsModule = await import('../breadcrumbs/breadcrumbs-create.js');
  breadCrumbsModule.default(breadcrumbsContainer);
}

function detectPricingRequestAvailable() {
  if (!localStorage.getItem('ipstack:geolocation')) {
    return false;
  }

  try {
    const contient = JSON.parse(localStorage.getItem('ipstack:geolocation')).continent_code;
    return contient === 'EU' || contient === 'NA';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Could not load user information.', err);
    return false;
  }
}

function showHidePricingRequestButton(block) {
  const pricingRequestButton = block.querySelector('a[href*="/quote-request"]');
  if (!pricingRequestButton) return;

  const pricintRequestButtonContainer = pricingRequestButton.closest('.button-container');
  if (!pricintRequestButtonContainer) return;

  if (!detectPricingRequestAvailable()) {
    pricintRequestButtonContainer.style.display = 'none';
  } else {
    pricintRequestButtonContainer.style.display = '';
  }
}

export async function buildHero(block) {
  const inner = document.createElement('div');
  inner.classList.add('hero-inner');
  const container = document.createElement('div');
  container.classList.add('container');

  if (detectStore()) {
    const buttonContainer = document.querySelector('.button-container');
    if (buttonContainer) {
      buttonContainer.parentElement.removeChild(buttonContainer);
    }
  }

  let picture = block.querySelector('picture');
  if (picture) {
    const originalHeroBg = picture.lastElementChild;
    const optimizedHeroBg = createOptimizedPicture(
      originalHeroBg.src,
      originalHeroBg.getAttribute('alt'),
      true,
      [
        { media: '(min-width: 600px)', width: '2000' },
        { width: '1200' },
      ],
    );

    picture.replaceWith(optimizedHeroBg);
    picture = optimizedHeroBg;
    picture.classList.add('hero-background');
    inner.prepend(picture.parentElement);
  } else {
    inner.classList.add('white-bg');
  }

  const rows = block.children.length;
  [...block.children].forEach((row, i) => {
    if (i === (rows - 1)) {
      if (row.childElementCount > 1) {
        container.classList.add('two-column');
        [...row.children].forEach((column, y) => {
          const image = column.querySelector('img');
          if (y === 1 && image && block.classList.contains('hero')) {
            container.classList.add('right-image');
            image.addEventListener('click', () => {
              const downloadForm = document.querySelector('.download-form');
              if (downloadForm) downloadForm.scrollIntoView(true);
            });
          }
          [...column.querySelectorAll('a')].forEach((link) => {
            const url = new URL(link);
            if (isVideo(url)) {
              const videoContainer = link.closest('div');
              videoContainer.classList.add('video-column');
              const videoIcon = div({ class: 'video-icon' }, img({ src: '/images/play_icon.png' }));
              videoContainer.appendChild(videoIcon);
              videoButton(videoContainer, videoContainer.querySelector('img'), url);
              link.remove();
            }
          });
          container.appendChild(column);
        });
      } else {
        if (row.querySelector('h1:last-child')) inner.classList.add('short');
        container.appendChild(row);
      }
    } else {
      row.remove();
    }
  });

  // TODO
  // remove US cookie when finished
  // add to cart button functionality

  async function buildOrderingForm(options) {
    const optionTitles = options.map((option) => option.title);
    const variants = [1, 2, 3];
    let selectedOption = null;
    let selectedVariant = null;

    const orderFormContainer = document.createElement('div');
    orderFormContainer.classList.add('order-container');
    container.appendChild(orderFormContainer);

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
      const variantsContent = block.querySelector('#variantsDropdown');
      variantsContent.replaceChildren();
      for (let i = 0; i < variants.length; i++) {
        const variant = document.createElement('a');
        variant.innerHTML = option.variants[i].title;
        variant.classList.add('option');
        variant.addEventListener('click', () => handleVariantSelection(option.variants[i]));
        variantsContent.appendChild(variant);
      }
    }

    function handleVariantSelection(variant) {
      selectedVariant = variant;
      updateVariantsDropdownLabel();
      const priceContent = block.querySelector('.price');
      priceContent.innerHTML = `$ ${(variant.price / 100).toLocaleString('en-US')}.00`;
    }

    function updateDropdownInnerHTML() {
      if (optionsDropdown) {
        optionsDropdown.innerHTML = selectedOption.title;
      }
    }

    function updateVariantsDropdownLabel() {
      if (variantDropDown) {
        variantDropDown.innerHTML = selectedVariant.title;
      }
    }

    window.onclick = function CloseDropDownMenu(event) {
      if (!event.target.matches('.drop-down')) {
        const dropdowns = document.getElementsByClassName('product-options-content');
        let i;
        for (i = 0; i < dropdowns.length; i++) {
          const openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    };

    // Options dropdown
    const optionsDropdown = document.createElement('button');
    optionsDropdown.innerHTML = 'Product Options';
    optionsDropdown.onclick = () => openDropdownMenu('optionsDropdownContent');
    optionsDropdown.classList.add('drop-down');
    orderFormContainer.appendChild(optionsDropdown);

    const optionsContent = document.createElement('div');
    optionsContent.classList.add('product-options-content');
    optionsContent.id = 'optionsDropdownContent';
    orderFormContainer.appendChild(optionsContent);
    for (let i = 0; i < optionTitles.length; i++) {
      const option = document.createElement('a');
      option.innerHTML = optionTitles[i];
      option.classList.add('option');
      option.addEventListener('click', () => handleOptionSelection(options[i]));
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
      currentQuantity++;
      quantityNumber.innerHTML = currentQuantity;
    });

    decreaseButton.addEventListener('click', () => {
      let currentQuantity = parseInt(quantityNumber.innerHTML, 10);
      if (currentQuantity > 1) {
        currentQuantity--;
        quantityNumber.innerHTML = currentQuantity;
      }
    });
    const addToCartButton = document.createElement('button');
    addToCartButton.addEventListener('click', () => addToCart(selectedVariant, quantityNumber));
    addToCartButton.classList.add('add-to-cart');
    addToCartButton.innerHTML = 'Add to cart';
    orderFormContainer.appendChild(addToCartButton);
  }

  // check if block containt Orange Buttons
  const orangeButtons = block.classList.contains('orange-buttons');

  function hasOrderingOptions() {
    return block.parentNode.parentNode.parentNode.querySelector('.ordering-options') !== null
        && block.parentNode.parentNode.querySelector('.order');
  }

  if (orangeButtons) {
    if (detectStore() && hasOrderingOptions()) {
      const refs = [...block.parentNode.parentNode.parentNode.querySelectorAll('.ordering-options > div > div')]
        .map((ref) => (ref.innerHTML).split(', '))
        .reduce((x, y) => x.concat(y), []);
      const orderingOptions = await getOrderingOptions(refs);
      const options = orderingOptions.filter((o) => !!o);
      buildOrderingForm(options);
    }
  }

  const breadcrumbs = document.createElement('div');
  breadcrumbs.classList.add('breadcrumbs');

  block.appendChild(inner);
  inner.appendChild(breadcrumbs);
  inner.appendChild(container);

  if (block.classList.contains('blog')) {
    addMetadata(container);
    addBlockSticker(breadcrumbs);
    block.parentElement.appendChild(container);
  }

  showHidePricingRequestButton(block);
  document.addEventListener('geolocationUpdated', () => {
    showHidePricingRequestButton(block);
  });

  loadBreadcrumbs(breadcrumbs);
}

export default async function decorate(block) {
  await buildHero(block);
}
