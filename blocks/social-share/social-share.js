import { getMetadata } from '../../scripts/lib-franklin.js';
// eslint-disable-next-line object-curly-newline
import { a, div, i, li, p, ul } from '../../scripts/dom-helpers.js';

function getURL() {
  return encodeURIComponent(window.location.href);
}

function getTitle() {
  const h1 = document.querySelector('h1');
  return h1 ? encodeURIComponent(h1.textContent) : '';
}

function decorateLink(social, type, icon, url) {
  icon.setAttribute('aria-label', type);
  if (!url) return;

  social.append(
    a({
      href: url,
      'aria-label': `Share to ${type}`,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    icon,
    ),
  );
}

function decorateIcons(element) {
  const url = getURL();
  const title = getTitle();

  element.querySelectorAll('li').forEach((social) => {
    const type = social.getAttribute('data-type');
    const icon = social.querySelector('i');

    switch (type) {
      case 'facebook':
        decorateLink(social, 'Facebook', icon, `https://www.facebook.com/sharer/sharer.php?u=${url}`);
        break;
      case 'linkedin':
        decorateLink(social, 'LinkedIn', icon, `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`);
        break;
      case 'twitter':
        decorateLink(social, 'Twitter', icon, `https://www.twitter.com/share?&url=${url}&text=${title}`);
        break;
      case 'youtube-play':
        decorateLink(social, 'Youtube', icon, 'https://www.youtube.com/user/MolecularDevicesInc');
        break;
      case 'envelope':
        decorateLink(social, 'Google', icon);
        icon.classList.add('addthis-share-button');
        icon.setAttribute('data-service', 'email');
        break;
      default:
        break;
    }
  });
}

function blogHideSocialShareOnHero(block) {
  const heroBlock = document.querySelector('div.hero');
  if (!heroBlock) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      block.classList.add('social-share-hidden');
    } else {
      block.classList.remove('social-share-hidden');
    }
  });
  observer.observe(heroBlock);
}

export default function decorate(block) {
  const template = getMetadata('template').toLowerCase();

  let title = '';
  if (block.querySelector('.social-share p')) {
    title = block.querySelector('.social-share p').innerHTML;
  }

  const socials = template === 'blog'
    ? ['linkedin', 'facebook', 'twitter', 'youtube-play']
    : ['facebook', 'linkedin', 'twitter', 'envelope'];

  block.innerHTML = '';
  block.appendChild(
    div({ class: 'share-event' },
      p(title),
      div({ class: 'social-links' },
        ul({ class: 'button-container' },
          ...socials.map((social) =>
            // eslint-disable-next-line implicit-arrow-linebreak
            li({ class: `share-${social}`, 'data-type': social },
              i({ class: `fa fa-${social}` }),
            ),
          ),
        ),
      ),
    ),
  );

  decorateIcons(block);
  if (template === 'blog') {
    blogHideSocialShareOnHero(block);
  }
}
