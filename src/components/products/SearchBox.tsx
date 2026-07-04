export function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="search-box">
      <span aria-hidden="true">🔍</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="商品名で検索"
        aria-label="商品名で検索"
      />
    </div>
  );
}
