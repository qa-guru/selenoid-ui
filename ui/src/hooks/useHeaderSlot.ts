import { useEffect, useState } from "react";

/**
 * Resolve a portal target inside the canonical design-system header. The header
 * markup (`.header__search`, `.header__slot`, …) is rendered asynchronously by
 * js/header.js after it fetches the template, so the node may not exist on the
 * first render. We resolve it eagerly and, when missing, watch the DOM until it
 * appears (mirrors the nav-sync observer in SelenoidAppHeader).
 */
export function useHeaderSlot(selector: string, { clear = false }: { clear?: boolean } = {}): Element | null {
    const [node, setNode] = useState<Element | null>(null);

    useEffect(() => {
        const resolve = (): boolean => {
            const target = document.querySelector(selector);
            if (!target) {
                return false;
            }
            if (clear) {
                target.replaceChildren();
            }
            setNode(target);
            return true;
        };

        if (resolve()) {
            return undefined;
        }

        const observer = new MutationObserver(() => {
            if (resolve()) {
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [selector, clear]);

    return node;
}

export default useHeaderSlot;
