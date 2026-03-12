import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { WorksSection } from "@/components/WorksSection";
import { projects } from "@/content/projects";
import { getContentByLocale, getWhatsappUrl } from "@/content/site-content";

export default function WorksPage() {
  const content = getContentByLocale();
  const whatsappUrl = getWhatsappUrl();

  return (
    <>
      <Navbar
        brand={content.nav.brand}
        links={content.nav.links}
        email={content.contact.email}
        copyEmailLabel={content.nav.copyEmail}
        contactWhatsappLabel={content.nav.contactWhatsapp}
        whatsappUrl={whatsappUrl}
      />

      <main className="pt-24">
        <WorksSection heading={content.works.pageHeading} intro={content.works.pageIntro} items={projects} />

        <ContactSection
          heading={content.contact.heading}
          intro={content.contact.intro}
          email={content.contact.email}
          contactLabel={content.contact.contactLabel}
          copyEmailLabel={content.contact.copyEmail}
          whatsappLabel={content.contact.whatsappLabel}
          whatsappUrl={whatsappUrl}
          socials={content.contact.socials}
        />
      </main>

      <Footer brandLine={content.footer.brandLine} copyright={content.footer.copyright} socials={content.contact.socials} />
    </>
  );
}
