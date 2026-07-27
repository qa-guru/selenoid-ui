import styled from "styled-components";

export const StyledSession = styled.div`
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
        /* Content heights independent — Log hugs buffer; do not magnet to VNC screen. */
        align-items: start;
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
    }

    /* Full-width HAR under the VNC + Log row (not a side card). */
    .session-har-slot {
        box-sizing: border-box;
        width: 100%;
        flex: 0 0 auto;
    }

    .session-info-panel {
        box-sizing: border-box;
        width: calc(100% - 2 * var(--wt-post-gap, 14px));
        max-width: 1000px;
        /* Bottom was 0 → Session info stuck to VNC/Video; keep mosaic gutter. */
        margin: var(--wt-post-gap, 14px);
        /* Content height only — Panel default flex:1 ate the viewport and
           clipped VNC + Log. Same override as Capabilities .setup .panel. */
        flex: 0 0 auto;
    }

    .session-info-panel__body {
        padding: var(--space-3, 10px) var(--space-4, 15px);
    }

    .session-info {
        color: var(--color-text, #fff);
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: center;
        gap: var(--space-2, 8px);

        &__main {
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: var(--space-3, 12px);

            .session-browser {
                line-height: 40px;
                display: inline-flex;
                align-items: center;
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
        }

        &__additional {
            .custom-capabilities {
                display: flex;
                align-items: center;
                gap: var(--space-2, 8px);
                flex-wrap: wrap;
            }
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

    .session-missing__back {
        color: var(--color-accent, #6cb6ff);
        text-decoration: none;
        font-size: 0.9em;

        &:hover {
            text-decoration: underline;
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
        min-height: 160px;
        background-color: var(--color-surface-deep, #131614);
    }

    .session-video-toolbar {
        display: flex;
        justify-content: flex-end;
        padding: 8px 12px;
        border-bottom: 1px solid var(--color-border, #3d444c);
    }

    .session-video-toolbar__link {
        color: var(--color-accent, #6cb6ff);
        text-decoration: none;
        font-size: 12px;

        &:hover {
            text-decoration: underline;
        }
    }

    video {
        width: 100%;
        max-height: min(48vh, 520px);
        background: #000;
    }
`;
