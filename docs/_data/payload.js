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
      async function resource({ strategy, uri, path, type }){
        async function fill() {
          switch (strategy) {
            case 'dns':
              const resource = await _fetch(node + uri);
              return new Blob([await resource.arrayBuffer()], { type });
          }
        }
        const file = new File([await fill()], path, { type });
        let url = URL.createObjectURL(file);
        const types = {
          '*': ['link', 'href'],
          [SCRIPT]: ['script', 'src'],
          [WORKER]: ['script', 'src'],
        };
        const [kind, attr] = types[type] || types['*'];
        const el = document.createElement(kind);
        switch (type) {
          case WORKER: URL.revokeObjectURL(url); url = node + uri; // no break
          case SCRIPT: el.type = 'module'; break;
          case STYLES: el.rel = 'stylesheet'; break;
          // case 'application/manifest+json': _manifest(url); break;
          default: break;
        }
        el[attr] = url;
        el.id = path;
        document.head.appendChild(el);
        switch (type) {
          case WORKER: navigator.serviceWorker.register(node + uri, {
            type: 'module', scope: candidates.dns
          }); break;
          default: break;
        }
      }

      for (const label of resource_order) {
        if (!resources[label]) continue;
        for (const strategy of candidate_order) {
          if (!(strategy in candidates)) continue;
          const { [strategy]: path=label } = resources[label];
          await resource({
            ...resources[label],
            uri: candidates[strategy] + path,
            path,
            strategy
          });
        }
      }
    }
  }
})();
