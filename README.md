# 🔮 El Oráculo Pokémon

> *Donde las estrellas encuentran a los Pokémon...*

Una aplicación web que combina astrología con el mundo Pokémon para generar predicciones diarias únicas basadas en tu signo zodiacal.

![Versión](https://img.shields.io/badge/version-1.0.0-blue)
![Tests](https://img.shields.io/badge/tests-passing-green)
![Licencia](https://img.shields.io/badge/license-MIT-green)
![PokéAPI](https://img.shields.io/badge/Powered%20by-PokéAPI-red)

## ✨ Características

- **🎯 Predicciones Diarias Únicas**: 365+ textos únicos por signo zodiacal (4380+ predicciones totales)
- **⚡ Match Inteligente**: Algoritmo que vincula tags del horóscopo con tipos y habilidades de Pokémon
- **💾 Persistencia Local**: Todos tus datos se guardan en LocalStorage (sin backend)
- **🎨 Diseño Responsivo**: Optimizado para móvil, tablet y desktop
- **♿ Accesibilidad**: Soporte para lectores de pantalla y navegación por teclado
- **🌙 Tema Oscuro/Claro**: Elige tu preferencia visual

## 🚀 Inicio Rápido

### Prerrequisitos

- Un navegador moderno (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Conexión a internet (para cargar datos de PokéAPI)

### Instalación

1. **Clona o descarga el proyecto**
   ```bash
   git clone <repository-url>
   cd PokeHoroscopo
   ```

2. **Abre el archivo HTML**
   - Simplemente abre `index.html` en tu navegador
   - O usa un servidor local:
     ```bash
     # Con Python
     python -m http.server 8000
     # Con Node.js
     npx serve
     ```

3. **¡Listo!** La aplicación funciona sin configuración adicional.

## 📖 Cómo Usar

### Configuración Inicial

1. **Abre la aplicación** → Verás la pantalla de configuración
2. **Ingresa tu nombre** (opcional)
3. **Selecciona tu fecha de nacimiento** (opcional) → Se calculará tu signo automáticamente
4. **O selecciona manualmente** tu signo zodiacal de la grilla
5. **Haz clic en "Ver Mi Carta Astral"**

### Explorando la Carta Astral

Tu carta astral incluye:
- **📝 Predicción del día**: Texto personalizado basado en tu signo
- **🏷️ Tags**: Etiquetas que clasifican tu energía del día
- **🎮 Pokémon del día**: Un Pokémon vinculado a tu horóscopo
- **💡 Justificación**: Explicación de por qué ese Pokémon representa tu energía

### Consultar Otros Signos

- Desde tu carta astral, haz clic en **"Consultar otro signo"**
- Explora las predicciones de otros signos sin modificar tu perfil

### Configuración

- Haz clic en el **ícono ⚙️** en la esquina superior derecha
- **Tema**: Oscuro/Claro
- **Animaciones**: Activar/Desactivar
- **Reducir movimiento**: Para usuarios sensibles
- **Limpiar cache**: Elimina datos almacenados
- **Exportar datos**: Backup de tu información

## 🏗️ Arquitectura del Proyecto

```
PokeHoroscopo/
├── index.html              # Punto de entrada
├── src/
│   ├── css/
│   │   └── styles.css      # Estilos (CSS Variables, Responsive)
│   └── js/
│       ├── app.js          # Controlador principal
│       ├── config.js       # Configuración global
│       ├── zodiac.js       # Datos de signos zodiacales
│       ├── horoscopes.js   # Generador de horóscopos
│       ├── pokemon.js      # Cliente de PokéAPI (con retry)
│       ├── match.js        # Algoritmo de matching
│       └── storage.js      # Gestión de LocalStorage
├── tests/                  # Tests unitarios (Jest)
├── SPEC.md                 # Especificación técnica
├── DEVELOPMENT_PLAN.md    # Plan de desarrollo
└── package.json             # Configuración de npm
```

## 🧪 Testing y Desarrollo

Instalación de dependencias:

```bash
npm install
```

Ejecutar tests unitarios:

```bash
npm test
```

Para coverage detallado:

```bash
npm run test:coverage
```

Ejecutar en modo desarrollo (servidor local):

```bash
npm run dev
```

## 🔧 Configuración

### Variables de Entorno (opcional)

El archivo `src/js/config.js` contiene configuraciones ajustables:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `MAX_POKEMON_FETCH` | Pokémon a cargar (1-1025) | 151 |
| `CACHE_DURATION_MS` | Duración del cache | 24 horas |
| `ANIMATION_DURATION` | Duración de animaciones | 300ms |

### PokéAPI

La aplicación usa [PokéAPI](https://pokeapi.co/) para obtener datos de Pokémon:
- **Endpoint base**: `https://pokeapi.co/api/v2`
- **Límite de rate**: ~100 requests/minuto
- **Retry automático**: 3 intentos con backoff exponencial

## 📱 Responsive Design

| Dispositivo | Breakpoint | Características |
|-------------|------------|----------------|
| Mobile | < 768px | Grid 3 columnas, scroll vertical |
| Tablet | 768px - 1024px | Grid 4 columnas, layout adaptado |
| Desktop | > 1024px | Layout maximalista, efectos reforzados |

## ♿ Accesibilidad

La aplicación cumple con las pautas WCAG AA:

- ✅ Contraste de colores verificado (4.5:1 ratio mínimo)
- ✅ Atributos ARIA implementados
- ✅ Navegación por teclado funcional
- ✅ Skip links para lectores de pantalla
- ✅ Soporte para `prefers-reduced-motion`
- ✅ Texto alternativo descriptivo en sprites

## 🐛 Solución de Problemas

### El sprite del Pokémon no carga
- La aplicación tiene fallback automático a artwork oficial
- Si falla, usa un sprite SVG genérico
- Puedes limpiar el cache en configuración

### LocalStorage lleno
- Ve a Configuración → "Limpiar cache"
- Se liberará espacio eliminando datos de Pokémon

### La aplicación no responde
- Presiona F5 para recargar
- Verifica tu conexión a internet
- Los datos de horóscopo funcionan offline (generados localmente)

## 🤝 Contribuir

1. **Fork** el repositorio
2. **Crea una rama** (`git checkout -b feature/nueva-funcion`)
3. **Commit** tus cambios (`git commit -m 'Agrega nueva función'`)
4. **Push** a la rama (`git push origin feature/nueva-funcion`)
5. **Abre un Pull Request**

### Guías de Estilo

- Usa JSDoc para documentar funciones
- Sigue la convención de commits semánticos
- Agrega tests para nuevas funcionalidades
- Mantén el código legible y con nombres descriptivos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Créditos

- **PokéAPI** - Por提供了 datos de Pokémon gratuitos
- **Google Fonts** - Por las fuentes Cinzel y Lato
- **Pokémon** - Propiedad de Nintendo/Game Freak/The Pokémon Company

## 📌 Notas de Versión

### v1.1.0 (2026-05-12)
- ✅ Retry automático para peticiones a PokéAPI
- ✅ Fallback para sprites que no cargan
- ✅ Tema claro/oscuro
- ✅ Panel de preferencias de usuario
- ✅ Limpieza automática de cache
- ✅ Mejoras de accesibilidad (ARIA labels)
- ✅ Navegación por teclado mejorada

### v1.0.0 (2026-05-12)
- ✅ Versión inicial con funcionalidades core
- ✅ 4380+ horóscopos predefinidos
- ✅ Sistema de matching Pokémon-horóscopo
- ✅ Persistencia en LocalStorage
- ✅ Diseño responsivo

---

**¿Preguntas o sugerencias?** Abre un issue en el repositorio.

⭐ Si te gusta el proyecto, ¡danos una estrella!