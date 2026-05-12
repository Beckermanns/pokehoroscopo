/**
  * @fileoverview Módulo de integración con PokéAPI para El Oráculo Pokémon
  * @description Proporciona funciones para obtener datos de Pokémon, manejo de cache,
  * retry automático y estructura limpia de datos usando la PokéAPI
  * @author Arquitectura Frontend
  * @version 1.1.0
  * @since 2026-05-12
  * @requires module:CONFIG
  * @see {@link https://pokeapi.co/api/v2/|PokéAPI}
  */

// ============================================================================
// CONFIGURACIÓN DE RETRY
// ============================================================================

/**
 * Configuración de retry para peticiones a la API
 * @type {Object}
 */
const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    INITIAL_DELAY_MS: 500,
    MAX_DELAY_MS: 4000,
    BACKOFF_FACTOR: 2
};

/**
 * Retorna un sprite fallback genérico cuando el principal no carga
 * @description Genera un SVG inline de una Pokéball como imagen de fallback
 * cuando el sprite del Pokémon no puede cargarse por errores de red o URL inválidas
 * @param {number} id - ID del Pokémon (no usado, mantenido por compatibilidad)
 * @returns {string} URL data URI del sprite SVG genérico
 * @example
 * const fallback = getGenericFallbackSprite(25);
 * // Devuelve: "data:image/svg+xml,%3Csvg..."
 */
function getGenericFallbackSprite(id) {
    // Sprite genérico de Pokéball como fallback
    return `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#e94560" stroke="#1a1a2e" stroke-width="4"/>
            <rect x="2" y="46" width="96" height="8" fill="#1a1a2e"/>
            <circle cx="50" cy="50" r="15" fill="#eaeaea" stroke="#1a1a2e" stroke-width="4"/>
        </svg>
    `)}`;
}

import { POKEAPI_CONFIG, APP_CONFIG } from './config.js';

/**
 * @typedef {Object} PokemonType
 * @description Estructura de datos de un tipo de Pokémon
 * @property {string} name - Nombre del tipo (ej: "fire", "water")
 * @property {string} slot - Orden del tipo en el Pokémon (1 o 2)
 */

/**
 * @typedef {Object} PokemonStat
 * @description Estructura de datos de una estadística
 * @property {string} name - Nombre de la estadística (hp, attack, defense, etc.)
 * @property {number} base - Valor base de la estadística
 */

/**
 * @typedef {Object} PokemonAbility
 * @description Estructura de datos de una habilidad
 * @property {string} name - Nombre de la habilidad
 * @property {boolean} isHidden - Si es una habilidad oculta
 */

/**
 * @typedef {Object} PokemonSprite
 * @description URLs de sprites del Pokémon
 * @property {string} frontDefault - Sprite frontal por defecto
 * @property {string} frontShiny - Sprite shiny frontal
 * @property {string} backDefault - Sprite trasero por defecto
 * @property {string} animated - Sprite animado (si está disponible)
 */

/**
 * @class PokemonData
 * @description Clase que representa los datos limpios de un Pokémon
 */
export class PokemonData {
    /**
     * Crea una instancia de PokemonData
     * @param {Object} rawData - Datos crudos de la API
     */
    constructor(rawData) {
        /**
         * @type {number} id - ID del Pokémon
         */
        this.id = rawData.id || 0;
        
        /**
         * @type {string} name - Nombre del Pokémon
         */
        this.name = rawData.name ? this.formatName(rawData.name) : '???';
        
        /**
         * @type {string} nameRaw - Nombre en formato API (lowercase)
         */
        this.nameRaw = rawData.name || '';
        
        /**
         * @type {number} height - Altura en decímetros
         */
        this.height = rawData.height || 0;
        
        /**
         * @type {number} weight - Peso en hectogramos
         */
        this.weight = rawData.weight || 0;
        
        /**
         * @type {PokemonType[]} types - Tipos del Pokémon
         */
        this.types = this.extractTypes(rawData.types);
        
        /**
         * @type {PokemonType} primaryType - Tipo primario (primer slot)
         */
        this.primaryType = this.types[0]?.name || 'normal';
        
        /**
         * @type {PokemonType} secondaryType - Tipo secundario (segundo slot, si existe)
         */
        this.secondaryType = this.types[1]?.name || null;
        
        /**
         * @type {PokemonStat[]} stats - Estadísticas del Pokémon
         */
        this.stats = this.extractStats(rawData.stats);
        
        /**
         * @type {PokemonAbility[]} abilities - Habilidades del Pokémon
         */
        this.abilities = this.extractAbilities(rawData.abilities);
        
        /**
         * @type {PokemonSprite} sprites - URLs de sprites
         */
        this.sprites = this.extractSprites(rawData.sprites);
        
        /**
         * @type {string} spriteUrl - URL del sprite principal
         */
        this.spriteUrl = this.sprites?.frontDefault || this.getFallbackSpriteUrl(this.id);
        
        /**
         * @type {number} baseExperience - Experiencia base
         */
        this.baseExperience = rawData.base_experience || 0;
        
        /**
         * @type {number} order - Orden en la Pokédex
         */
        this.order = rawData.order || this.id;
    }
    
    /**
     * Formatea el nombre para presentación (mayúscula inicial)
     * @description Convierte el nombre de la API a formato legible, reemplazando
     * guiones por espacios y capitalizando la primera letra
     * @param {string} name - Nombre a formatear (formato API lowercase)
     * @returns {string} Nombre formateado para presentación
     * @example
     * formatName("charizard"); // "Charizard"
     * formatName("mr-mime"); // "Mr Mime"
     */
    formatName(name) {
        if (!name) return '???';
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
    }
    
    /**
     * Extrae los tipos del Pokémon
     * @description Normaliza los datos de tipos de la PokéAPI, ordenándolos por slot
     * (primario primero) y extrayendo solo nombre y slot
     * @param {Array} types - Array de tipos de la PokéAPI
     * @returns {PokemonType[]} Tipos ordenados por slot (primario primero)
     * @example
     * const types = extractTypes([{type:{name:"fire"},slot:2},{type:{name:"flying"},slot:1}]);
     * // Resultado: [{name:"flying",slot:1}, {name:"fire",slot:2}]
     */
    extractTypes(types) {
        if (!types || !Array.isArray(types)) return [];
        return types
            .sort((a, b) => a.slot - b.slot)
            .map(t => ({
                name: t.type?.name || 'unknown',
                slot: t.slot
            }));
    }
    
    /**
     * Extrae las estadísticas del Pokémon
     * @description Normaliza las estadísticas de la PokéAPI, convirtiendo nombres
     * de estadísticas especiales (special-attack -> spAttack) a formato corto
     * @param {Array} stats - Array de estadísticas de la PokéAPI
     * @returns {PokemonStat[]} Estadísticas procesadas con nombres estandarizados
     * @example
     * const stats = extractStats([
     *   {stat:{name:"hp"},base_stat:45},
     *   {stat:{name:"special-attack"},base_stat:65}
     * ]);
     * // Resultado: [{name:"hp",base:45}, {name:"spAttack",base:65}]
     */
    extractStats(stats) {
        if (!stats || !Array.isArray(stats)) return [];
        
        const statNames = {
            'hp': 'hp',
            'attack': 'attack',
            'defense': 'defense',
            'special-attack': 'spAttack',
            'special-defense': 'spDefense',
            'speed': 'speed'
        };
        
        return stats.map(s => ({
            name: statNames[s.stat?.name] || s.stat?.name || 'unknown',
            base: s.base_stat || 0
        }));
    }
    
    /**
     * Extrae las habilidades del Pokémon
     * @description Extrae y formatea las habilidades de la PokéAPI, marcando
     * cuáles son habilidades ocultas (isHidden)
     * @param {Array} abilities - Array de habilidades de la PokéAPI
     * @returns {PokemonAbility[]} Habilidades procesadas
     * @example
     * const abilities = extractAbilities([
     *   {ability:{name:"run-away"},is_hidden:false},
     *   {ability:{name:"flash-fire"},is_hidden:true}
     * ]);
     * // Resultado: [{name:"Run Away",isHidden:false}, {name:"Flash Fire",isHidden:true}]
     */
    extractAbilities(abilities) {
        if (!abilities || !Array.isArray(abilities)) return [];
        return abilities.map(a => ({
            name: this.formatName(a.ability?.name || ''),
            isHidden: a.is_hidden || false
        }));
    }
    
    /**
     * Extrae los sprites del Pokémon
     * @param {Object} sprites - Objeto de sprites de la API
     * @returns {PokemonSprite} Sprites procesados
     */
    extractSprites(sprites) {
        return {
            frontDefault: sprites?.front_default || null,
            frontShiny: sprites?.front_shiny || null,
            backDefault: sprites?.back_default || null,
            backShiny: sprites?.back_shiny || null,
            animated: sprites?.animated?.front_default || sprites?.front_default || null
        };
    }
    
    /**
     * Genera URL del sprite fallback desde GitHub
     * @param {number} id - ID del Pokémon
     * @returns {string} URL del sprite
     */
    getFallbackSpriteUrl(id) {
        return `${POKEAPI_CONFIG.SPRITE_URL}/${id}.png`;
    }
    
    /**
     * Obtiene la altura formateada en metros
     * @description Convierte la altura de decímetros a metros con un decimal
     * @returns {string} Altura formateada en metros (ej: "1.7")
     * @example
     * const pokemon = new PokemonData({ height: 17 });
     * console.log(pokemon.getFormattedHeight()); // "1.7"
     */
    getFormattedHeight() {
        return (this.height / 10).toFixed(1);
    }
    
    /**
     * Obtiene el peso formateado en kilogramos
     * @description Convierte el peso de hectogramos a kilogramos con un decimal
     * @returns {string} Peso formateado en kg (ej: "6.0")
     * @example
     * const pokemon = new PokemonData({ weight: 60 });
     * console.log(pokemon.getFormattedWeight()); // "6.0"
     */
    getFormattedWeight() {
        return (this.weight / 10).toFixed(1);
    }
    
    /**
     * Obtiene las estadísticas como objeto clave-valor
     * @description Convierte el array de estadísticas a un objeto indexado por nombre
     * @returns {Object} Objeto con estadísticas (ej: { hp: 45, attack: 49, ... })
     * @example
     * const pokemon = await fetchPokemon(1);
     * const stats = pokemon.getStatsMap();
     * console.log(stats.hp); // 45
     */
    getStatsMap() {
        return this.stats.reduce((acc, stat) => {
            acc[stat.name] = stat.base;
            return acc;
        }, {});
    }
    
/**
     * Obtiene el sprite URL con fallback mejorado
     * @returns {string} URL del sprite o fallback genérico
     */
    getSpriteWithFallback() {
        if (this.spriteUrl && this.spriteUrl.startsWith('http')) {
            return this.spriteUrl;
        }
        return this.getFallbackSpriteUrl(this.id);
    }

    /**
     * Obtiene un sprite alternativo si el principal falla
     * @returns {Object} Objeto con URLs alternativas de sprite
     */
    getAlternativeSprites() {
        return {
            default: this.sprites?.frontDefault || this.getFallbackSpriteUrl(this.id),
            shiny: this.sprites?.frontShiny || null,
            animated: this.sprites?.animated || null,
            back: this.sprites?.backDefault || null,
            artwork: this.getArtworkUrl()
        };
    }

    /**
     * Obtiene la URL de arte oficial del Pokémon
     * @returns {string} URL del artwork oficial
     */
    getArtworkUrl() {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${this.id}.png`;
    }

    /**
     * Convierte a objeto plano para serialización
     * @description Retorna una representación plana del Pokémon sin métodos,
     * lista para guardar en LocalStorage o enviar como JSON
     * @returns {Object} Objeto serializable con todos los datos del Pokémon
     * @example
     * const pokemon = await fetchPokemon(25);
     * const json = pokemon.toJSON();
     * localStorage.setItem('pokemon', JSON.stringify(json));
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            nameRaw: this.nameRaw,
            height: this.height,
            weight: this.weight,
            types: this.types,
            primaryType: this.primaryType,
            secondaryType: this.secondaryType,
            stats: this.stats,
            abilities: this.abilities,
            sprites: this.sprites,
            spriteUrl: this.spriteUrl,
            baseExperience: this.baseExperience,
            order: this.order
        };
    }
}

/**
 * Realiza una petición con retry automático exponencial
 * @description Ejecuta una función async con reintentos automáticos en caso de fallo
 * @param {Function} fn - Función async a ejecutar
 * @param {Object} options - Opciones de retry
 * @param {number} options.maxRetries - Número máximo de reintentos
 * @param {number} options.delay - Retraso inicial en ms
 * @param {number} options.backoffFactor - Factor de backoff exponencial
 * @returns {Promise<any>} Resultado de la función
 */
async function withRetry(fn, options = {}) {
    const {
        maxRetries = RETRY_CONFIG.MAX_RETRIES,
        delay = RETRY_CONFIG.INITIAL_DELAY_MS,
        backoffFactor = RETRY_CONFIG.BACKOFF_FACTOR
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                const waitTime = Math.min(
                    delay * Math.pow(backoffFactor, attempt),
                    RETRY_CONFIG.MAX_DELAY_MS
                );
                console.log(`Retry ${attempt + 1}/${maxRetries} en ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw lastError;
}

/**
 * Verifica si un error es recuperable (puede reintentarse)
 * @param {Error} error - Error a verificar
 * @returns {boolean} True si es recuperable
 */
function isRetryableError(error) {
    // Errores de red, timeout, 5xx del servidor
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return true;
    }
    if (error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('timeout')) {
        return true;
    }
    // Errores del servidor 5xx
    if (error.message?.match(/Error HTTP: 5\d{2}/)) {
        return true;
    }
    return false;
}

/**
 * @type {Map<number, PokemonData>}
 * @description Cache en memoria para Pokémon ya descargados
 */
const pokemonCache = new Map();

/**
 * Obtiene un Pokémon específico por su ID o nombre
 * @description Hace una petición a la PokéAPI y retorna los datos procesados.
 * Los resultados se cachean en memoria para optimizar peticiones futuras.
 * Implementa retry automático en caso de fallo de conexión.
 * @param {number|string} identifier - ID numérico o nombre del Pokémon
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.skipCache - Si true, omite el cache en memoria
 * @param {boolean} options.skipRetry - Si true, deshabilita el retry automático
 * @returns {Promise<PokemonData>} Datos del Pokémon procesados
 * @throws {Error} Si la petición falla después de todos los reintentos
 * @example
 * const pikachu = await fetchPokemon(25);
 * console.log(pikachu.name); // "Pikachu"
 *
 * const charizard = await fetchPokemon("charizard");
 * console.log(charizard.primaryType); // "fire"
 */
export async function fetchPokemon(identifier, options = {}) {
    const { skipCache = false, skipRetry = false } = options;

    // Verificar cache en memoria primero
    const cacheKey = typeof identifier === 'number' ? identifier : identifier.toLowerCase();
    if (!skipCache && pokemonCache.has(cacheKey)) {
        console.log(`📦 Cache hit para Pokémon ${identifier}`);
        return pokemonCache.get(cacheKey);
    }

    const fetchFn = async () => {
        const response = await fetch(`${POKEAPI_CONFIG.BASE_URL}${POKEAPI_CONFIG.POKEMON_ENDPOINT}/${identifier}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Pokémon no encontrado: ${identifier}`);
            }
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
    };

    try {
        let data;
        if (skipRetry) {
            data = await fetchFn();
        } else {
            data = await withRetry(fetchFn);
        }

        const pokemonData = new PokemonData(data);

        // Guardar en cache
        pokemonCache.set(cacheKey, pokemonData);
        pokemonCache.set(pokemonData.id, pokemonData);

        console.log(`✅ Pokémon ${pokemonData.name} cargado exitosamente`);
        return pokemonData;
    } catch (error) {
        console.error(`❌ Error al obtener Pokémon ${identifier}:`, error.message);
        throw error;
    }
}

/**
 * Obtiene una lista de Pokémon básicos
 * @description Pide los primeros N Pokémon (limite configurado en APP_CONFIG)
 * Implementa retry automático en caso de fallo de conexión.
 * @param {number} [limit=APP_CONFIG.MAX_POKEMON_FETCH] - Cantidad de Pokémon a obtener
 * @param {Object} [options] - Opciones adicionales
 * @param {boolean} [options.skipRetry] - Si true, deshabilita el retry automático
 * @returns {Promise<Object[]>} Array con datos básicos de Pokémon
 */
export async function fetchPokemonList(limit = APP_CONFIG.MAX_POKEMON_FETCH, options = {}) {
    const { skipRetry = false } = options;

    const fetchFn = async () => {
        const response = await fetch(`${POKEAPI_CONFIG.BASE_URL}${POKEAPI_CONFIG.POKEMON_ENDPOINT}?limit=${limit}`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return response.json();
    };

    try {
        const data = skipRetry ? await fetchFn() : await withRetry(fetchFn);
        console.log(`📋 Lista de ${data.results?.length || 0} Pokémon obtenida`);
        return data.results || [];
    } catch (error) {
        console.error('❌ Error al obtener lista de Pokémon:', error.message);
        throw error;
    }
}

/**
 * Obtiene la URL del sprite de un Pokémon
 * @description Retorna la URL directa del sprite sin necesidad de pedir datos completos
 * @param {number} id - ID del Pokémon
 * @param {Object} [options] - Opciones adicionales
 * @param {boolean} [options.shiny=false] - Si se solicita versión shiny
 * @param {boolean} [options.animated=false] - Si se solicita versión animada
 * @returns {string} URL del sprite
 * @example
 * const normalSprite = getPokemonImage(25); // Sprite normal
 * const shinySprite = getPokemonImage(25, { shiny: true }); // Sprite shiny
 */
export function getPokemonImage(id, options = {}) {
    const { shiny = false, animated = false } = options;
    
    if (animated) {
        return `${POKEAPI_CONFIG.SPRITE_URL}/animated/${id}.gif`;
    }
    
    if (shiny) {
        return `${POKEAPI_CONFIG.SPRITE_URL}/shiny/${id}.png`;
    }
    
    return `${POKEAPI_CONFIG.SPRITE_URL}/${id}.png`;
}

/**
 * Obtiene múltiples Pokémon de forma concurrente
 * @description Usa Promise.all para obtener varios Pokémon en paralelo.
 * Si algún Pokémon falla, se ignora y continúa con los demás.
 * @param {Array<number>} ids - Array de IDs de Pokémon
 * @returns {Promise<PokemonData[]>} Array de datos de Pokémon obtenidos exitosamente
 * @example
 * const pokemons = await fetchMultiplePokemon([1, 4, 7, 25]);
 * console.log(pokemons.map(p => p.name)); // ["Bulbasaur", "Charmander", "Squirtle", "Pikachu"]
 */
export async function fetchMultiplePokemon(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return [];
    }
    
    try {
        const promises = ids.map(id => fetchPokemon(id));
        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        console.error('Error al obtener múltiples Pokémon:', error);
        throw error;
    }
}

/**
 * Obtiene un Pokémon aleatorio dentro de un rango
 * @description Selecciona un ID aleatorio y obtiene ese Pokémon.
 * Usa Math.random() por lo que cada llamada puede devolver un Pokémon diferente.
 * @param {number} [min=1] - ID mínimo (incluido)
 * @param {number} [max=POKEAPI_CONFIG.TOTAL_POKEMON] - ID máximo (incluido)
 * @returns {Promise<PokemonData>} Datos del Pokémon aleatorio seleccionado
 * @example
 * // Obtener un Pokémon aleatorio de la generación clásica (1-151)
 * const random = await fetchRandomPokemon(1, 151);
 * console.log(random.name); // Puede ser cualquier Pokémon de esa generación
 *
 * // Obtener un Pokémon aleatorio de cualquier generación
 * const anyPokemon = await fetchRandomPokemon();
 * console.log(anyPokemon.name); // Cualquier Pokémon disponible
 */
export async function fetchRandomPokemon(min = 1, max = POKEAPI_CONFIG.TOTAL_POKEMON) {
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return fetchPokemon(randomId);
}

/**
 * Selecciona un Pokémon basado en un seed determinista
 * @description Usa un seed para seleccionar siempre el mismo Pokémon dado el mismo seed.
 * Útil para mantener consistencia entre consultas. El mismo seed siempre devolverá
 * el mismo Pokémon dentro del rango especificado.
 * @param {number} seed - Seed para selección determinista (número entero)
 * @param {number} [min=1] - ID mínimo (incluido)
 * @param {number} [max=151] - ID máximo (incluido, por defecto generación clásica)
 * @returns {Promise<PokemonData>} Datos del Pokémon seleccionado según el seed
 * @example
 * // Siempre devuelve el mismo Pokémon para el mismo seed
 * const p1 = await fetchPokemonBySeed(12345);
 * const p2 = await fetchPokemonBySeed(12345);
 * console.log(p1.name === p2.name); // true - son el mismo Pokémon
 *
 * // Seed determinista basado en fecha para horóscopo del día
 * const todaySeed = hashCode(`${day}_${month}_${signId}`);
 * const dailyPokemon = await fetchPokemonBySeed(todaySeed, 1, 151);
 */
export async function fetchPokemonBySeed(seed, min = 1, max = 151) {
    // Convertir seed a ID dentro del rango
    let hash = 0;
    const seedStr = seed.toString();
    for (let i = 0; i < seedStr.length; i++) {
        hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
        hash = hash & hash;
    }
    
    const id = Math.abs(hash % (max - min + 1)) + min;
    return fetchPokemon(id);
}

/**
 * Limpia el cache en memoria
 * @description Remueve todos los Pokémon guardados en cache
 */
export function clearMemoryCache() {
    pokemonCache.clear();
}

/**
 * Obtiene el tamaño actual del cache en memoria
 * @returns {number} Cantidad de Pokémon en cache
 */
export function getCacheSize() {
    return pokemonCache.size;
}

/**
 * Obtiene información de un tipo de Pokémon
 * @description Pide los datos de un tipo específico de la PokéAPI
 * @param {string} typeName - Nombre del tipo (fire, water, etc.)
 * @returns {Promise<Object>} Datos del tipo
 */
export async function fetchPokemonType(typeName) {
    try {
        const response = await fetch(`${POKEAPI_CONFIG.BASE_URL}${POKEAPI_CONFIG.TYPE_ENDPOINT}/${typeName}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener tipo ${typeName}:`, error);
        throw error;
    }
}

/**
 * Valida si un ID de Pokémon es válido
 * @param {number} id - ID a validar
 * @returns {boolean} True si el ID es válido
 */
export function isValidPokemonId(id) {
    return Number.isInteger(id) && id >= 1 && id <= POKEAPI_CONFIG.TOTAL_POKEMON;
}

/**
 * Manejador de error para img de sprites
 * @description Crea un manejador de error para el elemento img del sprite
 * que cambia la src a un fallback cuando la imagen falla
 * @param {HTMLImageElement} imgElement - Elemento img del DOM
 * @param {number} pokemonId - ID del Pokémon para fallback
 * @returns {Function} Función manejadora de error
 * @example
 * const img = document.getElementById('pokemon-sprite');
 * img.addEventListener('error', createSpriteErrorHandler(img, 25));
 */
export function createSpriteErrorHandler(imgElement, pokemonId) {
    let attempts = 0;
    const maxAttempts = 2;

    return function handleSpriteError(event) {
        attempts++;
        console.warn(`⚠️ Sprite no cargó (intento ${attempts}/${maxAttempts})`);

        if (attempts < maxAttempts && imgElement) {
            // Intentar con artwork oficial como segundo intento
            const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
            imgElement.src = artworkUrl;
        } else if (imgElement) {
            // Último intento: sprite genérico SVG
            imgElement.src = getGenericFallbackSprite(pokemonId);
            imgElement.alt = 'Sprite no disponible';
        }
    };
}

/**
 * Precarga un sprite de Pokémon
 * @description Utiliza Image() para precargar la imagen en caché del navegador
 * @param {string} url - URL del sprite a precargar
 * @returns {Promise<void>} Promesa que resuelve cuando la imagen está cargada o falla
 * @example
 * await preloadSprite('https://example.com/sprite.png');
 */
export function preloadSprite(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
        img.src = url;
    });
}

/**
 * Precarga múltiples sprites de Pokémon en paralelo
 * @description Carga varios sprites en lotes paralelos para optimizar el rendimiento.
 * No falla si algún sprite no carga, simplemente lo cuenta como fallido.
 * @param {string[]} urls - Array de URLs de sprites a precargar
 * @param {number} [concurrency=5] - Número máximo de cargas simultáneas por lote
 * @returns {Promise<number>} Cantidad de sprites cargados exitosamente
 * @example
 * const urls = [
 *     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
 *     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
 *     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png'
 * ];
 * const loaded = await preloadSprites(urls, 3);
 * console.log(`Se cargaron ${loaded} sprites`);
 */
export async function preloadSprites(urls, concurrency = 5) {
    let loaded = 0;

    const batches = [];
    for (let i = 0; i < urls.length; i += concurrency) {
        batches.push(urls.slice(i, i + concurrency));
    }

    for (const batch of batches) {
        const results = await Promise.allSettled(
            batch.map(url => preloadSprite(url))
        );
        loaded += results.filter(r => r.status === 'fulfilled').length;
    }

    console.log(`📥 Precargados ${loaded}/${urls.length} sprites`);
    return loaded;
}

// exports por defecto
export default {
    PokemonData,
    fetchPokemon,
    fetchPokemonList,
    fetchMultiplePokemon,
    fetchRandomPokemon,
    fetchPokemonBySeed,
    getPokemonImage,
    clearMemoryCache,
    getCacheSize,
    fetchPokemonType,
    isValidPokemonId,
    withRetry,
    createSpriteErrorHandler,
    preloadSprite,
    preloadSprites,
    getGenericFallbackSprite
};
