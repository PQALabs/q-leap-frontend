# BE Update Request — `GET /moderation/addresses/:address/ban`

## Context

FE cần kiểm tra trạng thái ban của user hiện tại **trước khi** họ click vào nút Comment hoặc Reply. Nếu user đang bị ban, FE sẽ show dialog thông báo thay vì mở form comment.

Hiện tại chỉ có endpoint `GET /moderation/addresses/banned` trả về toàn bộ danh sách — endpoint này dành cho moderator/admin. FE cần một endpoint riêng để user tự kiểm tra trạng thái ban của chính mình (hoặc bất kỳ address nào).

---

## Yêu cầu

### Thêm endpoint mới:

**`GET /moderation/addresses/:address/ban`**

### Auth

- Endpoint này nên **public** (không bắt buộc token), vì:
  - User chưa đăng nhập cũng có thể bị ban
  - Thông tin ban của một address là public (không nhạy cảm)
- Nếu cần giới hạn, có thể yêu cầu token hợp lệ — FE sẽ gửi kèm header `Authorization: Bearer <token>` nếu có.

### Response khi address **đang bị ban**

**HTTP 200**

```json
{
  "meta": {
    "code": 200,
    "message": "OK"
  },
  "data": {
    "address": "0xabc123...",
    "bannedAt": "2025-01-10T08:00:00.000Z",
    "expiresAt": "2025-06-01T00:00:00.000Z",
    "reason": "Spam",
    "bannedBy": "0xmoderator..."
  }
}
```

- `expiresAt`: ISO 8601 string nếu là temporary ban, `null` nếu là permanent ban.
- `reason`: string hoặc `null` nếu không có lý do.

### Response khi address **không bị ban** (hoặc ban đã hết hạn)

**HTTP 404**

```json
{
  "meta": {
    "code": 404,
    "message": "Address is not banned"
  },
  "data": null
}
```

> FE xử lý 404 là "không bị ban" — user được phép comment bình thường.

---

## Lưu ý

- Nếu `expiresAt` đã qua ngày hiện tại, trả về **404** (coi như không còn bị ban). FE không tự tính toán expiry.
- Endpoint chỉ cần đọc (GET), không có side effect.
- Reuse logic từ `POST /moderation/addresses/:address/ban` để tìm record trong DB.
