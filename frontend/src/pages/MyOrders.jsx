import { useEffect, useState } from "react"
import axios from "axios"

function MyOrders(){

  const user = JSON.parse(localStorage.getItem("user"))

  const [orders,setOrders] = useState([])
  const [items,setItems] = useState([])
  const [selectedOrder,setSelectedOrder] = useState(null)

  const fetchOrders = async ()=>{

    const res = await axios.get(
      `http://localhost:5000/api/orders/user/${user.id}`
    )

    setOrders(res.data)
  }

  useEffect(()=>{
    if(user){
      fetchOrders()
    }
  },[])


  const viewItems = async(id)=>{

    const res = await axios.get(
      `http://localhost:5000/api/orders/${id}/items`
    )

    setItems(res.data)
    setSelectedOrder(id)

  }

  /* ===== ORDER TRACKING UI ===== */

  const trackingSteps = (status) => {

    const steps = [
      "Pending",
      "Paid",
      "Shipped",
      "Delivered"
    ]

    return steps.map((step,index)=>{

      const active = steps.indexOf(status) >= index

      return (
        <div key={index}
        style={{
          display:"flex",
          alignItems:"center",
          marginBottom:"5px"
        }}>

          <div
          style={{
            width:"20px",
            height:"20px",
            borderRadius:"50%",
            background: active ? "green" : "#ccc",
            marginRight:"10px"
          }}
          />

          {step}

        </div>
      )
    })
  }

  return(

    <div style={{padding:"20px"}}>

      <h1>My Orders</h1>

      {orders.map(order=>(

        <div key={order.id}
        style={{
          border:"1px solid #ccc",
          padding:"15px",
          marginBottom:"20px"
        }}>

          <h3>Order #{order.id}</h3>

          <p>Total : ₹{order.total_amount}</p>

          <p>Status : {order.status}</p>

          <p>Date : {new Date(order.created_at).toLocaleDateString()}</p>

          <h4>Tracking</h4>

          {trackingSteps(order.status)}

          <br/>

          <button onClick={()=>viewItems(order.id)}>
            View Products
          </button>

        </div>

      ))}

      {selectedOrder && (

        <div>

          <h3>Products in Order #{selectedOrder}</h3>

          {items.map((item,i)=>(

            <div key={i}
            style={{marginBottom:"10px"}}>

              <img
              src={`http://localhost:5000/uploads/${item.image}`}
              width="60"
              alt=""
              />

              {item.name} × {item.quantity} — ₹{item.price}

            </div>

          ))}

        </div>

      )}

    </div>

  )

}

export default MyOrders