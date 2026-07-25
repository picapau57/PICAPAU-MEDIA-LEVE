import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, AlertCircle, Radio } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  title: string;
  logo?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  onNextChannel?: () => void;
  onPrevChannel?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title,
  logo,
  autoPlay = true,
  onEnded,
  onNextChannel,
  onPrevChannel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showControls, setShowControls] = useState<boolean>(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Setup HLS or standard video stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");

    let hls: Hls | null = null;

    // Check if proxy needed (if http stream inside https app)
    let playUrl = url;
    if (window.location.protocol === "https:" && url.startsWith("http:")) {
      playUrl = `/api/stream/proxy?url=${encodeURIComponent(url)}`;
    }

    if (playUrl.includes(".m3u8") || playUrl.includes("m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
        });

        hls.loadSource(playUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          if (autoPlay) {
            video.play().catch((e) => {
              console.warn("Autoplay blocked or waiting for user interaction", e);
              setIsPlaying(false);
            });
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("HLS Network Error, attempting recovery...");
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("HLS Media Error, recovering...");
                hls?.recoverMediaError();
                break;
              default:
                setHasError(true);
                setErrorMessage("Não foi possível carregar esta transmissão ao vivo.");
                setIsLoading(false);
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS (Safari / iOS / Apple TV)
        video.src = playUrl;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          if (autoPlay) video.play();
        });
      }
    } else {
      // Standard MP4 / TS direct stream
      video.src = playUrl;
      video.onloadeddata = () => setIsLoading(false);
      video.onerror = () => {
        setHasError(true);
        setErrorMessage("Erro de carregamento do fluxo de vídeo.");
        setIsLoading(false);
      };
      if (autoPlay) video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url, autoPlay]);

  // Handle Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  // Handle Mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Hide overlay after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
  };

  // Retry loading stream
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    const video = videoRef.current;
    if (video) {
      const src = video.src;
      video.src = "";
      video.src = src;
      video.load();
      video.play().catch(console.error);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full min-h-[300px] md:min-h-[420px] bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col justify-center items-center group select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={onEnded}
      />

      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white space-y-3 z-20">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide text-orange-400 font-mono animate-pulse">
            Sintonizando sinal...
          </p>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-[#0F0F12]/95 flex flex-col items-center justify-center text-white p-6 text-center z-20 space-y-4 border border-white/10">
          <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
          <div>
            <h3 className="text-lg font-bold text-red-400 font-mono">Canal / Vídeo Indisponível</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md">{errorMessage}</p>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center space-x-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-bold text-sm rounded-lg shadow-lg transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      )}

      {/* Title & Live Status Bar */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-10 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center space-x-3">
          {logo ? (
            <img
              src={logo}
              alt={title}
              className="w-10 h-10 object-contain rounded bg-[#1A1A1F] p-1 border border-white/10"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-10 h-10 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/20 font-mono">
              TV
            </div>
          )}
          <div>
            <h2 className="text-white font-bold text-sm md:text-base line-clamp-1">{title}</h2>
            <div className="flex items-center space-x-2 text-[11px] text-gray-400 font-mono">
              <span className="flex items-center text-red-500 font-bold uppercase tracking-wider">
                <Radio className="w-3 h-3 mr-1 animate-pulse" /> Ao Vivo
              </span>
              <span>•</span>
              <span className="text-gray-300">PICAPAU MEDIA LEVE</span>
            </div>
          </div>
        </div>

        {/* Quick Channel UP / DOWN for TV Remote */}
        <div className="flex items-center space-x-2">
          {onPrevChannel && (
            <button
              onClick={onPrevChannel}
              className="px-3 py-1 bg-[#1A1A1F] hover:bg-white/10 text-xs font-semibold text-gray-200 rounded border border-white/10 active:bg-orange-500 active:text-black transition-colors"
            >
              CH -
            </button>
          )}
          {onNextChannel && (
            <button
              onClick={onNextChannel}
              className="px-3 py-1 bg-[#1A1A1F] hover:bg-white/10 text-xs font-semibold text-gray-200 rounded border border-white/10 active:bg-orange-500 active:text-black transition-colors"
            >
              CH +
            </button>
          )}
        </div>
      </div>

      {/* Player Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex items-center justify-between transition-opacity duration-300 z-10 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-black flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95"
            title={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="text-gray-300 hover:text-white transition-colors"
              title={isMuted ? "Ativar som" : "Mudo"}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 accent-orange-500 cursor-pointer hidden sm:block"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-300 hover:text-white rounded bg-[#1A1A1F] hover:bg-white/10 border border-white/5 transition-colors"
            title="Tela Cheia"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
