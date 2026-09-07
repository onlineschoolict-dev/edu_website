const GROWTH_STATS = [
  { value: '৯৫%', label: 'A+ পাওয়া শিক্ষার্থীর হার' },
  { value: '১০,০০০+', label: 'মোট শিক্ষার্থী' },
  { value: '৫০০+', label: 'রেকর্ডেড ক্লাস' }
]

export default function GrowthStats() {
  return (
    <div className="container section growth-section">
      <h2 className="h2 growth-heading">শিক্ষার্থীদের ভবিষ্যৎ গড়তে আমরা প্রতিশ্রুতিবদ্ধ</h2>
      <div className="growth-grid">
        {GROWTH_STATS.map(s => (
          <div className="growth-stat" key={s.label}>
            <span className="growth-value">{s.value}</span>
            <span className="growth-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
