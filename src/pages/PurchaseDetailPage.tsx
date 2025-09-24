import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

interface Product {
  id: string
  name: string
  price: number
}

interface OrderItem {
  productId: string
  quantity: number
}

interface Order {
  id: string
  userName: string
  items: OrderItem[]
  createdAt: string
}

interface PurchaseData {
  id: string
  title: string
  products: Product[]
  orders: Order[]
  deadline: string
  notes: string
  createdAt: string
}

const PurchaseDetailPage = () => {
  const { id, purchaseId } = useParams<{ id: string; purchaseId: string }>()
  const navigate = useNavigate()
  
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)
  const [loading, setLoading] = useState(true)

  // 模擬資料載入
  useEffect(() => {
    const loadPurchaseData = async () => {
      try {
        // 模擬 API 調用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模擬資料
        const mockData: PurchaseData = {
          id: purchaseId || 'purchase-1',
          title: '辦公室下午茶團購',
          products: [
            { id: '1', name: '珍珠奶茶', price: 45 },
            { id: '2', name: '拿鐵咖啡', price: 55 },
            { id: '3', name: '起司蛋糕', price: 80 },
            { id: '4', name: '巧克力餅乾', price: 35 }
          ],
          orders: [
            {
              id: 'order-1',
              userName: '張小明',
              items: [
                { productId: '1', quantity: 2 },
                { productId: '2', quantity: 1 },
                { productId: '3', quantity: 1 }
              ],
              createdAt: '2024-01-10 14:30:00'
            },
            {
              id: 'order-2',
              userName: '李小華',
              items: [
                { productId: '1', quantity: 1 },
                { productId: '4', quantity: 3 }
              ],
              createdAt: '2024-01-10 15:15:00'
            },
            {
              id: 'order-3',
              userName: '王大強',
              items: [
                { productId: '2', quantity: 2 },
                { productId: '3', quantity: 1 },
                { productId: '4', quantity: 2 }
              ],
              createdAt: '2024-01-10 16:00:00'
            }
          ],
          deadline: '2024-01-12 18:00:00',
          notes: '請在截止時間前完成填單，逾期不候。',
          createdAt: '2024-01-10 14:00:00'
        }
        
        setPurchaseData(mockData)
      } catch (error) {
        console.error('載入團購資料失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPurchaseData()
  }, [purchaseId])

  // 計算每項商品的總訂購數量
  const getProductTotalQuantity = (productId: string) => {
    if (!purchaseData) return 0
    
    return purchaseData.orders.reduce((total, order) => {
      const item = order.items.find(item => item.productId === productId)
      return total + (item ? item.quantity : 0)
    }, 0)
  }

  // 計算總金額
  const getTotalAmount = () => {
    if (!purchaseData) return 0
    
    return purchaseData.orders.reduce((total, order) => {
      return total + order.items.reduce((orderTotal, item) => {
        const product = purchaseData.products.find(p => p.id === item.productId)
        return orderTotal + (product ? product.price * item.quantity : 0)
      }, 0)
    }, 0)
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
        <div className="bg-white text-gray-800 p-4 rounded-lg shadow-md w-full max-w-4xl mx-auto mt-10">
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
        <div className="bg-white text-gray-800 p-4 rounded-lg shadow-md w-full max-w-4xl mx-auto mt-10">
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
      <h1>🛒 團購詳情</h1>
      
      <div className="bg-white text-gray-800 p-4 rounded-lg shadow-md w-full max-w-4xl mx-auto mt-10">
        {/* 團購標題和基本資訊 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{purchaseData.title}</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <div>建立時間：{formatDate(purchaseData.createdAt)}</div>
            <div>截止時間：{formatDate(purchaseData.deadline)}</div>
            {purchaseData.notes && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="font-semibold text-yellow-800">📝 備註：</div>
                <div className="text-yellow-700">{purchaseData.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* 商品清單 */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📦 商品清單</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">商品名稱</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">單價</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">總訂購量</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">小計</th>
                </tr>
              </thead>
              <tbody>
                {purchaseData.products.map((product) => {
                  const totalQuantity = getProductTotalQuantity(product.id)
                  const subtotal = product.price * totalQuantity
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">{product.name}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">NT$ {product.price}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">
                        <span className={`px-2 py-1 rounded text-sm ${
                          totalQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {totalQuantity}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        NT$ {subtotal.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right">總計：</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-lg">
                    NT$ {getTotalAmount().toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 填單者清單 */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            👥 填單者清單 ({purchaseData.orders.length} 人)
          </h3>
          
          {purchaseData.orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-lg">尚無填單者</div>
              <div className="text-sm">快來成為第一個填單的人吧！</div>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseData.orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-semibold text-gray-800">{order.userName}</div>
                    <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {order.items.map((item) => {
                      const product = purchaseData.products.find(p => p.id === item.productId)
                      if (!product) return null
                      
                      return (
                        <div key={item.productId} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            數量：{item.quantity} × NT$ {product.price}
                          </div>
                          <div className="text-sm font-semibold text-gray-800">
                            小計：NT$ {(product.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-right font-semibold text-gray-800">
                      總計：NT$ {order.items.reduce((total, item) => {
                        const product = purchaseData.products.find(p => p.id === item.productId)
                        return total + (product ? product.price * item.quantity : 0)
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 操作按鈕 */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <Link 
            to={`/group/${id}`}
            className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold text-center"
          >
            ← 返回群組首頁
          </Link>
          <button
            onClick={() => navigate(`/group/${id}/purchase/${purchaseId}/fill`)}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 font-semibold"
          >
            📝 我要填單
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseDetailPage
