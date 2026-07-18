import React, { useCallback, useEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { StyledVideo, StyledVideos } from "./style.css";
import { useDeleteVideo } from "./service";
import BeatLoader from "react-spinners/BeatLoader";
import { videoPreloadMode } from "../../util/sessionsLogic";
import { fetchVideoPage, VIDEO_PAGE_SIZE } from "./api";

const Videos = ({ query = "" }) => {
    const [page, setPage] = useState(0);
    const [videos, setVideos] = useState([]);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(VIDEO_PAGE_SIZE);
    const [loading, setLoading] = useState(true);
    const [reloadToken, setReloadToken] = useState(0);
    // React 19 removed findDOMNode; CSSTransition needs an explicit nodeRef per item.
    const nodeRefs = useRef(new Map());
    const noAnyRef = useRef(null);
    const getNodeRef = (key) => {
        let ref = nodeRefs.current.get(key);
        if (!ref) {
            ref = React.createRef();
            nodeRefs.current.set(key, ref);
        }
        return ref;
    };

    useEffect(() => {
        setPage(0);
    }, [query]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchVideoPage({ page, q: query })
            .then((payload) => {
                if (cancelled) {
                    return;
                }
                setVideos(payload.videos || []);
                setTotal(payload.total || 0);
                setLimit(payload.limit || VIDEO_PAGE_SIZE);
            })
            .catch((err) => {
                console.error("Can't load videos", err);
                if (!cancelled) {
                    setVideos([]);
                    setTotal(0);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [page, query, reloadToken]);

    const onDeleted = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    const preloadVal = videoPreloadMode(videos.length);
    const pageCount = Math.max(1, Math.ceil(total / limit) || 1);
    const showPager = total > limit;

    return (
        <StyledVideos>
            <TransitionGroup className={`videos__list`}>
                {videos.length > 0 &&
                    videos.map((fname) => {
                        const src = `/video/${fname}`;
                        const session = fname.match(/.*(?=\.)/)?.[0] || fname;
                        const nodeRef = getNodeRef(fname);

                        return (
                            <CSSTransition
                                key={fname}
                                nodeRef={nodeRef}
                                timeout={500}
                                classNames="video__container_state"
                                unmountOnExit
                            >
                                <RecordedVideo
                                    ref={nodeRef}
                                    src={src}
                                    session={session}
                                    file={fname}
                                    preload={preloadVal}
                                    onDeleted={onDeleted}
                                />
                            </CSSTransition>
                        );
                    })}
            </TransitionGroup>

            {showPager && (
                <div className="videos__pager" data-testid="videos-pager">
                    <button
                        type="button"
                        className="videos__pager-btn"
                        data-testid="videos-pager-prev"
                        disabled={page <= 0 || loading}
                        onClick={() => setPage((current) => Math.max(0, current - 1))}
                    >
                        Prev
                    </button>
                    <span className="videos__pager-status" data-testid="videos-pager-status">
                        {page + 1} / {pageCount}
                    </span>
                    <button
                        type="button"
                        className="videos__pager-btn"
                        data-testid="videos-pager-next"
                        disabled={loading || (page + 1) * limit >= total}
                        onClick={() => setPage((current) => current + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            <CSSTransition
                in={!loading && videos.length === 0}
                nodeRef={noAnyRef}
                timeout={500}
                exit={false}
                classNames="video__no-any_state"
                unmountOnExit
            >
                <div ref={noAnyRef} className="no-any">
                    <div title="No any" className="icon dripicons-hourglass" />
                    <div className="nosession-any-text">NO VIDEOS YET :'(</div>
                </div>
            </CSSTransition>
        </StyledVideos>
    );
};

const RecordedVideo = ({ src, session, file, preload, onDeleted, ref }) => {
    const [deleting, deleteVideo] = useDeleteVideo(file, onDeleted);

    return (
        <StyledVideo ref={ref}>
            <div className="name" title={file}>
                {session}
            </div>
            <div className="video">
                <div className="controls">
                    <div className="control">
                        <a href={src}>
                            <i title="Link" className="icon dripicons-link" />
                        </a>
                    </div>
                    <div className="control">
                        {deleting ? (
                            <BeatLoader size={2} color={"#fff"} />
                        ) : (
                            <span className="delete" onClick={deleteVideo}>
                                <i title="Delete" className="icon dripicons-trash" />
                            </span>
                        )}
                    </div>
                </div>
                <div className="content">
                    <video controls preload={preload}>
                        <source src={src} type="video/mp4" />
                    </video>
                </div>
            </div>
        </StyledVideo>
    );
};

export default Videos;
