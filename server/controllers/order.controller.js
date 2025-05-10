// import Stripe from "../config/stripe.js";
import stripe from 'stripe'
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import AddressModel from "../models/address.model.js";
import mongoose from "mongoose";

export async function CashOnDeliveryOrderController(request, response) {
    try {
        const userId = request.userId; 
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

        const payload = {
            userId: userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            products: list_items.map(el => ({
                productId: el.productId._id,
                product_details: {
                    name: el.productId.name,
                    image: el.productId.image
                },
                quantity: el.quantity || 1, // Default to 1 if quantity is not provided
                price: el.productId.price // Assuming the price is available in the product object
            })),
            paymentId: "",
            payment_status: "CASH ON DELIVERY",
            delivery_address: addressId,
            subTotalAmt: subTotalAmt, // Sum of (quantity * price) for all products
            totalAmt: totalAmt // Including taxes, discounts, etc.
        };

        // Insert the order into the database
        const generatedOrder = await OrderModel.create(payload);

        // Remove items from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId: userId });
        const updateInUser = await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

        return response.json({
            message: "Order placed successfully",
            error: false,
            success: true,
            data: generatedOrder
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


const Stripe = stripe(process.env.STRIPE_SECRET_KEY)
export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}


export async function paymentController(request, response) {
    try {
        const userId = request.userId; // Assuming this is set by an auth middleware
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;
        console.log("paymentController called"); // Debug log
        console.log("Request Body:", request.body); // Debug request body

        // Validate list_items
        if (!list_items || !Array.isArray(list_items) || list_items.length === 0) {
            return response.status(400).json({
                message: "Invalid or empty list_items",
                error: true,
                success: false
            });
        }

        // Validate each item in list_items
        for (const item of list_items) {
            if (!item.productId || !item.productId.name || !item.productId.price || !item.quantity) {
                return response.status(400).json({
                    message: "Invalid product data in list_items",
                    error: true,
                    success: false
                });
            }
        }

        const user = await UserModel.findById(userId);

        // Create line_items for Stripe
        const line_items = list_items.map(item => {
            return {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.productId.name,
                        images: item.productId.image,
                        metadata: {
                            productId: item.productId._id
                        }
                    },
                    unit_amount: pricewithDiscount(item.productId.price, item.productId.discount) * 100
                },
                adjustable_quantity: {
                    enabled: true,
                    minimum: 1
                },
                quantity: item.quantity
            };
        });

        // Create Stripe session
        const params = {
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: user.email,
            metadata: {
                userId: userId,
                addressId: addressId
            },
            line_items: line_items,
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`
        };

        console.log("Stripe Params:", params); // Debug Stripe params

        const session = await Stripe.checkout.sessions.create(params)
            .catch(err => {
                console.error("Stripe Session Creation Error:", err);
                throw new Error(`Stripe session creation failed: ${err.message}`);
            });

        console.log("Stripe session created successfully:", session);

        // Create a single order with multiple products
        const orderPayload = {
            userId: userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            products: list_items.map(item => ({
                productId: item.productId._id,
                product_details: {
                    name: item.productId.name,
                    image: item.productId.image
                },
                quantity: item.quantity || 1, // Default to 1 if quantity is not provided
                price: pricewithDiscount(item.productId.price, item.productId.discount) // Use discounted price
            })),
            paymentId: session.id, // Use Stripe session ID as paymentId
            payment_status: "PAID-ONLINE", // Set payment status to PAID
            delivery_address: addressId,
            subTotalAmt: subTotalAmt, // Sum of (quantity * price) for all products
            totalAmt: totalAmt // Including taxes, discounts, etc.
        };

        // Insert the order into the database
        const generatedOrder = await OrderModel.create(orderPayload)
            .catch(err => {
                console.error("Order Creation Error:", err);
                throw err;
            });

        // Remove items from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId: userId })
            .catch(err => {
                console.error("Cart Deletion Error:", err);
                throw err;
            });

        const updateInUser = await UserModel.updateOne({ _id: userId }, { shopping_cart: [] })
            .catch(err => {
                console.error("User Update Error:", err);
                throw err;
            });

        return response.status(200).json({
            message: "Payment and order processed successfully",
            session: session,
            order: generatedOrder,
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Error in paymentController:", error); // Log the full error
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}       


const getOrderProductItems = async({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
 })=>{
    const productList = []

    if(lineItems?.data?.length){
        for(const item of lineItems.data){
            const product = await Stripe.products.retrieve(item.price.product)

            const paylod = {
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : product.metadata.productId, 
                product_details : {
                    name : product.name,
                    image : product.images
                } ,
                paymentId : paymentId,
                payment_status : payment_status,
                delivery_address : addressId,
                subTotalAmt  : Number(item.amount_total / 100),
                totalAmt  :  Number(item.amount_total / 100),
            }

            productList.push(paylod)
        }
    }

    return productList
}

//http://localhost:8080/api/order/webhook
export async function webhookStripe(request,response){
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY

    console.log("event",event)

    // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id)
      const userId = session.metadata.userId
      const orderProduct = await getOrderProductItems(
        {
            lineItems : lineItems,
            userId : userId,
            addressId : session.metadata.addressId,
            paymentId  : session.payment_intent,
            payment_status : session.payment_status,
        })
    
      const order = await OrderModel.insertMany(orderProduct)

        console.log(order)
        if(Boolean(order[0])){
            const removeCartItems = await  UserModel.findByIdAndUpdate(userId,{
                shopping_cart : []
            })
            const removeCartProductDB = await CartProductModel.deleteMany({ userId : userId})
        }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}




export const getALLOrderDetailsController = async (req, res) => {
    try {
        const orders = await OrderModel.find()
        
        res.status(200).json({
            success: true,
            message: "All orders fetched successfully",
            data: orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        });
    }
};



export const getOrderDetailsById = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await OrderModel.findOne({ orderId })
            .populate({
                path: 'userId',
                select: 'name email avatar',
                model: UserModel  // Use the imported model directly
            })
            .populate({
                path: 'products.productId',
                select: 'name image price discount',
                model: ProductModel  // Use the imported model
            })
            .populate({
                path: 'delivery_address',
                select: 'address_line city state pincode country mobile',
                model: AddressModel  // Make sure you have this model defined
            })
            .lean();  // Convert to plain JS object

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Transform the products array
        const transformedOrder = {
            ...order,
            products: order.products.map(item => ({
                ...item,
                product: item.productId,  // Move product details here
                productId: undefined      // Remove the duplicate
            }))
        };

        res.status(200).json({
            success: true,
            data: transformedOrder
        });
        
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};




// const { sendNotification } = require('../utils/notificationService');

export const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { delivery_status } = req.body;
        console.log("updateDeliveryStatus called", orderId, delivery_status); // Debug log
        // Validate input
        if (!delivery_status || !['pending', 'delivered', 'cancelled'].includes(delivery_status.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid delivery status. Must be one of: pending, processing, shipped, delivered, cancelled'
            });
        }

        // Find the order
        const order = await OrderModel.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if status is being changed to the same value
        if (order.delivery_status.toLowerCase() === delivery_status.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: `Order is already marked as ${delivery_status}`
            });
        }

        // Update the order status
        order.delivery_status = delivery_status.toLowerCase();
        
        // If marking as delivered, set deliveredAt timestamp
        if (delivery_status.toLowerCase() === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        // // Send notification to user about status change
        // await sendNotification({
        //     userId: order.userId,
        //     title: 'Order Status Updated',
        //     message: `Your order ${orderId} status has been updated to ${delivery_status}`,
        //     type: 'order_update'
        // });

        res.status(200).json({
            success: true,
            message: `Order status updated to ${delivery_status} successfully`,
            data: {
                orderId: order.orderId,
                delivery_status: order.delivery_status,
                // deliveredAt: order.deliveredAt
            }
        });

    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};