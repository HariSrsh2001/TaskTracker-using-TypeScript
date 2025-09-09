// Import React hooks and utilities
import React, { useEffect, useRef, useState } from "react";
// Import Shaka Player (for adaptive video streaming)
import shaka, { ShakaPlayer, ShakaError } from "shaka-player/dist/shaka-player.compiled";
// Import UI components from Fluent UI
import { Card, CardHeader, Button, Spinner, Label, makeStyles } from "@fluentui/react-components";

// Define custom styles using Fluent UI's makeStyles
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
    description: { marginTop: "20px", fontSize: "15px", color: "#333" },
});

// Main component
export function PlayerPage() {
    // React refs → direct reference to video & progress bar DOM elements
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    // State variables
    const [player, setPlayer] = useState<ShakaPlayer | null>(null); // Shaka player instance
    const [loading, setLoading] = useState(false); // Show spinner while loading
    const [error, setError] = useState<string | null>(null); // Error messages
    const [currentTime, setCurrentTime] = useState(0); // Current playback time
    const [duration, setDuration] = useState(0); // Total video duration
    const [hoverTime, setHoverTime] = useState<number | null>(null); // Time preview on hover
    const [hoverPos, setHoverPos] = useState(0); // Position of tooltip
    const [isLoaded, setIsLoaded] = useState(false); // Track if video is already loaded

    const styles = useStyles(); // Apply styles

    // Format seconds → mm:ss
    const formatTime = (sec: number) => {
        const minutes = Math.floor(sec / 60);
        const seconds = Math.floor(sec % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    // Effect hook → runs when component mounts
    useEffect(() => {
        if (!videoRef.current) return;

        // Create Shaka player instance
        const p: ShakaPlayer = new shaka.Player();

        // Attach Shaka to video element
        p.attach(videoRef.current)
            .then(() => console.log("Video element attached"))
            .catch((err: Error) => console.error("Attach error:", err.message));

        // Handle Shaka errors
        const onError = (event: { detail?: ShakaError }) => {
            console.error("Shaka error", event.detail);
            setError(event.detail?.message || "Unknown error");
            setLoading(false);
        };

        // Register error listener
        p.addEventListener("error", onError);

        // Save player instance in state
        setPlayer(p);

        // Update time/duration every 500ms
        const interval = setInterval(() => {
            if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
                setDuration(videoRef.current.duration || 0);
            }
        }, 500);

        // Cleanup when component unmounts
        return () => {
            p.destroy(); // Free Shaka resources
            clearInterval(interval);
        };
    }, []);

    // Load and play video
    const loadVideo = async () => {
        if (!player) return;

        setError(null);
        setLoading(true);

        try {
            if (!isLoaded) {
                // Load demo DASH stream
                await player.load("https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd");
                setIsLoaded(true);
            }
            // Start playback
            videoRef.current?.play();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Failed to load video");
        } finally {
            setLoading(false);
        }
    };

    // Pause video
    const stopVideo = () => {
        videoRef.current?.pause();
        // Do NOT reset currentTime (so resume works)
    };

    // Show time tooltip when hovering over progress bar
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !videoRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left; // mouse X position inside bar
        const ratio = Math.min(Math.max(x / rect.width, 0), 1); // convert to 0–1 ratio

        setHoverPos(x); // store pixel position
        setHoverTime(ratio * videoRef.current.duration); // convert to seconds
    };

    // Hide tooltip when mouse leaves progress bar
    const handleMouseLeave = () => {
        setHoverTime(null);
    };

    return (
        <Card className={styles.container}>
            {/* Header */}
            <CardHeader>
                <h2>🎥 Shaka Player Demo</h2>
            </CardHeader>

            {/* Video container */}
            <div style={{ position: "relative", display: "inline-block" }}>
                <video
                    ref={videoRef}
                    width="640"
                    height="360"
                    controls
                    poster="https://peach.blender.org/wp-content/uploads/title_anouncement.jpg"
                    className={styles.video}
                />
                {/* Progress bar overlay with tooltip */}
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

            {/* Spinner + error message */}
            {loading && <Spinner label="Buffering video..." />}
            {error && <Label color="danger">{error}</Label>}

            {/* Time display */}
            <div className={styles.time}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <Button appearance="primary" onClick={loadVideo} disabled={loading}>
                    ▶ Start / Resume
                </Button>
                <Button appearance="secondary" onClick={stopVideo} disabled={loading}>
                    ⏹ Stop
                </Button>
            </div>

            {/* Description under video */}
            <p className={styles.description}>
                This demo uses <strong>Shaka Player</strong> to stream adaptive video.
                You can play, pause, and hover over the timeline to preview timestamps.
            </p>
        </Card>
    );
}
