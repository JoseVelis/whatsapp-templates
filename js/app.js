const templatesContainer = document.querySelector("#templates-container");
const btnNewTemplate = document.querySelector("#new-template");

btnNewTemplate.addEventListener("click", function () {
  const title = prompt("Ingrese titulo");
  const message = prompt("Ingrese message");
  const hashTags = prompt("Ingrese hashTags");

  window.templatesStore.addTemplate(
    new Template(title, message, hashTags, "link", "2025")
  );
});

function renderTemplates() {
  templatesContainer.innerHTML = "";

  // traer la lista de templates desde el store
  const templates = window.templatesStore.getState();

  templates.forEach(function (template) {
    const li = document.createElement("li"); // li
    li.classList.add("bg-white", "p-4", "my-3", "rounded");
    const h4 = document.createElement("h4");
    h4.classList.add("text-xl", "font-semibold");
    h4.textContent = template.title;
    const hr = document.createElement("hr");
    hr.classList.add("block", "my-3");
    const message = document.createElement("p");
    message.classList.add("text-md", "text-gray-500");
    message.textContent = template.message;
    const hashTag = document.createElement("p");
    hashTag.classList.add("text-sm", "mt-3", "text-green-800");
    hashTag.textContent = template.hashTag;
    li.appendChild(h4);
    li.appendChild(hr);
    li.appendChild(message);
    li.appendChild(hashTag);
    templatesContainer.appendChild(li);
  });
}

window.templatesStore.suscribe(renderTemplates);

document.addEventListener("DOMContentLoaded", function () {
  window.templatesStore.initializeStore();
});