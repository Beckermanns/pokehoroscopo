/**
 * @fileoverview Módulo de gestión de LocalStorage para El Oráculo Pokémon
 * @description Proporciona funciones para guardar, cargar y gestionar datos
 * del usuario, cache de Pokémon y horóscopos usando LocalStorage del navegador.
 * Incluye limpieza automática, límites de almacenamiento y preferencias de usuario.
 * @author Arquitectura Frontend
 * @version 1.1.0
 * @since 2026-05-12
 * @requires module:CONFIG
 */

// ============================================================================
// CONSTANTES DE CONFIGURACIÓN
// ============================================================================

/**
 * Límites de almacenamiento
 * @type {Object}
 */
const STORAGE_LIMITS = {
    MAX_POKEMON_CACHE: 100,        // Máximo de Pokémon en cache
    MAX_CACHE_AGE_DAYS: 7,          // Días antes de limpiar cache viejo
    MAX_TOTAL_SIZE_MB: 4.5,         // Límite total (5MB - margen)
    WARNING_THRESHOLD_MB: 4         // Umbral de advertencia
};

/**
 * Claves de preferencias de usuario
 * @type {string}
 */
const PREFERENCES_KEY = 'pokehoroscopo_preferences';

/**
 * Valores por defecto de preferencias
 * @type {Object}
 */
const DEFAULT_PREFERENCES = {
    theme: 'dark',                  // 'dark' | 'light'
    animations: true,              // Habilitar/deshabilitar animaciones
    reducedMotion: false,          // Preferencias de accesibilidad
    notifications: true           // Notificaciones de nueva consulta
};

/**
 * @typedef {Object} UserProfile
 * @description Estructura del perfil de usuario guardado
 * @property {string} name - Nombre del usuario
 * @property {string} birthdate - Fecha de nacimiento (formato ISO)
 * @property {number} signId - ID del signo zodiacal
 * @property {string} signName - Nombre del signo
 * @property {string} lastVisit - Timestamp de última visita
 */

/**
 * @typedef {Object} CacheEntry
 * @description Estructura de una entrada de cache
 * @property {*} data - Datos guardados en cache
 * @property {string} timestamp - Timestamp de creación
 */

/**
 * @typedef {Object} StorageStats
 * @description Estadísticas del uso de LocalStorage
 * @property {number} usedSpace - Espacio usado en bytes aproximados
 * @property {number} keysCount - Cantidad de claves almacenadas
 * @property {boolean} isAvailable - Si LocalStorage está disponible
 */

// Clave interna para metadatos del cache
const CACHE_METADATA_KEY = '_pokehoroscopo_metadata';

// ============================================================================
// FUNCIONES DE LIMPIEZA AUTOMÁTICA
// ============================================================================

/**
 * Limpia automáticamente el cache antiguo
 * @description Remueve entradas de cache que superen la edad máxima configurada
 * y optimiza el almacenamiento si se acerca al límite
 * @returns {Object} Resultado de la limpieza
 */
export function autoCleanupCache() {
    const result = {
        pokemonCacheCleaned: false,
        horoscopeCacheCleaned: false,
        oldEntriesRemoved: 0,
        spaceReclaimed: 0,
        warnings: []
    };

    try {
        // Limpiar cache de Pokémon si es muy antiguo
        const pokemonAge = getPokemonCacheAge();
        if (pokemonAge !== null) {
            const maxAgeMs = STORAGE_LIMITS.MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000;
            if (pokemonAge > maxAgeMs) {
                clearPokemonCache();
                result.pokemonCacheCleaned = true;
                result.oldEntriesRemoved++;
                result.spaceReclaimed += estimatePokemonCacheSize();
                console.log('🧹 Cache de Pokémon limpio (demasiado antiguo)');
            }
        }

        // Verificar tamaño total y reclamar espacio si es necesario
        const stats = getStorageStats();
        if (stats.usedSpace > STORAGE_LIMITS.MAX_TOTAL_SIZE_MB * 1024 * 1024) {
            // Limpiar cache de horóscopos (son menos críticos)
            clearHoroscopeCache();
            result.horoscopeCacheCleaned = true;
            result.oldEntriesRemoved++;
            console.log('🧹 Cache de horóscopos limpio para liberar espacio');
        }

        // Verificar umbral de advertencia
        if (stats.usedSpace > STORAGE_LIMITS.WARNING_THRESHOLD_MB * 1024 * 1024) {
            result.warnings.push(`Uso de almacenamiento alto: ${formatBytes(stats.usedSpace)}`);
        }

    } catch (error) {
        console.error('Error en limpieza automática:', error);
    }

    return result;
}

/**
 * Estima el tamaño aproximado del cache de Pokémon
 * @description Calcula el tamaño en bytes multiplicando la longitud del string
 * JSON por 2 (estimación aproximada para codificación UTF-16)
 * @returns {number} Tamaño aproximado en bytes
 * @example
 * const size = estimatePokemonCacheSize();
 * console.log(`Cache: ${size} bytes`);
 */
function estimatePokemonCacheSize() {
    try {
        const data = localStorage.getItem('pokehoroscopo_pokemon_cache');
        return data ? data.length * 2 : 0;
    } catch {
        return 0;
    }
}

/**
 * Limpia entradas de cache por edad
 * @description Elimina cualquier cache que supere un tiempo específico
 * @param {number} maxAgeMs - Edad máxima en milisegundos
 * @returns {number} Cantidad de entradas eliminadas
 */
export function cleanupCacheByAge(maxAgeMs = STORAGE_LIMITS.MAX_CACHE_AGE_DAYS * 24 * 60 * 60 * 1000) {
    let removed = 0;

    // Verificar cache de Pokémon
    const pokemonAge = getPokemonCacheAge();
    if (pokemonAge !== null && pokemonAge > maxAgeMs) {
        clearPokemonCache();
        removed++;
    }

    // Verificar cache de horóscopos
    try {
        const data = localStorage.getItem('pokehoroscopo_horoscope_cache');
        if (data) {
            const cacheEntry = JSON.parse(data);
            const age = Date.now() - parseInt(cacheEntry.timestamp, 10);
            if (age > maxAgeMs) {
                clearHoroscopeCache();
                removed++;
            }
        }
    } catch {
        // Ignorar errores
    }

    return removed;
}

/**
 * Obtiene metadatos del cache
 * @description Lee los metadatos generales del cache desde LocalStorage.
 * Incluye versión, fecha de creación y última actualización.
 * Si no existen metadatos, retorna un objeto con valores por defecto
 * @returns {Object} Metadatos del cache {version, createdAt, lastUpdate}
 * @example
 * const metadata = getCacheMetadata();
 * console.log(metadata.version); // "1.0.0"
 * console.log(metadata.lastUpdate); // timestamp Unix
 */
function getCacheMetadata() {
    try {
        const data = localStorage.getItem(CACHE_METADATA_KEY);
        return data ? JSON.parse(data) : { version: '1.0.0', createdAt: Date.now() };
    } catch {
        return { version: '1.0.0', createdAt: Date.now() };
    }
}

/**
 * Guarda metadatos del cache
 * @description Fusiona los metadatos recibidos con los existentes usando spread operator,
 * y añade automáticamente un campo lastUpdate con el timestamp actual
 * @param {Object} metadata - Metadatos a guardar (se fusionan con los existentes)
 * @returns {void}
 * @example
 * setCacheMetadata({ pokemonCache: Date.now() });
 * // Actualiza solo el campo pokemonCache, mantiene versión y createdAt
 */
function setCacheMetadata(metadata) {
    try {
        localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify({
            ...getCacheMetadata(),
            ...metadata,
            lastUpdate: Date.now()
        }));
    } catch (error) {
        console.error('Error al guardar metadatos del cache:', error);
    }
}

// ============================================================================
// FUNCIONES DE PERFIL DE USUARIO
// ============================================================================

/**
 * Guarda el perfil del usuario en LocalStorage
 * @description Almacena el nombre, fecha de nacimiento y signo del usuario.
 * Valida que los datos sean correctos antes de guardar.
 * @param {UserProfile} profile - Objeto con datos del perfil
 * @returns {boolean} True si se guardó correctamente
 * @example
 * saveUserProfile({
 *     name: 'Juan',
 *     birthdate: '1990-05-15',
 *     signId: 5,
 *     signName: 'Leo'
 * });
 */
export function saveUserProfile(profile) {
    if (!profile || typeof profile !== 'object') {
        console.error('Perfil inválido: debe ser un objeto');
        return false;
    }

    try {
        const userProfile = {
            name: profile.name || '',
            birthdate: profile.birthdate || '',
            signId: profile.signId || null,
            signName: profile.signName || '',
            lastVisit: Date.now().toString()
        };

        localStorage.setItem('pokehoroscopo_user_profile', JSON.stringify(userProfile));
        return true;
    } catch (error) {
        console.error('Error al guardar perfil de usuario:', error);
        return false;
    }
}

/**
 * Carga el perfil del usuario desde LocalStorage
 * @description Recupera el perfil guardado previamente. Si no existe,
 * retorna null.
 * @returns {UserProfile|null} Perfil del usuario o null si no existe
 * @example
 * const profile = loadUserProfile();
 * if (profile) {
 *     console.log(`Bienvenido, ${profile.name}`);
 * }
 */
export function loadUserProfile() {
    try {
        const data = localStorage.getItem('pokehoroscopo_user_profile');
        if (!data) return null;
        
        const profile = JSON.parse(data);
        // Validar estructura mínima
        if (!profile || typeof profile !== 'object') return null;
        
        return profile;
    } catch (error) {
        console.error('Error al cargar perfil de usuario:', error);
        return null;
    }
}

/**
 * Verifica si existe un perfil de usuario guardado
 * @returns {boolean} True si existe perfil guardado
 */
export function hasUserProfile() {
    return localStorage.getItem('pokehoroscopo_user_profile') !== null;
}

/**
 * Limpia todos los datos del usuario del LocalStorage
 * @description Remueve el perfil de usuario y datos relacionados
 * @returns {boolean} True si se borró correctamente
 */
export function clearUserData() {
    try {
        const keysToRemove = [
            'pokehoroscopo_user_profile',
            'pokehoroscopo_last_consult',
            'pokehoroscopo_sign'
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        return true;
    } catch (error) {
        console.error('Error al limpiar datos de usuario:', error);
        return false;
    }
}

// ============================================================================
// FUNCIONES DE CACHE DE POKÉMON
// ============================================================================

/**
 * Guarda datos de Pokémon en cache
 * @description Almacena un array de Pokémon con timestamp para control de expiración
 * @param {Array} pokemons - Array de datos de Pokémon
 * @returns {boolean} True si se guardó correctamente
 * @example
 * const pokemonData = [pikachu, charizard, bulbasaur];
 * savePokemonCache(pokemonData);
 */
export function savePokemonCache(pokemons) {
    if (!Array.isArray(pokemons)) {
        console.error('Datos de Pokémon inválidos: debe ser un array');
        return false;
    }

    try {
        const cacheEntry = {
            data: pokemons,
            timestamp: Date.now().toString(),
            count: pokemons.length
        };

        localStorage.setItem('pokehoroscopo_pokemon_cache', JSON.stringify(cacheEntry));
        setCacheMetadata({ pokemonCache: Date.now() });
        return true;
    } catch (error) {
        console.error('Error al guardar cache de Pokémon:', error);
        return false;
    }
}

/**
 * Carga datos de Pokémon desde cache
 * @description Recupera los Pokémon guardados en cache
 * @returns {Array|null} Array de Pokémon o null si no existe/expiró
 */
export function loadPokemonCache() {
    try {
        const data = localStorage.getItem('pokehoroscopo_pokemon_cache');
        if (!data) return null;

        const cacheEntry = JSON.parse(data);
        return cacheEntry.data || null;
    } catch (error) {
        console.error('Error al cargar cache de Pokémon:', error);
        return null;
    }
}

/**
 * Verifica si el cache de Pokémon es válido y no ha expirado
 * @description Compara el timestamp del cache con la duración configurada
 * @param {number} [durationMs=24h] - Duración máxima del cache en ms
 * @returns {boolean} True si el cache es válido y no ha expirado
 * @example
 * if (isCacheValid()) {
 *     // Usar cache
 * } else {
 *     // Obtener datos frescos
 * }
 */
export function isCacheValid(durationMs = 24 * 60 * 60 * 1000) {
    try {
        const data = localStorage.getItem('pokehoroscopo_pokemon_cache');
        if (!data) return false;

        const cacheEntry = JSON.parse(data);
        if (!cacheEntry.timestamp) return false;

        const cacheAge = Date.now() - parseInt(cacheEntry.timestamp, 10);
        return cacheAge < durationMs;
    } catch (error) {
        console.error('Error al verificar cache:', error);
        return false;
    }
}

/**
 * Obtiene la edad del cache de Pokémon en milisegundos
 * @returns {number|null} Edad del cache en ms, o null si no existe
 */
export function getPokemonCacheAge() {
    try {
        const data = localStorage.getItem('pokehoroscopo_pokemon_cache');
        if (!data) return null;

        const cacheEntry = JSON.parse(data);
        if (!cacheEntry.timestamp) return null;

        return Date.now() - parseInt(cacheEntry.timestamp, 10);
    } catch {
        return null;
    }
}

/**
 * Limpia el cache de Pokémon
 * @returns {boolean} True si se borró correctamente
 */
export function clearPokemonCache() {
    try {
        localStorage.removeItem('pokehoroscopo_pokemon_cache');
        return true;
    } catch (error) {
        console.error('Error al limpiar cache de Pokémon:', error);
        return false;
    }
}

// ============================================================================
// FUNCIONES DE CACHE DE HORÓSCOPOS
// ============================================================================

/**
 * Guarda cache de horóscopos
 * @description Almacena horóscopos seleccionados con timestamp
 * @param {Object} horoscopes - Objeto con horóscopos por signo
 * @returns {boolean} True si se guardó correctamente
 */
export function saveHoroscopeCache(horoscopes) {
    if (!horoscopes || typeof horoscopes !== 'object') {
        console.error('Datos de horóscopos inválidos');
        return false;
    }

    try {
        const cacheEntry = {
            data: horoscopes,
            timestamp: Date.now().toString()
        };

        localStorage.setItem('pokehoroscopo_horoscope_cache', JSON.stringify(cacheEntry));
        setCacheMetadata({ horoscopeCache: Date.now() });
        return true;
    } catch (error) {
        console.error('Error al guardar cache de horóscopos:', error);
        return false;
    }
}

/**
 * Carga cache de horóscopos
 * @returns {Object|null} Horóscopos guardados o null
 */
export function loadHoroscopeCache() {
    try {
        const data = localStorage.getItem('pokehoroscopo_horoscope_cache');
        if (!data) return null;

        const cacheEntry = JSON.parse(data);
        return cacheEntry.data || null;
    } catch (error) {
        console.error('Error al cargar cache de horóscopos:', error);
        return null;
    }
}

/**
 * Verifica si el cache de horóscopos es válido
 * @param {number} [durationMs=1h] - Duración máxima en ms (por defecto 1 hora)
 * @returns {boolean} True si el cache es válido
 */
export function isHoroscopeCacheValid(durationMs = 60 * 60 * 1000) {
    try {
        const data = localStorage.getItem('pokehoroscopo_horoscope_cache');
        if (!data) return false;

        const cacheEntry = JSON.parse(data);
        if (!cacheEntry.timestamp) return false;

        const cacheAge = Date.now() - parseInt(cacheEntry.timestamp, 10);
        return cacheAge < durationMs;
    } catch {
        return false;
    }
}

/**
 * Limpia el cache de horóscopos
 * @returns {boolean} True si se borró correctamente
 */
export function clearHoroscopeCache() {
    try {
        localStorage.removeItem('pokehoroscopo_horoscope_cache');
        return true;
    } catch (error) {
        console.error('Error al limpiar cache de horóscopos:', error);
        return false;
    }
}

// ============================================================================
// FUNCIONES DE EXPORTACIÓN/IMPORTACIÓN
// ============================================================================

/**
 * Exporta todos los datos del usuario para backup
 * @description Crea un objeto JSON con todos los datos del usuario
 * @returns {Object|null} Objeto con datos exportados o null si hay error
 * @example
 * const backup = exportUserData();
 * // Guardar en archivo o enviar a servidor
 */
export function exportUserData() {
    try {
        const exportData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            userProfile: loadUserProfile(),
            horoscopeCache: loadHoroscopeCache(),
            metadata: getCacheMetadata()
        };

        return exportData;
    } catch (error) {
        console.error('Error al exportar datos de usuario:', error);
        return null;
    }
}

/**
 * Importa datos de usuario desde un backup
 * @description Restaura los datos del usuario desde un objeto JSON
 * @param {Object} importData - Datos a importar
 * @param {Object} [options] - Opciones de importación
 * @param {boolean} [options.merge=false] - Si combina con datos existentes
 * @returns {boolean} True si se importó correctamente
 * @example
 * importUserData(backupData);
 */
export function importUserData(importData, options = {}) {
    if (!importData || typeof importData !== 'object') {
        console.error('Datos de importación inválidos');
        return false;
    }

    try {
        // Importar perfil de usuario
        if (importData.userProfile) {
            if (options.merge) {
                // Combinar con datos existentes
                const current = loadUserProfile();
                saveUserProfile({
                    ...current,
                    ...importData.userProfile
                });
            } else {
                saveUserProfile(importData.userProfile);
            }
        }

        // Importar cache de horóscopos
        if (importData.horoscopeCache) {
            saveHoroscopeCache(importData.horoscopeCache);
        }

        // Actualizar metadatos
        setCacheMetadata({
            lastImport: Date.now(),
            importSource: importData.version || 'unknown'
        });

        return true;
    } catch (error) {
        console.error('Error al importar datos de usuario:', error);
        return false;
    }
}

/**
 * Genera un archivo JSON para descarga de backup
 * @description Crea un blob y genera link de descarga
 * @returns {void}
 */
export function downloadUserDataBackup() {
    const data = exportUserData();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokehoroscopo_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Lee un archivo JSON de backup
 * @description Utiliza FileReader para leer y parsear un archivo JSON de backup
 * @param {File} file - Archivo a leer
 * @returns {Promise<Object|null>} Datos parseados o null si hay error
 * @throws {Error} Si el archivo no es JSON o hay error de lectura
 * @example
 * const input = document.querySelector('input[type="file"]');
 * input.addEventListener('change', async (e) => {
 *     const data = await readBackupFile(e.target.files[0]);
 *     await importUserData(data);
 * });
 */
export function readBackupFile(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.includes('json')) {
            reject(new Error('El archivo debe ser JSON'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Error al parsear el archivo JSON'));
            }
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsText(file);
    });
}

// ============================================================================
// FUNCIONES DE ESTADÍSTICAS Y LIMPIEZA GENERAL
// ============================================================================

/**
 * Obtiene estadísticas del uso de LocalStorage
 * @returns {StorageStats} Estadísticas del storage
 */
export function getStorageStats() {
    try {
        let totalSize = 0;
        let keysCount = 0;

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('pokehoroscopo')) {
                const value = localStorage.getItem(key);
                totalSize += (key.length + value.length) * 2; // UTF-16
                keysCount++;
            }
        }

        return {
            usedSpace: totalSize,
            keysCount: keysCount,
            isAvailable: true
        };
    } catch (error) {
        return {
            usedSpace: 0,
            keysCount: 0,
            isAvailable: false
        };
    }
}

/**
 * Formatea bytes a string legible
 * @param {number} bytes - Cantidad de bytes
 * @returns {string} Bytes formateados
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Limpia todos los datos de la aplicación del LocalStorage
 * @description Remueve TODOS los datos guardados por la aplicación
 * @returns {boolean} True si se borró correctamente
 */
export function clearAllAppData() {
    try {
        const keysToRemove = [];
        
        for (let key in localStorage) {
            if (key.startsWith('pokehoroscopo') || key.startsWith('_pokehoroscopo')) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        return true;
    } catch (error) {
        console.error('Error al limpiar todos los datos:', error);
        return false;
    }
}

/**
 * Verifica si LocalStorage está disponible
 * @returns {boolean} True si está disponible
 */
export function isStorageAvailable() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

// ============================================================================
// FUNCIONES DE PREFERENCIAS DE USUARIO
// ============================================================================

/**
 * Obtiene las preferencias del usuario
 * @description Recupera las preferencias guardadas, fusionando con valores por defecto
 * @returns {Object} Objeto de preferencias
 * @example
 * const prefs = getUserPreferences();
 * console.log(prefs.theme); // "dark" o el valor guardado
 */
export function getUserPreferences() {
    try {
        const stored = localStorage.getItem(PREFERENCES_KEY);
        if (stored) {
            return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        }
        return { ...DEFAULT_PREFERENCES };
    } catch (error) {
        console.error('Error al cargar preferencias:', error);
        return { ...DEFAULT_PREFERENCES };
    }
}

/**
 * Guarda las preferencias del usuario
 * @description Actualiza las preferencias, preservando las existentes
 * @param {Object} preferences - Preferencias a guardar (parcial)
 * @returns {boolean} True si se guardó correctamente
 * @example
 * saveUserPreferences({ theme: 'light', animations: false });
 */
export function saveUserPreferences(preferences) {
    try {
        const current = getUserPreferences();
        const updated = { ...current, ...preferences };
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));

        // Aplicar preferencias inmediatamente
        applyPreferences(updated);

        return true;
    } catch (error) {
        console.error('Error al guardar preferencias:', error);
        return false;
    }
}

/**
 * Aplica las preferencias al DOM y CSS
 * @description Modifica las clases del elemento root (document.documentElement)
 * según las preferencias: theme (dark/light), reducedMotion y animations.
 * Estas clases CSS controlan los estilos globales de la aplicación
 * @param {Object} preferences - Objeto con preferencias (theme, reducedMotion, animations)
 * @returns {void}
 * @example
 * applyPreferences({ theme: 'light', reducedMotion: true, animations: false });
 */
function applyPreferences(preferences) {
    const root = document.documentElement;

    // Tema
    if (preferences.theme === 'light') {
        root.classList.add('theme-light');
        root.classList.remove('theme-dark');
    } else {
        root.classList.add('theme-dark');
        root.classList.remove('theme-light');
    }

    // Reducir movimiento
    if (preferences.reducedMotion) {
        root.classList.add('reduce-motion');
    } else {
        root.classList.remove('reduce-motion');
    }

    // Animaciones
    if (!preferences.animations) {
        root.classList.add('disable-animations');
    } else {
        root.classList.remove('disable-animations');
    }
}

/**
 * Restablece las preferencias a sus valores por defecto
 * @returns {boolean} True si se restableció correctamente
 */
export function resetUserPreferences() {
    return saveUserPreferences(DEFAULT_PREFERENCES);
}

/**
 * Inicializa las preferencias al cargar la aplicación
 * @description Debe llamarse al iniciar la app para aplicar preferencias guardadas
 */
export function initializePreferences() {
    const preferences = getUserPreferences();
    applyPreferences(preferences);
    return preferences;
}

// exports por defecto
export default {
    saveUserProfile,
    loadUserProfile,
    hasUserProfile,
    clearUserData,
    savePokemonCache,
    loadPokemonCache,
    isCacheValid,
    getPokemonCacheAge,
    clearPokemonCache,
    saveHoroscopeCache,
    loadHoroscopeCache,
    isHoroscopeCacheValid,
    clearHoroscopeCache,
    exportUserData,
    importUserData,
    downloadUserDataBackup,
    readBackupFile,
    getStorageStats,
    formatBytes,
    clearAllAppData,
    isStorageAvailable,
    autoCleanupCache,
    cleanupCacheByAge,
    getUserPreferences,
    saveUserPreferences,
    resetUserPreferences,
    initializePreferences
};
