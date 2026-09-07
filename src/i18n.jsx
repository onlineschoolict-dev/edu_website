import { createContext, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'online-school-language'

export const translations = {
  bn: {
    language: 'ভাষা', home: 'হোম', courses: 'কোর্স', teachers: 'শিক্ষক', gallery: 'গ্যালারি', contact: 'যোগাযোগ',
    searchCourses: 'কোর্স খুঁজুন...', admin: 'অ্যাডমিন প্যানেল', myCourses: 'আমার কোর্স', login: 'Google দিয়ে লগইন', logout: 'লগআউট',
    freeDemo: 'ফ্রি ডেমো ক্লাস', watchDemo: 'ফ্রি ডেমো দেখুন', premium: 'পেইড', lesson: 'লেসন', lessons: 'লেসন',
    courseNotFound: 'কোর্সটি পাওয়া যায়নি।', backCourses: 'সব কোর্সে ফিরে যান', curriculum: 'কারিকুলাম', startLearning: 'শেখা শুরু করুন',
    loginToWatch: 'এই কোর্সের লেসন দেখতে প্রথমে লগইন করুন।', loginToBuy: 'কিনতে হলে প্রথমে লগইন করুন', approved: 'আপনি এই কোর্সে ভর্তি আছেন — লেসন দেখা শুরু করুন।',
    noLessons: 'এখনো কোনো লেসন যোগ করা হয়নি', markComplete: 'সম্পন্ন হিসেবে চিহ্নিত করুন', completed: 'সম্পন্ন হিসেবে চিহ্নিত',
    previous: 'আগের লেসন', next: 'পরের লেসন', courseContent: 'কোর্স কনটেন্ট', completedPercent: 'সম্পন্ন',
    free: 'ফ্রি', paid: 'পেইড', demoOnly: 'ডেমো ক্লাস', homeCourses: 'সব কোর্স', learnToday: 'আজ শিখুন, আগামীকাল গড়ুন',
    dashboard: 'ড্যাশবোর্ড', students: 'শিক্ষার্থী', videos: 'ভিডিও ম্যানেজমেন্ট', advertisements: 'বিজ্ঞাপন', settings: 'সেটিংস', live: 'লাইভ ক্লাস', courseDetails: 'বিস্তারিত দেখুন'
  },
  en: {
    language: 'Language', home: 'Home', courses: 'Courses', teachers: 'Teachers', gallery: 'Gallery', contact: 'Contact',
    searchCourses: 'Search courses...', admin: 'Admin Panel', myCourses: 'My Courses', login: 'Sign in with Google', logout: 'Log out',
    freeDemo: 'Free Demo Class', watchDemo: 'Watch Free Demo', premium: 'Paid', lesson: 'Lesson', lessons: 'Lessons',
    courseNotFound: 'Course not found.', backCourses: 'Back to all courses', curriculum: 'Curriculum', startLearning: 'Start Learning',
    loginToWatch: 'Please log in to watch this course lesson.', loginToBuy: 'Log in to purchase this course', approved: 'You are enrolled in this course — start learning.',
    noLessons: 'No lessons have been added yet', markComplete: 'Mark as complete', completed: 'Completed',
    previous: 'Previous lesson', next: 'Next lesson', courseContent: 'Course content', completedPercent: 'complete',
    free: 'Free', paid: 'Paid', demoOnly: 'Demo class', homeCourses: 'All courses', learnToday: 'Learn today, build tomorrow',
    dashboard: 'Dashboard', students: 'Students', videos: 'Video management', advertisements: 'Advertisements', settings: 'Settings', live: 'Live classes', courseDetails: 'View details'
  }
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'bn' } catch { return 'bn' }
  })

  const changeLanguage = (next) => {
    const value = next === 'en' ? 'en' : 'bn'
    setLanguage(value)
    try { localStorage.setItem(STORAGE_KEY, value) } catch { /* storage may be unavailable */ }
  }

  const value = useMemo(() => ({
    language,
    setLanguage: changeLanguage,
    t: (key) => translations[language][key] || translations.bn[key] || key,
    localized: (item, field, fallback = '') => {
      if (!item) return fallback
      const localizedValue = item[`${field}${language === 'bn' ? 'Bn' : 'En'}`]
      return localizedValue || item[field] || item[`${field}Bn`] || item[`${field}En`] || fallback
    }
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
