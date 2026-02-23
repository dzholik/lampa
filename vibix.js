// TVBox Plugin for Lampa
// Date: 2024
// Balancers: Vibix, Collaps, Filmix

(function () {
    'use strict';

    // ============ УТИЛИТЫ ============

    function startsWith(str, searchString) {
        return str.lastIndexOf(searchString, 0) === 0;
    }

    function endsWith(str, searchString) {
        var start = str.length - searchString.length;
        if (start < 0) return false;
        return str.indexOf(searchString, start) === start;
    }

    // API ключ для Vibix
    var VIBIX_API_KEY = '23398|JZGdpfzKnC3rwliBjLif76NFRLsQhl1IZLUeTG0s462218ea';

    // ============ НАСТРОЙКИ ХОСТОВ ============

    var hosts = {
        vibix: {
            api: 'https://vibix.org/api/v1/publisher/videos/',
            embed: 'https://vibix.org/api/v1/publisher/videos/',
            token: VIBIX_API_KEY
        },
        collaps: {
            base: 'api.namy.ws',
            embed: 'https://api.namy.ws/embed/',
            embed2: 'https://api.kinogram.best/embed/'
        },
        filmix: {
            site: 'https://filmix.my',
            api: 'http://filmixapp.cyou/api/v2/'
        }
    };

    // ============ ПРОКСИ И ЗАГОЛОВКИ ============

    function getProxy(name) {
        // Используем стандартные прокси из Lampa или кастомные
        var proxy_other = Lampa.Storage.field('tvbox_proxy_other') === true;
        var proxy_other_url = proxy_other ? Lampa.Storage.field('tvbox_proxy_other_url') + '' : '';
        
        var proxy1 = 'https://cors.nb557.workers.dev/';
        var proxy2 = 'https://cors.fx666.workers.dev/';
        
        if (name === 'vibix') return proxy_other_url || proxy1;
        if (name === 'collaps') return proxy_other_url || proxy1;
        if (name === 'filmix') return proxy_other_url || proxy2;
        
        return '';
    }

    function baseUserAgent() {
        return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
    }

    function filmixUserAgent() {
        return 'okhttp/3.10.0';
    }

    // ============ ОСНОВНОЙ КОМПОНЕНТ TVBOX ============

    function TVBox(component, _object) {
        var network = new Lampa.Reguest();
        var object = _object;
        var select_title = '';
        var current_balancer = 'vibix'; // По умолчанию
        
        var extract = {};
        var filter_items = {};
        var choice = {
            season: 0,
            voice: 0,
            voice_name: '',
            balancer: 0
        };

        // Доступные балансеры
        var balancers = [
            { id: 'vibix', name: 'Vibix' },
            { id: 'collaps', name: 'Collaps' },
            { id: 'filmix', name: 'Filmix' }
        ];

        // ============ ПОИСК ============

        this.search = function (_object, kinopoisk_id) {
            object = _object;
            select_title = object.search || object.movie.title;
            
            // Проверяем выбранный балансер
            current_balancer = balancers[choice.balancer] ? balancers[choice.balancer].id : 'vibix';
            
            component.loading(true);
            
            switch(current_balancer) {
                case 'vibix':
                    searchVibix(kinopoisk_id);
                    break;
                case 'collaps':
                    searchCollaps(kinopoisk_id);
                    break;
                case 'filmix':
                    searchFilmix(kinopoisk_id);
                    break;
                default:
                    searchVibix(kinopoisk_id);
            }
        };

        // ============ VIBIX ============

        function searchVibix(kinopoisk_id) {
            var error = component.empty.bind(component);
            var api = (+kinopoisk_id ? 'kp/' : 'imdb/') + encodeURIComponent(kinopoisk_id);
            
            var url = hosts.vibix.api + api;
            var prox = getProxy('vibix');
            var headers = {
                'User-Agent': baseUserAgent(),
                'Authorization': 'Bearer ' + hosts.vibix.token
            };

            network.clear();
            network.timeout(15000);
            network.native(prox + url, function(json) {
                if (json && json.iframe_url) {
                    getVibixStreams(json);
                } else if (!object.clarification && object.movie.imdb_id && kinopoisk_id != object.movie.imdb_id) {
                    // Пробуем по IMDB
                    var api_imdb = 'imdb/' + encodeURIComponent(object.movie.imdb_id);
                    network.clear();
                    network.timeout(15000);
                    network.native(prox + hosts.vibix.api + api_imdb, function(json2) {
                        if (json2 && json2.iframe_url) {
                            getVibixStreams(json2);
                        } else {
                            component.emptyForQuery(select_title);
                        }
                    }, error, false, { headers: headers });
                } else {
                    component.emptyForQuery(select_title);
                }
            }, error, false, { headers: headers });
        }

        function getVibixStreams(data) {
            // Парсим iframe и получаем потоки
            var iframe_url = data.iframe_url;
            
            network.clear();
            network.timeout(20000);
            network.native(iframe_url, function(str) {
                parseVibixPlaylist(str, iframe_url);
            }, function(a, c) {
                component.empty(network.errorDecode(a, c));
            }, false, {
                dataType: 'text',
                headers: {
                    'User-Agent': baseUserAgent(),
                    'Referer': 'https://vibix.org/'
                }
            });
        }

        function parseVibixPlaylist(str, url) {
            str = (str || '').replace(/\n/g, '');
            
            // Ищем плейлист в ответе
            var playlist_match = str.match(/var\s+playlist\s*=\s*(\[.*?\]);/);
            var file_match = str.match(/file:\s*["']([^"']+)["']/);
            var hls_match = str.match(/hls:\s*["']([^"']+)["']/);
            
            var playlist = [];
            
            if (playlist_match) {
                try {
                    playlist = eval(playlist_match[1]);
                } catch(e) {}
            }
            
            if (!playlist.length && (file_match || hls_match)) {
                var file = file_match ? file_match[1] : hls_match[1];
                playlist = [{
                    title: select_title,
                    file: file
                }];
            }
            
            if (playlist.length) {
                extract = {
                    type: 'simple',
                    playlist: playlist,
                    balancer: 'vibix'
                };
                component.loading(false);
                filter();
                append(filtred());
            } else {
                component.emptyForQuery(select_title);
            }
        }

        // ============ COLLAPS ============

        function searchCollaps(kinopoisk_id) {
            var error = component.empty.bind(component);
            var api = (+kinopoisk_id ? 'kp/' : 'imdb/') + kinopoisk_id;
            
            var embed = hosts.collaps.embed + api;
            var prox = getProxy('collaps');
            var user_agent = baseUserAgent();
            
            var headers = Lampa.Platform.is('android') ? {
                'User-Agent': user_agent
            } : {};

            network.clear();
            network.timeout(10000);
            network.native(prox + embed, function(str) {
                if (str && str.indexOf('makePlayer') !== -1) {
                    parseCollaps(str);
                } else {
                    // Пробуем резервный embed
                    network.clear();
                    network.timeout(10000);
                    network.native(prox + hosts.collaps.embed2 + api, function(str2) {
                        if (str2 && str2.indexOf('makePlayer') !== -1) {
                            parseCollaps(str2);
                        } else {
                            component.emptyForQuery(select_title);
                        }
                    }, error, false, { dataType: 'text', headers: headers });
                }
            }, error, false, { dataType: 'text', headers: headers });
        }

        function parseCollaps(str) {
            component.loading(false);
            str = (str || '').replace(/\n/g, '');
            
            var find = str.match(/makePlayer\(({.*?})\);/);
            var json;
            
            try {
                json = find && eval('"use strict"; (' + find[1] + ');');
            } catch(e) {}
            
            if (json) {
                extract = {
                    type: json.playlist ? 'serial' : 'movie',
                    data: json,
                    balancer: 'collaps'
                };
                
                if (extract.type === 'serial' && json.playlist.seasons) {
                    json.playlist.seasons.sort(function(a, b) {
                        return a.season - b.season;
                    });
                }
                
                filter();
                append(filtred());
            } else {
                component.emptyForQuery(select_title);
            }
        }

        // ============ FILMIX ============

        function searchFilmix(kinopoisk_id) {
            var error = component.empty.bind(component);
            var clean_title = select_title.replace(/\b(\d{4})\b/g, '+$1');
            
            // Генерируем токен
            var dev_id = randomHex(16);
            var token = 'aaaabbbbccccddddeeeeffffaaaabbbb';
            var auth_token = filmixToken(dev_id, token);
            
            var search_url = hosts.filmix.api + 'search' + auth_token;
            search_url = Lampa.Utils.addUrlComponent(search_url, 'story=' + encodeURIComponent(clean_title));
            
            var prox = getProxy('filmix');
            var headers = {
                'User-Agent': filmixUserAgent()
            };

            network.clear();
            network.timeout(15000);
            network.native(prox + search_url, function(json) {
                if (json && json.length) {
                    findBestFilmixMatch(json, kinopoisk_id);
                } else {
                    // Пробуем поиск через сайт
                    siteSearchFilmix(clean_title, kinopoisk_id);
                }
            }, function(a, c) {
                siteSearchFilmix(clean_title, kinopoisk_id);
            }, false, { headers: headers });
        }

        function siteSearchFilmix(clean_title, kinopoisk_id) {
            var url = hosts.filmix.site + 'api/v2/suggestions?search_word=' + encodeURIComponent(clean_title);
            var prox = getProxy('filmix');
            
            var headers = {
                'User-Agent': baseUserAgent(),
                'X-Requested-With': 'XMLHttpRequest'
            };

            network.clear();
            network.timeout(15000);
            network.native(prox + url, function(json) {
                var posts = json && json.posts || [];
                if (posts.length) {
                    findBestFilmixMatch(posts, kinopoisk_id);
                } else {
                    component.emptyForQuery(select_title);
                }
            }, function(a, c) {
                component.empty(network.errorDecode(a, c));
            }, false, { headers: headers });
        }

        function findBestFilmixMatch(items, kinopoisk_id) {
            var search_year = object.search_date || object.movie.release_date || object.movie.first_air_date;
            var year = search_year ? parseInt(search_year.slice(0, 4)) : 0;
            
            var orig_titles = [];
            if (object.movie.alternative_titles && object.movie.alternative_titles.results) {
                orig_titles = object.movie.alternative_titles.results.map(function(t) {
                    return t.title;
                });
            }
            if (object.movie.original_title) orig_titles.push(object.movie.original_title);
            if (object.movie.original_name) orig_titles.push(object.movie.original_name);
            
            // Фильтруем по году
            var candidates = items;
            if (year) {
                var by_year = items.filter(function(c) {
                    var c_year = c.year || (c.alt_name && parseInt(c.alt_name.split('-').pop())) || 0;
                    return c_year === year || (c_year > year - 2 && c_year < year + 2);
                });
                if (by_year.length) candidates = by_year;
            }
            
            // Берём первый результат или точное совпадение
            var best = candidates[0];
            
            if (best && best.id) {
                getFilmixDetails(best.id);
            } else {
                component.emptyForQuery(select_title);
            }
        }

        function getFilmixDetails(filmix_id) {
            var dev_id = randomHex(16);
            var token = 'aaaabbbbccccddddeeeeffffaaaabbbb';
            var auth_token = filmixToken(dev_id, token);
            
            var url = hosts.filmix.api + 'post/' + filmix_id + auth_token;
            var prox = getProxy('filmix');
            
            var headers = {
                'User-Agent': filmixUserAgent()
            };

            network.clear();
            network.timeout(15000);
            network.native(prox + url, function(json) {
                if (json && json.player_links) {
                    parseFilmixData(json);
                } else {
                    component.emptyForQuery(select_title);
                }
            }, function(a, c) {
                component.empty(network.errorDecode(a, c));
            }, false, { headers: headers });
        }

        function parseFilmixData(data) {
            component.loading(false);
            
            var pl_links = data.player_links || {};
            var seasons = [];
            var movies = [];
            
            // Сериалы
            if (pl_links.playlist && Object.keys(pl_links.playlist).length > 0) {
                for (var season_id in pl_links.playlist) {
                    var season = pl_links.playlist[season_id];
                    var voices = [];
                    
                    for (var voice_id in season) {
                        var episodes = season[voice_id];
                        var items = [];
                        var epis_num = 0;
                        
                        for (var episode_id in episodes) {
                            var file = episodes[episode_id];
                            epis_num++;
                            
                            if (file.link) {
                                var qualities = file.qualities || [];
                                qualities = qualities.filter(function(q) {
                                    return !isNaN(q) && q <= 1080;
                                }).sort(function(a, b) { return b - a; });
                                
                                var max_q = qualities[0] || 480;
                                
                                items.push({
                                    season: parseInt(season_id) || 1,
                                    episode: parseInt(episode_id) || epis_num,
                                    file: file.link,
                                    quality: max_q,
                                    qualities: qualities,
                                    translation: voice_id
                                });
                            }
                        }
                        
                        if (items.length) {
                            voices.push({
                                id: voice_id,
                                items: items
                            });
                        }
                    }
                    
                    if (voices.length) {
                        seasons.push({
                            id: season_id,
                            title: 'Сезон ' + season_id,
                            voices: voices
                        });
                    }
                }
            }
            
            // Фильмы
            if (pl_links.movie && Object.keys(pl_links.movie).length > 0) {
                for (var ID in pl_links.movie) {
                    var file = pl_links.movie[ID];
                    
                    if (file.link) {
                        var q_match = file.link.match(/\[([\d,]*)\]\.mp4/i);
                        var qualities = [];
                        
                        if (q_match) {
                            qualities = q_match[1].split(',').map(function(q) {
                                return parseInt(q);
                            }).filter(function(q) {
                                return !isNaN(q) && q <= 1080;
                            }).sort(function(a, b) { return b - a; });
                        }
                        
                        var max_q = qualities[0] || 480;
                        
                        movies.push({
                            translation: file.translation || 'Оригинал',
                            file: file.link.replace(/\[[\d,]*\](\.mp4)/i, '%s$1'),
                            quality: max_q,
                            qualities: qualities
                        });
                    }
                }
            }
            
            extract = {
                type: seasons.length ? 'serial' : 'movie',
                seasons: seasons,
                movies: movies,
                title: data.title || select_title,
                balancer: 'filmix'
            };
            
            filter();
            append(filtred());
        }

        // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

        function filmixToken(dev_id, token) {
            return '?user_dev_id=' + dev_id + 
                   '&user_dev_name=Xiaomi' +
                   '&user_dev_token=' + token +
                   '&user_dev_vendor=Xiaomi' +
                   '&user_dev_os=14' +
                   '&user_dev_apk=2.2.0' +
                   '&app_lang=ru-rRU';
        }

        function randomHex(len) {
            var chars = '0123456789abcdef';
            var result = '';
            for (var i = 0; i < len; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
            return result;
        }

        // ============ ФИЛЬТРЫ И ОТОБРАЖЕНИЕ ============

        this.extendChoice = function(saved) {
            Lampa.Arrays.extend(choice, saved, true);
        };

        this.reset = function() {
            component.reset();
            choice = {
                season: 0,
                voice: 0,
                voice_name: '',
                balancer: choice.balancer
            };
            filter();
            append(filtred());
            component.saveChoice(choice);
        };

        this.filter = function(type, a, b) {
            choice[a.stype] = b.index;
            if (a.stype === 'voice') choice.voice_name = filter_items.voice[b.index];
            if (a.stype === 'balancer') {
                // Меняем балансер и перезагружаем
                current_balancer = balancers[b.index] ? balancers[b.index].id : 'vibix';
                this.search(object, object.movie.kinopoisk_id || object.movie.imdb_id);
                return;
            }
            
            component.reset();
            filter();
            append(filtred());
            component.saveChoice(choice);
        };

        this.destroy = function() {
            network.clear();
            extract = null;
        };

        function filter() {
            filter_items = {
                balancer: balancers.map(function(b) { return b.name; }),
                season: [],
                voice: []
            };
            
            // Текущий балансер
            if (!balancers[choice.balancer]) choice.balancer = 0;
            
            if (!extract.balancer || extract.balancer !== current_balancer) {
                // Данные от другого балансера, нужно перезагрузить
                return;
            }
            
            // Сезоны и озвучки в зависимости от балансера
            if (extract.type === 'serial') {
                if (extract.balancer === 'collaps' && extract.data.playlist && extract.data.playlist.seasons) {
                    extract.data.playlist.seasons.forEach(function(s) {
                        filter_items.season.push('Сезон ' + s.season);
                    });
                } else if (extract.balancer === 'filmix' && extract.seasons) {
                    extract.seasons.forEach(function(s) {
                        filter_items.season.push(s.title);
                    });
                } else if (extract.balancer === 'vibix' && extract.playlist) {
                    // Для Vibix обычно структура другая
                    filter_items.season.push('Сезон 1');
                }
            }
            
            if (!filter_items.season[choice.season]) choice.season = 0;
            
            // Озвучки
            if (extract.balancer === 'collaps') {
                var season = extract.data.playlist && extract.data.playlist.seasons[choice.season];
                if (season && season.episodes) {
                    var episode = season.episodes[0];
                    if (episode && episode.audio && episode.audio.names) {
                        filter_items.voice = episode.audio.names;
                    }
                }
            } else if (extract.balancer === 'filmix' && extract.seasons) {
                var s = extract.seasons[choice.season];
                if (s && s.voices) {
                    filter_items.voice = s.voices.map(function(v) { return v.id; });
                }
            }
            
            if (!filter_items.voice[choice.voice]) choice.voice = 0;
            
            if (choice.voice_name) {
                var inx = filter_items.voice.indexOf(choice.voice_name);
                if (inx === -1) choice.voice = 0;
                else if (inx !== choice.voice) choice.voice = inx;
            }
            
            component.filter(filter_items, choice);
        }

        function filtred() {
            var filtred = [];
            
            if (!extract.balancer) return filtred;
            
            // Vibix
            if (extract.balancer === 'vibix' && extract.playlist) {
                extract.playlist.forEach(function(item, index) {
                    var qualities = {};
                    var file = item.file || '';
                    
                    // Парсим качества из URL если есть
                    var q_match = file.match(/\[([\d,]+)\]/);
                    if (q_match) {
                        var qs = q_match[1].split(',');
                        qs.forEach(function(q) {
                            var label = q + 'p';
                            qualities[label] = file.replace(/\[([\d,]+)\]/, '[' + q + ']');
                        });
                    }
                    
                    filtred.push({
                        title: item.title || select_title,
                        quality: qualities['1080p'] || qualities['720p'] || qualities['480p'] ? '1080p ~ 480p' : '360p ~ 1080p',
                        info: '',
                        media: {
                            file: file,
                            qualities: qualities
                        }
                    });
                });
            }
            
            // Collaps
            else if (extract.balancer === 'collaps') {
                if (extract.type === 'serial') {
                    var season = extract.data.playlist.seasons[choice.season];
                    if (season && season.episodes) {
                        season.episodes.forEach(function(ep) {
                            var audio_names = [];
                            if (ep.audio && ep.audio.names) {
                                audio_names = ep.audio.names;
                            }
                            
                            var file = ep.hls || '';
                            var quality = '360p ~ 720p';
                            if (extract.data.qualityByWidth) {
                                var max = 0;
                                for (var res in extract.data.qualityByWidth) {
                                    var q = extract.data.qualityByWidth[res] || 0;
                                    if (q > max) max = q;
                                }
                                if (max) quality = max + 'p';
                            }
                            
                            filtred.push({
                                title: ep.title || ('Серия ' + ep.episode),
                                quality: quality,
                                info: audio_names.length ? ' / ' + audio_names.slice(0, 3).join(', ') : '',
                                season: season.season,
                                episode: parseInt(ep.episode),
                                media: {
                                    file: file,
                                    hls: ep.hls,
                                    dash: ep.dash || ep.dasha
                                }
                            });
                        });
                    }
                } else {
                    // Фильм
                    var source = extract.data.source;
                    var file = source && (source.hls || source.dash || source.dasha);
                    
                    var audio_names = [];
                    if (source && source.audio && source.audio.names) {
                        audio_names = source.audio.names;
                    }
                    
                    filtred.push({
                        title: extract.data.title || select_title,
                        quality: '360p ~ 1080p',
                        info: audio_names.length ? ' / ' + audio_names.slice(0, 3).join(', ') : '',
                        media: {
                            file: file,
                            hls: source && source.hls,
                            dash: source && (source.dash || source.dasha)
                        }
                    });
                }
            }
            
            // Filmix
            else if (extract.balancer === 'filmix') {
                if (extract.type === 'serial' && extract.seasons) {
                    var season = extract.seasons[choice.season];
                    var voice = season && season.voices[choice.voice];
                    
                    if (voice && voice.items) {
                        voice.items.forEach(function(item) {
                            var qualities = {};
                            if (item.qualities) {
                                item.qualities.forEach(function(q) {
                                    qualities[q + 'p'] = item.file.replace(/%s(\.mp4)/i, q + '$1');
                                });
                            }
                            
                            filtred.push({
                                title: 'Сезон ' + item.season + ' / Серия ' + item.episode,
                                quality: item.quality + 'p',
                                info: ' / ' + voice.id,
                                season: item.season,
                                episode: item.episode,
                                media: {
                                    file: item.file,
                                    qualities: qualities,
                                    quality_list: item.qualities
                                }
                            });
                        });
                    }
                } else if (extract.movies) {
                    extract.movies.forEach(function(movie) {
                        var qualities = {};
                        if (movie.qualities) {
                            movie.qualities.forEach(function(q) {
                                qualities[q + 'p'] = movie.file.replace(/%s(\.mp4)/i, q + '$1');
                            });
                        }
                        
                        filtred.push({
                            title: movie.translation || select_title,
                            quality: movie.quality + 'p',
                            info: '',
                            media: {
                                file: movie.file,
                                qualities: qualities,
                                quality_list: movie.qualities
                            }
                        });
                    });
                }
            }
            
            return filtred;
        }

        function getFile(element) {
            var media = element.media || {};
            var file = media.file || '';
            var quality = media.qualities || {};
            
            // Для Filmix подставляем лучшее качество
            if (file.indexOf('%s') !== -1 && media.quality_list && media.quality_list.length) {
                file = file.replace(/%s(\.mp4)/i, media.quality_list[0] + '$1');
            }
            
            return {
                file: file,
                quality: quality
            };
        }

        function append(items) {
            component.reset();
            var viewed = Lampa.Storage.cache('online_view', 5000, []);
            var last_episode = component.getLastEpisode(items);
            
            items.forEach(function(element) {
                if (element.season) {
                    element.translate_episode_end = last_episode;
                    element.translate_voice = filter_items.voice[choice.voice];
                }
                
                var hash = Lampa.Utils.hash(
                    element.season 
                        ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title].join('')
                        : object.movie.original_title
                );
                
                var view = Lampa.Timeline.view(hash);
                var item = Lampa.Template.get('online_mod', element);
                
                var hash_file = Lampa.Utils.hash(
                    element.season
                        ? [element.season, element.season > 10 ? ':' : '', element.episode, object.movie.original_title, filter_items.voice[choice.voice]].join('')
                        : object.movie.original_title + element.title
                );
                
                element.timeline = view;
                item.append(Lampa.Timeline.render(view));
                
                if (Lampa.Timeline.details) {
                    item.find('.online__quality').append(Lampa.Timeline.details(view, ' / '));
                }
                
                if (viewed.indexOf(hash_file) !== -1) {
                    item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
                }
                
                item.on('hover:enter', function() {
                    if (object.movie.id) Lampa.Favorite.add('history', object.movie, 100);
                    
                    var extra = getFile(element);
                    
                    if (extra.file) {
                        var playlist = [];
                        var first = {
                            url: component.getDefaultQuality(extra.quality, extra.file),
                            quality: component.renameQualityMap(extra.quality),
                            timeline: element.timeline,
                            title: element.season ? element.title : select_title + (element.title === select_title ? '' : ' / ' + element.title)
                        };
                        
                        if (element.season) {
                            items.forEach(function(elem) {
                                var ex = getFile(elem);
                                playlist.push({
                                    url: component.getDefaultQuality(ex.quality, ex.file),
                                    quality: component.renameQualityMap(ex.quality),
                                    timeline: elem.timeline,
                                    title: elem.title
                                });
                            });
                        } else {
                            playlist.push(first);
                        }
                        
                        if (playlist.length > 1) first.playlist = playlist;
                        
                        Lampa.Player.play(first);
                        Lampa.Player.playlist(playlist);
                        
                        if (viewed.indexOf(hash_file) === -1) {
                            viewed.push(hash_file);
                            item.append('<div class="torrent-item__viewed">' + Lampa.Template.get('icon_star', {}, true) + '</div>');
                            Lampa.Storage.set('online_view', viewed);
                        }
                    } else {
                        Lampa.Noty.show(Lampa.Lang.translate('online_mod_nolink'));
                    }
                });
                
                component.append(item);
                component.contextmenu({
                    item: item,
                    view: view,
                    viewed: viewed,
                    hash_file: hash_file,
                    element: element,
                    file: function(call) {
                        call(getFile(element));
                    }
                });
            });
            
            component.start(true);
        }
    }

    // ============ РЕГИСТРАЦИЯ ПЛАГИНА ============

    function startPlugin() {
        window.plugin_tvbox = true;
        
        var manifest = {
            type: 'video',
            name: 'TVBox',
            version: '1.0.0',
            description: 'Онлайн просмотр через Vibix, Collaps, Filmix',
            component: 'online_mod',
            onSearch: function(object) {
                // Глобальный поиск если нужен
            }
        };
        
        Lampa.Plugins.add(manifest, function(component, _object) {
            return new TVBox(component, _object);
        });
        
        // Добавляем в меню источников
        Lampa.Listener.send('online_mod', {
            name: 'TVBox',
            title: 'TVBox'
        });
    }

    if (!window.plugin_tvbox) {
        startPlugin();
    }

})();
