import ffetch from '../../scripts/ffetch.js';
import { getMetadata } from '../../scripts/lib-franklin.js';
import { createCard } from '../card/card.js';
import { createCarousel } from '../carousel/carousel.js';

class RelatedProductsList {
  constructor(block, config, data) {
    this.headings = false;
    this.data = data;
    this.block = block;
    Object.assign(this, config);
  }

  async render() {
    this.carousel = await createCarousel(
      this.block,
      this.data,
      {
        infiniteScroll: true,
        navButtons: false,
        dotButtons: false,
        autoScroll: false,
        renderItem: (item) => item,
      },
    );

    window.matchMedia('only screen and (max-width: 767px)').onchange = (e) => {
      if (e.matches) {
        this.carousel.setInitialScrollingPosition();
      }
    };
  }
}

export default async function decorate(block) {
  const relatedProductsMeta = getMetadata('related-products');
  const relatedProductsTitles = relatedProductsMeta.split(',').map((item) => item.trim());
  const relatedCategoriesMeta = getMetadata('related-categories');
  const relatedCategoriesTitles = relatedCategoriesMeta.split(',').map((item) => item.trim());

  const allProductTitles = [...relatedProductsTitles, ...relatedCategoriesTitles];

  const products = await ffetch('/query-index.json')
    .sheet('products')
    .filter((product) => allProductTitles.includes(product.identifier || product.h1))
    .all();

  const categories = await ffetch('/query-index.json')
    .sheet('categories')
    .filter((category) => relatedCategoriesTitles.includes(category.identifier || category.h1))
    .all();

  const allItems = [...products, ...categories];

  const cardRenderer = await createCard({
    descriptionLength: 75,
    c2aLinkStyle: true,
    defaultButtonText: 'Details',
  });

  const renderedCards = allItems.map((product) => {
    product.type = product.category;
    if (product.subCategory && !['0', 'Other'].includes(product.subCategory)) {
      product.type = product.subCategory;
    } else if (product.category && !['0', 'Other'].includes(product.category)) {
      product.type = product.category;
    } else {
      product.type = product.h1;
    }
    return cardRenderer.renderItem(product);
  });

  const relatedProductsList = new RelatedProductsList(block, {
    infiniteScroll: true,
    navButtons: false,
    dotButtons: false,
    autoScroll: false,
    renderItem: (item) => item,
  }, renderedCards);
  await relatedProductsList.render();
}
