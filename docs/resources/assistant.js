import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = true;
env.useBrowserCache = false;

class Assistant {
  static meta = {
    "protocol": "2025-09-24",
  };
  static instance = null;
  static use() {
    if (this.instance === null) {
      // This pipeline should intercept url-namespaces for model loads, and
      // handle any novel fetch processes, and serve it as the source.
      // The manifest's model names work as canonical paths, just relative;
      // They can be prefixed with other protocols.
      this.instance = pipeline(this.task, this.model, {
        progress_callback: (msg) => self.postMessage(msg),
      });
    }
    return this.instance;
  }

  async reduce(txt) {
    // TODO: Orchestrate model plan for this task.
    // We are doing it well when we know what models we want but haven't cached.
    return {}
  }

  tasks = {
    summarization: reduce,
  };
}

self.addEventListener('message', async ({ data: { assistant }={} }) => {
  if (!assistant) return;

  const { warmUp, ...task } = assistant;
  const A = Assistant.use();
  if (warmUp) {
    reply({ warmUp: A.meta });
    return;
  }
  const { name, version, prompt, ...input } = task;
  const reply = out => self.postMessage({
    status: 'analyzed',
    output: {
      name, version: version + 1,
      ...JSON.parse(JSON.stringify(out))
    },
  });

  reply({ NotImplemented: A.meta });
});
