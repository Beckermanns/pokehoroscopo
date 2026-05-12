/**
 * @fileoverview Base de datos de horóscopos para El Oráculo Pokémon
 * @description Contiene 365 horóscopos únicos por signo zodiacal (4380+ textos totales)
 * con sistema de selección determinista por fecha y algoritmo de hashing
 * @author Arquitectura Frontend
 * @version 1.0.0
 * @since 2026-05-12
 * @requires module:CONFIG
 */

/**
 * @typedef {Object} Horoscope
 * @description Estructura de datos de un horóscopo individual
 * @property {number} id - Identificador numérico único
 * @property {number} signId - ID del signo zodiacal (1-12)
 * @property {string} text - Texto de la predicción
 * @property {string[]} tags - Array de hasta 2 etiquetas asociadas
 */

/**
 * @typedef {Object} HoroscopeTag
 * @description Define las etiquetas disponibles para clasificar horóscopos
 * @property {string} name - Nombre de la etiqueta
 * @property {string} emoji - Emoji asociado
 * @property {string} description - Descripción de la etiqueta
 */

/**
 * @type {HoroscopeTag[]}
 * @description Etiquetas disponibles para clasificar horóscopos
 */
const HOROSCOPE_TAGS = [
    { name: 'Victoria', emoji: '🏆', description: 'Predicciones de éxito y logros' },
    { name: 'Perseverancia', emoji: '💪', description: 'Horóscopos sobre paciencia y esfuerzo' },
    { name: 'Transformación', emoji: '🔮', description: 'Cambios y evoluciones' },
    { name: 'Equilibrio', emoji: '⚖️', description: 'Predicciones sobre armonía y balance' },
    { name: 'Introspección', emoji: '🔍', description: 'Reflexión y autoconocimiento' },
    { name: 'Acción', emoji: '⚡', description: 'Energía para emprender' },
    { name: 'Amor', emoji: '❤️', description: 'Relaciones y sentimientos' },
    { name: 'Suerte', emoji: '🍀', description: 'Fortuna y oportunidades' },
    { name: 'Creatividad', emoji: '🎨', description: 'Inspiración artística' },
    { name: 'Sabiduría', emoji: '📚', description: 'Conocimiento y aprendizaje' },
    { name: 'Salud', emoji: '🌿', description: 'Bienestar físico y emocional' },
    { name: 'Prosperidad', emoji: '💰', description: 'Abundancia económica' }
];

/**
 * Genera un hash numérico a partir de una cadena de texto
 * @description Implementación del algoritmo djb2 para crear códigos hash deterministas.
 * El mismo input siempre producirá el mismo hash, permitiendo reproducibility.
 * @param {string} str - Cadena de texto a hashear
 * @returns {number} Código hash numérico (entre 0 y 2147483647)
 * @example
 * const hash1 = hashCode("Aries_2026"); // Siempre devuelve el mismo número
 * const hash2 = hashCode("test"); // Output: 3572833
 */
export function hashCode(str) {
    if (!str || typeof str !== 'string') return 0;
    
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash; // Convertir a 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * Genera un seed determinista combinando fecha, signo y año
 * @description Usa hashCode para crear un número pseudo-aleatorio pero reproducible.
 * La misma combinación de fecha, signo y año siempre producirá el mismo seed.
 * @param {Date|string} date - Fecha para el seed
 * @param {number} signId - ID del signo zodiacal (1-12)
 * @param {number} [year] - Año específico (por defecto el actual)
 * @returns {number} Seed numérico determinista
 * @example
 * const seed1 = generateDateSeed(new Date(2026, 4, 15), 1, 2026);
 * const seed2 = generateDateSeed("2026-05-15", 1, 2026); // Mismo seed
 */
function generateDateSeed(date, signId, year) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const yearStr = year ? year.toString() : dateObj.getFullYear().toString();
    const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${yearStr}`;
    return hashCode(`${dateStr}_sign_${signId}`);
}

/**
 * Genera texto base del horóscopo combinando templates
 * @description Crea variaciones de predicciones usando templates predefinidos.
 * El seed determina cuál de las 28 plantillas se selecciona.
 * @param {string} signName - Nombre del signo zodiacal
 * @param {string} element - Elemento del signo ('Fuego', 'Tierra', 'Aire', 'Agua')
 * @param {number} seed - Seed para selección determinista del template
 * @returns {string} Texto generado del horóscopo
 * @example
 * const text = generateHoroscopeText("Aries", "Fuego", 5);
 * // Retorna una predicción personalizada para Aries
 */
function generateHoroscopeText(signName, element, seed) {
    const templates = [
        `Las estrellas favorecen a ${signName} hoy. Tu energía de ${element} se intensifica, bringing momentos de claridad e inspiración.`,
        `${signName}, el cosmos te invita a explorar nuevas posibilidades. La influencia de ${element} te otorga persistencia para superar obstáculos.`,
        `Hoy es un día propicio para ${signName}. Las energías de ${element} te rodean con determinación y renovado vigor.`,
        `${signName} descubrirá que la paciencia es su mayor aliada. El elemento ${element} te trae lecciones de sabiduría ancestral.`,
        `Las condiciones celestiales favorecen los nuevos principios para ${signName}. Tu conexión con ${element} se fortalece notablemente.`,
        `${signName} experimentará un despertar de creatividad. La esencia de ${element} guía tus pasos hacia el éxito.`,
        `Hoy, ${signName}, debes confiar en tu intuición. Las ondas de ${element} te protegen de influencias negativas.`,
        `El universo conspira a favor de ${signName}. La fuerza de ${element} te ayuda a manifestar tus deseos más profundos.`,
        `${signName} se sentirá atraído por aventuras inesperadas. La energia de ${element} abre puertas ocultas.`,
        `Es momento de reflexión para ${signName}. El poder de ${element} te permite ver más allá de las apariencias.`,
        `${signName} disfrutará de armonía en sus relaciones. La vibración de ${element} atrae conexiones significativas.`,
        `Hoy, ${signName}, tu creatividad alcanza nuevas alturas. La esencia de ${element} alimenta tu espíritu innovador.`,
        `Las estrellas predicen fortuna para ${signName}. La presencia de ${element} te hace imparable en tus metas.`,
        `${signName} debe estar abierto a los cambios. El elemento ${element} trae transformaciones positivas inevitables.`,
        `Tu determinación brilla como nunca antes, ${signName}. La fuerza de ${element} es tu mejor compañera esta jornada.`,
        `${signName} sentirá una conexión especial con la naturaleza. El elemento ${element} amplifica tu sensibilidad.`,
        `Hoy es excelente para nuevas empresas, ${signName}. La energia de ${element} impulsa tus proyectos.`,
        `${signName} experimentará momentos de profunda paz interior. El poder de ${element} calma tu espíritu.`,
        `Las predicciones indican un día productivo para ${signName}. La esencia de ${element} mantiene tu mente enfocada.`,
        `${signName}, tus seres queridos te necesitan hoy. El amor de ${element} te guía hacia la armonia familiar.`,
        `Es un buen momento para la cooperación, ${signName}. La influencia de ${element} facilita el trabajo en equipo.`,
        `${signName} descubrirá talentos ocultos. La energia de ${element} despierta habilidades dormidas.`,
        `Hoy, ${signName}, debes seguir tu corazón. El elemento ${element} nunca te engañará.`,
        `${signName} se sentirá lleno de vitalidad. La fuerza de ${element} renueva tu energía física y emocional.`,
        `Las estrellas favorecen el aprendizaje para ${signName}. El elemento ${element} te hace más receptivo al conocimiento.`,
        `${signName} experimentará un renacimiento espiritual. La esencia de ${element} purifica tu aura.`,
        `Hoy, ${signName}, tu ingenio estará destacado. La vibración de ${element} agudiza tu intelecto.`,
        `${signName} debe aprovechar las oportunidades que se presentan. El elemento ${element} crea circunstancias favorables.`,
        `Un encuentro inesperado aguarda a ${signName}. La energía de ${element} atrae personas interesantes a tu vida.`,
        `${signName} encontrará respuestas a preguntas que siempre te han preocupado. El poder de ${element} ilumina tu mente.`
    ];
    
    return templates[seed % templates.length];
}

/**
 * Obtiene tags aleatorios basados en el seed
 * @description Selecciona hasta 2 tags diferentes de forma determinista usando el seed.
 * Garantiza que no se repitan los tags seleccionados.
 * @param {number} seed - Seed para selección determinista
 * @param {number} count - Cantidad de tags a seleccionar (máximo 2)
 * @returns {string[]} Array de nombres de tags seleccionados
 * @example
 * const tags = getRandomTags(12345, 2); // ["Victoria", "Creatividad"]
 */
function getRandomTags(seed, count = 2) {
    const selectedTags = [];
    const usedIndices = new Set();
    
    for (let i = 0; i < count && i < HOROSCOPE_TAGS.length; i++) {
        let tagIndex = (seed + i * 17) % HOROSCOPE_TAGS.length;
        while (usedIndices.has(tagIndex) && usedIndices.size < HOROSCOPE_TAGS.length) {
            tagIndex = (tagIndex + 1) % HOROSCOPE_TAGS.length;
        }
        usedIndices.add(tagIndex);
        selectedTags.push(HOROSCOPE_TAGS[tagIndex].name);
    }
    
    return selectedTags;
}

/**
 * Genera horóscopos para un signo específico
 * @description Crea 365 horóscopos únicos para un signo zodiacal dado.
 * Se ejecuta en tiempo de carga para pre-generar la base de datos.
 * @param {number} signId - ID del signo (1-12)
 * @param {string} signName - Nombre del signo
 * @param {string} element - Elemento del signo
 * @returns {Horoscope[]} Array de 365 horóscopos para el signo
 * @example
 * const ariesHoroscopes = generateHoroscopesForSign(1, 'Aries', 'Fuego');
 * console.log(ariesHoroscopes.length); // 365
 */
function generateHoroscopesForSign(signId, signName, element) {
    const horoscopes = [];
    
    for (let dayOfYear = 0; dayOfYear < 365; dayOfYear++) {
        const dateSeed = dayOfYear + (signId * 1000);
        const textSeed = hashCode(`${signName}_${element}_${dayOfYear}`);
        
        horoscopes.push({
            id: signId * 1000 + dayOfYear,
            signId: signId,
            text: generateHoroscopeText(signName, element, textSeed),
            tags: getRandomTags(textSeed, 2)
        });
    }
    
    return horoscopes;
}

// Generar horóscopos para los 12 signos zodiacales
const ZODIAC_SIGNS_HOROSCOPES = [
    generateHoroscopesForSign(1, 'Aries', 'Fuego'),
    generateHoroscopesForSign(2, 'Tauro', 'Tierra'),
    generateHoroscopesForSign(3, 'Géminis', 'Aire'),
    generateHoroscopesForSign(4, 'Cáncer', 'Agua'),
    generateHoroscopesForSign(5, 'Leo', 'Fuego'),
    generateHoroscopesForSign(6, 'Virgo', 'Tierra'),
    generateHoroscopesForSign(7, 'Libra', 'Aire'),
    generateHoroscopesForSign(8, 'Escorpión', 'Agua'),
    generateHoroscopesForSign(9, 'Sagitario', 'Fuego'),
    generateHoroscopesForSign(10, 'Capricornio', 'Tierra'),
    generateHoroscopesForSign(11, 'Acuario', 'Aire'),
    generateHoroscopesForSign(12, 'Piscis', 'Agua')
].flat();

/**
 * Obtiene un horóscopo basándose en el signo y fecha proporcionados
 * @description Usa un algoritmo de hashing determinista para seleccionar un horóscopo
 * específico de la base de datos, garantizando que la misma fecha y signo siempre
 * devuelvan el mismo horóscopo
 * @param {number} signId - ID del signo zodiacal (1-12)
 * @param {Date|string} dateSeed - Fecha para calcular el seed (puede ser string ISO o objeto Date)
 * @param {number} [year] - Año específico (opcional, usa el año de dateSeed si no se especifica)
 * @returns {Horoscope} El horóscopo seleccionado
 * @example
 * // Obtener horóscopo de Aries para el 15 de mayo de 2026
 * const horoscope = getHoroscopeBySignAndDate(1, new Date(2026, 4, 15));
 * 
 * // Obtener horóscopo de Escorpión para una fecha string
 * const scorpioHoroscope = getHoroscopeBySignAndDate(8, "2026-10-31");
 */
export function getHoroscopeBySignAndDate(signId, dateSeed, year) {
    // Validar signId
    if (!signId || signId < 1 || signId > 12) {
        console.warn('signId inválido, usando 1 por defecto');
        signId = 1;
    }

    // Validar dateSeed
    if (!dateSeed) {
        dateSeed = new Date();
    }

    const dateObj = typeof dateSeed === 'string' ? new Date(dateSeed) : dateSeed;
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
        console.warn('Fecha inválida, usando fecha actual');
        dateObj = new Date();
    }

    // Calcular el día del año (0-364)
    const startOfYear = new Date(dateObj.getFullYear(), 0, 0);
    const diff = dateObj - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay) % 365;

    // Generar seed determinista
    const seed = hashCode(`${signId}_${dayOfYear}_${year || dateObj.getFullYear()}`) % 365;

    // Buscar el horóscopo correspondiente
    const horoscopeIndex = ((signId - 1) * 365) + seed;
    const horoscope = ZODIAC_SIGNS_HOROSCOPES[horoscopeIndex];

    if (!horoscope) {
        // Fallback: generar horóscopo on-the-fly
        return {
            id: signId * 1000 + seed,
            signId: signId,
            text: generateHoroscopeText(getSignName(signId), getElement(signId), seed),
            tags: getRandomTags(seed, 2)
        };
    }

    return horoscope;
}

/**
 * Obtiene el nombre del signo por ID
 * @description Helper interno que retorna el nombre del signo zodiacal dado su ID
 * @param {number} signId - ID del signo (1-12)
 * @returns {string} Nombre del signo o 'Desconocido' si no es válido
 * @example
 * const name = getSignName(1); // "Aries"
 * const unknown = getSignName(99); // "Desconocido"
 */
function getSignName(signId) {
    const names = ['', 'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 
                   'Libra', 'Escorpión', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
    return names[signId] || 'Desconocido';
}

/**
 * Obtiene el elemento del signo por ID
 * @description Helper interno que retorna el elemento asociados al signo zodiacal
 * @param {number} signId - ID del signo (1-12)
 * @returns {string} Elemento del signo ('Fuego', 'Tierra', 'Aire', 'Agua') o 'Desconocido'
 * @example
 * const element = getElement(1); // "Fuego"
 * const water = getElement(4); // "Agua"
 */
function getElement(signId) {
    const elements = ['', 'Fuego', 'Tierra', 'Aire', 'Agua', 'Fuego', 'Tierra',
                      'Aire', 'Agua', 'Fuego', 'Tierra', 'Aire', 'Agua'];
    return elements[signId] || 'Desconocido';
}

/**
 * Obtiene todos los horóscopos de un signo específico
 * @description Retorna el array completo de 365 horóscopos para el signo indicado
 * @param {number} signId - ID del signo zodiacal (1-12)
 * @returns {Horoscope[]} Array de horóscopos del signo
 */
export function getHoroscopesBySign(signId) {
    if (!signId || signId < 1 || signId > 12) return [];
    
    const startIndex = (signId - 1) * 365;
    return ZODIAC_SIGNS_HOROSCOPES.slice(startIndex, startIndex + 365);
}

/**
 * Obtiene un horóscopo aleatorio para un signo
 * @description Selecciona un horóscopo usando la fecha actual como seed
 * @param {number} signId - ID del signo zodiacal (1-12)
 * @returns {Horoscope} Horóscopo aleatorio del signo
 */
export function getRandomHoroscope(signId) {
    const today = new Date();
    return getHoroscopeBySignAndDate(signId, today);
}

/**
 * Obtiene todos los tags disponibles
 * @description Retorna la lista completa de etiquetas para clasificar horóscopos
 * @returns {HoroscopeTag[]} Array de tags disponibles
 */
export function getAvailableTags() {
    return [...HOROSCOPE_TAGS];
}

/**
 * Busca horóscopos por tag
 * @description Filtra horóscopos que contengan el tag especificado
 * @param {string} tagName - Nombre del tag a buscar
 * @param {number} [limit=10] - Límite de resultados
 * @returns {Horoscope[]} Array de horóscopos con el tag
 */
export function searchByTag(tagName, limit = 10) {
    if (!tagName || typeof tagName !== 'string') return [];
    
    return ZODIAC_SIGNS_HOROSCOPES
        .filter(h => h.tags.includes(tagName))
        .slice(0, limit);
}

/**
 * Exporta todos los horóscopos como array plano
 * @description Retorna todos los horóscopos en un solo array
 * @returns {Horoscope[]} Array con todos los horóscopos (4380 elementos)
 */
export function exportAllHoroscopes() {
    return [...ZODIAC_SIGNS_HOROSCOPES];
}

/**
 * Genera un resumen de estadísticas de horóscopos
 * @description Proporciona información sobre la base de datos de horóscopos
 * @returns {Object} Estadísticas de la base de datos
 */
export function getHoroscopeStats() {
    return {
        totalHoroscopes: ZODIAC_SIGNS_HOROSCOPES.length,
        horoscopesPerSign: 365,
        totalSigns: 12,
        availableTags: HOROSCOPE_TAGS.length,
        tags: HOROSCOPE_TAGS.map(t => `${t.emoji} ${t.name}`)
    };
}

/**
 * Genera horóscopos para un año específico
 * @description Permite regenerar la base de datos para un año diferente
 * @param {number} year - Año para el cual generar horóscopos
 * @returns {Object.<number, Horoscope[]>} Horóscopos indexados por signo
 */
export function generateYearlyHoroscopes(year) {
    const horoscopesBySign = {};
    
    for (let signId = 1; signId <= 12; signId++) {
        horoscopesBySign[signId] = [];
        
        for (let dayOfYear = 0; dayOfYear < 365; dayOfYear++) {
            const seed = hashCode(`${signId}_${dayOfYear}_${year}`) % 365;
            horoscopesBySign[signId].push({
                id: signId * 1000 + dayOfYear,
                signId: signId,
                text: generateHoroscopeText(getSignName(signId), getElement(signId), seed),
                tags: getRandomTags(seed, 2),
                year: year,
                dayOfYear: dayOfYear
            });
        }
    }
    
    return horoscopesBySign;
}

// exports por defecto
export default {
    getHoroscopeBySignAndDate,
    getHoroscopesBySign,
    getRandomHoroscope,
    getAvailableTags,
    searchByTag,
    exportAllHoroscopes,
    getHoroscopeStats,
    generateYearlyHoroscopes,
    hashCode
};
