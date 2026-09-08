"use client";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import type { DesignBridge } from "@/lib/design/types";

const DesignContext = createContext<DesignBridge | null>(null);
export function DesignProvider({ children }: { children: ReactNode }) {
  const [textureCanvas, setTextureCanvas] = useState<HTMLCanvasElement | null>(null);
  const [textureRevision, setTextureRevision] = useState(0);
  const [designJson, setDesignJson] = useState<Record<string, unknown> | null>(null);
  const [centerOffsetDeg, setCenterOffsetDeg] = useState(0);
  const [exportArtifacts,setExportArtifacts]=useState<DesignBridge["exportArtifacts"]>(null);
  const value = useMemo<DesignBridge>(() => ({ textureCanvas, textureRevision, designJson, centerOffsetDeg, exportArtifacts, setTextureCanvas, setCenterOffsetDeg, publishChange(json) { setDesignJson(json); setTextureRevision((n) => n + 1); },registerExporter(exporter){setExportArtifacts(()=>exporter)} }), [textureCanvas, textureRevision, designJson,centerOffsetDeg,exportArtifacts]);
  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}
export function useDesign() { const value = useContext(DesignContext); if (!value) throw new Error("useDesign must be inside DesignProvider"); return value; }
