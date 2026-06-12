import { inject } from "@angular/core"
import { ParamsApi } from "../../../../core/interfaces/shared/params-http.interface"
import { ApiService } from "../../../../core/services/API/api.service"
import { ArrayKey,  LoaderWithDetails, ItemWithId, LoaderCore, DETAILS } from "../types"

export function WithDetails<T extends { type: string }, R extends ArrayKey<T>>
    (loader: LoaderCore<T, R>):  LoaderWithDetails<T, R> {
    const api = inject(ApiService)

    const loadDetails = async (id: number) => {
        if (!id) return
        const params: ParamsApi = { dataId: id, type: loader.mutableData()?.type }
        try {
            const details = await api.getDetails<ItemWithId>(params)

            if (!details) return

            console.log('actualizando detalles', loader)
            loader.mutableData.update((mediaList) => {
                if (!mediaList) return mediaList;

                const Items = mediaList[loader.dataKey]
                const arrayItems = Array.isArray(Items) ? Items : []
                const updatedResults = arrayItems.map(item =>
                    item.id === id ? details : item
                );

                return { ...mediaList, [loader.dataKey]: updatedResults };
            });
        } catch (error) {
            console.warn(' error en actualizacion', error)
        } finally {
            console.log(' detalles actualizados', loader.mutableData())
        }
    }

    loader.capabilities.add(DETAILS);
    return {
        ...loader,
        loadDetails
    }
}

export function canLoadDetails<T extends object, K extends keyof T>
    (
        loader: LoaderCore<T, K> | undefined
    ): loader is LoaderWithDetails<T, K> {
    return !!loader && loader.capabilities.has(DETAILS);

}