# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-12

### Added

- Sistema de horóscopos diarios con 365 textos únicos por signo zodiacal (4380+ textos totales)
- Match automático entre horóscopo y Pokémon basado en tags de energía
- Sistema de tags para clasificación: Victoria, Perseverancia, Transformación, Equilibrio, Introspección, Acción
- Persistencia de datos en LocalStorage (perfil de usuario, cache de Pokémon, cache de horóscopos)
- Tema claro/oscuro conmutador en configuración
- Panel de configuración completo con opciones de personalización
- Cálculo automático del signo zodiacal por fecha de nacimiento
- Selección determinista de horóscopo (semilla = fecha + ID signo)
- Cache de más de 1025 Pokémon desde PokéAPI
- Sistema de justificación del match entre horóscopo y Pokémon
- Exportación e importación de datos de usuario
- Estadísticas de uso y almacenamiento

### Fixed

- Export de hashCode en horoscopes.js para uso en otros módulos
- Fallback para cuando PokéAPI no responde (usa cache existente)
- Carga de módulos ES6 con soporte para VM Modules en Jest
- Validación de signId inválido (usa 1 por defecto)
- Validación de fecha inválida en cálculo zodiacal (usa Piscis por defecto)
- Manejo de errores de parseo JSON en LocalStorage

### Changed

- Interfaz mejorada con efectos visuales de "brillo estelar" y gradientes
- Paleta de colores optimizada: azul oscuro místico (#1a1a2e), rojo vibración (#e94560)
- Tipografía elegante con fuentes Cinzel (títulos) y Lato (cuerpo)
- Diseño responsive mobile-first para móviles, tablets y desktop
- Bordes dorados en carta astral estilo tarot
- Animaciones sutiles en sprites de Pokémon
- Validaciones robustas con mensajes de advertencia en consola

### Dependencies

- PokéAPI (https://pokeapi.co/) - Datos de más de 1025 Pokémon
- Jest v29.7.0 - Framework de testing unitario
- Jest Environment JSDOM v29.7.0 - Entorno de testing para navegador

### Architecture

- Arquitectura modular con separación de responsabilidades:
  - `app.js` - Aplicación principal y coordinación
  - `config.js` - Configuración global y utilidades
  - `zodiac.js` - Datos y funciones de signos zodiacales
  - `horoscopes.js` - Generación y gestión de horóscopos
  - `pokemon.js` - Integración con PokéAPI y cache
  - `match.js` - Algoritmo de matching Pokémon-Horóscopo
  - `storage.js` - Gestión de LocalStorage
- Cumplimiento de principios SOLID y Clean Code
- Patrón de diseño: SPA (Single Page Application) - Frontend Only

## [0.0.1] - 2026-05-12

### Added

- Versión inicial del proyecto
- Estructura base del documento SPEC.md
- Configuración inicial de npm y Jest
- Definición de la especificación técnica completa