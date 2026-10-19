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
| `@eve/widget-piano` | Đàn piano |

Bảng mặc định gồm đếm ngược, đồng hồ, hành trình năm và một ghi chú năm mới. Âm lịch và đàn piano thêm từ menu bảng.

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
| `pnpm --filter dashboard run deploy` | Build, migrate nếu shell có `DATABASE_URL`, rồi deploy Cloudflare Worker |

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

Từ thư mục gốc. Lệnh build checkout hiện tại rồi đẩy Worker `eve-dashboard` lên Cloudflare. Không push git.

```bash
pnpm --filter dashboard run deploy
```

Trong `apps/dashboard` lệnh chạy lần lượt `vite build`, `node scripts/migrate.mjs`, rồi `wrangler deploy`. Wrangler đọc `dist/server/wrangler.json`, file này sinh từ `wrangler.jsonc`. Cần Wrangler 4 đã đăng nhập:

```bash
pnpm --filter dashboard exec wrangler whoami
```

### Postgres

`DATABASE_URL` của Worker là secret, không ghi trong `wrangler.jsonc`. Dùng chuỗi pooled (host có `-pooler`):

```bash
pnpm --filter dashboard exec wrangler secret put DATABASE_URL
```

Secret đó không vào bước migrate. `scripts/migrate.mjs` chỉ thấy `DATABASE_URL` của process đang build, và không tự đọc `.env`.

- Shell không có biến: log `[migrate] DATABASE_URL not set — skipping`. Schema Postgres giữ nguyên. Worker vẫn dùng secret đã gắn. Chưa từng gắn secret thì Worker chạy PGLite và tự áp `migrations/` lúc khởi động.
- Muốn áp migration trong lần deploy: đưa chuỗi unpooled vào shell. File `.env` ở gốc (không commit) có `DATABASE_URL` cho Worker và `DATABASE_URL_UNPOOLED` cho migrate.

```bash
set -a && source .env && set +a
DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm --filter dashboard run deploy
```

### Auth

Better Auth tại `/api/auth/*`, ủy quyền sang Grok auth broker.

`VITE_AUTH_ENABLED` được Vite gắn lúc build. Giá trị `false` tắt đăng nhập. Đặt biến trước lệnh deploy. Secret gắn sau build không đổi bundle client.

Bật auth: build với `VITE_AUTH_ENABLED=true`, rồi gắn các secret `DATABASE_URL`, `BETTER_AUTH_URL` (origin công khai của Worker), `BETTER_AUTH_SECRET`, `GROK_AUTH_ISSUER`, `GROK_AUTH_CLIENT_ID`, `GROK_AUTH_CLIENT_SECRET`.

```bash
pnpm --filter dashboard exec wrangler secret put BETTER_AUTH_URL
```

Auth tắt (`VITE_AUTH_ENABLED=false`) mà Worker có `DATABASE_URL` thì server từ chối user dev trên database thật.
