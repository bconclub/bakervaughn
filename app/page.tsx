import EnquiryProvider from "@/components/enquiry/EnquiryProvider";
import Nav from "@/components/home/Nav";
import Hero from "@/components/home/Hero";
import WhyWeExist from "@/components/home/WhyWeExist";
import Services from "@/components/home/Services";
import Statement from "@/components/home/Statement";
import ConnectMap from "@/components/home/ConnectMap";
import Work from "@/components/home/Work";
import Operators from "@/components/home/Operators";
import Approach from "@/components/home/Approach";
import { Beliefs, Labs } from "@/components/home/LabsAndBeliefs";
import { Close, Footer } from "@/components/home/Close";

export default function Home() {
  return (
    <EnquiryProvider>
      <Nav />
      <main>
        <Hero />
        <WhyWeExist />
        <Services />
        <Statement />
        <ConnectMap />
        <Work />
        <Operators />
        <Approach />
        <Labs />
        <Beliefs />
        <Close />
      </main>
      <Footer />
    </EnquiryProvider>
  );
}
