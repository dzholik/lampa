(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  function normalizeQuality(q){
    if(!q) return 0;
    const s = String(q).toUpperCase();
    if(s.includes('4K') || s.includes('2160')) return 2160;
    if(s.includes('1080')) return 1080;
    if(s.includes('720')) return 720;
    if(s.includes('480')) return 480;
    return 0;
  }
  function compareQuality(a,b){
    return normalizeQuality(a) - normalizeQuality(b);
  }
  function uniqBy(arr, key){
    const seen = new Set();
    const out = [];
    for(const item of arr){
      const k = key(item);
      if(seen.has(k)) continue;
      seen.add(k);
      out.push(item);
    }
    return out;
  }
  async function parallel(tasks, limit){
    const l = typeof limit === 'number' && limit > 0 ? limit : 4;
    const queue = tasks.slice();
    const results = [];
    let running = 0;
    return new Promise((resolve)=>{
      function runNext(){
        if(queue.length === 0 && running === 0){
          resolve(results);
          return;
        }
        while(running < l && queue.length){
          const fn = queue.shift();
          running++;
          Promise.resolve().then(fn).then((r)=>{ results.push(r); }).catch(()=>{}).finally(()=>{ running--; runNext(); });
        }
      }
      runNext();
    });
  }
  function buildUrl(base, params){
    try{
      const u = new URL(base, typeof location!=="undefined"?location.href:base);
      const p = params || {};
      for(const k of Object.keys(p)){
        const v = p[k];
        if(v === undefined || v === null) continue;
        u.searchParams.set(k, String(v));
      }
      return u.toString();
    }catch(e){
      return base;
    }
  }
  async function http(url, options){
    const o = options || {};
    const headers = { ...(o.headers||{}) };
    if(o.token) headers.Authorization = 'Bearer ' + o.token;
    let body;
    if(o.body){
      try{ body = JSON.stringify(o.body); headers['Content-Type'] = 'application/json'; }catch(e){}
    }
    const res = await fetch(url, { method: o.method||'GET', headers, body });
    const ct = res.headers.get('content-type') || '';
    if(ct.includes('application/json')) return await res.json();
    return await res.text();
  }
  function parseHtml(html){
    if(typeof DOMParser !== 'undefined'){
      try{ return new DOMParser().parseFromString(html, 'text/html'); }catch(e){ return null; }
    }
    return null;
  }
  function storageGet(key){
    try{
      if(root.Lampa && root.Lampa.Storage && root.Lampa.Storage.get) return root.Lampa.Storage.get(key);
      if(typeof localStorage !== 'undefined'){ const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
    }catch(e){}
    return null;
  }
  function storageSet(key, value){
    try{
      if(root.Lampa && root.Lampa.Storage && root.Lampa.Storage.set) return root.Lampa.Storage.set(key, value);
      if(typeof localStorage !== 'undefined'){ localStorage.setItem(key, JSON.stringify(value)); }
    }catch(e){}
  }
  function resolveApiUrl(name, cfg){
    if(cfg?.apiUrl) return cfg.apiUrl;
    if(name === 'kodik') return 'https://kodikapi.com';
    if(name === 'svetacdn') return '';
    if(name === 'allohacdn') return 'https://api.alloha.tv';
    if(name === 'videodb') return 'https://videocdn.tv/api';
    if(name === 'filmix') return '';
    if(name === 'kinopub') return 'https://api.service-kp.com/v1';
    if(name === 'rezka') return 'https://rezka.ag';
    return '';
  }
  ns.utils = { normalizeQuality, compareQuality, uniqBy, parallel, buildUrl, http, parseHtml, storageGet, storageSet, resolveApiUrl };
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  const defaults = {
    enabled_balancers: ['svetacdn','allohacdn','videodb'],
    auto_select_quality: '1080p',
    preferred_voice: 'Дубляж',
    filmix: { enabled: false, token: '', priority: 1, apiUrl: '' },
    svetacdn: { enabled: true, priority: 2, apiUrl: '' },
    kinopub: { enabled: false, token: '', device_id: '', priority: 3, apiUrl: '' },
    kodik: { enabled: false, token: '', priority: 2, apiUrl: '' },
    rezka: { enabled: false, priority: 2, apiUrl: '' },
    videodb: { enabled: true, priority: 2, apiUrl: '' }
  };
  let state = JSON.parse(JSON.stringify(defaults));
  function load(){
    const v = ns.utils.storageGet('lampa_balancers_settings');
    if(v && typeof v === 'object') state = { ...state, ...v };
    return get();
  }
  function get(){
    return JSON.parse(JSON.stringify(state));
  }
  function update(partial){
    state = { ...state, ...partial };
    save();
    return get();
  }
  function set(path, value){
    const keys = path.split('.');
    let obj = state;
    for(let i=0;i<keys.length-1;i++){
      const k = keys[i];
      if(typeof obj[k] !== 'object' || obj[k] === null) obj[k] = {};
      obj = obj[k];
    }
    obj[keys[keys.length-1]] = value;
    save();
    return get();
  }
  function save(){
    ns.utils.storageSet('lampa_balancers_settings', state);
  }
  ns.Settings = { get, update, set, defaults, load, save };
  try{ load(); }catch(e){}
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  const defaults = {
    balancers: { active: ['svetacdn','allohacdn'], blacklist: ['rezka'] },
    voices: { preferred: ['Дубляж','Профессиональный'], exclude: ['Любительский'] },
    quality: { min: '720p', max: '4K', preferred: '1080p' },
    series: { season: 1, episode: 1, showAllSeasons: true }
  };
  function apply(results, custom){
    const cfg = { ...defaults, ...(custom||{}) };
    const out = [];
    for(const r of results){
      if(cfg.balancers.blacklist.includes(r.balancer)) continue;
      if(cfg.balancers.active.length && !cfg.balancers.active.includes(r.balancer)) continue;
      if(cfg.voices.exclude && r.voice && cfg.voices.exclude.includes(r.voice)) continue;
      if(cfg.voices.preferred && r.voice && !cfg.voices.preferred.includes(r.voice)) continue;
      const q = r.quality || 'unknown';
      const nq = ns.utils.normalizeQuality(q);
      const min = ns.utils.normalizeQuality(cfg.quality.min);
      const max = ns.utils.normalizeQuality(cfg.quality.max);
      if(nq && (nq < min || nq > max)) continue;
      out.push(r);
    }
    return out;
  }
  ns.Filters = { defaults, apply };
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  class BaseBalancer {
    constructor(config){
      this.name = config?.name || '';
      this.apiUrl = config?.apiUrl || '';
      this.requiresAuth = !!config?.requiresAuth;
      this.token = config?.token || null;
      this.priority = config?.priority ?? 0;
      this.device_id = config?.device_id || '';
    }
    isAvailable(){
      return !this.requiresAuth || !!this.token;
    }
    checkAuth(){
      return !this.requiresAuth || !!this.token;
    }
    async search(query){
      throw new Error('Not implemented');
    }
    async getStreams(contentId){
      throw new Error('Not implemented');
    }
    async getSeasons(contentId){
      throw new Error('Not implemented');
    }
    async getEpisodes(seasonId){
      throw new Error('Not implemented');
    }
    async getDirectLink(streamId){
      throw new Error('Not implemented');
    }
    formatResults(results){
      return Array.isArray(results) ? results : [];
    }
  }
  ns.BaseBalancer = BaseBalancer;
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  const Base = ns.BaseBalancer;
  class Svetacdn extends Base {
    constructor(config){
      super({ ...config, name: 'svetacdn', requiresAuth: false });
      this.apiUrl = config?.apiUrl || '';
    }
    async search(query){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/search', { q: query?.title || '', tmdb: query?.tmdbId, kp: query?.kpId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
      return arr.map(x=>({
        balancer: 'svetacdn',
        contentId: x.id || x.contentId || x.kpId || x.tmdbId || x.slug || '',
        title: x.title || query?.title || '',
        voice: x.voice || null,
        quality: x.quality || null,
        url: x.url || null,
        type: x.type || null
      }));
    }
    async getStreams(contentId){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/streams', { id: contentId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.streams) ? data.streams : (Array.isArray(data) ? data : []);
      return arr.map(x=>({
        balancer: 'svetacdn',
        streamId: x.id || x.streamId || '',
        voice: x.voice || null,
        quality: x.quality || null,
        url: x.url || null
      }));
    }
    async getSeasons(contentId){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/seasons', { id: contentId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.seasons) ? data.seasons : (Array.isArray(data) ? data : []);
      return arr.map(x=>({ seasonId: x.id || x.seasonId || '', title: x.title || String(x.number||''), number: x.number || null }));
    }
    async getEpisodes(seasonId){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/episodes', { id: seasonId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.episodes) ? data.episodes : (Array.isArray(data) ? data : []);
      return arr.map(x=>({ episodeId: x.id || x.episodeId || '', title: x.title || String(x.number||''), number: x.number || null }));
    }
    async getDirectLink(streamId){
      if(!this.apiUrl) return null;
      const url = ns.utils.buildUrl(this.apiUrl + '/direct', { id: streamId });
      const data = await ns.utils.http(url, {});
      return data?.url || null;
    }
  }
  ns.Balancers = ns.Balancers || {};
  ns.Balancers.svetacdn = Svetacdn;
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  const Base = ns.BaseBalancer;
  class Allohacdn extends Base {
    constructor(config){
      super({ ...config, name: 'allohacdn', requiresAuth: false });
      this.apiUrl = config?.apiUrl || '';
    }
    async search(query){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/search', { q: query?.title || '', tmdb: query?.tmdbId, kp: query?.kpId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
      return arr.map(x=>({
        balancer: 'allohacdn',
        contentId: x.id || x.contentId || x.kpId || x.tmdbId || x.slug || '',
        title: x.title || query?.title || '',
        voice: x.voice || null,
        quality: x.quality || null,
        url: x.url || null,
        type: x.type || null
      }));
    }
    async getStreams(contentId){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/streams', { id: contentId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.streams) ? data.streams : (Array.isArray(data) ? data : []);
      return arr.map(x=>({
        balancer: 'allohacdn',
        streamId: x.id || x.streamId || '',
        voice: x.voice || null,
        quality: x.quality || null,
        url: x.url || null
      }));
    }
    async getSeasons(contentId){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/seasons', { id: contentId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.seasons) ? data.seasons : (Array.isArray(data) ? data : []);
      return arr.map(x=>({ seasonId: x.id || x.seasonId || '', title: x.title || String(x.number||''), number: x.number || null }));
    }
    async getEpisodes(seasonId){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/episodes', { id: seasonId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.episodes) ? data.episodes : (Array.isArray(data) ? data : []);
      return arr.map(x=>({ episodeId: x.id || x.episodeId || '', title: x.title || String(x.number||''), number: x.number || null }));
    }
    async getDirectLink(streamId){
      if(!this.apiUrl) return null;
      const url = ns.utils.buildUrl(this.apiUrl + '/direct', { id: streamId });
      const data = await ns.utils.http(url, {});
      return data?.url || null;
    }
  }
  ns.Balancers = ns.Balancers || {};
  ns.Balancers.allohacdn = Allohacdn;
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  const Base = ns.BaseBalancer;
  class Videodb extends Base {
    constructor(config){
      super({ ...config, name: 'videodb', requiresAuth: false });
      this.apiUrl = config?.apiUrl || '';
    }
    async search(query){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/search', { q: query?.title || '', tmdb: query?.tmdbId, kp: query?.kpId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
      return arr.map(x=>({
        balancer: 'videodb',
        contentId: x.id || x.contentId || x.kpId || x.tmdbId || x.slug || '',
        title: x.title || query?.title || '',
        voice: x.voice || null,
        quality: x.quality || null,
        url: x.url || null,
        type: x.type || null
      }));
    }
    async getStreams(contentId){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/streams', { id: contentId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.streams) ? data.streams : (Array.isArray(data) ? data : []);
      return arr.map(x=>({
        balancer: 'videodb',
        streamId: x.id || x.streamId || '',
        voice: x.voice || null,
        quality: x.quality || null,
        url: x.url || null
      }));
    }
    async getSeasons(contentId){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/seasons', { id: contentId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.seasons) ? data.seasons : (Array.isArray(data) ? data : []);
      return arr.map(x=>({ seasonId: x.id || x.seasonId || '', title: x.title || String(x.number||''), number: x.number || null }));
    }
    async getEpisodes(seasonId){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/episodes', { id: seasonId });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.episodes) ? data.episodes : (Array.isArray(data) ? data : []);
      return arr.map(x=>({ episodeId: x.id || x.episodeId || '', title: x.title || String(x.number||''), number: x.number || null }));
    }
    async getDirectLink(streamId){
      if(!this.apiUrl) return null;
      const url = ns.utils.buildUrl(this.apiUrl + '/direct', { id: streamId });
      const data = await ns.utils.http(url, {});
      return data?.url || null;
    }
  }
  ns.Balancers = ns.Balancers || {};
  ns.Balancers.videodb = Videodb;
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  const Base = ns.BaseBalancer;
  class Kodik extends Base {
    constructor(config){
      super({ ...config, name: 'kodik', requiresAuth: true });
      this.apiUrl = config?.apiUrl || '';
    }
    async search(query){
      if(!this.apiUrl || !this.token) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/search', { q: query?.title || '', tmdb: query?.tmdbId, kp: query?.kpId, token: this.token });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
      return arr.map(x=>({
        balancer: 'kodik',
        contentId: x.id || x.contentId || x.kpId || x.tmdbId || x.slug || '',
        title: x.title || query?.title || '',
        voice: x.translation?.title || x.voice || null,
        quality: x.quality || null,
        url: x.link || x.url || null,
        type: x.type || null
      }));
    }
    async getStreams(contentId){
      if(!this.apiUrl || !this.token) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/list', { id: contentId, token: this.token });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.streams) ? data.streams : (Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []));
      return arr.map(x=>({
        balancer: 'kodik',
        streamId: x.id || x.streamId || '',
        voice: x.translation?.title || x.voice || null,
        quality: x.quality || null,
        url: x.link || x.url || null
      }));
    }
    async getSeasons(contentId){
      if(!this.apiUrl || !this.token) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/seasons', { id: contentId, token: this.token });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.seasons) ? data.seasons : (Array.isArray(data) ? data : []);
      return arr.map(x=>({ seasonId: x.id || x.seasonId || '', title: x.title || String(x.number||''), number: x.number || null }));
    }
    async getEpisodes(seasonId){
      if(!this.apiUrl || !this.token) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/episodes', { id: seasonId, token: this.token });
      const data = await ns.utils.http(url, {});
      const arr = Array.isArray(data?.episodes) ? data.episodes : (Array.isArray(data) ? data : []);
      return arr.map(x=>({ episodeId: x.id || x.episodeId || '', title: x.title || String(x.number||''), number: x.number || null }));
    }
    async getDirectLink(streamId){
      if(!this.apiUrl || !this.token) return null;
      const url = ns.utils.buildUrl(this.apiUrl + '/direct', { id: streamId, token: this.token });
      const data = await ns.utils.http(url, {});
      return data?.url || null;
    }
  }
  ns.Balancers = ns.Balancers || {};
  ns.Balancers.kodik = Kodik;
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  const Base = ns.BaseBalancer;
  class Filmix extends Base {
    constructor(config){
      super({ ...config, name: 'filmix', requiresAuth: true });
      this.apiUrl = config?.apiUrl || '';
    }
    async search(query){
      if(!this.apiUrl || !this.token) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/search', { q: query?.title || '', tmdb: query?.tmdbId, kp: query?.kpId });
      const data = await ns.utils.http(url, { token: this.token });
      const arr = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
      return arr.map(x=>({
        balancer: 'filmix',
        contentId: x.id || x.contentId || x.kpId || x.tmdbId || x.slug || '',
        title: x.title || query?.title || '',
        voice: x.voice || null,
        quality: x.quality || null,
        url: x.url || null,
        type: x.type || null
      }));
    }
    async getStreams(contentId){
      if(!this.apiUrl || !this.token) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/streams', { id: contentId });
      const data = await ns.utils.http(url, { token: this.token });
      const arr = Array.isArray(data?.streams) ? data.streams : (Array.isArray(data) ? data : []);
      return arr.map(x=>({
        balancer: 'filmix',
        streamId: x.id || x.streamId || '',
        voice: x.voice || null,
        quality: x.quality || null,
        url: x.url || null
      }));
    }
    async getSeasons(contentId){
      if(!this.apiUrl || !this.token) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/seasons', { id: contentId });
      const data = await ns.utils.http(url, { token: this.token });
      const arr = Array.isArray(data?.seasons) ? data.seasons : (Array.isArray(data) ? data : []);
      return arr.map(x=>({ seasonId: x.id || x.seasonId || '', title: x.title || String(x.number||''), number: x.number || null }));
    }
    async getEpisodes(seasonId){
      if(!this.apiUrl || !this.token) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/episodes', { id: seasonId });
      const data = await ns.utils.http(url, { token: this.token });
      const arr = Array.isArray(data?.episodes) ? data.episodes : (Array.isArray(data) ? data : []);
      return arr.map(x=>({ episodeId: x.id || x.episodeId || '', title: x.title || String(x.number||''), number: x.number || null }));
    }
    async getDirectLink(streamId){
      if(!this.apiUrl || !this.token) return null;
      const url = ns.utils.buildUrl(this.apiUrl + '/direct', { id: streamId });
      const data = await ns.utils.http(url, { token: this.token });
      return data?.url || null;
    }
  }
  ns.Balancers = ns.Balancers || {};
  ns.Balancers.filmix = Filmix;
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  const Base = ns.BaseBalancer;
  class Rezka extends Base {
    constructor(config){
      super({ ...config, name: 'rezka', requiresAuth: false });
      this.apiUrl = config?.apiUrl || '';
    }
    async search(query){
      if(!this.apiUrl) return [];
      const url = ns.utils.buildUrl(this.apiUrl + '/search', { q: query?.title || '' });
      const html = await ns.utils.http(url, {});
      if(typeof html !== 'string') return [];
      const doc = ns.utils.parseHtml(html);
      const out = [];
      if(doc){
        const links = doc.querySelectorAll('a[href]');
        links.forEach(a=>{
          const href = a.getAttribute('href')||'';
          const title = a.textContent||'';
          if(!href || !title) return;
          out.push({ balancer: 'rezka', contentId: href, title, voice: null, quality: null, url: href, type: null });
        });
      }
      return out;
    }
    async getStreams(contentId){
      if(!this.apiUrl) return [];
      const path = contentId && contentId.startsWith('http') ? contentId : (this.apiUrl + String(contentId||''));
      const html = await ns.utils.http(path, {});
      if(typeof html !== 'string') return [];
      const doc = ns.utils.parseHtml(html);
      const out = [];
      if(doc){
        const links = doc.querySelectorAll('a[href]');
        links.forEach(a=>{
          const href = a.getAttribute('href')||'';
          if(!href) return;
          out.push({ balancer: 'rezka', streamId: href, voice: null, quality: null, url: href });
        });
      }
      return out;
    }
    async getSeasons(contentId){
      if(!this.apiUrl) return [];
      const path = contentId && contentId.startsWith('http') ? contentId : (this.apiUrl + String(contentId||''));
      const html = await ns.utils.http(path, {});
      if(typeof html !== 'string') return [];
      const doc = ns.utils.parseHtml(html);
      const out = [];
      if(doc){
        const nodes = doc.querySelectorAll('a,li,div');
        nodes.forEach(n=>{
          const txt = (n.textContent||'').trim();
          const k = (n.getAttribute && n.getAttribute('href')) || '';
          if(/сезон/i.test(txt)) out.push({ seasonId: k||txt, title: txt, number: parseInt((txt.match(/(\d+)/)||[])[1]||'0',10)||null });
        });
      }
      return out;
    }
    async getEpisodes(seasonId){
      if(!this.apiUrl) return [];
      const path = seasonId && seasonId.startsWith('http') ? seasonId : (this.apiUrl + String(seasonId||''));
      const html = await ns.utils.http(path, {});
      if(typeof html !== 'string') return [];
      const doc = ns.utils.parseHtml(html);
      const out = [];
      if(doc){
        const nodes = doc.querySelectorAll('a,li,div');
        nodes.forEach(n=>{
          const txt = (n.textContent||'').trim();
          const k = (n.getAttribute && n.getAttribute('href')) || '';
          if(/серия/i.test(txt)) out.push({ episodeId: k||txt, title: txt, number: parseInt((txt.match(/(\d+)/)||[])[1]||'0',10)||null });
        });
      }
      return out;
    }
    async getDirectLink(streamId){
      const path = streamId && streamId.startsWith('http') ? streamId : (this.apiUrl + String(streamId||''));
      const html = await ns.utils.http(path, {});
      if(typeof html !== 'string') return null;
      const doc = ns.utils.parseHtml(html);
      if(doc){
        const source = doc.querySelector('video source');
        if(source){ const u = source.getAttribute('src'); if(u) return u; }
        const a = doc.querySelector('a[href*=".mp4"],a[href*=".m3u8"]');
        if(a){ const u = a.getAttribute('href'); if(u) return u; }
      }
      return null;
    }
  }
  ns.Balancers = ns.Balancers || {};
  ns.Balancers.rezka = Rezka;
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  function createEl(tag, attrs){
    const el = document.createElement(tag);
    if(attrs){
      for(const k of Object.keys(attrs)){
        if(k === 'text') el.textContent = attrs[k];
        else el.setAttribute(k, attrs[k]);
      }
    }
    return el;
  }
  function renderSettings(){
    const s = ns.Settings.get();
    const overlay = createEl('div', { style: 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;' });
    const panel = createEl('div', { style: 'width:520px;max-width:90vw;background:#1b1b1b;color:#fff;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.4);font-family:sans-serif;' });
    const header = createEl('div', { style: 'padding:16px 20px;font-size:18px;border-bottom:1px solid #333;' });
    header.textContent = 'Lampa Balancers';
    const body = createEl('div', { style: 'padding:16px 20px;max-height:60vh;overflow:auto;' });
    const footer = createEl('div', { style: 'padding:12px 20px;border-top:1px solid #333;display:flex;gap:12px;justify-content:flex-end;' });
    const list = createEl('div');
    const balancers = Object.keys(ns.Balancers||{});
    balancers.forEach(name=>{
      const row = createEl('div', { style: 'padding:8px 0;border-bottom:1px dashed #333;' });
      const top = createEl('div', { style: 'display:flex;align-items:center;justify-content:space-between;' });
      const left = createEl('div');
      left.textContent = name;
      const right = createEl('div', { style: 'display:flex;gap:8px;align-items:center;' });
      const enabled = createEl('input', { type: 'checkbox' });
      enabled.checked = !!(s[name]?.enabled || s.enabled_balancers.includes(name));
      const priority = createEl('input', { type: 'number' });
      priority.value = String(s[name]?.priority ?? 1);
      right.appendChild(enabled);
      right.appendChild(priority);
      top.appendChild(left);
      top.appendChild(right);
      const api = createEl('input', { type: 'text', placeholder: 'API URL', style: 'width:100%;padding:6px;border-radius:6px;border:1px solid #333;background:#0f0f0f;color:#fff;margin-top:6px;' });
      api.value = s[name]?.apiUrl || '';
      row.appendChild(top);
      row.appendChild(api);
      list.appendChild(row);
      row.dataset.key = name;
    });
    const tokens = createEl('div', { style: 'margin-top:12px;' });
    const tFilmix = createEl('input', { type: 'text', placeholder: 'Filmix token', style: 'width:100%;padding:8px;border-radius:6px;border:1px solid #333;background:#0f0f0f;color:#fff;' });
    tFilmix.value = s.filmix?.token || '';
    const tKodik = createEl('input', { type: 'text', placeholder: 'Kodik token', style: 'width:100%;padding:8px;border-radius:6px;border:1px solid #333;background:#0f0f0f;color:#fff;margin-top:8px;' });
    tKodik.value = s.kodik?.token || '';
    const tKinopubToken = createEl('input', { type: 'text', placeholder: 'Kinopub access token', style: 'width:100%;padding:8px;border-radius:6px;border:1px solid #333;background:#0f0f0f;color:#fff;margin-top:8px;' });
    tKinopubToken.value = s.kinopub?.token || '';
    const tKinopubDevice = createEl('input', { type: 'text', placeholder: 'Kinopub device id', style: 'width:100%;padding:8px;border-radius:6px;border:1px solid #333;background:#0f0f0f;color:#fff;margin-top:8px;' });
    tKinopubDevice.value = s.kinopub?.device_id || '';
    tokens.appendChild(tFilmix);
    tokens.appendChild(tKodik);
    tokens.appendChild(tKinopubToken);
    tokens.appendChild(tKinopubDevice);
    body.appendChild(list);
    body.appendChild(tokens);
    const btnClose = createEl('button', { style: 'background:#333;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;' });
    btnClose.textContent = 'Закрыть';
    const btnVerify = createEl('button', { style: 'background:#27b;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;' });
    btnVerify.textContent = 'Проверить';
    const btnSave = createEl('button', { style: 'background:#2b7;color:#000;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;' });
    btnSave.textContent = 'Сохранить';
    btnClose.onclick = ()=>{ overlay.remove(); };
    btnVerify.onclick = async ()=>{
      try{ await ns.Plugin.verify(); }catch(e){}
    };
    btnSave.onclick = ()=>{
      const newEnabled = [];
      const updates = {};
      list.querySelectorAll('div').forEach(row=>{
        const key = row.dataset.key;
        if(!key) return;
        const inputs = row.querySelectorAll('input');
        const enabled = inputs[0].checked;
        const priority = parseInt(inputs[1].value||'0',10)||0;
        const apiUrl = inputs[2].value||'';
        updates[key] = { ...(ns.Settings.get()[key]||{}), enabled, priority, apiUrl };
        if(enabled) newEnabled.push(key);
      });
      ns.Settings.update({ enabled_balancers: newEnabled, ...updates, filmix: { ...(ns.Settings.get().filmix||{}), token: tFilmix.value }, kodik: { ...(ns.Settings.get().kodik||{}), token: tKodik.value }, kinopub: { ...(ns.Settings.get().kinopub||{}), token: tKinopubToken.value, device_id: tKinopubDevice.value } });
      ns.Plugin.init();
      overlay.remove();
    };
    footer.appendChild(btnClose);
    footer.appendChild(btnVerify);
    footer.appendChild(btnSave);
    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(footer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }
  function showVerify(report){
    const overlay = document.createElement('div');
    overlay.style = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;';
    const panel = document.createElement('div');
    panel.style = 'width:520px;max-width:90vw;background:#1b1b1b;color:#fff;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.4);font-family:sans-serif;';
    const header = document.createElement('div');
    header.style = 'padding:16px 20px;font-size:18px;border-bottom:1px solid #333;';
    header.textContent = 'Проверка источников';
    const body = document.createElement('div');
    body.style = 'padding:16px 20px;max-height:60vh;overflow:auto;';
    const list = document.createElement('div');
    (report||[]).forEach(r=>{
      const row = document.createElement('div');
      row.style = 'padding:8px 0;border-bottom:1px dashed #333;';
      const line = document.createElement('div');
      line.textContent = `${r.name}: ${r.ok?'OK':'ERR'} | count=${r.count} | auth=${r.requiresAuth?'yes':'no'} | available=${r.available?'yes':'no'}`;
      const url = document.createElement('div');
      url.style = 'font-size:12px;color:#aaa;margin-top:4px;';
      url.textContent = String(r.apiUrl||'');
      row.appendChild(line);
      row.appendChild(url);
      list.appendChild(row);
    });
    const footer = document.createElement('div');
    footer.style = 'padding:12px 20px;border-top:1px solid #333;display:flex;gap:12px;justify-content:flex-end;';
    const btnClose = document.createElement('button');
    btnClose.style = 'background:#333;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;';
    btnClose.textContent = 'Закрыть';
    btnClose.onclick = ()=>overlay.remove();
    footer.appendChild(btnClose);
    body.appendChild(list);
    panel.appendChild(header);
    panel.appendChild(body);
    panel.appendChild(footer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }
  function injectButton(){
    const btn = document.createElement('div');
    btn.textContent = 'Balancers';
    btn.style.position = 'fixed';
    btn.style.bottom = '16px';
    btn.style.right = '16px';
    btn.style.background = '#1b1b1b';
    btn.style.color = '#fff';
    btn.style.padding = '8px 12px';
    btn.style.borderRadius = '6px';
    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = '99999';
    btn.onclick = ()=>renderSettings();
    document.body.appendChild(btn);
  }
  ns.UI = { renderSettings, injectButton, showVerify };
})(typeof window!=="undefined"?window:global);
(function(root){
  const ns = root.LampaBalancers || (root.LampaBalancers = {});
  const Plugin = {};
  let balancerInstances = [];
  function init(){
    const settings = ns.Settings.get();
    const map = ns.Balancers || {};
    balancerInstances = [];
    for(const name of settings.enabled_balancers){
      const cfg = settings[name] || {};
      cfg.apiUrl = ns.utils.resolveApiUrl(name, cfg);
      const Ctor = map[name];
      if(!Ctor) continue;
      const inst = new Ctor(cfg);
      if(inst.isAvailable()) balancerInstances.push(inst);
    }
    balancerInstances.sort((a,b)=> (b.priority||0) - (a.priority||0));
  }
  function showSettings(){
    if(ns.UI && ns.UI.renderSettings) ns.UI.renderSettings();
  }
  async function verify(){
    const meta = { title: 'Avengers', tmdbId: null, kpId: null };
    const report = [];
    for(const b of balancerInstances){
      const item = { name: b.name, apiUrl: b.apiUrl, requiresAuth: b.requiresAuth, available: b.isAvailable(), ok: false, count: 0, error: null };
      try{
        const r = await b.search(meta);
        item.count = Array.isArray(r) ? r.length : 0;
        item.ok = true;
      }catch(e){ item.error = String(e && e.message || e); }
      report.push(item);
    }
    if(ns.UI && ns.UI.showVerify){ ns.UI.showVerify(report); }
    return report;
  }
  async function search(meta){
    const tasks = balancerInstances.map(b=>()=>b.search(meta));
    const results = [];
    for(const fn of tasks){
      try{
        const r = await fn();
        if(Array.isArray(r)) results.push(...r);
      }catch(e){}
    }
    const filtered = ns.Filters.apply(results);
    return ns.utils.uniqBy(filtered, x=>`${x.balancer}:${x.contentId}:${x.voice||''}:${x.quality||''}`);
  }
  Plugin.init = init;
  Plugin.search = search;
  Plugin.verify = verify;
  Plugin.showSettings = showSettings;
  Plugin.getBalancers = ()=>balancerInstances.slice();
  ns.Plugin = Plugin;
  if(root.Lampa && root.Lampa.Plugin){
    try{ root.Lampa.Plugin.register && root.Lampa.Plugin.register('lampa-balancers-plugin', Plugin); }catch(e){}
  }
  if(ns.UI && ns.UI.injectButton){
    try{ ns.UI.injectButton(); }catch(e){}
  }
})(typeof window!=="undefined"?window:global);
(function(root){
  try{ if(root.LampaBalancers && root.LampaBalancers.Plugin){ root.LampaBalancers.Plugin.init(); } }catch(e){}
})(typeof window!=="undefined"?window:global);

