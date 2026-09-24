# Study Room Booking App 🎓🏛️

Ứng dụng di động đặt phòng tự học, phòng lab và không gian nghiên cứu trong khuôn viên trường đại học (Campus Study Room & Lab Reservation App).

Dự án được xây dựng theo chuẩn yêu cầu kỹ thuật cao: **React Native + Expo (Managed SDK 57)**, **TypeScript (Strict Mode)**, **React Navigation 7 (Stack + Tabs)**, **Zustand**, **TanStack Query**, kết hợp **Google Firebase Authentication & Cloud Firestore Database**, cùng **Google OAuth 2.0 chuẩn quốc tế (PKCE Flow)**.

---

## 🚀 Tính Năng Nổi Bật

### 1. 🔐 Đăng Nhập, Đăng Ký & Xác Thực Google Chuẩn Hiện Đại
- **Xác thực Email & Mật khẩu**: Đăng ký và đăng nhập bảo mật qua **Firebase Authentication**. Mật khẩu được mã hóa an toàn, không ai có thể truy cập trái phép.
- **Đăng nhập bằng Google (Google OAuth 2.0)**:
  - Tích hợp phương thức đăng nhập bằng tài khoản Google chính thức như các ứng dụng lớn (Shopee, YouTube, Google Classroom...).
  - Trên Web: Sử dụng cửa sổ đăng nhập Google Firebase Popup chính hãng.
  - Trên Mobile (iOS / Android): Sử dụng quy trình xác thực OAuth 2.0 bảo mật cao **PKCE (Authorization Code Grant - RFC 7636)** qua `WebBrowser.openAuthSessionAsync` kết hợp `expo-crypto`.
  - Tự động lấy và xác minh thông tin tài khoản Google thực tế (`email_verified = true`, họ tên, ảnh đại diện) và đồng bộ trực tiếp vào Cloud Firestore.
- **Giao diện đăng nhập chuẩn Production**:
  - Tinh gọn, lịch sự, bảo mật (loại bỏ các ô gợi ý tài khoản công khai).
  - Tích hợp `KeyboardAvoidingView` và `ScrollView` tối ưu cho bàn phím ảo, tránh tình trạng bị che khuất ô nhập liệu khi gõ trên điện thoại.
- **Phân quyền theo vai trò**: **Sinh viên (`student`)** và **Quản trị viên (`admin`)**.
- **Tài khoản Quản trị viên khởi tạo**: Tài khoản `admin` (hoặc `admin@vku.udn.vn`), mật khẩu `123456`.

---

### 2. 🛡️ Bảng Điều Khiển Quản Trị Toàn Diện (Admin Dashboard)
Tự động xuất hiện Tab riêng **Quản trị (Admin)** khi đăng nhập bằng tài khoản Quản trị viên, bao gồm 3 phân hệ nghiệp vụ:

#### 🏢 Phân hệ 1: Quản Lý Phòng Học (`rooms`)
- ➕ **Thêm phòng mới**: Nhập tên phòng, tòa nhà, vị trí tầng, sức chứa, link ảnh, gắn chip tiện ích và mô tả chi tiết, lưu trực tiếp lên Cloud Firestore.
- ✏️ **Chỉnh sửa phòng (Edit Room Modal)**: Cho phép cập nhật lại mọi thông số phòng học (tên, sức chứa, tiện nghi, link ảnh, mô tả) tức thời.
- 🛠️ **Đổi trạng thái phòng**: Chuyển đổi nhanh 1-chạm giữa các trạng thái: *Còn chỗ*, *Hết chỗ*, *Bảo trì*.
- 🗑️ **Xóa phòng học**: Xóa phòng khỏi hệ thống với hộp thoại xác nhận an toàn.

#### 📋 Phân hệ 2: Quản Lý Lịch Đặt Toàn Trường (`bookings`)
- 🔍 **Giám sát thời gian thực**: Xem toàn bộ lịch đặt phòng của sinh viên toàn trường theo ngày, giờ, tên phòng, mã vé check-in.
- 🚫 **Hủy lịch đặt vi phạm**: Cho phép Admin hủy lịch khi sinh viên vi phạm quy chế hoặc phòng cần bảo trì đột xuất. Khung giờ học lập tức được tự động giải phóng trên Firestore thành *Còn chỗ*.
- 🏷️ **Nhãn trạng thái trực quan**: Hiển thị thẻ trạng thái chuẩn tiếng Việt (*Sắp tới*, *Hoàn thành*, *Đã hủy*) được căn chỉnh chống tràn viền trên màn hình điện thoại.

#### 👥 Phân hệ 3: Quản Trị Người Dùng & Phân Quyền (`users`)
- 🔎 **Tìm kiếm người dùng**: Tìm kiếm tức thì theo Họ tên, Mã sinh viên, Email, hoặc Khoa/Viện.
- 🎯 **Lọc theo vai trò**: Lọc danh sách theo *Tất cả*, *Sinh viên*, hoặc *Quản trị viên*.
- 🔄 **Cấp & Hạ quyền linh hoạt**: Thăng cấp tài khoản sinh viên thành Quản trị viên (Admin) hoặc hạ quyền Quản trị viên xuống Sinh viên chỉ với 1 thao tác xác nhận.
- 🗑️ **Xóa tài khoản người dùng**: Xóa tài khoản khỏi cơ sở dữ liệu khi sinh viên tốt nghiệp hoặc vi phạm nghiêm trọng.
- 🛡️ **Cơ chế tự bảo vệ an toàn**: Chặn không cho Admin tự xóa hoặc tự hạ quyền tài khoản của chính mình đang đăng nhập.

---

### 3. ☁️ Cơ Sở Dữ Liệu Đám Mây (Cloud Firestore Database)
- Toàn bộ dữ liệu phòng học (`rooms`), lịch đặt phòng (`bookings`), và hồ sơ người dùng (`users`) được lưu trữ, đồng bộ và phân quyền trực tiếp trên **Google Cloud Firestore**.
- Tự động nạp dữ liệu phòng mẫu (8 phòng học chuẩn Campus VKU) khi khởi chạy ứng dụng lần đầu.

---

### 4. 🔍 Tìm Kiếm & Bộ Lọc Đa Tiêu Chí (Search & Multi-parameter Filters)
- Ô tìm kiếm thời gian thực theo tên phòng, tòa nhà, tầng hoặc mô tả.
- Thanh chip lọc nhanh cuộn ngang: *Tất cả, Tòa nhà A3, Thư viện Trung tâm, Khu Công nghệ, Giảng đường Khoa học, Không gian Sáng tạo*.
- Lọc nhanh phòng trống với chip *Chỉ phòng còn chỗ*.
- Modal lọc chuyên sâu (Multi-parameter Filter Modal):
  - Lọc theo sức chứa tối thiểu: *Bất kỳ, 10+, 20+, 30+, 40+ chỗ*.
  - Lọc theo tiện ích: *Wi-Fi tốc độ cao, Bảng viết dạ, Máy chiếu 4K, Điều hòa không khí, Phòng cách âm, Màn hình kép, Họp trực tuyến...*

---

### 5. ⚡ Danh Sách Phòng Tối Ưu 60fps (FlatList Feed)
- Sử dụng thẻ `RoomCard` được memo hóa (`React.memo`) triệt tiêu re-render thừa.
- Cấu hình cuộn danh sách đạt chuẩn 60fps: `initialNumToRender={6}`, `maxToRenderPerBatch={8}`, `windowSize={7}`, `removeClippedSubviews={true}`.
- Hiển thị đầy đủ thông số: Ảnh phòng chất lượng cao, tên phòng, vị trí tòa nhà, sức chứa chỗ ngồi, huy hiệu trạng thái (`StatusBadge`), danh sách tiện nghi và nút đặt phòng.

---

### 6. ⏰ Bộ Chọn Khung Giờ & Chống Trùng Lịch (Conflict Prevention Engine)
- Chọn ngày học theo dải ngày trong tuần (*Hôm nay, Ngày mai, T2, T3...*).
- Lưới khung giờ chuẩn (08:00 - 09:30, 09:30 - 11:00, 11:00 - 12:30, 13:00 - 14:30...):
  - Khung giờ đã có người đặt: Bị khóa không cho chọn, gạch ngang và gắn nhãn *Đã kín lịch*.
  - Khung giờ trống: Viền xanh lá, bấm chọn sẽ chuyển sang highlight xanh dương *Đang chọn*.
- **Động cơ chống xung đột lịch 2 lớp trên Cloud Firestore**:
  1. *Chống trùng phòng*: Ngăn chặn tức thì nếu khung giờ đã có người khác đặt trước.
  2. *Chống trùng lịch cá nhân*: Ngăn không cho cùng 1 sinh viên đặt 2 phòng khác nhau trong cùng một khung giờ.
- **Tự động giải phóng slot**: Khi hủy đặt phòng trong *Lịch đặt của tôi*, khung giờ ngay lập tức mở lại thành *Còn chỗ* cho sinh viên khác.

---

### 7. 🎫 Quản Lý Đặt Phòng & Vé Check-in QR
- Hệ thống 3 Tabs (Sinh viên) hoặc 4 Tabs (Quản trị viên): **Tìm phòng**, **Quản trị (Admin)**, **Lịch đặt**, **Cá nhân**.
- Phân loại lịch học trực quan: *Sắp tới*, *Đã học*, *Đã hủy*.
- Vé Check-in điện tử chứa mã code duy nhất (ví dụ: `SRB-4170`) kèm mã QR hỗ trợ quét vào cửa phòng tự học.

---

### 6. ✨ Hiệu Ứng Chuyển Động & Tương Tác Mượt Mà (React Native Reanimated)
- **Staggered Card Entrances (`FadeInDown.springify()`)**: Danh sách phòng học, lịch đặt cá nhân, và các danh sách trong Admin Dashboard xuất hiện so le với hiệu ứng vật lý lò xo mượt mà, tự nhiên.
- **Micro-interaction Chạm Đàn Hồi (`withSpring`)**: Thẻ phòng `RoomCard` phản hồi lực nhấn tức thì (`onPressIn` thu nhẹ 0.98x, `onPressOut` nảy lại 1.0x).
- **Huy hiệu Phát sáng Nhịp đập (`useSharedValue` + `withRepeat`)**: Huy hiệu phòng "Còn chỗ" có chấm xanh phát sáng co giãn liên tục, giúp sinh viên nhận biết trạng thái phòng ngay lập tức.
- **Hộp thoại Thành công Sinh động (`ZoomIn.springify()`)**: Modal xác nhận đặt phòng kèm vé QR nảy vào màn hình với icon tích xanh pop-in và hiệu ứng trượt mượt mà.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Phiên bản | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Framework** | React Native + Expo (Managed Workflow) | SDK 57 | Hỗ trợ đa nền tảng iOS, Android, Web |
| **Language** | TypeScript | v5.x / Strict: true | Đạt 0 lỗi biên dịch kiểu dữ liệu |
| **Animations** | `react-native-reanimated` | v4.5.1 | Staggered entrance, Spring press micro-interactions & pulsing badges |
| **Navigation** | React Navigation 7 | v7.x | Stack Navigation + Bottom Tabs |
| **Database** | Google Cloud Firestore (NoSQL) | v12.x | Realtime cloud database |
| **Authentication** | Firebase Auth + Google OAuth 2.0 | v12.x | Email/Password + PKCE Google Sign-In |
| **Security / Crypto**| `expo-crypto`, `expo-web-browser` | SDK 57 | Băm SHA-256 PKCE RFC 7636 |
| **Storage / Cache** | `@react-native-async-storage/async-storage` | v3.x | Lưu trữ client config & cache |
| **Client State** | Zustand | v5.x | Quản lý filter, search, phiên đăng nhập |
| **Server State** | TanStack Query (React Query) | v5.x | Quản lý query caching & mutation |
| **Icons** | `@expo/vector-icons` (Ionicons) | v15.x | Bộ icon chuẩn iOS/Android |

---

## 📦 Cài Đặt & Khởi Chạy Dự Án

### 1. Cài đặt các gói phụ thuộc:
```bash
npm install
```

### 2. Khởi chạy ứng dụng:
```bash
# Khởi chạy ứng dụng với Expo (quét mã QR bằng Expo Go trên điện thoại)
npm start

# Mở ứng dụng chạy trên trình duyệt máy tính (Google Popup Auth hoạt động trực tiếp)
npm run web

# Khởi chạy trên trình giả lập Android / iOS (nếu có cài đặt)
npm run android
npm run ios
```

### 3. Kiểm tra chất lượng mã nguồn:
```bash
# Kiểm tra TypeScript Strict Mode (đạt 0 lỗi)
npm run typecheck

# Chạy kịch bản kiểm tra tự động chống xung đột lịch đặt phòng
npm run test:conflict
```

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
Study Room Booking App/
├── app.json                   # Cấu hình Expo Application (scheme, icons, bundle identifiers)
├── package.json               # Danh sách thư viện và câu lệnh scripts
├── tsconfig.json              # Cấu hình TypeScript Strict Mode ("strict": true)
├── test-conflict.ts           # Kịch bản kiểm thử tự động thuật toán Conflict Prevention
├── README.md                  # Hướng dẫn chi tiết dự án (cập nhật mới nhất)
├── REPORT.md                  # Báo cáo kỹ thuật tổng kết dự án
├── App.tsx                    # Component gốc tích hợp QueryClientProvider & Navigation
└── src/
    ├── config/                # Cấu hình kết nối Google Firebase (Auth & Firestore)
    │   └── firebase.ts        # Firebase app, auth, db, GOOGLE_OAUTH_CONFIG
    ├── services/              # Tầng tương tác dịch vụ Backend
    │   ├── authService.ts     # Đăng ký, đăng nhập Email/Password & Google OAuth PKCE
    │   └── firestoreService.ts# CRUD phòng học, quản lý users & đặt phòng trên Firestore
    ├── api/                   # Tầng dịch vụ dữ liệu & Server Cache (TanStack Query)
    │   ├── mockData.ts        # Dữ liệu phòng học khởi tạo ban đầu
    │   ├── roomService.ts     # Tìm kiếm, lọc phòng học theo tiêu chí
    │   ├── bookingService.ts  # Động cơ kiểm tra xung đột lịch 2 lớp
    │   └── queries.ts         # React Query hooks kết nối Firestore
    ├── store/                 # Zustand Stores (Client State)
    │   ├── useFilterStore.ts  # Bộ lọc từ khóa, tòa nhà, sức chứa, tiện ích
    │   └── useUserStore.ts    # Thông tin tài khoản, trạng thái đăng nhập, phân quyền
    ├── navigation/            # React Navigation 7
    │   ├── BottomTabNavigator.tsx # Thanh điều hướng Tabs (Tìm phòng, Quản trị, Lịch đặt, Cá nhân)
    │   └── RootNavigator.tsx  # Điều hướng giữa màn hình Đăng nhập/Đăng ký và App chính
    ├── screens/               # Màn hình chức năng
    │   ├── LoginScreen.tsx         # Đăng nhập chuẩn (Email/Password & Google OAuth 2.0)
    │   ├── RegisterScreen.tsx      # Đăng ký tài khoản sinh viên mới
    │   ├── AdminDashboardScreen.tsx# Quản trị Campus (Phòng học, Lịch đặt, Người dùng)
    │   ├── BrowseRoomsScreen.tsx   # Khám phá phòng học, tìm kiếm & lọc 60fps
    │   ├── RoomDetailsScreen.tsx   # Chi tiết phòng, chọn khung giờ & xác nhận đặt
    │   ├── MyBookingsScreen.tsx    # Quản lý lịch đặt cá nhân & vé QR Check-in
    │   └── ProfileScreen.tsx       # Hồ sơ cá nhân, quy định phòng học & đăng xuất
    ├── components/            # UI Components tái sử dụng
    │   ├── RoomCard.tsx       # Thẻ hiển thị phòng tối ưu 60fps (React.memo)
    │   ├── StatusBadge.tsx    # Huy hiệu Còn chỗ / Hết chỗ / Bảo trì
    │   ├── FilterChipBar.tsx  # Thanh cuộn chip lọc nhanh
    │   ├── FilterModal.tsx    # Modal lọc đa tiêu chí chuyên sâu
    │   ├── TimeSlotPicker.tsx # Bộ chọn ngày và lưới khung giờ trực quan
    │   └── BookingSuccessModal.tsx # Hộp thoại xác nhận đặt phòng kèm vé QR
    ├── theme/                 # Bảng mã màu sắc và token giao diện Campus
    │   └── colors.ts
    └── types/                 # Định nghĩa kiểu dữ liệu TypeScript nghiêm ngặt
        ├── room.ts
        ├── booking.ts
        └── navigation.ts
```
