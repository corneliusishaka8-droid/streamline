import { Routes, Route } from 'react-router'
import Home from "./pages/Home"
import Search from "./pages/Search"
import Details from "./pages/Details"


function App(){
      return(
        <div>
            {/* Vercel rewrites deep links back to this client-side router. */}
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/details/:mediaType/:id" element={<Details />} />
            </Routes>
        </div>
      )
}

export default App