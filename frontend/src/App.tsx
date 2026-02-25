import React from "react"


import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom"
import Navbar from "./components/Layout/Navbar"
import Footer from "./components/Layout/Footer"
import Home from "./components/Pages/Home"
import Profile from "./components/Pages/Profile"
import Cart from "./components/Pages/Cart"
// import CheckOutButton from "./components/CheckOutButton"


function App() {

  return (
    <>
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route path="/" element={<Home/>} />
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/cart" element={<Cart/>}/>
          </Route>
        </Routes>
      
      </BrowserRouter>    
   
    </>
  )
}


function Layout(){

  return<>
    <div>
      <Navbar/>
    </div>
    <div>
      <Outlet />
    </div>
    <div>
      <Footer />
    </div>
  </>
}

export default App
