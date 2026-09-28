import React from 'react';
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-900 text-ivory-200 border-t border-charcoal-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-700 text-ivory-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-lg text-white">
                Campus<span className="text-forest-400">OD</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              Institutional On-Duty (OD) Management Portal. Standardizing verification, attendance integrity, and faculty review protocols for higher education.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-charcoal-800/80 rounded-md border border-charcoal-700 text-[11px] text-forest-300">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-400" />
              <span>PostgreSQL Institutional Engine</span>
            </div>
          </div>

          {/* Col 2: Quick Portals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-300 mb-3 font-mono">
              Access Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login/student" className="text-charcoal-400 hover:text-white transition-colors">
                  Student Verification & Login
                </Link>
              </li>
              <li>
                <Link to="/login/faculty" className="text-charcoal-400 hover:text-white transition-colors">
                  Department Faculty Review Portal
                </Link>
              </li>
              <li>
                <Link to="/login/faculty" className="text-charcoal-400 hover:text-white transition-colors">
                  Office of Dean / Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="text-charcoal-400 hover:text-white transition-colors">
                  Notification Queue & Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Guidelines */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-300 mb-3 font-mono">
              OD Regulations
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-400">
              <li>• OD requests must be submitted at least 24 hours in advance.</li>
              <li>• Pre-work and Post-work duties require faculty coordinator endorsement.</li>
              <li>• Supporting brochures or invitation letters must be attached.</li>
              <li>• Only final Administrative approval certifies attendance credit.</li>
            </ul>
          </div>

          {/* Col 4: Institutional Helpdesk */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-300 mb-3 font-mono">
              Academic Support
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-forest-400 shrink-0" />
                <span>Office of Academic Affairs, Central Admin Wing</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-forest-400 shrink-0" />
                <span>attendance-office@campus.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-forest-400 shrink-0" />
                <span>+1 (555) 019-2800 (Ext. 402)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-charcoal-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-charcoal-500">
          <p>© 2026 CampusOD Institutional Portal. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono">Institutional Release v1.0.4 • Academic Year 2026-2027</p>
        </div>
      </div>
    </footer>
  );
};
