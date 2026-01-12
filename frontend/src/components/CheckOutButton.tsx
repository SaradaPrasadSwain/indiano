import React, {useState} from 'react'
import axios from 'axios'

declare global {
  interface Window {
    Razorpay: any;
  }
}


const CheckOutButton = ({orderId, amount}: {orderId: string, amount: number}) => {
  const [error, setError] = useState<string | null>(null)
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    })
  };

  const handlePayment = async () => {
    const res = await loadRazorpay();

    if(!res){
      alert('Razorpay SDK failed to load');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:4500/api/v1/payment/create',
        { orderId: orderId },
        { headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      const config = response.data;
  
      const options = {
        key: config.key,
        amount: config.amount,
        currency: config.currency,
        name: config.name,
        description: config.description,
        image: config.image,
        order_id: config.order_id,
        prefill: config.prefill || {
          name: "",
          email: "",
          contact: ""
        },
        theme: config.theme || {
          color: "#3399cc"
        },
        handler: async function(paymentResponse: any) {
          try {

            console.log('Payment successful, verifying...', paymentResponse);
            const verifyRes = await axios.post(
              'http://localhost:4500/api/v1/payment/verify-payment',
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                orderId: orderId 
              },
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            
            const result = verifyRes.data;
            if (result.success) {
              alert('Payment Successful!');
              window.location.href = '/my-orders';
            }else {
              alert('Payment varification failed!');
            }
          } catch (error) {
            alert('payment verification failed!')
          }
        }
      };
  
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error("payment error", error);
      const errorMessage = error.response?.data?.message || 'failed to initiate payment. please try again.';
      setError(errorMessage);
    }
  };


  return (
    <div>
        {error && (
        <div>
          {error}
        </div>
      )}
        <button 
        onClick = {handlePayment}
        className='bg-blue-500 text-white px-6 py-3 rounded'>Pay ₹{amount}
        </button>
    </div>
  )
}

export default CheckOutButton;
