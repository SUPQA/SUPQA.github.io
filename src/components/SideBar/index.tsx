import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CategoryImgRootUrl, ClassImgRootUrl } from "@/config";
import { useMaskerStore } from "@/models/useMaskerStore";
import { Button, Grid, Radio, Select, Slider } from "@arco-design/web-react";
import PolygonSlider from "./PolygonSlider";
import { IconCheckCircle, IconCopy } from "@arco-design/web-react/icon";
import { hexToRgb } from "@/lib/utils";
import { useGlobalStore } from "@/models/useGlobalStore";

const RadioGroup = Radio.Group;
const Row = Grid.Row;
const Col = Grid.Col;
const Option = Select.Option;

const SideBar = () => {
  // const [topK, setTopK] = useState<number>(5);
  const [category, setCategory] = useState<any>({});
  const [selectCat, setSelectCat] = useState<string>();
  const { info, hypo, colorScale, topK, setLoading, setTopK } =
    useGlobalStore();
  const { POILanguage, setPOIFilterTarget, setPOILanguage } = useMaskerStore();

  const messagesEndRef = useRef(null);

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

  const onGenerate = useCallback(() => {
    setLoading({ loading: true });
  }, []);

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
                max={10}
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
          <div>
            <Button
              type="primary"
              size="mini"
              icon={<IconCheckCircle />}
              onClick={() => {
                onGenerate();
              }}
            >
              &nbsp;Generate
            </Button>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center">
          <PolygonSlider
            width={250}
            height={250}
            vertex={
              topK < info?.measureList?.length
                ? topK
                : info?.measureList?.length
            }
            colorScale={colorScale}
          />
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
              // shape="round"
              icon={<IconCopy />}
            >
              &nbsp;Copy
            </Button>

            {/* <Button
            type="text"
            size="mini"
            className="control-btn"
            shape="circle"
            icon={<IconRefresh fontSize={16} />}
          /> */}
          </div>
        </div>
        <div
          className=" flex flex-wrap  overflow-y-auto mt-[12px] max-h-[300px]"
          style={{ scrollbarWidth: "none" }}
        >
          {info
            ? info.hypoDoc?.split(" ")?.map((text, index) => (
                <span
                  key={index}
                  style={{
                    background: calcBackground(text, index),
                  }}
                >
                  {text}&nbsp;
                </span>
              ))
            : hypo}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
export default SideBar;
