import React, { useCallback, useEffect, useState } from "react";
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
import { getDistrictArea, getSalientAreas } from "@/apis";
import NestedTree from "./NestedTree";
import { GEOTYPE, useMaskerStore } from "@/models/useMaskerStore";
import { throttleTime } from "@/config";
import { throttle } from "lodash";
import { useGlobalStore } from "@/models/useGlobalStore";

const ICON_FONT_SIZE = 24;

const QueryPanel = (props) => {
  const {} = props;
  const [question, setQuestion] = useState<string>();
  const [stepList, setStepList] = useState<any>([]);
  const [historyList, setHistoryList] = useState<any>([]);
  const [current, setCurrent] = useState(-1);

  const {
    info,
    colorScale,
    topK,
    treeData,
    setSelectStep,
    handleSend,
    changeHeatImgUrl,
  } = useGlobalStore();
  const {
    maskerType,
    setMaskerType,
    setCircles,
    setSelectCircle,
    setDistrictArea,
  } = useMaskerStore();

  // const doneCallback = useCallback(async (data) => {
  //   setInfo(data);
  //   let supHistory = JSON.parse(localStorage.getItem("supHistory")) ?? [];
  //   if (supHistory.findIndex((item) => item.uid === data.uid) === -1) {
  //     supHistory.unshift({ uid: data.uid, q: data.question, date: data.date });
  //   }
  //   localStorage.setItem("supHistory", JSON.stringify(supHistory));
  //   setHistoryList(supHistory);

  //   changeHeatImgUrl({ uid: data.uid, measure: "answer" });

  //   const treeData = await getTreeStep(data.uid);
  //   const allNode = getAllNodes([treeData]);

  //   const nameList = allNode.map((item) => item.name);
  //   setColorScale(
  //     new Set([...data.measureList, ...nameList, ...CategoryItems])
  //   );
  //   setTreeData(treeData);
  //   setStepList(allNode);
  // }, []);

  // const parseStream = useCallback(
  //   (eventData, controller) => {
  //     const event = eventData.event;
  //     const data = eventData.data;
  //     if (event === "error") throw new Error(data);

  //     console.log("🚨 === ", eventData);
  //     try {
  //       switch (event) {
  //         case "done":
  //           const parsedData2 = JSON.parse(data);
  //           doneCallback(parsedData2);
  //           setLoading({ loading: false });
  //           break;
  //         case "hypoStart":
  //           document.getElementById("main").classList.add("loading");
  //           document
  //             .getElementById("hypo-panel")
  //             .classList.add("loading-highlight");
  //           break;
  //         case "hypoDone":
  //           document.getElementById("main").classList.remove("loading");
  //           document
  //             .getElementById("hypo-panel")
  //             .classList.remove("loading-highlight");
  //           break;
  //         case "hypo":
  //           console.log("🚨 ===  hypo", data);
  //           hypo.current = hypo.current + data;
  //           setHypo(hypo.current);
  //           break;
  //         case "prompt":
  //           console.log("🚨 ===  prompt", data);
  //           answer.current = answer.current + data;
  //           setLoading({ loading: true, tip: answer.current });
  //           break;
  //         case "map":
  //           console.log("🚨 ===  map", data);
  //           let mapData = JSON.parse(data);
  //           setLoading({
  //             loading: true,
  //             tip: (
  //               <>
  //                 <div>Processing map... This may take 30 - 60 s</div>
  //                 <Progress
  //                   size="large"
  //                   steps={mapData.total}
  //                   percent={
  //                     (parseInt(mapData.index) / parseInt(mapData.total)) * 100
  //                   }
  //                   strokeWidth={8}
  //                   trailColor="rgb(var(--primary-2))"
  //                 />
  //               </>
  //             ),
  //           });
  //           break;
  //         default:
  //           return data;
  //       }
  //     } catch (error) {
  //       console.log("🚨 === JSON.parse Error", error);
  //       controller.abort();
  //       setLoading({ loading: false });
  //       throw new Error(data);
  //     }
  //   },
  //   [setLoading, setInfo, doneCallback]
  // );

  // const controller = new AbortController();

  // const handleSend = useCallback(
  //   async (uid?: string) => {
  //     setLoading({ loading: true });

  //     await fetchEventSource(`${WEB_DOMAIN}/pipeline/measure`, {
  //       method: "POST",
  //       signal: controller.signal,
  //       headers: {
  //         Accept: "text/event-stream",
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         uid: uid,
  //         question: question,
  //         k: topK,
  //         hypo: hypo.current,
  //         answer: answer.current,
  //       }),
  //       openWhenHidden: true, //页面退至后台保持连接
  //       onopen: async (response) => {},
  //       onmessage: (event) => parseStream(event, controller),
  //       onerror(err) {
  //         Message.error(err.toString());
  //         console.log("❌ === error from server", err);
  //         controller.abort();
  //         setLoading({ loading: false });
  //         throw err; // 停止重试
  //       },
  //     });
  //   },
  //   [question, parseStream]
  // );

  const callback = useCallback(
    (history, allNode) => {
      setHistoryList(history);
      setStepList(allNode);
    },
    [setHistoryList, setStepList]
  );

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

  const onHistoryClick = useCallback(
    (history) => {
      handleSend({
        uid: history.uid,
        question,
        topK,
        callback,
      });
    },
    [question, topK, handleSend, callback]
  );

  useEffect(() => {
    stepList && current >= 0 && setSelectStep(stepList?.[current]);
  }, [current, stepList]);

  useEffect(() => {
    const supHistory = JSON.parse(localStorage.getItem("supHistory")) ?? [];

    setHistoryList(supHistory);
  }, []);

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
          onPressEnter={(e) => {
            e.preventDefault();
            handleSend({
              question,
              topK,
              callback,
            });
          }}
        />
        <Button
          type="text"
          className="control-btn"
          shape="circle"
          icon={<IconSend fontSize={24} />}
          onClick={() =>
            handleSend({
              question,
              topK,
              callback,
            })
          }
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

      {historyList.length > 0 && (
        <div className="historyPanel max-h-[160px] overflow-y-auto overflow-x-hidden ">
          {historyList.map((item) => (
            <div
              key={item.uid}
              className="panel mb-1 p-1 flex justify-between items-center cursor-pointer"
              onClick={() => onHistoryClick(item)}
            >
              <span className="truncate flex-1">{item.q} </span>
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default QueryPanel;
