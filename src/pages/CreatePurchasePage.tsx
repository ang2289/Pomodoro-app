import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface Product {
  id: string
  name: string
  price: number
}

const CreatePurchasePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [title, setTitle] = useState('')
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: '', price: 0 }
  ])
  const [deadline, setDeadline] = useState<Date | null>(new Date())
  const [notes, setNotes] = useState('')
  const [syncToGoogle, setSyncToGoogle] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 新增商品
  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      price: 0
    }
    setProducts([...products, newProduct])
  }

  // 刪除商品
  const removeProduct = (productId: string) => {
    if (products.length > 1) {
      setProducts(products.filter(product => product.id !== productId))
    }
  }

  // 更新商品資訊
  const updateProduct = (productId: string, field: 'name' | 'price', value: string | number) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, [field]: field === 'price' ? Number(value) : value }
        : product
    ))
  }

  // 表單驗證
  const validateForm = () => {
    if (!title.trim()) {
      alert('請輸入團購標題')
      return false
    }
    
    if (products.some(product => !product.name.trim())) {
      alert('請填寫所有商品名稱')
      return false
    }
    
    if (products.some(product => product.price <= 0)) {
      alert('請輸入有效的商品價格')
      return false
    }
    
    if (!deadline) {
      alert('請選擇截止時間')
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
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 生成模擬的團購 ID
      const purchaseId = 'purchase-' + Date.now()
      
      // 跳轉到團購詳情頁面
      navigate(`/group/${id}/purchase/${purchaseId}`)
    } catch (error) {
      console.error('建立團購失敗:', error)
      alert('建立團購失敗，請重試')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1>🛒 建立團購</h1>
      
      <div className="bg-white text-gray-800 p-4 rounded-lg shadow-md w-full max-w-2xl mx-auto mt-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 團購標題 */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-3">
              團購標題 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="請輸入團購標題..."
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>

          {/* 商品列表 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-gray-700 text-lg font-semibold">
                商品清單 *
              </label>
              <button
                type="button"
                onClick={addProduct}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-semibold"
              >
                ➕ 新增商品
              </button>
            </div>
            
            <div className="space-y-3">
              {products.map((product, index) => (
                <div key={product.id} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                      placeholder="商品名稱"
                      className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-indigo-200"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                      placeholder="單價"
                      min="0"
                      step="0.01"
                      className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-indigo-200"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    disabled={products.length === 1}
                    className={`px-3 py-2 rounded text-sm font-semibold transition-colors duration-200 ${
                      products.length === 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 截止時間 */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-3">
              截止時間 *
            </label>
            <DatePicker
              selected={deadline}
              onChange={(date) => setDeadline(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy/MM/dd HH:mm"
              placeholderText="選擇截止時間"
              className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-3">
              備註
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="請輸入備註資訊..."
              rows={4}
              className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-200 resize-none"
            />
          </div>

          {/* Google 日曆同步 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="syncToGoogle"
              checked={syncToGoogle}
              onChange={(e) => setSyncToGoogle(e.target.checked)}
              className="w-4 h-4 accent-blue-500 dark:accent-green-400"
            />
            <label htmlFor="syncToGoogle" className="ml-2 text-gray-700 font-medium">
              📅 同步到 Google 日曆
            </label>
          </div>

          {/* 提交按鈕 */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/group/${id}`)}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-semibold"
            >
              ← 取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 rounded font-semibold transition-colors duration-200 ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              {isSubmitting ? '建立中...' : '建立團購'}
            </button>
          </div>
        </form>

        {/* 提示資訊 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <div className="font-semibold mb-2">💡 提示：</div>
          <div>• 團購建立後，群組成員可以查看並參與團購</div>
          <div>• 截止時間到達後，團購將自動結束</div>
          <div>• 可以隨時修改團購資訊（在截止前）</div>
        </div>
      </div>
    </div>
  )
}

export default CreatePurchasePage
