# Study Room Booking App 🎓🏛️

Ứng dụng di động đặt phòng tự học, phòng lab và không gian nghiên cứu trong khuôn viên trường đại học (Campus Study Room & Lab Reservation App).

Dự án được xây dựng theo chuẩn yêu cầu kỹ thuật cao: **React Native + Expo (Managed SDK 57)**, **TypeScript (Strict Mode)**, **React Navigation 7 (Stack + Tabs)**, **Zustand** và **TanStack Query**.

---

## 🚀 Tính Năng Nổi Bật

### 1. 🔍 Tìm Kiếm & Bộ Lọc Đa Tiêu Chí (Search & Multi-parameter Filters)
- Tìm kiếm tức thời theo tên phòng, tòa nhà, tầng và mô tả.
- Bộ lọc chip nhanh: *Tất cả, Tòa nhà A3, Thư viện Trung tâm, Khu Công nghệ, Giảng đường Khoa học, Không gian Sáng tạo*.
- Lọc theo phòng còn chỗ (*Chỉ phòng còn chỗ*).
- Modal lọc chuyên sâu: Lựa chọn sức chứa tối thiểu (*10+, 20+, 30+, 40+ chỗ*) và tiện ích trang thiết bị (*Wi-Fi tốc độ cao, Bảng viết dạ, Máy chiếu 4K, Điều hòa không khí, Phòng cách âm, Màn hình kép, Họp trực tuyến...*).

### 2. ⚡ Danh Sách Phòng Tối Ưu 60fps (FlatList Feed)
- Sử dụng thẻ `RoomCard` được memo hóa (`React.memo`) tránh re-render không cần thiết.
- Tối ưu hóa hiệu năng cuộn mượt mà đạt chuẩn 60fps với `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`.
- Hiển thị đầy đủ thông tin trực quan theo Wireframe:
  - 📷 Ảnh chất lượng cao của phòng
  - 📍 Vị trí tòa nhà
  - 👥 Sức chứa chỗ ngồi
  - Trạng thái ✅ **Còn chỗ (Available)** hoặc 🔴 **Hết chỗ (Occupied)**
  - Các tiện nghi nổi bật và nút đặt phòng nhanh.

### 3. ⏰ Bộ Chọn Khung Giờ & Chống Trùng Lịch (Conflict Prevention Engine)
- Chọn ngày đặt theo dải ngày trong tuần (*Hôm nay, Ngày mai, T2, T3...*).
- Lưới khung giờ học tập (08:00 - 09:30, 09:30 - 11:00, 11:00 - 12:30, ...):
  - Khung giờ đã có người đặt: Bị khóa không thể chọn, gạch ngang và hiển thị nhãn *Đã kín lịch*.
  - Khung giờ còn trống: Viền xanh lá, chọn để chuyển sang highlight *Đang chọn*.
- **Cơ chế chống xung đột lịch 2 lớp**:
  - *Chống trùng phòng*: Ngăn chặn tức thì nếu phòng đã có lịch đặt trùng ngày và giờ.
  - *Chống trùng lịch cá nhân*: Ngăn không cho một sinh viên đặt 2 phòng khác nhau trong cùng một khung giờ.
- **Hủy đặt phòng & Tự động giải phóng slot**: Khi hủy lịch trong mục *Lịch đặt của tôi*, khung giờ ngay lập tức được giải phóng thành *Còn trống* trên cache của TanStack Query.

### 4. 🎫 Quản Lý Đặt Phòng & Vé Check-in QR
- Hệ thống 3 Tabs: **Tìm phòng**, **Lịch đặt**, **Cá nhân**.
- Quản lý lịch theo các trạng thái: *Sắp tới*, *Đã học*, *Đã hủy*.
- Vé Check-in điện tử với mã code duy nhất (ví dụ: `SRB-4170`) và mã QR hỗ trợ quét vào phòng.
- Thông tin hồ sơ sinh viên, thống kê số lượt đặt và tổng số giờ học đã tích lũy.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ | Phiên bản |
| :--- | :--- | :--- |
| **Framework** | React Native + Expo (Managed Workflow) | SDK 57 |
| **Language** | TypeScript (Strict Mode) | Strict: true |
| **Navigation** | React Navigation 7 | Native Stack + Bottom Tabs v7 |
| **Client State** | Zustand | v5.x |
| **Server State / Cache** | TanStack Query (React Query) | v5.x |
| **Icons** | Expo Vector Icons (Ionicons) | v15.x |

---

## 📦 Cài Đặt & Khởi Chạy Dự Án

### 1. Cài đặt các gói phụ thuộc:
```bash
npm install
```

### 2. Khởi chạy ứng dụng:
```bash
# Chạy với Expo
npm start

# Hoặc mở xem trên trình duyệt Web
npm run web
```

### 3. Kiểm tra mã nguồn:
```bash
# Kiểm tra TypeScript Strict Mode
npm run typecheck

# Chạy bài kiểm tra tự động chống xung đột lịch đặt
npm run test:conflict
```

---

## 📁 Cấu Trúc Thư Mục

```
study-room-booking-app/
├── src/
│   ├── api/             # TanStack Query hooks, Mock API & Dữ liệu ban đầu
│   ├── components/      # RoomCard (60fps), FilterChipBar, FilterModal, TimeSlotPicker, StatusBadge...
│   ├── navigation/      # React Navigation 7 (RootNavigator, BottomTabNavigator)
│   ├── screens/         # BrowseRoomsScreen, RoomDetailsScreen, MyBookingsScreen, ProfileScreen
│   ├── store/           # Zustand stores (useFilterStore, useUserStore)
│   ├── theme/           # Hệ màu sắc chuẩn Campus và token giao diện
│   └── types/           # Định nghĩa TypeScript strict types (Room, Booking, Navigation...)
├── test-conflict.ts     # Script kiểm tra tự động thuật toán Conflict Prevention
├── App.tsx              # Component gốc tích hợp QueryClientProvider & NavigationContainer
├── package.json
└── tsconfig.json
```
