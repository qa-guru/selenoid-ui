import styled from "styled-components";

export const StyledSession = styled.div`
    box-sizing: border-box;
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    min-height: 0;
    height: calc(100vh - var(--header-occupied-height, var(--header-height, 40px)));
    max-height: calc(100vh - var(--header-occupied-height, var(--header-height, 40px)));
    /* Page shell gutter — same as Sessions list (.sessions-page). */
    padding: var(--wt-post-gap, 14px) var(--wt-post-gap, 14px) 0;

    /* VNC | Log flush (no column gap). Row height follows VncWindow aspect-ratio.
       Log must not contribute to row size — otherwise page scroll moves VNC. */
    .interactive {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-rows: auto;
        justify-content: stretch;
        align-items: stretch;
        box-sizing: border-box;
        width: 100%;
        flex: 0 1 auto;
        min-height: 0;
        padding: 0 0 var(--wt-post-gap, 14px);
        column-gap: 0;
        row-gap: var(--wt-post-gap, 14px);
    }

    @media (max-width: 999px) {
        height: auto;
        max-height: none;

        .interactive {
            grid-template-columns: minmax(0, 1fr);
            flex: 0 0 auto;
        }
    }

    .session-interactive-card {
        min-width: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    /* Hug VNC/video chrome. Do not override .vnc-window__screen aspect-ratio. */
    .session-media-slot {
        display: flex;
        flex-direction: column;
        align-self: start;
        min-width: 0;
        overflow: hidden;

        > * {
            flex: 0 1 auto;
            min-height: 0;
            width: 100%;
        }
    }

    /* Same row height as VNC; body is the column scrollport. height:0 so
       log content does not inflate the grid row (VNC stays put). */
    .session-log-slot {
        align-self: stretch;
        height: 0;
        min-height: 100%;
        overflow: hidden;

        > * {
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            min-height: 0;
            height: 100%;
            width: 100%;
        }
    }

    @media (max-width: 999px) {
        .session-log-slot {
            height: auto;
            min-height: 0;
            overflow: visible;

            > * {
                flex: 1 0 auto;
                min-height: 0;
                height: auto;
            }
        }
    }

    .session-media-slot > .session-video-card,
    .session-media-slot > [data-testid="session-video-panel-wrap"] {
        flex: 0 1 auto;
        width: 100%;
        min-height: 0;
        height: auto;
    }

    .session-media-slot > .session-video-card,
    .session-media-slot > [data-testid="session-video-panel-wrap"] .session-video-card {
        flex: 0 1 auto;
        min-height: 0;
        height: auto;
    }

    .session-video-waiting {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: var(--space-3, 10px);
        flex: 0 1 auto;
        min-height: 0;
        aspect-ratio: 16 / 9;
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

    /* Full-width HAR under the VNC + Log row — own scrollport, does not move VNC. */
    .session-har-slot {
        box-sizing: border-box;
        width: 100%;
        flex: 1 1 0;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: 0 0 var(--wt-post-gap, 14px);

        .har-viewer,
        .har-card {
            flex: 1 1 auto;
            min-height: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .har-card.panel--terminal > .har-card__body {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            scrollbar-width: thin;
            overscroll-behavior-y: contain;
        }
    }

    @media (max-width: 999px) {
        .session-har-slot {
            flex: 0 0 auto;
            overflow: visible;
            height: auto;

            .har-viewer,
            .har-card {
                height: auto;
            }

            .har-card.panel--terminal > .har-card__body {
                overflow: visible;
            }
        }
    }

    .session-info-panel {
        box-sizing: border-box;
        width: 100%;
        padding: 0;
        margin: 0 0 var(--wt-post-gap, 14px);
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
            display: flex;
            justify-content: flex-end;

            .custom-capabilities {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: var(--space-2, 8px);
                flex-wrap: nowrap;
            }
        }

        &__id {
            flex-shrink: 0;
        }

        &__back {
            text-decoration: none;
            flex-shrink: 0;
            min-height: var(--plaque-control-height, 32px);
            padding: var(--space-1, 4px) var(--space-3, 10px);
            font-size: var(--font-size-sm, 12px);
            line-height: 1.2;
            color: var(--color-text, #fff);

            &:hover {
                text-decoration: none;
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
        width: 100%;
        margin: 0 0 var(--wt-post-gap, 14px);
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
        flex: 0 1 auto;
        min-height: 0;
        background-color: var(--color-surface-deep, #131614);
    }

    video {
        width: 100%;
        height: auto;
        aspect-ratio: 16 / 9;
        background: #000;
    }
`;
