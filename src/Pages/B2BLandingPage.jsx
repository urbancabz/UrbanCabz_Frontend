import React, { useEffect } from "react";
import Section01 from "../Components/B2BPageSection/Section01/Section01";
import Services from "../Components/B2BPageSection/Section02/Services";
import Process from "../Components/B2BPageSection/Section03/Process";
import Contact from "../Components/B2BPageSection/Section04/Contact";

export default function B2BLandingPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-black min-h-screen text-white no-scrollbar overflow-y-auto h-screen">
      <Section01 />
      <Services />
      <Process />
      <Contact />
    </div>
  );
}
