# Study Room Booking App 🎓🏛️

Ứng dụng di động đặt phòng tự học, phòng lab và không gian nghiên cứu trong khuôn viên trường đại học (**Campus Study Room & Lab Reservation App**).

Dự án được xây dựng theo chuẩn yêu cầu kỹ thuật cao: **React Native + Expo (Managed SDK 57)**, **TypeScript (Strict Mode)**, **React Navigation 7 (Stack + Tabs)**, **Zustand**, **TanStack Query**, kết hợp **Google Firebase Authentication & Cloud Firestore Database**, **Google OAuth 2.0 chuẩn quốc tế (PKCE Flow)**, hiệu ứng vật lý **React Native Reanimated v4.5.1**, cùng hạ tầng phân phối đám mây **EAS Cloud Update**.

---

## 🚀 Các Tính Năng Nổi Bật

### 1. 🔐 Đăng Nhập, Đăng Ký & Xác Thực Google Chuẩn Hiện Đại
- **Xác thực Email & Mật khẩu**: Đăng ký và đăng nhập bảo mật qua **Firebase Authentication**. Mật khẩu được mã hóa an toàn, phân quyền chặt chẽ.
- **Đăng nhập bằng Google (Google OAuth 2.0)**:
  - Tích hợp phương thức đăng nhập bằng tài khoản Google chính thức như các ứng dụng tiêu chuẩn quốc tế.
  - **Trên Web**: Sử dụng cửa sổ đăng nhập Google Firebase Popup chính hãng.
  - **Trên Mobile (iOS / Android)**: Sử dụng quy trình xác thực OAuth 2.0 bảo mật cao **PKCE (Authorization Code Grant - RFC 7636)** qua `WebBrowser.openAuthSessionAsync` kết hợp `expo-crypto`.
  - Tự động lấy và xác minh thông tin tài khoản Google thực tế (`email_verified = true`, họ tên, ảnh đại diện) và đồng bộ trực tiếp vào Cloud Firestore.
- **Giao diện đăng nhập chuẩn Production**:
  - Tinh gọn, lịch sự, bảo mật (loại bỏ các ô gợi ý tài khoản công khai).
  - Tích hợp `KeyboardAvoidingView` và `ScrollView` tối ưu cho bàn phím ảo, tránh tình trạng bị che khuất ô nhập liệu khi gõ trên điện thoại.
- **Phân quyền theo vai trò**: **Sinh viên (`student`)** và **Quản trị viên (`admin`)**.
- **Tài khoản Quản trị viên khởi tạo**: Tài khoản `admin` (hoặc `admin@vku.udn.vn`), mật khẩu `123456`.

---

### 2. ⏳ Quy Trình Phê Duyệt Lịch Đặt & Quản Lý Vòng Đời Lịch Học
- **Trạng thái khởi tạo - Chờ duyệt (`Pending`)**: Mọi lịch đặt phòng mới tạo (bao gồm cả tài khoản sinh viên đăng ký qua Email hay tài khoản Google) đều bắt đầu ở trạng thái `Pending` (`Chờ duyệt ⏳`).
- **Thông báo rõ ràng trên Vé Check-in**: Modal đặt phòng thành công và Vé điện tử QR hiển thị rõ thông báo nhắc nhở sinh viên chờ Quản trị viên xét duyệt trước khi sử dụng phòng.
- **Duyệt & Từ chối 1-chạm cho Admin**:
  - Nút **[✓ Duyệt]**: Chuyển lịch sang `Upcoming` (`Đã duyệt ✓`), xác nhận phòng sẵn sàng cho sinh viên đến học.
  - Nút **[✕ Từ chối]**: Chuyển lịch sang `Cancelled` (`Đã từ chối / hủy`), giải phóng ngay khung giờ cho sinh viên khác.
- **Phân loại trực quan trên giao diện Sinh viên**:
  - Tab *Sắp tới* trong mục *Lịch đặt của tôi* hiển thị phân biệt rõ ràng lịch *Chờ duyệt ⏳* (viền cam hổ phách) và lịch *Đã duyệt ✓* (viền xanh lá thành công).

---

### 3. 🕒 Tự Động Kết Thúc Lịch Học Quá Hạn (Auto-Expire Past Bookings)
- **Động cơ kiểm tra thời gian thực**: Hàm `isBookingPast(date, endTime)` đối soát chính xác ngày và giờ kết thúc của từng ca học với thời gian hiện tại của hệ thống.
- **Tự động chuyển đổi trạng thái**: Toàn bộ lịch đặt phòng (dù đang ở trạng thái `Pending` hay `Upcoming`) khi đã trôi qua thời gian kết thúc sẽ được tự động cập nhật thành `Completed` (`Đã học`) và đồng bộ trực tiếp lên Cloud Firestore.
- **Trải nghiệm người dùng thông minh**: Triệt tiêu hoàn toàn lỗi hiển thị các ca học trong quá khứ ở mục "Sắp tới" hay "Chờ duyệt", giữ cho danh sách lịch đặt luôn chính xác và tinh gọn.

---

### 4. 🛡️ Bảng Điều Khiển Quản Trị Toàn Diện (Admin Dashboard)
Tự động xuất hiện Tab riêng **Quản trị (Admin)** khi đăng nhập bằng tài khoản Quản trị viên, bao gồm 3 phân hệ nghiệp vụ:

#### 🏢 Phân hệ 1: Quản Lý Phòng Học (`rooms`)
- ➕ **Thêm phòng mới**: Nhập tên phòng, tòa nhà, vị trí tầng, sức chứa, link ảnh, gắn chip tiện ích và mô tả chi tiết, lưu trực tiếp lên Cloud Firestore.
- ✏️ **Chỉnh sửa phòng (Edit Room Modal)**: Cập nhật lại toàn bộ thông số phòng học (tên, sức chứa, tiện nghi, link ảnh, mô tả) tức thời.
- 🛠️ **Đổi trạng thái phòng**: Chuyển đổi nhanh 1-chạm giữa các trạng thái: *Còn chỗ*, *Hết chỗ*, *Bảo trì*.
- 🗑️ **Xóa phòng học**: Xóa phòng khỏi hệ thống với hộp thoại xác nhận an toàn.

#### 📋 Phân hệ 2: Quản Lý Lịch Đặt Toàn Trường (`bookings`)
- 🔍 **Giám sát thời gian thực**: Xem toàn bộ lịch đặt phòng của sinh viên toàn trường theo ngày, giờ, tên phòng, mã sinh viên, mã vé check-in.
- 📑 **Bộ lọc phân loại ca học**: Lọc nhanh theo 5 trạng thái: *Tất cả*, *Chờ duyệt*, *Sắp tới*, *Đã học*, *Đã hủy*.
- ⚡ **Xét duyệt & Từ chối**: Thao tác duyệt (`handleApprove`) hoặc từ chối (`handleReject`) tức thời.
- 🗑️ **Xóa vĩnh viễn (Permanent Delete)**: Trang bị nút **[🗑️ Xóa]** trên từng thẻ lịch đặt phòng kèm hộp thoại xác nhận `Alert.alert`, cho phép Quản trị viên xóa triệt để các bản ghi lịch rác, lịch kiểm thử hoặc lịch quá hạn khỏi Cloud Firestore, tự động làm mới danh sách tức thì (`TanStack Query invalidation`).

#### 👥 Phân hệ 3: Quản Trị Người Dùng & Phân Quyền (`users`)
- 🔎 **Tìm kiếm người dùng**: Tìm kiếm tức thì theo Họ tên, Mã sinh viên, Email, hoặc Khoa/Viện.
- 🎯 **Lọc theo vai trò**: Lọc danh sách theo *Tất cả*, *Sinh viên*, hoặc *Quản trị viên*.
- 🔄 **Cấp & Hạ quyền linh hoạt**: Thăng cấp tài khoản sinh viên thành Quản trị viên (Admin) hoặc hạ quyền Quản trị viên xuống Sinh viên chỉ với 1 thao tác xác nhận.
- 🗑️ **Xóa tài khoản người dùng**: Xóa tài khoản khỏi cơ sở dữ liệu khi sinh viên tốt nghiệp hoặc vi phạm nghiêm trọng.
- 🛡️ **Cơ chế tự bảo vệ an toàn**: Chặn không cho Admin tự xóa hoặc tự hạ quyền tài khoản của chính mình đang đăng nhập.

---

### 5. ☁️ Cơ Sở Dữ Liệu Đám Mây (Cloud Firestore Database)
- Toàn bộ dữ liệu phòng học (`rooms`), lịch đặt phòng (`bookings`), và hồ sơ người dùng (`users`) được lưu trữ, đồng bộ và phân quyền trực tiếp trên **Google Cloud Firestore** (Datacenter: `asia-southeast1 / Singapore`).
- Tự động nạp dữ liệu phòng mẫu (8 phòng học tiêu chuẩn Campus VKU: Lab AI, Studio Sáng tạo, Hội trường A3...) khi khởi chạy ứng dụng lần đầu.

---

### 6. 🔍 Tìm Kiếm & Bộ Lọc Đa Tiêu Chí (Search & Multi-parameter Filters)
- Ô tìm kiếm thời gian thực theo tên phòng, tòa nhà, tầng hoặc mô tả.
- Thanh chip lọc nhanh cuộn ngang: *Tất cả, Tòa nhà A3, Thư viện Trung tâm, Khu Công nghệ, Giảng đường Khoa học, Không gian Sáng tạo*.
- Lọc nhanh phòng trống với chip *Chỉ phòng còn chỗ*.
- Modal lọc chuyên sâu (Multi-parameter Filter Modal):
  - Lọc theo sức chứa tối thiểu: *Bất kỳ, 10+, 20+, 30+, 40+ chỗ*.
  - Lọc theo tiện ích: *Wi-Fi tốc độ cao, Bảng viết dạ, Máy chiếu 4K, Điều hòa không khí, Phòng cách âm, Màn hình kép, Họp trực tuyến...*

---

### 7. ⚡ Danh Sách Phòng Tối Ưu 60fps (FlatList Feed)
- Sử dụng thẻ `RoomCard` được memo hóa (`React.memo`) triệt tiêu re-render thừa.
- Cấu hình cuộn danh sách đạt chuẩn 60fps: `initialNumToRender={6}`, `maxToRenderPerBatch={8}`, `windowSize={7}`, `removeClippedSubviews={true}`.
- Hiển thị đầy đủ thông số: Ảnh phòng chất lượng cao, tên phòng, vị trí tòa nhà, sức chứa chỗ ngồi, huy hiệu trạng thái (`StatusBadge`), danh sách tiện nghi và nút đặt phòng.

---

### 8. ⏰ Bộ Chọn Khung Giờ & Chống Trùng Lịch 2 Lớp (Conflict Prevention Engine)
- Chọn ngày học theo dải ngày trong tuần (*Hôm nay, Ngày mai, T2, T3...*).
- Lưới khung giờ chuẩn (08:00 - 09:30, 09:30 - 11:00, 11:00 - 12:30, 13:00 - 14:30...):
  - Khung giờ đã có người đặt: Bị khóa không cho chọn, gạch ngang và gắn nhãn *Đã kín lịch*.
  - Khung giờ trống: Viền xanh lá, bấm chọn sẽ chuyển sang highlight xanh dương *Đang chọn*.
- **Động cơ chống xung đột lịch 2 lớp trên Cloud Firestore**:
  1. *Chống trùng phòng*: Ngăn chặn tức thì nếu khung giờ đã có người khác đặt trước.
  2. *Chống trùng lịch cá nhân (Double-booking)*: Ngăn không cho cùng 1 sinh viên đặt 2 phòng khác nhau trong cùng một khung giờ.
- **Tự động giải phóng slot**: Khi hủy đặt phòng trong *Lịch đặt của tôi* hoặc bị Admin từ chối, khung giờ ngay lập tức mở lại thành *Còn chỗ* cho sinh viên khác.

---

### 9. ✨ Hiệu Ứng Chuyển Động & Tương Tác Mượt Mà (React Native Reanimated v4.5.1)
- **Staggered Card Entrances (`FadeInDown.springify()`)**: Danh sách phòng học, lịch đặt cá nhân, và các danh sách trong Admin Dashboard xuất hiện so le với hiệu ứng vật lý lò xo mượt mà, tự nhiên.
- **Micro-interaction Chạm Đàn Hồi (`withSpring`)**: Thẻ phòng `RoomCard` phản hồi lực nhấn tức thì (`onPressIn` thu nhẹ 0.98x, `onPressOut` nảy lại 1.0x).
- **Huy hiệu Phát sáng Nhịp đập (`useSharedValue` + `withRepeat`)**: Huy hiệu phòng "Còn chỗ" có chấm xanh phát sáng co giãn liên tục, giúp sinh viên nhận biết trạng thái phòng ngay lập tức.
- **Hộp thoại Thành công Sinh động (`ZoomIn.springify()`)**: Modal xác nhận đặt phòng kèm vé QR nảy vào màn hình với icon tích xanh pop-in và hiệu ứng trượt mượt mà.

---

### 10. 🌐 Phân Phối Đám Mây EAS Cloud & Trải Nghiệm Đa Mạng (EAS Update)
- **EAS Project ID**: `7665ecc1-d85a-4651-8056-d874ec85ebaf`.
- **Kênh triển khai (Branch)**: `main`.
- **Mã QR Vĩnh Viễn Không Phụ Thuộc Mạng LAN**: Người dùng và giảng viên có thể quét mã QR từ trang Expo Cloud bằng ứng dụng **Expo Go** trên bất kỳ thiết bị iOS hoặc Android nào qua kết nối 4G/5G hoặc bất kỳ mạng Wi-Fi nào từ xa mà không cần máy tính phải chạy máy chủ cục bộ.
- **Bản dựng Web tĩnh**: Tích hợp sẵn bản xuất `npx expo export --platform web` (thư mục `dist`) sẵn sàng triển khai hosting toàn cầu trên Vercel, Netlify hoặc Firebase Hosting.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Phiên bản | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Framework** | React Native + Expo (Managed Workflow) | SDK 57 (~57.0.23) | Đa nền tảng iOS, Android, Web |
| **Language** | TypeScript | v5.x / Strict: true | 100% Type-safe, 0 lỗi biên dịch |
| **Animations** | `react-native-reanimated` | v4.5.1 | Vật lý lò xo (springify), Staggered cascade & Pulsing |
| **Navigation** | React Navigation 7 | v7.x | Stack Navigation + Bottom Tabs |
| **Database** | Google Cloud Firestore (NoSQL) | v12.19.0 | Đồng bộ thời gian thực (`asia-southeast1`) |
| **Authentication** | Firebase Auth + Google OAuth 2.0 | v12.19.0 | Email/Password + PKCE RFC 7636 Flow |
| **Security / Crypto**| `expo-crypto`, `expo-web-browser` | SDK 57 | Băm SHA-256 PKCE Code Challenge |
| **Cloud Distribution**| EAS Update & Expo Cloud | v57.0.23 | Phân phối mã nguồn trực tiếp qua kênh `main` |
| **Storage / Cache** | `@react-native-async-storage/async-storage` | v3.1.1 | Lưu trữ local state & cached session |
| **Client State** | Zustand | v5.0.15 | Quản lý filter, search, phiên đăng nhập |
| **Server State** | TanStack Query (React Query) | v5.103.1 | Quản lý server cache, revalidation & mutations |
| **Icons** | `@expo/vector-icons` (Ionicons) | v15.1.1 | Bộ icon chuẩn iOS & Material Design |

---

## 📦 Cài Đặt & Khởi Chạy Dự Án

### 1. Cài đặt các gói phụ thuộc:
```bash
npm install
```

### 2. Khởi chạy ứng dụng:
```bash
# Khởi chạy Metro Bundler cục bộ (quét mã QR bằng Expo Go trên cùng mạng LAN)
npm start

# Mở ứng dụng chạy trên trình duyệt máy tính (Google Popup Auth hoạt động trực tiếp)
npm run web

# Khởi chạy trên trình giả lập Android / iOS (nếu có môi trường Android Studio / Xcode)
npm run android
npm run ios
```

### 3. Kiểm tra chất lượng mã nguồn & Kiểm thử xung đột:
```bash
# Kiểm tra TypeScript Strict Mode (đạt 0 lỗi biên dịch)
npm run typecheck

# Chạy kịch bản kiểm tra tự động chống xung đột lịch đặt phòng (8/8 test passed)
npm run test:conflict
```

### 4. Triển khai bản cập nhật đám mây (EAS Update):
```bash
eas update --branch main --message "Deploy latest build with approvals, auto-expire and admin delete"
```

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
Study Room Booking App/
├── app.json                   # Cấu hình Expo Application (scheme, EAS projectId, icons, bundles)
├── package.json               # Danh sách thư viện và câu lệnh scripts
├── tsconfig.json              # Cấu hình TypeScript Strict Mode ("strict": true)
├── test-conflict.ts           # Kịch bản kiểm thử tự động thuật toán Conflict Prevention
├── README.md                  # Hướng dẫn chi tiết dự án (cập nhật mới nhất)
├── REPORT.md                  # Báo cáo kỹ thuật tổng kết dự án
├── App.tsx                    # Component gốc tích hợp QueryClientProvider & Navigation
└── src/
    ├── config/                # Cấu hình kết nối Google Firebase (Auth & Firestore)
    │   └── firebase.ts        # Firebase app, auth, db, GOOGLE_OAUTH_CONFIG
    ├── services/              # Tầng tương tác dịch vụ Backend & Nghiệp vụ
    │   ├── authService.ts     # Đăng ký, đăng nhập Email/Password & Google OAuth PKCE
    │   └── firestoreService.ts# CRUD phòng học, quản lý users, duyệt/xóa lịch & auto-expire
    ├── api/                   # Tầng dịch vụ dữ liệu & Server Cache (TanStack Query)
    │   ├── mockData.ts        # Dữ liệu phòng học khởi tạo ban đầu (8 phòng VKU)
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
    │   ├── LoginScreen.tsx         # Đăng nhập chuẩn (Email/Password & Google OAuth 2.0 PKCE)
    │   ├── RegisterScreen.tsx      # Đăng ký tài khoản sinh viên mới
    │   ├── AdminDashboardScreen.tsx# Quản trị Campus (Phòng học, Lịch đặt + Duyệt/Xóa, Người dùng)
    │   ├── BrowseRoomsScreen.tsx   # Khám phá phòng học, tìm kiếm & lọc 60fps (Reanimated)
    │   ├── RoomDetailsScreen.tsx   # Chi tiết phòng, chọn khung giờ & xác nhận đặt
    │   ├── MyBookingsScreen.tsx    # Quản lý lịch đặt cá nhân, phân loại Chờ duyệt/Đã duyệt & vé QR
    │   └── ProfileScreen.tsx       # Hồ sơ cá nhân, quy định phòng học & đăng xuất
    ├── components/            # UI Components tái sử dụng
    │   ├── RoomCard.tsx       # Thẻ hiển thị phòng tối ưu 60fps + micro-interaction withSpring
    │   ├── StatusBadge.tsx    # Huy hiệu Còn chỗ (pulsing) / Hết chỗ / Bảo trì
    │   ├── FilterChipBar.tsx  # Thanh cuộn chip lọc nhanh
    │   ├── FilterModal.tsx    # Modal lọc đa tiêu chí chuyên sâu
    │   ├── TimeSlotPicker.tsx # Bộ chọn ngày và lưới khung giờ trực quan
    │   └── BookingSuccessModal.tsx # Hộp thoại xác nhận đặt phòng (ZoomIn) kèm vé QR & trạng thái chờ duyệt
    ├── theme/                 # Bảng mã màu sắc và token giao diện Campus
    │   └── colors.ts
    └── types/                 # Định nghĩa kiểu dữ liệu TypeScript nghiêm ngặt
        ├── room.ts
        ├── booking.ts         # BookingStatus: 'Pending' | 'Upcoming' | 'Completed' | 'Cancelled'
        └── navigation.ts
```

---

## 👥 Tài Khoản Kiểm Thử Mặc Định

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@vku.udn.vn` (hoặc `admin`) | `123456` | Toàn quyền Quản trị: Thêm/Sửa/Xóa phòng, Phê duyệt/Từ chối/Xóa lịch đặt, Quản lý & Phân quyền User |
| **Sinh viên (Student)** | `student@vku.udn.vn` (hoặc `student`) | `123456` | Tìm phòng, Lọc phòng, Đặt lịch (Chờ duyệt), Xem vé QR Check-in, Hủy lịch cá nhân |
| **Tài khoản Google** | Bấm nút **"Tiếp tục với Google"** | Xác thực Google | Tự động tạo tài khoản Sinh viên thật, hưởng đầy đủ tính năng đặt phòng tiêu chuẩn |
