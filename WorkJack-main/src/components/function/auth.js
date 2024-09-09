
import axios from 'axios';

const baseUrl = 'http://localhost:3301'; // แทนที่ด้วย URL ของ API ของคุณ




export const searchProductByCode = async (code) => {
  try {
    const response = await axios.get(`${baseUrl}/search`, {
      params: { code },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // กรณีที่ server ตอบกลับมาด้วย status code ที่ไม่อยู่ในช่วง 2xx
      throw new Error(error.response.data.message || 'เกิดข้อผิดพลาดในการค้นหาสินค้า');
    } else if (error.request) {
      // กรณีที่ไม่ได้รับการตอบกลับจาก server
      throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } else {
      // กรณีอื่นๆ
      console.error('Error', error.message);
      throw new Error('เกิดข้อผิดพลาดในการส่งคำขอ');
    }
  }
};



export const getProductListByPos = async (pos) => {
    try {
      const response = await axios.post(`${baseUrl}/getProductListByPos`, { pos });
      console.log('API Response:', response.data); // เพิ่มบรรทัดนี้
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  export const getProductListByCode = async (code) => {
    try {
      const response = await axios.post(`${baseUrl}/getProductListByCode`, { code });
      console.log('API Response:', response.data); // เพิ่มบรรทัดนี้
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  };