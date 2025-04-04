const template1 = new Template(
  "Bienvenida",
  "Hola me llamo José Velis, bienvenido al curso de progrmación funcional",
  "#hash1, #hash2",
  "link1",
  "date1"
);

template1.saveTemplate();
// template1.render();

const template2 = new Template(
  "Oferta especial",
  "Aprovecha esta oferta unica por el mes de Abril",
  "#hash1, #hash2",
  "link1",
  "date1"
);

template2.saveTemplate();
// template2.render();

const template3 = new Template(
  "Oferta especial",
  "Aprovecha esta oferta unica por el mes de Abril",
  "#hash1, #hash2",
  "link1",
  "date1"
);
template3.saveTemplate();

const template4 = new Template(
  "Oferta especial",
  "Aprovecha esta oferta unica por el mes de Abril",
  "#hash1, #hash2",
  "link1",
  "date1"
);
template4.saveTemplate();

const template5 = new Template(
  "Oferta especial",
  "Aprovecha esta oferta unica por el mes de Abril",
  "#hash1, #hash2",
  "link1",
  "date1"
);
template5.saveTemplate();

// podemos recorrer el arreglo
for (let template of templates) {
  template.render();
}
