import React from "react"
import { useTranslation } from 'react-i18next'
import ModuleDropdown from '../components/ModuleDropdown'

export default function PrivacyPolicyPage() {
  const { t } = useTranslation()
  
  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-800 leading-relaxed">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t('privacy_policy_title')}</h1>
        <ModuleDropdown />
      </div>
      <p className="mb-3">
        {t('privacy_intro_1')}
      </p>
      <p className="mb-3">
        {t('privacy_intro_2')}
      </p>
      <h2 className="text-lg font-semibold mt-4 mb-2">{t('privacy_data_types_title')}</h2>
      <ul className="list-disc ml-6 mb-3">
        <li>{t('privacy_data_type_1')}</li>
        <li>{t('privacy_data_type_2')}</li>
        <li>{t('privacy_data_type_3')}</li>
        <li>{t('privacy_data_type_4')}</li>
      </ul>
      <h2 className="text-lg font-semibold mt-4 mb-2">{t('privacy_third_party_title')}</h2>
      <ul className="list-disc ml-6 mb-3">
        <li>{t('privacy_third_party_1')}</li>
        <li>{t('privacy_third_party_2')}</li>
        <li>{t('privacy_third_party_3')}</li>
      </ul>
      <p className="mb-3">
        {t('privacy_third_party_note')}
      </p>
      <p className="mb-3">
        {t('privacy_cookie_intro')}{" "}
        <a
          href="https://adssettings.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {t('google_ad_settings')}
        </a>{" "}
        {t('privacy_cookie_outro')}
      </p>
      <h2 className="text-lg font-semibold mt-4 mb-2">{t('privacy_cookie_storage_title')}</h2>
      <p className="mb-3">
        {t('privacy_cookie_storage_content')}
      </p>
      <h2 className="text-lg font-semibold mt-4 mb-2">{t('privacy_user_rights_title')}</h2>
      <ul className="list-disc ml-6 mb-3">
        <li>{t('privacy_user_right_1')}</li>
        <li>{t('privacy_user_right_2')}</li>
        <li>{t('privacy_user_right_3')}</li>
      </ul>
      <h2 className="text-lg font-semibold mt-4 mb-2">{t('privacy_changes_title')}</h2>
      <p className="mb-3">
        {t('privacy_changes_content')}
      </p>
      <p className="mb-3">
        {t('privacy_contact_intro')}
        <br />
        📧{" "}
        <a href="mailto:rxv0227@gmail.com" className="text-blue-600 underline">
          rxv0227@gmail.com
        </a>
      </p>
      <p className="text-sm text-gray-500">{t('privacy_last_updated')}: 2025/11/04</p>
    </div>
  )
}
