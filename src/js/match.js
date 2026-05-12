/**
 * @fileoverview Módulo de matching entre horóscopos y Pokémon para El Oráculo Pokémon
 * @description Algoritmo para hacer match entre tags de horóscopo y Pokémon basado en
 * tipos, habilidades y criterios predefinidos. Genera justificaciones personalizadas.
 * @author Arquitectura Frontend
 * @version 1.0.0
 * @since 2026-05-12
 * @requires module:CONFIG
 * @requires module:POKEMON
 */

/**
 * @typedef {Object} MatchResult
 * @description Resultado del matching entre horóscopo y Pokémon
 * @property {Object} pokemon - Datos del Pokémon seleccionado
 * @property {number} score - Puntuación de compatibilidad (0-100)
 * @property {string[]} matchedTags - Tags que coincidieron
 * @property {string} justification - Texto de justificación generado
 */

import { TAG_MATCH_CRITERIA, POKEAPI_CONFIG } from './config.js';

/**
 * Habilidades que indican victoria y determinación
 * @type {string[]}
 */
const VICTORY_ABILITY_KEYWORDS = ['moxie', 'unnerve', 'defiant', 'anger-point', 'super-luck'];

/**
 * Habilidades que indican perseverancia y resistencia
 * @type {string[]}
 */
const PERSEVERANCE_ABILITY_KEYWORDS = ['sturdy', 'inner-focus', 'pressure', 'iron-barbs', 'rough-skin'];

/**
 * Habilidades que indican transformación y cambio
 * @type {string[]}
 */
const TRANSFORMATION_ABILITY_KEYWORDS = ['protean', 'color-change', 'zen-mode', 'shields-down', 'libero'];

/**
 * Habilidades que indican equilibrio y armonía
 * @type {string[]}
 */
const BALANCE_ABILITY_KEYWORDS = ['levitate', 'synchronize', 'natural-cure', 'aroma-veil', 'flower-veil'];

/**
 * Habilidades que indican introspección y reflexión
 * @type {string[]}
 */
const INTROSPECTION_ABILITY_KEYWORDS = ['analytic', 'own-tempo', 'magician', 'shadow-shield', 'filter'];

/**
 * Habilidades que indican acción y movimiento
 * @type {string[]}
 */
const ACTION_ABILITY_KEYWORDS = ['speed-boost', 'unburden', 'quick-feet', 'download', 'download'];

/**
 * Genera un hash numérico determinista a partir de una cadena
 * @description Algoritmo djb2 para crear seeds consistentes
 * @param {string} str - Cadena a hashear
 * @returns {number} Hash numérico positivo
 */
function hashCode(str) {
    if (!str || typeof str !== 'string') return 0;
    
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}

/**
 * Selecciona un elemento pseudo-aleatorio basado en seed
 * @description Usa el seed para crear un índice determinista
 * @param {Array} array - Array del cual seleccionar
 * @param {number} seed - Seed para selección
 * @returns {*} Elemento seleccionado
 */
function seededRandom(array, seed) {
    if (!array || array.length === 0) return null;
    const index = seed % array.length;
    return array[index];
}

/**
 * Verifica si un Pokémon coincide con un tag específico
 * @description Compara los tipos y habilidades del Pokémon con los criterios
 * definidos para el tag en TAG_MATCH_CRITERIA. Soporta match parcial.
 * @param {Object} pokemon - Datos del Pokémon (de PokemonData)
 * @param {string} tag - Nombre del tag a verificar
 * @returns {Object} Resultado con coincidence (boolean) y score (number 0-100)
 * @example
 * const pikachu = await fetchPokemon(25);
 * const result = hasMatchingTag(pikachu, 'Victoria');
 * // result: { match: true, score: 85 }
 */
export function hasMatchingTag(pokemon, tag) {
    if (!pokemon || !tag) {
        return { match: false, score: 0 };
    }

    const criteria = TAG_MATCH_CRITERIA[tag];
    if (!criteria) {
        return { match: false, score: 0 };
    }

    const pokemonTypes = pokemon.types ? pokemon.types.map(t => t.name || t) : [];
    const pokemonAbilities = pokemon.abilities 
        ? pokemon.abilities.map(a => a.nameRaw || a.name?.toLowerCase().replace(/ /g, '-') || '')
        : [];

    // Verificar coincidencia de tipos
    let typeMatches = 0;
    for (const type of pokemonTypes) {
        if (criteria.types.includes(type.toLowerCase())) {
            typeMatches++;
        }
    }

    // Verificar coincidencia de habilidades
    let abilityMatches = 0;
    for (const ability of pokemonAbilities) {
        const abilityLower = ability.toLowerCase().replace(/ /g, '-');
        if (criteria.abilities.some(crit => abilityLower.includes(crit.replace(/-/g, '')))) {
            abilityMatches++;
        }
    }

    // Calcular score de coincidencia
    const typeScore = (typeMatches / Math.max(pokemonTypes.length, 1)) * 50;
    const abilityScore = (abilityMatches / Math.max(pokemonAbilities.length, 1)) * 50;
    const totalScore = Math.min(100, Math.round(typeScore + abilityScore));

    // Determinar si hay coincidencia significativa
    const match = totalScore >= 20;

    return {
        match: match,
        score: totalScore,
        typeMatches,
        abilityMatches,
        details: {
            types: pokemonTypes,
            abilities: pokemonAbilities,
            criteriaTypes: criteria.types,
            criteriaAbilities: criteria.abilities
        }
    };
}

/**
 * Calcula el score de compatibilidad entre un Pokémon y tags de horóscopo
 * @description Analiza todos los tags proporcionados y calcula un score
 * ponderado basado en las coincidencias encontradas.
 * @param {Object} pokemon - Datos del Pokémon
 * @param {string[]} tags - Array de tags del horóscopo (normalmente 2)
 * @returns {number} Score de compatibilidad (0-100)
 * @example
 * const pokemon = await fetchPokemon(6);
 * const score = calculateMatchScore(pokemon, ['Victoria', 'Acción']);
 * // Score entre 0-100 basado en coincidencias
 */
export function calculateMatchScore(pokemon, tags) {
    if (!pokemon || !tags || !Array.isArray(tags) || tags.length === 0) {
        return 0;
    }

    let totalScore = 0;
    let matchCount = 0;

    for (const tag of tags) {
        const result = hasMatchingTag(pokemon, tag);
        totalScore += result.score;
        if (result.match) {
            matchCount++;
        }
    }

    // Score base (promedio de todos los tags)
    const avgScore = totalScore / tags.length;
    
    // Bonus por tener múltiples tags coincidentes
    const multiMatchBonus = matchCount > 1 ? (matchCount - 1) * 10 : 0;
    
    // Bonus por tipo primario coincidente
    const primaryTypeBonus = pokemon.primaryType 
        ? calculatePrimaryTypeBonus(pokemon, tags)
        : 0;

    return Math.min(100, Math.round(avgScore + multiMatchBonus + primaryTypeBonus));
}

/**
 * Calcula bonus por tipo primario
 * @description Da bonus adicional si el tipo primario del Pokémon
 * coincide con algún tag del horóscopo
 * @param {Object} pokemon - Datos del Pokémon
 * @param {string[]} tags - Tags del horóscopo
 * @returns {number} Bonus de 0 a 15
 */
function calculatePrimaryTypeBonus(pokemon, tags) {
    const primaryType = pokemon.primaryType?.toLowerCase();
    if (!primaryType) return 0;

    for (const tag of tags) {
        const criteria = TAG_MATCH_CRITERIA[tag];
        if (criteria && criteria.types.includes(primaryType)) {
            return 15; // Bonus significativo por tipo primario
        }
    }
    return 0;
}

/**
 * Encuentra el Pokémon más adecuado para un conjunto de tags
 * @description Itera a través de una lista de Pokémon y selecciona el que
 * tenga mejor score de compatibilidad con los tags proporcionados.
 * Usa seed para garantizar resultados deterministas.
 * @param {string[]} tags - Tags del horóscopo para matching
 * @param {Array} pokemonList - Lista de Pokémon disponibles (pre-cargados)
 * @param {number} seed - Seed para selección determinista
 * @returns {Object|null} Pokémon seleccionado o null si no hay match
 * @example
 * const tags = ['Victoria', 'Transformación'];
 * const pokemons = await loadPokemonPool();
 * const match = findMatchingPokemon(tags, pokemons, 12345);
 */
export function findMatchingPokemon(tags, pokemonList, seed) {
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
        console.warn('Tags inválidos para matching, usando selección aleatoria');
        return seededRandom(pokemonList, seed);
    }

    if (!pokemonList || pokemonList.length === 0) {
        console.error('Lista de Pokémon vacía');
        return null;
    }

    // Calcular scores para todos los Pokémon
    const scoredPokemon = pokemonList.map((pokemon, index) => {
        const score = calculateMatchScore(pokemon, tags);
        return {
            pokemon,
            score,
            index
        };
    });

    // Ordenar por score descendente
    scoredPokemon.sort((a, b) => b.score - a.score);

    // Seleccionar el mejor match o usar seed para diversidad
    const topMatches = scoredPokemon.filter(p => p.score > 0);
    
    if (topMatches.length === 0) {
        // No hay matches, usar seed para selección aleatoria sesgada
        const seedIndex = seed % pokemonList.length;
        return pokemonList[seedIndex];
    }

    // Seleccionar de los mejores matches usando seed
    const selectedIndex = seed % Math.min(topMatches.length, 5);
    return topMatches[selectedIndex].pokemon;
}

/**
 * Genera texto de justificación que vincula horóscopo con Pokémon
 * @description Crea una narrativa personalizada que conecta las características
 * del signo zodiacal, los tags del horóscopo y el Pokémon seleccionado.
 * @param {Object} horoscope - Datos del horóscopo ({ text, tags })
 * @param {Object} pokemon - Datos del Pokémon
 * @param {Object} sign - Datos del signo zodiacal
 * @returns {string} Texto de justificación generado
 * @example
 * const justification = generateJustification(
 *     { text: 'Hoy es un día de victoria...', tags: ['Victoria'] },
 *     { name: 'Charizard', primaryType: 'fire' },
 *     { name: 'Leo', element: 'Fuego' }
 * );
 */
export function generateJustification(horoscope, pokemon, sign) {
    if (!horoscope || !pokemon || !sign) {
        return 'La conexión entre las estrellas y los Pokémon revela un destino único.';
    }

    const pokemonName = pokemon.name || 'Pokémon misterioso';
    const signName = sign.name || 'signo';
    const element = sign.element || 'energía';
    const primaryType = pokemon.primaryType || 'normal';
    const tags = horoscope.tags || [];

    // Templates para cada tipo de elemento
    const elementTemplates = {
        'Fuego': [
            `La llama ardiente de ${pokemonName} representa la pasión que ${signName} lleva en su corazón.`,
            `El fuego interior de ${pokemonName} simboliza la determinación inquebrantable de ${signName}.`,
            `Como una llama que nunca se apaga, ${pokemonName} refleja la energía eterna de ${signName}.`
        ],
        'Tierra': [
            `La solideidad de ${pokemonName} refleja la estabilidad y paciencia de ${signName}.`,
            `Como las raíces ancestrales, ${pokemonName} representa los fundamentos de ${signName}.`,
            `La naturaleza terrenal de ${pokemonName} complementa la esencia grounded de ${signName}.`
        ],
        'Aire': [
            `La ligereza de ${pokemonName} captura la libertad que ${signName} busca en su camino.`,
            `Como el viento que sopla sin límites, ${pokemonName} refleja el espíritu libre de ${signName}.`,
            `La naturaleza etérea de ${pokemonName} complementa la adaptable energía de ${signName}.`
        ],
        'Agua': [
            `La fluidez de ${pokemonName} representa la intuitiva esencia de ${signName}.`,
            `Como el agua que encuentra su camino, ${pokemonName} simboliza la persistencia de ${signName}.`,
            `La naturaleza adaptativa de ${pokemonName} refleja la sensibilidad profunda de ${signName}.`
        ]
    };

    // Templates para cada tag
    const tagTemplates = {
        'Victoria': [
            ' Hoy es día de conquistas y logros.',
            ' Las estrellas favorecen tu camino hacia el éxito.',
            ' Tu brillo interior iluminará el sendero hacia la victoria.'
        ],
        'Perseverancia': [
            ' La paciencia será tu mejor aliada en esta jornada.',
            ' Cada paso firme te acerca a tus metas.',
            ' Tu determinación supera cualquier obstáculo que se interponga.'
        ],
        'Transformación': [
            ' Los cambios llegan para potenciar tu esencia.',
            ' Una metamorfosis positiva te espera en el horizonte.',
            ' Abrázate a la evolución que los astros te ofrecen.'
        ],
        'Equilibrio': [
            ' La armonía entre cielo y tierra guía tus pasos.',
            ' Encuentra el balance perfecto entre acción y reflexión.',
            ' La paz interior es tu mayor tesoro hoy.'
        ],
        'Introspección': [
            ' El autoconocimiento es la llave a nuevos descubrimientos.',
            ' Mira dentro de ti para encontrar las respuestas.',
            ' Tu intuición te guía hacia profundidades desconocidas.'
        ],
        'Acción': [
            ' Es momento de tomar las riendas de tu destino.',
            ' La energía cósmica impulsa tus行动 hacia adelante.',
            ' No hay tiempo que perder: ¡actúa con determinación!'
        ]
    };

    // Seleccionar template base del elemento
    const elementTemplate = elementTemplates[element] || elementTemplates['Fuego'];
    const baseText = seededRandom(elementTemplate, hashCode(signName + pokemonName));

    // Agregar tags si existen
    let tagText = '';
    if (tags.length > 0) {
        const tagTextOptions = tags.map(tag => tagTemplates[tag] || tagTemplates['Victoria']);
        const selectedTagTemplate = seededRandom(tagTextOptions.flat(), hashCode(tags.join('')));
        tagText = selectedTagTemplate;
    }

    // Combinar textos
    let fullJustification = `${baseText}${tagText}`;

    // Agregar información del tipo si hay match
    const typeInfo = getTypeJustification(primaryType);
    if (typeInfo) {
        fullJustification += ` ${typeInfo}`;
    }

    return fullJustification;
}

/**
 * Obtiene información contextual del tipo de Pokémon
 * @description Genera una oración breve sobre el significado del tipo
 * @param {string} type - Tipo primario del Pokémon
 * @returns {string} Texto sobre el tipo
 */
function getTypeJustification(type) {
    const typeDescriptions = {
        'fire': 'El tipo Fuego representa la pasión ardiente y la determinación inquebrantable.',
        'water': 'El tipo Agua simboliza la intuición profunda y la capacidad de adaptación.',
        'grass': 'El tipo Planta refleja el crecimiento natural y la conexión con la naturaleza.',
        'electric': 'El tipo Eléctrico representa la energía vibrante y la velocidad mental.',
        'psychic': 'El tipo Psíquico simboliza la sabiduría ancestral y el poder mental.',
        'ghost': 'El tipo Fantasma representa los misterios ocultos y la intuición superior.',
        'dragon': 'El tipo Dragón simboliza la fuerza ancestral y el poder legendario.',
        'fairy': 'El tipo Hada representa la magia, la bondad y la conexión espiritual.',
        'fighting': 'El tipo Lucha simboliza la determinación y el espíritu de superación.',
        'flying': 'El tipo Volador representa la libertad y la perspectiva elevada.',
        'poison': 'El tipo Veneno simboliza la transformación y la adaptibilidad.',
        'ground': 'El tipo Tierra representa la estabilidad y los fundamentos sólidos.',
        'rock': 'El tipo Roca simboliza la resistencia y la perseverancia inquebrantable.',
        'bug': 'El tipo Bicho representa la evolución constante y la persistencia.',
        'steel': 'El tipo Acero simboliza la fortaleza y la resiliencia.',
        'ice': 'El tipo Hielo representa la claridad mental y la precisión.',
        'dark': 'El tipo Siniestro simboliza los misterios y la introspección profunda.',
        'normal': 'El tipo Normal representa la versatilidad y la naturaleza equilibrada.'
    };

    return typeDescriptions[type?.toLowerCase()] || '';
}

/**
 * Obtiene la lista de tipos compatibles con un tag específico
 * @description Retorna los tipos de Pokémon que mejor combinan con un tag
 * @param {string} tag - Nombre del tag
 * @returns {string[]} Array de tipos compatibles
 */
export function getCompatibleTypes(tag) {
    const criteria = TAG_MATCH_CRITERIA[tag];
    return criteria ? criteria.types : [];
}

/**
 * Obtiene las habilidades compatibles con un tag específico
 * @description Retorna las habilidades que mejor combinan con un tag
 * @param {string} tag - Nombre del tag
 * @returns {string[]} Array de habilidades compatibles
 */
export function getCompatibleAbilities(tag) {
    const criteria = TAG_MATCH_CRITERIA[tag];
    return criteria ? criteria.abilities : [];
}

/**
 * Verifica si un Pokémon es ideal para un tag (score >= 70)
 * @description Wrapper que determina si un Pokémon es un "match ideal"
 * @param {Object} pokemon - Datos del Pokémon
 * @param {string} tag - Tag a verificar
 * @returns {boolean} True si es ideal (score >= 70)
 */
export function isIdealMatch(pokemon, tag) {
    const result = hasMatchingTag(pokemon, tag);
    return result.score >= 70;
}

/**
 * Genera una explicación detallada del matching
 * @description Proporciona información detallada sobre por qué un Pokémon
 * hace match con ciertos tags
 * @param {Object} pokemon - Datos del Pokémon
 * @param {string[]} tags - Tags del horóscopo
 * @returns {Object} Análisis detallado del matching
 */
export function getMatchAnalysis(pokemon, tags) {
    if (!pokemon || !tags) {
        return null;
    }

    const analysis = {
        pokemon: {
            name: pokemon.name,
            types: pokemon.types?.map(t => t.name || t) || [],
            abilities: pokemon.abilities?.map(a => a.name || a.nameRaw) || []
        },
        tags: tags.map(tag => {
            const result = hasMatchingTag(pokemon, tag);
            return {
                name: tag,
                match: result.match,
                score: result.score,
                typeMatches: result.typeMatches,
                abilityMatches: result.abilityMatches,
                compatibleTypes: getCompatibleTypes(tag)
            };
        }),
        overallScore: calculateMatchScore(pokemon, tags),
        summary: generateMatchSummary(pokemon, tags)
    };

    return analysis;
}

/**
 * Genera un resumen textual del análisis de matching
 * @param {Object} pokemon - Datos del Pokémon
 * @param {string[]} tags - Tags evaluados
 * @returns {string} Resumen textual
 */
function generateMatchSummary(pokemon, tags) {
    const pokemonName = pokemon.name || 'Pokémon';
    const matchingTags = tags.filter(tag => isIdealMatch(pokemon, tag));
    
    if (matchingTags.length === tags.length) {
        return `${pokemonName} es un match perfecto con tu horóscopo del día.`;
    } else if (matchingTags.length > 0) {
        return `${pokemonName} conecta especialmente con tu energía de ${matchingTags.join(' y ')}.`;
    } else {
        return `${pokemonName} aporta una energía complementaria a tu esencia.`;
    }
}

// ============================================================================
// EXPORTS POR DEFECTO
// ============================================================================

export default {
    hasMatchingTag,
    calculateMatchScore,
    findMatchingPokemon,
    generateJustification,
    getCompatibleTypes,
    getCompatibleAbilities,
    isIdealMatch,
    getMatchAnalysis,
    hashCode
};