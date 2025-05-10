import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe, getALLOrderDetailsController, getOrderDetailsById, updateDeliveryStatus } from '../controllers/order.controller.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/webhook',webhookStripe)
orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.get("/get-orders",auth,getALLOrderDetailsController)
orderRouter.get("/order-details/:orderId", auth, getOrderDetailsById)
orderRouter.post("/update-delivery-status/:orderId", updateDeliveryStatus)

export default orderRouter