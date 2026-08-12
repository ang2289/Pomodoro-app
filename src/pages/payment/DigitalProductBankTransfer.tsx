import { Link } from 'react-router-dom'
import PrimaryButton from '@/components/ui/PrimaryButton'
import { getDigitalProduct } from '@/lib/digitalProducts'

interface Props {
  productCode: string
}

const BANK_ACCOUNT = {
  bankName: '中華郵政',
  bankCode: '700',
  branchName: '基隆分行',
  accountName: '陳麗芳',
  accountNumber: '00110810137508',
}

export default function DigitalProductBankTransfer({ productCode }: Props) {
  const product = getDigitalProduct(productCode)

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-700 mb-4">無效的數位商品</p>
          <Link to="/images">
            <PrimaryButton>返回圖片素材</PrimaryButton>
          </Link>
        </div>
      </div>
    )
  }

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch (error) {
      console.error('複製失敗', error)
    }
  }

  const rows = [
    ['銀行名稱', BANK_ACCOUNT.bankName],
    ['銀行代碼', BANK_ACCOUNT.bankCode],
    ['分行', BANK_ACCOUNT.branchName],
    ['戶名', BANK_ACCOUNT.accountName],
    ['匯款帳號', BANK_ACCOUNT.accountNumber],
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-sm font-medium text-emerald-700 mb-2">圖片素材完整下載版</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
          <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
          <div className="flex items-end justify-between gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-gray-500">本次應付金額</p>
              <p className="text-3xl font-bold text-gray-900">NT${product.priceNtd}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>付款確認後開放 ZIP</p>
              <p>{product.downloadDays} 天內最多下載 {product.downloadLimit} 次</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900 text-center leading-7">
            <span className="font-semibold">購買流程：</span>
            ① 匯款 NT${product.priceNtd}　② 填寫後五碼與匯款日期　③ 人工核對入帳　④ 取得專屬 ZIP 下載連結
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">匯款帳戶</h2>
          <p className="text-sm text-gray-500 mb-5">可點選複製；匯款金額請使用本次方案金額。</p>

          <div className="space-y-3">
            {rows.map(([label, value]) => (
              <div key={label} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{label}</p>
                  <p className="font-semibold text-gray-900 break-all">{value}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(value)}
                  className="shrink-0 border border-emerald-300 text-emerald-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50"
                >
                  複製
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="font-bold text-amber-900 mb-3">匯款前請確認</h2>
          <ul className="space-y-2 text-sm text-amber-900 leading-relaxed">
            <li>• 匯款金額：NT${product.priceNtd}</li>
            <li>• 完成匯款後，請填寫匯出帳號後五碼與匯款日期。</li>
            <li>• 以實際銀行入帳為準；核對完成前不會開放下載。</li>
            <li>• 專屬下載連結請勿轉傳；同一訂單最多下載 {product.downloadLimit} 次。</li>
          </ul>
        </div>

        <Link to={`/payment/report?product=${encodeURIComponent(product.code)}`}>
          <PrimaryButton fullWidth>我已完成匯款，送出回報</PrimaryButton>
        </Link>

        <p className="text-center text-xs text-gray-500">
          付款確認後，由管理端產生專屬限時下載連結。
        </p>
      </div>
    </div>
  )
}
