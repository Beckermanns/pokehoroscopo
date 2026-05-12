/**
 * Tests para el módulo zodiac.js
 * Verifica funciones de cálculo y búsqueda de signos zodiacales
 */

import { 
  calculateZodiacSign, 
  getZodiacById, 
  getZodiacByName, 
  getZodiacsByElement,
  exportZodiacData,
  getDominantElement,
  ZODIAC_SIGNS 
} from '../src/js/zodiac.js';

describe('zodiac.js - Funciones de Signos Zodiacales', () => {

  describe('ZODIAC_SIGNS', () => {
    test('debe tener exactamente 12 signos', () => {
      expect(ZODIAC_SIGNS).toHaveLength(12);
    });

    test('cada signo debe tener las propiedades requeridas', () => {
      ZODIAC_SIGNS.forEach(sign => {
        expect(sign).toHaveProperty('id');
        expect(sign).toHaveProperty('name');
        expect(sign).toHaveProperty('symbol');
        expect(sign).toHaveProperty('element');
        expect(sign).toHaveProperty('dates');
        expect(sign).toHaveProperty('dateRange');
        expect(sign).toHaveProperty('traits');
        expect(sign).toHaveProperty('weaknesses');
      });
    });

    test('los IDs deben ir del 1 al 12', () => {
      const ids = ZODIAC_SIGNS.map(s => s.id);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });
  });

  describe('calculateZodiacSign(month, day)', () => {
    // Happy Path - Tests para cada signo zodiacal

    test('Aries: 21 de marzo debe retornar Aries', () => {
      const sign = calculateZodiacSign(3, 21);
      expect(sign.name).toBe('Aries');
    });

    test('Aries: 15 de abril debe retornar Aries', () => {
      const sign = calculateZodiacSign(4, 15);
      expect(sign.name).toBe('Aries');
    });

    test('Tauro: 20 de abril debe retornar Tauro', () => {
      const sign = calculateZodiacSign(4, 20);
      expect(sign.name).toBe('Tauro');
    });

    test('Tauro: 15 de mayo debe retornar Tauro', () => {
      const sign = calculateZodiacSign(5, 15);
      expect(sign.name).toBe('Tauro');
    });

    test('Géminis: 21 de mayo debe retornar Géminis', () => {
      const sign = calculateZodiacSign(5, 21);
      expect(sign.name).toBe('Géminis');
    });

    test('Cáncer: 21 de junio debe retornar Cáncer', () => {
      const sign = calculateZodiacSign(6, 21);
      expect(sign.name).toBe('Cáncer');
    });

    test('Leo: 23 de julio debe retornar Leo', () => {
      const sign = calculateZodiacSign(7, 23);
      expect(sign.name).toBe('Leo');
    });

    test('Virgo: 23 de agosto debe retornar Virgo', () => {
      const sign = calculateZodiacSign(8, 23);
      expect(sign.name).toBe('Virgo');
    });

    test('Libra: 23 de septiembre debe retornar Libra', () => {
      const sign = calculateZodiacSign(9, 23);
      expect(sign.name).toBe('Libra');
    });

    test('Escorpión: 23 de octubre debe retornar Escorpión', () => {
      const sign = calculateZodiacSign(10, 23);
      expect(sign.name).toBe('Escorpión');
    });

    test('Sagitario: 22 de noviembre debe retornar Sagitario', () => {
      const sign = calculateZodiacSign(11, 22);
      expect(sign.name).toBe('Sagitario');
    });

    // Capricornio - Caso especial que cruza el año nuevo
    test('Capricornio: 22 de diciembre debe retornar Capricornio', () => {
      const sign = calculateZodiacSign(12, 22);
      expect(sign.name).toBe('Capricornio');
    });

    test('Capricornio: 31 de diciembre debe retornar Capricornio', () => {
      const sign = calculateZodiacSign(12, 31);
      expect(sign.name).toBe('Capricornio');
    });

    test('Capricornio: 1 de enero debe retornar Capricornio', () => {
      const sign = calculateZodiacSign(1, 1);
      expect(sign.name).toBe('Capricornio');
    });

    test('Capricornio: 15 de enero debe retornar Capricornio', () => {
      const sign = calculateZodiacSign(1, 15);
      expect(sign.name).toBe('Capricornio');
    });

    test('Acuario: 20 de enero debe retornar Acuario', () => {
      const sign = calculateZodiacSign(1, 20);
      expect(sign.name).toBe('Acuario');
    });

    test('Piscis: 19 de febrero debe retornar Piscis', () => {
      const sign = calculateZodiacSign(2, 19);
      expect(sign.name).toBe('Piscis');
    });

    test('Piscis: 20 de marzo debe retornar Piscis (límite)', () => {
      const sign = calculateZodiacSign(3, 20);
      expect(sign.name).toBe('Piscis');
    });

    // Edge Cases

    test('mes inválido (0) debe retornar Piscis por defecto', () => {
      const sign = calculateZodiacSign(0, 15);
      expect(sign.name).toBe('Piscis');
    });

    test('mes inválido (13) debe retornar Piscis por defecto', () => {
      const sign = calculateZodiacSign(13, 15);
      expect(sign.name).toBe('Piscis');
    });

    test('día inválido (0) debe retornar Piscis por defecto', () => {
      const sign = calculateZodiacSign(5, 0);
      expect(sign.name).toBe('Piscis');
    });

    test('día inválido (32) debe retornar Piscis por defecto', () => {
      const sign = calculateZodiacSign(5, 32);
      expect(sign.name).toBe('Piscis');
    });

    test('null debe retornar Piscis por defecto', () => {
      const sign = calculateZodiacSign(null, null);
      expect(sign.name).toBe('Piscis');
    });

    test('undefined debe retornar Piscis por defecto', () => {
      const sign = calculateZodiacSign(undefined, undefined);
      expect(sign.name).toBe('Piscis');
    });
  });

  describe('getZodiacById(id)', () => {
    test('ID válido (1) debe retornar Aries', () => {
      const sign = getZodiacById(1);
      expect(sign.name).toBe('Aries');
    });

    test('ID válido (5) debe retornar Leo', () => {
      const sign = getZodiacById(5);
      expect(sign.name).toBe('Leo');
    });

    test('ID válido (10) debe retornar Capricornio', () => {
      const sign = getZodiacById(10);
      expect(sign.name).toBe('Capricornio');
    });

    test('ID válido (12) debe retornar Piscis', () => {
      const sign = getZodiacById(12);
      expect(sign.name).toBe('Piscis');
    });

    test('ID inválido (0) debe retornar undefined', () => {
      const sign = getZodiacById(0);
      expect(sign).toBeUndefined();
    });

    test('ID inválido (99) debe retornar undefined', () => {
      const sign = getZodiacById(99);
      expect(sign).toBeUndefined();
    });

    test('null debe retornar undefined', () => {
      const sign = getZodiacById(null);
      expect(sign).toBeUndefined();
    });
  });

  describe('getZodiacByName(name)', () => {
    test('nombre válido "Aries" debe retornar Aries', () => {
      const sign = getZodiacByName('Aries');
      expect(sign.id).toBe(1);
    });

    test('nombre válido "Leo" debe retornar Leo', () => {
      const sign = getZodiacByName('Leo');
      expect(sign.id).toBe(5);
    });

    test('nombre en minúsculas "aries" debe retornar Aries', () => {
      const sign = getZodiacByName('aries');
      expect(sign.id).toBe(1);
    });

    test('nombre en mayúsculas "LEO" debe retornar Leo', () => {
      const sign = getZodiacByName('LEO');
      expect(sign.id).toBe(5);
    });

    test('nombre con espacios "  Aries  " debe retornar Aries', () => {
      const sign = getZodiacByName('  Aries  ');
      expect(sign.id).toBe(1);
    });

    test('nombre inválido "XYZ" debe retornar undefined', () => {
      const sign = getZodiacByName('XYZ');
      expect(sign).toBeUndefined();
    });

    test('null debe retornar undefined', () => {
      const sign = getZodiacByName(null);
      expect(sign).toBeUndefined();
    });

    test('string vacío debe retornar undefined', () => {
      const sign = getZodiacByName('');
      expect(sign).toBeUndefined();
    });

    test('no string debe retornar undefined', () => {
      const sign = getZodiacByName(123);
      expect(sign).toBeUndefined();
    });
  });

  describe('getZodiacsByElement(element)', () => {
    test('Fuego debe retornar 3 signos (Aries, Leo, Sagitario)', () => {
      const signs = getZodiacsByElement('Fuego');
      expect(signs).toHaveLength(3);
      expect(signs.map(s => s.name)).toContain('Aries');
      expect(signs.map(s => s.name)).toContain('Leo');
      expect(signs.map(s => s.name)).toContain('Sagitario');
    });

    test('Tierra debe retornar 3 signos (Tauro, Virgo, Capricornio)', () => {
      const signs = getZodiacsByElement('Tierra');
      expect(signs).toHaveLength(3);
      expect(signs.map(s => s.name)).toContain('Tauro');
      expect(signs.map(s => s.name)).toContain('Virgo');
      expect(signs.map(s => s.name)).toContain('Capricornio');
    });

    test('Aire debe retornar 3 signos (Géminis, Libra, Acuario)', () => {
      const signs = getZodiacsByElement('Aire');
      expect(signs).toHaveLength(3);
      expect(signs.map(s => s.name)).toContain('Géminis');
      expect(signs.map(s => s.name)).toContain('Libra');
      expect(signs.map(s => s.name)).toContain('Acuario');
    });

    test('Agua debe retornar 3 signos (Cáncer, Escorpión, Piscis)', () => {
      const signs = getZodiacsByElement('Agua');
      expect(signs).toHaveLength(3);
      expect(signs.map(s => s.name)).toContain('Cáncer');
      expect(signs.map(s => s.name)).toContain('Escorpión');
      expect(signs.map(s => s.name)).toContain('Piscis');
    });

    test('elemento inválido debe retornar array vacío', () => {
      const signs = getZodiacsByElement('FakeElement');
      expect(signs).toHaveLength(0);
    });

    test('null debe retornar array vacío', () => {
      const signs = getZodiacsByElement(null);
      expect(signs).toHaveLength(0);
    });
  });

  describe('exportZodiacData()', () => {
    test('debe retornar un objeto con 12 entradas', () => {
      const data = exportZodiacData();
      expect(Object.keys(data)).toHaveLength(12);
    });

    test('cada entrada debe tener las propiedades del signo', () => {
      const data = exportZodiacData();
      expect(data[1]).toHaveProperty('name', 'Aries');
      expect(data[1]).toHaveProperty('element', 'Fuego');
    });
  });

  describe('getDominantElement(signIds)', () => {
    test('signos de Fuego debe retornar "Fuego"', () => {
      const result = getDominantElement([1, 5, 9]);
      expect(result).toBe('Fuego');
    });

    test('signos mixtos debe retornar el elemento más común', () => {
      const result = getDominantElement([1, 2, 3]); // Fuego, Tierra, Aire
      expect(result).toBeDefined();
    });

    test('array vacío debe retornar null', () => {
      const result = getDominantElement([]);
      expect(result).toBeNull();
    });

    test('null debe retornar null', () => {
      const result = getDominantElement(null);
      expect(result).toBeNull();
    });
  });
});