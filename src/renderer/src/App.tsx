import store, { persistor } from '@renderer/store'
import { Provider } from 'react-redux'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'

import Sidebar from './components/app/Sidebar'
import TopViewContainer from './components/TopView'
import AgentsPage from './pages/agents/AgentsPage'
import AppsPage from './pages/apps/AppsPage'
import HomePage from './pages/home/HomePage'
import SettingsPage from './pages/settings/SettingsPage'
import TranslatePage from './pages/translate/TranslatePage'
import AntdProvider from './providers/AntdProvider'
import { ThemeProvider } from './providers/ThemeProvider'

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AntdProvider>
          <PersistGate loading={null} persistor={persistor}>
            <TopViewContainer>
              <HashRouter>
                <Sidebar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/agents" element={<AgentsPage />} />
                  <Route path="/translate" element={<TranslatePage />} />
                  <Route path="/apps" element={<AppsPage />} />
                  <Route path="/settings/*" element={<SettingsPage />} />
                </Routes>
              </HashRouter>
            </TopViewContainer>
          </PersistGate>
        </AntdProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default App
