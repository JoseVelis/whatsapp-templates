function saveTemplates() {
    // tenemos acceso al store?
    // window.templateStore.getState()
    localStorage.setItem(
        "templates",
        JSON.stringify(window.templateStore.getState().templates)
    )
}