import styled from "styled-components";

export const StyledVideo = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 45%;
    padding: var(--space-3, 10px) var(--space-6, 20px);
    margin-bottom: var(--space-8, 30px);
    max-width: 70%;

    &:hover {
        .video {
            .controls {
                visibility: visible;
            }
        }
    }

    .name {
        color: var(--color-text, #fff);
        font-size: 1.3em;
        font-weight: 300;
        padding: 0 var(--space-1, 5px) var(--space-3, 10px) 0;
        border-bottom: 1px dashed var(--color-border-strong, #555f6a);
        overflow-y: scroll;
        line-height: 30px;
        height: 30px;
    }

    .video {
        display: flex;
        flex: 1;
        min-width: 300px;
        min-height: 300px;

        .controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 0;
            flex-basis: calc(var(--control-height-md, 36px) + var(--space-2, 8px));
            color: var(--color-text, #fff);
            visibility: hidden;

            .control {
                flex-basis: 50px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                border-bottom: 1px dashed var(--color-border-strong, #555f6a);

                .icon-btn {
                    color: var(--color-text, #fff);
                    text-decoration: none;

                    &:hover {
                        color: var(--color-success, #59a781);
                    }
                }

                .video-delete:hover {
                    color: var(--color-danger, #ff6e59);
                }
            }
        }

        .content {
            display: flex;
            flex: 1;
            padding: var(--space-1, 5px);
            flex-basis: 300px;
            background-color: var(--color-surface-deep, #131614);
            justify-content: center;
            align-items: center;

            video {
                width: 100%;
                height: 100%;
            }
        }
    }
`;

export const StyledVideos = styled.div`
    .videos__list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    .video__container {
        //TRANSITIONS
        &_state-enter {
            opacity: 0.01;
        }

        &_state-enter-active {
            opacity: 1;
            transition: opacity 500ms ease-in;
        }

        &_state-exit {
            opacity: 1;
        }

        &_state-exit-active {
            opacity: 0.01;
            transition: opacity 500ms ease-out;
        }
    }

    .no-any {
        color: var(--color-text, #fff);
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        align-items: center;
        font-size: 1.2em;
        justify-content: center;

        .nosession-any-text {
            margin: var(--space-3, 10px);
        }

        // don't show until all videos are gone
        &_state-enter-active {
            display: none;
        }
    }

    .videos__pager {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--space-5, 16px);
        margin: var(--space-3, 10px) 0 var(--space-8, 30px);
        color: var(--color-text, #fff);
        font-size: 0.95em;
    }

    .videos__pager-btn {
        background: transparent;
        border: 1px solid var(--color-border-strong, #555f6a);
        color: var(--color-text, #fff);
        padding: 6px 14px;
        cursor: pointer;

        &:hover:not(:disabled) {
            border-color: var(--color-success, #59a781);
            color: var(--color-success, #59a781);
        }

        &:disabled {
            opacity: 0.4;
            cursor: default;
        }
    }

    .videos__pager-status {
        min-width: 64px;
        text-align: center;
        color: var(--color-text, #fff);
    }
`;
