# Backend integration handoff

This folder is the Astro frontend only. The receiving developer can connect it to their own API without copying the original GameClub backend.

## Configure the API connection

Edit `public/backend-config.js`:

- Set `apiBase` to the API origin, such as `https://api.example.com`, when the browser talks to a separate API host. Keep it empty when the web host proxies `/api/*` and `/media/*` to the API.
- Update `rewritePath(pathname)` if the new API uses different URLs. It receives a path such as `/api/auth/login` and must return the path to request.
- Update `authScheme`, `credentials`, and `tokenKey` for the backend's session/auth approach. The default frontend sends a Bearer token stored in local storage.
- Update `loginPayload`, `registerPayload`, and `accessToken` if login/register request or response fields differ.

Astro server rendering calls the API directly. Set `GAMECLUB_BACKEND_URL` to a backend address reachable from the Astro server. The browser uses `public/backend-config.js`; configure both values for production. If browser and API use separate origins, configure the backend CORS policy for the exact website origin and allow `Authorization` and `Content-Type` headers. Cookie sessions require `credentials: "include"`, matching backend CORS credentials, and appropriate cookie settings.

## Frontend API contract

The existing screens use these routes and data fields. Either expose compatible routes from the new backend or adapt the frontend calls and response handling.

| Feature | Default API calls | Fields used by the frontend |
| --- | --- | --- |
| Auth | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` | Login token; user `id`, `username`, `display_name`, `is_admin` |
| Articles | `GET /api/articles?page=1&page_size=20`, `GET /api/articles/{slug}` | `{items,total}` list; article `id`, `slug`, `title`, `excerpt`, `body`, `image`, `category`, `author`, `published_at` |
| Groups | `GET /api/groups`, `GET /api/groups/{slug}`, `/members`, `/membership`, `/posts` | Group `id`, `slug`, `name`, `description`, `member_count`, `topic_count`, `is_private`; member role and user fields |
| Group activity | `POST /api/groups/{id}/join`, `/leave`, `/posts`; `GET/POST /api/discussions/{id}/replies`; delete/edit discussion routes | Post `id`, `slug`, `title`, `body`, `user`, `reply_count`, `age`; reply author/body/time |
| Social account | `/api/profile`, `/api/users`, `/api/friends`, `/api/messages/{peer_id}` | Profile `display_name`, `username`, `bio`; social user IDs, names, avatar and friendship state |
| Management | `/api/admin/articles`, `/api/admin/groups`, `/api/admin/discussions`, `/api/admin/reports`, `/api/admin/media/upload` | Admin checks use `is_admin`; media upload returns a public `url` |
| Other | `/api/newsletter`, `/api/search`, `/api/health`, `/rss.xml` | Newsletter confirmation, search results, health status, RSS 2.0 |

The UI expects JSON for API responses except uploads and RSS. The article list expects an object with an `items` array and `total`; groups, members, posts, and replies are generally arrays. `public/backend-config.js` adapts API origins and paths plus login/register payload and token fields. For different article, group, member, post, or profile response shapes, normalize those responses in the affected calls in `src/lib/api.ts` and page scripts in `src/pages/`.

## Important integration notes

- This Astro project is server-rendered with the Node adapter. Build with `npm ci && npm run build`, then start with `npm start`.
- Same-origin API/media/RSS proxy routes are in `src/pages/api/`, `src/pages/media/`, and `src/pages/rss*.ts`; those use `GAMECLUB_BACKEND_URL`.
- Browser scripts also use relative `/api/*` and `/media/*` paths. `public/backend-config.js` rewrites these requests to `apiBase` and can map their paths.
- Image and media fields should be absolute URLs, or the frontend host should proxy `/media/*` to the backend so normal `<img>` elements can load them.
- Auth currently uses local-storage tokens and Bearer authorization by default. Review the auth flow before switching to cookies or a different token lifecycle.
- Admin, moderation, group posting, replies, social features, and media upload need matching backend permissions and response contracts.
