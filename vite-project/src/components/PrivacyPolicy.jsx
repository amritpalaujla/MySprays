function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 1, 2025</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed mb-3">When you create an account and use MySprays, we collect:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Your email address (for account creation and login)</li>
            <li>Spray log records you choose to create (product name, date, location, rate, etc.)</li>
            <li>Your region preference (CA or US)</li>
            <li>Account settings you configure</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed mb-3">Your information is used solely to:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
            <li>Operate your account and provide access to the Site</li>
            <li>Store and display your spray records</li>
            <li>Send account-related emails (verification, password reset)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">3. Data Sharing</h2>
          <p className="text-gray-600 leading-relaxed">
            We do not sell, rent, or share your personal information with any third parties for marketing or commercial purposes. Your data is not shared with anyone outside of the services required to operate this Site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">4. Data Storage</h2>
          <p className="text-gray-600 leading-relaxed">
            Your data is stored on secure cloud infrastructure. While we take reasonable measures to protect your data, no system is completely secure. You use this Site at your own risk and the author is not liable for any unauthorized access to or loss of your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">5. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            This Site uses HTTP-only cookies solely to maintain your login session. These cookies are not used for tracking or advertising purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">6. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed">
            You may delete your account and all associated data at any time through the Settings page. Upon deletion, your email address and all spray records are permanently removed from our systems.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">7. Spray Record Responsibility</h2>
          <p className="text-gray-600 leading-relaxed">
            You are solely responsible for the accuracy, completeness, and regulatory compliance of any spray records you create on this Site. The author is not responsible for incomplete, inaccurate, or missing records, and makes no guarantee that records stored on this Site satisfy any regulatory record-keeping requirements in your jurisdiction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">8. Children's Privacy</h2>
          <p className="text-gray-600 leading-relaxed">
            This Site is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from minors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">9. Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">
            This Privacy Policy may be updated at any time. Continued use of the Site after changes are posted constitutes your acceptance of the revised policy.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
