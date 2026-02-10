import { useEffect, useState } from "react"
import axios from "axios"

function AdminReviews() {

  const [reviews, setReviews] = useState([])
  const [reply, setReply] = useState("")

  const fetchReviews = async () => {
    const res = await axios.get("http://localhost:5000/api/reviews")
    setReviews(res.data)
  }

  useEffect(() => {
    const loadReviews = async () => {
      await fetchReviews()
    }
    loadReviews()
  }, [])

  const sendReply = async (id) => {
    await axios.put(`http://localhost:5000/api/reviews/${id}`, {
      admin_reply: reply
    })
    setReply("")
    fetchReviews()
  }

  const deleteReview = async (id) => {
    await axios.delete(`http://localhost:5000/api/reviews/${id}`)
    fetchReviews()
  }

  return (
    <div>
      <h2>Manage Reviews</h2>

      {reviews.map(r => (
        <div key={r.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <b>{r.product_name}</b> | {r.user_name}
          <br />
          ⭐ {r.rating}
          <br />
          {r.comment}
          <br />

          <input
            placeholder="Reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />

          <button onClick={() => sendReply(r.id)}>Reply</button>
          <button onClick={() => deleteReview(r.id)}>Delete</button>

          {r.admin_reply && (
            <p><b>Admin:</b> {r.admin_reply}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default AdminReviews
