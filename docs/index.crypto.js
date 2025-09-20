(async function(){
  const STATUS = document.getElementById('status');
  const MAN = document.getElementById('manifest');
  const OPEN = document.getElementById('open');
  const RELOAD = document.getElementById('reload');

  // ----- PINNED PUBLIC KEY (PEM) -----
  const PEM_PUBKEY = "{% include public.b64 %}";

  const DOMAIN = '{{ site.url }}';
  const MANIFEST_URL = DOMAIN + '/.well-known/manifest.json';
  const SIG_URL = DOMAIN + '/.well-known/manifest.sig';

  function pemToArrayBuffer(b64){
    const bin = atob(b64);
    const len = bin.length;
    const buf = new Uint8Array(len);
    for(let i=0;i<len;i++) buf[i]=bin.charCodeAt(i);
    return buf.buffer;
  }

  async function importPubKey(b64){
    const spki = pemToArrayBuffer(b64);
    return crypto.subtle.importKey(
      'spki', spki,
      { name: "ECDSA", namedCurve: "P-256" },
      false, ['verify']
    );
  }

  async function fetchTextNoCache(url){
    const r = await fetch(url, {cache:'no-store', credentials: 'omit', mode: 'cors'});
    if(!r.ok) throw new Error('fetch failed: ' + r.status);
    return await r.text();
  }

  async function verifyManifest(){
    try{
      STATUS.textContent = 'fetching manifest + signature…';
      const [manifestText, sigB64] = await Promise.all([
        fetchTextNoCache(MANIFEST_URL),
        fetchTextNoCache(SIG_URL)
      ]);
      const encoder = new TextEncoder();
      const manifestBytes = encoder.encode(manifestText);
      const sigBytes = Uint8Array.from(atob(sigB64.trim()), c => c.charCodeAt(0));

      const pub = await importPubKey(PEM_PUBKEY);
      const ok = await crypto.subtle.verify(
        {name:'RSA-PSS', saltLength: 32},
        pub,
        sigBytes,
        manifestBytes
      );

      if(!ok){
        STATUS.innerHTML = '<span class="bad">Signature invalid — do not trust this site.</span>';
        OPEN.disabled = true;
        MAN.style.display = 'none';
        return false;
      }

      STATUS.innerHTML = '<span class="ok">Signature valid — manifest verified.</span>';
      MAN.style.display = 'block';
      MAN.textContent = manifestText;
      OPEN.disabled = false;
      return true;
    }catch(err){
      STATUS.innerHTML = '<span class="bad">Error verifying manifest: '+String(err)+'</span>';
      OPEN.disabled = true;
      MAN.style.display = 'none';
      throw err;
      return false;
    }
  }

  OPEN.addEventListener('click', ()=>{
    const a = document.createElement('a');
    a.href = DOMAIN + '/';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  });
  RELOAD.addEventListener('click', ()=>verifyManifest());

  await verifyManifest();
})();
