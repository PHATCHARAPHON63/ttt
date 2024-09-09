import React, { useState, useRef, useEffect } from 'react'
import './App.css'
import {
  getProductListByPos,
  searchProductByCode,
  getProductListByCode,
} from '../src/components/function/auth'
import { Search, X } from 'lucide-react'

// Dialog Component
const Dialog = ({ isOpen, onClose, title, content }) => {
  const dialogRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div ref={dialogRef} className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <div>{content}</div>
      </div>
    </div>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogContent, setDialogContent] = useState({
    title: '',
    content: '',
  })

  const getPositionClassName = (pos) => {
    if (highlightedPos) {
      return `py-1 px-1 ${highlightedPos === pos ? 'bg-yellow-400' : ''}`
    }
    return 'py-1 px-1'
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [highlightedPos, setHighlightedPos] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getProductListByCode(searchTerm)
      setSearchResult(result)
      if (result && result.pos) {
        setHighlightedPos(result.pos)
        scrollToPosition(result.pos)
      } else {
        setHighlightedPos('')
        setError('ไม่พบสินค้าที่ค้นหา')
      }
    } catch (error) {
      console.error('Error searching for product:', error)
      setError(error.message || 'เกิดข้อผิดพลาดในการค้นหา')
      setSearchResult(null)
      setHighlightedPos('')
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToPosition = (pos) => {
    const element = document.getElementById(pos)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const showSearchResult = () => {
    if (searchResult) {
      const content = (
        <ul className="list-disc list-inside">

          <li>รหัสสินค้า: {searchResult.code}</li>
          <br />
          <li>ชื่อสินค้า: {searchResult.product_list}</li>
          <br />
          <li>จำนวน: {searchResult.quantity}</li>
          <br />
          <li>ตำแหน่ง: {searchResult.pos}</li>
        </ul>
      )
      setDialogContent({ title: 'ผลการค้นหา', content })
      setIsDialogOpen(true)
    }
  }

  const openDialog = async (pos, title) => {
    try {
      const productData = await getProductListByPos(pos)
      console.log('Data received from API:', productData)
      const contentItems = [
        { label: 'รหัสสินค้า', value: productData.code },
        { label: 'ชื่อสินค้า', value: productData.product_list },
        { label: 'จำนวน', value: productData.quantity },
        { label: 'ตำแหน่ง', value: productData.pos },
      ]
      const content = (
        <ul>
          {contentItems.map((item, index) => (
            <li key={index}>
              {item.label}: {item.value || 'ไม่ระบุ'}
            </li>
          ))}
        </ul>
      )
      setDialogContent({ title, content })
      setIsDialogOpen(true)
    } catch (error) {
      console.error('Error fetching product data:', error)
      setDialogContent({
        title: 'เกิดข้อผิดพลาด',
        content: `ไม่สามารถดึงข้อมูลสินค้าได้: ${error.message}`,
      })
      setIsDialogOpen(true)
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-white shadow-md p-4 z-50">
        <div className="max-w-3xl mx-auto flex items-center space-x-4">
          <div className="relative flex-shrink-0">
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-64 px-8 py-2 border rounded focus:ring focus:ring-blue-300"
            />
            <Search
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            ค้นหา
          </button>
          {searchResult && (
            <button
              onClick={showSearchResult}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
            >
              แสดงข้อมูล
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between max-w-3xl mx-auto">
          {isLoading && <span className="text-gray-600">กำลังค้นหา...</span>}
          {error && <span className="text-red-500">{error}</span>}
        </div>
      </div>

      <div className="overflow-auto pt-20">
        <div className="flex items-start space-x-8 min-w-[1200px] justify-between pt-[5rem]">
          <div className="flex-shrink-0  flex-row flex space-x-8">
            <div className="border-4 border-yellow-400 rounded-lg p-4 bg-yellow-100">
              <span className="text-[7rem]  font-bold text-yellow-700">
                ร้านขายยา
              </span>
            </div>
          </div>

          <div className="flex-row flex space-x-8 flex-shrink-0">
            <div className="w-1/2 pt-[15rem] pl-[3rem] w-[320px]">
              <div className="grid grid-cols-10 text-sm">
                <div className="col-span-9 grid grid-cols-2">
                  <div className="py-1 px-2 text-center"></div>
                  <div className="py-1 px-2 text-center bg-black text-white">
                    A02
                  </div>
                </div>
                <div className="py-1 px-1 text-center bg-black text-white">
                  ชั้น
                </div>
              </div>
              <div className="border-2 border-yellow-400 bg-yellow-100">
                <div className="grid grid-cols-10 text-xs">
                  <div className="col-span-9 grid grid-cols-2 border-r border-b border-yellow-300">
                    <div className="py-1 px-2 text-center border-r border-yellow-300">
                      <button
                        onClick={() =>
                          openDialog('A02-D01', 'รายละเอียดของ A02-D01')
                        }
                        className="w-full h-full text-center  bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        A02-D01
                      </button>
                    </div>
                    <div className="py-1 px-2 text-center">
                      <button
                        onClick={() =>
                          openDialog('A02-D02', 'รายละเอียดของ A02-D02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        A02-D02
                      </button>
                    </div>
                  </div>
                  <div className="border-b border-yellow-300 py-1 px-1 text-center">
                    4
                  </div>
                </div>
                <div className="grid grid-cols-10 text-xs">
                  <div className="col-span-9 grid grid-cols-2 border-r border-b border-yellow-300">
                    <div className="py-1 px-2 text-center border-r border-yellow-300">
                      <button
                        onClick={() =>
                          openDialog('A02-D01', 'รายละเอียดของ A02-C01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        A02-C01
                      </button>
                    </div>
                    <div className="py-1 px-2 text-center">
                      <button
                        onClick={() =>
                          openDialog('A02-C02', 'รายละเอียดของ A02-C02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        A02-C02
                      </button>
                    </div>
                  </div>
                  <div className="border-b border-yellow-300 py-1 px-2 text-center">
                    3
                  </div>
                </div>
                <div className="grid grid-cols-10 text-xs">
                  <div className="col-span-9 grid grid-cols-2 border-r border-b border-yellow-300">
                    <div className="py-1 px-2 text-center border-r border-yellow-300">
                      <button
                        onClick={() =>
                          openDialog('A02-B01', 'รายละเอียดของ A02-B01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        A02-B01
                      </button>
                    </div>
                    <div className="py-1 px-2 text-center">
                      <button
                        onClick={() =>
                          openDialog('A02-B02', 'รายละเอียดของ A02-B02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        A02-B02
                      </button>
                    </div>
                  </div>
                  <div className="border-b border-yellow-300 py-1 px-2 text-center">
                    2
                  </div>
                </div>
                <div className="grid grid-cols-10 text-xs">
                  <div className="col-span-9 grid grid-cols-2 border-r border-yellow-300">
                    <div className="py-1 px-2 text-center border-r border-yellow-300">
                      <button
                        onClick={() =>
                          openDialog('A02-A01', 'รายละเอียดของ A02-A01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        A02-A01
                      </button>
                    </div>
                    <div className="py-1 px-2 text-center">
                      <button
                        onClick={() =>
                          openDialog('A02-A02', 'รายละเอียดของ A02-A02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        A02-A02
                      </button>
                    </div>
                  </div>
                  <div className="py-1 px-2 text-center">1</div>
                </div>
              </div>
            </div>

            <div className="w-2/2">
              <div className="grid grid-cols-10 text-xs">
                <div className="col-span-8 py-1 px-2 bg-white"></div>
                <div className="py-1 px-2 text-center bg-black text-white">
                  A01
                </div>
                <div className="py-1 px-2 text-center bg-black text-white">
                  ชั้น
                </div>
              </div>
              <div className="border-2 border-yellow-300 bg-yellow-100 text-center">
                <div className="grid grid-cols-10 text-xs">
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-D01', 'รายละเอียดของ A01-D01')
                      }
                      className="w-full h-full  text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-D01
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-D02', 'รายละเอียดของ A01-D02')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-D02
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-D03', 'รายละเอียดของ A01-D03')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-D03
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-D05', 'รายละเอียดของ A01-D05')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-D05
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-D05', 'รายละเอียดของ A01-D05')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-D05
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-D06', 'รายละเอียดของ A01-D06')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-D06
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-D07', 'รายละเอียดของ A01-D07')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-D07
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-D08', 'รายละเอียดของ A01-D08')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-D08
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-D09', 'รายละเอียดของ A01-D09')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-D09
                    </button>
                  </div>
                  <div className="border-b border-yellow-300 py-1 px-2">4</div>
                </div>
                <div className="grid grid-cols-10 text-xs">
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-C01', 'รายละเอียดของ A01-C01')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-C01
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-C02', 'รายละเอียดของ A01-C02')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-C02
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-C03', 'รายละเอียดของ A01-C03')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-C03
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-C04', 'รายละเอียดของ A01-C04')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-C04
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-C05', 'รายละเอียดของ A01-C05')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-C05
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-C06', 'รายละเอียดของ A01-C06')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-C06
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-C07', 'รายละเอียดของ A01-C07')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-C07
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-C08', 'รายละเอียดของ A01-C08')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-C08
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-C09', 'รายละเอียดของ A01-C09')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-C09
                    </button>
                  </div>
                  <div className="border-b border-yellow-300 py-1 px-2">3</div>
                </div>
                <div className="grid grid-cols-10 text-xs">
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-B01', 'รายละเอียดของ A01-B01')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-B01
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-B02', 'รายละเอียดของ A01-B02')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-B02
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-B03', 'รายละเอียดของ A01-B03')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-B03
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-B04', 'รายละเอียดของ A01-B04')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-B04
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-B05', 'รายละเอียดของ A01-B05')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-B05
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-B06', 'รายละเอียดของ A01-B06')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-B06
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-B07', 'รายละเอียดของ A01-B07')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-B07
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-B08', 'รายละเอียดของ A01-B08')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-B08
                    </button>
                  </div>
                  <div className="border-r border-b border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-B09', 'รายละเอียดของ A01-B09')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-B09
                    </button>
                  </div>
                  <div className="border-b border-yellow-300 py-1 px-2">2</div>
                </div>
                <div className="grid grid-cols-10 text-xs">
                  <div className="col-span-9 border-r border-yellow-300 py-1 px-2">
                    <button
                      onClick={() =>
                        openDialog('A01-A01', 'รายละเอียดของ A01-A01')
                      }
                      className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                    >
                      A01-A01
                    </button>
                  </div>
                  <div className="py-1 px-2 text-center">1</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <button className="bg-black text-white py-2 px-4 rounded">
                  โทรทัศน์
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-8 justify-between">
          <div className="flex-shrink-0 flex">
            <div className="flex-row space-x-8 bg-yellow-500">
              <div className="text-[5rem] font-bold text-yellow-700 text-center">
                ห้องคลัง
              </div>
            </div>
            <div className="">
              <div className="w-1/2 w-[320px] pl-[2rem]">
                <div className="grid grid-cols-10 text-xs">
                  <div className="col-span-9 grid grid-cols-2">
                    <div className="py-1 px-2 text-center"></div>
                    <div className="py-1 px-2 text-center bg-black text-white">
                      D01
                    </div>
                  </div>
                  <div className="py-1 px-2 text-center bg-black text-white">
                    ชั้น
                  </div>
                </div>
                <div className="border-2 border-yellow-400 bg-yellow-100 text-sm">
                  <div className="grid grid-cols-10">
                    <div className="col-span-9 grid grid-cols-2 border-r border-b border-yellow-300">
                      <div className="py-1 px-2 text-center border-r border-yellow-300">
                        <button
                          onClick={() =>
                            openDialog('D01-D01', 'รายละเอียดของ D01-D01')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D01-D01
                        </button>
                      </div>
                      <div className="py-1 px-2 text-center">
                        <button
                          onClick={() =>
                            openDialog('A02-D02', 'รายละเอียดของ A02-D02')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D01-D02
                        </button>
                      </div>
                    </div>
                    <div className="border-b border-yellow-300 py-1 px-2 text-center">
                      4
                    </div>
                  </div>
                  <div className="grid grid-cols-10">
                    <div className="col-span-9 grid grid-cols-2 border-r border-b border-yellow-300">
                      <div className="py-1 px-2 text-center border-r border-yellow-300">
                        <button
                          onClick={() =>
                            openDialog('A02-D02', 'รายละเอียดของ A02-D02')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D01-B01
                        </button>
                      </div>
                      <div className="py-1 px-2 text-center">
                        <button
                          onClick={() =>
                            openDialog('D01-B01', 'รายละเอียดของ D01-B01')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D01-C02
                        </button>
                      </div>
                    </div>
                    <div className="border-b border-yellow-300 py-1 px-2 text-center">
                      3
                    </div>
                  </div>
                  <div className="grid grid-cols-10">
                    <div className="col-span-9 grid grid-cols-2 border-r border-b border-yellow-300">
                      <div className="py-1 px-2 text-center border-r border-yellow-300">
                        <button
                          onClick={() =>
                            openDialog('D01-B01', 'รายละเอียดของ D01-B01')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D01-B01
                        </button>
                      </div>
                      <div className="py-1 px-2 text-center">
                        <button
                          onClick={() =>
                            openDialog('D01-B01', 'รายละเอียดของ D01-B01')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D01-B02
                        </button>
                      </div>
                    </div>
                    <div className="border-b border-yellow-300 py-1 px-2 text-center">
                      2
                    </div>
                  </div>
                  <div className="grid grid-cols-10 text-xs">
                    <div className="col-span-9 grid grid-cols-2 border-r border-yellow-300">
                      <div className="py-1 px-2 text-center border-r border-yellow-300">
                        <button
                          onClick={() =>
                            openDialog('D01-B01', 'รายละเอียดของ D01-B01')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D01-A01
                        </button>
                      </div>
                      <div className="py-1 px-2 text-center">
                        <button
                          onClick={() =>
                            openDialog('D01-B01', 'รายละเอียดของ D01-B01')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D01-A02
                        </button>
                      </div>
                    </div>
                    <div className="py-1 px-2 text-center">1</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[-22rem] ml-[55rem] flex">
          <div className="flex">
            <div className="bg-gray-300 w-[750px] h-[130px] rounded-3xl my-10 mt-[21rem]"></div>
            <div className="origin-top-left flex flex-col">
              <div className="w-[80px] mt-[25rem] pl-[7rem]">
                <div className="text-xs bg-yellow-300 py-[15px] text-center">
                  <div className="">เก้าอี้ถ่าย</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-full h-screen p-4 flex items-start space-x-8 min-w-[1200px]">
          <div className="relative w-full h-full">
            <div className="absolute top-0 left-0 transform rotate-90 mt-[25rem] ml-[-32rem]">
              <div className="flex-row flex space-x-8 flex-shrink-0 ">
                <div className="w-full">
                  <div className="grid grid-cols-[repeat(16,75px)] gap-0.5 text-xs px-1 py-0.5">
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 text-center bg-black text-white">
                      D05
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(16,75px)] gap-0.5 text-xs bg-black px-1 py-0.5">
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-F08', 'รายละเอียดของ D05-F08')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-F08
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 text-center bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-F16', 'รายละเอียดของ D05-F16')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-F16
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(16,75px)] gap-0.5 text-xs bg-black px-1 py-0.5">
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-E08', 'รายละเอียดของ D05-E08')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-E08
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 text-center bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-E16', 'รายละเอียดของ D05-E16')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-E16
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(16,75px)] gap-0.5 text-xs bg-black px-1 py-0.5">
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D01', 'รายละเอียดของ D05-D01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D01', 'รายละเอียดของ D05-D01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D03', 'รายละเอียดของ D05-D03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D05', 'รายละเอียดของ D05-D05')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D05
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D05', 'รายละเอียดของ D05-D05')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D05
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D06', 'รายละเอียดของ D05-D06')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D06
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D07', 'รายละเอียดของ D05-D07')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D07
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D08', 'รายละเอียดของ D05-D08')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D08
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D10', 'รายละเอียดของ D05-D10')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D10
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D10', 'รายละเอียดของ D05-D10')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D11
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D12', 'รายละเอียดของ D05-D12')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D12
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D13', 'รายละเอียดของ D05-D13')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D13
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D14', 'รายละเอียดของ D05-D14')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D14
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200"></div>
                    <div className="py-1 px-1 text-center bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-D16', 'รายละเอียดของ D05-D16')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-D16
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(16,75px)] gap-0.5 text-xs bg-black px-1 py-0.5">
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C01', 'รายละเอียดของ D05-C01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C02', 'รายละเอียดของ D05-C02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C03', 'รายละเอียดของ D05-C03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C04', 'รายละเอียดของ D05-C04')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C04
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C05', 'รายละเอียดของ D05-C05')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C05
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C06', 'รายละเอียดของ D05-C06')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C06
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C07', 'รายละเอียดของ D05-C07')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C07
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C08', 'รายละเอียดของ D05-C08')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C08
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C09', 'รายละเอียดของ D05-C09')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C09
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C10', 'รายละเอียดของ D05-C10')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C10
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C11', 'รายละเอียดของ D05-C11')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C11
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C12', 'รายละเอียดของ D05-C12')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C12
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C13', 'รายละเอียดของ D05-C13')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C13
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C14', 'รายละเอียดของ D05-C14')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C14
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C15', 'รายละเอียดของ D05-C15')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C15
                      </button>
                    </div>
                    <div className="py-1 px-1 text-center bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-C16', 'รายละเอียดของ D05-C16')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-C16
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(16,75px)] gap-0.5 text-xs bg-black px-1 py-0.5">
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B01', 'รายละเอียดของ D05-B01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B02', 'รายละเอียดของ D05-B02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B03', 'รายละเอียดของ D05-B03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B04', 'รายละเอียดของ D05-B04')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B04
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B05', 'รายละเอียดของ D05-B05')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B05
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B05', 'รายละเอียดของ D05-B05')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B06
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B07', 'รายละเอียดของ D05-B07')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B07
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B08', 'รายละเอียดของ D05-B08')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B08
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B09', 'รายละเอียดของ D05-B09')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B09
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B10', 'รายละเอียดของ D05-B10')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B10
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B11', 'รายละเอียดของ D05-B11')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B11
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B12', 'รายละเอียดของ D05-B12')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B12
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B13', 'รายละเอียดของ D05-B13')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B13
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B14', 'รายละเอียดของ D05-B14')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B14
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B15', 'รายละเอียดของ D05-B15')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B15
                      </button>
                    </div>
                    <div className="py-1 px-1 text-center bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D05-B16', 'รายละเอียดของ D05-B16')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D05-B16
                      </button>
                    </div>
                    <div className="grid grid-cols-[repeat(16,75px)] gap-0.5 text-xs bg-black py-0.5">
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A01', 'รายละเอียดของ D05-A01')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A01
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A02', 'รายละเอียดของ D05-A02')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A02
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A03', 'รายละเอียดของ D05-A03')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A03
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <div
                          id="D05-A04"
                          className={getPositionClassName('D05-A04')}
                        >
                          <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                            D05-A04
                          </button>
                        </div>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A05', 'รายละเอียดของ D05-A05')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A05
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A06', 'รายละเอียดของ D05-A06')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A06
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A07', 'รายละเอียดของ D05-A07')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A07
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A08', 'รายละเอียดของ D05-A08')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A08
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A09', 'รายละเอียดของ D05-A09')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A09
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A10', 'รายละเอียดของ D05-A10')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A10
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A11', 'รายละเอียดของ D05-A11')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A11
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A12', 'รายละเอียดของ D05-A12')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A12
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog(' D05-A13', 'รายละเอียดของ  D05-A13')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A13
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog(' D05-A14', 'รายละเอียดของ  D05-A14')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A14
                        </button>
                      </div>
                      <div className="py-1 px-1 bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A15', 'รายละเอียดของ  D05-A15')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A15
                        </button>
                      </div>
                      <div className="py-1 px-1 text-center bg-blue-200">
                        <button
                          onClick={() =>
                            openDialog('D05-A16', 'รายละเอียดของ  D05-A16')
                          }
                          className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                        >
                          D05-A16
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-0 left-0 transform rotate-90 mt-[25rem] ml-[10rem]">
              <div className="flex-row flex space-x-8 flex-shrink-0 ">
                <div className="w-full">
                  <div className="grid grid-cols-[repeat(4,75px)] gap-0.5 text-xs px-1 py-0.5">
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 text-center bg-gray-200">D03</div>
                  </div>
                  <div className="grid grid-cols-[repeat(4,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D03-A01', 'รายละเอียดของ  D03-A01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D03-A01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D03-A02', 'รายละเอียดของ  D03-A02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D03-A02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D03-A03', 'รายละเอียดของ  D03-A03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D03-A03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D03-A04', 'รายละเอียดของ  D03-A04')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D03-A04
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-0 transform rotate-90 mt-[50rem] ml-[10rem]">
              <div className="flex-row flex space-x-8 flex-shrink-0 ">
                <div className="w-full">
                  <div className="grid grid-cols-[repeat(4,75px)] gap-0.5 text-xs px-1 py-0.5">
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-gray-200 text-center ">
                      D04
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(4,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D03-A01', 'รายละเอียดของ  D03-A01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D04-A01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D04-A02', 'รายละเอียดของ  D04-A02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D04-A02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D04-A03', 'รายละเอียดของ  D04-A03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D04-A03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-blue-200">
                      <button
                        onClick={() =>
                          openDialog('D04-A04', 'รายละเอียดของ  D04-A04')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        D04-A04
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-0 left-0 transform rotate-90 mt-[25rem] ml-[-4rem] flex">
              <div className="flex-row flex space-x-8 flex-shrink-0 ">
                <div className="w-full">
                  <div className="grid grid-cols-[repeat(10,75px)] gap-0.5 text-xs px-1 py-0.5">
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 text-center bg-gray-300">C01</div>
                    <div className="py-1 px-1 text-center bg-gray-300">
                      ชั้น
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(10,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-D09', 'รายละเอียดของ C01-D09')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-D09
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-D08', 'รายละเอียดของ C01-D08')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-D08
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-D07', 'รายละเอียดของ C01-D07')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-D07
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-D06', 'รายละเอียดของ C01-D06')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-D06
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-D05', 'รายละเอียดของ C01-D05')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-D05
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400"></div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-D03', 'รายละเอียดของ C01-D03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-D03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-D02', 'รายละเอียดของ C01-D02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-D02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-D01', 'รายละเอียดของ C01-D01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-D01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">4</div>
                  </div>
                  <div className="grid grid-cols-[repeat(10,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-C09', 'รายละเอียดของ C01-C09')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-C09
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-C08', 'รายละเอียดของ C01-C08')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-C08
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-C07', 'รายละเอียดของ C01-C07')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-C07
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-C06', 'รายละเอียดของ C01-C06')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-C06
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400"></div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-C04', 'รายละเอียดของ C01-C04')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-C04
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-C03', 'รายละเอียดของ C01-C03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-C03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-C02', 'รายละเอียดของ C01-C02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-C02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-C01', 'รายละเอียดของ C01-C01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-C01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center text-center">
                      3
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(10,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-B09', 'รายละเอียดของ C01-B09')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-B09
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-B08', 'รายละเอียดของ C01-B08')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-B08
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-B07', 'รายละเอียดของ C01-B07')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-B07
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-B06', 'รายละเอียดของ C01-B06')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-B06
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-B05', 'รายละเอียดของ C01-B05')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-B05
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-B04', 'รายละเอียดของ C01-B04')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-B04
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-B03', 'รายละเอียดของ C01-B03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-B03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-B02', 'รายละเอียดของ C01-B02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-B02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-B01', 'รายละเอียดของ C01-B01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-B01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">2</div>
                  </div>
                  <div className="grid grid-cols-[repeat(10,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-A09', 'รายละเอียดของ C01-A09')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-A09
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-A08', 'รายละเอียดของ C01-A08')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-A08
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-A07', 'รายละเอียดของ C01-A07')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-A07
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-A06', 'รายละเอียดของ C01-A06')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-A06
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-A05', 'รายละเอียดของ C01-A05')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-A05
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-A04', 'รายละเอียดของ C01-A04')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-A04
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-A03', 'รายละเอียดของ C01-A03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-A03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-A02', 'รายละเอียดของ C01-A02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-A02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C01-A01', 'รายละเอียดของ C01-A01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C01-A01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">1</div>
                  </div>
                </div>
              </div>

              <div className="flex-row flex space-x-8 flex-shrink-0 px-[1rem]">
                <div className="w-full">
                  <div className="grid grid-cols-[repeat(4,75px)] gap-0.5 text-xs px-1 py-0.5">
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-white"></div>
                    <div className="py-1 px-1 bg-gray-300 text-center">C01</div>
                    <div className="py-1 px-1 bg-gray-300 text-center">
                      ชั้น
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(4,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C02-D03', 'รายละเอียดของ C02-D03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-D03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C02-D02', 'รายละเอียดของ C02-D02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-D02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">
                      <button
                        onClick={() =>
                          openDialog('C02-D01', 'รายละเอียดของ C02-D01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-D01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">
                      <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                        4
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(4,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C02-C03', 'รายละเอียดของ C02-C03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-C03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C02-C02', 'รายละเอียดของ C02-C02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-C02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">
                      <button
                        onClick={() =>
                          openDialog('C02-C01', 'รายละเอียดของ C02-C01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-C01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">
                      <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                        3
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(4,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C02-B03', 'รายละเอียดของ C02-B03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-B03
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C02-B02', 'รายละเอียดของ C02-B02')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-B02
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">
                      <button
                        onClick={() =>
                          openDialog('C02-B01', 'รายละเอียดของ C02-B01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-B01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">
                      <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                        2
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[repeat(4,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                    <div className="py-1 px-1 bg-lime-400">
                      <button
                        onClick={() =>
                          openDialog('C02-A03', 'รายละเอียดของ C02-A03')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-A03
                      </button>
                    </div>

                    <div className="py-1 px-1 bg-lime-400">
                      <div
                        id="C02-A02"
                        className={getPositionClassName('C02-A02')}
                      >
                        <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                          C02-A02
                        </button>
                      </div>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">
                      <button
                        onClick={() =>
                          openDialog('C02-A01', 'รายละเอียดของ C02-A01')
                        }
                        className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                      >
                        C02-A01
                      </button>
                    </div>
                    <div className="py-1 px-1 bg-lime-400 text-center">
                      <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                        1
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute left-[750px] top-[100px]">
              <div className="flex">
                <div className=" w-[250px] h-[400px] bg-red-600 flex items-center justify-center text-white">
                  <span>เตียงผู้ป่วย</span>
                </div>
                <div class="ml-[27rem]">
                  <div class="relative">
                    <div class="absolute flex-col">
                      <div class="flex">
                        <div class="transform w-[200px] h-[200px] bg-red-600 flex items-center justify-center text-white rounded-full">
                          <span>เก้าอี้ลูกค้า</span>
                        </div>
                        <div>
                          <div class="ml-[90px]">
                            <div class="origin-top-left flex flex-col mt-[2rem]">
                              <div class="w-[80px]">
                                <div class="text-xs bg-yellow-300 py-[15px] text-center">
                                  <div class="">เก้าอี้ไฟฟ้า</div>
                                </div>
                              </div>
                            </div>
                            <div class="origin-top-left flex flex-col mt-[8rem]">
                              <div class="w-[80px]">
                                <div class="text-xs bg-yellow-300 py-[15px] text-center">
                                  <div class="">เก้าอี้นวด</div>
                                </div>
                              </div>
                            </div>
                            <div class="mt-[10rem]">
                              <div class="ml-[-15rem]">
                                <div>
                                  <span class="bg-red-600 px-5 py-2">
                                    แคชเชียร์
                                  </span>
                                </div>
                              </div>
                              <div class="ml-[-15rem] mt-[5rem]">
                                <div>
                                  <span class="bg-red-600 px-5 py-2">
                                    แคชเชียร์
                                  </span>
                                </div>
                                <div className="mt-[4rem] ml-[5rem]">
                                  <div className="top-0 left-0 rotate-90">
                                    <div className="flex-row flex space-x-8 flex-shrink-0 ">
                                      <div className="w-full">
                                        <div className="grid grid-cols-[repeat(5,75px)] gap-0.5 text-xs px-1 py-0.5">
                                          <div className="py-1 px-1 bg-white"></div>
                                          <div className="py-1 px-1 bg-white"></div>
                                          <div className="py-1 px-1 bg-white"></div>
                                          <div className="py-1 px-1 bg-gray-200 text-center">
                                            B04
                                          </div>
                                          <div className="py-1 px-1 bg-gray-200 text-center ">
                                            ชั้น
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-[repeat(5,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-D01',
                                                  'รายละเอียดของ B04-D01',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-D01
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-D02',
                                                  'รายละเอียดของ B04-D02',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-D02
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-D03',
                                                  'รายละเอียดของ B04-D03',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-D03
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-D04',
                                                  'รายละเอียดของ B04-D04',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-D04
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200 text-center">
                                            4
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-[repeat(5,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-C01',
                                                  'รายละเอียดของ B04-C01',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-C01
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-C02',
                                                  'รายละเอียดของ B04-C02',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-C02
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-C03',
                                                  'รายละเอียดของ B04-C03',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-C03
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-C04',
                                                  'รายละเอียดของ B04-C04',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-C04
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200 text-center">
                                            3
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-[repeat(5,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-B01',
                                                  'รายละเอียดของ B04-B01',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-B01
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-B02',
                                                  'รายละเอียดของ B04-B02',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-B02
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-B03',
                                                  'รายละเอียดของ B04-B03',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-B03
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-B04',
                                                  'รายละเอียดของ B04-B04',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-B04
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200 text-center">
                                            2
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-[repeat(5,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-A01',
                                                  'รายละเอียดของ B04-A01',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-A01
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-A02',
                                                  'รายละเอียดของ B04-A02',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-A02
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B04-A02',
                                                  'รายละเอียดของ B04-A02',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B04-A03
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B01-A04',
                                                  'รายละเอียดของ B01-A04',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B01-A04
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 bg-blue-200 text-center">
                                            1
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="ml-[5rem]">
                                  <div className="top-0 left-0 rotate-90 mt-[17.5rem]">
                                    <div className="flex-row flex space-x-8 flex-shrink-0 ">
                                      <div className="">
                                        <div className="grid grid-cols-[repeat(2,75px)] gap-0.5 text-xs px-1 py-0.5">
                                          <div className="py-1 px-1 bg-white">
                                            <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                                              B03
                                            </button>
                                          </div>
                                          <div className="py-1 px-1 text-center bg-gray-200">
                                            ชั้น
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-[repeat(2,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                                          <div className="py-4 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B01-A04',
                                                  'รายละเอียดของ B01-A04',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B03-A01
                                            </button>
                                          </div>
                                          <div className="py-4 px-1 bg-blue-200 text-center">
                                            2
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-[repeat(2,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                                          <div className="py-4 px-1 bg-blue-200">
                                            <button
                                              onClick={() =>
                                                openDialog(
                                                  'B01-A04',
                                                  'รายละเอียดของ B01-A04',
                                                )
                                              }
                                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                                            >
                                              B03-A01
                                            </button>
                                          </div>
                                          <div className="py-4 px-1 bg-blue-200 text-center">
                                            1
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-[10rem]">
                <div className="text-black transform pl-[5rem]">
                  <div className="absolute">
                    <div className="flex-row flex space-x-8 flex-shrink-0 ">
                      <div className="w-full">
                        <div className="grid grid-cols-[repeat(2,75px)] gap-0.5 text-xs px-1 py-0.5">
                          <div className="py-1 px-1 bg-white">
                            <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                              B06
                            </button>
                          </div>
                          <div className="py-1 px-1 text-center bg-gray-200">
                            <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                              ชั้น
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-[repeat(2,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                          <div className="py-1 px-1 bg-blue-200">
                            <button
                              onClick={() =>
                                openDialog('B06-C01', 'รายละเอียดของ B06-C01')
                              }
                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                            >
                              B06-C01
                            </button>
                          </div>
                          <div className="py-1 px-1 bg-blue-200">
                            <div
                              id="B06-A02"
                              className={getPositionClassName('B06-A02')}
                            >
                              <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                                B06-A02
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-[repeat(2,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                          <div className="py-1 px-1 bg-blue-200">
                            <button
                              onClick={() =>
                                openDialog('B06-B02', 'รายละเอียดของ B06-B02')
                              }
                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                            >
                              B06-B02
                            </button>
                          </div>
                          <div className="py-1 px-1 bg-blue-200">
                            <button
                              onClick={() =>
                                openDialog('B06-B02', 'รายละเอียดของ B06-B02')
                              }
                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                            >
                              B06-B02
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-[repeat(,150px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                          <div className="py-1 px-1 bg-blue-200">
                            <div
                              id="B06-A01"
                              className={getPositionClassName('B06-A01')}
                            >
                              <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                                บนโต๊ะ B06-A01
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-black pl-[28rem]">
                  <div className="absolute">
                    <div className="flex-row flex space-x-8 flex-shrink-0 ">
                      <div className="w-full">
                        <div className="grid grid-cols-[repeat(2,75px)] gap-0.5 text-xs px-1 py-0.5">
                          <div className="py-1 px-1 bg-white">
                            <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                              B05
                            </button>
                          </div>
                          <div className="py-1 px-1 text-center bg-gray-200">
                            <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                              ชั้น
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-[repeat(2,75px)] gap-0.5 text-xs px-1 py-0.5 bg-blue-200">
                          <div
                            id="B05-A01"
                            className={getPositionClassName('B05-A01')}
                          >
                            <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                              B05-A01
                            </button>
                          </div>

                          <div
                            id="B05-A02"
                            className={getPositionClassName('B05-A02')}
                          >
                            <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                              B05-A02
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-[repeat(2,75px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                          <div className="py-1 px-1 bg-blue-200">
                            <button
                              onClick={() =>
                                openDialog('B05-B02', 'รายละเอียดของ B05-B02')
                              }
                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                            >
                              B05-B01
                            </button>
                          </div>
                          <div className="py-1 px-1 bg-blue-200">
                            <button
                              onClick={() =>
                                openDialog('B05-B02', 'รายละเอียดของ B05-B02')
                              }
                              className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300"
                            >
                              B05-B02
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-[repeat(,150px)] gap-0.5 text-xs px-1 py-0.5 bg-black">
                          <div className="py-1 px-1 bg-blue-200">
                            <button className="w-full h-full text-center bg-transparent text-black font-semibold focus:outline-none hover:underline cursor-pointer border-[0px] border-yellow-300">
                              บนโต๊ะ B05-A01
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-[65rem]">
              <div className="ml-[45rem]">
                <div className="origin-top-left rotate-90 flex flex-col">
                  <div className="flex">
                    <div className="h-[35px]">
                      <div className="flex-[0.06] text-xs ">
                        <div className="">เตียงผู้ป่วย</div>
                      </div>
                      <div className="flex-[0.06] text-xs">
                        <div className="">เตียงผู้ป่วย</div>
                      </div>
                    </div>
                    <div className="-rotate-90">
                      <div className=" flex-[0.06] text-xs">โทรทัศน์</div>
                    </div>
                  </div>
                </div>

                <div className="origin-top-left rotate-90 flex flex-col ml-[15rem] mt-[-2rem]">
                  <div className="flex">
                    <div className="h-[35px]">
                      <div className="flex-[0.06] text-xs ">
                        <div className="">เตียงผู้ป่วย</div>
                      </div>
                      <div className="flex-[0.06] text-xs">
                        <div className="">เตียงผู้ป่วย</div>
                      </div>
                    </div>
                    <div className="-rotate-90">
                      <div className=" flex-[0.06] text-xs">โทรทัศน์</div>
                    </div>
                  </div>
                </div>

                <div className="origin-top-left rotate-90 flex flex-col ml-[30rem] mt-[-2.5rem]">
                  <div className="flex">
                    <div className="h-[35px]">
                      <div className="flex-[0.06] text-xs ">
                        <div className="">เตียงผู้ป่วย</div>
                      </div>
                    </div>
                    <div className="-rotate-90">
                      <div className=" flex-[0.06] text-xs">โทรทัศน์</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={dialogContent.title}
        content={dialogContent.content}
      />
    </>
  )
}
export default App
