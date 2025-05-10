import React, { useEffect, useState } from 'react';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import toast from 'react-hot-toast'
import SummaryApi from '../common/SummaryApi';
import DisplayTable from '../components/DisplayTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Button, Dialog, DialogTitle, DialogContent, CircularProgress, Box, Typography, Divider } from '@mui/material';

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const columnHelper = createColumnHelper();

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getOrders
      });
      const { data: responseData } = response;
  
      if (responseData.success) {
        // Sort orders by createdAt in descending order (newest first)
        const sortedOrders = [...responseData.data].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setOrders(sortedOrders);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      const response = await Axios({
        method: 'get',
        url: `/api/order/order-details/${orderId}`,
      });
      
      if (response.data.success) {
        setOrderDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    setSelectedOrder(orderId);
    setOpenModal(true);
    await fetchOrderDetails(orderId);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setOrderDetails(null);
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setDetailsLoading(true);
      const response = await Axios({
        method: 'post',
        url: `/api/order/update-delivery-status/${selectedOrder}`,
        data: {
          delivery_status: newStatus
        }
      });

      if (response.data.success) {
        // Update the order in the local state
        setOrders(orders.map(order => 
          order.orderId === selectedOrder 
            ? { ...order, delivery_status: newStatus } 
            : order
        ));
        
        toast.success(`Order status updated to ${newStatus} successfully!`);
        // Close the modal
        handleCloseModal();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'orange';
      case 'processing':
        return 'blue';
      case 'shipped':
        return 'purple';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'black';
    }
  };

  const columns = [
    columnHelper.accessor('createdAt', {
      header: () => <div style={{ textAlign: 'center' }}>Order Date</div>,
      cell: ({ row }) => (
        <div style={{ textAlign: 'center' }}>
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    }),
    columnHelper.accessor('orderId', {
      header: () => <div style={{ textAlign: 'center' }}>Order ID</div>,
      cell: (info) => (
        <div style={{ textAlign: 'center' }}>{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor('delivery_status', {
      header: () => <div style={{ textAlign: 'center' }}>Order Status</div>,
      cell: (info) => (
        <div style={{ 
          textAlign: 'center',
          color: getStatusColor(info.getValue()),
          fontWeight: 'bold',
          textTransform: 'capitalize'
        }}>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('payment_status', {
      header: () => <div style={{ textAlign: 'center' }}>Payment Status</div>,
      cell: (info) => (
        <div style={{ textAlign: 'center' }}>{info.getValue()}</div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div style={{ textAlign: 'center' }}>Actions</div>,
      cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => handleViewOrder(row.original.orderId)}
          >
            View
          </Button>
        </div>
      ),
    }),
  ];

  return (
    <section>
      <div className='p-2 bg-white shadow-md flex items-center justify-between'>
        <h2 className='font-semibold'>All Orders</h2>
      </div>
      <div className='overflow-auto w-full max-w-[95vw]'>
        <DisplayTable data={orders} column={columns} />
      </div>

      {/* Order Details Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>Order Details - {selectedOrder}</DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            orderDetails && (
              <Box>
                {/* Order Summary */}
                <Box mb={3}>
                  <Typography variant="h6">Order Summary</Typography>
                  <Typography>Date: {new Date(orderDetails.createdAt).toLocaleString()}</Typography>
                  <Typography>
                    Delivery Status: 
                    <span style={{ 
                      color: getStatusColor(orderDetails.delivery_status),
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {orderDetails.delivery_status}
                    </span>
                  </Typography>
                  <Typography>Payment Status: {orderDetails.payment_status}</Typography>
                  <Typography>Order ID: {orderDetails.orderId}</Typography>
                </Box>
                <Divider />
            
                {/* Customer Info */}
                <Box my={3}>
                  <Typography variant="h6">Customer Information</Typography>
                  {orderDetails.userId && (
                    <>
                      <Typography>Name: {orderDetails.userId.name}</Typography>
                      <Typography>Email: {orderDetails.userId.email}</Typography>
                      {orderDetails.userId.avatar && (
                        <Box mt={1} mb={2}>
                          {/* <img 
                            src={orderDetails.userId.avatar} 
                            alt="Customer Avatar" 
                            style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} 
                          /> */}
                        </Box>
                      )}
                    </>
                  )}
                  {orderDetails.delivery_address && (
                    <>
                      <Typography variant="subtitle1" mt={2}>Delivery Address:</Typography>
                      <Typography>Address: {orderDetails.delivery_address.address_line}</Typography>
                      <Typography>City: {orderDetails.delivery_address.city}</Typography>
                      <Typography>State: {orderDetails.delivery_address.state}</Typography>
                      <Typography>Pincode: {orderDetails.delivery_address.pincode}</Typography>
                      <Typography>Country: {orderDetails.delivery_address.country}</Typography>
                      <Typography>Mobile: {orderDetails.delivery_address.mobile}</Typography>
                    </>
                  )}
                </Box>
                <Divider />
            
                {/* Order Items */}
                <Box my={3}>
                  <Typography variant="h6">Order Items</Typography>
                  {orderDetails.products?.map((item, index) => {
                    const product = item.product || item.productId;
                    const productImage = product?.image?.[0] || item.product_details?.image?.[0];
                    const productName = product?.name || item.product_details?.name;
                    const productPrice = item.price || product?.price;
                    const productDiscount = product?.discount;

                    return (
                      <Box key={index} p={2} my={1} border={1} borderRadius={1}>
                        <Box display="flex" gap={2}>
                          {productImage && (
                            <img 
                              src={productImage} 
                              alt={productName} 
                              style={{ width: 80, height: 80, objectFit: 'contain' }} 
                            />
                          )}
                          <Box flexGrow={1}>
                            <Typography fontWeight="bold">{productName}</Typography>
                            <Typography>Quantity: {item.quantity}</Typography>
                            <Typography>Price: ₹{productPrice?.toFixed(2)}</Typography>
                            {productDiscount > 0 && (
                              <Typography color="error">Discount: {productDiscount}%</Typography>
                            )}
                            <Typography fontWeight="bold">
                              Subtotal: ₹{(productPrice * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                <Divider />
            
                {/* Order Total */}
                <Box mt={3}>
                  <Typography variant="body1">Subtotal: ₹{orderDetails.subTotalAmt?.toFixed(2)}</Typography>
                  <Typography variant="h6">Total Amount: ₹{orderDetails.totalAmt?.toFixed(2)}</Typography>
                </Box>
              </Box>
            )
          )}
        </DialogContent>
        <Box p={2} display="flex" justifyContent="space-between">
          {orderDetails?.delivery_status !== 'delivered' && (
            <Button 
              onClick={() => handleUpdateStatus('delivered')} 
              variant="contained" 
              color="success"
              disabled={detailsLoading}
            >
              {detailsLoading ? <CircularProgress size={24} /> : "Mark as Delivered"}
            </Button>
          )}
          {/* {orderDetails?.delivery_status !== 'shipped' && (
            <Button 
              onClick={() => handleUpdateStatus('shipped')} 
              variant="contained" 
              color="info"
              disabled={detailsLoading}
            >
              {detailsLoading ? <CircularProgress size={24} /> : "Mark as Shipped"}
            </Button>
          )} */}
          {orderDetails?.delivery_status !== 'cancelled' && (
            <Button 
              onClick={() => handleUpdateStatus('cancelled')} 
              variant="contained" 
              color="error"
              disabled={detailsLoading}
            >
              {detailsLoading ? <CircularProgress size={24} /> : "Cancel Order"}
            </Button>
          )}
          <Button 
            onClick={handleCloseModal} 
            variant="contained" 
            color="primary"
            disabled={detailsLoading}
          >
            Close
          </Button>
        </Box>
      </Dialog>
    </section>
  );
};

export default AllOrdersPage;