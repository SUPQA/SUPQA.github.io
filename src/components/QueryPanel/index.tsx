import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMapStore } from "@/models/useMapStore";
import { Button, Input, Message, Tooltip } from "@arco-design/web-react";
import {
  IconDoubleLeft,
  IconDoubleRight,
  IconPause,
  IconPlayArrowFill,
  IconSend,
  IconSkipNextFill,
  IconSkipPreviousFill,
} from "@arco-design/web-react/icon";
import { getTreeStep, getDistrictArea, getSalientAreas } from "@/apis";
import { getAllNodes } from "@/lib/utils";
import NestedTree from "./NestedTree";
import { GEOTYPE, useMaskerStore } from "@/models/useMaskerStore";
import { CategoryItems, throttleTime } from "@/config";
import { throttle } from "lodash";
import { useGlobalStore } from "@/models/useGlobalStore";
import { WEB_DOMAIN } from "@/apis/request";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const ICON_FONT_SIZE = 24;

const QueryPanel = (props) => {
  const {} = props;
  const [question, setQuestion] = useState<string>();
  const [stepList, setStepList] = useState<any>([]);
  const [current, setCurrent] = useState(-1);
  const hypo = useRef("");
  const answer = useRef("");

  const {
    info,
    colorScale,
    topK,
    treeData,
    setHypo,
    setLoading,
    setTreeData,
    setInfo,
    setColorScale,
    setSelectStep,
  } = useGlobalStore();
  const { changeHeatImgUrl } = useMapStore();
  const {
    maskerType,
    setMaskerType,
    setCircles,
    setSelectCircle,
    setDistrictArea,
  } = useMaskerStore();

  const doneCallback = useCallback(async (data) => {
    // setInfo(data);
    changeHeatImgUrl({ uid: data.uid, measure: "answer" });

    const treeData = await getTreeStep(data.uid);
    const allNode = getAllNodes([treeData]);

    const nameList = allNode.map((item) => item.name);
    setColorScale(
      new Set([...data.measureList, ...nameList, ...CategoryItems])
    );
    setTreeData(treeData);
    setStepList(allNode);
  }, []);

  const parseStream = useCallback(
    (eventData, controller) => {
      const event = eventData.event;
      const data = eventData.data;
      if (event === "error") throw new Error(data);

      console.log("🚨 === ", eventData);
      try {
        switch (event) {
          case "done":
            const parsedData2 = JSON.parse(data);
            doneCallback(parsedData2);
            setLoading({ loading: false });
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
            break;
          case "hypo":
            console.log("🚨 ===  hypo", data);
            hypo.current = hypo.current + data;
            setHypo(hypo.current);
            break;
          case "prompt":
            console.log("🚨 ===  prompt", data);
            answer.current = answer.current + data;
            setLoading({ loading: true, tip: answer.current });
            break;
          // case "info":
          //   const parsedData = JSON.parse(data);
          //   setInfo(parsedData);
          //   setLoading({
          //     loading: false,
          //     tip: "measure done but img generating",
          //   });
          //   break;
          default:
            return data;
        }
      } catch (error) {
        console.log("🚨 === JSON.parse Error", error);
        controller.abort();
        setLoading({ loading: false });
        throw new Error(data);
      }
    },
    [setLoading, setInfo, doneCallback]
  );

  const controller = new AbortController();

  const handleSend = useCallback(async () => {
    setLoading({ loading: true });
    hypo.current = "";
    answer.current = "";
    await fetchEventSource(`${WEB_DOMAIN}/pipeline/measure`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question, k: topK }),
      // openWhenHidden: true, //页面退至后台保持连接
      onmessage: (event) => parseStream(event, controller),
      onerror(err) {
        Message.error(err.toString());
        console.log("❌ === error from server", err);
        controller.abort();
        setLoading({ loading: false });
        throw err; // 停止重试
      },
    });
  }, [question, parseStream]);

  const handleClick = useCallback(
    (index: number) => {
      setCurrent(index);
    },
    [stepList, maskerType, info]
  );

  useEffect(
    throttle(() => {
      if (!stepList) {
        Message.info("Please send question first!");
        return;
      }
      if (current === -1) return;
      const params = {
        measure: stepList?.[current].measure,
        category: stepList?.[current].category,
        uid: info?.uid,
      };

      if (maskerType === GEOTYPE.District) {
        getDistrictArea(params).then((res: any) => {
          setDistrictArea(res);
        });
      } else if (maskerType === GEOTYPE.Community) {
        changeHeatImgUrl(params);

        getSalientAreas(params).then((res: any) => {
          setCircles(Object.values(res.circles));
          setSelectCircle(null);
        });
      } else {
        changeHeatImgUrl(params);
      }
    }, throttleTime),
    [current]
  );

  const handleNodeClick = useCallback(
    (cur) => {
      const index = stepList?.findIndex((item) => item.key === cur.key);
      if (index === undefined) return;
      handleClick(index);
      setCurrent(index);
    },
    [handleClick]
  );

  useEffect(() => {
    stepList && current >= 0 && setSelectStep(stepList?.[current]);
  }, [current, stepList]);

  return (
    <div className="queryPanel">
      <div className="queryPanel-input flex items-end pr-1">
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 5 }}
          placeholder="Enter keyword to search"
          style={{ height: "100%", background: "transparent", border: "none" }}
          value={question}
          color="#fff"
          onChange={(value: string) => {
            setQuestion(value);
          }}
        />
        <Button
          type="text"
          className="control-btn"
          shape="circle"
          icon={<IconSend fontSize={24} />}
          onClick={handleSend}
        />
      </div>
      {treeData && (
        <div className="queryPanel-tree flex flex-col flex-1">
          <div className="subtitle justify-between">
            Tree Navigation
            <div className="flex ">
              <Button
                disabled={current < 1}
                onClick={() => handleClick(current - 1)}
                shape="circle"
                type="text"
                className="control-btn"
              >
                <IconDoubleLeft fontSize={ICON_FONT_SIZE} />
              </Button>
              <Button
                type="text"
                shape="circle"
                disabled={current < 1}
                onClick={() => handleClick(current - 1)}
                className="control-btn"
              >
                <IconSkipPreviousFill fontSize={ICON_FONT_SIZE} />
              </Button>

              <div className="cursor-pointer">
                {current === -1 ? (
                  <Button
                    onClick={() => {
                      setMaskerType(GEOTYPE.Community);
                      handleClick(0);
                    }}
                    shape="circle"
                    type="text"
                    className="control-btn"
                  >
                    <IconPlayArrowFill fontSize={ICON_FONT_SIZE} />
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleClick(-1)}
                    shape="circle"
                    className="control-btn"
                    type="text"
                  >
                    <IconPause fontSize={ICON_FONT_SIZE} />
                  </Button>
                )}
              </div>
              <Button
                disabled={current >= stepList?.length - 1}
                onClick={() => handleClick(current + 1)}
                shape="circle"
                className="control-btn"
                type="text"
              >
                <IconSkipNextFill fontSize={ICON_FONT_SIZE} />
              </Button>
              <Button
                disabled={current >= stepList?.length - 1}
                onClick={() => handleClick(current + 1)}
                shape="circle"
                className="control-btn"
                type="text"
              >
                <IconDoubleRight fontSize={ICON_FONT_SIZE} />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-start">
            <NestedTree
              data={treeData}
              colorScale={colorScale}
              current={stepList?.[current]}
              setCurrent={handleNodeClick}
            />
          </div>

          <div
            className="w-full flex items-center justify-start flex-wrap max-h-[50px] overflow-y-auto overflow-x-hidden gap-2 mt-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {colorScale?.domain()?.map((item) => {
              return (
                <Tooltip content={item} key={item}>
                  <div className="flex gap-2 justify-center items-center  flex-nowrap ">
                    <div
                      className="w-[10px] h-[10px] tunnate"
                      style={{ backgroundColor: colorScale?.(item) }}
                    ></div>
                    <div className="truncate w-[90px]">{item}</div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default QueryPanel;
