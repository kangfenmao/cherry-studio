import '@fontsource/inter'
import store, { persistor } from '@renderer/store'
import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import Sidebar from './components/app/Sidebar'
import TopViewContainer from './components/TopView'
import { AntdThemeConfig, getAntdLocale } from './config/antd'
import './i18n'
import AppsPage from './pages/apps/AppsPage'
import HomePage from './pages/home/HomePage'
import SettingsPage from './pages/settings/SettingsPage'

function App(): JSX.Element {
  return (
    <ConfigProvider theme={AntdThemeConfig} locale={getAntdLocale()}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <TopViewContainer>
            <HashRouter>
              <Sidebar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/apps" element={<AppsPage />} />
                <Route path="/settings/*" element={<SettingsPage />} />
              </Routes>
            </HashRouter>
          </TopViewContainer>
        </PersistGate>
      </Provider>
    </ConfigProvider>
  )
}

export default App
