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

    .session-info {
        color: var(--color-text, #fff);
        padding: 0 var(--wt-post-gap, 14px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 80px;
        margin-bottom: var(--wt-post-gap, 14px);

        &__main {
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 350px;
            border-bottom: 1px dashed var(--color-border, #3d444c);
            margin: var(--space-4, 15px) 0;
            flex-shrink: 0;
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
    }
`;
