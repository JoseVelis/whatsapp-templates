// POO

function createStore(initialState = []) {
    // Estado interno de la funcion
    // variable privda
    let state = initialState; // por defecto es un []
  
    // arreglo de funciones que se ejecutan cuando el estado cambia
    const listeners = [];
  
    function getState() {
      return state;
    }
  
    function setState(newState) {
      state = newState;
  
      // se ejecuta cuando el estado cambia, por ende yo debo llamar a las funciones
      // que existen dentro de listeners
  
      // forEach
      listeners.forEach(function (listener) {
        listener(state);
      });
    }
  
    function addTemplate(newTemplate) {
      // ... => spread operator
      const newState = [...state, newTemplate];
  
      setState(newState);
    }
  
    function suscribe(listener) {
      listeners.push(listener);
  
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }
  
    function initializeStore() {
      const newTemplates = [
        new Template(
          "Bienvenida",
          "Hola me llamo Linder Hassinger, bienvenido al curso de progrmación funcional",
          "#hash1, #hash2",
          "link1",
          "date1"
        ),
        new Template(
          "Oferta especial",
          "Aprovecha esta oferta unica por el mes de Abril",
          "#hash1, #hash2",
          "link1",
          "date1"
        ),
      ];
  
      setState(newTemplates);
    }
  
    return {
      getState,
      setState,
      addTemplate,
      suscribe,
      initializeStore,
    };
  }
  
  const templatesStore = createStore([]);
  
  window.templatesStore = templatesStore;