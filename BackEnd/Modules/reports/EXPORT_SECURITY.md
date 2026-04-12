# CSV Export Security Notes

## Access
- Admin-only via `isAdmin` middleware on the route — not enforced at service level.

## CSV Injection
- Cells are trimmed then checked for formula triggers (`=` `+` `-` `@`).
- Dangerous cells are prefixed with `\t` — spreadsheet apps treat them as plain text.
- Ref: https://owasp.org/www-community/attacks/CSV_Injection

## Response Headers
- `Content-Disposition: attachment` — forces download, prevents inline rendering.
- `X-Content-Type-Options: nosniff` — prevents MIME-sniffing CSV as HTML.
- Filename is stripped of non-ASCII and quotes before embedding in the header.

## Performance
- Date range capped at 93 days, row count at 5,000.
- DB fetched in batches of 500, streamed directly to the response — no full dataset in memory.

## Streams
- `pipeline()` destroys all streams on error or client disconnect.
- `res.headersSent` checked on error — if streaming started, can't send a JSON response.
