/**
 * @fileoverview Configuración global para El Oráculo Pokémon
 * @description Constantes del sistema: claves de almacenamiento, URLs de API, datos de elementos zodiacales,
 * criterios de matching y utilidades para LocalStorage
 * @author Arquitectura Frontend
 * @version 1.0.0
 * @since 2026-05-12
 * @requires module:POKEAPI_CONFIG
 * @requires module:APP_CONFIG
 * @see {@link https://pokeapi.co/|PokéAPI}
 */

/**
 * @namespace CONFIG
 * @description Namespace principal que contiene toda la configuración global
 */

/**
 * @typedef {Object} StorageKeys
 * @description Claves utilizadas para LocalStorage
 * @property {string} USER_NAME - Clave para el nombre del usuario
 * @property {string} USER_BIRTHDATE - Clave para la fecha de nacimiento
 * @property {string} USER_SIGN - Clave para el signo zodiacal seleccionado
 * @property {string} LAST_CONSULT - Clave para la última fecha de consulta
 * @property {string} POKEMON_CACHE - Clave para el cache de Pokémon
 * @property {string} HOROSCOPE_CACHE - Clave para el cache de horóscopos
 */

/**
 * @type {StorageKeys}
 * @description Claves para el almacenamiento en LocalStorage
 */
export const STORAGE_KEYS = Object.freeze({
    USER_NAME: 'pokehoroscopo_username',
    USER_BIRTHDATE: 'pokehoroscopo_birthdate',
    USER_SIGN: 'pokehoroscopo_sign',
    LAST_CONSULT: 'pokehoroscopo_last_consult',
    POKEMON_CACHE: 'pokehoroscopo_pokemon_cache',
    HOROSCOPE_CACHE: 'pokehoroscopo_horoscope_cache',
    CACHE_TIMESTAMP: 'pokehoroscopo_cache_timestamp'
});

/**
 * @typedef {Object} ApiConfig
 * @description Configuración de URLs de APIs externas
 * @property {string} BASE_URL - URL base de PokéAPI
 * @property {string} POKEMON_ENDPOINT - Endpoint de Pokémon
 * @property {string} TYPE_ENDPOINT - Endpoint de tipos
 * @property {string} SPECIES_ENDPOINT - Endpoint de especies
 * @property {number} TOTAL_POKEMON - Total de Pokémon disponibles en la API
 */

/**
 * @type {ApiConfig}
 * @description URLs base de PokéAPI y configuración de endpoints
 */
export const POKEAPI_CONFIG = Object.freeze({
    BASE_URL: 'https://pokeapi.co/api/v2',
    POKEMON_ENDPOINT: '/pokemon',
    TYPE_ENDPOINT: '/type',
    SPECIES_ENDPOINT: '/pokemon-species',
    ABILITY_ENDPOINT: '/ability',
    TOTAL_POKEMON: 1025,
    SPRITE_URL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
});

/**
 * @typedef {Object} ElementRelations
 * @description Relaciones entre elementos zodiacales y tipos de Pokémon
 */
export const ELEMENT_RELATIONS = Object.freeze({
    Fuego: 'El fuego simboliza la pasión, la energía y la determinación. ¡Hoy brillas con intensidad!',
    Tierra: 'La tierra representa la estabilidad, la perseverancia y la paciencia. Tus fundamentos son sólidos.',
    Aire: 'El aire significa la libertad, la comunicación y la adaptabilidad. Las ideas fluyen hoy.',
    Agua: 'El agua embodies la intuición, las emociones y la transformación. Tu sensibilidad es tu fortaleza.'
});

/**
 * @typedef {Object} ZodiacElement
 * @description Datos de un elemento zodiacal
 * @property {string} name - Nombre del elemento
 * @property {string} symbol - Símbolo Unicode
 * @property {string[]} compatibleTypes - Tipos de Pokémon compatibles
 */

/**
 * @type {Object.<string, ZodiacElement>}
 * @description Mapeo de elementos zodiacales con sus tipos de Pokémon asociados
 */
export const ZODIAC_ELEMENTS = Object.freeze({
    Fuego: {
        name: 'Fuego',
        symbol: '🔥',
        compatibleTypes: ['fire', 'fighting', 'dragon']
    },
    Tierra: {
        name: 'Tierra',
        symbol: '🌍',
        compatibleTypes: ['ground', 'rock', 'steel', 'bug']
    },
    Aire: {
        name: 'Aire',
        symbol: '💨',
        compatibleTypes: ['flying', 'normal', 'psychic', 'fairy']
    },
    Agua: {
        name: 'Agua',
        symbol: '💧',
        compatibleTypes: ['water', 'ice', 'ghost', 'poison']
    }
});

/**
 * @typedef {Object} TagMatchCriteria
 * @description Criterios para hacer match entre tags y Pokémon
 * @property {string[]} types - Tipos de Pokémon que coinciden
 * @property {string[]} abilities - Habilidades que coinciden
 */

/**
 * @type {Object.<string, TagMatchCriteria>}
 * @description Criterios de matching para cada tag de horóscopo
 */
export const TAG_MATCH_CRITERIA = Object.freeze({
    Victoria: {
        types: ['fire', 'fighting', 'dragon', 'psychic'],
        abilities: ['victory-star', 'big-shock', 'moxie', 'unnerve']
    },
    Perseverancia: {
        types: ['steel', 'rock', 'ground'],
        abilities: ['sturdy', 'inner-focus', 'pressure', 'iron-barbs']
    },
    Transformación: {
        types: ['psychic', 'dragon', 'fairy'],
        abilities: ['protean', 'color-change', 'zen-mode', 'shields-down']
    },
    Equilibrio: {
        types: ['fairy', 'flying', 'normal'],
        abilities: ['levitate', 'synchronize', 'natural-cure', 'aroma-veil']
    },
    Introspección: {
        types: ['ghost', 'psychic', 'dark'],
        abilities: ['analytic', 'own-tempo', 'magician', 'shadow-shield']
    },
    Acción: {
        types: ['electric', 'normal', 'fighting'],
        abilities: ['speed-boost', 'unburden', 'quick-feet', 'download']
    }
});

/**
 * @typedef {Object} AppConfig
 * @description Configuración general de la aplicación
 * @property {number} CACHE_DURATION_MS - Duración del cache en milisegundos (24 horas)
 * @property {number} MAX_POKEMON_FETCH - Máximo de Pokémon a cargar
 * @property {number} ANIMATION_DURATION - Duración de animaciones en ms
 */

/**
 * @type {AppConfig}
 * @description Configuración general de la aplicación
 */
export const APP_CONFIG = Object.freeze({
    CACHE_DURATION_MS: 24 * 60 * 60 * 1000, // 24 horas
    MAX_POKEMON_FETCH: 151, // Primeros 151 Pokémon (generación clásica)
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 3000,
    HOROSCOPES_PER_SIGN: 365
});

/**
 * @typedef {Object} ColorPalette
 * @description Paleta de colores de la aplicación (referencia CSS)
 */

/**
 * @type {ColorPalette}
 * @description Paleta de colores para uso en JavaScript
 */
export const COLOR_PALETTE = Object.freeze({
    bgPrimary: '#1a1a2e',
    bgCard: '#16213e',
    accentPrimary: '#e94560',
    accentSecondary: '#0f3460',
    textPrimary: '#eaeaea',
    textSecondary: '#a0a0a0',
    accentGold: '#ffd700',
    accentGoldDark: '#b8860b'
});

/**
 * @typedef {Object} PokemonTypeColors
 * @description Colores asociados a cada tipo de Pokémon
 */

/**
 * @type {Object.<string, string>}
 * @description Mapeo de tipos de Pokémon a colores hexadecimales
 */
export const POKEMON_TYPE_COLORS = Object.freeze({
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    ghost: '#705898',
    dragon: '#7038F8',
    fairy: '#EE99AC',
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#A890F0',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    steel: '#B8B8D0',
    ice: '#98D8D8',
    dark: '#705848'
});

/**
 * Verifica si el cache ha expirado basado en la duración configurada
 * @description Compara el timestamp proporcionado con la hora actual y determina si ha pasado
 * más tiempo del establecido en APP_CONFIG.CACHE_DURATION_MS (24 horas por defecto)
 * @param {string|null} timestamp - Timestamp del cache almacenado en LocalStorage
 * @returns {boolean} True si el cache ha expirado o no existe timestamp, false si aún es válido
 * @example
 * // Cache expirado (sin timestamp)
 * isCacheExpired(null); // returns true
 *
 * // Cache válido (menos de 24 horas)
 * const recentTimestamp = Date.now().toString();
 * isCacheExpired(recentTimestamp); // returns false
 *
 * // Cache expirado (más de 24 horas)
 * const oldTimestamp = (Date.now() - 86400001).toString();
 * isCacheExpired(oldTimestamp); // returns true
 */
export function isCacheExpired(timestamp) {
    if (!timestamp) return true;
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    return cacheAge > APP_CONFIG.CACHE_DURATION_MS;
}

/**
 * Obtiene un elemento del LocalStorage de forma segura con manejo de errores
 * @description Recupera un valor almacenado en LocalStorage, lo parsea desde JSON y retorna
 * el valor correspondiente. Si ocurre un error o no existe la clave, retorna el valor por defecto.
 * @template T - Tipo genérico del valor esperado
 * @param {string} key - Clave del elemento a recuperar (debe ser una de las STORAGE_KEYS)
 * @param {T} defaultValue - Valor por defecto a retornar si no existe o hay error
 * @returns {T|null} El valor almacenado parsedo, o el valor por defecto si no existe/hay error
 * @throws {Error} Silencia errores y retorna el valor por defecto en su lugar
 * @example
 * // Obtener nombre de usuario
 * const username = getStorageItem(STORAGE_KEYS.USER_NAME, 'Invitado');
 * // returns: "Juan" (si existe) o "Invitado" (si no existe)
 *
 * // Obtener fecha de nacimiento
 * const birthdate = getStorageItem(STORAGE_KEYS.USER_BIRTHDATE, null);
 * // returns: "1990-05-15" (si existe) o null (si no existe)
 *
 * // Obtener objeto de cache
 * const cache = getStorageItem(STORAGE_KEYS.POKEMON_CACHE, {});
 * // returns: { ... } (si existe) o {} (si no existe)
 */
export function getStorageItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error al leer "${key}" de LocalStorage:`, error);
        return defaultValue;
    }
}

/**
 * Guarda un elemento en LocalStorage de forma segura con manejo de errores
 * @description Serializa el valor a JSON y lo almacena en LocalStorage. Retorna true si el
 * almacenamiento fue exitoso, false si ocurrió un error (ej: cuota de almacenamiento superada).
 * @param {string} key - Clave del elemento a guardar (debe ser una de las STORAGE_KEYS)
 * @param {*} value - Valor a guardar (será serializado a JSON, puede ser cualquier tipo serializable)
 * @returns {boolean} True si se guardó correctamente, false si hubo un error
 * @throws {Error} Silencia errores de cuota de almacenamiento o parseo y retorna false
 * @example
 * // Guardar nombre de usuario
 * setStorageItem(STORAGE_KEYS.USER_NAME, 'Juan'); // returns: true
 *
 * // Guardar signo zodiacal
 * setStorageItem(STORAGE_KEYS.USER_SIGN, 'Aries'); // returns: true
 *
 * // Guardar timestamp de cache
 * setStorageItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString()); // returns: true
 *
 * // Guardar objeto de cache (maneja quota exceeded)
 * const largeData = { data: [...Array(1000).keys()] };
 * setStorageItem(STORAGE_KEYS.POKEMON_CACHE, largeData); // returns: true o false
 */
export function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error al guardar "${key}" en LocalStorage:`, error);
        return false;
    }
}
