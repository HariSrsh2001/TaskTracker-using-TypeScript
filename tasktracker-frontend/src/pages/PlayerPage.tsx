import React, { useEffect, useRef, useState } from "react";
import shaka, { ShakaPlayer, ShakaError } from "shaka-player/dist/shaka-player.compiled";
import { Card, CardHeader, Button, Spinner, Label, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
    container: { textAlign: "center", marginTop: "20px" },
    video: { background: "black", borderRadius: "4px", maxWidth: "100%", position: "relative" },
    controls: { display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" },
    time: { marginTop: "6px", fontSize: "14px" },
    tooltip: {
        position: "absolute",
        padding: "2px 6px",
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        borderRadius: "4px",
        fontSize: "12px",
        pointerEvents: "none",
        transform: "translate(-50%, -150%)",
    },
});

export function PlayerPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [player, setPlayer] = useState<ShakaPlayer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverPos, setHoverPos] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const styles = useStyles();

    const formatTime = (sec: number) => {
        const minutes = Math.floor(sec / 60);
        const seconds = Math.floor(sec % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    useEffect(() => {
        if (!videoRef.current) return;

        const p: ShakaPlayer = new shaka.Player();

        p.attach(videoRef.current)
            .then(() => console.log("Video element attached"))
            .catch((err: Error) => console.error("Attach error:", err.message));

        const onError = (event: { detail?: ShakaError }) => {
            console.error("Shaka error", event.detail);
            setError(event.detail?.message || "Unknown error");
            setLoading(false);
        };

        p.addEventListener("error", onError);
        setPlayer(p);

        const interval = setInterval(() => {
            if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
                setDuration(videoRef.current.duration || 0);
            }
        }, 500);

        return () => {
            p.destroy();
            clearInterval(interval);
        };
    }, []);

    const loadVideo = async () => {
        if (!player) return;

        setError(null);
        setLoading(true);

        try {
            if (!isLoaded) {
                await player.load(
                    "https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd"
                );
                setIsLoaded(true);
            }
            videoRef.current?.play();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Failed to load video");
        } finally {
            setLoading(false);
        }
    };

    const stopVideo = () => {
        videoRef.current?.pause();
        // Do NOT reset currentTime, so video resumes from this point
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !videoRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = Math.min(Math.max(x / rect.width, 0), 1);

        setHoverPos(x);
        setHoverTime(ratio * videoRef.current.duration);
    };

    const handleMouseLeave = () => {
        setHoverTime(null);
    };

    return (
        <Card className={styles.container}>
            <CardHeader>
                <h2>🎥 Shaka Player Demo</h2>
            </CardHeader>
            <div style={{ position: "relative", display: "inline-block" }}>
                <video
                    ref={videoRef}
                    width="640"
                    height="360"
                    controls
                    poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg"
                    className={styles.video}
                />
                <div
                    ref={progressRef}
                    style={{
                        position: "absolute",
                        bottom: 40,
                        left: 0,
                        width: "100%",
                        height: "10px",
                        cursor: "pointer",
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {hoverTime !== null && (
                        <div className={styles.tooltip} style={{ left: hoverPos }}>
                            {formatTime(hoverTime)}
                        </div>
                    )}
                </div>
            </div>

            {loading && <Spinner label="Buffering video..." />}
            {error && <Label color="danger">{error}</Label>}

            <div className={styles.time}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <div className={styles.controls}>
                <Button appearance="primary" onClick={loadVideo} disabled={loading}>
                    ▶ Start / Resume
                </Button>
                <Button appearance="secondary" onClick={stopVideo} disabled={loading}>
                    ⏹ Stop
                </Button>
            </div>
        </Card>
    );
}
