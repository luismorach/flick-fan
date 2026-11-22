import { DestroyRef, effect, ElementRef, inject, Signal } from "@angular/core";

/**
 * IntersectionObserver composable for lazy loading of item details.
 * It only observes elements with data-id that are **direct children** of the container.
 * It does not detect elements inside encapsulated child components.
 */
export function useIntersectionObserver() {
    const observed = new WeakSet<HTMLElement>();
    let io: IntersectionObserver | undefined = undefined

    const initialize = (root: ElementRef<HTMLElement>, callback: (id: number) => void) => {
        if (io) return;
        io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return

                const target = entry.target as HTMLElement
                const id = Number(target.dataset['id']);

                if (!id || target.dataset['loaded']) return;

                target.dataset['loaded'] = 'true'
                callback(id)
            });
        },
            {
                root: root.nativeElement,
                threshold: 0.1,
                rootMargin: '200px 200px'
            }
        );
    }

    const observeElements = (elements: HTMLElement[]) => {
        if (!io) return
        console.log('observando elementos', elements)
        elements.forEach((el) => {
            if (observed.has(el)) return;
            io?.observe(el);
            observed.add(el);
        });
    }
    const destroy = () => {
        io?.disconnect();
    }

    return {
        initialize,
        observeElements,
        destroy
    }

}
