import { useEffect, useState } from "react"
import axios from "axios"

function AdminReviews() {

  const [reviews, setReviews] = useState([])
  const [replies, setReplies] = useState({})

  const fetchReviews = async () => {
    const res = await axios.get("http://localhost:5000/api/reviews")
    setReviews(res.data)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleReplyChange = (id, value) => {
    setReplies(prev => ({ ...prev, [id]: value }))
  }

  const sendReply = async (id) => {
    const replyText = replies[id] || ""

    if (!replyText.trim()) {
      alert("Please write a reply first")
      return
    }

    await axios.put(`http://localhost:5000/api/reviews/${id}`, {
      admin_reply: replyText
    })

    setReplies(prev => ({ ...prev, [id]: "" }))
    fetchReviews()
  }

  const deleteReview = async (id) => {
    await axios.delete(`http://localhost:5000/api/reviews/${id}`)
    fetchReviews()
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Reviews</h2>

      {reviews.length === 0 && (
        <p style={{ color: "gray" }}>No reviews yet.</p>
      )}

      {reviews.map(r => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            margin: "12px 0",
            padding: "15px",
            background: "#fff"
          }}
        >

          {/* ✅ PRODUCT NAME */}
          <div style={{
            background: "#f0f0f0",
            padding: "6px 12px",
            borderRadius: "5px",
            marginBottom: "10px",
            display: "inline-block"
          }}>
            🛍️ <b>Product:</b> {r.product_name}
          </div>

          {/* USER */}
          <p style={{ margin: "5px 0" }}>
            👤 <b>User:</b> {r.user_name}
          </p>

          {/* RATING */}
          <p style={{ margin: "5px 0" }}>
            {"⭐".repeat(r.rating)}
            <span style={{ color: "gray", marginLeft: "6px" }}>
              {r.rating}/5
            </span>
          </p>

          {/* COMMENT */}
          <p style={{
            margin: "8px 0",
            padding: "8px",
            background: "#fafafa",
            borderLeft: "3px solid #ccc",
            borderRadius: "4px"
          }}>
            {r.comment}
          </p>

          {/* ADMIN REPLY — if exists */}
          {r.admin_reply && (
            <p style={{
              background: "#e8f4fd",
              borderLeft: "3px solid #2196F3",
              padding: "8px 12px",
              borderRadius: "4px",
              margin: "8px 0"
            }}>
              <b>🏪 Admin Reply:</b> {r.admin_reply}
            </p>
          )}

          {/* REPLY INPUT */}
          <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
            <input
              placeholder="Write a reply..."
              value={replies[r.id] || ""}
              onChange={(e) => handleReplyChange(r.id, e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "300px"
              }}
            />

            <button
              onClick={() => sendReply(r.id)}
              style={{
                background: "#2196F3",
                color: "white",
                border: "none",
                padding: "6px 14px",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Reply
            </button>

            <button
              onClick={() => deleteReview(r.id)}
              style={{
                background: "#e53935",
                color: "white",
                border: "none",
                padding: "6px 14px",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Delete
            </button>
          </div>

        </div>
      ))}
    </div>
  )
}

export default AdminReviews