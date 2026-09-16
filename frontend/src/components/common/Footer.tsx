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
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {dict.brand.name}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {isTe
                ? 'తెలంగాణలో చట్టబద్ధమైన మరియు విశ్వసనీయమైన ల్యాండ్ & ఫ్లాట్ల బ్రోకరేజ్ వేదిక. ప్రతి ఆస్తి 13 పాయింట్ల రెవెన్యూ తనిఖీ పూర్తయిన తర్వాతే ప్రత్యక్ష బ్రోకరేజ్ సేవలు అందించబడతాయి.'
                : 'Telangana’s trusted real estate brokerage and deal mediation platform. Every land parcel and apartment undergoes rigorous 13-point revenue and title verification before direct buyer engagement.'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                {isTe ? '100% పారదర్శక మధ్యవర్తిత్వం' : 'Licensed Deal Mediation'}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {isTe ? 'ప్రాపర్టీలు' : 'Properties'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/properties`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {dict.nav.properties}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/properties?type=LAND`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {dict.nav.lands}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/properties?type=FLAT`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {dict.nav.flats}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/properties?tier=TIER_2`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {isTe ? 'ORR గ్రోత్ కారిడార్' : 'ORR Growth Corridors'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/list-property`}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  {dict.nav.listProperty}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {isTe ? 'చట్టపరమైన రక్షణ' : 'Legal & Trust'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {isTe ? 'నిబంధనలు & షరతులు' : 'Terms of Mediation'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {isTe ? 'గోప్యతా విధానం' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/login`}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {dict.nav.teamLogin}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {isTe ? 'కార్యాలయం & సంప్రదింపులు' : 'Brokerage Office'}
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <span>
                  Financial District, Nanakramguda, Gachibowli, Hyderabad, Telangana 500032
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-slate-300">+91 94400 12345</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>advisory@telanganarealty.in</span>
              </div>
            </div>
            <div className="pt-2">
              <LanguageToggle currentLocale={locale} className="bg-slate-800 border-slate-700 text-xs" />
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} {dict.brand.name}. {isTe ? 'అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.' : 'All rights reserved.'}{' '}
            {isTe
              ? 'తెలంగాణ రెవెన్యూ మరియు రిజిస్ట్రేషన్ శాఖ నిబంధనల ప్రకారం ధృవీకరించబడిన వేదిక.'
              : 'Mediated under Telangana Revenue & Registration Legal Compliance.'}
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>RERA / HMDA Vetted</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dharani Portal Compliant</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
