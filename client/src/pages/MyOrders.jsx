import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import NoData from '../components/NoData';
import toast from 'react-hot-toast';
import { Button, CircularProgress } from '@mui/material';
import ConfirmBox from '../components/ConfirmBox';

const MyOrders = () => {
  const orders = useSelector(state => state.orders.order);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openCancelConfirmBox, setOpenCancelConfirmBox] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCancelConfirmation = (order) => {
    setOrderToCancel(order);
    setOpenCancelConfirmBox(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      setLoadingOrderId(orderToCancel.orderId);
      setDetailsLoading(true);
      const response = await axios({
        method: 'post',
        url: `http://localhost:8080/api/order/update-delivery-status/${orderToCancel.orderId}`,
        data: {
          delivery_status: "cancelled"
        }
      });

      if (response.data.success) {
        toast.success("Order cancelled successfully!");
        // Instead of reloading the page, you might want to update the Redux store here
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setLoadingOrderId(null);
      setDetailsLoading(false);
      setOpenCancelConfirmBox(false);
      setOrderToCancel(null);
    }
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='bg-white shadow-md p-4 font-semibold mb-4 rounded-md'>
        <h1 className='text-xl'>My Orders</h1>
      </div>
      
      {!orders[0] ? (
        <NoData/>
      ) : (
        <div className='space-y-4'>
          {orders.map((order) => (
            <div key={order._id} className='bg-white shadow-md rounded-lg overflow-hidden'>
              {/* Order Header */}
              <div className='p-4 border-b'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='font-semibold'>Order #: {order.orderId}</p>
                    <p className='text-sm text-gray-500'>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className='text-right'>
                    <div className='mb-1'>
                      <span className='text-xs text-gray-500'>Payment : </span>
                      <span className='font-medium text-green-600'>
                        {order.payment_status}
                      </span>
                    </div>
                    <div>
                      <span className='text-xs text-gray-500'>Delivery Status: </span>
                      <span className={`text-sm font-medium ${
                        order.delivery_status === 'pending' ? 'text-yellow-600' : 
                        order.delivery_status === 'cancelled' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {order.delivery_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className='p-4'>
                {order.products.map((product) => (
                  <div key={product._id} className='flex gap-4 mb-4 pb-4 border-b last:border-0'>
                    <img
                      src={product.product_details?.image?.[0] || ''} 
                      alt={product.product_details?.name || 'Product image'}
                      className='w-20 h-20 object-cover rounded-md'
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80';
                      }}
                    />
                    <div className='flex-1'>
                      <p className='font-medium'>{product.product_details?.name || 'Product'}</p>
                      <p className='text-sm text-gray-600'>Quantity: {product.quantity}</p>
                      <p className='text-sm'>Price: ₹{product.price?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>
                        ₹{((product.price || 0) * (product.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className='p-4 bg-gray-50'>
                <div className='flex justify-between'>
                  <p>Subtotal:</p>
                  <p>₹{order.subTotalAmt?.toFixed(2) || '0.00'}</p>
                </div>
                <div className='flex justify-between font-semibold mt-2'>
                  <p>Total:</p>
                  <p>₹{order.totalAmt?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              
              {/* Delivery Address */}
              {order.delivery_address && (
                <div className='p-4 border-t'>
                  <p className='font-medium mb-2'>Delivery Address:</p>
                  <p>{order.delivery_address.address_line}</p>
                  <p>{order.delivery_address.city}, {order.delivery_address.state}</p>
                  <p>{order.delivery_address.pincode}, {order.delivery_address.country}</p>
                  <p className='mt-2'>Mobile: {order.delivery_address.mobile}</p>
                </div>
              )}

              {/* Cancel Order Button */}
              {order.delivery_status !== 'cancelled' && order.delivery_status !== 'delivered' && (
                <div className='p-4 border-t flex justify-end'>
                  <Button
                    onClick={() => handleCancelConfirmation(order)}
                    disabled={loadingOrderId === order.orderId || detailsLoading}
                    variant="contained"
                    color="error"
                    className="w-full sm:w-auto"
                  >
                    {loadingOrderId === order.orderId || detailsLoading 
                      ? <CircularProgress size={24} /> 
                      : 'Cancel Order'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {openCancelConfirmBox && (
        <ConfirmBox
          cancel={() => setOpenCancelConfirmBox(false)}
          close={() => setOpenCancelConfirmBox(false)}
          confirm={handleCancelOrder}
          title="Confirm Order Cancellation"
          message="Are you sure you want to cancel this order?"
        />
      )}
    </div>
  );
};

export default MyOrders;