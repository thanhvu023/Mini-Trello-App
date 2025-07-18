import { useState } from "react"

import { authService } from '../services/authService'


export default function EmailInputForm(){
const [email, setEmail] = useState('');
const[loading, Setloading] = useState(false);
const[error, setError] = useState(null);

const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authService.register(email) // hoặc .signin tùy flow
      // navigate('/verify', { state: { email } }) // Sẽ dùng sau
      alert('Mã xác thực đã được gửi về email!') // Tạm thời
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
    return(
        <form onSubmit={handleSubmit}>
<input
type="email"
className="input"
placeholder="Enter your email"
value={email}
onChange={ e => setEmail(e.targer.value)}
required
/>
<button className="btn btn-primary w-full" disabled={loading}>
{loading ? "Loading..." :"Contiue"}
</button>
{error &&<div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
    )
}