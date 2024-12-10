import AppDownload from "../components/AppDownload";
import FAQ from "../components/FAQ";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowitWork";

const Home = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <Features />
      <HowItWorks />
      <FAQ />
      <AppDownload />
      <Footer />
    </div>
  );
};

export default Home;
