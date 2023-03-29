import handleViewportChanges from './header-events.js';
import { fetchHeaderContent } from './header.js';
import buildProductsMegaMenu from './menus/products.js';
import buildMegaMenuLeftMenus from './menus/left-submenus.js';
import { getMetadata, toClassName } from '../../scripts/lib-franklin.js';

function buildMegaMenu(navContent, submenuContent) {
  const productsSubmenu = document.createElement('div');
  productsSubmenu.append(submenuContent.querySelector('h1'));
  productsSubmenu.append(buildMegaMenuLeftMenus(submenuContent));
  submenuContent.innerHTML = productsSubmenu.outerHTML;
  const backgroundImg = navContent.querySelector('.submenu-background img');
  submenuContent.style.backgroundImage = `url(${backgroundImg.src})`;
}

function createSubmenuBuildersMap() {
  // create map of submenu name to function
  const submenus = new Map();
  submenus.set('products', buildProductsMegaMenu);
  submenus.set('applications', buildMegaMenu);
  submenus.set('resources', buildMegaMenu);
  submenus.set('service-support', buildMegaMenu);
  submenus.set('company', buildMegaMenu);
  submenus.set('contact-us', () => { });
  return submenus;
}

export default async function fetchAndStyleMegamenus(headerBlock) {
  // ------ Submenus ------
  const submenuBuildersMap = createSubmenuBuildersMap();

  // get all keys from submenuBuildersMap
  const submenuKeys = [...submenuBuildersMap.keys()];

  // Fetch all submenu content concurrently
  const submenuFetchPromises = [];
  for (let i = 0; i < submenuKeys.length - 1; i += 1) {
    const submenuId = submenuKeys[i];
    const submenuPath = getMetadata(`${submenuId}-submenu`) || `/fragments/menu/${submenuId}`;
    submenuFetchPromises.push(
      fetch(`${submenuPath}.plain.html`, window.location.pathname.endsWith(`/${submenuId}`) ? { cache: 'reload' } : {}),
    );
  }

  // Process all submenu responses
  const submenuResponses = await Promise.all(submenuFetchPromises);

  // fetch the header content, we need it to be able to get the background image
  const headerContent = await fetchHeaderContent();

  // iterate over all submenu responses
  for (let i = 0; i < submenuResponses.length; i += 1) {
    const submenuResponse = submenuResponses[i];
    if (submenuResponse.ok) {
      const closeButton = document.createElement('div');
      closeButton.classList.add('menu-nav-submenu-close');

      const submenuId = submenuKeys[i];
      // eslint-disable-next-line no-await-in-loop
      const submenuHtml = await submenuResponse.text();
      const submenuContent = document.createElement('div');
      submenuContent.classList.add('menu-nav-submenu');
      submenuContent.innerHTML = submenuHtml;

      // Get submenu builder, and build submenu
      const submenuBuilder = submenuBuildersMap.get(toClassName(submenuId));
      submenuBuilder(headerContent, submenuContent);

      // Get the list item in the header block that contains a div with attribute menu-id
      // that matches the submenuId
      const li = headerBlock.querySelector(`div[menu-id="${submenuId}"]`).closest('li');
      li.append(closeButton);
      li.append(submenuContent);
    }
  }

  handleViewportChanges(headerBlock);
}
