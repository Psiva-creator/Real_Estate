import React from 'react';
import Link from 'next/link';
import { Shield, Phone, Mail, MapPin, CheckCircle, Scale, Building } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import LanguageToggle from './LanguageToggle';

interface FooterProps {
  locale: Locale;
}

export default function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';

  return (
    <footer className="bg-[#141210] text-[#D8CFC4] border-t border-[#2C2520] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2C2520]">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#1E1B18] border border-[#8C653E]/50 text-[#FAF8F5] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#C5A880]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#FAF8F5] tracking-wider uppercase">
                  {dict.brand.name}
                </span>
                <span className="text-[9px] uppercase tracking-[0.18em] text-[#8C653E] font-medium">
                  {locale === 'te' ? 'లగ్జరీ రియల్ ఎస్టేట్ మీడియేషన్' : 'Luxury Real Estate Advisory & Brokerage'}
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-[#A89F95] leading-relaxed max-w-md">
              {isTe
                ? 'తెలంగాణలో చట్టబద్ధమైన మరియు అత్యున్నత ప్రమాణాలతో కూడిన ల్యాండ్ & ఫ్లాట్ల బ్రోకరేజ్ వేదిక. ప్రతి ఆస్తి 13 పాయింట్ల రెవెన్యూ తనిఖీ పూర్తయిన తర్వాతే ప్రత్యక్ష బ్రోకరేజ్ సేవలు అందించబడతాయి.'
                : 'Telangana’s distinguished luxury real estate brokerage and deal mediation firm. Every land parcel and architectural residence undergoes rigorous 13-point revenue and title verification before direct buyer engagement.'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1B18] text-[#C5A880] border border-[#8C653E]/40 text-xs font-semibold tracking-wide">
                <CheckCircle className="w-3.5 h-3.5 text-[#C5A880]" />
                {isTe ? '100% పారదర్శక మధ్యవర్తిత్వం' : 'Licensed Deal Mediation Protocol'}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FAF8F5]">
              {isTe ? 'ప్రాపర్టీలు' : 'Portfolio'}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href={`/${locale}/properties`}
                  className="text-[#A89F95] hover:text-[#FAF8F5] transition-colors"
                >
                  {dict.nav.properties}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/properties?type=LAND`}
                  className="text-[#A89F95] hover:text-[#FAF8F5] transition-colors"
                >
                  {dict.nav.lands}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/properties?type=FLAT`}
                  className="text-[#A89F95] hover:text-[#FAF8F5] transition-colors"
                >
                  {dict.nav.flats}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/properties?tier=TIER_2`}
                  className="text-[#A89F95] hover:text-[#FAF8F5] transition-colors"
                >
                  {isTe ? 'ORR గ్రోత్ కారిడార్' : 'ORR Growth Corridors'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/list-property`}
                  className="text-[#C5A880] hover:text-[#FAF8F5] font-medium transition-colors"
                >
                  {dict.nav.listProperty}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FAF8F5]">
              {isTe ? 'చట్టపరమైన రక్షణ' : 'Legal & Standards'}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="text-[#A89F95] hover:text-[#FAF8F5] transition-colors"
                >
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-[#A89F95] hover:text-[#FAF8F5] transition-colors"
                >
                  {isTe ? 'నిబంధనలు & షరతులు' : 'Terms of Mediation'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-[#A89F95] hover:text-[#FAF8F5] transition-colors"
                >
                  {isTe ? 'గోప్యతా విధానం' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/login`}
                  className="text-[#8C827A] hover:text-[#FAF8F5] transition-colors"
                >
                  {dict.nav.teamLogin}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FAF8F5]">
              {isTe ? 'కార్యాలయం & సంప్రదింపులు' : 'Advisory Office'}
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-[#A89F95]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#8C653E] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Financial District, Nanakramguda, Gachibowli, Hyderabad, Telangana 500032
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#8C653E] shrink-0" />
                <span className="font-mono text-[#FAF8F5]">+91 94400 12345</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#8C653E] shrink-0" />
                <span>advisory@telanganarealty.in</span>
              </div>
            </div>
            <div className="pt-2">
              <LanguageToggle currentLocale={locale} className="bg-[#1E1B18] border-[#2C2520] text-xs text-[#FAF8F5]" />
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8C827A]">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} {dict.brand.name}. {isTe ? 'అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.' : 'All rights reserved.'}{' '}
            {isTe
              ? 'తెలంగాణ రెవెన్యూ మరియు రిజిస్ట్రేషన్ శాఖ నిబంధనల ప్రకారం ధృవీకరించబడిన వేదిక.'
              : 'Mediated under Telangana Revenue & Registration Legal Compliance.'}
          </p>
          <div className="flex items-center gap-4 text-[#A89F95]">
            <span className="inline-flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>RERA / HMDA Vetted</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Dharani Portal Compliant</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
