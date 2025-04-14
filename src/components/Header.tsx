import React from 'react';
import { useMapStore } from '@/models/useMapStore';

const Header = (props) => {
  const { hoverCoord } = props;
  const geoState = useMapStore();
  // const { location } = geoState;

  return (
    <div className="header w-full">
      <div className="font-bold text-lg">
        SUPQA
      </div>
      <span className="text-sm ml-6 font-light">
        LLM-based Geo-Visualization for Subjective Urban Performance
        Question-Answering
      </span>
      {/* <div>
        {`${Math.abs(hoverCoord?.lat).toFixed(4)}${
          hoverCoord?.lat > 0 ? 'N' : 'S'
        }; ${Math.abs(hoverCoord?.lng).toFixed(4)}${
          hoverCoord?.lng > 0 ? 'E' : 'W'
        }`}
      </div> */}
    </div>
  );
};
export default Header;
