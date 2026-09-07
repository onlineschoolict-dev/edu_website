import { useEffect, useState } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc, doc, query, where, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'enrollments'

// All enrollments belonging to the current logged-in user
export function useMyEnrollments(user) {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setEnrollments([]); setLoading(false); return }
    setLoading(true)
    const q = query(collection(db, COL), where('userId', '==', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      setEnrollments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  // Array methods (.find, .filter) keep working unchanged on the returned
  // value everywhere it's already used - `loading` is just an extra property.
  enrollments.loading = loading
  return enrollments
}

// All enrollments, for the admin panel (pending approvals etc.)
export function useAllEnrollments(isAdmin) {
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    if (!isAdmin) { setEnrollments([]); return }
    const unsub = onSnapshot(collection(db, COL), (snap) => {
      setEnrollments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [isAdmin])

  return enrollments
}

export function requestEnrollment({ user, courseId, method, phone, txnId }) {
  return addDoc(collection(db, COL), {
    userId: user.uid,
    userEmail: user.email,
    courseId,
    method,
    phone,
    txnId,
    status: 'pending',
    createdAt: serverTimestamp()
  })
}

export function setEnrollmentStatus(id, status) {
  return updateDoc(doc(db, COL, id), { status })
}
