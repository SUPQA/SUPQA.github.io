import { create } from "zustand";
import { CircleGeo } from "@/apis/type";

export enum GEOTYPE {
  City = "City",
  District = "District",
  Community = "Community",
}

type MaskerState = {
  circleList?: CircleGeo[];
  selectCircle?: CircleGeo;
  districtArea?: any[];
  customFeatures?: any[];
  selectCustom?: any;

  POIpoints?: any[];
  POILanguage?: "en" | "cn";
  POIData?: any;
  POIFilterTarget?: string;
  maskerType: GEOTYPE;

  setPOIFilterTarget: (payload: any) => void;
  setPOILanguage: (payload: any) => void;
  setPOIData: (payload: any) => void;
  setPOIPoint: (payload: any) => void;
  setCircles: (payload: any) => void;
  setSelectCircle: (payload: any) => void;
  setMaskerType: (checked: GEOTYPE) => void;
  setDistrictArea: (checked: boolean) => void;
  setSelectCustom: (payload: any) => void;
  setCustomFeatures: (payload: any) => void;
};

export const useMaskerStore = create<MaskerState>((set) => ({
  POILanguage: "en",
  POIFilterTarget: "all",
  maskerType: GEOTYPE.City,

  setPOIFilterTarget: (payload: any) =>
    set(() => ({ POIFilterTarget: payload })),
  setPOIPoint: (payload: any) => set(() => ({ POIpoints: payload })),
  setPOILanguage: (payload: any) => set(() => ({ POILanguage: payload })),
  setPOIData: (payload: any) => set(() => ({ POIData: payload })),
  setCircles: (circles: CircleGeo[]) => set(() => ({ circleList: circles })),
  setSelectCircle: (payload: any) => set(() => ({ selectCircle: payload })),
  setMaskerType: (payload: GEOTYPE) => set(() => ({ maskerType: payload })),
  setDistrictArea: (payload: any) => set(() => ({ districtArea: payload })),
  setSelectCustom: (payload: any) => set(() => ({ selectCustom: payload })),
  setCustomFeatures: (payload: any) => set(() => ({ customFeatures: payload })),
}));
