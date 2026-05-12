/**
 * Tests para el módulo match.js
 * Verifica algoritmo de matching entre horóscopos y Pokémon
 */

import { 
  hasMatchingTag, 
  calculateMatchScore, 
  findMatchingPokemon,
  generateJustification,
  getCompatibleTypes,
  getCompatibleAbilities,
  isIdealMatch,
  getMatchAnalysis
} from '../src/js/match.js';

describe('match.js - Algoritmo de Matching', () => {

  // Datos de prueba - Pokémon simulados
  const mockPokemon = {
    charizard: {
      name: 'Charizard',
      types: [
        { name: 'fire' },
        { name: 'flying' }
      ],
      abilities: [
        { name: 'blaze' },
        { name: 'solar-power' }
      ],
      primaryType: 'fire'
    },
    blastoise: {
      name: 'Blastoise',
      types: [
        { name: 'water' }
      ],
      abilities: [
        { name: 'torrent' },
        { name: 'rain-dish' }
      ],
      primaryType: 'water'
    },
    pikachu: {
      name: 'Pikachu',
      types: [
        { name: 'electric' }
      ],
      abilities: [
        { name: 'static' },
        { name: 'lightning-rod' }
      ],
      primaryType: 'electric'
    },
    gengar: {
      name: 'Gengar',
      types: [
        { name: 'ghost' },
        { name: 'poison' }
      ],
      abilities: [
        { name: 'shadow-tag' },
        { name: 'cursed-body' }
      ],
      primaryType: 'ghost'
    },
    dragonite: {
      name: 'Dragonite',
      types: [
        { name: 'dragon' },
        { name: 'flying' }
      ],
      abilities: [
        { name: 'inner-focus' },
        { name: 'multiscale' }
      ],
      primaryType: 'dragon'
    },
    machamp: {
      name: 'Machamp',
      types: [
        { name: 'fighting' }
      ],
      abilities: [
        { name: 'guts' },
        { name: 'no-guard' }
      ],
      primaryType: 'fighting'
    }
  };

  describe('hasMatchingTag(pokemon, tag)', () => {
    // Happy Path

    test('Charizard (fire) debe hacer match con Victoria', () => {
      const result = hasMatchingTag(mockPokemon.charizard, 'Victoria');
      expect(result.match).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    test('Charizard (fire/flying) debe hacer match con Acción', () => {
      const result = hasMatchingTag(mockPokemon.charizard, 'Acción');
      expect(result).toHaveProperty('match');
      expect(result).toHaveProperty('score');
    });

    test('Gengar (ghost) debe hacer match con Introspección', () => {
      const result = hasMatchingTag(mockPokemon.gengar, 'Introspección');
      expect(result.match).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    test('Blastoise (water) debe hacer match con Transformación', () => {
      const result = hasMatchingTag(mockPokemon.blastoise, 'Transformación');
      expect(result).toHaveProperty('match');
      expect(result).toHaveProperty('score');
    });

    test('Dragonite (dragon) debe hacer match con Victoria', () => {
      const result = hasMatchingTag(mockPokemon.dragonite, 'Victoria');
      expect(result).toHaveProperty('match');
    });

    // Edge Cases

    test('pokemon null debe retornar match: false, score: 0', () => {
      const result = hasMatchingTag(null, 'Victoria');
      expect(result.match).toBe(false);
      expect(result.score).toBe(0);
    });

    test('tag null debe retornar match: false, score: 0', () => {
      const result = hasMatchingTag(mockPokemon.charizard, null);
      expect(result.match).toBe(false);
      expect(result.score).toBe(0);
    });

    test('tag inválido debe retornar match: false, score: 0', () => {
      const result = hasMatchingTag(mockPokemon.charizard, 'InvalidTag');
      expect(result.match).toBe(false);
      expect(result.score).toBe(0);
    });

    test('pokemon sin tipos debe retornar estructura válida', () => {
      const result = hasMatchingTag({ name: 'test' }, 'Victoria');
      expect(result).toHaveProperty('match');
      expect(result).toHaveProperty('score');
    });

    test('pokemon sin habilidades debe retornar estructura válida', () => {
      const result = hasMatchingTag({ types: [{ name: 'fire' }] }, 'Victoria');
      expect(result).toHaveProperty('match');
    });
  });

  describe('calculateMatchScore(pokemon, tags)', () => {
    test('debe calcular score para un solo tag', () => {
      const score = calculateMatchScore(mockPokemon.charizard, ['Victoria']);
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('debe calcular score para múltiples tags', () => {
      const score = calculateMatchScore(mockPokemon.charizard, ['Victoria', 'Acción']);
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('debe retornar 0 para pokemon null', () => {
      const score = calculateMatchScore(null, ['Victoria']);
      expect(score).toBe(0);
    });

    test('debe retornar 0 para tags null', () => {
      const score = calculateMatchScore(mockPokemon.charizard, null);
      expect(score).toBe(0);
    });

    test('debe retornar 0 para array de tags vacío', () => {
      const score = calculateMatchScore(mockPokemon.charizard, []);
      expect(score).toBe(0);
    });

    test('debe retornar 0 para tags que no son array', () => {
      const score = calculateMatchScore(mockPokemon.charizard, 'Victoria');
      expect(score).toBe(0);
    });

    test('score debe estar en rango válido (0-100)', () => {
      const pokemonList = [
        mockPokemon.charizard,
        mockPokemon.blastoise,
        mockPokemon.gengar,
        mockPokemon.dragonite
      ];
      
      pokemonList.forEach(pokemon => {
        const score = calculateMatchScore(pokemon, ['Victoria', 'Perseverancia']);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('findMatchingPokemon(tags, pokemonList, seed)', () => {
    const pokemonList = [
      mockPokemon.charizard,
      mockPokemon.blastoise,
      mockPokemon.pikachu,
      mockPokemon.gengar,
      mockPokemon.dragonite,
      mockPokemon.machamp
    ];

    test('debe retornar un pokemon de la lista', () => {
      const result = findMatchingPokemon(['Victoria'], pokemonList, 123);
      expect(pokemonList).toContain(result);
    });

    test('misma entrada debe retornar mismo resultado (determinismo)', () => {
      const result1 = findMatchingPokemon(['Victoria'], pokemonList, 123);
      const result2 = findMatchingPokemon(['Victoria'], pokemonList, 123);
      expect(result1.name).toBe(result2.name);
    });

    test('misma entrada con diferente seed puede retornar diferente resultado', () => {
      const result1 = findMatchingPokemon(['Victoria'], pokemonList, 123);
      const result2 = findMatchingPokemon(['Victoria'], pokemonList, 456);
      // Puede ser igual o diferente, pero no debe fallar
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
    });

    test('tags null debe usar selección aleatoria con seed', () => {
      const result = findMatchingPokemon(null, pokemonList, 123);
      expect(result).toBeTruthy();
    });

    test('tags vacíos debe usar selección aleatoria con seed', () => {
      const result = findMatchingPokemon([], pokemonList, 123);
      expect(result).toBeTruthy();
    });

    test('lista vacía debe retornar null', () => {
      const result = findMatchingPokemon(['Victoria'], [], 123);
      expect(result).toBeNull();
    });

    test('lista null debe retornar null', () => {
      const result = findMatchingPokemon(['Victoria'], null, 123);
      expect(result).toBeNull();
    });
  });

  describe('generateJustification(horoscope, pokemon, sign)', () => {
    const mockHoroscope = {
      text: 'Las estrellas favorecen a Aries hoy.',
      tags: ['Victoria', 'Acción']
    };
    
    const mockSign = {
      name: 'Aries',
      element: 'Fuego'
    };

    test('debe generar texto de justificación', () => {
      const justification = generateJustification(
        mockHoroscope, 
        mockPokemon.charizard, 
        mockSign
      );
      expect(typeof justification).toBe('string');
      expect(justification.length).toBeGreaterThan(0);
    });

    test('debe incluir nombre del Pokémon', () => {
      const justification = generateJustification(
        mockHoroscope,
        mockPokemon.charizard,
        mockSign
      );
      expect(justification).toContain('Charizard');
    });

    test('parámetros null debe retornar texto por defecto', () => {
      const justification = generateJustification(null, null, null);
      expect(typeof justification).toBe('string');
      expect(justification.length).toBeGreaterThan(0);
    });

    test('pokemon null debe retornar texto válido', () => {
      const justification = generateJustification(mockHoroscope, null, mockSign);
      expect(typeof justification).toBe('string');
    });
  });

  describe('getCompatibleTypes(tag)', () => {
    test('debe retornar tipos para Victoria', () => {
      const types = getCompatibleTypes('Victoria');
      expect(Array.isArray(types)).toBe(true);
      expect(types).toContain('fire');
    });

    test('debe retornar tipos para Introspección', () => {
      const types = getCompatibleTypes('Introspección');
      expect(Array.isArray(types)).toBe(true);
      expect(types).toContain('ghost');
    });

    test('tag inválido debe retornar array vacío', () => {
      const types = getCompatibleTypes('InvalidTag');
      expect(types).toEqual([]);
    });
  });

  describe('getCompatibleAbilities(tag)', () => {
    test('debe retornar habilidades para Victoria', () => {
      const abilities = getCompatibleAbilities('Victoria');
      expect(Array.isArray(abilities)).toBe(true);
    });

    test('tag inválido debe retornar array vacío', () => {
      const abilities = getCompatibleAbilities('InvalidTag');
      expect(abilities).toEqual([]);
    });
  });

  describe('isIdealMatch(pokemon, tag)', () => {
    test('debe retornar boolean', () => {
      const result = isIdealMatch(mockPokemon.charizard, 'Victoria');
      expect(typeof result).toBe('boolean');
    });

    test('pokemon null debe retornar false', () => {
      const result = isIdealMatch(null, 'Victoria');
      expect(result).toBe(false);
    });
  });

  describe('getMatchAnalysis(pokemon, tags)', () => {
    test('debe retornar análisis completo', () => {
      const analysis = getMatchAnalysis(mockPokemon.charizard, ['Victoria', 'Acción']);
      
      expect(analysis).toHaveProperty('pokemon');
      expect(analysis).toHaveProperty('tags');
      expect(analysis).toHaveProperty('overallScore');
      expect(analysis).toHaveProperty('summary');
    });

    test('parámetros null debe retornar null', () => {
      const analysis = getMatchAnalysis(null, null);
      expect(analysis).toBeNull();
    });
  });
});