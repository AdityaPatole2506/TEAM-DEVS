import React from 'react';
import { HelpCircle, Mail, Phone, BookOpen, ExternalLink } from 'lucide-react';

export default function Help() {
  const faqs = [
    { q: 'How do I use the AI Gap Analyzer?', a: 'Go to AI Gap Analyzer from the sidebar. Select your target role, verify your current skills, and click "Analyze Skill Gap" to get your personalized analysis.' },
    { q: 'Is my data safe?', a: 'This is a demo/academic portal. Do not enter real sensitive information such as actual Aadhaar numbers, bank details, or government passwords.' },
    { q: 'How do I enroll in a course?', a: 'Browse available courses in the "Course Enrollment" section and click "Enroll Now" on any course you are interested in.' },
    { q: 'What does the verification status mean?', a: 'Verification statuses (Verified/Pending/Rejected) are simulated in this demo environment. In production, they would reflect actual government verification checks.' },
    { q: 'How is my profile completion calculated?', a: 'Profile completion is based on how many key fields you have filled in — personal details, education, address, Aadhaar demo, and biometric simulation.' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="section-title">Help & Support</h1><p className="section-subtitle">Frequently asked questions and support information</p></div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        🎓 <strong>Academic Project / Demo Portal</strong> — This is not an official government website. For educational purposes only.
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><HelpCircle size={18} className="text-blue-600" /> Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4">
              <div className="font-medium text-gray-800 mb-1">{faq.q}</div>
              <div className="text-gray-500 text-sm">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Contact Support (Demo)</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail size={16} className="text-blue-500" />
            <span>demo-support@mhgov-portal.example.com (Demo Email)</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone size={16} className="text-blue-500" />
            <span>1800-XXX-XXXX (Demo Helpline)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
