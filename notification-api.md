# Notification API — Frontend Integration Guide

## Overview

In-app notification system cho phép hiển thị thông báo real-time (polling-based) đến người dùng khi có các sự kiện liên quan đến họ trong hệ thống.

**Base path:** `/notifications`  
**Authentication:** Tất cả endpoint đều yêu cầu `Authorization: Bearer <jwt_token>`

---

## Notification Object

Đây là cấu trúc object notification trả về từ tất cả các endpoint:

```ts
type Notification = {
  id: string;           // UUID
  recipientAddress: string;
  type: NotificationType;
  payload: NotificationPayload; // shape phụ thuộc vào type, xem bên dưới
  isRead: boolean;
  createdAt: string;    // ISO 8601
  readAt: string | null;
};
```

### Notification Types & Payload

| `type` | Mô tả | Payload |
|---|---|---|
| `comment_replied` | Có người reply vào comment của bạn | `{ replyId, replyAuthorAddress, commentId, proposalId }` |
| `proposal_commented` | Có người comment vào proposal của bạn | `{ commentId, commenterAddress, proposalId }` |
| `comment_upvoted` | Comment của bạn được upvote | `{ commentId, proposalId, voterAddress, currentUpvotes }` |
| `comment_deleted` | Comment của bạn bị moderator xoá | `{ commentId, proposalId, deletedByAddress, deletedByRole }` |
| `user_banned` | Tài khoản của bạn bị ban | `{ moderatorAddress, reason, expiresAt }` |

```ts
type NotificationType =
  | 'comment_replied'
  | 'proposal_commented'
  | 'comment_upvoted'
  | 'comment_deleted'
  | 'user_banned';

type NotificationPayload =
  | { replyId: string; replyAuthorAddress: string; commentId: string; proposalId: string }
  | { commentId: string; commenterAddress: string; proposalId: string }
  | { commentId: string; proposalId: string; voterAddress: string; currentUpvotes: number }
  | { commentId: string; proposalId: string; deletedByAddress: string; deletedByRole: string }
  | { moderatorAddress: string; reason: string | null; expiresAt: string | null };
```

---

## Endpoints

### 1. Lấy danh sách notifications

```
GET /notifications
```

**Query params:**

| Param | Type | Required | Default | Mô tả |
|---|---|---|---|---|
| `page` | number | No | `1` | Trang hiện tại |
| `limit` | number | No | `10` | Số item mỗi trang (tối đa 100) |
| `isRead` | boolean | No | — | Lọc theo trạng thái đọc. Bỏ qua param này để lấy tất cả |

**Response `200`:**

```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "recipientAddress": "0xabc...123",
      "type": "comment_replied",
      "payload": {
        "replyId": "uuid",
        "replyAuthorAddress": "0xdef...456",
        "commentId": "uuid",
        "proposalId": "uuid"
      },
      "isRead": false,
      "createdAt": "2026-05-26T10:00:00.000Z",
      "readAt": null
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "itemCount": 5,
    "totalItems": 23,
    "totalPages": 3
  }
}
```

---

### 2. Lấy số lượng notification chưa đọc

Dùng endpoint này để **polling** badge số đỏ trên icon bell.

```
GET /notifications/unread-count
```

**Response `200`:**

```json
{
  "count": 7
}
```

---

### 3. Đánh dấu đã đọc một notification

```
PATCH /notifications/:id/read
```

**Params:** `id` — UUID của notification

**Response `204 No Content`** — không có body.

> Nếu notification không thuộc về user đang đăng nhập → `404 Not Found`.

---

### 4. Đánh dấu đã đọc tất cả

```
PATCH /notifications/read-all
```

**Response `204 No Content`** — không có body.

---

## Suggested Implementation

### Polling unread count

Backend hiện tại chưa có WebSocket, FE cần polling để cập nhật badge.

```ts
// Gợi ý: poll mỗi 30 giây khi user đang active
const POLL_INTERVAL = 30_000;

function startNotificationPolling(onCount: (count: number) => void) {
  const fetchCount = async () => {
    const res = await fetch('/notifications/unread-count', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { count } = await res.json();
    onCount(count);
  };

  fetchCount(); // fetch ngay lập tức lần đầu
  return setInterval(fetchCount, POLL_INTERVAL);
}
```

### Đọc notification + điều hướng

Khi user click vào một notification, cần:
1. Gọi `PATCH /notifications/:id/read`
2. Điều hướng đến trang tương ứng dựa vào `type` và `payload`

```ts
async function handleNotificationClick(notification: Notification) {
  // Không cần await — fire and forget
  markAsRead(notification.id);

  switch (notification.type) {
    case 'comment_replied':
    case 'proposal_commented':
    case 'comment_upvoted':
    case 'comment_deleted':
      navigate(`/proposals/${notification.payload.proposalId}`);
      break;
    case 'user_banned':
      navigate('/account/status');
      break;
  }
}
```

### Render notification text

```ts
function getNotificationText(notification: Notification): string {
  const p = notification.payload;
  switch (notification.type) {
    case 'comment_replied':
      return `${shortenAddress(p.replyAuthorAddress)} đã trả lời comment của bạn`;
    case 'proposal_commented':
      return `${shortenAddress(p.commenterAddress)} đã bình luận vào proposal của bạn`;
    case 'comment_upvoted':
      return `Comment của bạn nhận được upvote (tổng: ${p.currentUpvotes})`;
    case 'comment_deleted':
      return `Comment của bạn đã bị xoá bởi moderator`;
    case 'user_banned':
      return p.reason
        ? `Tài khoản của bạn bị ban: ${p.reason}`
        : `Tài khoản của bạn đã bị ban`;
  }
}
```

---

## Error Responses

| HTTP Status | Mô tả |
|---|---|
| `401 Unauthorized` | Thiếu hoặc token không hợp lệ |
| `404 Not Found` | Notification không tồn tại hoặc không thuộc về user hiện tại |

---

## Notes

- `limit` tối đa là **100**, vượt quá sẽ bị clamp về 100.
- Notifications được sort theo `createdAt DESC` — mới nhất lên trước.
- Khi mark as read một notification đã `isRead = true`, API vẫn trả `204` (idempotent).
- `comment_upvoted` có thể tạo nhiều notification cho cùng một comment nếu un-upvote rồi upvote lại — FE nên group hoặc hiển thị notification gần nhất.
