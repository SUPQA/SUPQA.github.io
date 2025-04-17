import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";

import CoreMap from "./components/map/CoreMap";
import Header from "./components/Header";
import QueryPanel from "./components/QueryPanel";
import SideBar from "./components/SideBar";
import BottomPanel from "./components/BottomPanel";
import { Spin } from "@arco-design/web-react";
import { useGlobalStore } from "./models/useGlobalStore";

function App() {
  const [hoverCoord, setHoverCoord] = useState<any>();
  const { loading } = useGlobalStore();

  return (
    <div className={"w-screen h-screen relative overflow-hidden flex flex-col"}>
      <Header hoverCoord={hoverCoord} />

      <Spin
        tip={
          typeof loading.tip === "string" ? (
            <>
              <div>This may take a while...</div>
              <div>{loading.tip}</div>
            </>
          ) : (
            loading.tip
          )
        }
        size={48}
        loading={loading.loading}
        className="h-full"
      >
        <div id="main" className="main relative flex-1 h-full">
          <CoreMap setHoverCoord={setHoverCoord} />
          <QueryPanel />
          <BottomPanel />
          <div className="sideBar">
            <SideBar />
          </div>
        </div>
      </Spin>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
