import { useEffect, useState } from "react";

/**
 * Resolve a portal target inside the canonical design-system header. The header
 * markup (`.header__search`, `.header__slot`, …) is rendered asynchronously by
 * js/header.js after it fetches the template, so the node may not exist on the
 * first render. We resolve it eagerly and, when missing, watch the DOM until it
 * appears (mirrors the nav-sync observer in SelenoidAppHeader).
 *
 * @param {string} selector CSS selector for the slot (e.g. `.header__slot`).
 * @param {{ clear?: boolean }} [options] When `clear` is true, existing template
 *   children (e.g. the default search input) are removed once so the React
 *   portal fully owns the slot.
 * @returns {Element | null} The resolved node, or null until it mounts.
 */
export function useHeaderSlot(selector, { clear = false } = {}) {
    const [node, setNode] = useState(null);

    useEffect(() => {
        const resolve = () => {
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
