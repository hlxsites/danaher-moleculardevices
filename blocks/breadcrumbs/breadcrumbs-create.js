import { a, li } from '../../scripts/dom-helpers.js';
import ffetch from '../../scripts/ffetch.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

function prependSlash(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

function skipParts(pathSplit) {
  const partsToSkip = ['en', 'assets', 'br', 'img', 'citations', 'dd', 'tutorials-videos', 'bpd', 'cns', 'flipr', 'contaminants', 'enzyme'];
  return pathSplit.filter((item) => !partsToSkip.includes(item));
}

const customBreadcrumbs = {
  'app-note': {
    name: 'App Note',
    url_path:
      'https://www.moleculardevices.com/search-results#t=All&sort=relevancy&f:@md_contenttype=%5BApplication%20Note%5D',
  },
  ebook: {
    name: 'EBook',
    url_path:
      'https://www.moleculardevices.com/search-results#t=All&sort=relevancy&f:@md_contenttype=%5BeBook%5D',
  },
  'lab-notes': {
    name: 'Lab Notes',
    url_path: '/lab-notes',
  },
  '/lab-notes/general': {
    name: 'General',
    url_path: '/lab-notes/blog#General',
  },
  '/lab-notes/clone-screening': {
    name: 'Clone Screening',
    url_path: '/lab-notes/blog#Clone-Screening',
  },
  '/lab-notes/cellular-imaging-systems': {
    name: 'Cellular Imaging Systems',
    url_path: '/lab-notes/blog#Cellular-Imaging-Systems',
  },
  '/lab-notes/microplate-readers': {
    name: 'Microplate Readers',
    url_path: '/lab-notes/blog#Microplate-Readers',
  },
  'service-support': {
    name: 'Service and Support',
    url_path: '/service-support',
  },
  technology: {
    name: 'Technology and Innovation',
    url_path: '/technology',
  },
  'accessories-consumables': {
    name: 'Accessories and Consumables',
    url_path: '/products/accessories-consumables',
  },
  'customer-breakthrough': {
    name: 'Customer Breakthrough ',
    url_path: '/customer-breakthroughs',
  },
  'acquisition-and-analysis-software': {
    name: 'Acquisition and Analysis Software',
  },
  'igg-quantification-assays': {
    name: 'IgG quantitation',
  },
  'dna-quantitation': {
    name: 'DNA Quantitation',
  },
  elisa: {
    name: 'ELISA',
  },
  'cell-viability': {
    name: 'Cell Viability',
  },
  cardiotox: {
    name: 'Cardiotox',
  },
  gpcrs: {
    name: 'GPCR',
  },
  'ion-channel': {
    name: 'Ion Channel',
  },
  'reporter-gene-assays': {
    name: 'Reporter Gene',
  },
  'western-blot': {
    name: 'Western Blot',
  },
  transporters: {
    name: 'Transporter',
  },
  'mammalian-screening': {
    name: 'Mammalian Screening',
  },
  'microbial-screening': {
    name: 'Microbial Screening',
  },
  'high-content-imaging': {
    name: 'High-Content Imaging',
  },
  digitizers: {
    name: 'Digitizers',
  },
  amplifiers: {
    name: 'Amplifiers',
  },
  resources: {
    name: 'Resources',
    url_path: '/search-results',
  },
};

function getCustomUrl(path, part) {
  if (customBreadcrumbs[part]) {
    return customBreadcrumbs[part].url_path;
  }

  if (customBreadcrumbs[path]) {
    return customBreadcrumbs[path].url_path;
  }

  return path;
}

function getName(pageIndex, path, part, current) {
  if (customBreadcrumbs[part]) {
    return customBreadcrumbs[part].name;
  }

  if (customBreadcrumbs[path]) {
    return customBreadcrumbs[path].name;
  }

  const pg = pageIndex.find((page) => page.path === path);
  if (pg && pg.h1 && pg.h1 !== '0') {
    return pg.h1;
  }

  if (pg && pg.title && pg.title !== '0') {
    return pg.title;
  }

  if (current) {
    return document.title;
  }

  return part;
}

export default async function createBreadcrumbs(container) {
  const breadCrumbsCSS = new Promise((resolve) => {
    loadCSS('/blocks/breadcrumbs/breadcrumbs.css', (e) => resolve(e));
  });

  const path = window.location.pathname;
  const pathSplit = skipParts(path.split('/'));

  const pageIndex = await ffetch('/query-index.json').all();
  const urlForIndex = (index) => prependSlash(pathSplit.slice(1, index + 2).join('/'));

  const breadcrumbs = [
    {
      name: 'Home',
      url_path: '/',
    },
    ...pathSplit.slice(1, -1).map((part, index) => {
      const url = urlForIndex(index);
      return {
        name: getName(pageIndex, url, part, false),
        url_path: getCustomUrl(url, part),
      };
    }),
    { name: getName(pageIndex, path, pathSplit[pathSplit.length - 1], true) },
  ];

  const ol = container.querySelector('ol');
  breadcrumbs.forEach((crumb) => {
    ol.appendChild(li(crumb.url_path ? a({ href: crumb.url_path }, crumb.name) : crumb.name));
  });
  await breadCrumbsCSS;
}
