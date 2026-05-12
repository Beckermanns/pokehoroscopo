/**
 * Tests para el módulo storage.js
 * Verifica gestión de LocalStorage (con mocks)
 */

import { 
  saveUserProfile, 
  loadUserProfile, 
  hasUserProfile,
  clearUserData,
  savePokemonCache,
  loadPokemonCache,
  isCacheValid,
  getPokemonCacheAge,
  clearPokemonCache,
  saveHoroscopeCache,
  loadHoroscopeCache,
  isHoroscopeCacheValid,
  clearHoroscopeCache,
  exportUserData,
  importUserData,
  getStorageStats,
  formatBytes,
  clearAllAppData,
  isStorageAvailable
} from '../src/js/storage.js';

describe('storage.js - Gestión de LocalStorage', () => {

  // Resetear localStorage antes de cada test
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveUserProfile(profile) / loadUserProfile()', () => {
    const testProfile = {
      name: 'Juan Pérez',
      birthdate: '1990-05-15',
      signId: 5,
      signName: 'Leo'
    };

    test('debe guardar perfil correctamente', () => {
      const result = saveUserProfile(testProfile);
      expect(result).toBe(true);
    });

    test('debe cargar perfil guardado', () => {
      saveUserProfile(testProfile);
      const loaded = loadUserProfile();
      
      expect(loaded).toHaveProperty('name', 'Juan Pérez');
      expect(loaded).toHaveProperty('birthdate', '1990-05-15');
      expect(loaded).toHaveProperty('signId', 5);
      expect(loaded).toHaveProperty('signName', 'Leo');
    });

    test('perfil null debe retornar false', () => {
      const result = saveUserProfile(null);
      expect(result).toBe(false);
    });

    test('objeto vacío debe guardar valores por defecto', () => {
      saveUserProfile({});
      const loaded = loadUserProfile();
      expect(loaded).toHaveProperty('name', '');
    });

    test('loadUserProfile debe retornar null si no existe', () => {
      const loaded = loadUserProfile();
      expect(loaded).toBeNull();
    });

    test('hasUserProfile debe retornar false inicialmente', () => {
      expect(hasUserProfile()).toBe(false);
    });

    test('hasUserProfile debe retornar true después de guardar', () => {
      saveUserProfile(testProfile);
      expect(hasUserProfile()).toBe(true);
    });
  });

  describe('clearUserData()', () => {
    test('debe limpiar datos del usuario', () => {
      saveUserProfile({ name: 'Test', birthdate: '2000-01-01', signId: 1, signName: 'Aries' });
      clearUserData();
      expect(loadUserProfile()).toBeNull();
    });

    test('debe retornar true al limpiar', () => {
      const result = clearUserData();
      expect(result).toBe(true);
    });
  });

  describe('savePokemonCache(pokemons) / loadPokemonCache()', () => {
    const testPokemons = [
      { id: 1, name: 'Bulbasaur' },
      { id: 4, name: 'Charmander' },
      { id: 7, name: 'Squirtle' }
    ];

    test('debe guardar cache de Pokémon', () => {
      const result = savePokemonCache(testPokemons);
      expect(result).toBe(true);
    });

    test('debe cargar cache de Pokémon', () => {
      savePokemonCache(testPokemons);
      const loaded = loadPokemonCache();
      
      expect(loaded).toHaveLength(3);
      expect(loaded[0].name).toBe('Bulbasaur');
    });

    test('debe retornar null si no existe cache', () => {
      const loaded = loadPokemonCache();
      expect(loaded).toBeNull();
    });

    test('array vacío debe retornar true (el código solo verifica si es array)', () => {
      const result = savePokemonCache([]);
      expect(result).toBe(true);
    });

    test('no array debe retornar false', () => {
      const result = savePokemonCache('not an array');
      expect(result).toBe(false);
    });
  });

  describe('isCacheValid(durationMs)', () => {
    test('debe retornar false si no hay cache', () => {
      const result = isCacheValid();
      expect(result).toBe(false);
    });

    test('debe retornar true si el cache es reciente', () => {
      // Guardar timestamp actual
      const now = Date.now();
      localStorage.setItem('pokehoroscopo_pokemon_cache', JSON.stringify({
        data: [],
        timestamp: now.toString()
      }));
      
      const result = isCacheValid(24 * 60 * 60 * 1000); // 24 horas
      expect(result).toBe(true);
    });

    test('debe retornar false si el cache expiró', () => {
      // Guardar timestamp antiguo
      const oldTime = Date.now() - (25 * 60 * 60 * 1000); // 25 horas atrás
      localStorage.setItem('pokehoroscopo_pokemon_cache', JSON.stringify({
        data: [],
        timestamp: oldTime.toString()
      }));
      
      const result = isCacheValid(24 * 60 * 60 * 1000); // 24 horas
      expect(result).toBe(false);
    });

    test('debe manejar timestamp inválido', () => {
      localStorage.setItem('pokehoroscopo_pokemon_cache', JSON.stringify({
        data: []
        // sin timestamp
      }));
      
      const result = isCacheValid();
      expect(result).toBe(false);
    });
  });

  describe('getPokemonCacheAge()', () => {
    test('debe retornar null si no hay cache', () => {
      const age = getPokemonCacheAge();
      expect(age).toBeNull();
    });

    test('debe retornar número positivo si hay cache', () => {
      savePokemonCache([{ id: 1 }]);
      const age = getPokemonCacheAge();
      expect(typeof age).toBe('number');
      expect(age).toBeGreaterThanOrEqual(0);
    });
  });

  describe('clearPokemonCache()', () => {
    test('debe limpiar cache de Pokémon', () => {
      savePokemonCache([{ id: 1 }]);
      clearPokemonCache();
      expect(loadPokemonCache()).toBeNull();
    });

    test('debe retornar true', () => {
      const result = clearPokemonCache();
      expect(result).toBe(true);
    });
  });

  describe('saveHoroscopeCache(horoscopes) / loadHoroscopeCache()', () => {
    const testHoroscopes = {
      1: { text: 'Horóscopo de Aries' },
      2: { text: 'Horóscopo de Tauro' }
    };

    test('debe guardar cache de horóscopos', () => {
      const result = saveHoroscopeCache(testHoroscopes);
      expect(result).toBe(true);
    });

    test('debe cargar cache de horóscopos', () => {
      saveHoroscopeCache(testHoroscopes);
      const loaded = loadHoroscopeCache();
      
      expect(loaded).toHaveProperty('1');
      expect(loaded).toHaveProperty('2');
    });

    test('debe retornar null si no existe', () => {
      const loaded = loadHoroscopeCache();
      expect(loaded).toBeNull();
    });

    test('objeto inválido debe retornar false', () => {
      const result = saveHoroscopeCache('invalid');
      expect(result).toBe(false);
    });
  });

  describe('isHoroscopeCacheValid(durationMs)', () => {
    test('debe retornar false si no hay cache', () => {
      const result = isHoroscopeCacheValid();
      expect(result).toBe(false);
    });

    test('debe retornar true si el cache es reciente', () => {
      const now = Date.now();
      localStorage.setItem('pokehoroscopo_horoscope_cache', JSON.stringify({
        data: {},
        timestamp: now.toString()
      }));
      
      const result = isHoroscopeCacheValid(60 * 60 * 1000); // 1 hora
      expect(result).toBe(true);
    });
  });

  describe('clearHoroscopeCache()', () => {
    test('debe limpiar cache de horóscopos', () => {
      saveHoroscopeCache({ 1: {} });
      clearHoroscopeCache();
      expect(loadHoroscopeCache()).toBeNull();
    });

    test('debe retornar true', () => {
      const result = clearHoroscopeCache();
      expect(result).toBe(true);
    });
  });

  describe('exportUserData() / importUserData()', () => {
    test('exportUserData debe retornar objeto', () => {
      const data = exportUserData();
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('exportDate');
    });

    test('exportUserData debe incluir perfil del usuario', () => {
      saveUserProfile({ name: 'Test', birthdate: '2000-01-01', signId: 1, signName: 'Aries' });
      const data = exportUserData();
      expect(data.userProfile).toHaveProperty('name', 'Test');
    });

    test('importUserData debe importar correctamente', () => {
      const importData = {
        userProfile: { name: 'Imported', birthdate: '1995-01-01', signId: 3, signName: 'Géminis' }
      };
      
      const result = importUserData(importData);
      expect(result).toBe(true);
      
      const loaded = loadUserProfile();
      expect(loaded.name).toBe('Imported');
    });

    test('importUserData debe manejar merge', () => {
      saveUserProfile({ name: 'Original', birthdate: '2000-01-01', signId: 1, signName: 'Aries' });
      
      const importData = {
        userProfile: { name: 'Updated' }
      };
      
      importUserData(importData, { merge: true });
      const loaded = loadUserProfile();
      
      expect(loaded.name).toBe('Updated');
      // birthdate debe mantenerse
      expect(loaded.birthdate).toBe('2000-01-01');
    });

    test('importUserData debe retornar false para datos inválidos', () => {
      const result = importUserData(null);
      expect(result).toBe(false);
    });
  });

  describe('getStorageStats()', () => {
    test('debe retornar estadísticas', () => {
      const stats = getStorageStats();
      
      expect(stats).toHaveProperty('usedSpace');
      expect(stats).toHaveProperty('keysCount');
      expect(stats).toHaveProperty('isAvailable');
    });

    test('isAvailable debe ser true (mock)', () => {
      const stats = getStorageStats();
      expect(stats.isAvailable).toBe(true);
    });
  });

  describe('formatBytes(bytes)', () => {
    test('debe formatear 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    test('debe formatear kilobytes', () => {
      const result = formatBytes(1024);
      expect(result).toContain('KB');
    });

    test('debe formatear megabytes', () => {
      const result = formatBytes(1024 * 1024);
      expect(result).toContain('MB');
    });
  });

  describe('clearAllAppData()', () => {
    test('debe limpiar todos los datos de la app', () => {
      saveUserProfile({ name: 'Test' });
      savePokemonCache([{ id: 1 }]);
      saveHoroscopeCache({ 1: {} });
      
      clearAllAppData();
      
      expect(loadUserProfile()).toBeNull();
      expect(loadPokemonCache()).toBeNull();
      expect(loadHoroscopeCache()).toBeNull();
    });

    test('debe retornar true', () => {
      const result = clearAllAppData();
      expect(result).toBe(true);
    });
  });

  describe('isStorageAvailable()', () => {
    test('debe retornar true (mock disponible)', () => {
      const result = isStorageAvailable();
      expect(result).toBe(true);
    });
  });
});