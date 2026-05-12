# Arquitectura de El Oráculo Pokémon

## Descripción General

El Oráculo Pokémon es una aplicación web que combina la astrología zodiacal con el universo Pokémon para generar horóscopos personalizados. El sistema utiliza un enfoque de generación determinista basado en hashes para garantizar la reproducibilidad de las predicciones.

---

## Estructura de Módulos

```
src/
├── js/
│   ├── app.js           # Punto de entrada principal
│   ├── config.js        # Configuración global
│   ├── horoscopes.js    # Generación de horóscopos
│   ├── match.js         # Lógica de compatibilidad
│   ├── pokemon.js       # Datos de Pokémon
│   ├── storage.js       # Persistencia local
│   └── zodiac.js        # Datos y lógica zodiacal
└── css/
    └── styles.css       # Estilos de la aplicación
```

### Módulos Principales

| Módulo | Responsabilidad |
|--------|-----------------|
| `app.js` | Controlador principal de la aplicación |
| `config.js` | Variables de configuración globales |
| `horoscopes.js` | Generación de 4380+ horóscopos deterministas |
| `zodiac.js` | Datos de los 12 signos zodiacales |
| `pokemon.js` | Base de datos de Pokémon |
| `match.js` | Algoritmo de compatibilidad zodiacal |
| `storage.js` | Persistencia en localStorage |

---

## Flujo de Datos

```
┌─────────────────┐
│   Usuario       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   app.js       │
│ (Controlador)  │
└────────┬────────┘
         │
    ┌────┴────┬─────────────┐
    ▼         ▼             ▼
┌───────┐ ┌────────┐ ┌─────────────┐
│Zodiac │ │Pokemon  │ │ Horoscopes │
│ Module│ │ Module  │ │   Module    │
└───┬───┘ └────┬────┘ └──────┬──────┘
    │          │             │
    └──────────┴─────────────┘
              │
              ▼
       ┌──────────────┐
       │  Match Engine │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │   Storage    │
       └──────────────┘
```

### Flujo de Generación de Horóscopo

1. **Entrada**: Usuario ingresa fecha de nacimiento y selecciona signo zodiacal
2. **Hashing**: Se genera un código hash determinista usando algoritmo djb2
3. **Selección**: El hash determina el índice del template de horóscopo
4. **Generación**: Se combina el template con el elemento del signo
5. **Salida**: Se retorna el horóscopo con tags asociados

---

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                   app.js (UI Controller)              │  │
│  │  - Event listeners                                    │  │
│  │  - DOM manipulation                                   │  │
│  │  - User interactions                                  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE NEGOCIO                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │  zodiac.js   │ │ horoscopes.js│ │    match.js     │   │
│  │              │ │              │ │                  │   │
│  │  - calculate │ │  - hashCode  │ │  - compatibility│   │
│  │    ZodiacSign│ │  - generate  │ │  - calculate    │   │
│  │  - getZodiac │ │    Horoscope │ │    MatchScore   │   │
│  │  - elements  │ │  - getTags   │ │                  │   │
│  └──────────────┘ └──────────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE DATOS                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │ ZODIAC_SIGNS│ │  POKEMON_    │ │ ZODIAC_SIGNS_   │   │
│  │   (12)      │ │   DATA (151) │ │   HOROSCOPES    │   │
│  │              │ │              │ │   (4380)        │   │
│  └──────────────┘ └──────────────┘ └──────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                  storage.js                          │  │
│  │  - saveUserData()  - loadUserData()                  │  │
│  │  - savePreferences() - getHistory()                  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tecnologías Utilizadas

| Tecnología | Propósito | Versión |
|------------|-----------|---------|
| **JavaScript (ES6+)** | Lenguaje principal | ES2022 |
| **Jest** | Framework de testing | 29.7.0 |
| **Jest Environment jsdom** | Entorno de pruebas | 29.7.0 |
| **HTML5** | Estructura del DOM | - |
| **CSS3** | Estilos y layouts | - |
| **localStorage** | Persistencia de datos | - |

---

## Patrones de Diseño Implementados

### 1. Module Pattern (ES6 Modules)
Cada archivo JavaScript exporta funciones y datos como módulos independientes facilitando la composición y el testing.

### 2. Deterministic Hashing
El sistema utiliza el algoritmo djb2 para generar códigos hash reproducibles, garantizando que la misma fecha y signo siempre produzcan el mismo horóscopo.

### 3. Strategy Pattern
Los tags de horóscopo (Victoria, Perseverancia, Transformación, etc.) se seleccionan mediante una estrategia determinista basada en el seed.

### 4. Data-Driven Design
La aplicación define sus datos (signos zodiacales, Pokémon, horóscopos) como constantes externas, facilitando mantenimiento y extensión.

---

## Algoritmos Clave

### Hash Determinista (djb2)
```javascript
function hashCode(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}
```

### Cálculo de Signo Zodiacal
- Valida el rango de fechas para cada signo
- Maneja casos especiales (Capricornio cruza año nuevo)
- Retorna el signo correspondiente o Piscis por defecto

---

## Consideraciones de Rendimiento

1. **Pre-generación**: Los 4380 horóscopos se generan al cargar el módulo
2. **Complejidad O(1)**: La recuperación de horóscopos es constante gracias al índice pre-calculado
3. **Inmutabilidad**: Los datos zodiacales son constantes, evitando mutaciones inesperadas
4. **Caché en memoria**: Los datos se mantienen en memoria durante la sesión

---

## testing

El proyecto utiliza Jest como framework de testing con el entorno jsdom para simular el navegador.

```bash
npm test          # Ejecutar todos los tests
npm run test:watch # Modo watch
npm run test:coverage # Cobertura de código
```

### Archivos de Test
- `tests/zodiac.test.js` - Tests del módulo zodiacal
- `tests/horoscopes.test.js` - Tests de generación de horóscopos
- `tests/config.test.js` - Tests de configuración
- `tests/storage.test.js` - Tests de persistencia
- `tests/match.test.js` - Tests de compatibilidad