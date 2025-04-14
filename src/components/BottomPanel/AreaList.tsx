import React, { useCallback, useEffect, useRef } from 'react';
import ImageCircleCrop from '../pureComps/ImageCircleCrop';
import { useMapStore } from '@/models/useMapStore';
import { GEOTYPE, useMaskerStore } from '@/models/useMaskerStore';
import { Button, Descriptions, Tag } from '@arco-design/web-react';
import PinFill from '@/assets/icons/pinFill.svg';
import ImageCrop from '../pureComps/ImageCrop';
import { latlng2pixel } from '@/lib/utils';

const AreaList = () => {
  const containerRef = useRef<HTMLDivElement>();
  const { heatMapImg } = useMapStore();
  const {
    circleList,
    selectCircle,
    customFeatures,
    maskerType,
    setSelectCircle,
  } = useMaskerStore();

  const onClickCard = useCallback((e, item) => {
    setSelectCircle(item);
    scrollToCenter(e.target);
  }, []);

  const scrollToCenter = useCallback(
    (element) => {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // console.log(containerRect, elementRect);

      const offset = elementRect.left - containerRect.left;
      const scrollLeft = container.scrollLeft;
      const elementLeft =
        offset + scrollLeft - (containerRect.width / 2 - elementRect.width / 2);

      container.scrollTo({
        left: elementLeft,
        behavior: 'smooth',
      });
    },
    [containerRef]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const targetElement = Array.from(container.children).find(
      (child) => child.getAttribute('data-key') === selectCircle?.cUid
    );
    targetElement && scrollToCenter(targetElement);
  }, [selectCircle, containerRef]);

  const customPolygons = customFeatures?.map((pg) => {
    const polygon = pg.coordinates[0].map((item) =>
      latlng2pixel(item[0], item[1])
    );
    console.log(polygon);

    return {
      coord: polygon,
      cUid: Math.random().toString(),
      type: 'Custom',
    };
  });
  console.log(customPolygons);

  return (
    maskerType === GEOTYPE.Community && (
      <div className="area-list " ref={containerRef}>
        {circleList?.map((item) => (
          <div
            className="area-list-card"
            key={item.cUid}
            data-key={item.cUid}
            style={{
              borderWidth:
                selectCircle && item.cUid === selectCircle.cUid ? 3 : 1,
              backgroundColor:
                selectCircle && item.cUid === selectCircle.cUid
                  ? '#EEF9E4'
                  : '#fff',
            }}
            onClick={(e) => onClickCard(e, item)}
          >
            <ImageCircleCrop
              imageUrl={heatMapImg}
              centerX={item.centroid_px[0]}
              centerY={item.centroid_px[1]}
              radius={item.radius_px}
            />
            <div className="card-info">
              <Descriptions
                column={1}
                size="small"
                colon=":"
                labelStyle={{ textAlign: 'left', paddingRight: 4 }}
                data={[
                  {
                    label: 'Coord',
                    value: `${item.centroid[1].toFixed(
                      2
                    )}, ${item.centroid[0].toFixed(2)}`,
                  },
                  {
                    label: 'Radius',
                    value: `${item.radius.toFixed(2)} (M)`,
                  },
                ]}
              />
              <div className="flex justify-between items-center">
                <Tag color="#12372a" size="small">
                  {item.type}
                </Tag>
                <Button
                  // onClick={() => handleClick(current - 1)}
                  shape="circle"
                  type="text"
                  size="mini"
                  className="control-btn"
                >
                  <PinFill />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* {customPolygons?.map((item) => (
          <div
            className="area-list-card"
            key={item.cUid}
            data-key={item.cUid}
            style={{
              borderWidth:
                selectCircle && item.cUid === selectCircle.cUid ? 3 : 1,
              backgroundColor:
                selectCircle && item.cUid === selectCircle.cUid
                  ? '#EEF9E4'
                  : '#fff',
            }}
            onClick={(e) => onClickCard(e, item)}
          >
            <ImageCrop imageUrl={heatMapImg} polygon={item.coord} />
            <div className="card-info items-end">
              
              <div className="flex justify-between items-center">
                <Tag color="#12372a" size="small">
                  {item.type}
                </Tag>
                <Button
                  // onClick={() => handleClick(current - 1)}
                  shape="circle"
                  type="text"
                  size="mini"
                  className="control-btn"
                >
                  <PinFill />
                </Button>
              </div>
            </div>
          </div>
        ))} */}
      </div>
    )
  );
};

export default AreaList;
