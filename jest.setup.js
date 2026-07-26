// Global mocks for browser APIs jsdom doesn't implement.
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };

  URL.createObjectURL = URL.createObjectURL || (() => 'blob:mock');
  URL.revokeObjectURL = URL.revokeObjectURL || (() => {});
}
