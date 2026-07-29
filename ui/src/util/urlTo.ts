export default function urlTo(href: string): HTMLAnchorElement {
    const lnk = document.createElement("a");
    lnk.setAttribute("href", href);
    return lnk;
}
