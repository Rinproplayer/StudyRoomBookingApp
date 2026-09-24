# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 2: Study Room Booking App (Campus Study Rooms & Labs Reservation)  
**Team / Student Name:** Nguyễn Đăng Cáp  
**Student ID:** 23IT.B143  
**Submission Date:** 24/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Student Details:**
  * **Họ và tên:** Nguyễn Đăng Cáp
  * **Mã sinh viên:** 23IT.B143
  * **Lớp:** Kỹ thuật Phần mềm (VKU)
  * **Email:** nguyendangcap122005@gmail.com
  * **Vai trò:** Toàn bộ kiến trúc hệ thống, Lập trình ứng dụng Mobile (React Native + Expo SDK 57), Tích hợp Google Firebase Authentication (Email/Password & Google OAuth 2.0 PKCE), Cloud Firestore Database, React Native Reanimated v4.5.1, Quy trình phê duyệt & tự động hết hạn ca học, EAS Cloud Update — Đóng góp: 100%
* **💻 GitHub Repository:** [https://github.com/Rinproplayer/StudyRoomBookingApp.git](https://github.com/Rinproplayer/StudyRoomBookingApp.git)
* **📱 Nền tảng thực nghiệm:** React Native + Expo (Managed SDK 57), iOS (iPhone qua Expo Go), Android, Web Preview
* **☁️ Cloud Backend & Database:** Google Firebase Authentication & Cloud Firestore (`asia-southeast1` / Singapore)
* **🌐 EAS Cloud Distribution (Kênh Main):** [https://expo.dev/accounts/rinpro123s-team/projects/study-room-booking-app/branches/main](https://expo.dev/accounts/rinpro123s-team/projects/study-room-booking-app/branches/main)
  * *EAS Project ID:* `7665ecc1-d85a-4651-8056-d874ec85ebaf`
  * *Mã QR đám mây:* Cho phép người dùng và giảng viên quét mở ứng dụng từ bất kỳ mạng internet nào (4G/5G hoặc Wi-Fi ngoài trường) bằng Expo Go mà không cần máy tính chủ bật Metro server.

---

## 2. FEATURE IMPLEMENTATION CHECKLIST & REQUIREMENTS

| # | Yêu Cầu Kỹ Thuật (Requirements) | Trạng Thái | Chi Tiết Hiện Thực & Mức Độ Đáp Ứng |
|:---:|---|:---:|---|
| 1 | **Framework & Language: React Native + Expo (Managed SDK 57) & TypeScript Strict Mode** | ✅ Hoàn thành (100%) | Khởi tạo dự án chuẩn Expo SDK 57, cấu hình `"strict": true` trong `tsconfig.json`. Toàn bộ định nghĩa kiểu dữ liệu (`Room`, `Booking`, `BookingStatus`, `TimeSlot`, `Building`, `Amenity`, `Navigation`, `UserProfile`) kiểm tra qua `npm run typecheck` đạt 0 lỗi biên dịch. |
| 2 | **Navigation: React Navigation 7 (Stack + Tabs)** | ✅ Hoàn thành (100%) | Sử dụng bộ thư viện `@react-navigation/native` v7, `@react-navigation/bottom-tabs` v7 và `@react-navigation/native-stack` v7. Điều hướng mượt mà giữa Auth Stack (Login/Register) và Main App Tabs. Phân quyền hiển thị Tab **Quản trị (Admin)** khi đăng nhập tài khoản Quản trị viên. Căn chỉnh đệm an toàn (`paddingBottom`, Safe Area) chuẩn cho thiết bị có tai thỏ / Dynamic Island. |
| 3 | **State Management: Zustand (Client) + TanStack Query (Server)** | ✅ Hoàn thành (100%) | Tách bạch 2 tầng trạng thái: **Zustand** quản lý trạng thái client-side (từ khóa tìm kiếm, bộ lọc chip đa tiêu chí, phiên đăng nhập, vai trò người dùng); **TanStack Query** quản lý server-side cache, optimistic updates và query invalidation kết nối trực tiếp với Cloud Firestore. |
| 4 | **Cloud Database: Google Cloud Firestore (NoSQL)** | ✅ Hoàn thành (100%) | Kết nối cơ sở dữ liệu thời gian thực **Google Cloud Firestore** với 3 collections: `rooms` (phòng học), `bookings` (lịch đặt), `users` (tài khoản người dùng). Hỗ trợ tự động nạp sẵn 8 phòng học mẫu chuẩn Campus VKU khi khởi chạy lần đầu. |
| 5 | **Authentication: Firebase Auth & Google OAuth 2.0 (PKCE Flow)** | ✅ Hoàn thành (100%) | Xác thực người dùng bằng **Firebase Auth** (Email/Mật khẩu) và **Google OAuth 2.0 chuẩn quốc tế (PKCE RFC 7636)** với Web Client ID và iOS Client ID chính thức. Tự động lấy thông tin tài khoản thật từ Google UserInfo API (`email_verified = true`, họ tên, avatar) và đồng bộ vào Firestore. Không cho phép nhập bừa hay giả mạo tài khoản. |
| 6 | **Production-grade Clean Login Screen** | ✅ Hoàn thành (100%) | Màn hình đăng nhập thiết kế chuyên nghiệp, loại bỏ các gợi ý tài khoản công khai để đảm bảo an ninh thông tin. Tích hợp `KeyboardAvoidingView` và `ScrollView` chống bàn phím che khuất ô nhập liệu khi thao tác trên điện thoại. |
| 7 | **Admin Dashboard: Quản Trị Toàn Diện 3 Phân Hệ** | ✅ Hoàn thành (100%) | Tab Quản trị gồm 3 phân hệ chuyên nghiệp: <br>• **Phòng học (`rooms`)**: Thêm mới, Chỉnh sửa thông tin phòng (*Edit Room Modal*), Đổi trạng thái (*Còn chỗ/Hết chỗ/Bảo trì*), Xóa phòng.<br>• **Lịch đặt (`bookings`)**: Giám sát toàn trường, Phê duyệt (`[✓ Duyệt]`), Từ chối (`[✕ Từ chối]`), Xóa vĩnh viễn (`[🗑️ Xóa]`) bản ghi rác/lịch cũ khỏi Firestore.<br>• **Người dùng (`users`)**: Tìm kiếm theo tên/MSSV/email/khoa, Lọc theo vai trò, Cấp quyền Admin hoặc Hạ quyền xuống Sinh viên, Xóa tài khoản vi phạm (kèm cơ chế tự bảo vệ an toàn). |
| 8 | **Room Search & Multi-parameter Filter Chips** | ✅ Hoàn thành (100%) | Ô tìm kiếm tức thời theo tên phòng, tòa nhà, tầng, mô tả. Thanh chip lọc nhanh Tòa nhà và chip *Chỉ phòng còn chỗ*. Modal bộ lọc chuyên sâu lọc theo sức chứa (*Bất kỳ, 10+, 20+, 30+, 40+ chỗ*) và hệ thống tiện ích phong phú. |
| 9 | **60fps FlatList Feed with Room Cards** | ✅ Hoàn thành (100%) | Thẻ `RoomCard` được bọc `React.memo` triệt tiêu re-render thừa. Cấu hình FlatList tối ưu 60fps: `initialNumToRender={6}`, `maxToRenderPerBatch={8}`, `windowSize={7}`, `removeClippedSubviews={true}` cho trải nghiệm cuộn mượt mà. |
| 10 | **Time-Slot Selector with 2-Layer Conflict Prevention Engine** | ✅ Hoàn thành (100%) | Chọn ngày đặt theo dải ngày trong tuần; Lưới khung giờ 1.5h/slot. Thuật toán **Conflict Prevention 2 lớp** trên Cloud Firestore: chống trùng phòng học và chống trùng lịch cá nhân sinh viên. Tự động mở lại slot khi hủy lịch hoặc khi Admin từ chối lịch. |
| 11 | **Booking Lifecycle & Approval Workflow** | ✅ Hoàn thành (100%) | Toàn bộ lượt đặt phòng (kể cả đăng nhập bằng Email hay Google) đều bắt đầu ở trạng thái `Pending` (`Chờ duyệt ⏳`). Admin xét duyệt bằng nút `[✓ Duyệt]` (chuyển sang `Upcoming`) hoặc `[✕ Từ chối]` (chuyển sang `Cancelled`). Màn hình *Lịch đặt của tôi* hiển thị phân biệt rõ ràng giữa ca học đang chờ duyệt và ca học đã được phê duyệt. |
| 12 | **Auto-Expire Past Bookings Engine** | ✅ Hoàn thành (100%) | Hàm `isBookingPast(date, endTime)` tự động rà soát thời gian thực. Bất kỳ lịch đặt nào có thời gian kết thúc nhỏ hơn thời điểm hiện tại sẽ được tự động cập nhật sang trạng thái `Completed` (`Đã học`) và đồng bộ lên Cloud Firestore, ngăn chặn tình trạng ca học cũ bị kẹt ở mục "Sắp tới" hay "Chờ duyệt". |
| 13 | **Fluid Animations & Micro-interactions: React Native Reanimated** | ✅ Hoàn thành (100%) | Tích hợp `react-native-reanimated` v4.5.1 chuẩn Expo SDK 57. Hiện thực hiệu ứng xuất hiện so le (staggered `FadeInDown.springify()`), tương tác chạm lò xo đàn hồi (spring scale `withSpring`), hiệu ứng nhịp đập phát sáng (`withRepeat` pulse) trên huy hiệu trạng thái phòng, và pop-in nảy nảy (`ZoomIn.springify()`) khi xác nhận đặt phòng thành công. |

---

## 3. TECHNICAL ARCHITECTURE & WORKFLOW

### 3.1. Kiến Trúc Xác Thực Google OAuth 2.0 (PKCE Flow) & Firebase Firestore

```
[ Người Dùng Bấm "Đăng nhập bằng Google" ]
                     │
                     ├──> Nền tảng Web ───> Firebase signInWithPopup(auth, GoogleAuthProvider)
                     │
                     └──> Nền tảng Mobile (iOS / Android):
                              │
                              ▼
                     [ Tạo ngẫu nhiên PKCE code_verifier (64 ký tự) ]
                              │
                              ▼
                     [ Băm SHA-256 qua expo-crypto ──> Tạo code_challenge ]
                              │
                              ▼
                     [ WebBrowser.openAuthSessionAsync mở Google OAuth Endpoint ]
                     https://accounts.google.com/o/oauth2/v2/auth
                     (client_id, response_type=code, code_challenge, redirect_uri)
                              │
                              ▼
                     [ Người Dùng Xác Thực Mật Khẩu / FaceID / TouchID của Google ]
                              │
                              ▼
                     [ Google Chuyển Hướng Về Ứng Dụng Kèm Mã authorization_code ]
                              │
                              ▼
                     [ Gửi POST Request Lên https://oauth2.googleapis.com/token ]
                     (code + code_verifier ──> Nhận access_token & id_token)
                              │
                              ▼
                     [ Gọi Google UserInfo API (https://www.googleapis.com/oauth2/v3/userinfo) ]
                     • Lấy email thật (đã qua kiểm duyệt email_verified = true)
                     • Lấy họ tên hiển thị và link ảnh avatar chính thức
                              │
                              ▼
                     [ Đồng Bộ Tài Khoản Vào Cloud Firestore (Collection 'users') ]
                     • Tạo mới hoặc lấy thông tin hồ sơ UserProfile
                     • Xác định vai trò ('admin' nếu là tài khoản quản trị, ngược lại 'student')
                              │
                              ▼
                     [ Cập Nhật Zustand useUserStore ──> Đăng Nhập Thành Công ]
```

---

### 3.2. Động Cơ Chống Xung Đột Lịch Đặt Phòng (Conflict Prevention Engine)

```
[ Người Dùng Chọn Phòng Học & Khung Giờ ] ──> Bấm "Xác Nhận Đặt Phòng"
                                                        │
                                                        ▼
                                    ┌──────────────────────────────────────┐
                                    │    FIRESTORE CONFLICT PREVENTION     │
                                    └──────────────────────────────────────┘
                                                        │
                        ┌────────────────────────────────┴────────────────────────────────┐
                        ▼                                                                 ▼
            [ 1. Kiểm tra Xung Đột Phòng ]                                    [ 2. Kiểm tra Xung Đột Sinh Viên ]
     (Query Firestore: roomId + date + slotId)                       (Query Firestore: studentId + date + slotId)
                        │                                                                 │
           ┌────────────┴────────────┐                                       ┌────────────┴────────────┐
           ▼                         ▼                                       ▼                         ▼
       [ Có trùng ]             [ Không trùng ]                          [ Có trùng ]             [ Không trùng ]
           │                         │                                       │                         │
           ▼                         └───────────────────┬───────────────────┘                         ▼
    Báo lỗi Alert:                                       │                                      Báo lỗi Alert:
    "Khung giờ này vừa được người                        ▼                               "Bạn đã có một lịch đặt phòng khác
    khác đặt hoặc đã có lịch trùng!"       [ HỢP LỆ: TẠO LỊCH ĐẶT MỚI ]                  trong cùng khung giờ này!"
                                           • Lưu Document mới vào collection 'bookings'
                                           • Sinh mã vé check-in duy nhất (SRB-xxxx)
                                           • Gán trạng thái khởi tạo: 'Pending' (Chờ duyệt)
                                                         │
                                                         ▼
                                          [ TanStack Query Invalidation ]
                                          • Invalidate 'slots', 'bookings', 'rooms'
                                                         │
                                                         ▼
                                          [ Mở Hộp Thoại Vé QR & Thông Báo Chờ Duyệt ]
```

---

### 3.3. Vòng Đời Lịch Học & Cỗ Máy Trạng Thái (Booking Lifecycle State Machine)

```
                    ┌─────────────────────────┐
                    │     Sinh Viên Đặt       │
                    └────────────┬────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   Trạng Thái Khởi Tạo │
                     │   'Pending' (Chờ duyệt)
                     └─────┬───────────┬─────┘
                           │           │
            [Admin Duyệt]  │           │  [Admin Từ Chối / Sinh Viên Hủy]
                           ▼           ▼
             ┌───────────────────┐   ┌───────────────────┐
             │    'Upcoming'     │   │   'Cancelled'     │
             │   (Đã duyệt ✓)    │   │   (Đã hủy/Từ chối)│
             └─────────┬─────────┘   └───────────────────┘
                       │                       ▲
                       │ [Sinh Viên Hủy Lịch]  │
                       └───────────────────────┘
                                 │
                                 │ [Đến giờ học & hết ca:
                                 │  isBookingPast(date, endTime) == true]
                                 ▼
                     ┌───────────────────────┐
                     │     'Completed'       │
                     │      (Đã học)         │
                     └───────────────────────┘
                                 │
                                 │ [Admin bấm nút 🗑️ Xóa vĩnh viễn]
                                 ▼
                     ┌───────────────────────┐
                     │    Purged / Deleted   │
                     │  (Xóa khỏi Firestore) │
                     └───────────────────────┘
```

---

### 3.4. Cấu Trúc Mã Nguồn Hoàn Chỉnh

```
Study Room Booking App/
├── app.json                   # Cấu hình Expo Application (URL schemes, EAS projectId, WebBrowser plugin)
├── package.json               # Danh mục phụ thuộc (Expo SDK 57, Firebase v12, Zustand, TanStack Query, Reanimated)
├── tsconfig.json              # Cấu hình TypeScript Strict Mode ("strict": true)
├── test-conflict.ts           # Kịch bản kiểm thử tự động thuật toán Conflict Prevention
├── README.md                  # Hướng dẫn dự án chi tiết (cập nhật mới nhất)
├── REPORT.md                  # Báo cáo kỹ thuật tổng kết dự án
├── App.tsx                    # Root Provider tích hợp QueryClientProvider & Navigation
└── src/
    ├── config/                # Cấu hình kết nối Google Firebase (Auth & Firestore)
    │   └── firebase.ts        # Firebase app, auth, db, GOOGLE_OAUTH_CONFIG (Web & iOS Client IDs)
    ├── services/              # Tầng tương tác dịch vụ Backend & Nghiệp vụ
    │   ├── authService.ts     # Đăng ký, đăng nhập Email/Password & Google OAuth 2.0 PKCE
    │   └── firestoreService.ts# CRUD phòng, duyệt/hủy/xóa lịch, kiểm tra quá hạn (auto-expire) & quản lý user
    ├── types/                 # Kiểu dữ liệu TypeScript nghiêm ngặt (Strict Types)
    │   ├── room.ts            # Interface Room, Building, Amenity, RoomFilterState
    │   ├── booking.ts         # Interface Booking, BookingStatus ('Pending'|'Upcoming'|'Completed'|'Cancelled')
    │   └── navigation.ts      # Type RootStackParamList, BottomTabParamList (React Navigation 7)
    ├── theme/
    │   └── colors.ts          # Bảng mã màu chuẩn Campus (Primary Blue, Emerald, Amber, Rose, Slate)
    ├── api/                   # Tầng dịch vụ dữ liệu & Server Cache (TanStack Query)
    │   ├── mockData.ts        # Dữ liệu phòng học khởi tạo ban đầu (8 phòng Campus VKU)
    │   ├── roomService.ts     # Tìm kiếm, lọc phòng học theo tiêu chí
    │   ├── bookingService.ts  # Động cơ kiểm tra xung đột lịch 2 lớp
    │   └── queries.ts         # React Query hooks kết nối Firestore
    ├── store/                 # Zustand Stores (Client State)
    │   ├── useFilterStore.ts  # Quản lý từ khóa, tòa nhà, sức chứa, tiện ích
    │   └── useUserStore.ts    # Quản lý thông tin tài khoản, trạng thái đăng nhập, phân quyền
    ├── components/            # UI Components tái sử dụng
    │   ├── RoomCard.tsx       # Thẻ hiển thị phòng tối ưu 60fps (React.memo) + withSpring scale micro-interaction
    │   ├── StatusBadge.tsx    # Huy hiệu trạng thái Còn chỗ (nhịp đập pulsing) / Hết chỗ / Bảo trì
    │   ├── FilterChipBar.tsx  # Thanh cuộn chip lọc nhanh kèm nút [Bộ lọc ▾]
    │   ├── FilterModal.tsx    # Modal lọc đa tiêu chí chuyên sâu
    │   ├── TimeSlotPicker.tsx # Bộ chọn ngày và lưới khung giờ trực quan
    │   └── BookingSuccessModal.tsx # Hộp thoại xác nhận kèm vé QR Check-in (ZoomIn springify)
    ├── navigation/            # Điều hướng ứng dụng (React Navigation 7)
    │   ├── BottomTabNavigator.tsx # 3 Tabs Sinh viên hoặc 4 Tabs Quản trị viên
    │   └── RootNavigator.tsx  # Điều hướng giữa Auth Stack và App Stack
    └── screens/               # Màn hình chính
        ├── LoginScreen.tsx         # Đăng nhập chuẩn (Email/Password & Google OAuth 2.0 PKCE)
        ├── RegisterScreen.tsx      # Đăng ký tài khoản sinh viên mới
        ├── AdminDashboardScreen.tsx# Bảng điều khiển quản trị (Phòng học, Lịch đặt + Duyệt/Xóa, Người dùng)
        ├── BrowseRoomsScreen.tsx   # Khám phá phòng học, tìm kiếm & lọc 60fps (Reanimated entrance)
        ├── RoomDetailsScreen.tsx   # Chi tiết phòng, chọn khung giờ & xác nhận đặt
        ├── MyBookingsScreen.tsx    # Quản lý lịch đặt cá nhân, tab Sắp tới (Chờ duyệt/Đã duyệt) & vé QR
        └── ProfileScreen.tsx       # Hồ sơ cá nhân, quy định phòng học & đăng xuất
```

---

## 4. BẰNG CHỨNG KIỂM THỬ THỰC NGHIỆM (VERIFICATION & EVIDENCE)

### 4.1. Kiểm thử TypeScript Strict Mode (`npm run typecheck`)
Kiểm tra tính toàn vẹn kiểu dữ liệu của toàn bộ dự án với trình biên dịch TypeScript:
```bash
$ npm run typecheck
> study-room-booking-app@1.0.0 typecheck
> tsc --noEmit

# Kết quả: 0 lỗi biên dịch (Exit code: 0)
```

### 4.2. Kiểm thử tự động thuật toán Conflict Prevention (`npm run test:conflict`)
Kịch bản kiểm thử tự động xác minh toàn diện 8/8 bước ngăn chặn xung đột lịch học:
```text
$ npm run test:conflict
> study-room-booking-app@1.0.0 test:conflict
> tsx test-conflict.ts

--- Starting Conflict Prevention & Booking Tests ---
1. Checking initial slots for room-1 on date: 2026-09-25
Slot 08:00-09:30 isBooked: false

2. Student 1 books Lab A3-101 for 08:00-09:30...
Successfully booked! Booking ID: bk-1790250595063 Check-in Code: SRB-6131

3. Verifying slot status in slot query after booking...
Slot 08:00-09:30 isBooked: true

4. Student 2 tries to book the EXACT same room and slot (Conflict Check 1)...
SUCCESS! Conflict properly prevented. Error message: Khung giờ này vừa được người khác đặt hoặc đã có lịch trùng. Vui lòng chọn khung giờ khác!

5. Student 1 tries to book ANOTHER room at the same time slot (Conflict Check 2 - Double Booking)...
SUCCESS! Student double-booking prevented. Error message: Bạn đã có một lịch đặt phòng khác trong cùng khung giờ này. Không thể đặt trùng giờ!

6. Student 1 cancels their booking...
Booking cancelled successfully.

7. Verifying slot is freed up in slot query after cancellation...
Slot 08:00-09:30 isBooked: false

8. Student 2 can now successfully book the freed slot...
Booking successful for Student 2! ID: bk-1790250596377

--- ALL CONFLICT PREVENTION TESTS PASSED SUCCESSFULLY! ---
```

---

## 5. KẾT LUẬN & ĐÁNH GIÁ TỔNG KẾT
Dự án **Mini-Project 2: Study Room Booking App** đã hoàn thành xuất sắc tất cả các mục tiêu kỹ thuật đề ra theo tiêu chuẩn ngành và yêu cầu môn học:
1. **Kiến trúc bền vững**: Tách bạch rõ ràng Client State (Zustand) và Server State (TanStack Query), sử dụng TypeScript Strict Mode đảm bảo loại trừ hoàn toàn lỗi khi thực thi (runtime errors).
2. **Bảo mật & Chuẩn hóa**: Triển khai xác thực **Google OAuth 2.0 PKCE** hiện đại kết hợp Firebase Authentication. Không sử dụng dữ liệu giả mạo hay ô nhập liệu tự do.
3. **Quy trình nghiệp vụ thực tế**: Tích hợp cỗ máy trạng thái hoàn chỉnh với quy trình phê duyệt ca học (`Pending` ➔ `Upcoming` / `Cancelled`), cơ chế tự động chuyển trạng thái ca học quá hạn (`isBookingPast` ➔ `Completed`), và nút xóa vĩnh viễn (`deleteBookingAdmin`) cho phép Admin quản trị cơ sở dữ liệu tinh gọn.
4. **Quản trị toàn diện**: Xây dựng trọn vẹn Bảng điều khiển Quản trị viên Campus với 3 phân hệ (Phòng học, Lịch đặt, Người dùng) có khả năng tương tác trực tiếp và đồng bộ hóa tức thì với Cloud Firestore.
5. **Trải nghiệm người dùng (UX/UI)**: 100% Tiếng Việt thân thiện sinh viên, giao diện danh sách đạt chuẩn cuộn 60fps, hỗ trợ vé Check-in QR điện tử tiện lợi.
6. **Chuyển động & Hoạt họa đỉnh cao**: Ứng dụng tích hợp sâu **React Native Reanimated v4.5.1**, mang lại trải nghiệm thị giác mượt mà 60fps với hiệu ứng vật lý lò xo (springify), xuất hiện so le (staggered cascade) và vi tương tác phản hồi xúc giác tự nhiên.
7. **Phân phối đám mây hiện đại**: Triển khai thành công trên hạ tầng Expo Cloud qua EAS Update, tạo mã QR vĩnh viễn cho phép thử nghiệm tức thời trên thiết bị thật từ bất kỳ vị trí địa lý nào.
