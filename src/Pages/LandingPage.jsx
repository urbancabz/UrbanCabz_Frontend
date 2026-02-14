import React from 'react'
import Section01 from "../Components/LandingPageSection/Section01/Section01";
import Section02 from "../Components/LandingPageSection/Section02/Section02"
import TestimonialsSection from "../Components/LandingPageSection/Section03/TestimonialsSection"

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-300">
      <Section01 />
      <Section02 />
      <TestimonialsSection />
    </div>
  )
}
