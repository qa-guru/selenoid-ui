import React, { Component } from "react";
import RFB from "@novnc/novnc/lib/rfb.js";
import urlTo from "../../util/urlTo";
import isSecure from "../../util/isSecure";

export default class VncScreen extends Component<any, any> {
    rfb: any;
    canvas: HTMLDivElement | null | undefined;

    static resizeVnc(rfb: any) {
        if (rfb) {
            rfb.resizeSession = true;
            rfb.scaleViewport = true;
        }
    }

    static defaultPort({ port, protocol }: any) {
        return port || (protocol === "https:" ? "443" : "80");
    }

    connection(connection: any) {
        this.props.onUpdateState(connection);
    }

    onVNCDisconnect = () => {
        this.connection("disconnected");
    };

    onVNCConnect = () => {
        this.connection("connected");
    };

    componentDidMount() {
        const { session, origin } = this.props;
        this.connection("connecting");

        if (origin && session) {
            const link = urlTo(window.location.href);
            const port = VncScreen.defaultPort(link);

            this.disconnect(this.rfb);
            this.rfb = this.createRFB(link, port, session, isSecure(link));
        }
    }

    componentDidUpdate(prevProps: any) {
        const prevOrigin = prevProps.origin;
        const { session, origin } = this.props;

        if (origin && session && prevOrigin !== origin) {
            const link = urlTo(window.location.href);
            const port = VncScreen.defaultPort(link);

            this.disconnect(this.rfb);
            this.rfb = this.createRFB(link, port, session, isSecure(link));
        }
    }

    componentWillUnmount() {
        this.rfb && this.rfb.removeEventListener("disconnect", this.onVNCDisconnect);
        this.rfb && this.rfb.removeEventListener("connect", this.onVNCConnect);
        this.disconnect(this.rfb);
    }

    createRFB(link: any, port: any, session: any, secure: boolean) {
        const rfb = new RFB(
            this.canvas as HTMLElement,
            `${secure ? "wss" : "ws"}://${link.hostname}:${port}/ws/vnc/${session}`,
            {
                credentials: {
                    password: "selenoid",
                },
            }
        );

        rfb.addEventListener("connect", this.onVNCConnect);
        rfb.addEventListener("disconnect", this.onVNCDisconnect);

        rfb.scaleViewport = true;
        rfb.resizeSession = true;
        (rfb as any).viewOnly = true;
        return rfb;
    }

    lock(unlocked: boolean) {
        if (this.rfb) {
            (this.rfb as any).viewOnly = !unlocked;
        }
    }

    disconnect(rfb: any) {
        if (rfb && rfb._rfb_connection_state && rfb._rfb_connection_state !== "disconnected") {
            rfb.disconnect();
        }
    }

    render() {
        return (
            <div
                className="vnc-screen"
                style={{ width: "100%", height: "100%" }}
                ref={(screen: any) => {
                    this.canvas = screen;
                    VncScreen.resizeVnc(this.rfb);
                }}
            ></div>
        );
    }
}
