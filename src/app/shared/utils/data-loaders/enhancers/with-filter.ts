import { computed, Signal, signal } from "@angular/core";
import { ArrayKey, FILTER, ItemType, LoaderCore, LoaderWithFilter } from "../types";


export function withFilter<T extends object, R extends ArrayKey<T>>(loader: LoaderCore<T, R>):
 LoaderWithFilter<T, R> {

    const filterPredicate = signal<((item: ItemType<T, R>) => boolean) | null>(null);

    const filteredData = computed(() => {
        const allItems = loader.data();
        const predicate = filterPredicate();

        if (!predicate) {
            return allItems as T[R] & any[]
        }
        return allItems.filter(predicate) as T[R] & any[]

    });

    const setFilterPredicate = (predicate: ((item: ItemType<T, R>) => boolean) | null) => {
        filterPredicate.set(predicate);
    };

    loader.capabilities.add(FILTER)
    return {
        ...loader,
        setFilterPredicate,
        filteredData
    }
}

export function canFilter<T extends object, K extends ArrayKey<T>>
    (
        loader: LoaderCore<T, K> | undefined
    ): loader is LoaderWithFilter<T, K> {
    return !!loader && loader.capabilities.has(FILTER);
}