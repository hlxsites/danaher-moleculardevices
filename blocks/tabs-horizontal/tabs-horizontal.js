import { a, div, li, ul } from "../../scripts/dom-helpers.js";
import { decorateButtons, decorateIcons } from "../../scripts/lib-franklin.js";
import { decorateLinks, fetchFragment, processSectionMetadata } from "../../scripts/scripts.js";

const classActive = 'active';

function handleTabClick(e, idx) {
  e.preventDefault();
  const target = e.target;
  [...target.closest('.tabs-nav').children].forEach((nav) => nav.classList.remove(classActive));
  target.closest('.tabs-nav-item').classList.add(classActive);
  const panes = target.closest('.tabs-horizontal').querySelectorAll('.tab-pane');
  [...panes].forEach((pane) => pane.classList.remove(classActive));
  panes[idx].classList.add(classActive);
}

function buildNav(block) {
  const titles = block.querySelectorAll('.tabs-horizontal > div > div:first-child');
  const navList = ul({ class: 'tabs-nav' });
  [...titles].forEach((title, idx) => {
    const tabTitle = title.textContent;
    const listItem = li({ class: 'tabs-nav-item' },
      a({
        href: '#',
        'aria-label': tabTitle,
        onclick: (e) => { handleTabClick(e, idx) },
      },
      tabTitle)
    );
    navList.append(listItem);
  });
  navList.querySelector('li').classList.add(classActive);
  return navList;
}

async function buildTabs(block) {
  const tabPanes = block.querySelectorAll('.tabs-horizontal > div > div:last-child');
  const tabList = div({ class: 'tabs-list' });
  const hydratedPanes = await Promise.all([...tabPanes].map(async (pane) => {
    pane.classList.add('tab-pane');
    const fragmentLink = pane.querySelector('a')?.textContent;
    if (fragmentLink && fragmentLink.includes('/fragments/')) {
      pane.classList.remove('button-container');
      const fragment = await fetchFragment(fragmentLink);
      pane.innerHTML = fragment;
      const sections = pane.querySelectorAll('.tab-pane > div');
      [...sections].forEach((section) => {
        section.classList.add('section');
        processSectionMetadata(section);
      });
    } else {
      const paneInner = pane.innerHTML;
      pane.innerHTML = '';
      pane.append(div({ class: 'section' }));
      pane.querySelector('.section').innerHTML = paneInner;
    }
    decorateButtons(pane);
    decorateIcons(pane);
    decorateLinks(pane);
    return pane;
  }));
  hydratedPanes.forEach((pane) => { tabList.append(pane) });
  tabList.querySelector('.tab-pane').classList.add(classActive);
  return tabList;
}

export default async function decorate(block) {
  const nav = buildNav(block);
  const tabs = await buildTabs(block);
  block.innerHTML = '';

  block.append(nav);
  block.append(tabs);

  return block;
}