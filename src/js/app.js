/**
 * @fileoverview Controlador principal de El Oráculo Pokémon
 * @description Orquestación de todos los módulos, gestión de vistas, manejo de eventos
 * del DOM e inicialización de la aplicación
 * @author Arquitectura Frontend
 * @version 1.1.0
 * @since 2026-05-12
 * @requires module:CONFIG
 * @requires module:ZODIAC
 * @requires module:HOROSCOPES
 * @requires module:POKEMON
 * @requires module:STORAGE
 * @requires module:MATCH
 */

/**
 * @typedef {Object} AppState
 * @description Estado global de la aplicación
 * @property {string} currentView - Vista actualmente activa
 * @property {Object|null} userProfile - Perfil del usuario
 * @property {Object|null} currentSign - Signo zodiacal actual
 * @property {Object|null} currentHoroscope - Horóscopo del día
 * @property {Object|null} currentPokemon - Pokémon del día
 * @property {Array} pokemonPool - Pool de Pokémon cargados
 * @property {boolean} isLoading - Si la aplicación está cargando datos
 */

import { APP_CONFIG, POKEAPI_CONFIG, COLOR_PALETTE, POKEMON_TYPE_COLORS } from './config.js';
import { ZODIAC_SIGNS, calculateZodiacSign, getZodiacById, renderZodiacGrid } from './zodiac.js';
import { getHoroscopeBySignAndDate, getAvailableTags, hashCode } from './horoscopes.js';
import { fetchPokemon, fetchPokemonList, fetchPokemonBySeed, PokemonData, createSpriteErrorHandler } from './pokemon.js';
import {
    saveUserProfile,
    loadUserProfile,
    hasUserProfile,
    loadPokemonCache,
    savePokemonCache,
    isCacheValid,
    clearPokemonCache,
    clearHoroscopeCache,
    autoCleanupCache,
    initializePreferences,
    getUserPreferences,
    saveUserPreferences,
    downloadUserDataBackup,
    isStorageAvailable
} from './storage.js';
import { findMatchingPokemon, generateJustification, calculateMatchScore } from './match.js';

/**
 * Estado global de la aplicación
 * @type {AppState}
 */
const state = {
    currentView: 'setup',
    userProfile: null,
    currentSign: null,
    currentHoroscope: null,
    currentPokemon: null,
    pokemonPool: [],
    isLoading: false,
    initialized: false,
    settingsOpen: false
};

/**
 * Elementos del DOM cacheados para mejor rendimiento
 * @type {Object}
 */
const elements = {};

/**
 * Referencia al manejador de error del sprite
 * @type {Function|null}
 */
let spriteErrorHandler = null;

/**
 * Inicializa la aplicación
 * @description Función principal que configura la aplicación, carga datos
 * guardados y renderiza la interfaz inicial
 * @returns {Promise<void>}
 * @example
 * document.addEventListener('DOMContentLoaded', initApp);
 */
export async function initApp() {
    try {
        console.log('🔮 Inicializando El Oráculo Pokémon...');

        // Cachear elementos del DOM
        cacheElements();

        // Verificar disponibilidad de LocalStorage
        if (!isStorageAvailable()) {
            console.warn('LocalStorage no disponible, la aplicación funcionará sin persistencia');
        }

        // Inicializar preferencias del usuario
        initializePreferences();

        // Limpieza automática de cache antiguo
        const cleanupResult = autoCleanupCache();
        if (cleanupResult.oldEntriesRemoved > 0) {
            console.log('🧹 Limpieza automática realizada:', cleanupResult);
        }

        // Cargar perfil de usuario existente
        loadUserProfileFromStorage();

        // Renderizar grilla de signos zodiacales
        renderZodiacGridUI();

        // Cargar pool de Pokémon (con fallback si falla)
        try {
            await loadPokemonPool();
        } catch (pokemonError) {
            console.warn('⚠️ Error cargando Pokémon, usando fallback:', pokemonError);
            state.pokemonPool = getHardcodedPokemonPool();
        }

        // Configurar event listeners
        setupEventListeners();

        // Configurar panel de ajustes
        setupSettingsPanel();

        // Verificar si hay perfil existente para mostrar horóscopo
        if (state.userProfile && state.userProfile.signId) {
            const savedSign = getZodiacById(state.userProfile.signId);
            if (savedSign) {
                state.currentSign = savedSign;
                showView('horoscope');
                await displayHoroscope(savedSign);
            }
        } else {
            showView('setup');
        }

        state.initialized = true;
        console.log('✨ Oráculo Pokémon inicializado correctamente');

    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
        handleError('Error al cargar la aplicación. Por favor, recarga la página.');
    }
}

/**
 * Cachea los elementos del DOM para uso posterior
 * @description Selecciona y guarda referencias a elementos frecuentemente usados
 */
function cacheElements() {
    elements.setupView = document.getElementById('setup-view');
    elements.zodiacSelectorView = document.getElementById('zodiac-selector-view');
    elements.horoscopeView = document.getElementById('horoscope-view');
    elements.setupForm = document.getElementById('setup-form');
    elements.userNameInput = document.getElementById('user-name');
    elements.birthdateInput = document.getElementById('birthdate');
    elements.zodiacGrid = document.getElementById('zodiac-grid');
    elements.userGreeting = document.getElementById('user-greeting');
    elements.signSymbol = document.getElementById('sign-symbol');
    elements.signName = document.getElementById('sign-name');
    elements.currentDate = document.getElementById('current-date');
    elements.horoscopeContent = document.getElementById('horoscope-content');
    elements.tag1 = document.getElementById('tag-1');
    elements.tag2 = document.getElementById('tag-2');
    elements.pokemonSprite = document.getElementById('pokemon-sprite');
    elements.pokemonName = document.getElementById('pokemon-name');
    elements.pokemonTypes = document.getElementById('pokemon-types');
    elements.pokemonJustification = document.getElementById('pokemon-justification');
    elements.pokemonSpriteStatus = document.getElementById('pokemon-sprite-status');
    elements.btnConsultOther = document.getElementById('btn-consult-other');
    elements.btnBackToProfile = document.getElementById('btn-back-to-profile');
    elements.btnConsultOtherSign = document.getElementById('btn-consult-other-sign');
    elements.btnEditProfile = document.getElementById('btn-edit-profile');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    elements.loadingProgressBar = document.getElementById('loading-progress-bar');
    elements.zodiacSelectorGrid = document.getElementById('zodiac-selector-grid');
    elements.toastContainer = document.getElementById('toast-container');

    // Settings panel
    elements.settingsPanel = document.getElementById('settings-panel');
    elements.settingsOverlay = document.getElementById('settings-overlay');
    elements.btnSettings = document.getElementById('btn-settings');
    elements.btnCloseSettings = document.getElementById('btn-close-settings');
    elements.toggleTheme = document.getElementById('toggle-theme');
    elements.toggleAnimations = document.getElementById('toggle-animations');
    elements.toggleReducedMotion = document.getElementById('toggle-reduced-motion');
    elements.btnClearCache = document.getElementById('btn-clear-cache');
    elements.btnExportData = document.getElementById('btn-export-data');

    // Share buttons
    elements.btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
    elements.btnShareFacebook = document.getElementById('btn-share-facebook');
    elements.btnShareTwitter = document.getElementById('btn-share-twitter');
    elements.btnShareCopy = document.getElementById('btn-share-copy');
}

/**
 * Carga el perfil de usuario desde LocalStorage
 * @description Recupera el perfil guardado y actualiza el estado
 */
function loadUserProfileFromStorage() {
    if (hasUserProfile()) {
        state.userProfile = loadUserProfile();
        console.log('📁 Perfil de usuario cargado:', state.userProfile);
        
        // Pre-llenar campos del formulario
        if (elements.userNameInput && state.userProfile.name) {
            elements.userNameInput.value = state.userProfile.name;
        }
        if (elements.birthdateInput && state.userProfile.birthdate) {
            elements.birthdateInput.value = state.userProfile.birthdate;
        }
    }
}

/**
 * Renderiza la grilla de signos zodiacales en el DOM
 * @description Genera los botones de signos y los inserta en los contenedores
 */
function renderZodiacGridUI() {
    // Grilla del formulario de setup
    if (elements.zodiacGrid) {
        elements.zodiacGrid.innerHTML = ZODIAC_SIGNS.map(sign => `
            <button type="button" 
                    class="zodiac-item" 
                    data-sign-id="${sign.id}"
                    data-element="${sign.element}"
                    aria-label="Seleccionar ${sign.name}">
                <span class="zodiac-symbol">${sign.symbol}</span>
                <span class="zodiac-name">${sign.name}</span>
                <span class="zodiac-dates">${sign.dates}</span>
            </button>
        `).join('');
    }
    
    // Grilla del selector de signos
    if (elements.zodiacSelectorGrid) {
        elements.zodiacSelectorGrid.innerHTML = ZODIAC_SIGNS.map(sign => `
            <button type="button" 
                    class="zodiac-item zodiac-item-large" 
                    data-sign-id="${sign.id}"
                    data-element="${sign.element}"
                    aria-label="Consultar ${sign.name}">
                <span class="zodiac-symbol">${sign.symbol}</span>
                <span class="zodiac-name">${sign.name}</span>
            </button>
        `).join('');
    }
}

/**
 * Configura los event listeners de la aplicación
 * @description Vincula todos los manejadores de eventos a sus elementos correspondientes
 */
function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Botón de enviar formulario
    const submitBtn = document.getElementById('btn-submit-form');
    console.log('🔘 Botón submit encontrado:', submitBtn);
    if (submitBtn) {
        submitBtn.addEventListener('click', (event) => {
            console.log('🖱️ Click en botón detectado');
            event.preventDefault();
            event.stopPropagation();
            const fakeEvent = {
                preventDefault: () => {},
                stopPropagation: () => {},
                target: elements.setupForm
            };
            handleFormSubmit(fakeEvent);
        });
    } else {
        console.error('❌ Botón btn-submit-form NO ENCONTRADO');
    }
    
    // Formulario de setup (fallback)
    if (elements.setupForm) {
        elements.setupForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Input de fecha de nacimiento - calcular signo automáticamente
    if (elements.birthdateInput) {
        elements.birthdateInput.addEventListener('change', handleBirthdateChange);
    }
    
    // Botón de consultar otro signo (desde setup)
    if (elements.btnConsultOther) {
        elements.btnConsultOther.addEventListener('click', () => {
            showView('zodiac-selector');
        });
    }
    
    // Botón volver a perfil
    if (elements.btnBackToProfile) {
        elements.btnBackToProfile.addEventListener('click', () => {
            if (state.userProfile && state.userProfile.signId) {
                const sign = getZodiacById(state.userProfile.signId);
                if (sign) {
                    showView('horoscope');
                    displayHoroscope(sign);
                } else {
                    showView('setup');
                }
            } else {
                showView('setup');
            }
        });
    }
    
    // Botón consultar otro signo (desde horóscopo)
    if (elements.btnConsultOtherSign) {
        elements.btnConsultOtherSign.addEventListener('click', () => {
            showView('zodiac-selector');
        });
    }
    
    // Botón editar perfil
    if (elements.btnEditProfile) {
        elements.btnEditProfile.addEventListener('click', () => {
            showView('setup');
        });
    }
    
    // Delegar clicks en las grillas de signos
    document.addEventListener('click', handleZodiacGridClick);

    // Share buttons
    if (elements.btnShareWhatsapp) {
        elements.btnShareWhatsapp.addEventListener('click', () => shareViaNative() || shareToWhatsApp());
    }
    if (elements.btnShareFacebook) {
        elements.btnShareFacebook.addEventListener('click', () => shareViaNative() || shareToFacebook());
    }
    if (elements.btnShareTwitter) {
        elements.btnShareTwitter.addEventListener('click', () => shareViaNative() || shareToTwitter());
    }
    if (elements.btnShareCopy) {
        elements.btnShareCopy.addEventListener('click', copyToClipboard);
    }
}

/**
 * Maneja los clicks en las grillas de signos (delegación de eventos)
 * @param {Event} event - Evento de click
 */
function handleZodiacGridClick(event) {
    const zodiacButton = event.target.closest('.zodiac-item');
    if (!zodiacButton) return;
    
    const signId = parseInt(zodiacButton.dataset.signId, 10);
    if (!signId) return;
    
    const sign = getZodiacById(signId);
    if (!sign) return;
    
    // Si estamos en el selector de signos, consultar ese signo
    if (elements.zodiacSelectorView && !elements.zodiacSelectorView.classList.contains('hidden')) {
        state.currentSign = sign;
        showView('horoscope');
        displayHoroscope(sign);
    } else if (elements.zodiacGrid && elements.setupView && !elements.setupView.classList.contains('hidden')) {
        // Estamos en setup, solo seleccionar el signo visualmente
        selectZodiacSign(signId);
    }
}

/**
 * Maneja el envío del formulario de setup
 * @param {Event} event - Evento de submit
 * @returns {Promise<void>}
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('📝 handleFormSubmit iniciado');
    
    try {
        const formData = new FormData(event.target);
        const userName = formData.get('userName')?.toString().trim() || '';
        const birthdate = formData.get('birthdate')?.toString().trim() || '';
        
        // Verificar si hay un signo seleccionado manualmente
        const selectedSignButton = elements.zodiacGrid?.querySelector('.zodiac-item.selected');
        let selectedSignId = selectedSignButton ? parseInt(selectedSignButton.dataset.signId, 10) : null;
        console.log('📋 Signo seleccionado manualmente:', selectedSignId);
        
        // Si hay fecha de nacimiento, calcular el signo
        if (birthdate) {
            console.log('📅 Fecha de nacimiento:', birthdate);
            const dateObj = new Date(birthdate);
            console.log('📅 Objeto fecha:', dateObj, 'isNaN:', isNaN(dateObj.getTime()));
            if (!isNaN(dateObj.getTime())) {
                const calculatedSign = calculateZodiacSign(dateObj.getMonth() + 1, dateObj.getDate());
                console.log('🔮 Signo calculado:', calculatedSign);
                if (calculatedSign) {
                    selectedSignId = calculatedSign.id;
                    // Resaltar el signo calculado
                    selectZodiacSign(selectedSignId);
                }
            }
        }
        
        // Validar que haya un signo
        if (!selectedSignId) {
            console.warn('⚠️ No hay signo seleccionado');
            handleError('Por favor, selecciona tu signo zodiacal o ingresa tu fecha de nacimiento.');
            return;
        }
        
        const sign = getZodiacById(selectedSignId);
        if (!sign) {
            handleError('Signo zodiacal no válido.');
            return;
        }
        
        // Guardar perfil
        state.userProfile = {
            name: userName,
            birthdate: birthdate,
            signId: selectedSignId,
            signName: sign.name,
            lastVisit: Date.now().toString()
        };
        
        saveUserProfile(state.userProfile);
        
        // Mostrar horóscopo
        state.currentSign = sign;
        showView('horoscope');
        await displayHoroscope(sign);
        
    } catch (error) {
        console.error('Error al procesar formulario:', error);
        handleError('Error al procesar tu información. Por favor, intenta de nuevo.');
    }
}

/**
 * Maneja el cambio en el campo de fecha de nacimiento
 * @param {Event} event - Evento de cambio
 */
function handleBirthdateChange(event) {
    const birthdate = event.target.value;
    if (!birthdate) return;
    
    const dateObj = new Date(birthdate);
    if (isNaN(dateObj.getTime())) return;
    
    const sign = calculateZodiacSign(dateObj.getMonth() + 1, dateObj.getDate());
    if (sign) {
        selectZodiacSign(sign.id);
    }
}

/**
 * Selecciona visualmente un signo en la grilla
 * @param {number} signId - ID del signo a seleccionar
 */
function selectZodiacSign(signId) {
    const buttons = elements.zodiacGrid?.querySelectorAll('.zodiac-item');
    if (!buttons) return;
    
    buttons.forEach(button => {
        const buttonSignId = parseInt(button.dataset.signId, 10);
        if (buttonSignId === signId) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}

/**
 * Muestra una vista específica ocultando las demás
 * @description Controla la visibilidad de las vistas de la aplicación.
 * Oculta todas las vistas y muestra solo la solicitada.
 * @param {string} viewName - Nombre de la vista a mostrar ('setup', 'zodiac-selector', 'horoscope')
 * @returns {void}
 * @example
 * // Mostrar la vista de horóscopo
 * showView('horoscope');
 * 
 * // Mostrar el selector de signos
 * showView('zodiac-selector');
 */
export function showView(viewName) {
    const views = {
        'setup': elements.setupView,
        'zodiac-selector': elements.zodiacSelectorView,
        'horoscope': elements.horoscopeView
    };
    
    // Ocultar todas las vistas
    Object.values(views).forEach(view => {
        if (view) {
            view.classList.add('hidden');
        }
    });
    
    // Mostrar la vista solicitada
    const targetView = views[viewName];
    if (targetView) {
        targetView.classList.remove('hidden');
        state.currentView = viewName;
    } else {
        console.warn(`Vista "${viewName}" no encontrada`);
    }
}

/**
 * Oculta una vista específica
 * @description Añade la clase 'hidden' a la vista especificada
 * para ocultarla de la interfaz de usuario.
 * @param {string} viewName - Nombre de la vista a ocultar ('setup', 'zodiac-selector', 'horoscope')
 * @returns {void}
 * @example
 * // Ocultar la vista de horóscopo
 * hideView('horoscope');
 *
 * // Ocultar el selector de signos
 * hideView('zodiac-selector');
 */
export function hideView(viewName) {
    const views = {
        'setup': elements.setupView,
        'zodiac-selector': elements.zodiacSelectorView,
        'horoscope': elements.horoscopeView
    };
    
    const view = views[viewName];
    if (view) {
        view.classList.add('hidden');
    }
}

/**
 * Carga el pool de Pokémon desde cache o API
 * @description Intenta cargar desde LocalStorage, si no existe o expiró,
 * obtiene los datos de la PokéAPI
 * @returns {Promise<Array>} Array de Pokémon
 */
async function loadPokemonPool() {
    // Intentar cargar desde cache
    if (isCacheValid() && state.pokemonPool.length > 0) {
        console.log('📦 Cargando Pokémon desde cache...');
        return state.pokemonPool;
    }
    
    // Intentar cargar desde LocalStorage
    const cachedPokemon = loadPokemonCache();
    if (cachedPokemon && Array.isArray(cachedPokemon) && cachedPokemon.length > 0) {
        console.log('📁 Cargando Pokémon desde LocalStorage...');
        state.pokemonPool = cachedPokemon.map(p => new PokemonData(p));
        return state.pokemonPool;
    }
    
    // Obtener de la API
    console.log('🌐 Obteniendo Pokémon desde PokéAPI...');
    showLoading(true);
    
    try {
        // Obtener lista de Pokémon
        const list = await fetchPokemonList(APP_CONFIG.MAX_POKEMON_FETCH);
        
        // Obtener detalles de varios Pokémon en paralelo
        const sampleCount = Math.min(50, list.length);
        const sampleIndices = [];
        
        // Seleccionar muestra多样性 usando seeds
        const baseSeed = Date.now() % 1000;
        for (let i = 0; i < sampleCount; i++) {
            const idx = (baseSeed + i * 7) % list.length;
            sampleIndices.push(idx);
        }
        
        const promises = sampleIndices.map(idx => {
            const url = list[idx].url;
            const id = parseInt(url.split('/').filter(Boolean).pop(), 10);
            return fetchPokemon(id);
        });
        
        state.pokemonPool = await Promise.all(promises);
        
        // Guardar en LocalStorage
        const pokemonJson = state.pokemonPool.map(p => p.toJSON ? p.toJSON() : p);
        savePokemonCache(pokemonJson);
        
        console.log(`✅ Cargados ${state.pokemonPool.length} Pokémon`);
        return state.pokemonPool;
        
    } catch (error) {
        console.error('Error al cargar pool de Pokémon:', error);
        // Intentar usar datos mínimos
        if (state.pokemonPool.length === 0) {
            state.pokemonPool = await loadFallbackPokemonPool();
        }
        return state.pokemonPool;
    } finally {
        showLoading(false);
    }
}

/**
 * Carga un pool mínimo de Pokémon como fallback
 * @description Se usa cuando la API no responde
 * @returns {Promise<Array>} Array de Pokémon básicos
 */
async function loadFallbackPokemonPool() {
    const fallbackIds = [1, 4, 7, 25, 39, 52, 63, 94, 129, 133, 143, 150, 151];
    try {
        const pokemons = await Promise.all(
            fallbackIds.map(id => fetchPokemon(id).catch(() => null))
        );
        return pokemons.filter(Boolean);
    } catch {
        return [];
    }
}

/**
 * Obtiene un pool de Pokémon hardcodeado sin necesidad de API
 * @returns {Array} Array de Pokémon básicos
 */
function getHardcodedPokemonPool() {
    return [
        { id: 1, name: 'Bulbasaur', types: [{ name: 'grass' }, { name: 'poison' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
        { id: 4, name: 'Charmander', types: [{ name: 'fire' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
        { id: 7, name: 'Squirtle', types: [{ name: 'water' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
        { id: 25, name: 'Pikachu', types: [{ name: 'electric' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
        { id: 39, name: 'Jigglypuff', types: [{ name: 'normal' }, { name: 'fairy' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png' },
        { id: 52, name: 'Meowth', types: [{ name: 'normal' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png' },
        { id: 63, name: 'Abra', types: [{ name: 'psychic' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png' },
        { id: 94, name: 'Gengar', types: [{ name: 'ghost' }, { name: 'poison' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png' },
        { id: 129, name: 'Magikarp', types: [{ name: 'water' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png' },
        { id: 133, name: 'Eevee', types: [{ name: 'normal' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png' },
        { id: 143, name: 'Snorlax', types: [{ name: 'normal' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png' },
        { id: 150, name: 'Mewtwo', types: [{ name: 'psychic' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' },
        { id: 151, name: 'Mew', types: [{ name: 'psychic' }], spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png' }
    ];
}

/**
 * Muestra/oculta el overlay de carga
 * @description Controla la visibilidad del elemento loading-overlay añadiendo
 * o removiendo la clase 'hidden', y actualiza el estado isLoading
 * @param {boolean} show - Si true, muestra el overlay; si false, lo oculta
 * @returns {void}
 */
function showLoading(show) {
    state.isLoading = show;
    if (elements.loadingOverlay) {
        if (show) {
            elements.loadingOverlay.classList.remove('hidden');
        } else {
            elements.loadingOverlay.classList.add('hidden');
        }
    }
}

/**
 * Muestra el horóscopo del signo seleccionado
 * @description Genera y muestra el horóscopo, busca el Pokémon compatible
 * y actualiza todos los elementos de la interfaz. Utiliza un seed
 * basado en la fecha actual para garantizar resultados deterministas.
 * @param {Object} sign - Datos del signo zodiacal (de zodiac.js)
 * @returns {Promise<void>}
 * @example
 * import { getZodiacById } from './zodiac.js';
 * import { displayHoroscope } from './app.js';
 * 
 * const leo = getZodiacById(4); // Leo
 * await displayHoroscope(leo);
 * // Resultado: Muestra el horóscopo de Leo con su Pokémon del día
 */
export async function displayHoroscope(sign) {
    if (!sign) return;
    
    showLoading(true);
    
    try {
        // Generar seed determinista basado en fecha actual y signo
        const today = new Date();
        const seed = hashCode(`${today.getDate()}_${today.getMonth()}_${sign.id}`);
        
        // Obtener horóscopo
        const horoscope = getHoroscopeBySignAndDate(sign.id, today);
        state.currentHoroscope = horoscope;
        
        // Encontrar Pokémon compatible
        let pokemon = null;
        if (state.pokemonPool.length > 0) {
            pokemon = findMatchingPokemon(horoscope.tags, state.pokemonPool, seed);
        }
        
        // Si no hay match, usar fetch por seed
        if (!pokemon) {
            pokemon = await fetchPokemonBySeed(seed, 1, 151);
        }
        
        state.currentPokemon = pokemon;
        
        // Generar justificación
        const justification = generateJustification(horoscope, pokemon, sign);
        
        // Actualizar UI
        updateHoroscopeUI(sign, horoscope, pokemon, justification);
        
    } catch (error) {
        console.error('Error al mostrar horóscopo:', error);
        handleError('Error al cargar tu predicción. Por favor, intenta de nuevo.');
    } finally {
        showLoading(false);
    }
}

/**
 * Actualiza la interfaz del horóscopo con los datos proporcionados
 * @param {Object} sign - Datos del signo zodiacal
 * @param {Object} horoscope - Datos del horóscopo
 * @param {Object} pokemon - Datos del Pokémon
 * @param {string} justification - Texto de justificación
 */
function updateHoroscopeUI(sign, horoscope, pokemon, justification) {
    // Actualizar header
    const userName = state.userProfile?.name || 'viajero';
    if (elements.userGreeting) {
        elements.userGreeting.textContent = sign.id === state.userProfile?.signId
            ? `¡Hola, ${userName}!`
            : `Consultando a ${userName}`;
    }

    if (elements.signSymbol) {
        elements.signSymbol.textContent = sign.symbol;
    }

    if (elements.signName) {
        elements.signName.textContent = sign.name;
    }

    // Actualizar fecha
    if (elements.currentDate) {
        const today = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        elements.currentDate.textContent = today.toLocaleDateString('es-ES', options);
        elements.currentDate.setAttribute('datetime', today.toISOString());
    }

    // Actualizar texto del horóscopo
    if (elements.horoscopeContent) {
        elements.horoscopeContent.textContent = horoscope.text;
    }

    // Actualizar tags
    if (elements.tag1 && horoscope.tags[0]) {
        elements.tag1.textContent = `#${horoscope.tags[0]}`;
        elements.tag1.className = 'tag tag-primary';
    }

    if (elements.tag2 && horoscope.tags[1]) {
        elements.tag2.textContent = `#${horoscope.tags[1]}`;
        elements.tag2.className = 'tag tag-secondary';
    }

    // Actualizar Pokémon
    if (elements.pokemonName && pokemon) {
        elements.pokemonName.textContent = pokemon.name || '???';
    }

    if (elements.pokemonSprite && pokemon) {
        const spriteUrl = pokemon.spriteUrl || getPokemonImageUrl(pokemon.id);
        elements.pokemonSprite.src = spriteUrl;
        elements.pokemonSprite.alt = `Sprite de ${pokemon.name}`;

        // Configurar manejador de error para sprites que no cargan
        if (spriteErrorHandler) {
            elements.pokemonSprite.removeEventListener('error', spriteErrorHandler);
        }
        spriteErrorHandler = createSpriteErrorHandler(elements.pokemonSprite, pokemon.id);
        elements.pokemonSprite.addEventListener('error', spriteErrorHandler);

        // Actualizar status para accesibilidad
        if (elements.pokemonSpriteStatus) {
            elements.pokemonSpriteStatus.textContent = '';
        }
    }

    // Actualizar tipos del Pokémon
    if (elements.pokemonTypes && pokemon) {
        const types = pokemon.types || [];
        elements.pokemonTypes.innerHTML = types.map(t => {
            const typeName = t.name || t;
            const color = POKEMON_TYPE_COLORS[typeName] || '#888';
            return `<span class="type-badge type-${typeName}" style="background-color: ${color}">${capitalizeFirst(typeName)}</span>`;
        }).join('');
    }

    // Actualizar justificación
    if (elements.pokemonJustification) {
        elements.pokemonJustification.textContent = justification;
    }
}

/**
 * Obtiene la URL de la imagen de un Pokémon
 * @param {number} pokemonId - ID del Pokémon
 * @returns {string} URL de la imagen
 */
function getPokemonImageUrl(pokemonId) {
    return `${POKEAPI_CONFIG.SPRITE_URL}/${pokemonId}.png`;
}

/**
 * Capitaliza la primera letra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} Cadena capitalizada
 */
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Maneja errores globales de la aplicación
 * @description Muestra un mensaje de error al usuario mediante alerta
 * o toast y registra el error en la consola del navegador.
 * @param {string} message - Mensaje de error para mostrar al usuario
 * @param {Error} [error] - Objeto de error opcional con detalles adicionales
 * @returns {void}
 * @example
 * // Error simple
 * handleError('No se pudo cargar el horóscopo');
 * 
 * // Error con objeto de excepción
 * try {
 *     await someOperation();
 * } catch (err) {
 *     handleError('Falló la operación', err);
 * }
 */
export function handleError(message, error = null) {
    console.error('Error:', message, error);
    
    // Mostrar toast o alerta al usuario
    if (typeof showToast === 'function') {
        showToast(message, 'error');
    } else {
        alert(message);
    }
}

/**
 * Maneja la consulta de otro signo zodiacal
 * @description Navega al selector de signos para permitir al usuario
 * consultar el horóscopo de otro signo diferente al actual.
 * @returns {void}
 * @example
 * // Al hacer clic en "Consultar otro signo"
 * handleConsultOther();
 * // Resultado: Cambia a la vista 'zodiac-selector'
 */
export function handleConsultOther() {
    showView('zodiac-selector');
}

/**
 * Maneja la edición del perfil de usuario
 * @description Navega a la vista de configuración para permitir
 * al usuario modificar su nombre, fecha de nacimiento o signo.
 * @returns {void}
 * @example
 * // Al hacer clic en "Editar perfil"
 * handleEditProfile();
 * // Resultado: Cambia a la vista 'setup'
 */
export function handleEditProfile() {
    showView('setup');
}

// ============================================================================
// PANEL DE CONFIGURACIÓN
// ============================================================================

/**
 * Configura los eventos del panel de configuración
 * @description Vincula los event listeners para el panel de settings,
 * incluyendo apertura/cierre, toggles de preferencias, botones de acción
 * y atajos de teclado (Escape para cerrar)
 */
function setupSettingsPanel() {
    // Abrir/cerrar panel
    if (elements.btnSettings) {
        elements.btnSettings.addEventListener('click', openSettings);
    }
    if (elements.btnCloseSettings) {
        elements.btnCloseSettings.addEventListener('click', closeSettings);
    }
    if (elements.settingsOverlay) {
        elements.settingsOverlay.addEventListener('click', closeSettings);
    }

    // Toggle switches
    if (elements.toggleTheme) {
        elements.toggleTheme.addEventListener('click', () => togglePreference('theme'));
        updateToggleState(elements.toggleTheme, getUserPreferences().theme === 'dark');
    }
    if (elements.toggleAnimations) {
        elements.toggleAnimations.addEventListener('click', () => togglePreference('animations'));
        updateToggleState(elements.toggleAnimations, getUserPreferences().animations);
    }
    if (elements.toggleReducedMotion) {
        elements.toggleReducedMotion.addEventListener('click', () => togglePreference('reducedMotion'));
        updateToggleState(elements.toggleReducedMotion, getUserPreferences().reducedMotion);
    }

    // Botones de datos
    if (elements.btnClearCache) {
        elements.btnClearCache.addEventListener('click', handleClearCache);
    }
    if (elements.btnExportData) {
        elements.btnExportData.addEventListener('click', handleExportData);
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.settingsOpen) {
            closeSettings();
        }
    });
}

/**
 * Abre el panel de configuración
 * @description Añade clases CSS para mostrar el panel y el overlay,
 * actualiza atributos ARIA para accesibilidad y enfoca el primer control
 * @returns {void}
 */
function openSettings() {
    if (elements.settingsPanel && elements.settingsOverlay) {
        elements.settingsPanel.classList.add('open');
        elements.settingsPanel.setAttribute('aria-hidden', 'false');
        elements.settingsOverlay.classList.add('open');
        elements.settingsOverlay.setAttribute('aria-hidden', 'false');
        elements.btnSettings?.setAttribute('aria-expanded', 'true');
        state.settingsOpen = true;

        // Focus en el primer control
        elements.settingsPanel.querySelector('button')?.focus();
    }
}

/**
 * Cierra el panel de configuración
 * @description Remueve clases CSS para ocultar el panel y el overlay,
 * actualiza atributos ARIA y devuelve el foco al botón de settings
 * @returns {void}
 */
function closeSettings() {
    if (elements.settingsPanel && elements.settingsOverlay) {
        elements.settingsPanel.classList.remove('open');
        elements.settingsPanel.setAttribute('aria-hidden', 'true');
        elements.settingsOverlay.classList.remove('open');
        elements.settingsOverlay.setAttribute('aria-hidden', 'true');
        elements.btnSettings?.setAttribute('aria-expanded', 'false');
        state.settingsOpen = false;
        elements.btnSettings?.focus();
    }
}

/**
 * Alterna una preferencia y actualiza la UI
 * @description Cambia el valor de una preferencia específica (theme, animations o reducedMotion),
 * guarda los cambios en LocalStorage y actualiza el estado visual del toggle
 * @param {string} prefKey - Clave de la preferencia a alternar ('theme', 'animations', 'reducedMotion')
 * @returns {void}
 * @example
 * togglePreference('theme'); // Alterna entre dark/light
 * togglePreference('animations'); // Activa/desactiva animaciones
 */
function togglePreference(prefKey) {
    const prefs = getUserPreferences();
    let newValue;

    if (prefKey === 'theme') {
        newValue = prefs.theme === 'dark' ? 'light' : 'dark';
    } else {
        newValue = !prefs[prefKey];
    }

    saveUserPreferences({ [prefKey]: newValue });

    // Actualizar toggles
    if (prefKey === 'theme') {
        updateToggleState(elements.toggleTheme, newValue === 'dark');
    } else {
        const toggle = prefKey === 'animations' ? elements.toggleAnimations : elements.toggleReducedMotion;
        updateToggleState(toggle, newValue);
    }

    showToast('Preferencia actualizada', `${prefKey} ${newValue ? 'activado' : 'desactivado'}`, 'success');
}

/**
 * Actualiza el estado visual de un toggle
 * @description Añade o remueve la clase 'active' y actualiza el atributo
 * aria-checked para reflejar el estado del toggle en la UI
 * @param {HTMLElement} toggle - Elemento toggle del DOM
 * @param {boolean} active - Si el toggle está activo (true) o inactivo (false)
 * @returns {void}
 */
function updateToggleState(toggle, active) {
    if (toggle) {
        toggle.classList.toggle('active', active);
        toggle.setAttribute('aria-checked', active.toString());
    }
}

/**
 * Maneja la limpieza de cache
 * @description Muestra un confirm dialog para confirmar la acción,
 * limpia el cache de Pokémon y horóscopos, muestra un toast de confirmación
 * y recarga la página para obtener datos frescos
 * @returns {Promise<void>}
 */
async function handleClearCache() {
    if (confirm('¿Estás seguro de que quieres limpiar el cache? Esto eliminará los datos de Pokémon almacenados.')) {
        clearPokemonCache();
        clearHoroscopeCache();
        showToast('Cache limpiado', 'Los datos han sido eliminados correctamente', 'success');

        // Recargar la página para recargar los datos
        setTimeout(() => location.reload(), 1000);
    }
}

/**
 * Maneja la exportación de datos
 * @description Importa dinámicamente la función downloadUserDataBackup
 * desde storage.js y la ejecuta para generar un archivo JSON de backup
 * @returns {void}
 * @example
 * handleExportData(); // Descarga pokehoroscopo_backup_2026-05-12.json
 */
function handleExportData() {
    import('./storage.js').then(({ downloadUserDataBackup }) => {
        downloadUserDataBackup();
        showToast('Datos exportados', 'El archivo de backup se descargará pronto', 'success');
    });
}

// ============================================================================
// SISTEMA DE TOASTS
// ============================================================================

/**
 * Muestra un toast notification
 * @param {string} title - Título del toast
 * @param {string} message - Mensaje del toast
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duración en ms
 */
export function showToast(title, message, type = 'info', duration = 3000) {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <span class="toast-icon" aria-hidden="true">${icons[type] || icons.info}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Cerrar notificación">×</button>
    `;

    // Botón de cerrar
    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

    // Agregar y animar
    elements.toastContainer.appendChild(toast);

    // Auto-remover después del tiempo
    setTimeout(() => removeToast(toast), duration);
}

/**
 * Remueve un toast con animación
 * @description Añade clase 'toast-exit' para activar animación CSS de salida
 * y remueve el elemento del DOM después de 300ms
 * @param {HTMLElement} toast - Elemento del toast a remover
 * @returns {void}
 */
function removeToast(toast) {
    if (toast && toast.parentNode) {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }
}

// ============================================================================
// FUNCIONES DE COMPARTIR
// ============================================================================

async function shareViaNative() {
    if (navigator.share) {
        const content = generateShareContent();
        try {
            await navigator.share({
                title: 'Mi Horóscopo Pokémon',
                text: content
            });
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing:', err);
            }
            return false;
        }
    }
    return false;
}

function generateShareContent() {
    const sign = state.currentSign;
    const horoscope = state.currentHoroscope;
    const pokemon = state.currentPokemon;
    const userName = state.userProfile?.name || 'viajero';
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    const signInfo = sign ? `${sign.symbol} ${sign.name}` : 'Tu horóscopo';
    const pokemonInfo = pokemon ? `Tu Pokémon del día: ${pokemon.name}` : '';
    const tags = horoscope?.tags ? horoscope.tags.map(t => `#${t}`).join(' ') : '';

    let content = `🔮 ${signInfo}\n${userName} - ${dateStr}\n\n"${horoscope?.text || 'Tu predicción'}"\n\n${tags}\n\n${pokemonInfo}\n\n✨ El Oráculo Pokémon`;

    return content;
}

async function shareToWhatsApp() {
    const content = generateShareContent();
    const encodedContent = encodeURIComponent(content);
    const whatsappUrl = `https://wa.me/?text=${encodedContent}`;
    window.open(whatsappUrl, '_blank');
}

function shareToFacebook() {
    const pageUrl = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
}

function shareToTwitter() {
    const content = generateShareContent();
    const tweetText = content.length > 280 ? content.substring(0, 277) + '...' : content;
    const encodedText = encodeURIComponent(tweetText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
}

async function copyToClipboard() {
    const content = generateShareContent();
    try {
        await navigator.clipboard.writeText(content);
        showToast('Copiado', 'Texto copiado al portapapeles', 'success');
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Copiado', 'Texto copiado al portapapeles', 'success');
        } catch (e) {
            showToast('Error', 'No se pudo copiar el texto', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    initApp,
    showView,
    hideView,
    displayHoroscope,
    handleFormSubmit,
    handleConsultOther,
    handleEditProfile,
    handleError,
    showToast
};