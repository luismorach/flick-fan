import { computed, effect, signal, Signal, WritableSignal } from "@angular/core";
import { LoaderCore, ArrayKey, LoaderEnhancer,  LoaderBuilder } from "./types";
import { ParamsApi } from "../../../core/interfaces/shared/params-http.interface";

export function useDataLoader<T extends object, K extends ArrayKey<T>>
    (dataKey: K, dataSource: Signal<T | undefined>, extraArgs?: ParamsApi): LoaderBuilder<T, K, LoaderCore<T, K>> {

    const mutableData: WritableSignal<T | undefined> = signal(undefined)

    effect(() => {
        console.log('configurando data', dataSource())
        mutableData.set(dataSource());
    })

    const data = computed(() => {
        const current = mutableData()
        return (current ? current[dataKey] : []) as T[K] & any[];
    });

    const core: LoaderCore<T, K> = {
        mutableData,
        data,
        isInitialized: computed(() => mutableData() !== undefined),
        hasData: computed(() => data().length > 0),
        dataLength: computed(() => data().length),
        dataKey,
        extraArgs,
        capabilities: new Set()
    }

    return new LoaderBuilder<T, K, LoaderCore<T, K>>(core);
    
}
