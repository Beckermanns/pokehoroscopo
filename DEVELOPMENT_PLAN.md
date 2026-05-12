# Plan de Desarrollo: El Oráculo Pokémon (PokeHoróscopo)

**Versión del Plan:** 1.0  
**Fecha de Creación:** 2026-05-12  
**Estado:** Aprobado para Desarrollo  
**Tipo de Proyecto:** SPA Frontend Only  
**Stack:** HTML5, CSS3, JavaScript (ES6+), LocalStorage, PokéAPI  

---

## Resumen Ejecutivo

Este plan de desarrollo divide el proyecto "El Oráculo Pokémon" en **8 fases secuenciales** con **35+ tareas específicas**, diseñadas para entregar un producto mínimo viable (MVP) en la primera mitad del desarrollo, con escalabilidad para futuras mejoras.

### Modelo de Dependencias

```
FASE 1 (Infraestructura) 
    ↓
FASE 2 (Datos/Modelos) ← FASE 1
    ↓
FASE 3 (Lógica de Negocio) ← FASE 2
    ↓
FASE 4 (Integración PokéAPI) ← FASE 3
    ↓
FASE 5 (UI/UX) ← FASE 1, FASE 3, FASE 4
    ↓
FASE 6 (Persistencia) ← FASE 2, FASE 5
    ↓
FASE 7 (Testing/Optimización) ← FASE 5, FASE 6
    ↓
FASE 8 (Documentación/Despliegue) ← TODAS LAS ANTERIORES
```

---

# FASE 1: INFRAESTRUCTURA BASE

**Objetivo:** Establecer la estructura del proyecto, configuración del entorno de desarrollo y scaffolding inicial.

**Complejidad:** Baja  
**Duración Estimada:** 1-2 días  
**Dependencias:** Ninguna (Inicio del proyecto)

## 1.1 Estructura de Archivos

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 1.1.1 | Crear estructura de carpetas | Implementar la estructura definida en SPEC.md sección 4.1 | Carpetas `src/css`, `src/js`, `src/assets`, `data/` creadas | Baja |
| 1.1.2 | Configurar archivo `index.html` | Punto de entrada con meta tags, viewport, CDN de fuentes | HTML válido, carga de Google Fonts (Cinzel, Lato) | Baja |
| 1.1.3 | Crear archivo de configuración | `src/js/config.js` con constantes globales (paleta de colores, endpoints, claves de LocalStorage) | Variables de entorno centralizadas | Baja |

## 1.2 Configuración de Logging y Debug

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 1.2.1 | Implementar módulo de logging | Sistema de logs con niveles (debug, info, warn, error) | Logs visibles solo en entorno de desarrollo | Baja |
| 1.2.2 | Implementar flags de feature | Sistema para activar/desactivar funcionalidades | Flag para mock data, cache bypass, etc. | Baja |

## 1.3 Verificación de Precondiciones

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 1.3.1 | Detección de soporte de LocalStorage | Verificar capacidad del navegador | Mensaje de advertencia si no hay soporte | Baja |
| 1.3.2 | Detección de conexión a PokéAPI | Verificar acceso a la API al cargar | Fallback a cache o modo offline | Baja |

---

## Checklist de Completitud - Fase 1

- [ ] Estructura de carpetas creada y verificada
- [ ] Archivo `index.html` con meta tags responsivos
- [ ] Fuentes de Google Fonts cargadas (Cinzel, Lato)
- [ ] Archivo `config.js` con todas las constantes
- [ ] Módulo de logging implementado
- [ ] Verificación de LocalStorage funcionando
- [ ] Verificación de conexión a PokéAPI al inicio

---

# FASE 2: DATOS Y MODELOS

**Objetivo:** Implementar las estructuras de datos estáticos: signos zodiacales, horóscopos, sistema de tags, y mapeos de elementos.

**Complejidad:** Media  
**Duración Estimada:** 3-5 días  
**Dependencias:** Fase 1 (completada)

## 2.1 Modelo de Signos Zodiacales

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 2.1.1 | Crear `src/js/zodiac.js` | Implementar array `ZODIAC_SIGNS` con los 12 signos (id, name, symbol, element, dates) | Test: verificar que todos los signos tengan rangos de fechas válidos | Baja |
| 2.1.2 | Implementar función `calculateZodiacSign(month, day)` | Algoritmo de cálculo de signo por fecha (incluir caso especial Capricornio) | Test: verificar los 12 signos con fechas límite (21-22 de cada mes) | Media |
| 2.1.3 | Agregar relaciones elemento-tag | Mapa de elementos a tags favoritos | Relación: Fuego→Victoria/Acción, Tierra→Perseverancia/Equilibrio, etc. | Baja |

## 2.2 Sistema de Tags

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 2.2.1 | Crear `src/js/tags.js` | Definir array `TAGS` con los 6 tags y sus criterios | Tags: #Victoria, #Perseverancia, #Transformación, #Equilibrio, #Introspección, #Acción | Baja |
| 2.2.2 | Implementar criterios de match | Mapa de criterios para cada tag (tipos, habilidades) | Criterios definidos según SPEC sección 5.2 | Media |
| 2.2.3 | Crear plantillas de justificación | Textos base para generar justificaciones automáticas | Plantillas con variables: {pokemon}, {type}, {element} | Baja |

## 2.3 Base de Datos de Horóscopos

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 2.3.1 | Diseñar estructura de horóscopo | Schema del objeto horóscopo según SPEC sección 5.3 | Estructura con id, signId, signName, date, tags, text | Baja |
| 2.3.2 | Crear archivo `src/data/horoscopes.json` | Repositorio de 4380+ textos (365 por signo) | Formato válido JSON, 12 secciones, 365 entradas cada una | Alta |
| 2.3.3 | Implementar loader de horóscopos | Función para cargar y parsear el archivo JSON | Carga asíncrona con manejo de errores | Media |

## 2.4 Estructura de Cache Pokémon

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 2.4.1 | Diseñar schema de Pokémon en cache | Estructura mínima: id, name, types, abilities, sprite | Solo campos necesarios para match (reducir tamaño) | Baja |
| 2.4.2 | Crear archivo `src/data/pokemon_schema.json` | Documentación del schema de Pokémon en cache | Documentación clara para futuras expansiones | Baja |

---

## Checklist de Completitud - Fase 2

- [ ] Array `ZODIAC_SIGNS` con 12 signos completo
- [ ] Función `calculateZodiacSign()` pasando todos los tests
- [ ] Array `TAGS` con 6 tags y criterios de match
- [ ] Archivo `horoscopes.json` con 4380+ entradas válidas
- [ ] Loader de horóscopos funcionando con manejo de errores
- [ ] Schema de Pokémon documentado y definido
- [ ] Relations elemento→tag implementadas

---

# FASE 3: LÓGICA DE NEGOCIO

**Objetivo:** Implementar los algoritmos core de la aplicación: selección determinista de horóscopo, match Pokémon-horóscopo, y generación de justificaciones.

**Complejidad:** Alta  
**Duración Estimada:** 3-4 días  
**Dependencias:** Fase 2 (completada)

## 3.1 Algoritmo de Selección de Horóscopo

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 3.1.1 | Implementar función `hashCode(str)` | Algoritmo de hash para generar seeds deterministas | Verificar reproducibilidad: misma entrada = misma salida | Media |
| 3.1.2 | Implementar `getDailySeed(signId)` | Combinar fecha actual + signId para generar seed única diaria | Verificar que seed cambie cada día (YYYY-MM-DD) | Baja |
| 3.1.3 | Implementar `getHoroscopeByIndex(signId, index)` | Seleccionar horóscopo por índice (0-364) | Retornar estructura completa del horóscopo | Baja |
| 3.1.4 | Implementar `getDailyHoroscope(signId)` | Función principal: seed → índice → horóscopo | Test: mismo signo + mismo día = mismo resultado | Media |

## 3.2 Motor de Match Pokémon-Horóscopo

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 3.2.1 | Implementar función `hasMatchingType(pokemon, tags)` | Verificar si algún tipo del Pokémon coincide con tags | Verificar contra los 6 tags | Media |
| 3.2.2 | Implementar función `hasMatchingAbility(pokemon, tags)` | Verificar si alguna habilidad del Pokémon coincide con tags | Habilidades: Victory Star, Sturdy, Protean, etc. | Media |
| 3.2.3 | Implementar función `filterEligiblePokemon(pokemonList, tags)` | Filtrar Pokémon candidatos según tags | Retornar array de Pokémon válidos | Media |
| 3.2.4 | Implementar función `selectDailyPokemon(tags, seed)` | Seleccionar Pokémon determinista del array filtrado | Distribución uniforme entre candidatos | Media |

## 3.3 Generador de Justificaciones

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 3.3.1 | Crear plantillas de justificación por tag | 6 plantillas base (una por tag) | Textos naturales que conecten tag con tipo de Pokémon | Media |
| 3.3.2 | Implementar función `generateJustification(horoscope, pokemon, sign)` | Generar texto de justificación dinámico | Incluir: nombre del Pokémon, tipo principal, elemento del signo | Media |
| 3.3.3 | Agregar variaciones contextuales | Diferentes textos según cantidad de tags (1 o 2) | 6 plantillas base + variantes para 2 tags | Alta |

## 3.4 Módulo de Negocio Principal

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 3.4.1 | Crear `src/js/oracle.js` | Orquestador principal: coordina todas las funciones de negocio | Interfaz simple: `getDailyReading(signId)` → Carta Astral completa | Media |
| 3.4.2 | Implementar manejo de errores | Try-catch con mensajes amigables para el usuario | Nunca mostrar errores técnicos al usuario | Media |
| 3.4.3 | Optimizar rendimiento | Memoización de resultados, evitar recálculos | Mismo día + mismo signo = usar cache | Media |

---

## Checklist de Completitud - Fase 3

- [ ] Función `hashCode()` pasando tests de reproducibilidad
- [ ] `getDailySeed()` generando seeds únicas por día
- [ ] `getDailyHoroscope()` retornando horóscopos correctos
- [ ] `hasMatchingType()` y `hasMatchingAbility()` funcionando
- [ ] `filterEligiblePokemon()` retornando candidatos válidos
- [ ] `selectDailyPokemon()` con distribución uniforme
- [ ] `generateJustification()` produciendo textos naturales
- [ ] Módulo `oracle.js` con interfaz simple
- [ ] Manejo de errores implementado

---

# FASE 4: INTEGRACIÓN POKÉAPI

**Objetivo:** Implementar la capa de integración con PokéAPI: cache local de Pokémon, fetching eficiente, y manejo de rate limits.

**Complejidad:** Alta  
**Duración Estimada:** 3-5 días  
**Dependencias:** Fase 3 (parcialmente completada)

## 4.1 Sistema de Cache de Pokémon

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 4.1.1 | Implementar `src/js/cache.js` | Módulo de gestión de cache (guardar, leer, invalidar) | Interfaz: `saveCache()`, `loadCache()`, `isCacheValid()`, `clearCache()` | Media |
| 4.1.2 | Implementar verificadores de cache | Comprobar expiración (24h), existencia, integridad | TTL de 24 horas implementado | Baja |
| 4.1.3 | Implementar compresión de cache | Reducir tamaño de LocalStorage (solo campos necesarios) | Comprimir datos antes de guardar | Media |
| 4.1.4 | Implementar prefetch inteligente | Descargar Pokémon en batches (25 por request) | No bloquear UI, descargar en background | Alta |

## 4.2 Cliente de PokéAPI

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 4.2.1 | Crear `src/js/pokemon.js` | Módulo de cliente con fetch básico | Función: `fetchPokemon(id)` → datos del Pokémon | Baja |
| 4.2.2 | Implementar rate limiting | Limitar requests a 100/min (estándar PokéAPI) | Queue de requests, retry con backoff | Alta |
| 4.2.3 | Implementar retry automático | Reintentar requests fallidos hasta 3 veces | Backoff exponencial (1s, 2s, 4s) | Media |
| 4.2.4 | Implementar fallback a cache | Si fetch falla, usar cache existente | Nunca mostrar pantalla vacía por error de red | Media |

## 4.3 Carga Inicial de Pokémon (Batch)

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 4.3.1 | Implementar `prefetchAllPokemon()` | Descargar los primeros 1025 Pokémon (total de la API) | Progress bar visible, no bloquear UI | Alta |
| 4.3.2 | Implementar indicador de progreso | Mostrar porcentaje de descarga completado | Barra de progreso o spinner en pantalla de carga | Media |
| 4.3.3 | Implementar cancelabilidad | Permitir cancelar la descarga si el usuario navega | No descargar si el usuario ya se fue de la página | Media |
| 4.3.4 | Implementar checkpoint resuming | Continuar descarga desde donde se quedó | Persistir estado de descarga parcial | Alta |

## 4.4 Transformación de Datos

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 4.4.1 | Mapear respuesta PokéAPI → cache schema | Extraer solo campos necesarios | id, name, types[], abilities[], sprites.front_default | Media |
| 4.4.2 | Normalizar datos de tipos | Mapear tipos a español (Fire→Fuego, etc.) | Función `normalizeType(type)` → string en español | Baja |
| 4.4.3 | Normalizar datos de habilidades | Mapear habilidades a español | Función `normalizeAbility(ability)` → string en español | Baja |

---

## Checklist de Completitud - Fase 4

- [ ] Módulo `cache.js` implementando operaciones CRUD
- [ ] Verificación de expiración (24h TTL) funcionando
- [ ] Cliente de PokéAPI con rate limiting
- [ ] Retry automático con backoff
- [ ] Fallback a cache cuando falla la red
- [ ] Descarga de 1025 Pokémon en background
- [ ] Progress bar visible durante carga
- [ ] Transformación de datos PokéAPI → schema interno

---

# FASE 5: INTERFAZ DE USUARIO (UI/UX)

**Objetivo:** Implementar todas las pantallas, componentes visuales, y lógica de navegación de la SPA según el diseño especificado.

**Complejidad:** Alta  
**Duración Estimada:** 5-7 días  
**Dependencias:** Fase 1, Fase 3, Fase 4 (parcialmente completadas)

## 5.1 Pantalla de Configuración / Perfil

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 5.1.1 | Crear estructura HTML del perfil | Formulario con campos: nombre, fecha nacimiento, selector de signo | Formulario accesible con labels y placeholders | Baja |
| 5.1.2 | Implementar selector de fecha nativo | Input type="date" con formato dd/mm/yyyy | Soporte para todos los navegadores | Baja |
| 5.1.3 | Implementar selector visual de signo | Cards visuales de los 12 signos zodiacales | Cards con símbolo, nombre y fechas | Media |
| 5.1.4 | Implementar auto-cálculo de signo | Al ingresar fecha, auto-seleccionar el signo | Calcular y resaltar el signo correspondiente | Media |
| 5.1.5 | Validación de formulario | Campos requeridos, formato válido, feedback visual | Mensajes de error inline | Media |

## 5.2 Pantalla de Carta Astral (Principal)

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 5.2.1 | Crear estructura HTML de la carta | Header, sección de horóscopo, sección de Pokémon, footer | Layout semántico y accesible | Baja |
| 5.2.2 | Implementar header con datos del usuario | Nombre, signo con símbolo y fecha del día | Formato legible, alineación correcta | Baja |
| 5.2.3 | Implementar sección de horóscopo | Texto de la predicción con tags visibles | Texto bien formateado, tags como badges | Baja |
| 5.2.4 | Implementar sección de Pokémon | Sprite, nombre, tipos (iconos), justificación | Mostrar sprite animado (shiny optional) | Media |
| 5.2.5 | Implementar botones de acción | "Consultar otro signo", "Editar perfil" | Botones visibles y accesibles | Baja |

## 5.3 Selector de Signo (Consultar Otro)

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 5.3.1 | Crear modal/overlay de selector | Pantalla flotante con los 12 signos | Animación de entrada/salida | Media |
| 5.3.2 | Implementar grid de signos | Layout responsivo de cards de signos | Grid adaptativo (2-4 columnas según viewport) | Media |
| 5.3.3 | Implementar cierre del selector | Botón X, click fuera, tecla Escape | Cerrar sin perder estado de la carta astral | Baja |

## 5.4 Estilos CSS (Diseño Visual)

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 5.4.1 | Implementar variables CSS | Paleta de colores, tipografías, espaciados | Variables responsivas (rem) | Baja |
| 5.4.2 | Estilar tarjeta principal (Carta Astral) | Fondo #16213e, bordes dorados, sombras, gradientes | Efecto de profundidad y misterio | Media |
| 5.4.3 | Estilar badges de tags | Colores distintivos por tag, iconos | Badges reconocibles y cohesivos | Baja |
| 5.4.4 | Estilar iconos de tipos | Iconos para cada tipo elemental (fuego, agua, etc.) | Iconos en formato SVG inline | Alta |
| 5.4.5 | Implementar animaciones sutiles | Transiciones de página, hover effects, entry animations | Animaciones CSS (no JS pesado) | Media |
| 5.4.6 | Implementar efecto de brillo estelar | Background con partículas o gradiente animado | Efecto decorativo pero no intrusivo | Media |

## 5.5 Responsive Design

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 5.5.1 | Implementar breakpoints CSS | Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px) | Media queries para cada breakpoint | Media |
| 5.5.2 | Diseño mobile-first | Priorizar layout para móviles | Touch targets de 44px mínimo | Media |
| 5.5.3 | Adaptar selector de signos | Grid de 3-4 columnas en mobile, 4-6 en desktop | Scroll horizontal evitado | Baja |
| 5.5.4 | Test de responsividad | Probar en múltiples dispositivos/viewports | Cross-browser testing | Media |

## 5.6 Navegación SPA (Sin Recarga)

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 5.6.1 | Implementar sistema de rutas | Hash-based routing (#/profile, #/reading, #/sign-selector) | Sin recarga de página | Media |
| 5.6.2 | Implementar transiciones de vista | Fade-in/out entre pantallas | Animaciones suaves | Media |
| 5.6.3 | Gestionar historial del navegador | Botón atrás funciona correctamente | Historia del navegador funcional | Media |

---

## Checklist de Completitud - Fase 5

- [ ] Pantalla de configuración con formulario funcional
- [ ] Selector visual de 12 signos funcionando
- [ ] Auto-cálculo de signo al ingresar fecha
- [ ] Pantalla de Carta Astral con todos los elementos
- [ ] Sprite de Pokémon visible y responsive
- [ ] Tags con badges estilizados
- [ ] Selector de signo (modal) con grid responsivo
- [ ] Paleta de colores aplicada consistentemente
- [ ] Tipografías (Cinzel, Lato) cargadas y aplicadas
- [ ] Animaciones sutiles implementadas
- [ ] Responsive design para mobile/tablet/desktop
- [ ] Navegación SPA sin recarga de página
- [ ] Efecto de brillo estelar en background

---

# FASE 6: PERSISTENCIA

**Objetivo:** Implementar la gestión de datos del usuario en LocalStorage, incluyendo perfil, preferencias, y cache de Pokémon.

**Complejidad:** Media  
**Duración Estimada:** 2-3 días  
**Dependencias:** Fase 2, Fase 5 (completadas)

## 6.1 Módulo de Almacenamiento

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 6.1.1 | Crear `src/js/storage.js` | Módulo centralizado para LocalStorage | Interfaz limpia: `get()`, `set()`, `remove()`, `clear()` | Baja |
| 6.1.2 | Implementar serialización JSON | Guardar/recuperar objetos como JSON | Manejo de parse errors | Baja |
| 6.1.3 | Implementar migraciones de datos | Versiones de schema para futuras actualizaciones | Función `migrate()` que actualice datos antiguos | Media |
| 6.1.4 | Implementar límite de almacenamiento | Verificar quota disponible antes de guardar | Advertir si se acerca al límite (5MB) | Media |

## 6.2 Persistencia del Perfil de Usuario

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 6.2.1 | Persistir nombre de usuario | Guardar en `pokehoroscopo_username` | Recuperar al cargar la app | Baja |
| 6.2.2 | Persistir fecha de nacimiento | Guardar en `pokehoroscopo_birthdate` | Formato ISO (YYYY-MM-DD) | Baja |
| 6.2.3 | Persistir signo seleccionado | Guardar en `pokehoroscopo_sign` (id del signo) | Recuperar y mostrar al cargar | Baja |
| 6.2.4 | Persistir fecha de última consulta | Guardar en `pokehoroscopo_last_consult` | Para detectar cambio de día | Baja |

## 6.3 Persistencia del Cache de Pokémon

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 6.3.1 | Guardar datos de Pokémon en cache | Serializar array de Pokémon en `pokehoroscopo_pokemon_cache` | Datos comprimidos para ahorrar espacio | Media |
| 6.3.2 | Persistir timestamp de cache | Guardar fecha de última actualización | Para verificar expiración (24h) | Baja |
| 6.3.3 | Implementar invalidación manual | Función para limpiar cache desde la UI | Botón "Forzar actualización" (debug) | Baja |

## 6.4 Restauración de Sesión

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 6.4.1 | Detectar sesión existente | Al cargar, verificar si hay datos en LocalStorage | Retornar objeto de usuario o null | Baja |
| 6.4.2 | Restaurar perfil automáticamente | Cargar datos y mostrar Carta Astral directamente | Sin pantalla de configuración | Media |
| 6.4.3 | Verificar si es un nuevo día | Comparar fecha actual con última consulta guardada | Si cambió el día, generar nuevo horóscopo | Media |
| 6.4.4 | Primera vez: detectar y mostrar configuración | Si no hay datos, mostrar pantalla de perfil | flow: CU-01 del SPEC | Baja |

---

## Checklist de Completitud - Fase 6

- [ ] Módulo `storage.js` con interfaz limpia
- [ ] Manejo de errores de serialización
- [ ] Sistema de migraciones implementado
- [ ] Persistencia de nombre, fecha, signo funcionando
- [ ] Persistencia de cache de Pokémon con timestamp
- [ ] Restauración automática de sesión al cargar
- [ ] Detección de "nuevo día" y recarga de horóscopo
- [ ] Límite de almacenamiento verificado

---

# FASE 7: TESTING Y OPTIMIZACIÓN

**Objetivo:** Garantizar calidad del código, performance óptima, y accesibilidad de la aplicación.

**Complejidad:** Media-Alta  
**Duración Estimada:** 3-4 días  
**Dependencias:** Fase 5, Fase 6 (completadas)

## 7.1 Testing Unitario

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 7.1.1 | Tests para `calculateZodiacSign()` | Verificar los 12 signos con fechas límite | Coverage: 100% de casos borde | Media |
| 7.1.2 | Tests para `hashCode()` | Reproducibilidad, colisiones, inputs límite | Verificar que misma entrada = misma salida | Media |
| 7.1.3 | Tests para `getDailyHoroscope()` | Semilla fija = mismo resultado | Test con fecha hardcodeada | Media |
| 7.1.4 | Tests para match logic | Verificar que Pokémon incorrectos sean filtrados | Test con tags específicos | Media |

## 7.2 Testing de Integración

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 7.2.1 | Test de flujo completo: perfil → carta astral | Simular usuario nuevo hasta carta astral | End-to-end en memoria (mock API) | Media |
| 7.2.2 | Test de flujo: consultar otro signo | Sin modificar perfil guardado | Verificar que perfil no cambie | Media |
| 7.2.3 | Test de flujo: editar perfil | Modificar y verificar actualización | Persistencia funcionando | Media |

## 7.3 Performance

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 7.3.1 | Medir tiempo de carga inicial | Target: < 3 segundos | Profile con DevTools | Media |
| 7.3.2 | Medir tiempo de generación de carta | Target: < 500ms | Benchmark de funciones core | Media |
| 7.3.3 | Optimizar críticos render path | CSS inline, JS al final, lazy load imágenes | First contentful paint < 1.5s | Alta |
| 7.3.4 | Minimizar tamaño de bundle | Concatenar y minificar CSS/JS | Target: < 100KB total | Media |

## 7.4 Accesibilidad (WCAG AA)

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 7.4.1 | Verificar contraste de colores | Texto sobre fondo cumple ratio 4.5:1 | Herramienta: Lighthouse, accessibility audit | Baja |
| 7.4.2 | Implementar atributos ARIA | Labels, roles, estados para lectores de pantalla | Screen reader testing (NVDA, VoiceOver) | Media |
| 7.4.3 | Navegación por teclado | Tab order, focus visible, shortcuts | Test con keyboard only | Media |
| 7.4.4 | Texto alternativo para imágenes | Alt text en sprites de Pokémon | Descriptivo y conciso | Baja |

## 7.5 Compatibilidad de Navegadores

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 7.5.1 | Test en Chrome 80+ | Funcionalidad completa | No hay errores en consola | Baja |
| 7.5.2 | Test en Firefox 75+ | Funcionalidad completa | No hay errores en consola | Baja |
| 7.5.3 | Test en Safari 13+ | Funcionalidad completa | No hay errores en consola | Baja |
| 7.5.4 | Test en Edge 80+ | Funcionalidad completa | No hay errores en consola | Baja |

## 7.6 Manejo de Errores y Edge Cases

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 7.6.1 | LocalStorage lleno | Mostrar mensaje amigable, ofrecer limpiar cache | No crashear, ofrecer solución | Media |
| 7.6.2 | PokéAPI no disponible | Fallback a cache, mensaje informativo | Nunca pantalla vacía | Media |
| 7.6.3 | Cache corrupto | Detectar y regenerar automáticamente | Log de error para debugging | Media |
| 7.6.4 | Fecha de nacimiento inválida | Validación y mensaje de error claro | No permitir guardar datos inválidos | Baja |

---

## Checklist de Completitud - Fase 7

- [ ] Tests unitarios para funciones core (hashCode, calculateZodiacSign, etc.)
- [ ] Tests de integración para flujos de usuario
- [ ] Performance: carga inicial < 3s, carta astral < 500ms
- [ ] Bundle < 100KB
- [ ] Contraste WCAG AA verificado
- [ ] Atributos ARIA implementados
- [ ] Navegación por teclado funcional
- [ ] Testado en Chrome, Firefox, Safari, Edge
- [ ] Edge cases manejados (sin LocalStorage, sin API, cache corrupto)

---

# FASE 8: DOCUMENTACIÓN Y DESPLIEGUE

**Objetivo:** Entregar la aplicación lista para producción con documentación completa.

**Complejidad:** Baja  
**Duración Estimada:** 1-2 días  
**Dependencias:** Todas las fases anteriores (completadas)

## 8.1 Documentación Técnica

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 8.1.1 | Crear `README.md` | Documentación de uso para usuarios finales | Instrucciones claras de cómo usar la app | Baja |
| 8.1.2 | Documentar arquitectura | Diagrama de arquitectura, explicación de módulos | Archivo ARCHITECTURE.md | Media |
| 8.1.3 | Documentar API interna | JSDoc para todas las funciones públicas | Documentación de funciones exportadas | Media |
| 8.1.4 | Crear CHANGELOG.md | Registro de cambios por versión | Formato semver (1.0.0, 1.1.0, etc.) | Baja |

## 8.2 Preparación para Despliegue

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 8.2.1 | Minificar CSS y JS | Generar versión de producción | Bundles optimizados | Media |
| 8.2.2 | Verificar que todos los recursos estén incluidos | Sprites fallback, fuentes offline, etc. | No depende de CDNs externos | Media |
| 8.2.3 | Configurar cache headers | Static assets con cache de 1 año | index.html con no-cache | Media |
| 8.2.4 | Verificar HTTPS | Si se despliega en servidor con SSL | Probar en localhost con self-signed | Baja |

## 8.3 Despliegue

| # | Tarea | Descripción | Criterio de Completitud | Complejidad |
|---|-------|-------------|------------------------|-------------|
| 8.3.1 | Desplegar a GitHub Pages / Netlify / Vercel | Plataforma gratuita para hosting estático | URL pública funcionando | Baja |
| 8.3.2 | Verificar funcionamiento en producción | Test completo post-despliegue | No hay errores 404, recursos cargan | Baja |
| 8.3.3 | Configurar dominio personalizado (opcional) | Si hay dominio disponible | Redirección configurada | Baja |

---

## Checklist de Completitud - Fase 8

- [ ] README.md completo y claro
- [ ] ARCHITECTURE.md con diagrama
- [ ] JSDoc en todas las funciones exportadas
- [ ] CHANGELOG.md con versión 1.0.0
- [ ] Versión de producción minificada
- [ ] Todos los recursos incluidos en build
- [ ] Desplegado y funcionando en producción
- [ ] Verificación post-despliegue exitosa

---

# RESUMEN DE FASES Y DURACIÓN TOTAL

| Fase | Nombre | Complejidad | Duración Estimada | Dependencias |
|------|--------|-------------|-------------------|--------------|
| 1 | Infraestructura Base | Baja | 1-2 días | Ninguna |
| 2 | Datos y Modelos | Media | 3-5 días | Fase 1 |
| 3 | Lógica de Negocio | Alta | 3-4 días | Fase 2 |
| 4 | Integración PokéAPI | Alta | 3-5 días | Fase 3 |
| 5 | Interfaz de Usuario | Alta | 5-7 días | Fase 1, 3, 4 |
| 6 | Persistencia | Media | 2-3 días | Fase 2, 5 |
| 7 | Testing y Optimización | Media-Alta | 3-4 días | Fase 5, 6 |
| 8 | Documentación y Despliegue | Baja | 1-2 días | Todas |
| **TOTAL** | - | - | **21-32 días** | - |

---

# DIAGRAMA DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────┐
│                         FASE 1: INFRAESTRUCTURA                  │
│                   (Estructura, Config, Logging)                 │
└────────────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FASE 2: DATOS Y MODELOS                  │
│              (Signos, Tags, Horóscopos, Schema)                 │
└────────────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASE 3: LÓGICA DE NEGOCIO                  │
│          (Hash, Selection, Match, Justifications)              │
└────────────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASE 4: INTEGRACIÓN POKÉAPI                  │
│               (Cache, Client, Fetch, Transform)                 │
└──────────┬─────────────────────┬───┴────────────────────────────┘
           │                     │
           ▼                     ▼
┌──────────────────┐    ┌───────────────────────────────────────┐
│    FASE 5: UI    │◄───│          FASE 5: UI (continuación)      │
│  (Config Screen) │    │      (Carta Astral, Selector, Styles)  │
└────────┬─────────┘    └────────┬──────────────────────────────┘
         │                       │
         └───────────────────────┤
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FASE 6: PERSISTENCIA                     │
│              (LocalStorage, Session, Cache Management)          │
└────────────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASE 7: TESTING Y OPTIMIZACIÓN                │
│          (Unit Tests, Performance, Accessibility, Cross-browser) │
└────────────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FASE 8: DOCUMENTACIÓN Y DESPLIEGUE             │
│                    (README, Build, Deploy, Release)              │
└─────────────────────────────────────────────────────────────────┘
```

---

# PRIORIZACIÓN PARA MVP

Si se necesita un MVP rápido, seguir este orden de prioridad:

## Sprint 1 (Días 1-7): Core Funcional
1. **Fase 1 completa** - Estructura y configuración
2. **Fase 2 parcial** - Solo Zodiac y Tags (sin horóscopos completos)
3. **Fase 3 completa** - Algoritmos core
4. **Fase 4 parcial** - Solo fetch single Pokémon (sin cache completo)
5. **Fase 5 parcial** - Solo Carta Astral (sin selector ni perfil)

## Sprint 2 (Días 8-14): Completitud
1. **Fase 2 completa** - 365 horóscopos por signo
2. **Fase 4 completa** - Cache de 1025 Pokémon
3. **Fase 5 completa** - Config screen y selector
4. **Fase 6 completa** - Persistencia

## Sprint 3 (Días 15-21): Calidad
1. **Fase 7 completa** - Testing y optimización
2. **Fase 8 completa** - Documentación y despliegue

---

# ESCALABILIDAD A FUTURO

## Features Opcionales (Post-MVP)

| Feature | Descripción | Prioridad | Fasebase |
|---------|-------------|-----------|----------|
| Temas/Oscuro | Modo oscuro/claro | Baja | 5 |
| Notificaciones | Recordatorio diario push | Media | 6,7 |
| Compartir | Generar imagen de carta astral | Media | 5 |
| Colección | Guardar Pokémon vistos (galería) | Media | 6 |
| Widget | Widget de escritorio | Baja | 4 |
| PWA | Soporte offline completo | Media | 7,8 |

## Mejoras de Arquitectura

| Mejora | Descripción | Impacto |
|--------|-------------|---------|
| Service Worker | Cache avanzado para PWA | Performance |
| Web Components | Componentes reutilizables | Mantenibilidad |
| TypeScript | Migración a TS | Type safety |
| Testing Framework | Jest/Puppeteer | Confianza |

---

**Documento creado por:** architecture-linter  
**Fecha:** 2026-05-12  
**Versión del Plan:** 1.0  
**Estado:** LISTO PARA EJECUCIÓN