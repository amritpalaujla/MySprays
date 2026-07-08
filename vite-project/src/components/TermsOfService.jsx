function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 1, 2025</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using MySprays ("the Site"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">2. Informational Use Only</h2>
          <p className="text-gray-600 leading-relaxed">
            All spray schedules, product information, application rates, pre-harvest intervals (PHI), and other agronomic data provided on this Site are for general informational and reference purposes only. This information does not constitute professional agronomic, legal, or regulatory advice. Users are solely responsible for verifying all information against the current approved product label before any application.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">3. User Responsibility</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            You, the user, assume full and sole responsibility for:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>All pesticide and spray applications made using information from this Site</li>
            <li>Compliance with all applicable federal, provincial, state, and local pesticide regulations</li>
            <li>Holding any required pesticide applicator licenses or certifications</li>
            <li>Reading and following the full product label for any pesticide used</li>
            <li>Ensuring applications do not harm people, animals, crops, water, or the environment</li>
            <li>The accuracy and completeness of any spray records you create or maintain on this Site</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">4. Disclaimer of Warranties</h2>
          <p className="text-gray-600 leading-relaxed">
            This Site and all content are provided "as is" and "as available" without any warranties of any kind, express or implied, including but not limited to accuracy, completeness, fitness for a particular purpose, or non-infringement. The author does not warrant that the information is current, error-free, or suitable for any specific use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">5. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            To the fullest extent permitted by law, the author and operator of MySprays shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of or reliance on this Site, including but not limited to crop loss or damage, regulatory fines or penalties, personal injury, property damage, or loss of profit. Your use of this Site is entirely at your own risk.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">6. Data Accuracy</h2>
          <p className="text-gray-600 leading-relaxed">
            Spray product registrations, approved rates, and regulations change frequently. The author makes no guarantee that any information on this Site reflects the most current approved label or regulatory status. Always consult the current registered label and your local regulatory authority before applying any pesticide.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">7. Account Use</h2>
          <p className="text-gray-600 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. The author is not responsible for any loss or damage arising from unauthorized access to your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">8. Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            These Terms may be updated at any time without notice. Continued use of the Site after any changes constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">9. Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of British Columbia, Canada, without regard to its conflict of law provisions.
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;
