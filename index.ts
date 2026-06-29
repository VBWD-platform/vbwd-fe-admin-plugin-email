/**
 * Email Admin Plugin
 *
 * Provides transactional email template management in the admin backoffice:
 * - List all event-keyed templates
 * - Edit HTML/plain-text bodies (CodeMirror-style textarea editors)
 * - Preview rendered output with example data
 * - Send test emails to any address
 */

import type { IPlugin, IPlatformSDK } from 'vbwd-view-component'
import { extensionRegistry } from '../../vue/src/plugins/extensionRegistry'
import en from './locales/en.json'
import de from './locales/de.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import ja from './locales/ja.json'
import ru from './locales/ru.json'
import th from './locales/th.json'
import zh from './locales/zh.json'

const SETTINGS_ITEMS = [
  { label: 'Email Templates', to: '/admin/email/templates', requiredPermission: 'email.templates.view' },
]

export const emailAdminPlugin: IPlugin = {
  name: 'email-admin',
  version: '26.6.1',
  description: 'Transactional email template editor',

  install(sdk: IPlatformSDK) {
    // Translations
    sdk.addTranslations('en', { email: (en as Record<string, unknown>)['email'] })
    sdk.addTranslations('de', { email: (de as Record<string, unknown>)['email'] })
    sdk.addTranslations('es', { email: (es as Record<string, unknown>)['email'] })
    sdk.addTranslations('fr', { email: (fr as Record<string, unknown>)['email'] })
    sdk.addTranslations('ja', { email: (ja as Record<string, unknown>)['email'] })
    sdk.addTranslations('ru', { email: (ru as Record<string, unknown>)['email'] })
    sdk.addTranslations('th', { email: (th as Record<string, unknown>)['email'] })
    sdk.addTranslations('zh', { email: (zh as Record<string, unknown>)['email'] })

    extensionRegistry.register('email-admin', { settingsItems: SETTINGS_ITEMS })

    sdk.addRoute({
      path: 'email/templates',
      name: 'email-templates',
      component: () => import('./src/views/EmailTemplateList.vue'),
      meta: { requiredPermission: 'email.templates.view' },
    })

    sdk.addRoute({
      path: 'email/templates/new',
      name: 'email-template-new',
      component: () => import('./src/views/EmailTemplateEdit.vue'),
      meta: { requiredPermission: 'email.templates.manage' },
    })

    sdk.addRoute({
      path: 'email/templates/:id/edit',
      name: 'email-template-edit',
      component: () => import('./src/views/EmailTemplateEdit.vue'),
      meta: { requiredPermission: 'email.templates.view' },
    })
  },

  activate() {
    extensionRegistry.register('email-admin', { settingsItems: SETTINGS_ITEMS })
  },

  deactivate() {
    extensionRegistry.unregister('email-admin')
  },
}

export default emailAdminPlugin
