import { Provider } from "mobx-react";
import React from "react";
import ReactDOM from "react-dom";
import { NotificationContainer } from "react-notifications";

import "react-notifications/lib/notifications.css";

import { GameView } from "./game";
import { Store } from "./store";

import "./scss/global.scss";

export const store = new Store();

// localStorage.debug = "*";

function App() {
  return (
    <Provider store={store}>
      <div style={{ width: "100%", height: "100%" }}>
        <GameView />
        <NotificationContainer />
      </div>
    </Provider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
