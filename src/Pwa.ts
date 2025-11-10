class Pwa {
    #serviceWorkerRegistration?: ServiceWorkerRegistration;
    constructor() {
        if (isSecureContext) {
            (async () => {
                this.#serviceWorkerRegistration = await navigator.serviceWorker.register("sw.js");
            })();
        }
    }
}
export const pwa = new Pwa();