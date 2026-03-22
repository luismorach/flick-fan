import { DestroyRef, effect, ElementRef, inject, Signal } from "@angular/core";

/**
 * IntersectionObserver composable for lazy loading of item details.
 * It only observes elements with data-id that are **direct children** of the container.
 * It does not detect elements inside encapsulated child components.
 */
export function useIntersectionObserver(rootInput: ElementRef<HTMLElement>, callback: (id: number) => void) {
    const observed = new WeakSet<HTMLElement>();
    const root = rootInput.nativeElement
    if (!root) return () => { }

    const io = new IntersectionObserver(entries => {
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
            root: root,
            threshold: 0.1,
            rootMargin: '200px 200px'
        }
    );

    const observeInitialElements = () => {
        root.querySelectorAll<HTMLElement>('[data-id]').forEach((el) => {
            if (observed.has(el)) return;
            io.observe(el);
            observed.add(el);
        });
    }

    observeInitialElements()

    const mo = new MutationObserver(mutations => {
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

    mo.observe(root, { childList: true, subtree: true })

    return () => {
        io.disconnect();
        mo.disconnect();
    }


}
