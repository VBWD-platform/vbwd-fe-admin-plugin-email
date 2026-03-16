# vbwd-fe-admin-plugin-email

**Email Admin Plugin** for the [vbwd-fe-admin](https://github.com/VBWD-platform/vbwd-fe-admin) backoffice.

Provides a full transactional email template management UI: browse all event-keyed templates, edit HTML and plain-text bodies, preview rendered output with example data, and send test emails to any address.

---

## Features

- **Template list** — sortable table of all event-type templates with Active/Inactive badges and bulk actions (activate, deactivate, export JSON, delete)
- **Template editor** — tabbed HTML / Plain Text / Preview editor with live rendering and an available-variables sidebar
- **Send test** — send a rendered test email to any address directly from the editor
- **Event type catalogue** — sidebar listing all 12 supported event types with their template variables
- **CodeMirror-style textarea** — syntax-highlighted editing for HTML bodies

---

## Event Types

| Event | Description |
|-------|-------------|
| `subscription.activated` | Paid subscription activated |
| `subscription.cancelled` | Subscription cancelled |
| `subscription.payment_failed` | Recurring payment failed |
| `subscription.renewed` | Subscription renewed |
| `subscription.expired` | Subscription expired |
| `trial.started` | Free trial started |
| `trial.expiring_soon` | Trial expiring in N days |
| `user.registered` | New user registered |
| `user.password_reset` | Password reset requested |
| `invoice.created` | New invoice created |
| `invoice.paid` | Invoice paid |
| `contact_form.received` | Contact form submitted |

---

## Routes

| Path | Name | View |
|------|------|------|
| `/admin/email/templates` | `email-templates` | `EmailTemplateList.vue` |
| `/admin/email/templates/new` | `email-template-new` | `EmailTemplateEdit.vue` |
| `/admin/email/templates/:id/edit` | `email-template-edit` | `EmailTemplateEdit.vue` |

All routes are registered under the admin router prefix by the plugin SDK.

---

## Plugin Structure

```
plugins/email-admin/
├── index.ts                        # Plugin entry point (IPlugin)
├── locales/
│   └── en.json                     # English translations (email.* keys)
├── src/
│   ├── components/
│   │   └── CodeEditor.vue          # Syntax-highlighted textarea wrapper
│   ├── stores/
│   │   └── useEmailStore.ts        # Pinia store — templates, preview, send-test
│   └── views/
│       ├── EmailTemplateList.vue   # Sortable/filterable template table
│       └── EmailTemplateEdit.vue   # Tabbed editor + preview + test send
└── tests/
    └── unit/
        ├── emailAdminPlugin.spec.ts  # Plugin registration tests
        └── EmailTemplateList.spec.ts # List view unit tests
```

---

## Installation

This plugin is loaded automatically when `email-admin` is present in `vbwd-fe-admin/plugins/`. No manual registration is required.

**Backend dependency:** requires the [vbwd-plugin-email](https://github.com/VBWD-platform/vbwd-plugin-email) backend plugin to be enabled, which exposes:

```
GET  /api/v1/admin/email/templates
GET  /api/v1/admin/email/templates/:id
PUT  /api/v1/admin/email/templates/:id
GET  /api/v1/admin/email/event-types
POST /api/v1/admin/email/templates/preview
POST /api/v1/admin/email/test-send
```

---

## Development

```bash
# From vbwd-fe-admin root
npm run dev           # start dev server (port 8081)
npm run test          # run all unit tests
npx vitest run plugins/email-admin --reporter=verbose
```

---

## License

CC0 1.0 Universal (Public Domain)
