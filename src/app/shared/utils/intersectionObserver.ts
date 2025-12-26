import { DestroyRef, inject, Injectable, WritableSignal } from "@angular/core";
import { ApiService } from "../../core/services/API/api.service";
import { ParamsApi } from "../../core/interfaces/shared/params-http.interface";
import { Movie } from "../../core/interfaces/movie/movie.interface";
import { Serie } from "../../core/interfaces/serie/serie.interface";
import { PaginatedData } from "../../core/interfaces/shared/generic.interface";

@Injectable()
export class IntersectionObserverManager<T extends Movie | Serie> {

    private readonly api: ApiService = inject(ApiService)
    private readonly destroyRef = inject(DestroyRef)
    private observer !: IntersectionObserver
    private observed = new Set<Element>();
    private pendingRequests = new Map<number, Promise<T | undefined>>();
    private root?: Element

    constructor() {
        this.destroyRef.onDestroy(() => {
            this.observer?.disconnect();
            this.observed.clear();
        });
    }

    async setupIntersectionObserver(root: Element, data: WritableSignal<PaginatedData<T> | undefined>) {
        if (this.observer) return
        this.root = root
        console.log('configurando intersecton oberver')
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return

                    const target = entry.target
                    const id = Number(target.getAttribute('data-id'));

                    if (!id) return;
                    if (target.hasAttribute('data-loaded')) return;

                    target.setAttribute('data-loaded', 'true');
                    this.updateData(data, id)
                });
            },
            {
                root: root,
                threshold: 0.1,
                rootMargin: '100px 0px'
            }
        );

        this.observeNewSlides()
    }

    observeNewSlides() {
        if (!this.root) return
        const elements = this.getElements(this.root)
        elements.forEach((element) => {
            if (!this.observed.has(element)) {
                this.observer.observe(element);
                this.observed.add(element);
            }
        });
    }

    private getElements(root: Element) {
        if (!root) return [];
        const elements = root.children
        return Array.from(root.children) as HTMLElement[];
    }

    private async updateData(data: WritableSignal<PaginatedData<T> | undefined>, dataId: number) {
        const current = data();
        if (!current?.type) return;

        const params: ParamsApi = { type: current.type, dataId: dataId }
        const details = await this.getDetails(dataId, params)

        if (!details) return

        data.update((mediaList) => {
            if (!mediaList) return mediaList;

            const updatedResults = mediaList.results.map(item =>
                item.id === details.id ? details : item
            );

            return { ...mediaList, results: updatedResults };
        });
        console.log('actualize :', details.id)
    }

    private getDetails(dataId: number, params: ParamsApi) {
        if (this.pendingRequests.has(dataId)) return

        const promise = this.api.getDetails<T>(params)
            .finally(() => this.pendingRequests.delete(dataId));
        this.pendingRequests.set(dataId, promise);

        return promise
    }
}