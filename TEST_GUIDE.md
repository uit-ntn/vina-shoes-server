# 🧪 Hướng Dẫn Test Order API với Postman

## 📋 Tổng Quan

Document này hướng dẫn cách test toàn bộ Order module của Vina Shoes API sử dụng Postman.

## 🚀 Setup

### 1. Import Collection
1. Mở Postman
2. Click **Import** → Chọn file `Order_API_Tests.postman_collection.json`
3. Collection sẽ xuất hiện với tên "Vina Shoes - Order API Tests"

### 2. Cấu Hình Variables
Collection đã có sẵn các variables:
- `baseUrl`: http://localhost:3000 (có thể thay đổi theo môi trường)
- `accessToken`: Tự động set sau khi login customer
- `adminToken`: Tự động set sau khi login admin  
- `orderId`: Tự động set sau khi tạo order
- `userId`: Tự động set sau khi login

### 3. Khởi Động Server
```bash
cd vina-shoes-server
npm run start:dev
```

## 📖 Các Endpoint Chính

### 🔐 **Auth Setup**
- **Customer Login**: Đăng nhập customer để test các API user
- **Admin Login**: Đăng nhập admin để test các API admin

### 📦 **Order Management**
- **Create Order**: Tạo đơn hàng mới từ cart
- **Get My Orders**: Lấy danh sách đơn hàng của user hiện tại  
- **Get Order by ID**: Xem chi tiết một đơn hàng
- **Update Order**: Cập nhật đơn hàng (chỉ khi status = pending)

### 💳 **Payment Flow**
- **Create Payment Intent**: Tạo intent thanh toán với Stripe
- **Confirm Payment (Admin)**: Admin xác nhận thanh toán thành công

### 📋 **Order Status Management**
- **Update Order Status (Admin)**: Admin cập nhật trạng thái đơn hàng
- **Update Tracking Info (Admin)**: Admin cập nhật thông tin vận chuyển
- **Get Tracking Info**: User xem thông tin vận chuyển
- **Confirm Delivery (Admin)**: Admin xác nhận đã giao hàng

### 🔄 **Order Actions**
- **Cancel Order**: User hủy đơn hàng
- **Reorder**: Đặt lại đơn hàng từ đơn cũ
- **Create Return Request**: User yêu cầu trả hàng
- **Process Return Request (Admin)**: Admin xử lý yêu cầu trả hàng
- **Add Review**: User đánh giá đơn hàng đã giao

### 📊 **Admin Features**  
- **Get All Orders (Admin)**: Admin xem tất cả đơn hàng với filter
- **Get Orders by User ID (Admin)**: Admin xem đơn hàng của user cụ thể
- **Get Order Statistics (Admin)**: Admin xem thống kê đơn hàng
- **Delete Order (Admin)**: Admin xóa đơn hàng

### 🧪 **Error Scenarios**
- Test các trường hợp lỗi: unauthorized, not found, forbidden

## 🎯 Luồng Test Đề Xuất

### **Bước 1: Authentication**
```
1. Chạy "Customer Login" 
   → Kiểm tra accessToken được set tự động
2. Chạy "Admin Login"
   → Kiểm tra adminToken được set tự động
```

### **Bước 2: Tạo và Quản Lý Order**
```
1. "Create Order" → orderId được set tự động
2. "Get My Orders" → Kiểm tra order vừa tạo có trong list
3. "Get Order by ID" → Xem chi tiết order
4. "Update Order" → Thử cập nhật địa chỉ giao hàng
```

### **Bước 3: Payment Flow**
```
1. "Create Payment Intent" → Tạo intent thanh toán
2. "Confirm Payment (Admin)" → Admin xác nhận thanh toán
```

### **Bước 4: Order Status Flow**
```
1. "Update Order Status (Admin)" → Đổi status từ pending → processing
2. "Update Tracking Info (Admin)" → Thêm tracking number
3. "Get Tracking Info" → User xem thông tin vận chuyển
4. "Confirm Delivery (Admin)" → Xác nhận đã giao hàng
```

### **Bước 5: Post-Delivery Actions**
```
1. "Add Review" → User đánh giá đơn hàng
2. "Create Return Request" → User yêu cầu trả hàng
3. "Process Return Request (Admin)" → Admin xử lý return
```

### **Bước 6: Admin Analytics**
```
1. "Get All Orders (Admin)" → Xem tất cả đơn hàng
2. "Get Order Statistics (Admin)" → Xem thống kê
3. "Get Orders by User ID (Admin)" → Xem đơn hàng theo user
```

## 🔍 Order Status Flow

```
PENDING → PROCESSING → CONFIRMED → PREPARING → READY_TO_SHIP → 
PICKED_UP → IN_TRANSIT → SHIPPED → DELIVERED

                    ↓ (có thể hủy ở các giai đoạn đầu)
                CANCELLED
                    
                    ↓ (sau khi delivered)
                RETURNED → REFUNDED
```

## 💡 Test Data Mẫu

### **Order Items:**
```json
{
  "items": [
    {
      "productId": "60d5ecb74b24a1234567890a",
      "name": "Nike Air Force 1",
      "image": "https://example.com/nike-af1.jpg", 
      "size": 42,
      "price": 2500000,
      "quantity": 1
    }
  ]
}
```

### **Shipping Address:**
```json
{
  "shippingAddress": {
    "fullName": "Nguyễn Văn A",
    "phone": "0987654321", 
    "addressLine": "123 Đường ABC",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "Hồ Chí Minh"
  }
}
```

## ⚠️ Lưu Ý Quan Trọng

### **Authentication:**
- Tất cả API (trừ webhook) cần JWT token
- Admin APIs cần token có role admin
- Token tự động được set qua test scripts

### **Order Permissions:**
- User chỉ có thể thao tác với order của mình
- Admin có thể thao tác với tất cả orders
- Một số hành động chỉ được phép ở trạng thái cụ thể

### **Status Restrictions:**
- Chỉ có thể update order khi status = "pending"
- Chỉ có thể cancel order khi status = "pending" hoặc "processing"  
- Chỉ có thể review khi status = "delivered"
- Chỉ có thể return khi status = "delivered"

### **Payment Integration:**
- Stripe integration cho payment intents
- Webhook để handle payment events
- Test mode sử dụng test keys

## 🎯 Expected Results

### **Success Cases:**
- Status codes: 200, 201 theo từng endpoint
- Response có đúng structure theo DTO definitions
- Auto-generated fields: orderNumber, timestamps
- Status transitions theo business logic

### **Error Cases:**
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)  
- 404: Not Found (invalid order ID)
- 400: Bad Request (validation errors, business rule violations)

## 🔄 Automation với Collection Runner

1. Mở Collection → Click "Run"
2. Chọn tất cả requests hoặc chỉ folder cụ thể
3. Set iterations = 1 
4. Click "Run Vina Shoes - Order API Tests"
5. Xem kết quả test tự động

## 📊 Test Reports

Postman sẽ tự động tạo test report với:
- Pass/Fail ratio
- Response times  
- Test assertions results
- Error details nếu có

---

**Chúc bạn test thành công! 🚀** 