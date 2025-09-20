(async function(){
  const PEM_PUBKEY = "{% include public.b64 %}";

  async function fetchTextNoCache(url){
    const r = await fetch(url, {cache:'no-store', credentials: 'omit', mode: 'cors'});
    if(!r.ok) throw new Error(r.status);
    return await r.text();
  }

  async function verifyManifest(){
    const [manifestText, sigB64] = await Promise.all([
      fetchTextNoCache('/.well-known/manifest.json'),
      fetchTextNoCache('/.well-known/manifest.sig')
    ]);
    const encoder = new TextEncoder();
    const manifestBytes = encoder.encode(manifestText);
    const sigBytes = Uint8Array.from(atob(sigB64.trim()), c => c.charCodeAt(0));
    const bin = atob(PEM_PUBKEY);
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

  try{
    document.body.textContent = await verifyManifest();
  }catch(err){
    return null;
  }
})();
