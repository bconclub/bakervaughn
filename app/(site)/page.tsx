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
import { getPageContent } from "@/lib/cms/read";

export default async function Home() {
  const c = await getPageContent("bakervaughn", "home");
  return (
    <EnquiryProvider>
      <Nav />
      <main>
        <Hero c={c.hero} />
        <WhyWeExist c={c.why} />
        <Services c={c.services} />
        <Statement c={c.statement} />
        <ConnectMap c={c.connect} />
        <Work c={c.work} />
        <Operators c={c.operators} />
        <Approach c={c.approach} />
        <Labs c={c.labs} />
        <Beliefs c={c.beliefs} />
        <Close c={c.close} />
      </main>
      <Footer c={c.footer} services={c.services.items} />
    </EnquiryProvider>
  );
}
