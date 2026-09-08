import { useEffect, useState } from 'react'
import {
  collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'reviews'

export function useReviews(courseId = null) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const reviewQuery = courseId
      ? query(collection(db, COL), where('courseId', '==', courseId))
      : collection(db, COL)
    const unsubscribe = onSnapshot(reviewQuery, (snapshot) => {
      setReviews(snapshot.docs.map(item => ({ id: item.id, ...item.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return unsubscribe
  }, [courseId])

  return { reviews, loading }
}

export function saveReview({ id, courseId, user, rating, comment }) {
  const data = {
    courseId,
    userId: user.uid,
    userName: user.displayName || user.email || 'শিক্ষার্থী',
    userPhoto: user.photoURL || '',
    rating: Number(rating),
    comment: comment.trim(),
    status: 'pending',
    updatedAt: serverTimestamp()
  }
  return id
    ? updateDoc(doc(db, COL, id), data)
    : setDoc(doc(db, COL, `${courseId}_${user.uid}`), { ...data, createdAt: serverTimestamp() })
}

export function moderateReview(id, status) {
  return updateDoc(doc(db, COL, id), { status })
}

export function deleteReview(id) {
  return deleteDoc(doc(db, COL, id))
}
