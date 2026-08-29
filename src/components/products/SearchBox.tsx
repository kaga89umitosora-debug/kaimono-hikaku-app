import { useI18n } from '../../i18n';

export function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useI18n();
  const label = t('product.searchPlaceholder');
  return (
    <div className="search-box">
      <span aria-hidden="true">🔍</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        aria-label={label}
      />
    </div>
  );
}
