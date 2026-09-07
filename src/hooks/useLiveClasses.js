import { useEffect, useState } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'liveClasses'
// { title, youtubeUrl, date, time, status: 'upcoming' | 'live' | 'ended', courseId? }

export function useLiveClasses() {
  const [liveClasses, setLiveClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, COL), orderBy('date', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setLiveClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  const addLiveClass = (data) => addDoc(collection(db, COL), data)
  const updateLiveClass = (id, data) => updateDoc(doc(db, COL, id), data)
  const deleteLiveClass = (id) => deleteDoc(doc(db, COL, id))

  return { liveClasses, loading, addLiveClass, updateLiveClass, deleteLiveClass }
}
