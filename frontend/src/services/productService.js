import axios from "axios"

const API_URL = "http://localhost:5000/api/products"

export const getProducts = async () => {
  return await axios.get(API_URL)
}

export const addProduct = async (product) => {
  return await axios.post(API_URL, product)
}
