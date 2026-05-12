# Especificación Técnica: El Oráculo Pokémon

## 1. Resumen del Proyecto

**Nombre del Proyecto:** El Oráculo Pokémon (PokeHoróscopo)
**Tipo de Aplicación:** Single Page Application (SPA) - Frontend Only
**Descripción:** Aplicación web que combina astrología con Pokémon, ofreciendo predicciones diarias únicas vinculando un signo zodiacal con un Pokémon específico mediante tags predefinidos.
**Usuario Objetivo:** Fans de astrología y Pokémon que buscan una experiencia lúdica y coleccionable.
**Idioma:** Español

---

## 2. Historia de Usuario

**COMO** usuario interesado en la astrología y fan de Pokémon,
**QUIERO** recibir una predicción diaria basada en mi signo zodiacal que esté vinculada a un Pokémon específico,
**PARA** conocer mi fortuna del día de una manera lúdica y coleccionable sin depender de textos generados aleatoriamente por IA.

---

## 3. Criterios de Aceptación

### 3.1 Configuración de Perfil

| ID | Criterio | Descripción |
|----|----------|-------------|
| CA-1.1 | Selección de Signo | El sistema debe permitir al usuario seleccionar su signo zodiacal (12 signos occidentales). |
| CA-1.2 | Cálculo por Fecha | El sistema debe calcular el signo automáticamente a partir de la fecha de nacimiento del usuario. |
| CA-1.3 | Persistencia | La elección del signo debe persistir en LocalStorage para futuras consultas. |
| CA-1.4 | Consultas Flexibles | El usuario debe poder consultar el horóscopo de cualquier signo (consultar otros). |
| CA-1.5 | Edición | Debe existir opción de editar el signo en cualquier momento. |

### 3.2 Generación del Horóscopo Diario

| ID | Criterio | Descripción |
|----|----------|-------------|
| CA-2.1 | Predicción Única | El sistema debe entregar una predicción diaria única por cada signo. |
| CA-2.2 | Repositorio Predefinido | El texto del horóscopo debe provenir de un repositorio de datos predefinido (no generado por IA). |
| CA-2.3 | Selección Determinista | El mismo signo debe ver el mismo horóscopo durante las 24 horas del día actual (Semilla = Fecha_Hoy + ID_Signo). |
| CA-2.4 | Volumen de Textos | 365 textos por signo (4380+ textos totales). Sistema de actualización anual. |

### 3.3 Lógica de Match con PokéAPI

| ID | Criterio | Descripción |
|----|----------|-------------|
| CA-3.1 | Match Lógico | El match debe basarse en una relación lógica entre tags del horóscopo y metadatos del Pokémon. |
| CA-3.2 | Tags Múltiples | Cada texto de horóscopo puede tener hasta 2 tags principales. |
| CA-3.3 | Variación Diaria | El Pokémon mostrado debe variar diariamente para evitar la monotonía. |
| CA-3.4 | Datos en Cache | El sistema debe implementar cache local con datos de los 1025+ Pokémon. |

### 3.4 Visualización de la "Carta Astral"

| ID | Criterio | Descripción |
|----|----------|-------------|
| CA-4.1 | Nombre y Signo | La interfaz debe mostrar el nombre y signo del usuario. |
| CA-4.2 | Texto del Horóscopo | Mostrar el texto de la predicción diaria. |
| CA-4.3 | Sprite del Pokémon | Mostrar la imagen (sprite) del Pokémon del día desde PokéAPI. |
| CA-4.4 | Tipos del Pokémon | Mostrar los tipos elementales del Pokémon. |
| CA-4.5 | Justificación del Match | Mostrar una breve justificación del match (ej: "Hoy tu energía es tipo Fuego"). |

---

## 4. Arquitectura Técnica

### 4.1 Estructura del Proyecto

```
PokeHoroscopo/
├── index.html              # Punto de entrada
├── SPEC.md                 # Esta especificación
├── README.md              # Documentación
├── src/
│   ├── css/
│   │   └── styles.css     # Estilos globales
│   ├── js/
│   │   ├── app.js         # Aplicación principal
│   │   ├── config.js      # Configuración global
│   │   ├── zodiac.js      # Datos de signos zodiacales
│   │   ├── horoscopes.js  # Base de datos de horóscopos
│   │   ├── pokemon.js     # Lógica de PokéAPI
│   │   ├── match.js       # Algoritmo de match
│   │   └── storage.js     # Gestión de LocalStorage
│   └── assets/
│       └── (recursos estáticos)
└── data/
    └── pokemon_cache.json # Cache de Pokémon (generado)
```

### 4.2 Tecnologías

| Tecnología | Propósito |
|------------|-----------|
| HTML5 | Estructura de la página |
| CSS3 | Estilos (diseño responsive mobile-first) |
| JavaScript (ES6+) | Lógica de la aplicación |
| LocalStorage | Persistencia de datos del usuario |
| PokéAPI (https://pokeapi.co/api/v2/) | Datos de Pokémon |

---

## 5. Datos y Estructuras

### 5.1 Signos Zodiacales

```javascript
const ZODIAC_SIGNS = [
  { id: 1, name: "Aries", symbol: "♈", element: "Fuego", dates: [[3, 21], [4, 19]] },
  { id: 2, name: "Tauro", symbol: "♉", element: "Tierra", dates: [[4, 20], [5, 20]] },
  { id: 3, name: "Géminis", symbol: "♊", element: "Aire", dates: [[5, 21], [6, 20]] },
  { id: 4, name: "Cáncer", symbol: "♋", element: "Agua", dates: [[6, 21], [7, 22]] },
  { id: 5, name: "Leo", symbol: "♌", element: "Fuego", dates: [[7, 23], [8, 22]] },
  { id: 6, name: "Virgo", symbol: "♍", element: "Tierra", dates: [[8, 23], [9, 22]] },
  { id: 7, name: "Libra", symbol: "♎", element: "Aire", dates: [[9, 23], [10, 22]] },
  { id: 8, name: "Escorpio", symbol: "♏", element: "Agua", dates: [[10, 23], [11, 21]] },
  { id: 9, name: "Sagitario", symbol: "♐", element: "Fuego", dates: [[11, 22], [12, 21]] },
  { id: 10, name: "Capricornio", symbol: "♑", element: "Tierra", dates: [[12, 22], [1, 19]] },
  { id: 11, name: "Acuario", symbol: "♒", element: "Aire", dates: [[1, 20], [2, 18]] },
  { id: 12, name: "Piscis", symbol: "♓", element: "Agua", dates: [[2, 19], [3, 20]] }
];
```

### 5.2 Sistema de Tags

| Tag | Descripción | Criterios de Match |
|-----|-------------|-------------------|
| #Victoria | Éxito, logro, triunfo | Habilidades: Victory Star, Big Shock; Tipos: Fire, Fighting |
| #Perseverancia | Resistencia, constancia | Habilidades: Sturdy, Inner Focus, Pressure; Tipos: Steel, Rock |
| #Transformación | Cambio, evolución | Habilidades: Protean, Color Change; Tipos: Psychic, Dragon |
| #Equilibrio | Armonía, balance | Habilidades: Levitate, Synchronize; Tipos: Fairy, Flying |
| #Introspección | Reflexión, análisis | Habilidades: Analytic, Own Tempo; Tipos: Ghost, Psychic |
| #Acción | Movimiento, energía | Habilidades: Speed Boost, Unburden; Tipos: Electric, Normal |

### 5.3 Estructura de Horóscopo

```javascript
{
  id: "aries_2024_001",
  signId: 1,
  signName: "Aries",
  date: "2024-01-01",
  tags: ["Victoria", "Acción"],
  text: "Tu energía está en su punto máximo hoy. Los astros favorecen...",
  pokemon: {
    id: 6,
    name: "Charizard",
    types: ["fire", "flying"],
    justification: "Tu energía tipo Fuego representa el espíritu ardiente de Aries."
  }
}
```

---

## 6. Algoritmos

### 6.1 Cálculo del Signo por Fecha de Nacimiento

```javascript
function calculateZodiacSign(month, day) {
  const signs = ZODIAC_SIGNS;
  for (const sign of signs) {
    const [startDate, endDate] = sign.dates;
    // Manejar Capricornio (mes 12-1)
    if (sign.id === 10) {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return sign;
    } else {
      if ((month === startDate[0] && day >= startDate[1]) ||
          (month === endDate[0] && day <= endDate[1])) return sign;
    }
  }
  return null;
}
```

### 6.2 Selección Determinista del Horóscopo

```javascript
function getDailyHoroscope(signId) {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const seed = hashCode(dateString + signId);

  // Seleccionar de los 365 textos del signo
  const index = Math.abs(seed) % 365;
  return horoscopes[signId][index];
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}
```

### 6.3 Algoritmo de Match Pokémon-Horóscopo

```javascript
async function findMatchingPokemon(tags, dateSeed) {
  const pokemon = getCachedPokemon();
  const eligible = pokemon.filter(p => hasMatchingTag(p, tags));
  const index = Math.abs(dateSeed) % eligible.length;
  return eligible[index];
}

function hasMatchingTag(pokemon, tags) {
  for (const tag of tags) {
    const criteria = TAG_MATCH_CRITERIA[tag];
    if (criteria.types.includes(pokemon.types[0]) ||
        criteria.abilities.some(a => pokemon.abilities.includes(a))) {
      return true;
    }
  }
  return false;
}
```

### 6.4 Justificación del Match

```javascript
function generateJustification(horoscope, pokemon, sign) {
  const primaryTag = horoscope.tags[0];
  const primaryType = pokemon.types[0];
  const elementSign = sign.element;

  return `Tu energía ${primaryTag} se refleja en ${pokemon.name}, un Pokémon tipo ${primaryType}. ${ELEMENT_RELATIONS[elementSign]}`;
}
```

---

## 7. Interfaz de Usuario (UI/UX)

### 7.1 Estructura de Pantallas

#### Pantalla 1: Configuración Inicial / Perfil
- Campo: Nombre de usuario (opcional)
- Campo: Fecha de nacimiento (opcional, para calcular signo)
- Campo: Selector de signo zodiacal (alternativo)
- Botón: "Guardar y Continuar"
- Link: "Consultar otro signo" (sin guardar)

#### Pantalla 2: Carta Astral (Principal)
- Header: Nombre del usuario + Signo zodiacal
- Fecha del día
- Texto del horóscopo
- Sección Pokémon:
  - Sprite del Pokémon
  - Nombre del Pokémon
  - Tipos (iconos)
  - Justificación del match
- Botones de acción:
  - "Consultar otro signo"
  - "Editar mi perfil"
- Footer: Fecha de última actualización

### 7.2 Diseño Visual

**Estilo:** Tarot cards / Cartas astrales estilizadas con temática Pokémon

**Paleta de Colores:**
- Fondo principal: #1a1a2e (azul oscuro místico)
- Fondo tarjeta: #16213e (azul noche)
- Acento primario: #e94560 (rojo vibración)
- Acento secundario: #0f3460 (azul profundo)
- Texto principal: #eaeaea (blanco suave)
- Texto secundario: #a0a0a0 (gris suave)

**Tipografía:**
- Títulos: "Cinzel" (elegante, místico)
- Cuerpo: "Lato" (legible, moderno)

**Efectos Visuales:**
- Gradientes en tarjetas
- Animaciones sutiles en sprites
- Bordes dorados en carta astral
- Efecto de "brillo estelar" en background

### 7.3 Responsive Design

| Dispositivo | Ancho | Layout |
|-------------|-------|--------|
| Mobile | < 768px | Carta astral centrada, scroll vertical |
| Tablet | 768px - 1024px | Carta astral más grande, menú lateral |
| Desktop | > 1024px | Carta astral maximalista, efectos reforzados |

---

## 8. Gestión de Datos

### 8.1 LocalStorage

```javascript
const STORAGE_KEYS = {
  USER_NAME: 'pokehoroscopo_username',
  USER_BIRTHDATE: 'pokehoroscopo_birthdate',
  USER_SIGN: 'pokehoroscopo_sign',
  LAST_CONSULT: 'pokehoroscopo_last_consult',
  POKEMON_CACHE: 'pokehoroscopo_pokemon_cache'
};
```

### 8.2 Cache de Pokémon

El sistema debe:
1. Al iniciar, cargar datos de PokéAPI y almacenarlos en LocalStorage
2. Actualizar cache cada 24 horas
3. Si no hay conexión, usar cache existente
4. Filtrar por atributos para matches rápidos

---

## 9. Requisitos No Funcionales

### 9.1 Performance

| Métrica | Target |
|---------|--------|
| Tiempo de carga inicial | < 3 segundos |
| Tiempo de generación de carta astral | < 500ms |
| Cache de Pokémon | < 5MB en LocalStorage |

### 9.2 Compatibilidad

| Navegador | Versión Mínima |
|-----------|----------------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

### 9.3 Accesibilidad

- Contraste mínimo WCAG AA
- Soporte para lectores de pantalla
- Navegación por teclado

---

## 10. Casos de Uso

### CU-01: Usuario Nuevo - Configuración de Perfil
1. Usuario abre la aplicación
2. Sistema muestra pantalla de configuración
3. Usuario ingresa nombre (opcional)
4. Usuario ingresa fecha de nacimiento O selecciona signo directamente
5. Sistema calcula signo si se dio fecha
6. Sistema guarda en LocalStorage
7. Sistema muestra Carta Astral del día

### CU-02: Usuario Retornante - Ver Horóscopo
1. Usuario abre la aplicación
2. Sistema detecta datos en LocalStorage
3. Sistema carga automáticamente el signo del usuario
4. Sistema genera Carta Astral del día

### CU-03: Consultar Otro Signo
1. Usuario hace clic en "Consultar otro signo"
2. Sistema muestra selector de signos
3. Usuario selecciona signo diferente
4. Sistema genera Carta Astral para ese signo
5. Sistema NO modifica el perfil guardado

### CU-04: Editar Perfil
1. Usuario hace clic en "Editar mi perfil"
2. Sistema muestra pantalla de configuración
3. Usuario modifica nombre, fecha o signo
4. Sistema actualiza LocalStorage
5. Sistema regenera Carta Astral

---

## 11. Glosario

| Término | Definición |
|---------|------------|
| Carta Astral | Visualización principal del horóscopo diario con Pokémon |
| Signo | Cada uno de los 12 signos zodiacales occidentales |
| Tag | Etiqueta que clasifica el tono del horóscopo |
| Match | Relación lógica entre horóscopo y Pokémon |
| Cache | Almacenamiento local para optimizar consultas |
| Semilla (Seed) | Valor hash para selección determinista |

---

## 12. Referencias

- PokéAPI: https://pokeapi.co/
- W3C Web Accessibility Guidelines
- MDN Web Docs - JavaScript

---

**Versión del Documento:** 1.0
**Fecha de Creación:** 2026-05-12
**Estado:** Especificación Completa - Lista para Desarrollo