# Eve

Bảng widget trên trình duyệt. Giao diện tiếng Việt và tiếng Anh — “Bảng widget của bạn”.

Kéo thả, đổi kích thước, thêm hoặc xóa widget trên lưới. Bố cục, ngôn ngữ, font và nền lưu trong trình duyệt.

Bản đang chạy: https://eve-dashboard.thehoinguyen.workers.dev

## Widget

| Gói | Widget |
| --- | --- |
| `@eve/widget-countdown` | Đếm ngược năm mới (dương lịch hoặc Tết) |
| `@eve/widget-clock` | Đồng hồ |
| `@eve/widget-lunar` | Âm lịch |
| `@eve/widget-progress` | Hành trình năm |
| `@eve/widget-note` | Ghi chú |

Bảng mặc định gồm đếm ngược, đồng hồ, hành trình năm và một ghi chú năm mới. Âm lịch thêm từ menu bảng.

## Chạy local

Cần [pnpm](https://pnpm.io) 11.1 (`packageManager` trong `package.json`).

```bash
pnpm install
pnpm dev
```

Mở http://localhost:8080. Cổng này cố định.

Đăng nhập tắt mặc định (`VITE_AUTH_ENABLED=false`). Local dùng PGLite, nên bảng chạy được khi chưa có Postgres.

## Lệnh

Chạy từ thư mục gốc:

| Lệnh | Việc làm |
| --- | --- |
| `pnpm dev` | Dev server, cổng 8080 |
| `pnpm build` | Build dashboard |
| `pnpm --filter dashboard preview` | Phục vụ bản build, cổng 8081 |
| `pnpm typecheck` | Typecheck toàn workspace |
| `pnpm test` | Test toàn workspace |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm --filter dashboard deploy` | Build, migrate, rồi deploy Cloudflare Worker |

## Cấu trúc

```
apps/dashboard          ứng dụng TanStack Start, deploy lên Cloudflare Workers
packages/widget-sdk     hợp đồng plugin và registry
packages/dashboard-host host context và error boundary cho từng widget
packages/ui             component dùng chung
packages/widget-shared  âm lịch và múi giờ
packages/widget-*       mỗi widget một package
```

Copy giao diện bảng nằm ở `apps/dashboard/src/lib/i18n.ts`. Plugin first-party đăng ký ở `apps/dashboard/src/plugins/catalog.ts`.

## Plugin

Một widget là một `WidgetPlugin`: `type`, `version`, tên hiển thị theo `vi` hoặc `en`, kích thước mặc định, `defaultConfig`, `parseConfig`, component `Widget`, và `Settings` khi widget có form cài đặt.

`parseConfig` luôn trả về config hợp lệ. Dữ liệu lưu hỏng thì trả về `defaultConfig()`.

Plugin chỉ nói chuyện với bảng qua host API: locale, múi giờ, chế độ sửa, và `updateConfig` của đúng instance. Host bọc mỗi widget trong một error boundary.

## Bảng

- Lưới mặc định 12 cột. Menu chọn 4, 6, 8 hoặc 12.
- Mật độ: thoáng, vừa, đặc.
- Menu bảng là nút tròn dưới giữa màn hình: sửa, thêm widget, ngôn ngữ, cột, mật độ, font, nền, múi giờ, đặt lại bảng.
- Đặt lại bảng khôi phục bố cục mặc định. Font và nền giữ nguyên.
- Trạng thái lưu local, key `eve-board-v1`.

## Deploy

Worker tên `eve-dashboard`.

```bash
pnpm --filter dashboard deploy
```

`DATABASE_URL` là Wrangler secret (chuỗi kết nối Postgres pooled):

```bash
pnpm --filter dashboard exec wrangler secret put DATABASE_URL
```

Khi secret này trống, bước migrate bỏ qua và app dùng PGLite.

Auth là Better Auth tại `/api/auth/*`, ủy quyền sang Grok auth broker. Bản deploy bật auth bằng `VITE_AUTH_ENABLED=true`, cùng `GROK_AUTH_*`, `BETTER_AUTH_URL` và `DATABASE_URL`.
