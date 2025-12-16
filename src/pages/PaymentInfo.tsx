// Payment Information & Service Description Page
// For ECPay (Green World) payment gateway review

export default function PaymentInfo() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Payment Information & Service Description
      </h1>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        {/* Service Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Service Overview
          </h2>
          <p className="text-base">
            This website provides AI-powered text processing services, including text summarization and homework explanation assistance.
          </p>
          <p className="text-base mt-2">
            Users paste their own text content into the system, and the AI generates summaries or explanations based on the input. This is a digital-only service. No physical goods are sold or shipped.
          </p>
        </section>

        {/* Usage-Based Credit System */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Usage-Based Credit System
          </h2>
          <p className="text-base">
            The service uses a prepaid character-based credit system.
          </p>
          <p className="text-base mt-2">
            Credits are deducted based on the actual number of characters submitted by the user. Credits are not time-based, do not expire, and are consumed until depleted. There is no automatic renewal or subscription.
          </p>
        </section>

        {/* Free Trial */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Free Trial
          </h2>
          <p className="text-base">
            New users are provided with a free trial that includes 10,000 characters. No payment or credit card is required for the free trial.
          </p>
          <p className="text-base mt-2">
            Free usage is limited. Once free credits are exhausted, users must purchase additional credits to continue using the service.
          </p>
        </section>

        {/* Paid Credit Packages */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Paid Credit Packages
          </h2>
          <p className="text-base">
            Users may optionally purchase additional character credits through ECPay.
          </p>
          <p className="text-base mt-2">
            Example packages include:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>NT$99 for 100,000 characters</li>
            <li>NT$199 for 300,000 characters</li>
          </ul>
          <p className="text-base mt-2">
            All payments are one-time purchases. There are no subscriptions, no recurring charges, and no automatic billing.
          </p>
        </section>

        {/* Payment Process */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Payment Process
          </h2>
          <p className="text-base">
            Payments are processed securely by ECPay. After successful payment confirmation, credits are added immediately to the user account.
          </p>
          <p className="text-base mt-2">
            The website does not store any credit card or payment information.
          </p>
        </section>

        {/* Refund Policy */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Refund Policy
          </h2>
          <p className="text-base">
            This is a digital, on-demand service. Credits are consumed immediately after use.
          </p>
          <p className="text-base mt-2">
            Refunds are not provided for consumed credits. If a technical error occurs, users may contact customer support for assistance.
          </p>
        </section>

        {/* User Responsibility */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            User Responsibility
          </h2>
          <p className="text-base">
            Users are responsible for the content they submit. The AI-generated results are provided for reference purposes only and do not guarantee academic or professional outcomes.
          </p>
        </section>

        {/* Customer Support */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Customer Support
          </h2>
          <p className="text-base">
            For technical or payment-related inquiries, users may contact customer support via email or in-app contact form.
          </p>
        </section>
      </div>

      {/* Last Updated */}
      <div className="mt-12 pt-8 border-t border-gray-300">
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  )
}



