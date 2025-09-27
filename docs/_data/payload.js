const LOADED = new Promise(y => {
  if (document.readyState !== 'loading') return y();
  document.addEventListener('DOMContentLoaded', () => y(), { once: true });
});
const WORKER = 'application/vnd.anecdote.worker';
const BUNDLE = 'application/manifest+json';
const WIDGET = 'application/manifest+html';
const SCRIPT = 'application/javascript';
const MODULE = 'module';
const STYLES = 'text/css';
const MAPPED = {  // Content-Types used in Files that hold these blobs
  [WORKER]: MODULE,
  [MODULE]: SCRIPT,
  [BUNDLE]: 'application/json',
  [WIDGET]: 'text/html',
};

(async function(){
  const _fetch = url => fetch(url, { cache: 'no-store', credentials: 'omit', mode: 'cors' });
  await _manifest('{{ site.remote }}/.well-known/manifest.json');

  async function _manifest(dns) {
    const response = await _fetch(dns);
    const text = await response.text();
    const obj = JSON.parse(text);
    await manifest(obj);
    async function manifest({ meta: { node }, candidates={}, resources={} }) {
      async function resource({ strategy, uri, path, type }){
        let _type = MAPPED[type] ?? type;

        async function fill() {
          let resource = null;
          switch (strategy) {
            default: throw new Error(strategy);
            case 'dns': resource = await _fetch(node + uri); break;
          }
          return new Blob([await resource.arrayBuffer()], { type });
        }

        const file = new File([await fill()], path, { type: _type });
        const fix = (el, o) => Object.entries(o).forEach(([k,v]) => el[k] = v);
        let [url, attr] = [null, null];
        switch (type) {
          default: [kind, attr] = ['link', 'href']; break;
          case WORKER: case BUNDLE: case MODULE:
          case SCRIPT: [kind, attr] = ['script', 'src']; break;
          case WIDGET: [kind, attr] = ['iframe', 'src']; break;
        }
        const el = document.createElement(kind);
        switch (type) {
          case WORKER: case BUNDLE: fix(el, { type: _type }); break;
          default: fix(el, { type }); break;
        }
        switch (type) {
          case WORKER: url = node + uri; break;
          case WIDGET: fix(el, { sandbox: 'allow-scripts allow-same-origin' }); break;
          case STYLES: fix(el, { rel: 'stylesheet' }); break;
        }
        if (!url) url = URL.createObjectURL(file);
        el[attr] = url;
        el.id = path;
        await LOADED;
        switch (type) {
          case WIDGET: document.body.appendChild(el); break;
          default: document.head.appendChild(el); break;
        }

        // console.log("Loaded", strategy, uri, type, file.type, file.size, el);

        return (async () => { switch (type) {
          default: return Promise.resolve(el);
          case WORKER: return navigator.serviceWorker?.register?.(node + uri, { type: _type, scope: candidates.dns });
          case BUNDLE: return manifest(JSON.parse(await file.text()));
        }})();
      }

      for (const label in resources) {
        if (!resources[label]) continue;
        const promises = [];
        for (const strategy in candidates) {
          if (!(strategy in candidates)) continue;
          const { [strategy]: path=label } = resources[label];
          const uri = candidates[strategy] + path;
          const p = resource({ ...resources[label], uri, path, strategy });
          promises.push(p);
        }
        await Promise.all(promises);
      }
    }
  }
})();
