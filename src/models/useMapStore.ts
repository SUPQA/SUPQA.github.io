import { create } from 'zustand';
import comfort_openai from '../../public/data/simap/comfort_openai_colorize.png';
import { getHeatmapURL } from '@/apis';
import { HeatmapReqType } from '@/apis/type';

export type Coordinate = {
  lat: number;
  lng: number;
};

type MapState = {
  map: any;
  location?: Coordinate;
  heatMapImg?: string;

  changeHeatImgUrl: (payload: any) => void;
  // changeLocation: (payload: any) => void;
  setMap: (payload: any) => void;
};

export const useMapStore = create<MapState>((set) => ({
  map: null,
  // location: {
  //   lat: null,
  //   lng: null,
  // },
  heatMapImg: comfort_openai, //热力底图

  changeHeatImgUrl: (payload: HeatmapReqType) =>
    set((state) => {
      const params = new URLSearchParams(payload);
      return { heatMapImg: `${getHeatmapURL}?${params}` };
    }),
  // changeLocation: (payload: any) =>
  //   set((state) => ({ location: { ...state.location, ...payload } })),

  setMap: (payload: any) => set(() => ({ map: payload })),
}));
