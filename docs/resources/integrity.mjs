---
---

(async function(){
  const PUBLIC_KEY = document.querySelector('meta[name=public-key-fingerprint]').content;
  console.log("Public key fingerprint:", PUBLIC_KEY);

  async function fetchTextNoCache(url){
    const r = await fetch(url, {cache: 'no-store', credentials: 'omit', mode: 'cors'});
    if(!r.ok) throw new Error(r.status);
    return await r.text();
  }

  async function verifyManifest(){
    const [manifestText, signature] = await Promise.all([
      // During QR, these files are requested from the remote, so it must be
      // fully qualified. The QR instance never builds its own one of these.
      fetchTextNoCache('{{ site.canonical }}/.well-known/manifest.json'),
      fetchTextNoCache('{{ site.canonical }}/.well-known/manifest.sig')
    ]);
    const bin = atob(PUBLIC_KEY);
    const len = bin.length;
    const buf = new Uint8Array(len);
    for(let i=0;i<len;i++) buf[i]=bin.charCodeAt(i);
    const spki = buf.buffer;
    const pub = await crypto.subtle?.importKey(
      'spki', spki,
      { name: 'RSA-PSS', hash: {name:'SHA-256'} },
      false, ['verify']
    );

    const manifestBytes = new TextEncoder().encode(manifestText);
    const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    return (await crypto.subtle?.verify(
      {name:'RSA-PSS', saltLength: 32},
      pub, sigBytes, manifestBytes
    ) ? manifestText : manifestText.replace(/^\{\n/, '{\n  "verification": "failed",\n'));
  }

  const manifest = await verifyManifest();
  document.getElementById('manifest.json').content = manifest;
  const el = document.createElement('code');
  el.textContent = manifest;
  document.body.prepend(el);
})();
