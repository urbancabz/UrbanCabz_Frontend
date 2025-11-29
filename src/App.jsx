import Footer from './Components/Footer/Footer';
import Navbar from './Components/Navigation/Navbar';
import B2BLandingPage from './Pages/B2BLandingPage';
import LandingPage from './Pages/LandingPage';
import CabBooking from './Pages/CabBooking';
import CabBookingDetails from './Pages/CabBookingDetails';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  return (
    <div className="overflow-x-hidden">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/b2b" element={<B2BLandingPage />} />
          <Route path="/cab-booking" element={<CabBooking />} />
          <Route path="/cab-booking-details" element={<CabBookingDetails />} />
        </Routes>
      <Footer />
    </Router>
    </div>
  )
}

export default App