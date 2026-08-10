import {
    DEFAULT_SESSION_ARCHIVE_ORDER,
    DEFAULT_SESSION_ARCHIVE_SORT,
    type SessionArchiveSortField,
    type SessionArchiveSortOrder,
} from "./api";

const SORT_FIELDS = new Set<SessionArchiveSortField>(["id", "finished", "duration", "quota", "name"]);
const SORT_ORDERS = new Set<SessionArchiveSortOrder>(["asc", "desc"]);

export type ArchiveUrlState = {
    sort: SessionArchiveSortField;
    order: SessionArchiveSortOrder;
    page: number;
};

export function parseArchiveUrlState(params: URLSearchParams): ArchiveUrlState {
    const sortRaw = params.get("sort");
    const orderRaw = params.get("order");
    const pageRaw = params.get("page");

    const sort = SORT_FIELDS.has(sortRaw as SessionArchiveSortField)
        ? (sortRaw as SessionArchiveSortField)
        : DEFAULT_SESSION_ARCHIVE_SORT;
    const order = SORT_ORDERS.has(orderRaw as SessionArchiveSortOrder)
        ? (orderRaw as SessionArchiveSortOrder)
        : DEFAULT_SESSION_ARCHIVE_ORDER;
    const page = Math.max(0, Number.parseInt(pageRaw || "0", 10) || 0);

    return { sort, order, page };
}

export function buildArchiveSearchParams(
    current: URLSearchParams | string,
    patch: Partial<ArchiveUrlState>
): URLSearchParams {
    const base = typeof current === "string" ? new URLSearchParams(current) : new URLSearchParams(current);
    const next = new URLSearchParams(base);
    const state = { ...parseArchiveUrlState(base), ...patch };

    if (state.sort === DEFAULT_SESSION_ARCHIVE_SORT) {
        next.delete("sort");
    } else {
        next.set("sort", state.sort);
    }

    if (state.order === DEFAULT_SESSION_ARCHIVE_ORDER) {
        next.delete("order");
    } else {
        next.set("order", state.order);
    }

    if (state.page <= 0) {
        next.delete("page");
    } else {
        next.set("page", String(state.page));
    }

    return next;
}
