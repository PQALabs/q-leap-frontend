# BE Update Request — `authorRole` in Comment/Reply Response

## Context

Frontend cần biết role của tác giả comment/reply để hiển thị đúng quyền ban trong dropdown menu.

**Logic hiện tại (FE):**
- Admin → có thể ban `user` và `moderator`
- Moderator → có thể ban `user` chỉ
- Không ai có thể ban chính mình
- Admin không thể ban admin đồng cấp
- Moderator không thể ban moderator đồng cấp

Để check các rule trên phía FE, cần biết role của người viết comment. Hiện tại `IForumComment` không có field này.

---

## Yêu cầu

### Thêm `authorRole` vào response của 2 endpoint:

**1. `GET /forum/proposals/:proposalId/comments`**

**2. `GET /forum/proposals/:proposalId/comments/:commentId/replies`**

### Thay đổi response shape

Mỗi comment/reply object trong mảng `data` cần có thêm field:

```diff
{
  "id": "...",
  "proposalId": "...",
  "parentCommentId": null,
  "authorAddress": "0xabc...",
+ "authorRole": "user",
  "contentMarkdown": "...",
  "contentHtml": "...",
  "upvotes": 0,
  "replyCount": 0,
  "editedCount": 0,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "deletedAt": null
}
```

### Type của `authorRole`

```ts
authorRole: 'user' | 'moderator' | 'admin'
```

Lấy từ bảng `users` (hoặc bảng tương đương) join theo `authorAddress`.

---

## Lưu ý

- Field này **không cần auth** — public response, vì list comments đã là public.
- Nếu `authorAddress` không tồn tại trong bảng users, fallback về `'user'`.
- Áp dụng cho cả **top-level comments** và **nested replies** (cùng một endpoint replies).
