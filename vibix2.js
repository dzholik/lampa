/**
 * Lampa Plugin - Vibix.org Balancer
 * Версия: 1.0.0
 * Автор: Lampa Community
 * Описание: Плагин для просмотра видео с vibix.org
 * 
 * Полностью автономный плагин без внешних зависимостей
 * Все запросы идут напрямую к API vibix.org
 */

(function() {
    'use strict';

    // ========================================
    // КОНФИГУРАЦИЯ
    // ========================================
    const CONFIG = {
        name: 'Vibix',
        version: '1.0.0',
        description: 'Видео балансер Vibix.org',
        api_url: 'https://vibix.org/api/v1',
        timeout: 15000,
        storage_key: 'vibix_settings'
    };

    // ========================================
    // ХРАНИЛИЩЕ НАСТРОЕК
    // ========================================
    let settings = {
        api_key: '',
        preferred_voiceover: null,
        preferred_quality: 'auto',
        user_token: ''
    };

    // ========================================
    // УТИЛИТЫ
    // ========================================
    
    /**
     * Загрузка настроек из хранилища
     */
    function loadSettings() {
        try {
            if (typeof Lampa !== 'undefined' && Lampa.Storage) {
                const saved = Lampa.Storage.get(CONFIG.storage_key, '{}');
                settings = Object.assign(settings, JSON.parse(saved));
            } else if (typeof localStorage !== 'undefined') {
                const saved = localStorage.getItem(CONFIG.storage_key);
                if (saved) {
                    settings = Object.assign(settings, JSON.parse(saved));
                }
            }
        } catch (e) {
            console.error('Vibix: Error loading settings', e);
        }
    }

    /**
     * Сохранение настроек в хранилище
     */
    function saveSettings() {
        try {
            const data = JSON.stringify(settings);
            if (typeof Lampa !== 'undefined' && Lampa.Storage) {
                Lampa.Storage.set(CONFIG.storage_key, data);
            } else if (typeof localStorage !== 'undefined') {
                localStorage.setItem(CONFIG.storage_key, data);
            }
        } catch (e) {
            console.error('Vibix: Error saving settings', e);
        }
    }

    /**
     * Проверка наличия API ключа
     */
    function hasApiKey() {
        return !!settings.api_key;
    }

    /**
     * Генерация уникального ID
     */
    function generateId() {
        return 'vibix_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ========================================
    // API ЗАПРОСЫ
    // ========================================

    /**
     * Выполнение запроса к API vibix.org
     * @param {string} endpoint - endpoint API
     * @param {Object} params - параметры запроса
     * @returns {Promise<Object>} - ответ API
     */
    function apiRequest(endpoint, params = {}) {
        return new Promise((resolve, reject) => {
            if (!settings.api_key) {
                reject(new Error('API ключ не настроен. Укажите API ключ в настройках плагина.'));
                return;
            }

            // Формируем URL с параметрами
            const url = new URL(CONFIG.api_url + endpoint);
            
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null) {
                    if (Array.isArray(params[key])) {
                        params[key].forEach(val => {
                            if (val !== undefined && val !== null) {
                                url.searchParams.append(key + '[]', val);
                            }
                        });
                    } else {
                        url.searchParams.append(key, params[key]);
                    }
                }
            });

            // Таймаут
            const timeoutId = setTimeout(() => {
                reject(new Error('Таймаут запроса. Проверьте соединение с интернетом.'));
            }, CONFIG.timeout);

            // Выполняем запрос
            fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + settings.api_key,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Неверный API ключ. Проверьте ключ в настройках.');
                    } else if (response.status === 404) {
                        throw new Error('Видео не найдено.');
                    } else if (response.status === 429) {
                        throw new Error('Превышен лимит запросов. Попробуйте позже.');
                    } else {
                        throw new Error('Ошибка API: HTTP ' + response.status);
                    }
                }
                
                return response.json();
            })
            .then(data => {
                clearTimeout(timeoutId);
                resolve(data);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                
                if (error.message.includes('fetch')) {
                    reject(new Error('Ошибка сети. Проверьте соединение с интернетом.'));
                } else {
                    reject(error);
                }
            });
        });
    }

    // ========================================
    // API МЕТОДЫ
    // ========================================

    /**
     * Получить видео по Кинопоиск ID
     * @param {number} kpId - ID на Кинопоиске
     * @returns {Promise<Object|null>}
     */
    async function getVideoByKpId(kpId) {
        try {
            const data = await apiRequest('/publisher/videos/kp/' + kpId);
            return data;
        } catch (e) {
            console.error('Vibix: Error fetching video by KP ID', e.message);
            return null;
        }
    }

    /**
     * Получить видео по IMDB ID
     * @param {string} imdbId - ID на IMDb (например: tt1527186)
     * @returns {Promise<Object|null>}
     */
    async function getVideoByImdbId(imdbId) {
        try {
            const data = await apiRequest('/publisher/videos/imdb/' + imdbId);
            return data;
        } catch (e) {
            console.error('Vibix: Error fetching video by IMDB ID', e.message);
            return null;
        }
    }

    /**
     * Получить информацию о сериале (сезоны и серии) по KP ID
     * @param {number} kpId - ID на Кинопоиске
     * @returns {Promise<Object|null>}
     */
    async function getSerialInfoByKpId(kpId) {
        try {
            const data = await apiRequest('/serials/kp/' + kpId);
            return data;
        } catch (e) {
            console.error('Vibix: Error fetching serial info by KP ID', e.message);
            return null;
        }
    }

    /**
     * Получить информацию о сериале по IMDB ID
     * @param {string} imdbId - ID на IMDb
     * @returns {Promise<Object|null>}
     */
    async function getSerialInfoByImdbId(imdbId) {
        try {
            const data = await apiRequest('/serials/imdb/' + imdbId);
            return data;
        } catch (e) {
            console.error('Vibix: Error fetching serial info by IMDB ID', e.message);
            return null;
        }
    }

    /**
     * Получить список видео с фильтрами
     * @param {Object} filters - фильтры (type, category[], year[], genre[], country[], tag[], voiceover[], page, limit)
     * @returns {Promise<Object>}
     */
    async function getVideos(filters = {}) {
        try {
            const params = {};
            
            if (filters.type) params.type = filters.type;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
            if (filters.category) params.category = Array.isArray(filters.category) ? filters.category : [filters.category];
            if (filters.year) params.year = Array.isArray(filters.year) ? filters.year : [filters.year];
            if (filters.genre) params.genre = Array.isArray(filters.genre) ? filters.genre : [filters.genre];
            if (filters.country) params.country = Array.isArray(filters.country) ? filters.country : [filters.country];
            if (filters.tag) params.tag = Array.isArray(filters.tag) ? filters.tag : [filters.tag];
            if (filters.voiceover) params.voiceover = Array.isArray(filters.voiceover) ? filters.voiceover : [filters.voiceover];

            const data = await apiRequest('/publisher/videos/links', params);
            
            return {
                success: true,
                items: data.data || [],
                pagination: data.meta || {},
                links: data.links || {}
            };
        } catch (e) {
            console.error('Vibix: Error fetching videos', e.message);
            return {
                success: false,
                message: e.message,
                items: [],
                pagination: {},
                links: {}
            };
        }
    }

    /**
     * Получить список KP ID
     * @param {Object} filters - фильтры
     * @returns {Promise<Array<number>>}
     */
    async function getKpIds(filters = {}) {
        try {
            const params = {};
            
            if (filters.type) params.type = filters.type;
            if (filters.page) params.page = filters.page;
            if (filters.limit) params.limit = filters.limit;
            if (filters.year) params.year = filters.year;
            if (filters.category) params.category = Array.isArray(filters.category) ? filters.category : [filters.category];

            const data = await apiRequest('/publisher/videos/get_kpids', params);
            return data.data || [];
        } catch (e) {
            console.error('Vibix: Error fetching KP IDs', e.message);
            return [];
        }
    }

    /**
     * Получить список категорий
     * @returns {Promise<Array>}
     */
    async function getCategories() {
        try {
            const data = await apiRequest('/publisher/videos/categories');
            return data.data || [];
        } catch (e) {
            console.error('Vibix: Error fetching categories', e.message);
            return [];
        }
    }

    /**
     * Получить список жанров
     * @returns {Promise<Array>}
     */
    async function getGenres() {
        try {
            const data = await apiRequest('/publisher/videos/genres');
            return data.data || [];
        } catch (e) {
            console.error('Vibix: Error fetching genres', e.message);
            return [];
        }
    }

    /**
     * Получить список стран
     * @returns {Promise<Array>}
     */
    async function getCountries() {
        try {
            const data = await apiRequest('/publisher/videos/countries');
            return data.data || [];
        } catch (e) {
            console.error('Vibix: Error fetching countries', e.message);
            return [];
        }
    }

    /**
     * Получить список тегов
     * @returns {Promise<Array>}
     */
    async function getTags() {
        try {
            const data = await apiRequest('/publisher/videos/tags');
            return data.data || [];
        } catch (e) {
            console.error('Vibix: Error fetching tags', e.message);
            return [];
        }
    }

    /**
     * Получить список озвучек
     * @returns {Promise<Array>}
     */
    async function getVoiceovers() {
        try {
            const data = await apiRequest('/publisher/videos/voiceovers');
            return data.data || [];
        } catch (e) {
            console.error('Vibix: Error fetching voiceovers', e.message);
            return [];
        }
    }

    /**
     * Проверить соединение с API
     * @returns {Promise<Object>}
     */
    async function testConnection() {
        try {
            await apiRequest('/publisher/videos/categories');
            return { success: true, message: 'Соединение с API успешно установлено' };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    // ========================================
    // ПРЕОБРАЗОВАНИЕ ДАННЫХ
    // ========================================

    /**
     * Преобразование данных видео в формат Lampa
     * @param {Object} video - данные видео от API
     * @returns {Object} - данные в формате Lampa
     */
    function convertToLampaFormat(video) {
        if (!video) return null;

        const item = {
            // Основная информация
            id: video.id,
            title: video.name_rus || video.name_eng || video.name,
            original_title: video.name_original || video.name_eng || video.name,
            year: video.year,
            type: video.type,
            
            // ID
            kp_id: video.kp_id || video.kinopoisk_id,
            imdb_id: video.imdb_id,
            
            // Рейтинги
            rating: {
                kp: video.kp_rating,
                imdb: video.imdb_rating
            },
            
            // Изображения
            poster: video.poster_url,
            backdrop: video.backdrop_url,
            
            // Длительность и качество
            duration: video.duration,
            quality: video.quality,
            
            // Метаданные
            genres: video.genre || [],
            countries: video.country || [],
            description: video.description,
            short_description: video.description_short,
            
            // Озвучки и теги
            voiceovers: (video.voiceovers || []).map(v => ({
                id: v.id,
                name: v.name
            })),
            tags: (video.tags || []).map(t => ({
                id: t.id,
                code: t.code,
                name: t.name
            })),
            
            // URL для воспроизведения
            url: video.iframe_url,
            iframe_url: video.iframe_url,
            
            // Метаданные
            uploaded_at: video.uploaded_at,
            source: 'vibix'
        };

        return item;
    }

    /**
     * Создание элемента для списка результатов поиска
     * @param {Object} video - данные видео
     * @returns {Object} - элемент для отображения
     */
    function createResultItem(video) {
        if (!video) return null;

        return {
            id: video.id,
            title: video.name_rus || video.name_eng || video.name,
            original_title: video.name_original,
            year: video.year,
            type: video.type,
            quality: video.quality,
            poster: video.poster_url,
            rating: {
                kp: video.kp_rating,
                imdb: video.imdb_rating
            },
            voiceovers: (video.voiceovers || []).map(v => v.name),
            url: video.iframe_url,
            source: 'vibix'
        };
    }

    // ========================================
    // ГЛАВНЫЙ ОБЪЕКТ ПЛАГИНА
    // ========================================

    const VibixPlugin = {
        // ========================================
        // Служебные методы
        // ========================================
        
        /**
         * Инициализация плагина
         */
        init: function() {
            loadSettings();
            console.log('Vibix: Plugin initialized v' + CONFIG.version);
            console.log('Vibix: API key status:', hasApiKey() ? 'configured' : 'not configured');
            return this;
        },

        /**
         * Получить название плагина
         */
        getName: function() {
            return CONFIG.name;
        },

        /**
         * Получить версию плагина
         */
        getVersion: function() {
            return CONFIG.version;
        },

        /**
         * Получить описание плагина
         */
        getDescription: function() {
            return CONFIG.description;
        },

        // ========================================
        // Управление настройками
        // ========================================

        /**
         * Установить API ключ
         * @param {string} key - API ключ из личного кабинета vibix.org
         */
        setApiKey: function(key) {
            settings.api_key = key;
            saveSettings();
            console.log('Vibix: API key updated');
        },

        /**
         * Получить текущий API ключ (маскированный)
         */
        getApiKey: function() {
            return settings.api_key;
        },

        /**
         * Проверить, настроен ли API ключ
         */
        isConfigured: function() {
            return hasApiKey();
        },

        /**
         * Установить предпочитаемую озвучку
         * @param {number} voiceoverId - ID озвучки
         */
        setPreferredVoiceover: function(voiceoverId) {
            settings.preferred_voiceover = voiceoverId;
            saveSettings();
        },

        /**
         * Получить предпочитаемую озвучку
         */
        getPreferredVoiceover: function() {
            return settings.preferred_voiceover;
        },

        /**
         * Установить предпочитаемое качество
         * @param {string} quality - качество (auto, 4k, 1080p, 720p, 480p)
         */
        setPreferredQuality: function(quality) {
            settings.preferred_quality = quality;
            saveSettings();
        },

        /**
         * Получить предпочитаемое качество
         */
        getPreferredQuality: function() {
            return settings.preferred_quality;
        },

        /**
         * Получить все настройки
         */
        getSettings: function() {
            return { ...settings };
        },

        /**
         * Обновить настройки
         * @param {Object} newSettings - новые настройки
         */
        updateSettings: function(newSettings) {
            settings = Object.assign(settings, newSettings);
            saveSettings();
        },

        // ========================================
        // Методы поиска
        // ========================================

        /**
         * Поиск видео по ID (KP или IMDB)
         * @param {number|string} id - ID видео
         * @param {string} type - тип ID ('kp' или 'imdb')
         * @returns {Promise<Object|null>}
         */
        searchById: async function(id, type = 'kp') {
            let video = null;
            
            if (type === 'kp') {
                video = await getVideoByKpId(id);
            } else if (type === 'imdb') {
                video = await getVideoByImdbId(id);
            }
            
            return video ? convertToLampaFormat(video) : null;
        },

        /**
         * Получить ссылку для воспроизведения
         * @param {number} kpId - Кинопоиск ID
         * @param {string} imdbId - IMDB ID (опционально)
         * @returns {Promise<Object|null>}
         */
        getPlayUrl: async function(kpId, imdbId) {
            let video = null;
            
            if (kpId) {
                video = await getVideoByKpId(kpId);
            }
            
            if (!video && imdbId) {
                video = await getVideoByImdbId(imdbId);
            }

            if (video && video.iframe_url) {
                return {
                    success: true,
                    url: video.iframe_url,
                    quality: video.quality,
                    voiceovers: video.voiceovers,
                    title: video.name_rus || video.name_eng || video.name,
                    poster: video.poster_url
                };
            }

            return {
                success: false,
                message: 'Видео не найдено'
            };
        },

        /**
         * Поиск по карточке фильма/сериала
         * @param {Object} card - карточка из Lampa
         * @returns {Promise<Object|null>}
         */
        searchByCard: async function(card) {
            const kpId = card.kp_id || card.id || card.kinopoisk_id;
            const imdbId = card.imdb_id;

            let video = null;

            if (kpId) {
                video = await getVideoByKpId(kpId);
            }

            if (!video && imdbId) {
                video = await getVideoByImdbId(imdbId);
            }

            return video ? convertToLampaFormat(video) : null;
        },

        // ========================================
        // Методы для сериалов
        // ========================================

        /**
         * Получить информацию о сериале
         * @param {number|string} id - ID (KP или IMDB)
         * @param {string} type - тип ID ('kp' или 'imdb')
         * @returns {Promise<Object|null>}
         */
        getSerialInfo: async function(id, type = 'kp') {
            if (type === 'kp') {
                return await getSerialInfoByKpId(id);
            } else if (type === 'imdb') {
                return await getSerialInfoByImdbId(id);
            }
            return null;
        },

        /**
         * Получить сезоны сериала
         * @param {number} kpId - Кинопоиск ID
         * @returns {Promise<Array>}
         */
        getSeasons: async function(kpId) {
            const info = await getSerialInfoByKpId(kpId);
            return info && info.seasons ? info.seasons : [];
        },

        // ========================================
        // Методы каталога
        // ========================================

        /**
         * Получить список видео
         * @param {Object} filters - фильтры
         */
        getVideos: getVideos,

        /**
         * Получить список KP ID
         * @param {Object} filters - фильтры
         */
        getKpIds: getKpIds,

        /**
         * Получить категории
         */
        getCategories: getCategories,

        /**
         * Получить жанры
         */
        getGenres: getGenres,

        /**
         * Получить страны
         */
        getCountries: getCountries,

        /**
         * Получить теги
         */
        getTags: getTags,

        /**
         * Получить озвучки
         */
        getVoiceovers: getVoiceovers,

        // ========================================
        // Служебные методы API
        // ========================================

        /**
         * Проверить соединение с API
         */
        testConnection: testConnection,

        /**
         * Сделать прямой запрос к API
         * @param {string} endpoint - endpoint API
         * @param {Object} params - параметры
         */
        request: apiRequest,

        // ========================================
        // Константы
        // ========================================

        config: CONFIG
    };

    // ========================================
    // ИНТЕРФЕЙС ДЛЯ LAMPA
    // ========================================

    const LampaInterface = {
        // Название балансера
        name: CONFIG.name,
        
        // Иконка балансера (base64 SVG)
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjxwYXRoIGQ9Ik0xMCAxNmw1LTQtNS00eiIvPjwvc3ZnPg==',

        /**
         * Поиск по фильму/сериалу
         * @param {Object} card - карточка фильма
         * @param {Function} callback - callback функция
         */
        search: function(card, callback) {
            loadSettings();

            if (!hasApiKey()) {
                callback([]);
                return;
            }

            const kpId = card.kp_id || card.id || card.kinopoisk_id;
            const imdbId = card.imdb_id;

            let results = [];
            let completed = false;

            const done = () => {
                if (!completed) {
                    completed = true;
                    callback(results);
                }
            };

            if (kpId) {
                getVideoByKpId(kpId).then(video => {
                    if (video && video.iframe_url) {
                        results.push({
                            title: video.name_rus || video.name_eng || video.name,
                            quality: video.quality,
                            voiceovers: video.voiceovers || [],
                            url: video.iframe_url,
                            source: 'vibix',
                            kp_id: video.kp_id,
                            imdb_id: video.imdb_id
                        });
                    }
                    done();
                }).catch(() => done());
            } else if (imdbId) {
                getVideoByImdbId(imdbId).then(video => {
                    if (video && video.iframe_url) {
                        results.push({
                            title: video.name_rus || video.name_eng || video.name,
                            quality: video.quality,
                            voiceovers: video.voiceovers || [],
                            url: video.iframe_url,
                            source: 'vibix',
                            kp_id: video.kp_id,
                            imdb_id: video.imdb_id
                        });
                    }
                    done();
                }).catch(() => done());
            } else {
                done();
            }
        },

        /**
         * Получить URL для воспроизведения
         * @param {Object} element - элемент из результатов поиска
         * @param {Function} callback - callback функция
         */
        getUrl: function(element, callback) {
            if (element && element.url) {
                callback({
                    url: element.url,
                    quality: element.quality,
                    voiceovers: element.voiceovers
                });
            } else {
                callback(null);
            }
        },

        /**
         * Получить сезоны сериала
         * @param {Object} card - карточка сериала
         * @param {Function} callback - callback функция
         */
        getSeasons: function(card, callback) {
            const kpId = card.kp_id || card.id || card.kinopoisk_id;
            
            if (kpId && hasApiKey()) {
                getSerialInfoByKpId(kpId).then(data => {
                    if (data && data.seasons) {
                        callback(data.seasons);
                    } else {
                        callback([]);
                    }
                }).catch(() => callback([]));
            } else {
                callback([]);
            }
        },

        /**
         * Получить настройки плагина
         * @returns {Array}
         */
        settings: function() {
            return [
                {
                    name: 'API Ключ',
                    key: 'api_key',
                    type: 'text',
                    value: settings.api_key,
                    placeholder: 'Введите API ключ из личного кабинета vibix.org'
                },
                {
                    name: 'Предпочитаемая озвучка',
                    key: 'preferred_voiceover',
                    type: 'select',
                    value: settings.preferred_voiceover,
                    options: []
                },
                {
                    name: 'Качество по умолчанию',
                    key: 'preferred_quality',
                    type: 'select',
                    value: settings.preferred_quality,
                    options: [
                        { value: 'auto', label: 'Авто' },
                        { value: '4k', label: '4K' },
                        { value: '1080p', label: '1080p' },
                        { value: '720p', label: '720p' },
                        { value: '480p', label: '480p' }
                    ]
                }
            ];
        },

        /**
         * Сохранить настройку
         * @param {string} key - ключ настройки
         * @param {any} value - значение
         */
        saveSetting: function(key, value) {
            settings[key] = value;
            saveSettings();
        },

        /**
         * Информация о балансере
         */
        info: {
            name: CONFIG.name,
            version: CONFIG.version,
            description: CONFIG.description,
            author: 'Lampa Community',
            site: 'https://vibix.org'
        }
    };

    // ========================================
    // РЕГИСТРАЦИЯ ПЛАГИНА
    // ========================================

    // Регистрация в Lampa
    if (typeof Lampa !== 'undefined') {
        // Регистрируем интерфейс балансера
        if (Lampa.Plugins) {
            Lampa.Plugins.register('vibix', LampaInterface);
        }
        
        // Экспортируем объект плагина
        Lampa.Vibix = VibixPlugin.init();
        
        console.log('Vibix: Registered as Lampa plugin');
    }

    // Экспорт для standalone использования
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = VibixPlugin;
    }

    // Экспорт в глобальную область
    if (typeof window !== 'undefined') {
        window.VibixPlugin = VibixPlugin.init();
    }

    // Экспорт для AMD
    if (typeof define === 'function' && define.amd) {
        define('VibixPlugin', [], function() {
            return VibixPlugin.init();
        });
    }

})();
