---
---
(async function(){
  console.group("integrity.js");

  const PUBLIC_KEY = document.querySelector('meta[name=public-key-fingerprint]').content.trim();

  console.log({ PUBLIC_KEY });

  async function fetchTextNoCache(url){
    const r = await fetch(url, {cache:'no-store', credentials: 'omit', mode: 'cors'});
    if(!r.ok) throw new Error(r.status);
    return await r.text();
  }

  async function verifyManifest(){
    const [manifestText, signature] = await Promise.all([
      fetchTextNoCache('{{ site.canonical }}/.well-known/manifest.json'),
      fetchTextNoCache('{{ site.canonical }}/.well-known/manifest.sig')
    ]);
    console.log({ signature });
    const encoder = new TextEncoder();
    const manifestBytes = encoder.encode(manifestText);
    const sigBytes = Uint8Array.from(atob(signature.trim()), c => c.charCodeAt(0));
    const bin = atob(PUBLIC_KEY);
    const len = bin.length;
    const buf = new Uint8Array(len);
    for(let i=0;i<len;i++) buf[i]=bin.charCodeAt(i);
    const spki = buf.buffer;
    const pub = await crypto.subtle.importKey(
      'spki', spki,
      { name: 'RSA-PSS', hash: {name:'SHA-256'} },
      false, ['verify']
    );
    return (await crypto.subtle.verify(
      {name:'RSA-PSS', saltLength: 32},
      pub,
      sigBytes,
      manifestBytes
    ) ? manifestText : "Verification failure");
  }

  const manifest = document.body.textContent = await verifyManifest();
  const MANIFEST = document.getElementById('manifest');
  MANIFEST.content = manifest;
  console.groupEnd();
})();
