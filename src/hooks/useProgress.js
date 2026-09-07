import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

// One doc per (user, course): progress/{uid}_{courseId}
// { userId, courseId, completedLessonIds: string[], updatedAt }

function progressDocId(uid, courseId) {
  return `${uid}_${courseId}`
}

export function useProgress(user, courseId) {
  const [completedLessonIds, setCompletedLessonIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !courseId) { setCompletedLessonIds([]); setLoading(false); return }
    const ref = doc(db, 'progress', progressDocId(user.uid, courseId))
    const unsub = onSnapshot(ref, (snap) => {
      setCompletedLessonIds(snap.exists() ? (snap.data().completedLessonIds || []) : [])
      setLoading(false)
    })
    return unsub
  }, [user, courseId])

  const setLessonComplete = async (lessonId, completed) => {
    if (!user || !courseId) return
    const ref = doc(db, 'progress', progressDocId(user.uid, courseId))
    const next = completed
      ? Array.from(new Set([...completedLessonIds, lessonId]))
      : completedLessonIds.filter(id => id !== lessonId)
    await setDoc(ref, {
      userId: user.uid,
      courseId,
      completedLessonIds: next,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }

  return { completedLessonIds, setLessonComplete, loading }
}
