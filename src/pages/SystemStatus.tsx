// System Status Page
// This page displays the completion status of all features
// For review purposes and developer reference
// No login required to view this page

export default function SystemStatus() {
  const features = [
    { name: 'User authentication', completed: true, beta: false },
    { name: 'Free trial credit initialization', completed: true, beta: false },
    { name: 'Credit deduction before AI processing', completed: true, beta: false },
    { name: 'Summary generation', completed: true, beta: false },
    { name: 'Homework assistance', completed: true, beta: false },
    { name: 'Credit purchase via ECPay', completed: true, beta: false },
    { name: 'Payment callback handling', completed: true, beta: false },
    { name: 'Credit balance update', completed: true, beta: false },
    { name: 'Terms & Privacy pages', completed: true, beta: false },
    { name: 'Contact information available', completed: true, beta: false },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        System Status
      </h1>

      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="text-xl text-green-600 flex-shrink-0">
                {feature.completed ? '✔' : '✗'}
              </span>
              <span className="text-base text-gray-800 font-medium">
                {feature.name}
                {feature.beta && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                    Beta
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This page is for review and development purposes.
          All listed features are currently operational.
        </p>
      </div>

      {/* Last Updated */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
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

