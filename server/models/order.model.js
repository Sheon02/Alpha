import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // Changed from Schema.ObjectId
        ref: 'User',
        required: true
    },
    orderId: {
        type: String,
        required: [true, "Provide orderId"],
        unique: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",  // Capitalized to match model name
            required: true
        },
        product_details: {
            name: String,
            image: [String],  // Changed from Array to [String] for clarity
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    paymentId: {
        type: String,
        default: ""
    },
    payment_status: {
        type: String,
        default: ""//"PAID" if online payment  "CASH ON DELIVERY" if cash on delivery
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    subTotalAmt: {
        type: Number,
        default: 0
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    invoice_receipt: {
        type: String,
        default: ""
    },
    delivery_status: {
        type: String,
        enum: ["pending", "delivered", "cancelled"],
        default: "pending"
    }
}, {
    timestamps: true
});

const OrderModel = mongoose.model('order', orderSchema);

export default OrderModel;