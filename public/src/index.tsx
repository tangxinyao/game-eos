import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { NotificationContainer } from 'react-notifications';

import { GameView } from './game';
import { Store } from './store';

import './scss/global.scss';
import 'react-notifications/lib/notifications.css';

export const store = new Store();

function App() {
  return (
    <Provider store={store}>
      <div style={{ width: '100%', height: '100%' }}>
        <GameView />
        <NotificationContainer />
      </div>
    </Provider>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
