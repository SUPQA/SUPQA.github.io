import { create } from "zustand";
import { InfoType, TemplateType } from "@/apis/type";
import * as d3 from "d3";
import { ColorScalePalette } from "@/config";

type LoadingType = {
  loading: boolean;
  tip?: string;
};
type GlobalStore = {
  loading: LoadingType;
  info?: InfoType;
  hypo?: string;
  treeData?: any;
  colorScale?: any;
  selectStep?: any;
  measureCategory?: any;
  topK?: number;

  setLoading: (payload: LoadingType) => void;
  setInfo: (payload: any) => void;
  setHypo: (payload: string) => void;
  setTopK: (payload: number) => void;
  setSelectStep: (payload: any) => void;
  setColorScale: (payload: any) => void;
  setTreeData: (payload: any) => void;
};

export const useGlobalStore = create<GlobalStore>((set) => ({
  loading: { loading: false, tip: "Loading..." },
  info: null,
  hypo: null,
  treeData: null,
  measureCategory: null,
  topK: 5,

  setLoading: (payload: LoadingType) =>
    set((state) => ({ loading: { ...state.loading, ...payload } })),
  setTopK: (payload: number) =>
    set(() => ({
      topK: payload,
    })),
  setInfo: (payload: InfoType) =>
    set(() => ({
      info: payload,
    })),
  setHypo: (payload: string) =>
    set(() => ({
      hypo: payload,
    })),
  setColorScale: (payload: any) =>
    set((state) => {
      console.log("🚨 ~ payload:", payload);

      const color = d3.scaleOrdinal(ColorScalePalette).domain(payload);

      return { colorScale: color };
    }),
  setSelectStep: (payload: any) =>
    set((state) => {
      return { selectStep: payload };
    }),
  setTreeData: (payload: any) =>
    set((state) => {
      const newTreeData = {};
      payload?.children?.forEach((d) => {
        newTreeData[d.measure] = d.children;
      });

      console.log("🚨 ~ payload:", payload?.children, newTreeData);

      return { treeData: payload, measureCategory: newTreeData };
    }),
}));
