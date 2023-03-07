import {
  decorateIcons,
  createOptimizedPicture,
} from '../../scripts/lib-franklin.js';

function decorateTeaserPicture(teaserPicture, target) {
  teaserPicture.classList.add('video-cover');
  target.appendChild(teaserPicture.parentElement);
}

function decorateTeaser(video, teaserPicture, target) {
  if (!video && !teaserPicture) {
    // nothing to decorate
    return;
  }

  if (!video) {
    // author didn't configure a teaser video
    // we'll use the image as the hero content for all screen sizes
    teaserPicture.style.setProperty('display', 'block', 'important');
    decorateTeaserPicture(teaserPicture, target);
    return;
  }

  const videoTag = document.createElement('video');
  if (!teaserPicture) {
    // author didn't configure a teaser picture
    // we'll use the video for all screen sizes
    videoTag.style.setProperty('display', 'block', 'important');
  } else {
    videoTag.setAttribute('poster', teaserPicture.currentSrc);
    decorateTeaserPicture(teaserPicture, target);
  }

  videoTag.classList.add('video-cover');
  videoTag.toggleAttribute('muted', true);
  videoTag.toggleAttribute('loop', true);
  videoTag.setAttribute('title', video.title);

  const mql = window.matchMedia('only screen and (max-width: 768px)');
  if (mql.matches) {
    videoTag.setAttribute('preload', 'none');
  } else {
    videoTag.toggleAttribute('autoplay', true);
  }
  mql.onchange = (e) => {
    if (!e.matches) {
      videoTag.toggleAttribute('autoplay', true);
      videoTag.play();
    }
  };

  videoTag.innerHTML = `<source src="${video.href}" type="video/mp4">`;
  target.appendChild(videoTag);
  videoTag.muted = true;
  video.remove();
}

function decorateOverlayButton(fullScreenVideoLink, block, overlay) {
  const button = document.createElement('button');
  button.classList.add('video-banner-btn');

  button.innerHTML = fullScreenVideoLink.innerHTML;

  button.addEventListener('click', () => {
    const fullVideoContainer = block.querySelector('.full-video-container');
    fullVideoContainer.style.display = 'block';
    fullVideoContainer.querySelector('video').play();
  });

  overlay.appendChild(button);
  fullScreenVideoLink.remove();
}

function createIcons(target, iconNames) {
  iconNames.forEach((iconName) => {
    const icon = document.createElement('span');
    icon.classList.add('icon');
    icon.classList.add(`icon-${iconName}`);

    target.appendChild(icon);
  });

  decorateIcons(target);
}

function toggleVideoPlay(video) {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

async function decorateFullScreenVideo(fullScreenVideoLink, teaserPicture, target) {
  const fullVideoContainer = document.createElement('div');
  fullVideoContainer.classList.add('full-video-container');

  const video = document.createElement('video');
  video.classList.add('video-cover');
  video.innerHTML = `<source src="${fullScreenVideoLink}" type="video/mp4">`;
  video.setAttribute('preload', 'none');
  video.setAttribute('poster', teaserPicture.currentSrc);

  video.addEventListener('click', () => { toggleVideoPlay(video); });

  const closeVideoButton = document.createElement('div');
  closeVideoButton.classList.add('close-video');
  createIcons(closeVideoButton, ['close-video']);
  closeVideoButton.addEventListener('click', () => {
    video.pause();
    video.currentTime = 0;
    video.load();
    fullVideoContainer.style.display = 'none';
  });

  const playPauseVideoButton = document.createElement('div');
  playPauseVideoButton.classList.add('play-pause-fullscreen-button');
  createIcons(playPauseVideoButton, ['full-screen-play', 'full-screen-pause']);
  playPauseVideoButton.addEventListener('click', () => { toggleVideoPlay(video); });

  video.addEventListener('play', () => {
    const [playIcon] = playPauseVideoButton.querySelectorAll('svg');
    playIcon.style.opacity = 1;
    setTimeout(() => {
      playIcon.style.opacity = 0;
    }, 400);
  });

  video.addEventListener('pause', () => {
    const [, pauseIcon] = playPauseVideoButton.querySelectorAll('svg');
    pauseIcon.style.opacity = 1;
    setTimeout(() => {
      pauseIcon.style.opacity = 0;
    }, 400);
  });

  fullVideoContainer.appendChild(closeVideoButton);
  fullVideoContainer.appendChild(playPauseVideoButton);
  fullVideoContainer.appendChild(video);
  target.appendChild(fullVideoContainer);
}

export default function decorate(block) {
  const videoBanner = block.children[0];
  videoBanner.classList.add('hero-video-banner');

  const heroContent = videoBanner.children[0];
  heroContent.classList.add('teaser-video-container');

  const teaserVideoLink = heroContent.querySelector('a');
  let teaserPicture = heroContent.querySelector('img');
  teaserPicture.closest('picture').replaceWith(createOptimizedPicture(teaserPicture.src, teaserPicture.alt, true));
  teaserPicture = heroContent.querySelector('img');

  decorateTeaser(teaserVideoLink, teaserPicture, heroContent);

  const overlay = videoBanner.children[1];
  overlay.classList = 'overlay';

  const fullScreenVideoLink = overlay.querySelector('a:last-of-type');
  if (!fullScreenVideoLink) {
    return;
  }
  const fullScreenVideoLinkHref = fullScreenVideoLink.href;
  decorateOverlayButton(fullScreenVideoLink, block, overlay);
  decorateFullScreenVideo(fullScreenVideoLinkHref, teaserPicture, videoBanner);
}
