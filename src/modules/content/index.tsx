setTimeout(() => {
  const videoId = new URLSearchParams(location.search).get('v');

  const elementParent = document.querySelector('div#player');

  const iframe = document.createElement('iframe');

  iframe.id = 'yt-on-yt';
  iframe.style.border = 'none';
  iframe.style.height = '100%';
  iframe.style.width = '100%';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.zIndex = '100000';
  iframe.style.borderRadius = '12px';
  iframe.src = `https://youtube.com/embed/${videoId}?autoplay=1`;

  elementParent.appendChild(iframe);
}, 1000);
