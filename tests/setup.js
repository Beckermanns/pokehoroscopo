/**
 * Setup de Jest para El Oráculo Pokémon
 * Configura mocks de LocalStorage
 */

// Mock de LocalStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      return Object.keys(store)[index] || null;
    }
  };
})();

// Aplicar el mock globalmente
global.localStorage = localStorageMock;

// Función para resetear el localStorage mock entre tests
global.resetLocalStorage = () => {
  localStorageMock.clear();
};

// Nota: jest.fn() está disponible después de que Jest inicializa
// No usamos setupFilesAfterEnv para evitar problemas de inicialización