import { loadScript } from '../../scripts/scripts.js';

function isValidUrl(string) {
  try {
    // eslint-disable-next-line no-new
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

function getUrls(text) {
  const match = text.match(/\b((https?|ftp|file):\/\/|(www|ftp)\.)[-A-Z0-9+&@#/%?=~_|$!:,.;]*[A-Z0-9+&@#/%=~_|$]/ig);
  if (match) return match;
  return null;
}

function getVideoUrl(text) {
  let videoUrl = null;
  if (getUrls(text)) {
    const hostnames = ['vids.moleculardevices.com', 'share.vidyard.com'];
    [...getUrls(text)].forEach((url) => {
      if (isValidUrl(url)) {
        [...hostnames].forEach((hostname) => {
          if (url.includes(hostname)) {
            videoUrl = url;
          }
        });
      }
    });
  }
  return videoUrl;
}

export function getVideoId(text) {
  if (getVideoUrl(text)) {
    const parts = getVideoUrl(text).split('/');
    return parts.at(-1).trim();
  }
  return null;
}

export function buildVideo(block, div, videoId) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadScript('https://play.vidyard.com/embed/v4.js');

      const videoIcon = document.createElement('div');
      const thumbnail = document.createElement('img');
      videoIcon.append(thumbnail);
      videoIcon.classList.add('video-icon');
      thumbnail.src = '/images/play_icon.png';

      div.innerHTML = `<div id="sample">
        <div class="vidyard-player-embed" data-uuid="${videoId}" data-v="4" data-type="lightbox" data-autoplay="2"></div>
      </div>`;
      div.appendChild(videoIcon);

      thumbnail.addEventListener('click', () => {
        // eslint-disable-next-line no-undef
        const players = VidyardV4.api.getPlayersByUUID(videoId);
        const player = players[0];
        player.showLightbox();
      });
    }
  });
  observer.observe(block);
}
