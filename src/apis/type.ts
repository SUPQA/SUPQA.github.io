export type MeasureType = {
  measure: string;
  value: number;
  corpus?: string;
};

export type InfoType = {
  uid: string;
  question: string;
  measures: MeasureType[];
  measureList: string[];
  weightList?: number[];
  hypoDoc?: string;
  knowledges?: Record<string, string>[];
  words?: Record<string, string>[];
  handlePos?: number[];
};

export type HeatmapReqType = {
  uid: string;
  measure?: string;
  category?: string;
};
export type CircleGeo = {
  cUid: string;
  centroid: [number, number];
  radius: number;
  centroid_px?: [number, number];
  radius_px?: number;
  type?: string;
};

export interface SalientAreaResp {
  measure: string;
  circles: CircleGeo[];
}

export type TemplateType = {
  key: string;
  title: string;
  par?: string;
  value?: number;
  measures?: string;
  category?: string;
  description?: string;
  children?: TemplateType[];
};
