import styled from "styled-components";

export const StyledVNC = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;

    &.fullscreen {
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: 2;
        top: 0;
        left: 0;
    }

    .vnc-connection-status {
        color: var(--color-text, #fff);
        text-transform: uppercase;
        margin-left: 55px;
        transition: color 0.5s ease-out 0s;
        line-height: 20px;

        &:before {
            content: "";
            display: block;
            width: 35px;
            margin-left: -45px;
            border-bottom: 1px solid var(--color-text, #fff);
            position: relative;
            top: 11px;
        }

        &_disconnected {
            color: var(--color-danger, #ff6e59);
            &:before {
                border-bottom-color: var(--color-danger, #ff6e59);
            }
        }

        &_connecting {
            color: var(--color-info, #6883d3);
            &:before {
                border-bottom-color: var(--color-info, #6883d3);
            }
        }
    }

    .vnc-card {
        height: 450px;
        width: 100%;
        display: flex;
        flex-direction: column;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.12);

        &_fullscreen {
            height: 100%;
            width: 100%;
            z-index: 2;
        }

        &_small {
            height: var(--control-height-md, 36px);
            width: auto;
            min-width: calc(var(--control-height-md, 36px) * 2);
        }

        &__controls {
            height: var(--control-height-md, 36px);
            width: 100%;
            display: flex;
            align-items: center;
            gap: var(--space-1, 4px);
            padding: 0 var(--space-2, 8px);
            background-color: var(--color-surface-soft, #3d444c);
            box-sizing: border-box;

            .control {
                flex-shrink: 0;
                color: var(--color-text, #fff);

                &_fullscreen {
                    color: var(--color-success, #59a781);
                }

                &_back {
                    color: var(--color-danger, #ff6e59);
                }

                &_lock {
                    color: var(--color-info, #6883d3);
                }

                &_disconnected,
                &_connecting,
                &_disconnecting {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: var(--control-height-md, 36px);
                    height: var(--control-height-md, 36px);
                }

                &_disconnected {
                    color: var(--color-danger, #ff6e59);
                }

                &_connecting {
                    color: var(--color-info, #6883d3);
                }

                &_connected {
                    display: none;
                }

                &_disconnecting {
                    color: var(--color-warning, #ca9eff);
                }

                &_copy {
                    color: var(--color-success, #59a781);
                    margin-left: auto;
                }

                &_upload {
                    color: var(--color-success, #59a781);
                }
            }
        }

        &__content {
            width: 100%;
            height: calc(100% - var(--control-height-md, 36px));
            display: flex;
            flex-direction: column;
            background-color: #000;

            .vnc-screen {
                height: 100%;
            }
        }
    }
`;
