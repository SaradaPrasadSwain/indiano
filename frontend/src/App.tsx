import React from "react"

import Header from "./components/Layout/Header"
import Footer from "./components/Layout/Footer"
import Home from "./components/Pages/Home"

import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom"
// import CheckOutButton from "./components/CheckOutButton"


function App() {

  return (
    <>
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<Layout/>}>
            <Route path="/" element={<Home/>} />
            
          </Route>
        </Routes>
      
      </BrowserRouter>    
   
    </>
  )
}


function Layout(){

  return<>
    <div>
      <Header />
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
