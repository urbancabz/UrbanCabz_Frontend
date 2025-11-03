import React from 'react'
import Section01 from './Components/Section01/Section01'
import Section02 from './Components/Section02/Section02'
import Footer from "./Components/Footer";


function App() {
  return (
    <div className="overflow-x-hidden">
      <Section01 />
      <Section02 />
      <Footer />
    </div>
  )
}

export default App