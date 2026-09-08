import { useEffect, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, where
} from 'firebase/firestore'
import { db } from '../firebase'

const COL = 'liveComments'

export function useLiveComments(liveClassId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(Boolean(liveClassId))

  useEffect(() => {
    if (!liveClassId) {
      setComments([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    const commentsQuery = query(
      collection(db, COL),
      where('liveClassId', '==', liveClassId)
    )
    const unsubscribe = onSnapshot(commentsQuery, snapshot => {
      const nextComments = snapshot.docs.map(item => ({ id: item.id, ...item.data() }))
      nextComments.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
      setComments(nextComments)
      setLoading(false)
    }, () => setLoading(false))
    return unsubscribe
  }, [liveClassId])

  return { comments, loading }
}

export function addLiveComment({ liveClassId, user, text }) {
  return addDoc(collection(db, COL), {
    liveClassId,
    userId: user.uid,
    userName: user.displayName || user.email || 'শিক্ষার্থী',
    userPhoto: user.photoURL || '',
    text: text.trim(),
    createdAt: serverTimestamp()
  })
}

export function removeLiveComment(id) {
  return deleteDoc(doc(db, COL, id))
}
