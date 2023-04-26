import ffetch from '../../scripts/ffetch.js';
import { createCarousel } from '../carousel/carousel.js';
import { renderBlogCard } from '../../templates/blog/blog.js';

export default async function decorate(block) {
  let blogs = await ffetch('/query-index.json')
    .sheet('blog')
    .limit(6)
    .all();
  blogs = blogs.filter((blog) => blog.path !== window.location.pathname).slice(0, 5);

  await createCarousel(
    block,
    blogs,
    {
      navButtons: true,
      dotButtons: false,
      infiniteScroll: true,
      autoScroll: false,
      defaultStyling: true,
      visibleItems: [
        {
          items: 1,
          condition: () => window.screen.width < 768,
        },
        {
          items: 2,
          condition: () => window.screen.width < 1200,
        }, {
          items: 3,
        },
      ],
      renderItem: renderBlogCard,
    },
  );
}
