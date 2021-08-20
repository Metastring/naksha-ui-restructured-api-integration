import { DefaultTheme } from "@chakra-ui/core";
import { ViewportProps } from "react-map-gl";

export type LayerType = "grid" | "vector" | "raster";

export enum LayerActions {
  ADD_LAYER,
  REMOVE_LAYER,
  UPDATE_STYLE
}

export enum BaseLayer {
  MAP_STREETS = "0",
  MAP_SATELLITE = "1",
  MAP_DARK = "2"
}

export interface SelectedLayers {
  id: string;
  type: LayerType;
  source?: string;
}

export interface ExternalLayers {
  id: string;
  styles: {};
}

export interface HiddenLayers {
  id: Number;
}

export interface ExtendedMarkerProps {
  latitude: number;
  longitude: number;
  colorHex: string;
}

export interface NakshaProps {
  viewPort?: Partial<ViewportProps>;

  loadToC?: boolean;
  showToC?: boolean;
  defaultLayers?: {};

  mapboxApiAccessToken: string;
  nakshaApiEndpoint?: string;
  forwardedRef?: string;
  geoserver?: {
    endpoint: string;
    store: string;
    workspace: string;
    onClick?: any;
  };

  selectedLayers?: SelectedLayers[];
  externalLayers?: ExternalLayers[];
  hiddenLayers?: HiddenLayers[];
  baseLayer?: BaseLayer;
  layers?: GeoserverLayer[];
  markers?: ExtendedMarkerProps[];

  theme?: DefaultTheme;

  children?;
}

interface VectorStyleMeta {
  styleName?;
  styleTitle?;
  colors?;
}

export interface IUseDisclosure {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

export interface GeoserverLayer {
  id: string;
  index?: number;
  layerName: string;
  layerDescription?: string;
  layerTableName?: string;
  titleColumn?: string;
  colorBy?: string;
  layerType?: string;
  createdBy?: string;
  license?: string;
  attribution?: string;
  thumbnail?: string;
  pdfLink?: string;
  bbox?: [[number, number], [number, number]];
  isAdded?: boolean;
  source: {
    type: LayerType;
    scheme?;
    tiles?;
    endpoint?;
  };
  onClick?: ({ bbox, feature, layerId: string }) => JSX.Element;
  onHover?: ({ bbox, feature, layerId: string }) => JSX.Element;
  data?: { styles?: VectorStyleMeta[]; styleIndex?; propertyMap? };
}
