export default function decorate(block) {
  const main = block.closest('main');
  const sections = main.querySelectorAll('div.section.tabs');
  const namedSections = [...sections].filter((section) => section.hasAttribute('data-name'));
  if (namedSections) {
    const activeHash = window.location.hash;
    const active = activeHash ? activeHash.substring(1, activeHash.length) : namedSections[0].getAttribute('data-name');
    sections.forEach((section) => {
      if (active === section.getAttribute('aria-labelledby')) {
        section.setAttribute('aria-hidden', false);
      } else {
        section.setAttribute('aria-hidden', true);
      }
    });
  }
}
