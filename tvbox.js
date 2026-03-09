// Vibix Online Mod v1.0
// Compiled single file

(function () {
    'use strict';

    // ============== LANGUAGES ==============
    if(!Lampa.Lang){
        let lang_data = {}

        Lampa.Lang = {
            add: (data)=>{
                lang_data = data
            },
            translate: (key)=>{
                return lang_data[key] ? lang_data[key].ru : key
            }
        }
    }

    Lampa.Lang.add({
        online_nolink: {
            ru: 'Не удалось извлечь ссылку',
            uk: 'Неможливо отримати посилання',
            en: 'Failed to fetch link',
        },
        online_waitlink: {
            ru: 'Работаем над извлечением ссылки, подождите...',
            uk: 'Працюємо над отриманням посилання, зачекайте...',
            en: 'Working on extracting the link, please wait...',
        },
        online_balanser: {
            ru: 'Балансер',
            uk: 'Балансер',
            en: 'Balancer',
        },
        helper_online_file: {
            ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню',
            uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню',
            en: 'Hold the "OK" key to bring up the context menu',
        },
        online_query_start: {
            ru: 'По запросу',
            uk: 'На запит',
            en: 'On request',
        },
        online_query_end: {
            ru: 'нет результатов',
            uk: 'немає результатів',
            en: 'no results',
        },
        title_online: {
            ru: 'Онлайн',
            uk: 'Онлайн',
            en: 'Online',
        },
        title_proxy: {
            ru: 'Прокси',
            uk: 'Проксі',
            en: 'Proxy',
        },
        online_proxy_title: {
            ru: 'Основной прокси',
            uk: 'Основний проксі',
            en: 'Main proxy',
        },
        online_proxy_descr:{
            ru: 'Будет использоваться для всех балансеров',
            uk: 'Використовуватиметься для всіх балансерів',
            en: 'Will be used for all balancers',
        },
        online_proxy_placeholder: {
            ru: 'Например: http://proxy.com',
            uk: 'Наприклад: http://proxy.com',
            en: 'For example: http://proxy.com',
        },
        filmix_param_add_title: {
            ru: 'Добавить ТОКЕН от Filmix',
            uk: 'Додати ТОКЕН від Filmix',
            en: 'Add TOKEN from Filmix',
        },
        filmix_param_add_descr: {
            ru: 'Добавьте ТОКЕН для подключения подписки',
            uk: 'Додайте ТОКЕН для підключення передплати',
            en: 'Add a TOKEN to connect a subscription',
        },
        filmix_param_placeholder: {
            ru: 'Например: nxjekeb57385b..',
            uk: 'Наприклад: nxjekeb57385b..',
            en: 'For example: nxjekeb57385b..',
        },
        filmix_param_add_device: {
            ru: 'Добавить устройство на Filmix',
            uk: 'Додати пристрій на Filmix',
            en: 'Add Device to Filmix',
        },
        filmix_modal_text: {
            ru: 'Введите его на странице https://filmix.ac/consoles в вашем авторизованном аккаунте!',
            uk: 'Введіть його на сторінці https://filmix.ac/consoles у вашому авторизованому обліковому записі!',
            en: 'Enter it at https://filmix.ac/consoles in your authorized account!',
        },
        filmix_modal_wait: {
            ru: 'Ожидаем код',
            uk: 'Очікуємо код',
            en: 'Waiting for the code',
        },
        filmix_copy_secuses: {
            ru: 'Код скопирован в буфер обмена',
            uk: 'Код скопійовано в буфер обміну',
            en: 'Code copied to clipboard',
        },
        filmix_copy_fail: {
            ru: 'Ошибка при копировании',
            uk: 'Помилка при копіюванні',
            en: 'Copy error',
        },
        filmix_nodevice: {
            ru: 'Устройство не авторизовано',
            uk: 'Пристрій не авторизований',
            en: 'Device not authorized',
        },
        title_status: {
            ru: 'Статус',
            uk: 'Статус',
            en: 'Status',
        },
        online_voice_subscribe: {
            ru: 'Подписаться на перевод',
            uk: 'Підписатися на переклад',
            en: 'Subscribe to translation',
        },
        online_voice_success: {
            ru: 'Вы успешно подписались',
            uk: 'Ви успішно підписалися',
            en: 'You have successfully subscribed',
        },
        online_voice_error: {
            ru: 'Возникла ошибка',
            uk: 'Виникла помилка',
            en: 'An error has occurred',
        },
        vibix_token_title: {
            ru: 'API ключ Vibix',
            uk: 'API ключ Vibix',
            en: 'Vibix API Key',
        },
        vibix_token_descr: {
            ru: 'Необязательно (есть ключ по умолчанию)',
            uk: 'Необов\'язково (є ключ за замовчуванням)',
            en: 'Optional (default key available)',
        },
        vibix_token_placeholder: {
            ru: 'Например: 23398|JZGdpfzKnC3rwliBjLif76NFRLsQhl1IZLUeTG0s462218ea',
            uk: 'Наприклад: 23398|JZGdpfzKnC3rwliBjLif76NFRLsQhl1IZLUeTG0s462218ea',
            en: 'For example: 23398|JZGdpfzKnC3rwliBjLif76NFRLsQhl1IZLUeTG0s462218ea',
        },
        vibix_cors_proxy_title: {
            ru: 'CORS прокси для Vibix',
            uk: 'CORS проксі для Vibix',
            en: 'CORS Proxy for Vibix',
        },
        vibix_cors_proxy_descr: {
            ru: 'Оставьте пустым для использования встроенных прокси',
            uk: 'Залишіть порожнім для використання вбудованих проксі',
            en: 'Leave empty to use built-in proxies',
        },
        vibix_cors_proxy_placeholder: {
            ru: 'Например: https://cors.example.com/',
            uk: 'Наприклад: https://cors.example.com/',
            en: 'For example: https://cors.example.com/',
        },
        vibix_status_active: {
            ru: 'Готов к работе',
            uk: 'Готовий до роботи',
            en: 'Ready',
        }
    })

    // ============== TEMPLATES ==============
    function resetTemplates(){
        Lampa.Template.add('online',`<div class="online selector">
            <div class="online__body">
                <div style="position: absolute;left: 0;top: -0.3em;width: 2.4em;height: 2.4em">
                    <svg style="height: 2.4em; width:  2.4em;" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="64" cy="64" r="56" stroke="white" stroke-width="16"/>
                        <path d="M90.5 64.3827L50 87.7654L50 41L90.5 64.3827Z" fill="white"/>
                    </svg>
                </div>
                <div class="online__title" style="padding-left: 2.1em;">{title}</div>
                <div class="online__quality" style="padding-left: 3.4em;">{quality}{info}</div>
            </div>
        </div>`)

        Lampa.Template.add('online_folder',`<div class="online selector">
            <div class="online__body">
                <div style="position: absolute;left: 0;top: -0.3em;width: 2.4em;height: 2.4em">
                    <svg style="height: 2.4em; width:  2.4em;" viewBox="0 0 128 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect y="20" width="128" height="92" rx="13" fill="white"/>
                        <path d="M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z" fill="white" fill-opacity="0.23"/>
                        <rect x="11" y="8" width="106" height="76" rx="13" fill="white" fill-opacity="0.51"/>
                    </svg>
                </div>
                <div class="online__title" style="padding-left: 2.1em;">{title}</div>
                <div class="online__quality" style="padding-left: 3.4em;">{quality}{info}</div>
            </div>
        </div>`)
    }

    // ============== VIBIX BALANCER ==============
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
        
        // XOR key for decryption
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

        function getApiKey() {
            return Lampa.Storage.get('vibix_token', '') || defaultApiKey
        }
        
        function getCorsProxy() {
            let customProxy = Lampa.Storage.get('vibix_cors_proxy', '')
            if (customProxy) {
                if (!customProxy.endsWith('/')) customProxy += '/'
                return customProxy
            }
            const proxy = corsProxies[proxyIndex]
            proxyIndex = (proxyIndex + 1) % corsProxies.length
            return proxy
        }
        
        function proxyUrl(url, headers) {
            const proxy = getCorsProxy()
            let proxyEnc = ''
            
            if (headers) {
                for (let key in headers) {
                    proxyEnc += 'param/' + encodeURIComponent(key) + '=' + encodeURIComponent(headers[key]) + '/'
                }
            }
            
            if (proxyEnc) {
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

        function xorDecrypt(str, key) {
            const keyLen = key.length
            const len = str.length
            let result = ''
            
            for (let i = 0; i < len; i++) {
                result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % keyLen))
            }
            
            return result
        }

        function decryptResponse(json) {
            try {
                if (!json || typeof json.p !== 'string') return json
                
                let str = json.p
                
                if (json.v === 1) {
                    str = str.split('').reverse().join('')
                    str = atob(str)
                    str = xorDecrypt(str, XOR_KEY)
                    
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

        this.search = function (_object, id, sim) {
            object = _object
            select_title = object.movie.title

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

        function searchVideo(type, id) {
            network.clear()
            network.timeout(15000)

            const apiKey = getApiKey()
            const url = 'https://vibix.org/api/v1/publisher/videos/' + type + '/' + encodeURIComponent(id)

            console.log('Vibix: Searching:', url)

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
                    if (type === 'kp' && object.movie.imdb_id) {
                        console.log('Vibix: Not found by KP, trying IMDB:', object.movie.imdb_id)
                        searchVideo('imdb', object.movie.imdb_id)
                    } else {
                        component.emptyForQuery(select_title)
                    }
                }
            }, function (a, c) {
                console.log('Vibix: Search error:', a, c)
                
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

        function getEmbedPlaylist(iframeUrl) {
            const info = parseIFrame(iframeUrl)
            
            if (!info) {
                console.log('Vibix: Failed to parse iframe URL')
                successFallback()
                return
            }

            const { host, type, id } = info
            
            const timestamp = Math.floor(Date.now() / 1000)
            const nonce = Math.random().toString(36).substring(2, 15)
            
            const embedPath = type === 'movie' ? '/api/v1/embed/' : '/api/v1/embed-serials/'
            let embedUrl = host + embedPath + id
            
            embedUrl += '?domain=iframe.cloud'
            embedUrl += '&iframe_url=' + encodeURIComponent(iframeUrl)
            embedUrl += '&ts=' + timestamp
            embedUrl += '&nonce=' + encodeURIComponent(nonce)
            embedUrl += '&nc=' + Math.floor(Date.now() / 60000)

            console.log('Vibix: Getting embed:', embedUrl)

            network.clear()
            network.timeout(15000)

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

    // ============== COMPONENT ==============
    function component(object){
        let network  = new Lampa.Reguest()
        let scroll   = new Lampa.Scroll({mask:true,over: true})
        let files    = new Lampa.Files(object)
        let filter   = new Lampa.Filter(object)
        let balanser = Lampa.Storage.get('online_balanser', 'vibix')
        let last_bls = Lampa.Storage.cache('online_last_balanser', 200, {})

        if(last_bls[object.movie.id]){
            balanser = last_bls[object.movie.id]
        }

        this.proxy = function(name){
            let prox = Lampa.Storage.get('online_proxy_all')
            let need = Lampa.Storage.get('online_proxy_'+name)

            if(need) prox = need

            if(prox && prox.slice(-1) !== '/'){
                prox += '/'
            }

            return prox
        }

        const sources = {
            vibix: new vibix(this, object)
        }

        let last
        let last_filter
        let extended
        let selected_id

        let filter_translate = {
            season: Lampa.Lang.translate('torrent_serial_season'),
            voice: Lampa.Lang.translate('torrent_parser_voice'),
            source: Lampa.Lang.translate('settings_rest_source')
        }

        let filter_sources = ['vibix']

        scroll.body().addClass('torrent-list')

        function minus(){
            scroll.minus(window.innerWidth > 580 ? false : files.render().find('.files__left'))
        }

        window.addEventListener('resize',minus,false)

        minus()

        this.create = function(){
            this.activity.loader(true)

            filter.onSearch = (value)=>{
                Lampa.Activity.replace({
                    search: value,
                    clarification: true
                })
            }

            filter.onBack = ()=>{
                this.start()
            }

            filter.render().find('.selector').on('hover:focus',(e)=>{
                last_filter = e.target
            })

            filter.onSelect = (type, a, b)=>{
                if(type == 'filter'){
                    if(a.reset){
                        if(extended) sources[balanser].reset()
                        else this.start()
                    }
                    else{
                        sources[balanser].filter(type, a, b)
                    }
                }
                else if(type == 'sort'){
                    balanser = a.source

                    Lampa.Storage.set('online_balanser', balanser)

                    last_bls[object.movie.id] = balanser

                    Lampa.Storage.set('online_last_balanser', last_bls)

                    this.search()

                    setTimeout(Lampa.Select.close,10)
                }
            }

            filter.render().find('.filter--sort span').text(Lampa.Lang.translate('online_balanser'))

            filter.render()

            files.append(scroll.render())

            scroll.append(filter.render())

            this.search()

            return this.render()
        }

        this.search = function(){
            this.activity.loader(true)

            this.filter({
                source: filter_sources
            },{source: 0})

            this.reset()

            this.find()
        }

        this.find = function(){
            if(balanser === 'vibix'){
                this.extendChoice()
                let vibix_id = object.movie.kinopoisk_id || object.movie.imdb_id
                console.log('Vibix search ID:', vibix_id)
                sources.vibix.search(object, vibix_id)
                return
            }
        }

        this.extendChoice = function(){
            let data = Lampa.Storage.cache('online_choice_'+balanser, 500, {})
            let save = data[selected_id || object.movie.id] || {}

            extended = true

            sources[balanser].extendChoice(save)
        }

        this.saveChoice = function(choice){
            let data = Lampa.Storage.cache('online_choice_'+balanser, 500, {})

                data[selected_id || object.movie.id] = choice

            Lampa.Storage.set('online_choice_'+balanser, data)
        }

        this.similars = function(json){
            json.forEach(elem=>{
                let year = elem.start_date || elem.year || ''

                elem.title   = elem.title || elem.ru_title || elem.en_title || elem.nameRu || elem.nameEn
                elem.quality = year ? (year + '').slice(0,4) : '----'
                elem.info    = ''

                let item = Lampa.Template.get('online_folder',elem)

                item.on('hover:enter',()=>{
                    this.activity.loader(true)

                    this.reset()

                    object.search_date = year

                    selected_id = elem.id

                    this.extendChoice()

                    sources[balanser].search(object, elem.kp_id || elem.filmId, [elem])
                })

                this.append(item)
            })
        }

        this.reset = function(){
            last = false

            scroll.render().find('.empty').remove()

            filter.render().detach()

            scroll.clear()

            scroll.append(filter.render())
        }

        this.loading = function(status){
            if(status) this.activity.loader(true)
            else{
                this.activity.loader(false)

                this.activity.toggle()
            }
        }

        this.filter = function(filter_items, choice){
            let select = []

            let add = (type, title)=>{
                let need     = Lampa.Storage.get('online_filter','{}')
                let items    = filter_items[type]
                let subitems = []
                let value    = need[type]

                items.forEach((name, i) => {
                    subitems.push({
                        title: name,
                        selected: value == i,
                        index: i
                    })
                })

                select.push({
                    title: title,
                    subtitle: items[value],
                    items: subitems,
                    stype: type
                })
            }

            filter_items.source = filter_sources

            choice.source = filter_sources.indexOf(balanser)

            select.push({
                title: Lampa.Lang.translate('torrent_parser_reset'),
                reset: true
            })

            Lampa.Storage.set('online_filter', choice)

            if(filter_items.voice && filter_items.voice.length) add('voice',Lampa.Lang.translate('torrent_parser_voice'))

            if(filter_items.season && filter_items.season.length) add('season',Lampa.Lang.translate('torrent_serial_season'))

            filter.set('filter', select) 
            filter.set('sort', filter_sources.map(e=>{return {title:e,source:e,selected:e==balanser}})) 

            this.selected(filter_items)
        }

        this.closeFilter = function(){
            if($('body').hasClass('selectbox--open')) Lampa.Select.close()
        }

        this.selected = function(filter_items){
            let need   = Lampa.Storage.get('online_filter','{}'),
                select = []

            for(let i in need){
                if(filter_items[i] && filter_items[i].length){
                    if(i == 'voice'){
                        select.push(filter_translate[i] + ': ' + filter_items[i][need[i]])
                    }
                    else if(i !== 'source'){
                        if(filter_items.season.length >= 1){
                            select.push(filter_translate.season + ': ' + filter_items[i][need[i]])
                        }
                    }
                }
            }

            filter.chosen('filter', select)
            filter.chosen('sort', [balanser])
        }

        this.append = function(item){
            item.on('hover:focus',(e)=>{
                last = e.target

                scroll.update($(e.target),true)
            })

            scroll.append(item)
        }

        this.contextmenu = function(params){
            params.item.on('hover:long',()=>{
                function show(extra){
                    let enabled = Lampa.Controller.enabled().name

                    let menu = [
                        {
                            title: Lampa.Lang.translate('torrent_parser_label_title'),
                            mark: true
                        },
                        {
                            title: Lampa.Lang.translate('torrent_parser_label_cancel_title'),
                            clearmark: true
                        },
                        {
                            title: Lampa.Lang.translate('time_reset'),
                            timeclear: true
                        }
                    ]

                    if(Lampa.Platform.is('webos')){
                        menu.push({
                            title: Lampa.Lang.translate('player_lauch') + ' - Webos',
                            player: 'webos'
                        })
                    }
                    
                    if(Lampa.Platform.is('android')){
                        menu.push({
                            title: Lampa.Lang.translate('player_lauch') + ' - Android',
                            player: 'android'
                        })
                    }
                    
                    menu.push({
                        title: Lampa.Lang.translate('player_lauch') + ' - Lampa',
                        player: 'lampa'
                    })

                    if(extra){
                        menu.push({
                            title: Lampa.Lang.translate('copy_link'),
                            copylink: true
                        })
                    }

                    Lampa.Select.show({
                        title: Lampa.Lang.translate('title_action'),
                        items: menu,
                        onBack: ()=>{
                            Lampa.Controller.toggle(enabled)
                        },
                        onSelect: (a)=>{
                            if(a.clearmark){
                                Lampa.Arrays.remove(params.viewed, params.hash_file)

                                Lampa.Storage.set('online_view', params.viewed)

                                params.item.find('.torrent-item__viewed').remove()
                            }

                            if(a.mark){
                                if(params.viewed.indexOf(params.hash_file) == -1){
                                    params.viewed.push(params.hash_file)
            
                                    params.item.append('<div class="torrent-item__viewed">'+Lampa.Template.get('icon_star',{},true)+'</div>')
            
                                    Lampa.Storage.set('online_view', params.viewed)
                                }
                            }

                            if(a.timeclear){
                                params.view.percent  = 0
                                params.view.time     = 0
                                params.view.duration = 0
                                
                                Lampa.Timeline.update(params.view)
                            }

                            Lampa.Controller.toggle(enabled)

                            if(a.player){
                                Lampa.Player.runas(a.player)

                                params.item.trigger('hover:enter')
                            }

                            if(a.copylink){
                                if(extra.quality){
                                    let qual = []

                                    for(let i in extra.quality){
                                        qual.push({
                                            title: i,
                                            file: extra.quality[i]
                                        })
                                    }

                                    Lampa.Select.show({
                                        title: 'Ссылки',
                                        items: qual,
                                        onBack: ()=>{
                                            Lampa.Controller.toggle(enabled)
                                        },
                                        onSelect: (b)=>{
                                            Lampa.Utils.copyTextToClipboard(b.file,()=>{
                                                Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'))
                                            },()=>{
                                                Lampa.Noty.show(Lampa.Lang.translate('copy_error'))
                                            })
                                        }
                                    })
                                }
                                else{
                                    Lampa.Utils.copyTextToClipboard(extra.file,()=>{
                                        Lampa.Noty.show(Lampa.Lang.translate('copy_secuses'))
                                    },()=>{
                                        Lampa.Noty.show(Lampa.Lang.translate('copy_error'))
                                    })
                                }
                            }
                        }
                    })
                }

                params.file(show)
            }).on('hover:focus',()=>{
                if(Lampa.Helper) Lampa.Helper.show('online_file',Lampa.Lang.translate('helper_online_file'),params.item)
            })
        }

        this.empty = function(msg){
            let empty = Lampa.Template.get('list_empty')

            if(msg) empty.find('.empty__descr').text(msg)

            scroll.append(empty)

            this.loading(false)
        }

        this.emptyForQuery = function(query){
            this.empty(Lampa.Lang.translate('online_query_start') + ' (' + query + ') ' + Lampa.Lang.translate('online_query_end'))
        }

        this.start = function(first_select){
            if(Lampa.Activity.active().activity !== this.activity) return

            if(first_select){
                let last_views = scroll.render().find('.selector.online').find('.torrent-item__viewed').parent().last()

                if (object.movie.number_of_seasons && last_views.length) last = last_views.eq(0)[0]
                else last = scroll.render().find('.selector').eq(3)[0]
            }

            Lampa.Background.immediately(Lampa.Utils.cardImgBackground(object.movie))

            Lampa.Controller.add('content',{
                toggle: ()=>{
                    Lampa.Controller.collectionSet(scroll.render(),files.render())
                    Lampa.Controller.collectionFocus(last || false,scroll.render())
                },
                up: ()=>{
                    if(Navigator.canmove('up')){
                        if(scroll.render().find('.selector').slice(3).index(last) == 0 && last_filter){
                            Lampa.Controller.collectionFocus(last_filter,scroll.render())
                        }
                        else Navigator.move('up')
                    }
                    else Lampa.Controller.toggle('head')
                },
                down: ()=>{
                    Navigator.move('down')
                },
                right: ()=>{
                    if(Navigator.canmove('right')) Navigator.move('right')
                    else filter.show(Lampa.Lang.translate('title_filter'),'filter')
                },
                left: ()=>{
                    if(Navigator.canmove('left')) Navigator.move('left')
                    else Lampa.Controller.toggle('menu')
                },
                back: this.back
            })

            Lampa.Controller.toggle('content')
        }

        this.render = function(){
            return files.render()
        }

        this.back = function(){
            Lampa.Activity.backward()
        }

        this.pause = function(){}

        this.stop = function(){}

        this.destroy = function(){
            network.clear()

            files.destroy()

            scroll.destroy()

            network = null

            sources.vibix.destroy()

            window.removeEventListener('resize',minus)
        }
    }

    // ============== BUTTON & INIT ==============
    const button = `<div class="full-start__button selector view--online" data-subtitle="v1.0">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 30.051 30.051" style="enable-background:new 0 0 512 512" xml:space="preserve" class="">
        <g xmlns="http://www.w3.org/2000/svg">
            <path d="M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069   c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532   c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z" fill="currentColor"/>
            <path d="M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021   C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518   c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z" fill="currentColor"/>
        </g></svg>

        <span>#{title_online}</span>
        </div>`

    Lampa.Component.add('online', component)
    resetTemplates()

    Lampa.Listener.follow('full',(e)=>{
        if(e.type == 'complite'){
            let btn = $(Lampa.Lang.translate(button))

            btn.on('hover:enter',()=>{
                resetTemplates()
                Lampa.Component.add('online', component)
                Lampa.Activity.push({
                    url: '',
                    title: Lampa.Lang.translate('title_online'),
                    component: 'online',
                    search: e.data.movie.title,
                    search_one: e.data.movie.title,
                    search_two: e.data.movie.original_title,
                    movie: e.data.movie,
                    page: 1
                })
            })

            e.object.activity.render().find('.view--torrent').after(btn)
        }
    })

    // ============== SETTINGS ==============
    Lampa.Params.select('vibix_token', '', '')
    Lampa.Params.select('vibix_cors_proxy', '', '')

    Lampa.Template.add('settings_vibix', `<div>
        <div class="settings-param selector" data-name="vibix_cors_proxy" data-type="input" placeholder="#{vibix_cors_proxy_placeholder}">
            <div class="settings-param__name">#{vibix_cors_proxy_title}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{vibix_cors_proxy_descr}</div>
        </div>
        <div class="settings-param selector" data-name="vibix_token" data-type="input" placeholder="#{vibix_token_placeholder}">
            <div class="settings-param__name">#{vibix_token_title}</div>
            <div class="settings-param__value"></div>
            <div class="settings-param__descr">#{vibix_token_descr}</div>
        </div>
        <div class="settings-param" data-name="vibix_status" data-static="true">
            <div class="settings-param__name">#{title_status}</div>
            <div class="settings-param__value">#{vibix_status_active}</div>
        </div>
    </div>`)

    function addSettingsVibix() {
        if (Lampa.Settings.main && !Lampa.Settings.main().render().find('[data-component="vibix"]').length) {
            let field = $(`<div class="settings-folder selector" data-component="vibix">
                <div class="settings-folder__icon">
                    <svg height="46" viewBox="0 0 42 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="10" width="32" height="26" rx="3" stroke="white" stroke-width="3"/>
                        <path d="M16 23L21 20V26L16 23Z" fill="white"/>
                        <circle cx="28" cy="23" r="3" stroke="white" stroke-width="2"/>
                        <rect x="12" y="5" width="18" height="5" rx="2" fill="white" fill-opacity="0.5"/>
                    </svg>
                </div>
                <div class="settings-folder__name">Vibix</div>
            </div>`)

            Lampa.Settings.main().render().find('[data-component="more"]').after(field)
            Lampa.Settings.main().update()
        }
    }

    if (window.appready) addSettingsVibix()
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') addSettingsVibix()
        })
    }

})();
