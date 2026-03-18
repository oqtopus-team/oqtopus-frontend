import {
  initQulacsSimulatorModule,
  QulacsSimulatorAppClient,
} from "qulacs-wasm-simulator-client";
import React, { createContext, useEffect, useRef, useState } from "react";

export const QulacsSimulatorContext = createContext<QulacsSimulatorAppClient | null>(null);

export interface QulacsSimulatorProviderProps {
  children: React.ReactNode;
};

export const QulacsSimulatorProvider
  : React.FC<{ children: React.ReactNode }>
  = ({ children }) => {
    const [isReady,  setReady] = useState(false);
    const clientRef = useRef<QulacsSimulatorAppClient | null>(null);

    // initialize qulacs simulator client
    useEffect(() => {
      // load qulacs wasm
      (async () => {
        const url = new URL(document.URL);
        const wasmPath = `${url.origin}/module.wasm`;
        const wasmModule = await WebAssembly.compileStreaming(fetch(wasmPath));
        const client = await initQulacsSimulatorModule({
          module: wasmModule
        });
        clientRef.current = client;
        setReady(true);
      })();
    }, [])

    return !isReady
      ? (
        <>Loading simulator module...</>
      )
      : (
        <QulacsSimulatorContext.Provider value={clientRef.current}>
          {children}
        </QulacsSimulatorContext.Provider>
      );
  };
