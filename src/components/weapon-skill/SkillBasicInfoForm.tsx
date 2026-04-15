import { useTranslation } from 'react-i18next';

export function SkillBasicInfoForm() {
  const { t } = useTranslation('common');
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold">{t('weapon.placeholderForms.basicInfo')}</h3>
      <p className="text-xs text-gray-400">{t('weapon.placeholderForms.skillBasicInfoForm')}</p>
    </div>
  );
}
