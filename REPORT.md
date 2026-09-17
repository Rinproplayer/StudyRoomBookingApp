# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 2: Study Room Booking App (Campus Study Rooms & Labs Reservation)  
**Team / Student Name:** Nguyễn Trung Nguyên  
**Student ID:** 23IT.B143  
**Submission Date:** 17/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Student Details:**
  * **Họ và tên:** Nguyễn Trung Nguyên
  * **Mã sinh viên:** 23IT.B143
  * **Lớp:** Kỹ thuật Phần mềm (VKU)
  * **Vai trò:** Toàn bộ kiến trúc hệ thống, Lập trình Mobile (React Native + Expo), Tích hợp Firebase Database & Auth, Quản trị State & UI/UX — Đóng góp: 100%
* **💻 GitHub Repository:** [https://github.com/Rinproplayer/StudyRoomBookingApp.git](https://github.com/Rinproplayer/StudyRoomBookingApp.git)
* **📱 Nền tảng thực nghiệm:** React Native + Expo (Managed SDK 57), iOS (Expo Go) & Android, Web Preview
* **☁️ Cloud Backend & Database:** Google Firebase Authentication & Cloud Firestore (asia-southeast1 / Singapore)

---

## 2. FEATURE IMPLEMENTATION CHECKLIST & REQUIREMENTS

| # | Yêu Cầu Kỹ Thuật (Requirements) | Trạng Thái | Chi Tiết Hiện Thực & Mức Độ Đáp Ứng |
|:---:|---|:---:|---|
| 1 | **Framework & Language: React Native + Expo (Managed) & TypeScript Strict Mode** | ✅ Hoàn thành (100%) | Dự án khởi tạo với Expo Managed SDK 57, cấu hình `"strict": true` trong `tsconfig.json`. Toàn bộ định nghĩa kiểu dữ liệu (`Room`, `Booking`, `TimeSlot`, `Building`, `Amenity`, `Navigation`) được kiểm tra bằng lệnh `npm run typecheck` đạt 0 lỗi. |
| 2 | **Navigation: React Navigation 7 (Stack + Tabs)** | ✅ Hoàn thành (100%) | Tích hợp thư viện mới nhất `@react-navigation/native` v7, `@react-navigation/bottom-tabs` v7 và `@react-navigation/native-stack` v7. Hỗ trợ chuyển đổi mượt mà giữa Auth Stack (Login/Register) và Main App Tabs. Phân quyền động hiển thị Tab **Quản trị (Admin)** khi đăng nhập tài khoản Quản trị viên. |
| 3 | **State Management: Zustand (Client) + TanStack Query (Server)** | ✅ Hoàn thành (100%) | Phân định ranh giới kiến trúc rõ ràng: **Zustand** quản lý trạng thái client-side (từ khóa tìm kiếm, bộ lọc chip đa tiêu chí, phiên đăng nhập và vai trò người dùng); **TanStack Query** quản lý trạng thái server-side kết nối trực tiếp với Cloud Firestore. |
| 4 | **Cloud Database & Authentication: Google Firebase** | ✅ Hoàn thành (100%) | Kết nối cơ sở dữ liệu **Google Cloud Firestore** lưu trữ các collections: `rooms`, `bookings`, `users`. Xác thực người dùng bằng **Firebase Auth** (Email/Password), hỗ trợ phân quyền người dùng (Sinh viên vs Quản trị viên) và tính năng 1-click Demo Login. |
| 5 | **Admin Dashboard: Quản Trị Campus** | ✅ Hoàn thành (100%) | Tab Quản trị chuyên dụng cho Admin: Thống kê phòng và lượt đặt toàn trường; Thêm phòng học mới lưu trực tiếp vào Firestore; Đổi trạng thái phòng (Còn chỗ / Hết chỗ / Bảo trì); Xóa phòng; Quản lý và hủy lịch đặt phòng vi phạm quy chế của sinh viên. |
| 6 | **Room Search & Multi-parameter Filter Chips** | ✅ Hoàn thành (100%) | Thanh tìm kiếm thời gian thực theo tên phòng, tòa nhà, tầng và mô tả. Thanh chip cuộn ngang lọc nhanh theo Tòa nhà và chip nhanh *Chỉ phòng còn chỗ*. Modal bộ lọc chuyên sâu lọc theo sức chứa (*Bất kỳ, 10+, 20+, 30+, 40+ chỗ*) và trang thiết bị tiện nghi. |
| 7 | **60fps FlatList Feed with Room Cards** | ✅ Hoàn thành (100%) | Tối ưu hóa hiệu năng render danh sách phòng học: Thẻ `RoomCard` được memoize với `React.memo`, cấu hình `initialNumToRender={6}`, `maxToRenderPerBatch={8}`, `windowSize={7}`, `removeClippedSubviews={true}` đảm bảo 60fps khi cuộn. |
| 8 | **Time-Slot Selector with Conflict Prevention** | ✅ Hoàn thành (100%) | Bộ chọn ngày trong tuần (*Hôm nay, Ngày mai, T2, T3...*) kết hợp lưới khung giờ học tập (1.5h/slot). Thuật toán **Conflict Prevention** 2 lớp kiểm tra trực tiếp trên Cloud Firestore: chống trùng phòng và chống trùng lịch cá nhân. |
| 9 | **My Bookings & QR Check-in Pass** | ✅ Hoàn thành (100%) | Quản lý phân loại lịch đặt theo tab: *Sắp tới*, *Đã học*, *Đã hủy*. Mỗi phiếu đặt có mã định danh và mã vé check-in duy nhất (ví dụ `SRB-7176`) kèm biểu tượng QR pass. Hỗ trợ hủy đặt phòng, tự động giải phóng khung giờ trên Firestore. |

---

## 3. TECHNICAL ARCHITECTURE & WORKFLOW

### 3.1. Luồng Hoạt Động & Kiểm Soát Xung Đột Lịch (Conflict Prevention Flow trên Firestore)

```
[ Người Dùng Chọn Phòng Học & Ngày Đặt ]
                 │
                 ▼
[ TanStack Query: useRoomSlotsQuery(roomId, date) ]
                 │ (Truy vấn collection 'bookings' trên Cloud Firestore)
                 ├──> Khung giờ đã có người đặt ──> Disable nút chọn (Hiển thị "Đã kín lịch")
                 └──> Khung giờ còn trống       ──> Cho phép chọn (Highlight "Đang chọn")
                                                        │
                                                        ▼ (Bấm "Xác Nhận Đặt Phòng")
                                     ┌──────────────────────────────────────┐
                                     │   FIRESTORE CONFLICT PREVENTION      │
                                     └──────────────────────────────────────┘
                                                        │
                       ┌────────────────────────────────┴────────────────────────────────┐
                       ▼                                                                 ▼
           [ Kiểm tra xung đột Phòng ]                                     [ Kiểm tra xung đột Sinh viên ]
    (Query Firestore: roomId + date + slotId)                       (Query Firestore: studentId + date + slotId)
                       │                                                                 │
          ┌────────────┴────────────┐                                       ┌────────────┴────────────┐
          ▼                         ▼                                       ▼                         ▼
      [ Có trùng ]             [ Không trùng ]                          [ Có trùng ]             [ Không trùng ]
          │                         │                                       │                         │
          ▼                         └───────────────────┬───────────────────┘                         ▼
   Báo lỗi Alert                                        │                                      Báo lỗi Alert
   "Khung giờ này vừa có người đặt!"                    ▼                               "Bạn đã có lịch khác cùng giờ!"
                                         [ HỢP LỆ: TẠO LỊCH ĐẶT MỚI ]
                                         • Lưu Document mới vào collection 'bookings'
                                         • Sinh mã vé check-in (SRB-xxxx)
                                         • Trạng thái: 'Upcoming'
                                                        │
                                                        ▼
                                         [ TanStack Query Cache Invalidation ]
                                         • queryClient.invalidateQueries(['slots'])
                                         • queryClient.invalidateQueries(['bookings'])
                                         • queryClient.invalidateQueries(['rooms'])
                                                        │
                                                        ▼
                                         [ Cập Nhật Giao Diện Tức Thì & Mở Vé QR ]
```

### 3.2. Cấu Trúc Mã Nguồn (Project Directory Structure)

```
Study Room Booking App/
├── package.json               # Cấu hình dependency, scripts (typecheck, test:conflict)
├── tsconfig.json              # TypeScript Strict Mode ("strict": true)
├── app.json                   # Cấu hình Expo Application
├── App.tsx                    # Root Provider (QueryClientProvider, SafeArea, Navigation)
├── test-conflict.ts           # Kịch bản kiểm thử tự động thuật toán Conflict Prevention
├── README.md                  # Hướng dẫn chi tiết dự án
├── REPORT.md                  # Báo cáo kỹ thuật tổng kết dự án
└── src/
    ├── config/                # Cấu hình kết nối Google Firebase (Auth & Firestore)
    │   └── firebase.ts
    ├── services/              # Tầng tương tác backend
    │   ├── authService.ts     # Đăng ký, đăng nhập Email/Password với Firebase Auth
    │   └── firestoreService.ts# CRUD phòng học, kiểm tra xung đột & đặt phòng trên Firestore
    ├── types/                 # Kiểu dữ liệu chặt chẽ (Strict Types)
    │   ├── room.ts            # Interface Room, Building, Amenity, RoomFilterState
    │   ├── booking.ts         # Interface Booking, TimeSlot, CreateBookingPayload
    │   └── navigation.ts      # Type RootStackParamList, BottomTabParamList (React Navigation 7)
    ├── theme/
    │   └── colors.ts          # Bảng mã màu chuẩn Campus (Primary Blue, Emerald, Rose, Slate)
    ├── api/                   # Tầng dịch vụ dữ liệu & Server Cache
    │   ├── mockData.ts        # Dữ liệu hạt giống các phòng học VKU và lịch ban đầu
    │   ├── roomService.ts     # Dịch vụ tìm kiếm, lọc phòng học theo tiêu chí
    │   ├── bookingService.ts  # Động cơ kiểm tra xung đột 2 lớp
    │   └── queries.ts         # TanStack Query hooks kết nối Firestore
    ├── store/                 # Zustand Stores (Client State)
    │   ├── useFilterStore.ts  # Quản lý từ khóa, tòa nhà, sức chứa, tiện ích đã chọn
    │   └── useUserStore.ts    # Quản lý thông tin tài khoản, phân quyền Student/Admin
    ├── components/            # UI Components tái sử dụng
    │   ├── RoomCard.tsx       # Thẻ hiển thị phòng tối ưu 60fps (React.memo)
    │   ├── StatusBadge.tsx    # Huy hiệu trạng thái Còn chỗ / Hết chỗ / Bảo trì
    │   ├── FilterChipBar.tsx  # Thanh cuộn chip lọc nhanh kèm nút [Bộ lọc ▾]
    │   ├── FilterModal.tsx    # Modal lọc đa tiêu chí chuyên sâu
    │   ├── TimeSlotPicker.tsx # Bộ chọn ngày và lưới khung giờ trực quan
    │   └── BookingSuccessModal.tsx # Hộp thoại xác nhận kèm vé QR Check-in
    ├── navigation/            # Điều hướng ứng dụng
    │   ├── BottomTabNavigator.tsx # 3 Tabs Sinh viên hoặc 4 Tabs Admin
    │   └── RootNavigator.tsx  # Điều hướng giữa Auth Stack và App Stack
    └── screens/               # Màn hình chính
        ├── LoginScreen.tsx         # Màn hình đăng nhập & 1-click Demo Login
        ├── RegisterScreen.tsx      # Màn hình đăng ký có chọn vai trò (Student / Admin)
        ├── AdminDashboardScreen.tsx# Bảng điều khiển quản trị viên Campus
        ├── BrowseRoomsScreen.tsx   # Màn hình tìm kiếm và danh sách phòng 60fps
        ├── RoomDetailsScreen.tsx   # Màn hình chi tiết, chọn khung giờ và đặt phòng
        ├── MyBookingsScreen.tsx    # Màn hình quản lý lịch đặt & vé QR
        └── ProfileScreen.tsx       # Màn hình hồ sơ sinh viên & chuyển đổi vai trò
```

---

## 4. BẰNG CHỨNG KIỂM THỬ THỰC NGHIỆM (VERIFICATION & EVIDENCE)

### 4.1. Kiểm thử TypeScript Strict Mode (`npm run typecheck`)
Chạy lệnh kiểm tra tính toàn vẹn kiểu dữ liệu của toàn bộ dự án:
```bash
$ npm run typecheck
> study-room-booking-app@1.0.0 typecheck
> tsc --noEmit
# Kết quả: 0 lỗi biên dịch (Exit code: 0)
```

### 4.2. Kiểm thử tự động kết nối & thao tác Cloud Firestore
```text
--- Testing Firestore Rooms & Admin Flow ---
1. Fetching rooms from Firestore...
--- Đang khởi tạo dữ liệu phòng mẫu lên Firestore ---
✅ Đã nạp thành công các phòng mẫu lên Cloud Firestore!
✅ Loaded 8 room(s) from Cloud Firestore.

2. Admin adding a test room to Cloud Firestore...
✅ Room Created on Firestore! ID: tRDCFA8X2qponUoAYMKT

3. Admin updating room status to Maintenance...
✅ Updated Room Status: Maintenance

4. Admin cleaning up test room...
✅ Test Room Deleted successfully from Firestore.

--- FIRESTORE INTEGRATION VERIFIED 100% SUCCESSFULLY! ---
```

### 4.3. Kiểm thử tự động thuật toán Conflict Prevention (`npm run test:conflict`)
```text
--- Starting Conflict Prevention & Booking Tests ---
1. Checking initial slots for room-1 on date: 2026-09-17
Slot 08:00-09:30 isBooked: false

2. Student 1 books Lab A3-101 for 08:00-09:30...
Successfully booked! Booking ID: bk-1789634702936 Check-in Code: SRB-6177

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
Booking successful for Student 2! ID: bk-1789634704244

--- ALL CONFLICT PREVENTION TESTS PASSED SUCCESSFULLY! ---
```

---

## 5. KẾT LUẬN
Dự án **Mini-Project 2: Study Room Booking App** đã được nâng cấp toàn diện và hoàn thiện xuất sắc:
- Tích hợp chuẩn xác hệ sinh thái **Google Firebase Authentication & Cloud Firestore Database**.
- Xây dựng hoàn chỉnh **Bảng điều khiển Quản trị viên (Admin Dashboard)** với đầy đủ tính năng CRUD phòng học và giám sát lịch đặt phòng toàn trường.
- Hỗ trợ trải nghiệm người dùng tối ưu: 100% Tiếng Việt, hỗ trợ Demo Login 1-chạm thuận tiện cho việc trình bày và đánh giá sản phẩm.
