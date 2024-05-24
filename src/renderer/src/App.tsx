import styled from 'styled-components'
import Sidebar from './components/app/Sidebar'
import Statusbar from './components/app/Statusbar'
import HomePage from './pages/home/HomePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppsPage from './pages/apps/AppsPage'

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <MainContainer>
        <Sidebar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/apps" element={<AppsPage />} />
        </Routes>
        <Statusbar />
      </MainContainer>
    </BrowserRouter>
  )
}

const MainContainer = styled.main`
  display: flex;
  flex-direction: row;
  flex: 1;
`

export default App
