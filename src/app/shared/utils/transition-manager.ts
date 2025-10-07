
export interface TransitionControl {
    element: HTMLElement;
    promise: Promise<TransitionResult>;
    cancel: () => void;
}
export interface TransitionResult {
    element: HTMLElement;
    status: "finished" | "canceled";
}

let currentTransition: TransitionControl | null = null;

export function runTransition(element: HTMLElement, action: () => void): TransitionControl {
    // cancelar transición previa
    if (currentTransition) {
        currentTransition.cancel();
        currentTransition = null;
    }

    let canceled = false;
    const promise = (async () => {
        action(); // dispara la transición
        await waitForTransitionEnd(element);
        let result :TransitionResult={ element, status: "finished" };
        if (canceled) {
            result.status='canceled'
            return result
        }
        return result
    })();

    currentTransition = {
        element,
        promise,
        cancel: () => { canceled = true; }
    };

    return currentTransition;
}

export function waitForTransitionEnd(element: HTMLElement) {
    return new Promise<HTMLElement>(resolve => {
        let resolved = false;
        const onEnd = () => {
            console.log('ftransicion ftferminada', element.offsetWidth)
            resolved = true
            element.removeEventListener('transitionend', onEnd)
            resolve(element);
        }
        element.addEventListener('transitionend', onEnd, { once: true })

        requestAnimationFrame(() => {
            const duration = getTransitionDurationMs(element)
            console.log(duration)
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    element.removeEventListener('transitionend', onEnd);
                    resolve(element);
                }
            }, duration + 50); // margen pequeño 
        })

    });
}

function getTransitionDurationMs(el: HTMLElement): number {
    requestAnimationFrame(() => {

    })
    void el.offsetWidth
    const style = getComputedStyle(el);

    const durations = style.transitionDuration.split(',')
        .map(d => parseFloat(d) || 0);

    const delays = style.transitionDelay.split(',')
        .map(d => parseFloat(d) || 0);

    // combinar cada duración con su delay correspondiente
    const times = durations.map((d, i) => (d + (delays[i] || 0)) * 1000);

    // devolver el mayor (el que realmente marca el fin de la transición)
    return Math.max(...times);
}

export function getCurrentTransition(): TransitionControl | null {
    return currentTransition;
}
