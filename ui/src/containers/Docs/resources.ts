export type ResourceRef = {
    href: string;
    label: string;
};

export type ResourceService = {
    name: string;
    github: ResourceRef;
    dockerHub?: ResourceRef;
    comment: string;
};

export const RESOURCE_SERVICES: ResourceService[] = [
    {
        name: "selenoid",
        github: { href: "https://github.com/qa-guru/selenoid", label: "qa-guru/selenoid" },
        dockerHub: { href: "https://hub.docker.com/r/qaguru/selenoid", label: "qaguru/selenoid" },
        comment: "Hub — WebDriver and Playwright",
    },
    {
        name: "selenoid-ui",
        github: { href: "https://github.com/qa-guru/selenoid-ui", label: "qa-guru/selenoid-ui" },
        dockerHub: { href: "https://hub.docker.com/r/qaguru/selenoid-ui", label: "qaguru/selenoid-ui" },
        comment: "Web UI",
    },
    {
        name: "cm",
        github: { href: "https://github.com/qa-guru/cm", label: "qa-guru/cm" },
        dockerHub: { href: "https://hub.docker.com/r/qaguru/cm", label: "qaguru/cm" },
        comment: "Installer",
    },
    {
        name: "browser-image",
        github: { href: "https://github.com/qa-guru/browser-image", label: "qa-guru/browser-image" },
        dockerHub: { href: "https://hub.docker.com/u/qaguru", label: "qaguru/*" },
        comment: "WebDriver, Playwright, Android, video-recorder",
    },
    {
        name: "selenoid-tests",
        github: { href: "https://github.com/qa-guru/selenoid-tests", label: "qa-guru/selenoid-tests" },
        comment: "Go pyramid and CI orchestrator",
    },
];
