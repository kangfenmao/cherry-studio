import Sidebar from './components/app/Sidebar'
import Statusbar from './components/app/Statusbar'
import HomePage from './pages/home/HomePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppsPage from './pages/apps/AppsPage'
import SettingsPage from './pages/settings/SettingsPage'
import '@fontsource/inter'

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Sidebar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/settings/*" element={<SettingsPage />} />
      </Routes>
      <Statusbar />
    </BrowserRouter>
  )
}

export default App
