const text = el => { switch (el.tagName) {
  // case 'STYLE': return el.textContent;  // CSP would need 'unsafe-inline'
  default: return el.innerHTML;
}}

function make(out={}) {
  for (const part of document.querySelectorAll('[id]')) {
    out[part.id] = text(part);
  }
  return out;
}

self.addEventListener("message", (e) => {
  if (e.origin !== location.origin) return;
  const { source, origin, data } = e;
  const for_ = document.querySelector('meta[name="for"]');
  if (data !== for_) return;
  source.postMessage(make(), origin);
});
