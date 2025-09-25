const BUNDLE = 'application/manifest+json';
const WORKER = 'application/vnd.anecdote.worker';
const SCRIPT = 'application/javascript';
const STYLES = 'text/css';

(async function(){
  const _fetch = url => fetch(url, { cache: 'no-store', credentials: 'omit', mode: 'cors' });
  await _manifest('{{ site.remote }}/.well-known/manifest.json');

  async function _manifest(dns) {
    const response = await _fetch(dns);
    const text = await response.text();
    const obj = JSON.parse(text);
    await manifest(obj);
    async function manifest({
      meta: { node },
      candidates={}, candidate_order=[],
      resources={}, resource_order=[]
    }) {
      const workers = { type: 'module', scope: candidates.dns };
      const after = {
        [WORKER]: ({ uri }) => navigator.serviceWorker?.register?.(node + uri, workers),
        [BUNDLE]: async ({ file }) => manifest(JSON.parse(await file.text())),
      };

      // This function might need to do medium.js things to retrieve content.
      // We'd use storage uris instead of blobs for files.
      async function resource({ strategy, uri, path, type }){
        async function fill() {
          switch (strategy) {
            case 'dns':
              const resource = await _fetch(node + uri);
              return new Blob([await resource.arrayBuffer()], { type });
          }
        }
        const file = new File([await fill()], path, { type });
        let url = null;
        let attr = null;
        switch (type) {
          case BUNDLE:
          case WORKER:
          case SCRIPT: [kind, attr] = ['script', 'src']; break;
          default: [kind, attr] = ['link', 'href']; break;
        }
        const el = document.createElement(kind);
        switch (type) {
          case WORKER: url = node + uri; // no break
          case SCRIPT: el.type = 'module'; break;
          case BUNDLE: el.type = type; break;
          case STYLES: el.rel = 'stylesheet'; break;
          default: break;
        }
        if (!url) url = URL.createObjectURL(file);
        el[attr] = url;
        el.id = path;
        document.head.appendChild(el);
        return { strategy, uri, id: path, type, file, url };
      }

      for (const label of resource_order) {
        if (!resources[label]) continue;
        for (const strategy of candidate_order) {
          if (!(strategy in candidates)) continue;
          const { [strategy]: path=label } = resources[label];
          const meta = await resource({
            ...resources[label],
            uri: candidates[strategy] + path,
            path,
            strategy
          });
          /* await */ after[meta.type]?.(meta);
        }
      }
    }
  }
})();
