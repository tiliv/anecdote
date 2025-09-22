(async function(){
  const RESOURCES = {};
  const _fetch = url => fetch(url, { cache: 'no-store', credentials: 'omit', mode: 'cors' });
  await _manifest('{{ site.canonical }}/.well-known/manifest.json');

  async function _manifest(dns) {
    const response = await _fetch(dns);
    const text = await response.text();
    const obj = JSON.parse(text);
    await manifest(obj);
    async function manifest({ candidates, candidate_order, resources, resource_order }) {
      async function resource({ strategy, uri, path, type }){
        async function fill() {
          switch (strategy) {
            case 'dns':
              const resource = await _fetch(uri);
              return new Blob([await resource.arrayBuffer()], { type });
          }
        }
        const file = new File([await fill()], path, { type });
        const url = URL.createObjectURL(file);
        const types = {
          '*': ['link', 'href'],
          'application/javascript': ['script', 'src']
        };
        const [kind, attr] = types[type] || types['*'];
        const el = document.createElement(kind);
        switch (type) {
          case 'text/css': el.rel = 'stylesheet'; break;
          // case 'application/manifest+json': _manifest(url); break;
          default: break;
        }

        el.id = path;
        el[attr] = url;
        document.head.appendChild(el);
        RESOURCES[path] = url;
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
