import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import AddAddress from '../components/AddAddress';
import { useSelector } from 'react-redux';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const addressList = useSelector((state) => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(0);
  const cartItemsList = useSelector((state) => state.cartItem.cart);
  const navigate = useNavigate();

  // Auto-select the first address when the addressList changes
  useEffect(() => {
    if (addressList.length > 0) {
      setSelectAddress(0); // Select the first address by default
    }
  }, [addressList]);

  // Handle Cash on Delivery
  const handleCashOnDelivery = async () => {
    if (addressList.length === 0) {
      toast.error('Please add an address to proceed.');
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchCartItem) {
          fetchCartItem();
        }
        if (fetchOrder) {
          fetchOrder();
        }
        navigate('/success', {
          state: {
            text: 'Order',
            orderDetails: responseData.data,
          },
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  // Handle Online Payment
  const handleOnlinePayment = async () => {
    if (addressList.length === 0) {
      toast.error('Please add an address to proceed.');
      return;
    }
  
    try {
      // Show loading toast
      toast.loading('Loading...');
  
      // Load Stripe.js
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      if (!stripePublicKey) {
        throw new Error('Stripe public key is missing. Check your environment variables.');
      }
  
      const stripePromise = await loadStripe(stripePublicKey);
      if (!stripePromise) {
        throw new Error('Failed to load Stripe.js. Check your Stripe public key.');
      }
  
      // Make API request to create a Stripe Checkout session
      const response = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });
  console.log('Payment response:', response); // Log the response for debugging
      const { data: responseData } = response;
  
      // Check if the response contains a valid session ID
      if (!responseData?.session?.id) {
        throw new Error('Invalid session ID received from the server.');
      }
  
      // Redirect to Stripe Checkout
      const { error } = await stripePromise.redirectToCheckout({
        sessionId: responseData.session.id,
      });
  
      // Handle Stripe Checkout errors
      if (error) {
        throw error;
      }
  
      // Refresh cart and order data
      if (fetchCartItem) {
        await fetchCartItem();
      }
      if (fetchOrder) {
        await fetchOrder();
      }
  
      // Dismiss the loading toast
      toast.dismiss();
    } catch (error) {
      // Dismiss the loading toast
      toast.dismiss();
  
      // Log the error for debugging
      console.error('Payment error:', error);
  
      // Show a user-friendly error message
      if (error.response) {
        // Axios error (backend error)
        AxiosToastError(error);
      } else if (error.message) {
        // Stripe.js or other client-side errors
        toast.error(error.message);
      } else {
        // Generic error
        toast.error('Payment failed. Please try again.');
      }
    }
  };

  return (
    <section className="bg-blue-50">
      <div className="container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between">
        <div className="w-full">
          {/***address***/}
          <h3 className="text-lg font-semibold">Choose your address</h3>
          <div className="bg-white p-2 grid gap-4">
            {addressList.length === 0 ? (
              <div className="text-red-500">
                No address found. Please add an address to proceed.
              </div>
            ) : (
              addressList.map((address, index) => {
                return (
                  <label
                    htmlFor={'address' + index}
                    key={address._id}
                    className={!address.status ? 'hidden' : undefined}
                  >
                    <div className="border rounded p-3 flex gap-3 hover:bg-blue-50">
                      <div>
                        <input
                          id={'address' + index}
                          type="radio"
                          value={index}
                          onChange={(e) => setSelectAddress(e.target.value)}
                          name="address"
                          checked={selectAddress === index}
                        />
                      </div>
                      <div>
                        <p>{address.address_line}</p>
                        <p>{address.city}</p>
                        <p>{address.state}</p>
                        <p>
                          {address.country} - {address.pincode}
                        </p>
                        <p>{address.mobile}</p>
                      </div>
                    </div>
                  </label>
                );
              })
            )}
            <div
              onClick={() => setOpenAddress(true)}
              className="h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer"
            >
              Add address
            </div>
          </div>
        </div>

        <div className="w-full max-w-md bg-white py-4 px-2">
          {/**summary**/}
          <h3 className="text-lg font-semibold">Summary</h3>
          <div className="bg-white p-4">
            <h3 className="font-semibold">Bill details</h3>
            <div className="flex gap-4 justify-between ml-1">
              <p>Items total</p>
              <p className="flex items-center gap-2">
                <span className="line-through text-neutral-400">
                  {DisplayPriceInRupees(notDiscountTotalPrice)}
                </span>
                <span>{DisplayPriceInRupees(totalPrice)}</span>
              </p>
            </div>
            <div className="flex gap-4 justify-between ml-1">
              <p>Quantity total</p>
              <p className="flex items-center gap-2">{totalQty} item</p>
            </div>
            <div className="flex gap-4 justify-between ml-1">
              <p>Delivery Charge</p>
              <p className="flex items-center gap-2">Free</p>
            </div>
            <div className="font-semibold flex items-center justify-between gap-4">
              <p>Grand total</p>
              <p>{DisplayPriceInRupees(totalPrice)}</p>
            </div>
          </div>
          <div className="w-full flex flex-col gap-4">
            <button
              className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleOnlinePayment}
              disabled={addressList.length === 0}
            >
              Online Payment
            </button>

            <button
              className="py-2 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed"
              onClick={handleCashOnDelivery}
              disabled={addressList.length === 0}
            >
              Cash on Delivery
            </button>
          </div>
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;