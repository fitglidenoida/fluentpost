export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Deletion Request</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Right to Data Deletion</h2>
              <p className="text-gray-700 mb-4">
                At FluentPost, we respect your privacy and your right to control your personal data. You have the right to request deletion of your personal information from our systems.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Data We Delete</h2>
              <p className="text-gray-700 mb-4">When you request data deletion, we will remove:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Your account information and profile data</li>
                <li>All content you've created through our platform</li>
                <li>Social media connection tokens and credentials</li>
                <li>Analytics and usage data associated with your account</li>
                <li>Campaign data and performance metrics</li>
                <li>Any stored AI-generated content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Request Deletion</h2>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Option 1: Through Your Account</h3>
                <ol className="list-decimal pl-6 text-blue-800">
                  <li>Log in to your FluentPost account</li>
                  <li>Go to Settings → Account</li>
                  <li>Click "Delete Account"</li>
                  <li>Confirm your decision</li>
                </ol>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Option 2: Email Request</h3>
                <p className="text-green-800 mb-3">
                  Send an email to <strong>privacy@fluentpost.in</strong> with:
                </p>
                <ul className="list-disc pl-6 text-green-800">
                  <li>Subject: "Data Deletion Request"</li>
                  <li>Your account email address</li>
                  <li>Confirmation that you want to delete your data</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Processing Time</h2>
              <p className="text-gray-700 mb-4">
                We will process your deletion request within 30 days. You will receive a confirmation email once your data has been permanently deleted from our systems.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Notes</h2>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <ul className="list-disc pl-6 text-yellow-800">
                  <li><strong>Permanent:</strong> Data deletion is permanent and cannot be undone</li>
                  <li><strong>Social Media:</strong> We will remove our access to your social media accounts</li>
                  <li><strong>Content:</strong> Any content posted to social media will remain unless you manually delete it</li>
                  <li><strong>Legal Requirements:</strong> Some data may be retained if required by law</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about data deletion or need assistance, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@fluentpost.in<br />
                  <strong>Subject:</strong> Data Deletion Request<br />
                  <strong>Response Time:</strong> Within 48 hours
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Export</h2>
              <p className="text-gray-700 mb-4">
                Before deleting your data, you may also request a copy of all your personal information. This will be provided in a machine-readable format within 30 days.
              </p>
              <p className="text-gray-700">
                To request data export, email <strong>privacy@fluentpost.in</strong> with the subject "Data Export Request".
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
