import styled from "styled-components";

export const StyledSession = styled.div`
    --session-media-height: min(48vh, 520px);

    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    /* Edge inset = inter-panel gap — same 14px gutter as widget-mosaic
       (--wt-post-gap). flex:1 alone used to eat margins and collapse the
       gutter between VncWindow and Log. */
    .interactive {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: stretch;
        box-sizing: border-box;
        width: 100%;
        padding: 0 var(--wt-post-gap, 14px) var(--wt-post-gap, 14px);
        gap: var(--wt-post-gap, 14px);
    }

    .session-interactive-card {
        max-width: 1000px;
        flex: 1 1 45%;
        min-width: min(450px, 100%);
        margin: 0;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    /* Stable VNC → video swap: one column, fixed flex footprint. */
    .session-media-slot {
        display: flex;
        flex-direction: column;
        height: var(--session-media-height);
        min-height: var(--session-media-height);
        max-height: var(--session-media-height);
        min-width: 0;
        overflow: hidden;
    }

    /* Log column matches Video/VNC row height; body scrolls when content overflows. */
    .session-log-slot {
        min-height: var(--session-media-height);

        > * {
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            min-height: 0;
            width: 100%;
        }

        .log-card {
            flex: 1 1 auto;
            height: 100%;
            min-height: 0;
            align-self: stretch;
        }

        .log-card__body {
            flex: 1 1 auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
        }

        .term {
            flex: 1 1 auto;
            min-height: 0;
        }

        .log-file-pre {
            flex: 1 1 auto;
            min-height: 0;
            max-height: none;
            overflow: auto;
        }

        .log-file-empty {
            flex: 1 1 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 0;
        }
    }

    .session-media-slot > .session-video-card,
    .session-media-slot > [data-testid="session-video-panel-wrap"] {
        flex: 1 1 auto;
        width: 100%;
        min-height: 0;
        height: 100%;
    }

    .session-media-slot > .session-video-card,
    .session-media-slot > [data-testid="session-video-panel-wrap"] .session-video-card {
        /* Panel defaults to flex:1 — must stay inside the slot, not spill onto HAR. */
        flex: 1 1 auto;
        min-height: 0;
        height: 100%;
    }

    .session-video-waiting {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: var(--space-3, 10px);
        flex: 1 1 auto;
        min-height: 0;
        color: var(--color-text-muted, #aaa);
        font-size: 0.95em;
    }

    .session-video-waiting__icon {
        display: inline-flex;
        line-height: 0;

        svg {
            width: 1.1em;
            height: 1.1em;
        }
    }

    /* Full-width HAR under the VNC + Log row (not a side card). */
    .session-har-slot {
        box-sizing: border-box;
        width: 100%;
        flex: 0 0 auto;
        padding: 0 var(--wt-post-gap, 14px) var(--wt-post-gap, 14px);

        .har-card {
            flex: 0 0 auto;
        }
    }

    .session-info-panel {
        box-sizing: border-box;
        width: 100%;
        padding: var(--wt-post-gap, 14px) var(--wt-post-gap, 14px) 0;
        margin: 0;
        /* Content height only — Panel default flex:1 ate the viewport and
           clipped VNC + Log. Same override as Capabilities .setup .panel. */
        flex: 0 0 auto;
    }

    .session-info-panel__body {
        padding: var(--space-3, 10px) var(--space-4, 15px);
    }

    .session-kill-placeholder {
        display: inline-block;
        width: 28px;
        height: 28px;
        visibility: hidden;
    }

    .session-info {
        color: var(--color-text, #fff);

        &__main {
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: nowrap;
            gap: var(--space-3, 12px);

            .session-browser {
                line-height: 40px;
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
                gap: var(--space-1, 4px);

                &__name {
                    text-transform: uppercase;
                    font-weight: 200;
                }

                &__version-separator {
                    margin-right: 3px;
                    margin-left: 3px;
                    font-size: 1.5em;
                    color: var(--color-border, #3d444c);
                }

                &__version {
                    font-size: 0.8em;
                }

                &__quota {
                    font-size: 0.8em;
                    color: var(--color-text-muted, #999);
                }
            }

            .session-browser__loader-slot {
                display: inline-block;
                width: 35px;
                height: 5px;
                flex-shrink: 0;
            }
        }

        &__additional {
            flex: 1 1 auto;
            min-width: 0;

            .custom-capabilities {
                display: flex;
                align-items: center;
                gap: var(--space-2, 8px);
                flex-wrap: nowrap;
            }
        }

        &__id {
            flex-shrink: 0;
        }

        &__back {
            color: var(--color-accent, #6cb6ff);
            text-decoration: none;
            font-size: 0.9em;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .session-missing {
        color: var(--color-text-muted, #aaa);
        padding: var(--space-8, 30px) var(--space-4, 15px);
        text-align: center;
    }

    /* Same empty-state shell as Sessions / Archive (.no-any inside Panel). */
    .session-missing-panel {
        box-sizing: border-box;
        width: calc(100% - 2 * var(--wt-post-gap, 14px));
        max-width: 1000px;
        margin: var(--wt-post-gap, 14px);
        flex: 0 0 auto;
    }

    .session-missing-panel__body {
        padding: 0;
        min-height: 60px;
    }

    .no-any {
        color: var(--color-text, #fff);
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: center;
        gap: var(--space-3, 10px);
        font-size: 1.2em;
        min-height: 60px;
        padding: 10px var(--space-5, 16px);
        box-sizing: border-box;
        white-space: nowrap;

        .icon {
            display: inline-flex;
            align-items: center;
            flex-shrink: 0;
            line-height: 0;

            svg {
                width: 1.1em;
                height: 1.1em;
                display: block;
            }
        }

        .nosession-any-text {
            margin: 0;
        }
    }
`;

export const StyledSessionVideo = styled.div`
    width: 100%;

    .session-video-card {
        width: 100%;
    }

    .session-video-card__body {
        display: flex;
        flex-direction: column;
        padding: 0;
        flex: 1 1 auto;
        min-height: 0;
        background-color: var(--color-surface-deep, #131614);
    }

    video {
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
        background: #000;
    }
`;
