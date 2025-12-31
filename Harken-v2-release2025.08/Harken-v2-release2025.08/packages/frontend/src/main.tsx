import ReactDOM from 'react-dom/client';
import Toast from '@/components/tost';

import { AppProvider } from './provider';
import { App } from './App';
import './index.css';
import { Provider } from 'react-redux';
import store from './utils/store';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './utils/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <AppProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Toast />
          <App />
        </PersistGate>
      </Provider>
    </AppProvider>
  </>
);
