import { create } from "zustand";
import { HeatmapReqType, InfoType } from "@/apis/type";
import * as d3 from "d3";
import { CategoryItems, ColorScalePalette } from "@/config";
import { ReactNode } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { WEB_DOMAIN } from "@/apis/request";
import { Message, Progress } from "@arco-design/web-react";
import { getHeatmapURL, getTreeStep } from "@/apis";
import { getAllNodes } from "@/lib/utils";
import comfort_openai from "../../public/data/simap/comfort_openai_colorize.png";

export type Coordinate = {
  lat: number;
  lng: number;
};

type LoadingType = {
  loading: boolean;
  tip?: string | ReactNode;
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
  map: any;
  heatMapImg?: string;

  setLoading: (payload: LoadingType) => void;
  setInfo: (payload: any) => void;
  setHypo: (payload: string) => void;
  setTopK: (payload: number) => void;
  setSelectStep: (payload: any) => void;
  setColorScale: (payload: any) => void;
  setTreeData: (payload: any) => void;
  handleSend: (payload: any) => void;
  setMap: (payload: any) => void;
  changeHeatImgUrl: (payload: any) => void;
};

export const useGlobalStore = create<GlobalStore>((set) => ({
  loading: { loading: false, tip: "Loading..." },
  info: null,
  hypo: null,
  treeData: null,
  measureCategory: null,
  topK: 3,
  map: null,
  heatMapImg: comfort_openai, //热力底图

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
  setMap: (payload: any) => set(() => ({ map: payload })),
  changeHeatImgUrl: (payload: HeatmapReqType) =>
    set((state) => {
      const params = new URLSearchParams(payload);
      return { heatMapImg: `${getHeatmapURL}?${params}` };
    }),

  handleSend: async (payload: any) => {
    const { uid, question, topK, callback } = payload;
    set((state) => ({ loading: { ...state.loading, loading: true } }));

    const doneCallback = async (data) => {
      let supHistory = JSON.parse(localStorage.getItem("supHistory")) ?? [];
      if (supHistory.findIndex((item) => item.uid === data.uid) === -1) {
        supHistory.unshift({
          uid: data.uid,
          q: data.question,
          date: data.date,
        });
      }
      localStorage.setItem("supHistory", JSON.stringify(supHistory));

      // changeHeatImgUrl({ uid: data.uid, measure: "answer" });

      const treeData = await getTreeStep(data.uid);
      const allNode = getAllNodes([treeData]);

      const nameList = allNode.map((item) => item.name);
      // setStepList(allNode);

      // callback?.(supHistory, allNode);

      const domainSet = new Set([
        ...data.measureList,
        ...nameList,
        ...CategoryItems,
      ]);
      const color = d3.scaleOrdinal(ColorScalePalette).domain(domainSet);
      set((state) => ({
        info: data,
        colorScale: color,
        treeData: treeData,
        heatMapImg: `${getHeatmapURL}?${new URLSearchParams({
          uid: data.uid,
          measure: "answer",
          date: data.date,
        })}`,
      }));

      callback?.(supHistory, allNode);
    };

    let answer = "";
    const parseStream = (eventData, controller) => {
      const event = eventData.event;
      const data = eventData.data;
      if (event === "error") throw new Error(data);

      console.log("🚨 === ", eventData);
      try {
        switch (event) {
          case "done":
            const parsedData2 = JSON.parse(data);
            console.log("🚨 === done", parsedData2);

            doneCallback(parsedData2);
            set((state) => ({ loading: { ...state.loading, loading: false } }));
            break;
          case "hypoStart":
            document.getElementById("main").classList.add("loading");
            document
              .getElementById("hypo-panel")
              .classList.add("loading-highlight");
            break;
          case "hypoDone":
            document.getElementById("main").classList.remove("loading");
            document
              .getElementById("hypo-panel")
              .classList.remove("loading-highlight");
            set((state) => {
              return { hypo: "" };
            });
            break;
          case "hypo":
            console.log("🚨 ===  hypo", data);
            set((state) => {
              return { hypo: state.hypo + data };
            });
            break;
          case "prompt":
            console.log("🚨 ===  prompt", data);
            answer = answer + data;
            // setLoading({ loading: true, tip: answer.current });
            set((state) => {
              return { loading: { loading: true, tip: answer } };
            });
            break;
          case "map":
            console.log("🚨 ===  map", data);
            let mapData = JSON.parse(data);
            set((state) => {
              return {
                loading: {
                  loading: true,
                  tip: (
                    <>
                      <div>Processing map... This may take 30 - 60 s</div>
                      <Progress
                        size="large"
                        steps={mapData.total}
                        percent={
                          (parseInt(mapData.index) / parseInt(mapData.total)) *
                          100
                        }
                        formatText={() => `${mapData.index} / ${mapData.total}`}
                        strokeWidth={8}
                        trailColor="rgb(var(--primary-2))"
                      />
                    </>
                  ),
                },
              };
            });

            // setLoading({
            //   loading: true,
            //   tip: (
            //     <>
            //       <div>Processing map... This may take 30 - 60 s</div>
            //       <Progress
            //         size="large"
            //         steps={mapData.total}
            //         percent={
            //           (parseInt(mapData.index) / parseInt(mapData.total)) * 100
            //         }
            //         strokeWidth={8}
            //         trailColor="rgb(var(--primary-2))"
            //       />
            //     </>
            //   ),
            // });
            break;
          default:
            return data;
        }
      } catch (error) {
        console.log("🚨 === JSON.parse Error", error);
        controller.abort();
        set((state) => {
          return { loading: { ...state.loading, loading: false } };
        });
        // setLoading({ loading: false });
        throw new Error(data);
      }
    };

    const controller = new AbortController();

    await fetchEventSource(`${WEB_DOMAIN}/pipeline/measure`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: uid,
        question: question,
        k: topK,
        answer: answer,
      }),
      openWhenHidden: true, //页面退至后台保持连接
      // onopen: async (response) => {},
      onmessage: (event) => parseStream(event, controller),
      onerror(err) {
        Message.error(err.toString());
        console.log("❌ === error from server", err);
        controller.abort();
        // setLoading({ loading: false });
        set((state) => {
          return { loading: { ...state.loading, loading: false } };
        });
        throw err; // 停止重试
      },
    });
  },
}));
