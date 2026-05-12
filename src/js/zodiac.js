/**
 * @fileoverview Datos y lógica de signos zodiacales para El Oráculo Pokémon
 * @description Define los 12 signos zodiacales con sus elementos, fechas y funciones de búsqueda
 * @author Arquitectura Frontend
 * @version 1.0.0
 * @since 2026-05-12
 * @requires module:CONFIG
 */

/**
 * @typedef {Object} ZodiacSign
 * @description Estructura de datos de un signo zodiacal
 * @property {number} id - Identificador único del signo (1-12)
 * @property {string} name - Nombre del signo en español
 * @property {string} symbol - Símbolo Unicode del signo
 * @property {string} element - Elemento asociado (Fuego, Tierra, Aire, Agua)
 * @property {string} dates - Rango de fechas del signo
 * @property {Object} dateRange - Rango de fechas estructurado
 * @property {number} dateRange.startMonth - Mes de inicio (1-12)
 * @property {number} dateRange.startDay - Día de inicio
 * @property {number} dateRange.endMonth - Mes de fin (1-12)
 * @property {number} dateRange.endDay - Día de fin
 * @property {string} traits - Rasgos positivos del signo
 * @property {string} weaknesses - Debilidades del signo
 */

/**
 * @type {ZodiacSign[]}
 * @description Array con los 12 signos zodiacales en orden cronológico
 */
export const ZODIAC_SIGNS = [
    {
        id: 1,
        name: 'Aries',
        symbol: '♈',
        element: 'Fuego',
        dates: '21 Mar - 19 Abr',
        dateRange: { startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
        traits: 'Valiente, decidido, pionero, entusiasta, optimista',
        weaknesses: 'Impaciente, impulsivo, competitivo, irascible'
    },
    {
        id: 2,
        name: 'Tauro',
        symbol: '♉',
        element: 'Tierra',
        dates: '20 Abr - 20 May',
        dateRange: { startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
        traits: 'Paciente, confiable, práctico, leal, terco',
        weaknesses: 'Terco, posesivo, resistente al cambio, glotón'
    },
    {
        id: 3,
        name: 'Géminis',
        symbol: '♊',
        element: 'Aire',
        dates: '21 May - 20 Jun',
        dateRange: { startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
        traits: 'Curioso, adaptable, comunicativo, versátil, ingenioso',
        weaknesses: 'Indeciso, superficial, inquieto, dualidad de humor'
    },
    {
        id: 4,
        name: 'Cáncer',
        symbol: '♋',
        element: 'Agua',
        dates: '21 Jun - 22 Jul',
        dateRange: { startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
        traits: 'Intuitivo, emocional, protector, leal, imaginativo',
        weaknesses: 'Susceptible, melancólico, caprichoso, dependiente'
    },
    {
        id: 5,
        name: 'Leo',
        symbol: '♌',
        element: 'Fuego',
        dates: '23 Jul - 22 Ago',
        dateRange: { startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
        traits: 'Creativo, generoso, seguro, ambicioso, cálido',
        weaknesses: 'Orgulloso, dramático, terco, necesita atención constante'
    },
    {
        id: 6,
        name: 'Virgo',
        symbol: '♍',
        element: 'Tierra',
        dates: '23 Ago - 22 Sep',
        dateRange: { startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
        traits: 'Analítico, práctico, organizado, crítico, servicial',
        weaknesses: 'Perfeccionista, crítico en exceso, ansioso, remilgoso'
    },
    {
        id: 7,
        name: 'Libra',
        symbol: '♎',
        element: 'Aire',
        dates: '23 Sep - 22 Oct',
        dateRange: { startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
        traits: 'Diplomático, armónico, sociable, justo, romántico',
        weaknesses: 'Indeciso, evita conflictos, superficial, dependent del entorno'
    },
    {
        id: 8,
        name: 'Escorpión',
        symbol: '♏',
        element: 'Agua',
        dates: '23 Oct - 21 Nov',
        dateRange: { startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
        traits: 'Apasionado, intensos, leal, determinadon, perspicaz',
        weaknesses: 'Celoso, secretive, vengativo, manipulador'
    },
    {
        id: 9,
        name: 'Sagitario',
        symbol: '♐',
        element: 'Fuego',
        dates: '22 Nov - 21 Dic',
        dateRange: { startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
        traits: 'Optimista, aventurero, filosófo, honesto, generoso',
        weaknesses: 'Imprudente, irresponsable, superficial, indiscreto'
    },
    {
        id: 10,
        name: 'Capricornio',
        symbol: '♑',
        element: 'Tierra',
        dates: '22 Dic - 19 Ene',
        dateRange: { startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
        traits: 'Disciplinado, responsable, ambicioso, paciente, práctico',
        weaknesses: 'Pesimista, cruel, workaholic, inflexible'
    },
    {
        id: 11,
        name: 'Acuario',
        symbol: '♒',
        element: 'Aire',
        dates: '20 Ene - 18 Feb',
        dateRange: { startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
        traits: 'Original, independiente, humanitario, visionario, científico',
        weaknesses: 'Eccéntrico, emocionalmente distante, impredecible, rebelde'
    },
    {
        id: 12,
        name: 'Piscis',
        symbol: '♓',
        element: 'Agua',
        dates: '19 Feb - 20 Mar',
        dateRange: { startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
        traits: 'Compasivo, artístico, intuitivo, sensible, espiritual',
        weaknesses: 'Fugitivo de la realidad, indeciso, idealista, escapista'
    }
];

/**
 * Verifica si una fecha cae dentro del rango de un signo zodiacal
 * @description Compara el mes y día proporcionado con el rango de fechas del signo.
 * Maneja casos especiales como Capricornio que cruza el año nuevo.
 * @param {number} signId - ID del signo zodiacal (1-12)
 * @param {number} month - Mes de la fecha (1-12)
 * @param {number} day - Día de la fecha (1-31)
 * @returns {boolean} True si la fecha está dentro del rango del signo
 * @example
 * // Verificar si el 15 de abril está en Aries (21 Mar - 19 Abr)
 * const inAries = isDateInSignRange(1, 4, 15); // true
 * 
 * // Verificar si el 25 de diciembre está en Capricornio (cruza año nuevo)
 * const inCapricorn = isDateInSignRange(10, 12, 25); // true
 */
function isDateInSignRange(signId, month, day) {
    const sign = ZODIAC_SIGNS.find(s => s.id === signId);
    if (!sign) return false;

    const { startMonth, startDay, endMonth, endDay } = sign.dateRange;

    // Caso especial para fechas que cruzan el año nuevo (Capricornio)
    if (startMonth > endMonth) {
        return (month > startMonth || (month === startMonth && day >= startDay)) ||
               (month < endMonth || (month === endMonth && day <= endDay));
    }

    // Caso normal
    if (month === startMonth && month === endMonth) {
        return day >= startDay && day <= endDay;
    }
    if (month === startMonth) {
        return day >= startDay;
    }
    if (month === endMonth) {
        return day <= endDay;
    }
    return month > startMonth && month < endMonth;
}

/**
 * Calcula el signo zodiacal basándose en el mes y día proporcionados
 * @description Itera a través de los signos zodiacales para encontrar cuál corresponde
 * a la fecha dada. Si no se encuentra coincidencia, retorna el signo de piscis por defecto.
 * @param {number} month - Mes de nacimiento (1-12)
 * @param {number} day - Día de nacimiento (1-31)
 * @returns {ZodiacSign} El signo zodiacal correspondiente a la fecha
 * @example
 * // Aries (21 de marzo - 19 de abril)
 * const aries = calculateZodiacSign(3, 25); // returns sign with name "Aries"
 * 
 * // Capricornio (cruza año nuevo)
 * const capricornio = calculateZodiacSign(1, 15); // returns sign with name "Capricornio"
 */
export function calculateZodiacSign(month, day) {
    // Validar parámetros
    if (!month || month < 1 || month > 12 || !day || day < 1 || day > 31) {
        console.warn('Fecha inválida proporcionada, usando Piscis por defecto');
        return ZODIAC_SIGNS.find(s => s.id === 12);
    }

    for (const sign of ZODIAC_SIGNS) {
        if (isDateInSignRange(sign.id, month, day)) {
            return sign;
        }
    }

    // Por defecto, retorna Piscis (último signo del año)
    return ZODIAC_SIGNS.find(s => s.id === 12);
}

/**
 * Obtiene un signo zodiacal por su ID
 * @description Busca un signo zodiacal en el array ZODIAC_SIGNS por su identificador único
 * @param {number} id - ID del signo (1-12)
 * @returns {ZodiacSign|undefined} El signo zodiacal si existe, undefined si no
 * @example
 * const leo = getZodiacById(5); // returns { name: "Leo", symbol: "♌", ... }
 * const invalid = getZodiacById(99); // returns undefined
 */
export function getZodiacById(id) {
    return ZODIAC_SIGNS.find(sign => sign.id === id);
}

/**
 * Obtiene un signo zodiacal por su nombre (insensible a mayúsculas/minúsculas)
 * @description Busca un signo zodiacal por nombre, comparando sin importar mayúsculas/minúsculas
 * @param {string} name - Nombre del signo a buscar
 * @returns {ZodiacSign|undefined} El signo zodiacal si existe, undefined si no
 * @example
 * const aries = getZodiacByName("aries"); // returns sign with id 1
 * const leo = getZodiacByName("LEO"); // returns sign with id 5
 * const notFound = getZodiacByName("XYZ"); // returns undefined
 */
export function getZodiacByName(name) {
    if (!name || typeof name !== 'string') return undefined;
    return ZODIAC_SIGNS.find(sign => sign.name.toLowerCase() === name.trim().toLowerCase());
}

/**
 * Obtiene todos los signos de un elemento específico
 * @description Filtra los signos zodiacales por su elemento (Fuego, Tierra, Aire, Agua)
 * @param {string} element - Nombre del elemento a filtrar
 * @returns {ZodiacSign[]} Array de signos del elemento especificado
 * @example
 * const fireSigns = getZodiacsByElement("Fuego"); // [Aries, Leo, Sagitario]
 * const waterSigns = getZodiacsByElement("Agua"); // [Cáncer, Escorpión, Piscis]
 */
export function getZodiacsByElement(element) {
    if (!element || typeof element !== 'string') return [];
    return ZODIAC_SIGNS.filter(sign => sign.element === element);
}

/**
 * Genera el HTML para renderizar la grilla de signos zodiacales
 * @description Crea una cadena HTML con los 12 signos zodiacales formateados
 * @param {Object} options - Opciones de renderizado
 * @param {string} [options.containerClass='zodiac-grid'] - Clase CSS para el contenedor
 * @param {string} [options.itemClass='zodiac-item'] - Clase CSS para cada item
 * @param {boolean} [options.showTraits=true] - Si muestra los rasgos del signo
 * @returns {string} Cadena HTML con la grilla de signos
 */
export function renderZodiacGrid(options = {}) {
    const {
        containerClass = 'zodiac-grid',
        itemClass = 'zodiac-item',
        showTraits = false
    } = options;

    const signsHtml = ZODIAC_SIGNS.map(sign => `
        <button class="${itemClass}" 
                data-sign-id="${sign.id}" 
                data-element="${sign.element}"
                aria-label="Seleccionar ${sign.name}">
            <span class="zodiac-symbol">${sign.symbol}</span>
            <span class="zodiac-name">${sign.name}</span>
            <span class="zodiac-dates">${sign.dates}</span>
            ${showTraits ? `<span class="zodiac-traits">${sign.traits}</span>` : ''}
        </button>
    `).join('');

    return `<div class="${containerClass}">${signsHtml}</div>`;
}

/**
 * Exporta los datos de todos los signos como objeto serializable
 * @description Convierte el array ZODIAC_SIGNS en un objeto con claves basadas en ID
 * @returns {Object.<number, ZodiacSign>} Objeto con signos indexados por ID
 */
export function exportZodiacData() {
    return ZODIAC_SIGNS.reduce((acc, sign) => {
        acc[sign.id] = { ...sign };
        return acc;
    }, {});
}

/**
 * Obtiene el elemento dominante de un array de signos
 * @description Analiza un array de signos y determina cuál es el elemento más frecuente
 * @param {number[]} signIds - Array de IDs de signos a analizar
 * @returns {string|null} El nombre del elemento más común, o null si no hay signos
 */
export function getDominantElement(signIds) {
    if (!signIds || signIds.length === 0) return null;

    const elements = signIds
        .map(id => getZodiacById(id))
        .filter(sign => sign !== undefined)
        .map(sign => sign.element);

    if (elements.length === 0) return null;

    const counts = elements.reduce((acc, el) => {
        acc[el] = (acc[el] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])[0][0];
}

// exports por defecto para conveniencia
export default {
    ZODIAC_SIGNS,
    calculateZodiacSign,
    getZodiacById,
    getZodiacByName,
    getZodiacsByElement,
    renderZodiacGrid,
    exportZodiacData,
    getDominantElement
};
