import React from 'react'
import { useSelector } from 'react-redux'
import isDelivery from '../utils/isDelivery'

const DeliveryPermision = ({children}) => {
    const user = useSelector(state => state.user)


  return (
    <>
        {
            isDelivery(user.role) ?  children : <p className='text-red-600 bg-red-100 p-4'>Do not have permission</p>
        }
    </>
  )
}

export default DeliveryPermision
