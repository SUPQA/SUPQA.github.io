import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CategoryImgRootUrl, ClassImgRootUrl } from "@/config";
import { useMaskerStore } from "@/models/useMaskerStore";
import {
  Button,
  Grid,
  Message,
  Radio,
  Select,
  Slider,
} from "@arco-design/web-react";
import PolygonSlider from "./PolygonSlider";
import { IconCopy, IconSend } from "@arco-design/web-react/icon";
import { hexToRgb } from "@/lib/utils";
import { useGlobalStore } from "@/models/useGlobalStore";
import { postReGenerate } from "@/apis";

const RadioGroup = Radio.Group;
const Row = Grid.Row;
const Col = Grid.Col;
const Option = Select.Option;

const SideBar = () => {
  const [category, setCategory] = useState<any>({});
  const [selectCat, setSelectCat] = useState<string>();
  const [tuningType, setTuningType] = useState<number>(1);
  const {
    info,
    hypo,
    colorScale,
    topK,
    setInfo,
    setLoading,
    setTopK,
    handleSend,
  } = useGlobalStore();
  const { POILanguage, setPOIFilterTarget, setPOILanguage } = useMaskerStore();
  const { changeHeatImgUrl } = useGlobalStore();

  const messagesEndRef = useRef(null);
  const polygonRef = useRef(null);

  const colors = useMemo(() => {
    if (!colorScale) return;
    const colorHex = colorScale?.range();
    const cRGB = colorHex.map((hex) => hexToRgb(hex));
    return cRGB;
  }, [colorScale]);

  const calcBackground = useCallback(
    (text, index) => {
      if (!info || !colors) return;
      const textValue = Object.values(info.words[index])[0] as any;
      let tColor = [];
      textValue.forEach((value, index) => {
        if (parseFloat(value) !== 0) {
          const c_str = `rgba(${colors[index].join(",")},${value})`;
          tColor.push(c_str);
        }
      });
      if (tColor.length == 0) return;

      const textLength = text.length;
      const colorBlocks = tColor.length;
      const blockSize = Math.ceil(textLength / colorBlocks);

      let background = "linear-gradient(90deg, ";
      tColor.forEach((color, index) => {
        const start = ((index * blockSize) / textLength) * 100;
        const end = (((index + 1) * blockSize) / textLength) * 100;

        background += `${color} ${start}%, ${color} ${end}%`;
        if (index < tColor.length - 1) {
          background += ", ";
        }
      });
      background += ")";

      return background;
    },
    [info, colors]
  );

  const handleClick = (rootPath: string, imgName: string) => {
    setPOIFilterTarget(imgName);
  };

  const categoryOptions = useMemo(() => {
    return Object.keys(category).map((key) => {
      return (
        <Option
          key={key}
          value={key}
          onClick={() => {
            setSelectCat(key);
            handleClick(CategoryImgRootUrl, key);
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "100%",
              marginRight: 8,
              backgroundColor: colorScale?.(key),
            }}
          ></span>
          {key}
        </Option>
      );
    });
  }, [category, colorScale]);

  const classOptions = useMemo(() => {
    return (
      selectCat &&
      category[selectCat].map((key) => {
        return (
          <Option
            key={key}
            value={key}
            onClick={() => handleClick(ClassImgRootUrl, key)}
          >
            {key}
          </Option>
        );
      })
    );
  }, [selectCat]);

  const onGenerate = useCallback(async () => {
    setLoading({ loading: true });
    let weight = info.weightList;
    if (tuningType) {
      weight = polygonRef.current.weightRef.current.map(
        (item) => item.percent / 100
      );
      // console.log(weight);
    }
    const newInfo = await postReGenerate({ uid: info?.uid, weight: weight });
    changeHeatImgUrl({ uid: info.uid, measure: "answer", date: newInfo.date });
    setInfo(newInfo);
    setLoading({ loading: false });
  }, [info, tuningType]);

  const handleCopy = useCallback(() => {
    const textToCopy = hypo || info?.hypoDoc;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        Message.success("复制成功");
      })
      .catch(() => {
        Message.error("复制失败");
      });
  }, [hypo, info?.hypoDoc]);

  useEffect(() => {
    fetch("data/category.json")
      .then((response) => response.json())
      .then((data) => {
        setCategory(data);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [hypo]);

  return (
    <div className="sideBar-main">
      <div className="px-4 flex flex-col">
        <div className="subtitle flex justify-between">
          Parameter setting
          <RadioGroup
            type="button"
            size="mini"
            value={POILanguage}
            onChange={(value) => setPOILanguage(value)}
          >
            <Radio value="en">EN</Radio>
            <Radio value="cn">CN</Radio>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-4">
          <Row className="grid-gutter-demo" gutter={24}>
            <Col span={6} className="font-semibold">
              TopK
            </Col>
            <Col span={16}>
              <Slider
                value={topK}
                min={1}
                max={5}
                step={1}
                onChange={(value) => setTopK(value as number)}
                style={{ color: "red" }}
              />
            </Col>
            <Col span={2}>{topK}</Col>
          </Row>
          <Row className="grid-gutter-demo" gutter={24}>
            <Col span={6} className="font-semibold">
              Category:
            </Col>
            <Col span={18}>
              <Select defaultValue={"all"}>{categoryOptions}</Select>
            </Col>
          </Row>

          <Row className="grid-gutter-demo" gutter={24}>
            <Col span={6} className="font-semibold">
              Class:
            </Col>
            <Col span={18}>
              <Select placeholder="Filter Class">{classOptions}</Select>
            </Col>
          </Row>
        </div>
      </div>
      <div className="px-4 flex flex-col">
        <div className="subtitle">
          Measure Fine-tuning
          <RadioGroup
            type="button"
            size="mini"
            value={tuningType}
            onChange={(value) => setTuningType(value)}
          >
            <Radio value={0}>S</Radio>
            <Radio value={1}>P</Radio>
          </RadioGroup>
        </div>
        <div className="ml-auto">
          <Button
            type="text"
            size="mini"
            icon={<IconSend />}
            onClick={() => {
              onGenerate();
            }}
          >
            &nbsp;Re-Generate
          </Button>
        </div>
        <div className="flex flex-col justify-center items-center">
          {tuningType ? (
            <PolygonSlider
              ref={polygonRef}
              width={250}
              height={250}
              vertex={
                topK < info?.measureList?.length
                  ? topK
                  : info?.measureList?.length
              }
              colorScale={colorScale}
            />
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {info?.measureList?.map((item, index) => (
                <Row className="grid-gutter-demo" gutter={24}>
                  <Col span={6} className="font-semibold">
                    {item}
                  </Col>
                  <Col span={16}>
                    <Slider
                      value={topK}
                      min={1}
                      max={5}
                      step={1}
                      onChange={(value) => setTopK(value as number)}
                    />
                  </Col>
                  <Col span={2}>{topK}</Col>
                </Row>
              ))}
            </div>
          )}
        </div>
      </div>
      <div id="hypo-panel" className="px-4 flex flex-col">
        <div className="subtitle">
          Pseudo-Document
          <div>
            <Button
              type="primary"
              size="mini"
              className="control-btn"
              icon={<IconCopy />}
              onClick={handleCopy}
            >
              &nbsp;Copy
            </Button>
          </div>
        </div>
        <div
          className=" flex flex-wrap  overflow-y-auto mt-[12px] max-h-[300px] text-sm"
          style={{ scrollbarWidth: "none" }}
        >
          {hypo
            ? hypo
            : info?.hypoDoc?.split(" ")?.map((text, index) => (
                <span
                  key={index}
                  style={{
                    background: calcBackground(text, index),
                  }}
                >
                  {text}&nbsp;
                </span>
              ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
export default SideBar;
