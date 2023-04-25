import {
  a, div, h3, i, p, span
} from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';


function renderBlockTeaser(blogData) {
  return (
    div({ class: 'blog-teaser-item' },
      div({ class: 'blog-teaser-thumb' },
        a({ href: blogData.path },
            createOptimizedPicture(blogData.thumbnail, blogData.header),
        ),
      ),
      div({ class: 'blog-teser-caption' },
        h3(blogData.header),
        div({ class: 'metadata' },
          div(
            i({ class: 'fa fa-calendar'}),
            span({ class: 'blog-publish-date' }, blogData.publicationDate),
          ),
          div(
            i({ class: 'fa fa-user'}),
            span({ class: 'blog-author' }, blogData.author),
          ),
        ),
        p(blogData.description),
        p({ class: 'button-container' },
          a(
            { href: blogData.path,
              'aria-label': blogData.c2aButtonText,
              class: 'button primary'
            },
            blogData.c2aButtonText
          ),
        ),
      ),
    )
  )
}

async function fetchBlog(path) {
  const response = await fetch(path);
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('error loading blog', response);
    return null;
  }
  const text = await response.text();
  if (!text) {
    // eslint-disable-next-line no-console
    console.error('blog empty', path);
    return null;
  }
  return text;
}

export default async function decorate(block) {
  const blogPostLinks = [...block.querySelectorAll('a')];

  const blogPosts = {}
  await Promise.all(blogPostLinks.map(async (blogPostLink) => {
    console.log(`fetching ${blogPostLink.href}`);
    const fragmentHtml = await fetchBlog(blogPostLink.href);
    if (fragmentHtml) {
      const fragmentElement = div();
      fragmentElement.innerHTML = fragmentHtml;
      const header = fragmentElement.querySelector('h1').textContent;
      const thumbnail = fragmentElement.querySelector('meta[name="thumbnail"]')
        .getAttribute('content');
      const description = fragmentElement.querySelector('meta[name="description"]')
        .getAttribute('content');
      const c2aButtonText = fragmentElement.querySelector('meta[name="card-c2a"]')
        .getAttribute('content');
      const publicationDate = fragmentElement.querySelector('meta[name="publication-date"]')
        .getAttribute('content');
      const author = fragmentElement.querySelector('meta[name="author"]')
        .getAttribute('content');

      blogPosts[blogPostLink.href] = {
        path: blogPostLink.href,
        header,
        thumbnail,
        description,
        c2aButtonText,
        publicationDate,
        author,
      };
    }
  }));

  blogPostLinks.forEach(blogPostLink => {
    blogPostLink.replaceWith(
      renderBlockTeaser(blogPosts[blogPostLink.href]),
    );
  });
}
