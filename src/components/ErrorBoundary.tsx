import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, errorMessage: error instanceof Error ? error.message : String(error) }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // 可以在此上報錯誤
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary 捕捉到錯誤:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col min-h-screen bg-white overflow-y-auto px-4 pt-4 text-black">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">❌ 頁面載入錯誤</h1>
            <p className="text-gray-600 mb-2">{this.state.errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              重新整理頁面
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}












