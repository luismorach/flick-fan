import { computed, effect, signal, Signal, WritableSignal } from "@angular/core";
import { AnyEnhancedLoader, LoaderCore, ArrayKey, LoaderEnhancer, PipeMethod } from "./types";

export function useDataLoader<T extends object, K extends ArrayKey<T>>
    (dataKey: K, dataSource: Signal<T | undefined>): AnyEnhancedLoader<T, K> & { pipe: PipeMethod<T, K> } {

    const mutableData: WritableSignal<T | undefined> = signal(undefined)

    effect(() => {
        console.log('configurando data', dataSource())
        mutableData.set(dataSource());
    })

    const data = computed(() => {
        const current = mutableData()
        return (current ? current[dataKey] : []) as T[K] & any[];
    });

    const core: AnyEnhancedLoader<T, K> = {
        mutableData,
        data,
        isInitialized: computed(() => mutableData() !== undefined),
        hasData: computed(() => data().length > 0),
        dataLength: computed(() => data().length),
        dataKey,
        capabilities: new Set()
    }


    const pipe = createLoaderPipe<T, K>(core)

    return {
        ...core,
        pipe
    }
}

export function createLoaderPipe<T extends object, K extends ArrayKey<T>>(core: LoaderCore<T, K>) {

    function pipe(...enhancers: Array<LoaderEnhancer<T, K>>) {
        return enhancers.reduce(
            (currentLoader, enhancerFn) => enhancerFn(currentLoader),
            core
        ) as AnyEnhancedLoader<T, K>;
    }
    return pipe;
}





