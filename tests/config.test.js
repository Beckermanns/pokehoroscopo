/**
 * Tests para el módulo config.js
 * Verifica configuración, lógica de expiración y manejo de LocalStorage
 */

import { 
  STORAGE_KEYS,
  POKEAPI_CONFIG,
  ELEMENT_RELATIONS,
  ZODIAC_ELEMENTS,
  TAG_MATCH_CRITERIA,
  APP_CONFIG,
  COLOR_PALETTE,
  POKEMON_TYPE_COLORS,
  isCacheExpired,
  getStorageItem,
  setStorageItem
} from '../src/js/config.js';

describe('config.js - Configuración y Utilidades', () => {

  // Resetear localStorage antes de cada test
  beforeEach(() => {
    localStorage.clear();
  });

  describe('STORAGE_KEYS', () => {
    test('debe tener todas las claves requeridas', () => {
      expect(STORAGE_KEYS).toHaveProperty('USER_NAME');
      expect(STORAGE_KEYS).toHaveProperty('USER_BIRTHDATE');
      expect(STORAGE_KEYS).toHaveProperty('USER_SIGN');
      expect(STORAGE_KEYS).toHaveProperty('LAST_CONSULT');
      expect(STORAGE_KEYS).toHaveProperty('POKEMON_CACHE');
      expect(STORAGE_KEYS).toHaveProperty('HOROSCOPE_CACHE');
      expect(STORAGE_KEYS).toHaveProperty('CACHE_TIMESTAMP');
    });

    test('debe ser inmutable (Object.freeze)', () => {
      expect(() => {
        STORAGE_KEYS.NEW_KEY = 'value';
      }).toThrow();
    });
  });

  describe('POKEAPI_CONFIG', () => {
    test('debe tener configuración de API válida', () => {
      expect(POKEAPI_CONFIG.BASE_URL).toBe('https://pokeapi.co/api/v2');
      expect(POKEAPI_CONFIG.POKEMON_ENDPOINT).toBe('/pokemon');
      expect(POKEAPI_CONFIG.TOTAL_POKEMON).toBe(1025);
    });

    test('debe ser inmutable', () => {
      expect(() => {
        POKEAPI_CONFIG.NEW_URL = 'test';
      }).toThrow();
    });
  });

  describe('ELEMENT_RELATIONS', () => {
    test('debe tener 4 elementos', () => {
      expect(Object.keys(ELEMENT_RELATIONS)).toHaveLength(4);
    });

    test('debe incluir Fuego, Tierra, Aire y Agua', () => {
      expect(ELEMENT_RELATIONS).toHaveProperty('Fuego');
      expect(ELEMENT_RELATIONS).toHaveProperty('Tierra');
      expect(ELEMENT_RELATIONS).toHaveProperty('Aire');
      expect(ELEMENT_RELATIONS).toHaveProperty('Agua');
    });

    test('cada elemento debe tener descripción', () => {
      Object.values(ELEMENT_RELATIONS).forEach(desc => {
        expect(typeof desc).toBe('string');
        expect(desc.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ZODIAC_ELEMENTS', () => {
    test('debe tener 4 elementos zodiacales', () => {
      expect(Object.keys(ZODIAC_ELEMENTS)).toHaveLength(4);
    });

    test('cada elemento debe tener propiedades requeridas', () => {
      Object.values(ZODIAC_ELEMENTS).forEach(elem => {
        expect(elem).toHaveProperty('name');
        expect(elem).toHaveProperty('symbol');
        expect(elem).toHaveProperty('compatibleTypes');
      });
    });

    test('Fuego debe tener tipos compatibles correctos', () => {
      const fuego = ZODIAC_ELEMENTS.Fuego;
      expect(fuego.compatibleTypes).toContain('fire');
      expect(fuego.compatibleTypes).toContain('fighting');
      expect(fuego.compatibleTypes).toContain('dragon');
    });
  });

  describe('TAG_MATCH_CRITERIA', () => {
    test('debe tener criterios para tags específicos', () => {
      expect(TAG_MATCH_CRITERIA).toHaveProperty('Victoria');
      expect(TAG_MATCH_CRITERIA).toHaveProperty('Perseverancia');
      expect(TAG_MATCH_CRITERIA).toHaveProperty('Transformación');
      expect(TAG_MATCH_CRITERIA).toHaveProperty('Equilibrio');
      expect(TAG_MATCH_CRITERIA).toHaveProperty('Introspección');
      expect(TAG_MATCH_CRITERIA).toHaveProperty('Acción');
    });

    test('cada criterio debe tener types y abilities', () => {
      Object.values(TAG_MATCH_CRITERIA).forEach(criteria => {
        expect(criteria).toHaveProperty('types');
        expect(criteria).toHaveProperty('abilities');
        expect(Array.isArray(criteria.types)).toBe(true);
        expect(Array.isArray(criteria.abilities)).toBe(true);
      });
    });

    test('Victoria debe tener tipos de fuego/lucha/dragon', () => {
      const victoria = TAG_MATCH_CRITERIA.Victoria;
      expect(victoria.types).toContain('fire');
      expect(victoria.types).toContain('fighting');
      expect(victoria.types).toContain('dragon');
    });

    test('Introspección debe incluir tipos ghost/psychic/dark', () => {
      const introspeccion = TAG_MATCH_CRITERIA.Introspección;
      expect(introspeccion.types).toContain('ghost');
      expect(introspeccion.types).toContain('psychic');
      expect(introspeccion.types).toContain('dark');
    });
  });

  describe('APP_CONFIG', () => {
    test('debe tener configuración de cache válida', () => {
      expect(APP_CONFIG.CACHE_DURATION_MS).toBe(24 * 60 * 60 * 1000); // 24 horas
    });

    test('debe tener configuración de Pokémon', () => {
      expect(APP_CONFIG.MAX_POKEMON_FETCH).toBe(151);
    });

    test('debe ser inmutable', () => {
      expect(() => {
        APP_CONFIG.NEW_CONFIG = 'test';
      }).toThrow();
    });
  });

  describe('COLOR_PALETTE', () => {
    test('debe tener colores requeridos', () => {
      expect(COLOR_PALETTE).toHaveProperty('bgPrimary');
      expect(COLOR_PALETTE).toHaveProperty('accentPrimary');
      expect(COLOR_PALETTE).toHaveProperty('accentGold');
    });
  });

  describe('POKEMON_TYPE_COLORS', () => {
    test('debe tener colores para todos los tipos principales', () => {
      expect(POKEMON_TYPE_COLORS).toHaveProperty('fire');
      expect(POKEMON_TYPE_COLORS).toHaveProperty('water');
      expect(POKEMON_TYPE_COLORS).toHaveProperty('grass');
      expect(POKEMON_TYPE_COLORS).toHaveProperty('electric');
      expect(POKEMON_TYPE_COLORS).toHaveProperty('psychic');
      expect(POKEMON_TYPE_COLORS).toHaveProperty('ghost');
      expect(POKEMON_TYPE_COLORS).toHaveProperty('dragon');
    });

    test('cada color debe ser un string hex válido', () => {
      Object.values(POKEMON_TYPE_COLORS).forEach(color => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('isCacheExpired(timestamp)', () => {
    // Por defecto CACHE_DURATION_MS = 24 horas = 86400000 ms

    test('null debe retornar true (expired)', () => {
      const result = isCacheExpired(null);
      expect(result).toBe(true);
    });

    test('string vacío debe retornar true (expired)', () => {
      const result = isCacheExpired('');
      expect(result).toBe(true);
    });

    test('timestamp actual debe retornar false (no expired)', () => {
      const now = Date.now().toString();
      const result = isCacheExpired(now);
      expect(result).toBe(false);
    });

    test('timestamp antiguo (25 horas) debe retornar true (expired)', () => {
      const oldTimestamp = (Date.now() - (25 * 60 * 60 * 1000)).toString();
      const result = isCacheExpired(oldTimestamp);
      expect(result).toBe(true);
    });

    test('timestamp reciente (23 horas) debe retornar false', () => {
      const recentTimestamp = (Date.now() - (23 * 60 * 60 * 1000)).toString();
      const result = isCacheExpired(recentTimestamp);
      expect(result).toBe(false);
    });

    test('debe usar duración por defecto de 24 horas', () => {
      // Timestamp de 23 horas atrás no debe expirar (default)
      const almostExpired = (Date.now() - (23 * 60 * 60 * 1000)).toString();
      expect(isCacheExpired(almostExpired)).toBe(false);
      
      // Timestamp de 25 horas atrás debe expirar
      const expired = (Date.now() - (25 * 60 * 60 * 1000)).toString();
      expect(isCacheExpired(expired)).toBe(true);
    });
  });

  describe('getStorageItem(key, defaultValue)', () => {
    test('debe retornar defaultValue si la clave no existe', () => {
      const result = getStorageItem('nonExistent', 'default');
      expect(result).toBe('default');
    });

    test('debe retornar defaultValue null si no se especifica', () => {
      const result = getStorageItem('nonExistent');
      expect(result).toBeNull();
    });

    test('debe retornar valor almacenado', () => {
      localStorage.setItem('testKey', JSON.stringify('storedValue'));
      const result = getStorageItem('testKey', 'default');
      expect(result).toBe('storedValue');
    });

    test('debe parsear objetos correctamente', () => {
      const obj = { name: 'Test', value: 123 };
      localStorage.setItem('testKey', JSON.stringify(obj));
      const result = getStorageItem('testKey');
      expect(result).toEqual(obj);
    });

    test('debe manejar errores de parseo retornando defaultValue', () => {
      localStorage.setItem('testKey', 'invalid json');
      const result = getStorageItem('testKey', 'default');
      expect(result).toBe('default');
    });
  });

  describe('setStorageItem(key, value)', () => {
    test('debe guardar valor correctamente', () => {
      const result = setStorageItem('testKey', 'testValue');
      expect(result).toBe(true);
      expect(localStorage.getItem('testKey')).toBe('"testValue"');
    });

    test('debe guardar objetos correctamente', () => {
      const obj = { name: 'Test', value: 123 };
      const result = setStorageItem('testKey', obj);
      expect(result).toBe(true);
      
      const stored = localStorage.getItem('testKey');
      expect(JSON.parse(stored)).toEqual(obj);
    });

    test('debe retornar true al guardar valor', () => {
      const result = setStorageItem('testKey2', 'anotherValue');
      expect(result).toBe(true);
    });
  });
});