import React, { useEffect, useState } from 'react';
import { Button, Radio } from '@arco-design/web-react';
import {
  IconCamera,
  IconDownload,
  IconMoreVertical,
} from '@arco-design/web-react/icon';
import AreaList from './AreaList';
import { GEOTYPE, useMaskerStore } from '@/models/useMaskerStore';
import POILineChart from './POILineChart';
import { useGlobalStore } from '@/models/useGlobalStore';
import DownloadSvgModal from '../pureComps/DownloadSvgModal';
import { MOCK_POI_COUNTER } from '@/config';

const ICON_FONT_SIZE = 20;
const RadioGroup = Radio.Group;

const BottomPanel = () => {
  const [poiCount, setPoiCount] = useState(MOCK_POI_COUNTER);
  const [visible, setVisible] = useState(false);
  const { selectStep, colorScale } = useGlobalStore();

  const { POIpoints, maskerType, setMaskerType } = useMaskerStore();

  useEffect(() => {
    if (!POIpoints) return;
    const countByCategory = (items) =>
      items.reduce((acc, { category }) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
    const categoryCounts = countByCategory(POIpoints);
    setPoiCount(categoryCounts);
  }, [POIpoints]);

  return (
    <div className="bottomPanel">
      <AreaList />
      <div className="navigation-view flex flex-1 flex-col gap-4">
        {/* Description */}
        <div className="flex items-center relative  justify-between">
          <RadioGroup
            type="button"
            name="lang"
            size="mini"
            value={maskerType}
            onChange={(value) => setMaskerType(value)}
          >
            <Radio value={GEOTYPE.City}>City</Radio>
            {/* <Radio value={GEOTYPE.District}>District</Radio> */}
            <Radio value={GEOTYPE.Community}>Community</Radio>
          </RadioGroup>
          {/* <div className="flex -translate-x-2/4 absolute left-2/4 font-bold  truncate flex-1 max-w-[550px]"> */}
          <div className="font-bold truncate max-w-[550px]">
            {selectStep?.description}
          </div>
          <div className="flex">
            <Button
              onClick={() => {}}
              shape="circle"
              className="control-btn"
              type="text"
            >
              <IconCamera fontSize={ICON_FONT_SIZE} />
            </Button>
            <Button
              onClick={() => {
                setVisible(true);
              }}
              shape="circle"
              className="control-btn"
              type="text"
            >
              <IconDownload fontSize={ICON_FONT_SIZE} />
            </Button>
            <Button
              onClick={() => {}}
              shape="circle"
              className="control-btn"
              type="text"
            >
              <IconMoreVertical fontSize={ICON_FONT_SIZE} />
            </Button>
          </div>
        </div>
        {/* StepLine */}
        <div
          id={'container-timeline'}
          className="timeline flex-1 my-2 mx-6 flex flex-col justify-between h-20"
        >
          <POILineChart width={800} data={poiCount} colorScale={colorScale} />
        </div>
      </div>
      <DownloadSvgModal visible={visible} setVisible={setVisible} />
    </div>
  );
};
export default BottomPanel;
