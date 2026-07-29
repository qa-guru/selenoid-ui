export type UrlLike = { protocol?: string };

export default function isSecure({ protocol }: UrlLike): boolean {
    return protocol === "https:";
}
