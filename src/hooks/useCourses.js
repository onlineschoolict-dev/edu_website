import { useEffect, useState } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'courses'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COL), (snap) => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const addCourse = (data) => addDoc(collection(db, COL), data)
  const updateCourse = (id, data) => updateDoc(doc(db, COL, id), data)
  const deleteCourse = (id) => deleteDoc(doc(db, COL, id))

  return { courses, loading, addCourse, updateCourse, deleteCourse }
}
