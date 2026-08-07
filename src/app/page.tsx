import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
// Showcase parked until real case studies exist — re-enable with the import below.
// import FeaturedWork from "@/components/FeaturedWork";
import Solutions from "@/components/Solutions";
import About from "@/components/About";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Experiments from "@/components/Experiments";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Preloader />
      <Cursor />
      <Navbar />
      <main id="main">
        <Hero />
        {/* <FeaturedWork /> */}
        <Solutions />
        <About />
        <Services />
        <Process />
        <Experiments />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
