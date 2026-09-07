// Image upload helper.
//
// We do NOT use Firebase Storage here on purpose: as of the Blaze-plan
// requirement change, enabling Firebase Storage requires attaching a
// billing card to the project (even to stay within the free tier), and
// without an enabled/provisioned bucket, uploads fail in the browser as a
// CORS error (the bucket has no CORS config to respond with because it was
// never actually enabled).
//
// Instead we upload straight from the browser to Cloudinary's free tier
// using an *unsigned* upload preset. Cloudinary's free plan does not
// require a credit card, and its upload endpoint is CORS-enabled for
// direct browser uploads, so no server code is needed for this.
//
// Setup (no card required):
//   1. Create a free account at https://cloudinary.com/users/register/free
//   2. Dashboard -> copy your "Cloud name"
//   3. Settings -> Upload -> Upload presets -> "Add upload preset"
//        - Signing Mode: Unsigned
//        - (optional) Folder: leave blank, we pass the folder per upload
//   4. Put the cloud name + preset name into .env as:
//        VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
//        VITE_CLOUDINARY_UPLOAD_PRESET=your-preset-name

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const MAX_BYTES = 5 * 1024 * 1024 // 5MB

// Uploads a File to Cloudinary and returns its public HTTPS URL.
// `folder` just organizes uploads inside the Cloudinary media library
// (e.g. 'site', 'courses') - it has no effect on billing or access.
export async function uploadImage(folder, file) {
  if (!file) return null

  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('শুধু ছবি ফাইল (jpg/png/webp ইত্যাদি) আপলোড করা যাবে।')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('ছবির সাইজ ৫MB-এর কম হতে হবে।')
  }
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'ছবি হোস্টিং কনফিগার করা হয়নি। .env ফাইলে VITE_CLOUDINARY_CLOUD_NAME এবং ' +
      'VITE_CLOUDINARY_UPLOAD_PRESET বসান (README দেখুন), তারপর সার্ভার রিস্টার্ট করুন।'
    )
  }

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)
  if (folder) body.append('folder', folder)

  let res
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body
    })
  } catch {
    throw new Error('ছবি আপলোড ব্যর্থ হয়েছে — ইন্টারনেট কানেকশন চেক করুন।')
  }

  if (!res.ok) {
    let message = `ছবি আপলোড ব্যর্থ হয়েছে (${res.status})।`
    try {
      const data = await res.json()
      if (data?.error?.message) message = data.error.message
    } catch {
      // response wasn't JSON - keep the generic message above
    }
    throw new Error(message)
  }

  const data = await res.json()
  if (!data?.secure_url) {
    throw new Error('আপলোড থেকে ছবির URL পাওয়া যায়নি। আবার চেষ্টা করুন।')
  }
  return data.secure_url
}

// Very light validation for the manual "paste an image URL" fallback -
// just enough to catch obvious mistakes before saving it to Firestore.
export function isLikelyImageUrl(value) {
  if (!value) return false
  try {
    const url = new URL(String(value).trim())
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}
