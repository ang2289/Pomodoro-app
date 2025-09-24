import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

interface Product {
  id: string
  name: string
  price: number
}

interface PurchaseData {
  id: string
  title: string
  products: Product[]
  deadline: string
  notes: string
}

interface OrderItem {
  productId: string
  quantity: number
}

const PurchaseFillPage = () => {
  const { id, purchaseId } = useParams<{ id: string; purchaseId: string }>()
  const navigate = useNavigate()
  
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)
  const [userName, setUserName] = useState('')
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({})
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // 載入團購資料
  useEffect(() => {
    const loadPurchaseData = async () => {
      try {
        // 模擬 API 調用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模擬資料（與 PurchaseDetailPage 相同的資料結構）
        const mockData: PurchaseData = {
          id: purchaseId || 'purchase-1',
          title: '辦公室下午茶團購',
          products: [
            { id: '1', name: '珍珠奶茶', price: 45 },
            { id: '2', name: '拿鐵咖啡', price: 55 },
            { id: '3', name: '起司蛋糕', price: 80 },
            { id: '4', name: '巧克力餅乾', price: 35 }
          ],
          deadline: '2024-01-12 18:00:00',
          notes: '請在截止時間前完成填單，逾期不候。'
        }
        
        setPurchaseData(mockData)
        
        // 初始化數量為 0
        const initialQuantities: { [productId: string]: number } = {}
        mockData.products.forEach(product => {
          initialQuantities[product.id] = 0
        })
        setQuantities(initialQuantities)
      } catch (error) {
        console.error('載入團購資料失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPurchaseData()
  }, [purchaseId])

  // 更新商品數量
  const updateQuantity = (productId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity) // 確保數量不為負數
    }))
  }

  // 計算總金額
  const calculateTotal = () => {
    if (!purchaseData) return 0
    
    return purchaseData.products.reduce((total, product) => {
      const quantity = quantities[product.id] || 0
      return total + (product.price * quantity)
    }, 0)
  }

  // 檢查是否有選擇商品
  const hasSelectedItems = () => {
    return Object.values(quantities).some(quantity => quantity > 0)
  }

  // 表單驗證
  const validateForm = () => {
    if (!userName.trim()) {
      alert('請輸入您的姓名')
      return false
    }
    
    if (!hasSelectedItems()) {
      alert('請至少選擇一項商品')
      return false
    }
    
    return true
  }

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // 準備訂單資料
      const orderItems: OrderItem[] = Object.entries(quantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([productId, quantity]) => ({
          productId,
          quantity
        }))

      const orderData = {
        userName: userName.trim(),
        items: orderItems,
        notes: notes.trim(),
        createdAt: new Date().toISOString()
      }

      // 模擬 API 調用 - 儲存到 localStorage（實際應用中應該調用後端 API）
      const existingOrders = JSON.parse(localStorage.getItem(`purchase_${purchaseId}_orders`) || '[]')
      const newOrder = {
        id: `order-${Date.now()}`,
        ...orderData
      }
      existingOrders.push(newOrder)
      localStorage.setItem(`purchase_${purchaseId}_orders`, JSON.stringify(existingOrders))

      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('填單成功！')
      
      // 跳轉回團購詳情頁面
      navigate(`/group/${id}/purchase/${purchaseId}`)
    } catch (error) {
      console.error('提交訂單失敗:', error)
      alert('提交訂單失敗，請重試')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="page">
        <div className="bg-white text-gray-800 p-6 rounded-xl shadow-md w-full max-w-2xl mx-auto mt-10">
          <div className="text-center">
            <div className="text-lg text-gray-600">載入中...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!purchaseData) {
    return (
      <div className="page">
        <div className="bg-white text-gray-800 p-6 rounded-xl shadow-md w-full max-w-2xl mx-auto mt-10">
          <div className="text-center">
            <div className="text-lg text-red-600">找不到團購資料</div>
            <Link 
              to={`/group/${id}`}
              className="mt-4 inline-block bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              ← 返回群組首頁
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>📝 填寫團購訂單</h1>
      
      <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto mt-10">
        {/* 團購資訊 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold text-indigo-600 mb-4">{purchaseData.title}</h2>
          <div className="text-sm text-blue-700">
            <div>截止時間：{formatDate(purchaseData.deadline)}</div>
            {purchaseData.notes && (
              <div className="mt-1">備註：{purchaseData.notes}</div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 使用者名稱 */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-3">
              您的姓名 *
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="請輸入您的姓名..."
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>

          {/* 商品選擇 */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-3">
              選擇商品 *
            </label>
            <div className="space-y-3">
              {purchaseData.products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{product.name}</div>
                    <div className="text-sm text-gray-600">NT$ {product.price}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, (quantities[product.id] || 0) - 1)}
                      disabled={!quantities[product.id] || quantities[product.id] <= 0}
                      className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantities[product.id] || 0}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-16 p-2 text-center border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, (quantities[product.id] || 0) + 1)}
                      className="w-8 h-8 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm text-gray-600">小計</div>
                    <div className="font-semibold text-gray-800">
                      NT$ {((quantities[product.id] || 0) * product.price).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-3">
              備註
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="如有特殊需求請在此說明..."
              rows={3}
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-indigo-200 resize-none"
            />
          </div>

          {/* 總金額顯示 */}
          {hasSelectedItems() && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-center">
                <div className="text-sm text-green-700 mb-1">訂單總金額</div>
                <div className="text-2xl font-bold text-green-800">
                  NT$ {calculateTotal().toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* 提交按鈕 */}
          <div className="flex gap-4 pt-4">
            <Link 
              to={`/group/${id}/purchase/${purchaseId}`}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold text-center"
            >
              ← 取消
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !hasSelectedItems()}
              className={`flex-1 px-4 py-2 rounded font-semibold transition-colors duration-200 ${
                isSubmitting || !hasSelectedItems()
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              {isSubmitting ? '提交中...' : '提交訂單'}
            </button>
          </div>
        </form>

        {/* 提示資訊 */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-700">
          <div className="font-semibold mb-2">💡 注意事項：</div>
          <div>• 請確認商品數量無誤後再提交</div>
          <div>• 提交後無法修改，請謹慎填寫</div>
          <div>• 如有問題請聯繫團購發起人</div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseFillPage
