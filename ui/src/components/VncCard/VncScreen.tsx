import React, { Component } from "react";
import RFB from "@novnc/novnc/lib/rfb.js";
import urlTo from "../../util/urlTo";
import isSecure from "../../util/isSecure";
import { mockLivePreview } from "../../lib/mockSessions";
import { MockVncDesktop } from "./MockVncDesktop";

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
        this.syncConnection(this.props);
    }

    componentDidUpdate(prevProps: any) {
        const { session, origin } = this.props;
        const prevPreview = mockLivePreview(prevProps.session, prevProps.browser, prevProps.mockEnabled);
        const nextPreview = mockLivePreview(session, this.props.browser, this.props.mockEnabled);
        if (prevProps.origin !== origin || prevProps.session !== session || prevPreview !== nextPreview) {
            this.syncConnection(this.props);
        }
    }

    componentWillUnmount() {
        this.rfb && this.rfb.removeEventListener("disconnect", this.onVNCDisconnect);
        this.rfb && this.rfb.removeEventListener("connect", this.onVNCConnect);
        this.disconnect(this.rfb);
    }

    syncConnection(props: any) {
        const preview = mockLivePreview(props.session, props.browser, props.mockEnabled);
        this.disconnect(this.rfb);
        this.rfb = null;

        if (preview === "active") {
            this.connection("connected");
            return;
        }
        if (preview === "starting") {
            this.connection("connecting");
            return;
        }
        if (preview === "stub") {
            this.connection("disconnected");
            return;
        }

        this.connection("connecting");
        const { session, origin } = props;
        if (origin && session) {
            const link = urlTo(window.location.href);
            const port = VncScreen.defaultPort(link);
            this.rfb = this.createRFB(link, port, session, isSecure(link));
        }
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
        if (rfb) {
            rfb.disconnect();
        }
    }

    render() {
        const preview = mockLivePreview(this.props.session, this.props.browser, this.props.mockEnabled);
        if (preview === "active") {
            return (
                <div className="vnc-screen" style={{ width: "100%", height: "100%" }}>
                    <MockVncDesktop caps={this.props.browser?.caps} />
                </div>
            );
        }

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
