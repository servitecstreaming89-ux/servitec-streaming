
(function(){
  // Page transition overlay
  const overlay = document.getElementById('page-overlay');
  function pageOut(e){
    const a = e.target.closest('a');
    if(!a) return;
    const href = a.getAttribute('href');
    if(!href || href.startsWith('#') || a.target === '_blank') return;
    e.preventDefault();
    if(overlay){ overlay.classList.add('active'); }
    setTimeout(()=>{ window.location.href = href; }, 180);
  }
  document.addEventListener('click', pageOut);

  // AOS
  if(window.AOS){ AOS.init({ once:true, duration:700, offset:80, easing:'ease-out-cubic'}); }

  // Simple WhatsApp helper (used on index)
  window.enviarWhatsApp = function(nameFieldId, msgFieldId){
    const nombre = (document.getElementById(nameFieldId)||{}).value || '';
    const msg = (document.getElementById(msgFieldId)||{}).value || '';
    const url = `https://wa.me/573022278927?text=Hola%20soy%20${encodeURIComponent(nombre)}%2C%20${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  // ===== Gallery logic with localStorage (images/videos) =====
  function keyForPage(){
    // unique key per page
    return 'svx_gallery_' + (document.body.dataset.galleryKey || location.pathname.replace(/\W+/g,'_'));
  }

  function loadItems(){
    try{
      const raw = localStorage.getItem(keyForPage());
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveItems(items){
    localStorage.setItem(keyForPage(), JSON.stringify(items||[]));
  }

  function renderGallery(){
    const wrap = document.querySelector('[data-gallery]');
    if(!wrap) return;
    const items = loadItems();
    wrap.innerHTML = '';
    items.forEach((it, idx)=>{
      const el = document.createElement('div');
      el.className = 'gallery-item';
      if(it.type && it.type.startsWith('video/')){
        el.innerHTML = `<video controls src="${it.src}"></video><button class="remove" data-idx="${idx}">✕</button>`;
      } else {
        el.innerHTML = `<img src="${it.src}" alt=""><button class="remove" data-idx="${idx}">✕</button>`;
      }
      wrap.appendChild(el);
    });
  }

  function bindUpload(){
    const input = document.getElementById('upload-media');
    const addBtn = document.getElementById('add-media');
    if(!input || !addBtn) return;

    addBtn.addEventListener('click', async ()=>{
      const files = input.files;
      if(!files || !files.length){ alert('Selecciona imagen(es) o video(s).'); return; }
      const items = loadItems();
      const readers = [];
      for(const f of files){
        const p = new Promise((res, rej)=>{
          const fr = new FileReader();
          fr.onload = ()=> res({ src: fr.result, type: f.type, name: f.name, ts: Date.now() });
          fr.onerror = rej;
          fr.readAsDataURL(f);
        });
        readers.push(p);
      }
      const results = await Promise.all(readers);
      saveItems(items.concat(results));
      renderGallery();
      input.value = ''; // reset
    });

    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('button.remove');
      if(!btn) return;
      const idx = parseInt(btn.dataset.idx, 10);
      const items = loadItems();
      items.splice(idx,1);
      saveItems(items);
      renderGallery();
    })
  }

  // init on load
  window.addEventListener('DOMContentLoaded', ()=>{
    renderGallery();
    bindUpload();
  });
})();
