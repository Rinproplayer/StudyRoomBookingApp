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
  * **Vai trò:** Toàn bộ kiến trúc hệ thống, Lập trình Mobile (React Native + Expo), Quản trị State & UI/UX — Đóng góp: 100%
* **💻 GitHub Repository:** [https://github.com/Rinproplayer/StudyRoomBookingApp.git](https://github.com/Rinproplayer/StudyRoomBookingApp.git)
* **📱 Nền tảng thực nghiệm:** React Native + Expo (Managed SDK 57), iOS (Expo Go) & Android, Web Preview

---

## 2. FEATURE IMPLEMENTATION CHECKLIST & REQUIREMENTS

| # | Yêu Cầu Kỹ Thuật (Requirements) | Trạng Thái | Chi Tiết Hiện Thực & Mức Độ Đáp Ứng |
|:---:|---|:---:|---|
| 1 | **Framework & Language: React Native + Expo (Managed) & TypeScript Strict Mode** | ✅ Hoàn thành (100%) | Dự án khởi tạo với Expo Managed SDK 57, cấu hình `"strict": true` trong `tsconfig.json`. Toàn bộ định nghĩa kiểu dữ liệu (`Room`, `Booking`, `TimeSlot`, `Building`, `Amenity`, `Navigation`) được kiểm tra bằng lệnh `npm run typecheck` đạt 0 lỗi. |
| 2 | **Navigation: React Navigation 7 (Stack + Tabs)** | ✅ Hoàn thành (100%) | Tích hợp thư viện mới nhất `@react-navigation/native` v7, `@react-navigation/bottom-tabs` v7 và `@react-navigation/native-stack` v7. Hệ thống Bottom Tabs chuẩn wireframe gồm 3 màn hình: **Tìm phòng (Browse Rooms)**, **Lịch đặt (My Bookings)**, **Cá nhân (Profile)** kết hợp Native Stack Modal chuyển cảnh mượt mà đến màn hình **Chi tiết phòng & Đặt chỗ (RoomDetailsScreen)**. |
| 3 | **State Management: Zustand (Client) + TanStack Query (Server)** | ✅ Hoàn thành (100%) | Phân định ranh giới kiến trúc rõ ràng: **Zustand** quản lý trạng thái client-side (từ khóa tìm kiếm, bộ lọc chip đa tiêu chí, hồ sơ sinh viên Alex Nguyễn); **TanStack Query** quản lý trạng thái server-side (caching danh sách phòng học, query slots theo ngày, mutation đặt phòng và tự động invalidation cache để làm mới dữ liệu). |
| 4 | **Room Search & Multi-parameter Filter Chips** | ✅ Hoàn thành (100%) | Thanh tìm kiếm thời gian thực theo tên phòng, tòa nhà, tầng và mô tả. Thanh chip cuộn ngang lọc nhanh theo Tòa nhà (*Tòa nhà A3, Thư viện Trung tâm, Khu Công nghệ, Giảng đường Khoa học, Không gian Sáng tạo*) và chip nhanh *Chỉ phòng còn chỗ*. Modal bộ lọc chuyên sâu cho phép lọc theo sức chứa (*Bất kỳ, 10+, 20+, 30+, 40+ chỗ*) và trang thiết bị (*Wi-Fi, Bảng trắng, Máy chiếu 4K, Điều hòa, Phòng cách âm, Màn hình kép, Họp trực tuyến...*). |
| 5 | **60fps FlatList Feed with Room Cards** | ✅ Hoàn thành (100%) | Tối ưu hóa hiệu năng render danh sách phòng học: Thẻ `RoomCard` được memoize với `React.memo`, cấu hình `initialNumToRender={6}`, `maxToRenderPerBatch={8}`, `windowSize={7}`, `removeClippedSubviews={true}` đảm bảo tốc độ khung hình ổn định 60fps khi cuộn. Thẻ hiển thị đúng Wireframe: 📷 Ảnh phòng, Tên phòng, 📍 Tòa nhà, 👥 Số chỗ ngồi, Trạng thái ✅ **Còn chỗ** / 🔴 **Hết chỗ** (`StatusBadge`). |
| 6 | **Time-Slot Selector with Conflict Prevention** | ✅ Hoàn thành (100%) | Bộ chọn ngày trong tuần (*Hôm nay, Ngày mai, T2, T3...*) kết hợp lưới khung giờ học tập (1.5h/slot). Khung giờ đã được đặt sẽ bị vô hiệu hóa (disabled), gạch ngang và nhãn đỏ *Đã kín lịch*. Thuật toán **Conflict Prevention** 2 lớp: ngăn chặn đặt phòng bị trùng giờ và ngăn chặn cùng 1 sinh viên đặt 2 phòng trong cùng một khung giờ. |
| 7 | **My Bookings & QR Check-in Pass** | ✅ Hoàn thành (100%) | Quản lý phân loại lịch đặt theo tab: *Sắp tới*, *Đã học*, *Đã hủy*. Mỗi phiếu đặt có mã định danh và mã vé check-in duy nhất (ví dụ `SRB-7176`) kèm biểu tượng QR pass. Hỗ trợ tính năng hủy đặt phòng, lập tức giải phóng khung giờ trên hệ thống cho sinh viên khác. |

---

## 3. TECHNICAL ARCHITECTURE & WORKFLOW

### 3.1. Luồng Hoạt Động & Kiểm Soát Xung Đột Lịch (Conflict Prevention Flow)

```
[ Người Dùng Chọn Phòng Học & Ngày Đặt ]
                 │
                 ▼
[ TanStack Query: useRoomSlotsQuery(roomId, date) ]
                 │
                 ├──> Khung giờ đã có người đặt ──> Disable nút chọn (Hiển thị "Đã kín lịch")
                 └──> Khung giờ còn trống       ──> Cho phép chọn (Highlight "Đang chọn")
                                                        │
                                                        ▼ (Bấm "Xác Nhận Đặt Phòng")
                                     ┌──────────────────────────────────────┐
                                     │   CONFLICT PREVENTION ENGINE         │
                                     └──────────────────────────────────────┘
                                                        │
                       ┌────────────────────────────────┴────────────────────────────────┐
                       ▼                                                                 ▼
           [ Kiểm tra xung đột Phòng ]                                     [ Kiểm tra xung đột Sinh viên ]
    (Phòng đã có lịch 'Upcoming' trong slot?)                       (Sinh viên đã có lịch khác trong cùng slot?)
                       │                                                                 │
          ┌────────────┴────────────┐                                       ┌────────────┴────────────┐
          ▼                         ▼                                       ▼                         ▼
      [ Có trùng ]             [ Không trùng ]                          [ Có trùng ]             [ Không trùng ]
          │                         │                                       │                         │
          ▼                         └───────────────────┬───────────────────┘                         ▼
   Báo lỗi Alert                                        │                                      Báo lỗi Alert
   "Khung giờ này vừa có người đặt!"                    ▼                               "Bạn đã có lịch khác cùng giờ!"
                                         [ HỢP LỆ: TẠO LỊCH ĐẶT MỚI ]
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
    ├── types/                 # Kiểu dữ liệu chặt chẽ (Strict Types)
    │   ├── room.ts            # Interface Room, Building, Amenity, RoomFilterState
    │   ├── booking.ts         # Interface Booking, TimeSlot, CreateBookingPayload
    │   └── navigation.ts      # Type RootStackParamList, BottomTabParamList (React Navigation 7)
    ├── theme/
    │   └── colors.ts          # Bảng mã màu chuẩn Campus (Primary Blue, Emerald, Rose, Slate)
    ├── api/                   # Tầng dịch vụ dữ liệu & Server Cache
    │   ├── mockData.ts        # Dữ liệu hạt giống các phòng học VKU và lịch ban đầu
    │   ├── roomService.ts     # Dịch vụ tìm kiếm, lọc phòng học theo tiêu chí
    │   ├── bookingService.ts  # Động cơ tạo lịch, kiểm tra xung đột 2 lớp, hủy lịch
    │   └── queries.ts         # TanStack Query hooks (useRoomsQuery, useRoomSlotsQuery, mutations)
    ├── store/                 # Zustand Stores (Client State)
    │   ├── useFilterStore.ts  # Quản lý từ khóa, tòa nhà, sức chứa, tiện ích đã chọn
    │   └── useUserStore.ts    # Quản lý thông tin sinh viên, tùy chọn thông báo
    ├── components/            # UI Components tái sử dụng
    │   ├── RoomCard.tsx       # Thẻ hiển thị phòng tối ưu 60fps (React.memo)
    │   ├── StatusBadge.tsx    # Huy hiệu trạng thái Còn chỗ / Hết chỗ
    │   ├── FilterChipBar.tsx  # Thanh cuộn chip lọc nhanh kèm nút [Bộ lọc ▾]
    │   ├── FilterModal.tsx    # Modal lọc đa tiêu chí chuyên sâu
    │   ├── TimeSlotPicker.tsx # Bộ chọn ngày và lưới khung giờ trực quan
    │   └── BookingSuccessModal.tsx # Hộp thoại xác nhận kèm vé QR Check-in
    ├── navigation/            # Điều hướng ứng dụng
    │   ├── BottomTabNavigator.tsx # 3 Tabs: Tìm phòng, Lịch đặt, Cá nhân
    │   └── RootNavigator.tsx  # Native Stack điều hướng giữa Tabs và RoomDetails
    └── screens/               # Màn hình chính
        ├── BrowseRoomsScreen.tsx   # Màn hình tìm kiếm và danh sách phòng 60fps
        ├── RoomDetailsScreen.tsx   # Màn hình chi tiết, chọn khung giờ và đặt phòng
        ├── MyBookingsScreen.tsx    # Màn hình quản lý lịch đặt & vé QR
        └── ProfileScreen.tsx       # Màn hình hồ sơ sinh viên & thống kê giờ học
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

### 4.2. Kiểm thử tự động thuật toán Conflict Prevention (`npm run test:conflict`)
Thực thi bộ test script tự động [`test-conflict.ts`](file:///d:/Study%20Room%20Booking%20App/test-conflict.ts) kiểm nghiệm toàn diện các kịch bản đặt phòng và xung đột:
```text
--- Starting Conflict Prevention & Booking Tests ---
1. Checking initial slots for room-1 on date: 2026-09-17
Slot 08:00-09:30 isBooked: false

2. Student 1 books Lab A3-101 for 08:00-09:30...
Successfully booked! Booking ID: bk-1789631470051 Check-in Code: SRB-4170

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
Booking successful for Student 2! ID: bk-1789631471377

--- ALL CONFLICT PREVENTION TESTS PASSED SUCCESSFULLY! ---
```

---

## 5. THÁCH THỨC KỸ THUẬT & GIẢI PHÁP (CHALLENGES & RESOLUTIONS)

### Thách thức 1: Đảm bảo hiệu năng cuộn mượt 60fps trên FlatList với số lượng phòng học lớn
* **Vấn đề:** Khi danh sách phòng học chứa nhiều dữ liệu, hình ảnh độ phân giải cao và các huy hiệu trạng thái, thao tác cuộn trên thiết bị di động rất dễ bị giật lag (drop frame) do re-render toàn bộ danh sách khi người dùng gõ từ khóa tìm kiếm.
* **Giải pháp:**
  1. Tách biệt `RoomCard` thành component độc lập và bọc bằng `React.memo` với hàm so sánh props.
  2. Áp dụng cơ chế windowing của React Native `FlatList`: `initialNumToRender={6}`, `maxToRenderPerBatch={8}`, `windowSize={7}`, `removeClippedSubviews={true}` để giải phóng bộ nhớ của các item nằm ngoài vùng hiển thị.

### Thách thức 2: Xử lý triệt để xung đột lịch đặt (Race Conditions & Double-Booking)
* **Vấn đề:** Trong môi trường thực tế, nguy cơ hai sinh viên cùng chọn một khung giờ còn trống và đồng thời bấm "Đặt phòng" có thể dẫn đến việc trùng lặp phòng. Đồng thời, một sinh viên có thể vô tình đặt 2 phòng khác nhau ở cùng một thời điểm.
* **Giải pháp:**
  1. **Dual-Layer Validation**: Xây dựng 2 lớp kiểm tra trong `bookingService.ts`. Lớp 1 kiểm tra xem phòng đó vào ngày/giờ đó đã có lịch `Upcoming` nào chưa. Lớp 2 kiểm tra sinh viên đó đã có lịch hẹn nào khác đang trùng khung giờ đó không.
  2. **Atomic Cache Invalidation**: Ngay khi đặt phòng thành công, kích hoạt `queryClient.invalidateQueries({ queryKey: ['slots'] })` để làm mới dữ liệu lưới giờ theo thời gian thực, đồng thời khóa khung giờ đó ngay trên màn hình.

### Thách thức 3: Kết hợp hài hòa giữa Zustand (Client State) và TanStack Query (Server State)
* **Vấn đề:** Nếu đưa toàn bộ dữ liệu vào một nơi duy nhất (như chỉ dùng Zustand hoặc chỉ dùng React State) sẽ gây khó khăn trong việc quản lý cache, tự động fetch lại khi có thay đổi hoặc làm phức tạp hóa logic tìm kiếm.
* **Giải pháp:**
  - **Zustand (`useFilterStore`)** chỉ phụ trách lưu trữ tiêu chí lọc của người dùng: từ khóa tìm kiếm `searchQuery`, tòa nhà `selectedBuilding`, sức chứa `minCapacity`, mảng tiện ích `selectedAmenities`.
  - **TanStack Query (`useRoomsQuery`)** nhận state từ Zustand làm `queryKey: ['rooms', filters]`. Nhờ đó, bất cứ khi nào người dùng bấm chọn một chip lọc, TanStack Query sẽ tự động tính toán lại kết quả tìm kiếm với cơ chế caching thông minh.

### Thách thức 4: Tương thích React Navigation 7 và React Native mới nhất
* **Vấn đề:** React Navigation phiên bản 7 có một số thay đổi về kiến trúc gõ kiểu (TypeScript param lists) và cách tổ chức header/tab bar so với phiên bản 6.
* **Giải pháp:** Sử dụng kiểu dữ liệu `NavigatorScreenParams<BottomTabParamList>` trong `RootStackParamList` để đảm bảo tính an toàn kiểu dữ liệu 100% khi điều hướng giữa các Tab con và màn hình Stack Modal.

---

## 6. KẾT LUẬN
Dự án **Mini-Project 2: Study Room Booking App** đã hoàn thành xuất sắc toàn bộ các tiêu chí đề ra:
- Đáp ứng chuẩn xác 100% công nghệ yêu cầu: **Expo Managed SDK 57, TypeScript Strict Mode, React Navigation 7, Zustand, TanStack Query**.
- Giao diện thân thiện, hiện đại, hỗ trợ 100% Tiếng Việt, bám sát từng chi tiết của bản thiết kế Wireframe.
- Hoạt động ổn định trên cả thiết bị di động thật và nền tảng Web.
