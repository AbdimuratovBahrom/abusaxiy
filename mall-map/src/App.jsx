import { Route, Routes } from 'react-router-dom'
import MapPage from './pages/MapPage.jsx'
import EditorPage from './pages/EditorPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  )
}

export default App
