document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('span').forEach(span => {
    span.setAttribute('data-text', span.textContent);
    const randomTiming = (Math.random() * 3 + 1).toFixed(2);
    span.style.setProperty('--anim-timing', `${randomTiming}s`);
    span.style.color = 'white';
  });

  const emojiRegex = /\p{Emoji}/gu;

  function wrapEmojis(node) {
    if (node.nodeType === 3 && emojiRegex.test(node.nodeValue)) {
      console.log(`Wrapping emojis in text node: "${node.nodeValue}"`);
      const replaced = node.nodeValue.replace(
        emojiRegex,
        match =>
          `<span class="emoji" aria-label="emoji" style="background: yellow;">${match}</span>` // 🟡 Highlight emojis
      );
      const wrapper = document.createElement('span');
      wrapper.innerHTML = replaced;
      node.replaceWith(...wrapper.childNodes);
    } else if (node.nodeType === 1) {
      node.childNodes.forEach(wrapEmojis);
    }
  }

  document.querySelectorAll('*').forEach(wrapEmojis);
});
