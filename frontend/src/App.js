import './App.css'
import './index.css'

import {BrowserRouter, Routes, Route} from 'react-router-dom'

import Navbar from './components/Navbar'

import Home from './pages/Home'
import Analyze from './pages/Analyze'
import Results from './pages/Results'
import History from './pages/History'

import {Toaster} from './components/ui/toaster'

const App = () => (
  <BrowserRouter>
    <div className="App min-h-screen bg-white font-body">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/history" element={<History />} />
      </Routes>

      <Toaster />
    </div>
  </BrowserRouter>
)

export default App