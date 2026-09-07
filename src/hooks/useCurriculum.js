import { useEffect, useMemo, useState } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'

// Firestore shape:
// courses/{courseId}/modules/{moduleId}            { title, order }
// courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
//                                                   { title, youtubeId, description, order, duration }

function modulesCol(courseId) {
  return collection(db, 'courses', courseId, 'modules')
}
function lessonsCol(courseId, moduleId) {
  return collection(db, 'courses', courseId, 'modules', moduleId, 'lessons')
}

// Loads the full module -> lessons tree for one course, live.
export function useCurriculum(courseId) {
  const [modules, setModules] = useState([])
  const [lessonsByModule, setLessonsByModule] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) { setModules([]); setLessonsByModule({}); setLoading(false); return }
    setLoading(true)
    const q = query(modulesCol(courseId), orderBy('order', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setModules(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [courseId])

  useEffect(() => {
    if (!courseId || modules.length === 0) return
    const unsubs = modules.map(m => {
      const q = query(lessonsCol(courseId, m.id), orderBy('order', 'asc'))
      return onSnapshot(q, (snap) => {
        setLessonsByModule(prev => ({
          ...prev,
          [m.id]: snap.docs.map(d => ({ id: d.id, ...d.data() }))
        }))
      })
    })
    return () => unsubs.forEach(u => u())
  }, [courseId, modules])

  const tree = useMemo(
    () => modules.map(m => ({ ...m, lessons: lessonsByModule[m.id] || [] })),
    [modules, lessonsByModule]
  )

  const totalLessons = useMemo(
    () => tree.reduce((sum, m) => sum + m.lessons.length, 0),
    [tree]
  )

  // Flat, ordered list of lessons across every module - used for prev/next navigation.
  const flatLessons = useMemo(() => {
    const out = []
    tree.forEach(m => m.lessons.forEach(l => out.push({ ...l, moduleId: m.id, moduleTitle: m.title })))
    return out
  }, [tree])

  return { modules: tree, totalLessons, flatLessons, loading }
}

export function addModule(courseId, title, order) {
  return addDoc(modulesCol(courseId), { title, order })
}
export function updateModule(courseId, moduleId, data) {
  return updateDoc(doc(db, 'courses', courseId, 'modules', moduleId), data)
}
export function deleteModule(courseId, moduleId) {
  return deleteDoc(doc(db, 'courses', courseId, 'modules', moduleId))
}

export function addLesson(courseId, moduleId, data) {
  return addDoc(lessonsCol(courseId, moduleId), data)
}
export function updateLesson(courseId, moduleId, lessonId, data) {
  return updateDoc(doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId), data)
}
export function deleteLesson(courseId, moduleId, lessonId) {
  return deleteDoc(doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId))
}

// Swaps the `order` field of two sibling documents - the simplest reliable
// way to move something up/down without a full drag-and-drop library.
export async function swapOrder(colRef, a, b) {
  const batch = writeBatch(db)
  batch.update(doc(colRef, a.id), { order: b.order })
  batch.update(doc(colRef, b.id), { order: a.order })
  await batch.commit()
}

export function moduleCollectionRef(courseId) {
  return modulesCol(courseId)
}
export function lessonCollectionRef(courseId, moduleId) {
  return lessonsCol(courseId, moduleId)
}
