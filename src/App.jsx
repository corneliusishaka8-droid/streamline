import { Routes, Route } from 'react-router'
import Home from "./pages/Home"
import Search from "./pages/Search"
import Details from "./pages/Details"
import Profile from './pages/profile'
import MyLists from './pages/MyLists'
import Legal from './pages/Legal'
import Login from './pages/Login'
import PageAnimations from './components/PageAnimations'


function App(){
      return(
        <div>
            {/* Vercel rewrites deep links back to this client-side router. */}
            <PageAnimations><Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/details/:mediaType/:id" element={<Details />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-lists" element={<MyLists />} />
              <Route path="/privacy" element={<Legal type="privacy" />} />
              <Route path="/policies" element={<Legal type="policies" />} />
              <Route path="/login" element={<Login />} />
            </Routes></PageAnimations>
        </div>
      )
}

export default App
