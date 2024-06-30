import '@fontsource/inter'
import store, { persistor } from '@renderer/store'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import Sidebar from './components/app/Sidebar'
import AppsPage from './pages/apps/AppsPage'
import HomePage from './pages/home/HomePage'
import SettingsPage from './pages/settings/SettingsPage'
import { ConfigProvider, theme } from 'antd'

function App(): JSX.Element {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
          borderRadius: 5,
          colorBgContainer: '#f6ffed'
        },
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm]
      }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <Sidebar />
            <Routes>
              <Route path="" element={<HomePage />} />
              <Route path="/apps" element={<AppsPage />} />
              <Route path="/settings/*" element={<SettingsPage />} />
            </Routes>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </ConfigProvider>
  )
}

export default App
