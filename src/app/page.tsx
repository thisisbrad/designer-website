import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/FeaturedWork";
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
        <FeaturedWork />
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
