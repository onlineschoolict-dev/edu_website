const FEATURES = [
  { icon: '🔴', title: 'লাইভ ক্লাস', desc: 'নির্দিষ্ট সময়ে শিক্ষকের সাথে সরাসরি ক্লাসে যোগ দিন, প্রশ্ন করুন সাথে সাথে।' },
  { icon: '🔁', title: 'সারাজীবন রেকর্ডিং অ্যাক্সেস', desc: 'লাইভ ক্লাস মিস করলেও চিন্তা নেই — একই ভিডিওতে পরে রিভিশন দিতে পারবেন।' },
  { icon: '🔒', title: 'নিরাপদ পেমেন্ট যাচাই', desc: 'bKash/Nagad দিয়ে পেমেন্ট করে অ্যাডমিন অনুমোদনের পর কোর্স আনলক হয়।' }
]

export default function Features() {
  return (
    <div className="container section">
      <div className="section-head">
        <h2 className="h2" style={{ fontSize: 26 }}>কেন আমাদের কাছে পড়বেন</h2>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {FEATURES.map(f => (
          <div className="card" key={f.title}>
            <span style={{ fontSize: 26, display: 'inline-block', marginBottom: 12 }} aria-hidden="true">{f.icon}</span>
            <h3 className="h3" style={{ marginBottom: 10 }}>{f.title}</h3>
            <p className="body">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
