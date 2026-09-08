export type DesignDocument = {
  version: 1;
  productId: string;
  fabricJson: Record<string, unknown>;
  uploadedAssetReferences: string[];
  printWidthCm: number;
  printHeightCm: number;
  dpi: number;
  updatedAt: string;
};

export type DesignBridge = {
  textureCanvas: HTMLCanvasElement | null;
  textureRevision: number;
  designJson: Record<string, unknown> | null;
  centerOffsetDeg: number;
  setCenterOffsetDeg: (degrees: number) => void;
  setTextureCanvas: (canvas: HTMLCanvasElement | null) => void;
  publishChange: (json: Record<string, unknown>) => void;
  exportArtifacts: (() => Promise<DesignArtifacts>) | null;
  registerExporter: (exporter: (() => Promise<DesignArtifacts>) | null) => void;
};
export type DesignArtifacts={fabricJson:Record<string,unknown>;preview:Blob;print:Blob;printWidth:number;printHeight:number};
