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

    /*  const observeInitialElements = () => {
         requestAnimationFrame(() => {
             console.log('elementos a observar para cargar detalles', root.querySelectorAll<HTMLElement>('[data-id]'))
 
             root.querySelectorAll<HTMLElement>('[data-id]').forEach((el) => {
                 if (observed.has(el)) return;
                 io.observe(el);
                 observed.add(el);
             });
         })
 
     } */

    //observeInitialElements()

    /* const mo = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;
 
                const added = node as HTMLElement;
                if (added.dataset['id'] && !observed.has(added)) {
                    io.observe(added)
                    observed.add(added);
                }
            });
        }
    });
 
    mo.observe(root, { childList: true, subtree: true }) */

    const destroy = () => {
        io?.disconnect();
    }

    return {
        initialize,
        observeElements,
        destroy
    }

}
