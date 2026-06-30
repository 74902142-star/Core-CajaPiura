export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="input-group">
      <span className="input-group-text bg-white border-end-0">
        <i className="bi bi-search text-muted"></i>
      </span>
      <input
        type="text"
        className="form-control border-start-0"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ maxWidth: '300px' }}
      />
    </div>
  );
}
