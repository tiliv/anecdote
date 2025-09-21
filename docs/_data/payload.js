(async function(){
  const PUBLIC_KEY = "{% include public.b64 %}";

  const _fetch = url => fetch(url, {
    cache:'no-store', credentials: 'omit', mode: 'cors'
  });

  document.addEventListener('DOMContentLoaded', async () => {
    const raw = await _fetch('{{ site.url }}/.well-known/manifest.json');
    manifest(JSON.parse(document.body.textContent = await raw.text()));
  });

  function manifest({ candidates, candidate_order, resources, resource_order }) {
    async function resource({ strategy, uri, type }){
      async function fill() {
        switch (strategy) {
          case 'dns':
            const resource = await _fetch(uri);
            return new Blob([await resource.arrayBuffer()], { type });
        }
      }
      const url = URL.createObjectURL(await fill());
      switch (type) {
        case 'text/css': css(); break;
      }
      async function css() {
        const link = document.createElement('link');
        link.rel = 'stylesheet'; link.href = url;
        document.head.appendChild(link);
      }
    }

    for (const label of resource_order) {
      if (!resources[label]) continue;
      for (const strategy of candidate_order) {
        if (!(strategy in candidates)) continue;
        const { [strategy]: path=label } = resources[label];
        resource({
          ...resources[label],
          uri: candidates[strategy] + path,
          strategy
        });
      }
    }
  }
})();
