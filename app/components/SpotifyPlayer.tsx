"use client";

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';

type SpotifyController = {
  play: () => void;
  destroy: () => void;
};

type SpotifyIframeApi = {
  createController: (
    elemento: HTMLElement,
    opcoes: { width: string; height: number; uri: string },
    callback: (controller: SpotifyController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
    __letterLoveSpotifyApi?: SpotifyIframeApi;
  }
}

export default function SpotifyPlayer({ trackId }: { trackId: string }) {
  const elementoRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);
  const [pronto, setPronto] = useState(false);
  const [iniciado, setIniciado] = useState(false);

  const criarPlayer = useCallback((api: SpotifyIframeApi) => {
    if (!elementoRef.current || controllerRef.current) return;

    api.createController(
      elementoRef.current,
      { width: '100%', height: 80, uri: `spotify:track:${trackId}` },
      (controller) => {
        controllerRef.current = controller;
        setPronto(true);
      },
    );
  }, [trackId]);

  useEffect(() => {
    const aoCarregarApi = (api: SpotifyIframeApi) => {
      window.__letterLoveSpotifyApi = api;
      criarPlayer(api);
    };

    window.onSpotifyIframeApiReady = aoCarregarApi;
    if (window.__letterLoveSpotifyApi) criarPlayer(window.__letterLoveSpotifyApi);

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
      if (window.onSpotifyIframeApiReady === aoCarregarApi) {
        delete window.onSpotifyIframeApiReady;
      }
    };
  }, [criarPlayer]);

  const tocar = () => {
    controllerRef.current?.play();
    setIniciado(true);
  };

  return (
    <>
      <Script src="https://open.spotify.com/embed/iframe-api/v1" strategy="afterInteractive" />
      <div className="relative h-20 w-full overflow-hidden rounded-xl">
        <div ref={elementoRef} className="h-20 w-full" />
        {!iniciado && (
          <button
            type="button"
            onClick={tocar}
            disabled={!pronto}
            className="absolute inset-0 z-10 flex items-center justify-center bg-emerald-700/95 font-bold text-white backdrop-blur-sm transition hover:bg-emerald-600 disabled:cursor-wait disabled:bg-zinc-700/95"
          >
            {pronto ? '▶ Tocar nossa música' : 'Carregando música…'}
          </button>
        )}
      </div>
    </>
  );
}
