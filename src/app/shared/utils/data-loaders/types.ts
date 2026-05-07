import { WritableSignal, Signal, ElementRef } from "@angular/core";
import { ParamsApi } from "../../../core/interfaces/shared/params-http.interface";

export type ArrayKey<T> = {
    [K in keyof T]: T[K] extends any[] ? K : never
}[keyof T];

export type ItemWithId = { id: number };

export const PAGINATION = Symbol('pagination');
export const DETAILS = Symbol('details');
export const FILTER = Symbol('filter');
export const INFINITE_SCROLL = Symbol('infinite_scroll');
export const AUTO_FILL = Symbol('auto_fill');

export type LoaderEnhancer<T extends object, K extends ArrayKey<T>> =
    (loader: AnyEnhancedLoader<T, K>) => AnyEnhancedLoader<T, K>;

export type PipeMethod<T extends object, K extends ArrayKey<T>> =
    (...enhancers: Array<LoaderEnhancer<T, K>>) => AnyEnhancedLoader<T, K>;

export type ItemType<T, R extends ArrayKey<T>> = T[R] extends (infer U)[] ? U : never;

export interface LoaderCore<T extends object, K extends keyof T> {
    mutableData: WritableSignal<T | undefined>;
    data: Signal<T[K] & any[]>;
    isInitialized: Signal<boolean>;
    hasData: Signal<boolean>;
    dataLength: Signal<number>;
    dataKey: K;
    extraArgs?: ParamsApi;
    readonly capabilities: Set<symbol>;
};

export interface LoaderWithPagination<T extends object, K extends keyof T> extends LoaderCore<T, K> {
    isFetchingMoreData: Signal<boolean>;
    loadMoreData: (params?: ParamsApi) => Promise<void>;
    canLoadMore: () => boolean;
};

export interface LoaderWithDetails<T extends object, K extends keyof T> extends LoaderCore<T, K> {
    loadDetails: (id: number) => Promise<void>;
};

export interface LoaderWithFilter<T extends object, K extends ArrayKey<T>> extends LoaderCore<T, K> {
    setFilterPredicate: (predicate: ((item: ItemType<T, K>) => boolean) | null) => void,
    filteredData: Signal<T[K] & any[]>;
};

export interface LoaderWithInfiniteScroll<T extends object, K extends ArrayKey<T>> extends LoaderCore<T, K> {
    setupInfiniteScroll: (
        sentinel: Signal<readonly ElementRef<HTMLElement> [] | undefined>,
        container?: Signal<ElementRef<HTMLElement> | undefined>,
    ) => void
};

export interface LoaderWithAutoFill<T extends object, K extends keyof T> extends LoaderCore<T, K> {
    setupAutoFill: (sentinel: Signal<readonly ElementRef<HTMLElement>  [] | undefined>,
        container?: Signal<ElementRef<HTMLElement> | undefined>) =>  void
};

export type AnyEnhancedLoader<T extends object, K extends keyof T> =
    | LoaderCore<T, K>
    | LoaderWithPagination<T, K>
    | LoaderWithDetails<T, K>
    | (LoaderWithPagination<T, K> & LoaderWithDetails<T, K>);