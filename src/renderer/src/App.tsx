import '@fontsource/inter'
import store, { persistor } from '@renderer/store'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import Sidebar from './components/app/Sidebar'
import AppsPage from './pages/apps/AppsPage'
import HomePage from './pages/home/HomePage'
import SettingsPage from './pages/settings/SettingsPage'

function App(): JSX.Element {
  return (
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
  )
}

export default App
