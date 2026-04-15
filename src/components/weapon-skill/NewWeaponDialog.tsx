import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useWeaponSkillStore } from '../../store/weaponSkillStore';

interface NewWeaponDialogProps { open: boolean; onClose: () => void; }
type WeaponCategory = 'MeleeWeapon' | 'RangeWeapon' | 'MagicWeapon';

export function NewWeaponDialog({ open, onClose }: NewWeaponDialogProps) {
  const { t } = useTranslation('common');
  const addWeapon = useWeaponSkillStore((state: any) => state.addWeapon);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WeaponCategory>('MeleeWeapon');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addWeapon({ id: name.trim(), category, hands: 'OneHand', tags: [], levelVariations: {} });
    setName(''); onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">{t('weapon.newWeapon.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('weapon.newWeapon.nameLabel')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder={t('weapon.newWeapon.placeholder')} autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('weapon.common.category')}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as WeaponCategory)} className="w-full border rounded px-3 py-2 text-sm">
              <option value="MeleeWeapon">{t('weapon.categories.meleeWeapon')}</option>
              <option value="RangeWeapon">{t('weapon.categories.rangeWeapon')}</option>
              <option value="MagicWeapon">{t('weapon.categories.magicWeapon')}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-100">{t('weapon.common.cancel')}</button>
            <button type="submit" disabled={!name.trim()} className="px-4 py-2 text-sm bg-blue-500 text-white rounded disabled:opacity-50">{t('weapon.common.create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
