/**
 * Балансер vibix.org для Lampa
 * API документация: https://vibix.org/api/external/documentation
 */

(function () {
    'use strict';

    const API_BASE = 'https://vibix.org/api/v1';
    
    // Конфигурация балансера
    const VIBIX_CONFIG = {
        name: 'Vibix',
        description: 'Онлайн-кинотеатр Vibix',
        version: '1.0.0',
        // API ключ будет запрашиваться у пользователя
        apiKey: ''
    };

    /**
     * Класс балансера Vibix
     */
    class VibixBalancer {
        constructor() {
            this.apiKey = '';
            this.cache = new Map();
        }

        /**
         * Установка API ключа
         */
        setApiKey(key) {
            this.apiKey = key;
            Lampa.Storage.set('vibix_api_key', key);
        }

        /**
         * Получение API ключа из хранилища
         */
        getApiKey() {
            if (!this.apiKey) {
                this.apiKey = Lampa.Storage.get('vibix_api_key', '');
            }
            return this.apiKey;
        }

        /**
         * Проверка наличия API ключа
         */
        hasApiKey() {
            return !!this.getApiKey();
        }

        /**
         * Базовые заголовки для запросов
         */
        getHeaders() {
            return {
                'Authorization': `Bearer ${this.getApiKey()}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
        }

        /**
         * Выполнение запроса к API
         */
        async request(endpoint, params = {}) {
            if (!this.hasApiKey()) {
                throw new Error('API ключ не установлен');
            }

            const url = new URL(`${API_BASE}${endpoint}`);
            
            // Добавление параметров
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    if (Array.isArray(params[key])) {
                        params[key].forEach(val => url.searchParams.append(`${key}[]`, val));
                    } else {
                        url.searchParams.append(key, params[key]);
                    }
                }
            });

            try {
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: this.getHeaders()
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Неверный API ключ');
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Vibix API Error:', error);
                throw error;
            }
        }

        /**
         * Поиск видео по Kinopoisk ID
         */
        async getByKinopoiskId(kpId) {
            const cacheKey = `kp_${kpId}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const data = await this.request(`/publisher/videos/kp/${kpId}`);
            this.cache.set(cacheKey, data);
            return data;
        }

        /**
         * Поиск видео по IMDB ID
         */
        async getByImdbId(imdbId) {
            const cacheKey = `imdb_${imdbId}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const data = await this.request(`/publisher/videos/imdb/${imdbId}`);
            this.cache.set(cacheKey, data);
            return data;
        }

        /**
         * Получение списка сезонов и серий по Kinopoisk ID
         */
        async getSerialsByKpId(kpId) {
            return await this.request(`/serials/kp/${kpId}`);
        }

        /**
         * Получение списка сезонов и серий по IMDB ID
         */
        async getSerialsByImdbId(imdbId) {
            return await this.request(`/serials/imdb/${imdbId}`);
        }

        /**
         * Получение списка видео с фильтрацией
         */
        async getVideosList(filters = {}) {
            return await this.request('/publisher/videos/links', filters);
        }

        /**
         * Получение списка категорий
         */
        async getCategories() {
            return await this.request('/publisher/videos/categories');
        }

        /**
         * Получение списка жанров
         */
        async getGenres() {
            return await this.request('/publisher/videos/genres');
        }

        /**
         * Получение списка стран
         */
        async getCountries() {
            return await this.request('/publisher/videos/countries');
        }

        /**
         * Получение списка озвучек
         */
        async getVoiceovers() {
            return await this.request('/publisher/videos/voiceovers');
        }

        /**
         * Преобразование данных Vibix в формат Lampa
         */
        convertToLampaFormat(data, type = 'movie') {
            if (!data || !data.iframe_url) {
                return null;
            }

            const result = {
                title: data.name_rus || data.name_eng || data.name || 'Неизвестно',
                original_title: data.name_original || data.name_eng,
                poster: data.poster_url,
                background: data.backdrop_url,
                year: data.year,
                duration: data.duration,
                quality: data.quality,
                info: {
                    genres: data.genre || [],
                    countries: data.country || [],
                    description: data.description || data.description_short
                },
                source: 'vibix',
                stream_url: data.iframe_url,
                kp_id: data.kp_id || data.kinopoisk_id,
                imdb_id: data.imdb_id,
                rating: {
                    kp: data.kp_rating,
                    imdb: data.imdb_rating
                }
            };

            // Добавление озвучек если есть
            if (data.voiceovers && data.voiceovers.length > 0) {
                result.voiceovers = data.voiceovers.map(v => ({
                    id: v.id,
                    name: v.name
                }));
            }

            // Для сериалов добавляем информацию о сезонах
            if (type === 'serial' && data.type === 'serial') {
                result.type = 'serial';
            }

            return result;
        }

        /**
         * Получение потоков для видео
         */
        async getStreams(element) {
            const kpId = element.kinopoisk_id || element.kp_id;
            const imdbId = element.imdb_id;

            let data = null;

            // Пробуем найти по Kinopoisk ID
            if (kpId) {
                try {
                    data = await this.getByKinopoiskId(kpId);
                } catch (e) {
                    console.log('Vibix: Не найдено по KP ID');
                }
            }

            // Если не нашли, пробуем по IMDB ID
            if (!data && imdbId) {
                try {
                    data = await this.getByImdbId(imdbId);
                } catch (e) {
                    console.log('Vibix: Не найдено по IMDB ID');
                }
            }

            if (!data || !data.iframe_url) {
                return [];
            }

            const converted = this.convertToLampaFormat(data, element.type);
            
            if (!converted) {
                return [];
            }

            // Формируем объект потока для Lampa
            const stream = {
                title: converted.quality ? `${converted.title} [${converted.quality}]` : converted.title,
                url: converted.stream_url,
                quality: converted.quality,
                voiceovers: converted.voiceovers || [],
                info: converted.info,
                poster: converted.poster
            };

            // Если это сериал, получаем информацию о сезонах
            if (converted.type === 'serial' || element.type === 'serial') {
                try {
                    let serialData = null;
                    if (kpId) {
                        serialData = await this.getSerialsByKpId(kpId);
                    } else if (imdbId) {
                        serialData = await this.getSerialsByImdbId(imdbId);
                    }

                    if (serialData && serialData.seasons) {
                        stream.seasons = serialData.seasons.map(season => ({
                            name: season.name,
                            episodes: season.series.map(ep => ({
                                id: ep.id,
                                name: ep.name,
                                url: `${converted.stream_url}?season=${season.name}&episode=${ep.id}`
                            }))
                        }));
                    }
                } catch (e) {
                    console.error('Vibix: Ошибка получения сезонов', e);
                }
            }

            return [stream];
        }
    }

    // Создаем экземпляр балансера
    const vibix = new VibixBalancer();

    /**
     * Регистрация балансера в Lampa
     */
    function registerBalancer() {
        // Проверяем наличие API ключа
        const apiKey = Lampa.Storage.get('vibix_api_key', '');
        if (apiKey) {
            vibix.setApiKey(apiKey);
        }

        // Регистрируем источник
        Lampa.Source.add({
            name: VIBIX_CONFIG.name,
            description: VIBIX_CONFIG.description,
            version: VIBIX_CONFIG.version,
            
            /**
             * Проверка доступности балансера
             */
            check: function (element) {
                // Проверяем наличие KP ID или IMDB ID
                return !!(element.kinopoisk_id || element.kp_id || element.imdb_id);
            },

            /**
             * Получение потоков
             */
            streams: async function (element, settings) {
                try {
                    if (!vibix.hasApiKey()) {
                        Lampa.Noty.show('Укажите API ключ Vibix в настройках');
                        return [];
                    }

                    const streams = await vibix.getStreams(element);
                    return streams;
                } catch (error) {
                    console.error('Vibix streams error:', error);
                    Lampa.Noty.show('Ошибка Vibix: ' + error.message);
                    return [];
                }
            },

            /**
             * Получение списка (необязательно)
             */
            list: async function (params = {}) {
                try {
                    if (!vibix.hasApiKey()) {
                        return { results: [] };
                    }

                    const data = await vibix.getVideosList({
                        type: params.type || 'movie',
                        page: params.page || 1,
                        limit: params.limit || 20
                    });

                    if (!data.data) {
                        return { results: [] };
                    }

                    return {
                        results: data.data.map(item => vibix.convertToLampaFormat(item)),
                        pagination: data.links ? {
                            hasNext: !!data.links.next,
                            nextPage: data.meta ? data.meta.current_page + 1 : null
                        } : null
                    };
                } catch (error) {
                    console.error('Vibix list error:', error);
                    return { results: [] };
                }
            }
        });

        console.log('Vibix балансер зарегистрирован');
    }

    /**
     * Добавление настроек в интерфейс Lampa
     */
    function addSettings() {
        // Добавляем поле для ввода API ключа
        Lampa.SettingsApi.addParam({
            component: 'source',
            param: {
                name: 'vibix_api_key',
                type: 'input',
                default: ''
            },
            field: {
                name: 'API ключ Vibix',
                description: 'Введите ваш API ключ из личного кабинета vibix.org'
            },
            onChange: function (value) {
                vibix.setApiKey(value);
                if (value) {
                    Lampa.Noty.show('API ключ Vibix сохранен');
                }
            }
        });

        // Добавляем переключатель для включения/выключения балансера
        Lampa.SettingsApi.addParam({
            component: 'source',
            param: {
                name: 'vibix_enabled',
                type: 'toggle',
                default: true
            },
            field: {
                name: 'Включить Vibix',
                description: 'Использовать балансер vibix.org для просмотра'
            }
        });
    }

    /**
     * Инициализация плагина
     */
    function init() {
        // Ждем загрузки Lampa
        if (window.Lampa && Lampa.Source) {
            registerBalancer();
            addSettings();
        } else {
            // Если Lampa еще не загружена, ждем событие готовности
            document.addEventListener('lampa_ready', function () {
                registerBalancer();
                addSettings();
            });
        }
    }

    // Запускаем инициализацию
    init();

})();

