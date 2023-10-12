const {invoke} = window.__TAURI__.tauri;

const COMMAND_PREFIX = "command:";

const patchedSend = async function (params) {
    // Make readonly properties writable
    Object.defineProperty(this, "readyState", {writable: true})
    Object.defineProperty(this, "status", {writable: true})
    Object.defineProperty(this, "statusText", {writable: true})
    Object.defineProperty(this, "response", {writable: true})

    // Set response
    const query = new URLSearchParams(params);
    this.response = await invoke(this.command, Object.fromEntries(query));
    this.readyState = XMLHttpRequest.DONE;
    this.status = 200;
    this.statusText = "OK";

    // We only need load event to trigger a XHR response
    this.dispatchEvent(new ProgressEvent("load"));
};

window.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener('htmx:beforeSend', (event) => {
        const path = event.detail.requestConfig.path;
        if (path.startsWith(COMMAND_PREFIX)) {
            event.detail.xhr.command = path.slice(COMMAND_PREFIX.length);
            event.detail.xhr.send = patchedSend;
        }
    });
});
