function vibix(component, _object) {
    let network = new Lampa.Reguest()
    let extract = {}
    let object = _object
    let select_title = ''
    let select_id = ''

    let filter_items = {}

    let choice = {
        season: 0,
        voice: 0,
        voice_name: ''
    }

    // Default API key
    const defaultApiKey = '23398|JZGdpfzKnC3rwliBjLif76NFRLsQhl1IZLUeTG0s462218ea'
    
    // XOR key for decryption (extracted from online_mod.js)
    const XOR_KEY = 'RySdvcyu5iTUxn97vn4HwoniwgxaCynA'
    
    // User agent
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
    
    // CORS proxies (rotation)
    const corsProxies = [
        'https://cors.nb557.workers.dev/',
        'https://cors.fx666.workers.dev/',
        'https://cors557.deno.dev/'
    ]
    
    let proxyIndex = 0

    /**
     * Get API key from storage or use default
     */
    function getApiKey() {
        return Lampa.Storage.get('vibix_token', '') || defaultApiKey
    }
    
    /**
     * Get CORS proxy URL
     */
    function getCorsProxy() {
        let customProxy = Lampa.Storage.get('vibix_cors_proxy', '')
        if (customProxy) {
            if (!customProxy.endsWith('/')) customProxy += '/'
            return customProxy
        }
        // Rotate proxies
        const proxy = corsProxies[proxyIndex]
        proxyIndex = (proxyIndex + 1) % corsProxies.length
        return proxy
    }
    
    /**
     * Build proxy URL with headers
     */
    function proxyUrl(url, headers) {
        const proxy = getCorsProxy()
        let proxyEnc = ''
        
        if (headers) {
            for (let key in headers) {
                proxyEnc += 'param/' + encodeURIComponent(key) + '=' + encodeURIComponent(headers[key]) + '/'
            }
        }
        
        // Use enc2t format for better compatibility
        if (proxyEnc) {
            // Extract filename from URL
            let posStart = url.lastIndexOf('://')
            let posEnd = url.lastIndexOf('?')
            if (posEnd === -1) posEnd = url.length
            if (posStart === -1) posStart = -3
            let name = url.substring(posStart + 3, posEnd)
            posStart = name.lastIndexOf('/')
            name = posStart !== -1 ? name.substring(posStart + 1) : ''
            
            return proxy + 'enc2/' + encodeURIComponent(btoa(proxyEnc + url)) + '/' + name + '?jacred.test'
        }
        
        return proxy + url
    }

    /**
     * XOR decryption
     */
    function xorDecrypt(str, key) {
        const keyLen = key.length
        const len = str.length
        let result = ''
        
        for (let i = 0; i < len; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % keyLen))
        }
        
        return result
    }

    /**
     * Decrypt Vibix response
     */
    function decryptResponse(json) {
        try {
            if (!json || typeof json.p !== 'string') return json
            
            let str = json.p
            
            if (json.v === 1) {
                // Step 1: Reverse string
                str = str.split('').reverse().join('')
                
                // Step 2: Base64 decode
                str = atob(str)
                
                // Step 3: XOR decrypt
                str = xorDecrypt(str, XOR_KEY)
                
                // Step 4: Convert binary to UTF-8
                const decoder = new TextDecoder('utf-8')
                const arr = new Uint8Array(str.length)
                for (let i = 0; i < str.length; i++) {
                    arr[i] = str.charCodeAt(i)
                }
                str = decoder.decode(arr)
            }
            
            return JSON.parse(str)
        } catch (e) {
            console.log('Vibix: Decrypt error:', e)
            return json
        }
    }

    /**
     * Parse iframe URL to extract type and ID
     */
    function parseIFrame(iframeUrl) {
        const serial = iframeUrl.match(/\/embed-serials\/(\d+)/)
        const movie = iframeUrl.match(/\/embed\/(\d+)/)
        
        try {
            const url = new URL(iframeUrl)
            const host = url.origin
            
            if (serial) {
                return { type: 'serial', id: serial[1], host: host }
            } else if (movie) {
                return { type: 'movie', id: movie[1], host: host }
            }
        } catch (e) {
            console.log('Vibix: Failed to parse iframe URL:', e)
        }
        
        return null
    }

    /**
     * Search for video
     */
    this.search = function (_object, id, sim) {
        object = _object
        select_title = object.movie.title

        // Determine ID type
        let is_imdb = id && id.toString().startsWith('tt')
        let is_kp = id && !is_imdb && !isNaN(parseInt(id))

        if (is_imdb) {
            console.log('Vibix: Detected IMDB ID:', id)
            searchVideo('imdb', id)
        } else if (is_kp) {
            console.log('Vibix: Detected Kinopoisk ID:', id)
            searchVideo('kp', id)
        } else {
            getExternalIds()
        }
    }

    function getExternalIds() {
        let tmdburl = (object.movie.name ? 'tv' : 'movie') + '/' + object.movie.id + '/external_ids?api_key=4ef0d7355d9ffb5151e987764708ce96&language=ru'
        let baseurl = typeof Lampa.TMDB !== 'undefined' ? Lampa.TMDB.api(tmdburl) : 'http://api.themoviedb.org/' + tmdburl

        network.native(baseurl, function (ttid) {
            if (ttid.imdb_id) {
                console.log('Vibix: Got IMDB from TMDB:', ttid.imdb_id)
                searchVideo('imdb', ttid.imdb_id)
            } else {
                component.emptyForQuery(select_title)
            }
        }, function (a, c) {
            component.empty(network.errorDecode(a, c))
        })
    }

    /**
     * Search video via Vibix API
     */
    function searchVideo(type, id) {
        network.clear()
        network.timeout(15000)

        const apiKey = getApiKey()
        const url = 'https://vibix.org/api/v1/publisher/videos/' + type + '/' + encodeURIComponent(id)

        console.log('Vibix: Searching:', url)

        // Use proxy for API request
        const proxiedUrl = proxyUrl(url, {
            'Authorization': 'Bearer ' + apiKey,
            'Accept': 'application/json',
            'User-Agent': userAgent
        })

        network.native(proxiedUrl, function (str) {
            let json
            try {
                json = typeof str === 'string' ? JSON.parse(str) : str
            } catch (e) {
                console.log('Vibix: Parse error:', e)
                component.empty('Ошибка парсинга ответа')
                return
            }

            console.log('Vibix: Got video:', json.id, json.name, json.type)

            if (json && json.iframe_url) {
                extract = {
                    id: json.id,
                    name: json.name,
                    type: json.type,
                    quality: json.quality,
                    iframe_url: json.iframe_url,
                    voiceovers: json.voiceovers
                }
                getEmbedPlaylist(json.iframe_url)
            } else if (json && json.error) {
                component.empty('Vibix: ' + json.error)
            } else {
                // Try alternate ID
                if (type === 'kp' && object.movie.imdb_id) {
                    console.log('Vibix: Not found by KP, trying IMDB:', object.movie.imdb_id)
                    searchVideo('imdb', object.movie.imdb_id)
                } else {
                    component.emptyForQuery(select_title)
                }
            }
        }, function (a, c) {
            console.log('Vibix: Search error:', a, c)
            
            // Try alternate proxy on error
            if (a.status === 0 || a.status === 429) {
                const retryUrl = proxyUrl('https://vibix.org/api/v1/publisher/videos/' + type + '/' + encodeURIComponent(id), {
                    'Authorization': 'Bearer ' + apiKey,
                    'Accept': 'application/json',
                    'User-Agent': userAgent
                })
                
                network.native(retryUrl, function (str) {
                    let json
                    try {
                        json = typeof str === 'string' ? JSON.parse(str) : str
                    } catch (e) {
                        component.empty(network.errorDecode(a, c))
                        return
                    }
                    
                    if (json && json.iframe_url) {
                        extract = {
                            id: json.id,
                            name: json.name,
                            type: json.type,
                            quality: json.quality,
                            iframe_url: json.iframe_url,
                            voiceovers: json.voiceovers
                        }
                        getEmbedPlaylist(json.iframe_url)
                    } else {
                        component.emptyForQuery(select_title)
                    }
                }, function () {
                    component.empty(network.errorDecode(a, c))
                })
            } else {
                component.empty(network.errorDecode(a, c))
            }
        })
    }

    /**
     * Get playlist from embed API
     */
    function getEmbedPlaylist(iframeUrl) {
        const info = parseIFrame(iframeUrl)
        
        if (!info) {
            console.log('Vibix: Failed to parse iframe URL')
            successFallback()
            return
        }

        const { host, type, id } = info
        
        // Build embed API URL
        const timestamp = Math.floor(Date.now() / 1000)
        const nonce = Math.random().toString(36).substring(2, 15)
        
        const embedPath = type === 'movie' ? '/api/v1/embed/' : '/api/v1/embed-serials/'
        let embedUrl = host + embedPath + id
        
        // Add parameters
        embedUrl += '?domain=iframe.cloud'
        embedUrl += '&iframe_url=' + encodeURIComponent(iframeUrl)
        embedUrl += '&ts=' + timestamp
        embedUrl += '&nonce=' + encodeURIComponent(nonce)
        embedUrl += '&nc=' + Math.floor(Date.now() / 60000)

        console.log('Vibix: Getting embed:', embedUrl)

        network.clear()
        network.timeout(15000)

        // Use proxy for embed request
        const proxiedUrl = proxyUrl(embedUrl, {
            'User-Agent': userAgent,
            'Origin': host,
            'Referer': iframeUrl,
            'Accept': 'application/json',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        })

        network.native(proxiedUrl, function (str) {
            let json
            try {
                json = typeof str === 'string' ? JSON.parse(str) : str
            } catch (e) {
                console.log('Vibix: Embed parse error:', e)
                successFallback()
                return
            }

            // Decrypt if encrypted
            if (json && json.p && json.v !== undefined) {
                console.log('Vibix: Decrypting response...')
                json = decryptResponse(json)
            }

            console.log('Vibix: Got playlist:', json)

            if (json && json.data && json.data.playlist) {
                extract.playlist = json.data.playlist
                processPlaylist(json.data.playlist)
            } else if (json && json.playlist) {
                extract.playlist = json.playlist
                processPlaylist(json.playlist)
            } else {
                successFallback()
            }
        }, function (a, c) {
            console.log('Vibix: Embed error:', a, c)
            successFallback()
        })
    }

    /**
     * Process playlist
     */
    function processPlaylist(playlist) {
        console.log('Vibix: Processing playlist with', playlist.length, 'items')

        component.loading(false)
        filter()
        
        let items = filtred(playlist)
        console.log('Vibix: Filtered', items.length, 'items')

        if (items.length === 0) {
            component.empty('Нет доступных видео')
            return
        }

        append(items)
    }

    /**
     * Fallback for single video
     */
    function successFallback() {
        component.loading(false)

        let items = [{
            title: extract.name || select_title,
            quality: extract.quality || '720p',
            info: '',
            iframe_url: extract.iframe_url,
            video_id: extract.id,
            media: []
        }]

        append(items)
    }

    this.extendChoice = function (saved) {
        Lampa.Arrays.extend(choice, saved, true)
    }

    this.reset = function () {
        component.reset()
        choice = { season: 0, voice: 0, voice_name: '' }
        filter()
        append(filtred(extract.playlist || []))
        component.saveChoice(choice)
    }

    this.filter = function (type, a, b) {
        choice[a.stype] = b.index
        if (a.stype == 'voice') choice.voice_name = filter_items.voice[b.index]
        component.reset()
        filter()
        append(filtred(extract.playlist || []))
        component.saveChoice(choice)
    }

    this.destroy = function () {
        network.clear()
        extract = null
    }

    /**
     * Parse file string: [480p]{Дубляж}URL,[720p]{Дубляж}URL,...
     */
    function parseFileString(str) {
        if (!str) return []
        
        let items = []
        let regex = /\[(\d+p)\]\{([^}]*)\}([^,\[]+)/g
        let match
        
        while ((match = regex.exec(str)) !== null) {
            items.push({
                label: match[1],
                quality: parseInt(match[1]),
                voice: match[2],
                file: match[3].trim()
            })
        }
        
        items.sort(function(a, b) { return b.quality - a.quality })
        return items
    }

    /**
     * Extract voices from file string
     */
    function extractVoices(str) {
        let voices = {}
        let items = parseFileString(str)
        
        items.forEach(function(item) {
            let voice = item.voice || ''
            let prev = voices[voice]
            let prev_items = prev && prev.items || []
            prev_items.push(item)

            if (!prev || item.quality > prev.quality) {
                voices[voice] = { quality: item.quality, items: prev_items }
            }
        })
        
        return voices
    }

    function parseSubs(str) {
        if (!str) return false
        try {
            let subtitles = []
            let regex = /\[([^\]]+)\]([^,\[]+)/g
            let match

            while ((match = regex.exec(str)) !== null) {
                subtitles.push({ label: match[1], url: match[2].trim() })
            }
            return subtitles.length ? subtitles : false
        } catch (e) {
            return false
        }
    }

    function filter() {
        filter_items = { season: [], voice: [] }

        let season_objs = []

        if (extract.playlist && extract.playlist.forEach) {
            extract.playlist.forEach(function(s) {
                if (s.folder) {
                    s.title = s.title || s.comment || ''
                    s.season_num = parseInt(s.title.match(/\d+/)) || 0
                    season_objs.push(s)
                }
            })
        }

        season_objs.sort(function(a, b) {
            let cmp = a.season_num - b.season_num
            if (cmp) return cmp
            if (a.title > b.title) return 1
            if (a.title < b.title) return -1
            return 0
        })

        filter_items.season = season_objs.map(function(s) { return s.title })
        if (!filter_items.season[choice.season]) choice.season = 0

        let s = season_objs[choice.season]

        if (s && s.folder) {
            s.folder.forEach(function(e) {
                if (e.folder) {
                    e.folder.forEach(function(v) {
                        let voice = v.title || v.comment || ''
                        if (filter_items.voice.indexOf(voice) == -1) filter_items.voice.push(voice)
                    })
                } else if (typeof e.file === 'string') {
                    e.file_voices = extractVoices(e.file)
                    for (let voice in e.file_voices) {
                        if (voice && filter_items.voice.indexOf(voice) == -1) filter_items.voice.push(voice)
                    }
                }
            })
        } else if (extract.playlist && extract.playlist.length > 0) {
            extract.playlist.forEach(function(item) {
                if (item.file && typeof item.file === 'string') {
                    item.file_voices = extractVoices(item.file)
                    for (let voice in item.file_voices) {
                        if (voice && filter_items.voice.indexOf(voice) == -1) filter_items.voice.push(voice)
                    }
                }
            })
        }

        if (!filter_items.voice[choice.voice]) choice.voice = 0

        if (choice.voice_name) {
            let inx = filter_items.voice.indexOf(choice.voice_name)
            if (inx == -1) choice.voice = 0
            else if (inx !== choice.voice) choice.voice = inx
        }

        component.filter(filter_items, choice)
    }

    function filtred(playlist) {
        let result = []
        if (!playlist || !playlist.forEach) return result

        playlist.forEach(function(data) {
            if (data.folder) {
                let s_title = data.title || data.comment || ''

                if (s_title == filter_items.season[choice.season]) {
                    let season_num = parseInt(s_title.match(/\d+/)) || 1

                    data.folder.forEach(function(e) {
                        let e_title = e.title || e.comment || ''
                        let episode_num = parseInt(e_title.match(/\d+/)) || 1
                        e_title = e_title.replace(/\d+/, '').replace(/серия/i, '').trim()

                        if (e.folder) {
                            e.folder.forEach(function(v) {
                                let voice = v.title || v.comment || ''
                                if (voice == filter_items.voice[choice.voice] && v.file) {
                                    let items = parseFileString(v.file)
                                    result.push({
                                        title: component.formatEpisodeTitle ? component.formatEpisodeTitle(season_num, episode_num, e_title) : 'S' + season_num + 'E' + episode_num + ' ' + e_title,
                                        quality: items[0] && items[0].quality ? items[0].quality + 'p' : '360p ~ 1080p',
                                        info: ' / ' + Lampa.Utils.shortText(voice, 50),
                                        season: season_num,
                                        episode: episode_num,
                                        media: items,
                                        subtitles: parseSubs(v.subtitle)
                                    })
                                }
                            })
                        } else if (e.file_voices) {
                            let voice = filter_items.voice[choice.voice] || ''
                            let v = e.file_voices[voice] || e.file_voices['']
                            if (v) {
                                result.push({
                                    title: component.formatEpisodeTitle ? component.formatEpisodeTitle(season_num, episode_num, e_title) : 'S' + season_num + 'E' + episode_num + ' ' + e_title,
                                    quality: v.quality ? v.quality + 'p' : '360p ~ 1080p',
                                    info: voice ? ' / ' + Lampa.Utils.shortText(voice, 50) : '',
                                    season: season_num,
                                    episode: episode_num,
                                    media: v.items,
                                    subtitles: parseSubs(e.subtitle)
                                })
                            }
                        }
                    })
                }
            } else {
                if (!data.file_voices && data.file && typeof data.file === 'string') {
                    data.file_voices = extractVoices(data.file)
                }

                if (data.file_voices && Object.keys(data.file_voices).length > 0) {
                    let subtitles = parseSubs(data.subtitle)
                    for (let voice in data.file_voices) {
                        let v = data.file_voices[voice]
                        result.push({
                            title: voice || data.title || data.comment || select_title,
                            quality: v.quality ? v.quality + 'p' : '360p ~ 1080p',
                            info: '',
                            media: v.items,
                            subtitles: subtitles
                        })
                    }
                } else if (data.file) {
                    let items = parseFileString(data.file)
                    if (items.length === 0 && data.file.startsWith('http')) {
                        items = [{
                            label: extract.quality || '720p',
                            quality: parseInt(extract.quality) || 720,
                            voice: '',
                            file: data.file
                        }]
                    }
                    result.push({
                        title: data.title || data.comment || select_title,
                        quality: items[0] && items[0].quality ? items[0].quality + 'p' : extract.quality || '720p',
                        info: '',
                        media: items,
                        subtitles: parseSubs(data.subtitle)
                    })
                }
            }
        })

        return result
    }

    function getFile(element) {
        let file = ''
        let quality = false
        let items = element.media

        if (items && items.length) {
            file = items[0].file
            quality = {}
            items.forEach(function(item) {
                quality[item.label] = item.file
            })
        } else if (element.iframe_url) {
            file = element.iframe_url
        }

        return { file: file, quality: quality }
    }

    function append(items) {
        component.reset()
        let viewed = Lampa.Storage.cache('online_view', 5000, [])

        items.forEach(function(element) {
            if (element.season) {
                element.title = 'S' + element.season + ' / ' + Lampa.Lang.translate('torrent_serial_episode') + ' ' + element.title
            }

            let hash = Lampa.Utils.hash(element.season ?
                [element.season, element.episode, object.movie.original_title].join('') :
                object.movie.original_title)
            let view = Lampa.Timeline.view(hash)
            let item = Lampa.Template.get('online', element)

            let hash_file = Lampa.Utils.hash(element.season ?
                [element.season, element.episode, object.movie.original_title, element.title].join('') :
                object.movie.original_title + 'vibix')

            element.timeline = view
            item.append(Lampa.Timeline.render(view))

            if (Lampa.Timeline.details) {
                item.find('.online__quality').append(Lampa.Timeline.details(view, ' / '))
            }

            if (viewed.indexOf(hash_file) !== -1) {
                item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>')
            }

            item.on('hover:enter', function() {
                if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100)

                let extra = getFile(element)

                if (extra.file) {
                    let playlist = []
                    let first = {
                        url: component.getDefaultQuality ? component.getDefaultQuality(extra.quality, extra.file) : extra.file,
                        quality: component.renameQualityMap ? component.renameQualityMap(extra.quality) : extra.quality,
                        subtitles: element.subtitles,
                        timeline: view,
                        title: element.season ? element.title : select_title + (element.title == select_title ? '' : ' / ' + element.title)
                    }

                    if (element.season) {
                        items.forEach(function(elem) {
                            let ex = getFile(elem)
                            playlist.push({
                                url: component.getDefaultQuality ? component.getDefaultQuality(ex.quality, ex.file) : ex.file,
                                quality: component.renameQualityMap ? component.renameQualityMap(ex.quality) : ex.quality,
                                subtitles: elem.subtitles,
                                timeline: elem.timeline,
                                title: elem.title
                            })
                        })
                    } else {
                        playlist.push(first)
                    }

                    if (playlist.length > 1) first.playlist = playlist

                    Lampa.Player.play(first)
                    Lampa.Player.playlist(playlist)

                    if (viewed.indexOf(hash_file) == -1) {
                        viewed.push(hash_file)
                        item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>')
                        Lampa.Storage.set('online_view', viewed)
                    }
                } else {
                    Lampa.Noty.show(Lampa.Lang.translate('online_nolink'))
                }
            })

            component.append(item)

            component.contextmenu({
                item: item,
                view: view,
                viewed: viewed,
                hash_file: hash_file,
                file: function(call) { call(getFile(element)) }
            })
        })

        component.start(true)
    }
}

export default vibix
