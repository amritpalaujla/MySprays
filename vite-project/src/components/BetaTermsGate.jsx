const background = [
  {
    label: "A.",
    text: "The Developer is working with growers in connection with the development, testing, improvement, or operation of the MySprays platform and related tools or services (the “Purpose”).",
  },
  {
    label: "B.",
    text: "In connection with the Purpose, the Grower may provide the Developer with information that is private, commercially sensitive, or otherwise confidential.",
  },
];

const sections = [
  {
    title: "Confidential Information",
    text: "“Confidential Information” means non-public information disclosed by or on behalf of the Grower, whether verbally, electronically, in writing, or through access to farm records or systems, including farm and grower contact information; orchard, block, crop, variety, acreage, production and harvest information; spray records, pesticide-use information, application timing and rates; pest and disease observations; crop-management practices; farm maps or locations; business, financial, purchasing or operational information; and any other information that a reasonable person would understand to be confidential.",
  },
  {
    title: "Permitted Use",
    text: "The Developer will use Confidential Information only for the Purpose and will not use it for any unrelated commercial, competitive, marketing, or personal purpose without the Grower’s prior written consent.",
  },
  {
    title: "Confidentiality and Safeguards",
    text: "The Developer will keep Confidential Information confidential, use reasonable safeguards to protect it from unauthorized access, use, copying or disclosure, and limit access to persons who reasonably require the information for the Purpose and who are subject to confidentiality obligations.",
  },
  {
    title: "No Disclosure to Third Parties",
    text: "The Developer will not disclose identifiable Confidential Information to any third party without the Grower’s prior written consent, except where disclosure is required by law. Where legally permitted, the Developer will provide the Grower with reasonable notice of a required disclosure.",
  },
  {
    title: "Aggregated or De-identified Information",
    text: "Information may be used in aggregated or de-identified form for the Purpose only where it cannot reasonably be used to identify the Grower, the farm, or an individual farm operation.",
  },
  {
    title: "Exclusions",
    text: "Confidential Information does not include information that the Developer can demonstrate: (a) was lawfully known without a duty of confidentiality before disclosure; (b) becomes publicly available through no breach of this Agreement; (c) is lawfully received from a third party without a duty of confidentiality; or (d) is independently developed without use of the Grower’s Confidential Information.",
  },
  {
    title: "Ownership",
    text: "The Grower retains ownership of the Grower’s Confidential Information. Nothing in this Agreement transfers ownership of the Grower’s farm records, data, or other Confidential Information to the Developer.",
  },
  {
    title: "Return or Destruction",
    text: "At the Grower’s request, or when the Confidential Information is no longer reasonably required for the Purpose, the Developer will return or securely destroy identifiable copies of the Confidential Information, except for records that must be retained by law or routine secure backups that cannot reasonably be isolated, which will remain subject to this Agreement.",
  },
  {
    title: "Security Incident",
    text: "The Developer will promptly notify the Grower if the Developer becomes aware of unauthorized access to, loss of, or disclosure of the Grower’s Confidential Information and will take reasonable steps to contain and address the incident.",
  },
  {
    title: "Term",
    text: "This Agreement takes effect on the date it is signed. The confidentiality obligations continue for five (5) years after the last disclosure of Confidential Information, except that obligations relating to personal information or information that remains a trade secret or otherwise confidential continue for as long as required by applicable law or while the information remains confidential.",
  },
  {
    title: "No Obligation to Provide Information",
    text: "Nothing in this Agreement requires the Grower to provide any particular information or to participate in the MySprays platform. The Grower may decline to provide information at any time.",
  },
  {
    title: "Governing Law",
    text: "This Agreement is governed by the laws of the Province of British Columbia and the applicable laws of Canada.",
  },
  {
    title: "Entire Agreement",
    text: "This Agreement sets out the Parties’ understanding regarding the confidentiality of information disclosed for the Purpose and may be amended only in writing and agreed to by both Parties.",
  },
  {
    title: "Beta Data and Purpose",
    text: "All data entered by users during the beta version will be deleted when the site is officially launched. The purpose of the beta version is to get feedback and fix any outstanding bugs.",
  },
];

// Full-page agreement shown before the site can be used during the beta
function BetaTermsGate({ onAccept }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden text-left">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-6 sm:px-8 text-white">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full px-3 py-1 mb-3">
            MySprays Beta
          </span>
          {/* Inline size: the global h1 rule in index.css would otherwise win */}
          <h1 className="font-bold" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
            Confidentiality Agreement
          </h1>
          <p className="text-blue-100 text-sm mt-2">
            Please read and accept the agreement below to continue to MySprays.
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8 max-h-[60vh] overflow-y-auto text-gray-600 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Background
          </h2>
          <ul className="space-y-2 mb-6">
            {background.map((item) => (
              <li key={item.label} className="flex gap-2">
                <span className="font-semibold text-gray-700">{item.label}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          <p className="mb-6">The Parties therefore agree as follows:</p>

          {sections.map((section, index) => (
            <section key={section.title} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                {index + 1}. {section.title}
              </h2>
              <p>{section.text}</p>
            </section>
          ))}
        </div>

        <div className="px-6 py-5 sm:px-8 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-sm text-gray-500 flex-1">
            By clicking “I Accept”, you agree to this Confidentiality Agreement.
          </p>
          <button
            onClick={onAccept}
            style={{ padding: "0.75rem 2rem" }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default BetaTermsGate;
