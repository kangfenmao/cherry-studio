import '@fontsource/inter'
import store from '@renderer/store'
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Sidebar from './components/app/Sidebar'
import Statusbar from './components/app/Statusbar'
import AppsPage from './pages/apps/AppsPage'
import HomePage from './pages/home/HomePage'
import SettingsPage from './pages/settings/SettingsPage'

function App(): JSX.Element {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Sidebar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/settings/*" element={<SettingsPage />} />
        </Routes>
        <Statusbar />
      </BrowserRouter>
    </Provider>
  )
}

export default App
