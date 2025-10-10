import { validateElement } from "./helpers";

const TRANSITION_STATUS = {
    PENDING: "pending",
    FINISHED: "finished",
    CANCELED: "canceled"
} as const;

const ERROR_MESSAGES = {
    ACTION_ERROR: '[TransitionManager] Action error:',
    TRANSITION_ERROR: '[TransitionManager] Transition error:'
} as const;

type TransitionStatus = typeof TRANSITION_STATUS[keyof typeof TRANSITION_STATUS];
type TransitionResultStatus = Exclude<TransitionStatus, "pending">;

interface TransitionContext {
    status: TransitionStatus;
    element: HTMLElement;
    deferred: Deferred<TransitionResult>;
}
interface Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error?: unknown) => void;
}
export interface TransitionControl {
    element: HTMLElement;
    promise: Promise<TransitionResult>;
    cancel: () => void;
}
export interface TransitionResult {
    element: HTMLElement;
    status: TransitionResultStatus;
}

let currentTransition: TransitionControl | null = null;
const TRANSITION_END_BUFFER_MS = 100;

/**
 * Executes a DOM transition with proper lifecycle management.
 * 
 * @param element - The HTMLElement to transition
 * @param action - Callback that triggers the transition (e.g., adding/removing classes)
 * @returns TransitionControl object with promise and cancel method
 * 
 * @example
 * ```ts
 * const control = runTransition(el, () => {
 *   el.classList.add('fade-in');
 * });
 * 
 * await control.promise; // Waits for transition to complete
 * // or
 * control.cancel(); // Cancel mid-transition
 * ```
 */
export function runTransition(element: HTMLElement, action: () => void): TransitionControl {
    validateElement(element)
    cancelCurrentTransition() // cancelar transición previa

    const deferred = createDeferred<TransitionResult>();
    const state: TransitionContext = { status: TRANSITION_STATUS.PENDING, element, deferred };

    executeTransitionAction(action, state);
    const cancelTransitionEnd = setupTransitionEnd(state);

    const cancel = () => {
        if (state.status === TRANSITION_STATUS.PENDING) {
            state.status = TRANSITION_STATUS.CANCELED;
            cancelTransitionEnd()
            deferred.resolve({ element, status: TRANSITION_STATUS.CANCELED });
        }
    };

    const control: TransitionControl = {
        element,
        promise: deferred.promise,
        cancel
    };

    currentTransition = control;
    deferred.promise.finally(() => {
        if (currentTransition === control) {
            currentTransition = null;
        }
    })

    return control;
}

function createDeferred<T>(): Deferred<T> {
    let resolve!: (value: T) => void;
    let reject!: (error?: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve, reject };
}

function executeTransitionAction(
    action: () => void,
    state: TransitionContext
) {
    try {
        action();
    } catch (error) {
        console.error(ERROR_MESSAGES.ACTION_ERROR, error);
        state.status = TRANSITION_STATUS.CANCELED;
        state.deferred.resolve({ element: state.element, status: TRANSITION_STATUS.CANCELED });
        return;
    }
}

function setupTransitionEnd(state: TransitionContext): () => void {
    const abortController = new AbortController();

    waitForTransitionEnd(state.element, abortController.signal).then(() => {
        if (state.status === TRANSITION_STATUS.PENDING) {
            state.status = TRANSITION_STATUS.FINISHED;
            state.deferred.resolve({ element: state.element, status: TRANSITION_STATUS.FINISHED });
        }
    }).catch((error: unknown) => {
        if (state.status === TRANSITION_STATUS.PENDING &&
            (error as Error)?.message !== 'Transition cancelled') {
            console.error(ERROR_MESSAGES.TRANSITION_ERROR, error);
            state.status = TRANSITION_STATUS.CANCELED;
            state.deferred.resolve({ element: state.element, status: TRANSITION_STATUS.CANCELED }); // Fallback
        }
    })

    return () => abortController.abort();
}

export function cancelCurrentTransition(): void {
    if (currentTransition) {
        currentTransition.cancel();
        currentTransition = null;
    }
}

export function waitForTransitionEnd(element: HTMLElement, signal?: AbortSignal) {
    return new Promise<void>((resolve, reject) => {

        if (signal?.aborted) {
            reject(new Error('Transition cancelled'));
            return;
        }

        let resolved = false;
        let timeoutId: number;

        const cleanup = () => {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
            element.removeEventListener('transitionend', onEnd);
            signal?.removeEventListener('abort', onAbort);
        };

        const onEnd = (event: TransitionEvent) => {
            if (event.target !== element || !event.propertyName || event.pseudoElement) return;
            finish();
        };

        const onAbort = () => {
            if (resolved) return;
            resolved = true;
            cleanup();
            reject(new Error('Transition cancelled'));
        };

        const finish = () => {
            if (resolved) return;
            resolved = true;
            cleanup()
            resolve();
        };

        element.addEventListener('transitionend', onEnd)
        signal?.addEventListener('abort', onAbort);

        const duration = getTransitionDurationMs(element);
        if (duration === 0) {
            finish();
            return;
        }
        timeoutId = window.setTimeout(finish, duration + TRANSITION_END_BUFFER_MS);
    });
}

function getTransitionDurationMs(el: HTMLElement): number {
    const style = getComputedStyle(el);

    let maxTime = 0;
    const durations = style.transitionDuration.split(',');
    const delays = style.transitionDelay.split(',');

    for (let i = 0; i < Math.max(durations.length, delays.length); i++) {
        const duration = parseFloat(durations[i]) || 0;
        const delay = parseFloat(delays[i]) || 0;
        const totalTime = (duration + delay) * 1000;

        if (totalTime > maxTime) maxTime = totalTime;
    }

    return maxTime;
}

export function getCurrentTransition(): TransitionControl | null {
    return currentTransition;
}
