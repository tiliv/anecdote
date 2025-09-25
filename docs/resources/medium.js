export const NAME = "▒";
const STORE = 'files';
const BY_PREFIX = 'byPrefix';

(new BroadcastChannel(NAME)).onmessage = async ({
  data: ops={}
}) => {
  for (const op in ops) {
    const results = await API[op]?.(ops[op]) || {};
    channel.postMessage({ op, ...results });
  }
};

const API = (async () => {
  const db = await indexedDB.open(NAME, 1);
  const init = migrate();

  return {
    retain: ({ name, blob }) => mut(store => store.put(serialize(name, blob), clean(name))),
    retrieve: (name) => get(store => store.get(clean(name))),
    prefixed: list,
  };

  async function migrate() {
    return await new Promise((y, n) => {
      db.onupgradeneeded = () => db.result
        .createObjectStore(STORE, { keyPath: 'name' })
        .createIndex(BY_PREFIX, 'name', { unique: true });
      db.onerror = () => n(db.error);
      db.onsuccess = () => y(db.result);
    })
  }

  function clean(s) {
    return decodeURIComponent(s).normalize('NFC');
  }

  async function serialize(name, blob) {
    const f = new File([blob], name, { type: blob.type });
    const bytes = new Uint8Array(await f.arrayBuffer());
    return { name, bytes, type: blob.type, date_added: Date.now() }
  };

  async function list(prefix='', { mode='readonly', store=STORE }) {
    await init;
    const tx = db.transaction(store, mode);
    return new Promise(async (y, n) => {
      const req = tx.objectStore(store).index(BY_PREFIX).openCursor(
        IDBKeyRange.bound(prefix, prefix + '\uffff', false, true)
      );
      tx.onerror = () => n(req.error);
      req.onsuccess = ({ target }) => {
        const cursor = target.result;
        !cursor && y(results);
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        }
      };
    });
  };

  async function get(flow, { mode='readonly', store=STORE }) {
    await init;
    const tx = db.transaction(store, mode);
    return new Promise(async (y, n) => {
      await flow(tx.objectStore(store));
      tx.onerror = () => n(req.error);
      tx.onsuccess = () => y(req.result);
    });
  };

  async function mut(flow, { mode='readwrite', store=STORE }) {
    await init;
    const tx = db.transaction(store, mode);
    return new Promise(async (y, n) => {
      await flow(tx.objectStore(store));
      tx.oncomplete = y;
      tx.onerror = () => n(tx.error);
    });
  };
})();
