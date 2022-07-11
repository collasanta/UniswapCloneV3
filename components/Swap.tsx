import React, { useContext, useState } from 'react'
import Image from 'next/image'
import { RiSettings3Fill } from 'react-icons/ri'
import { AiOutlineDown } from 'react-icons/ai'
import maticLogo from '../assets/matic.png'
import thirdLogo from '../assets/third.png'
import { TransactionContext } from '../context/TransactionContext'
import Modal from 'react-modal'
import { useRouter } from 'next/router'
import TransactionLoader from './TransactionLoader'


const style = {
   wrapper: `w-screen flex items-center justify-center mt-14`,
   content: `bg-[#ffffff] w-[35rem] rounded-2xl p-4`,
   formHeader: `px-2 flex items-center justify-between font-semibold text-xl text-[#00000c]`,
   transferPropContainer: `bg-[#f7f8fa] my-3 rounded-2xl p-6 text-3xl border hover:border-[#cfd0d4] flex justify-between`,
   transferPropInput: `bg-transparent placeholder:text-[#B2B9D2] outline-none mb-6 w-full text-2xl text-[#00000c]`,
   currencySelector: `flex w-2/5`,
   currencySelectorContent: `w-full h-min flex justify-between items-center shadow-md bg-[#edeef2] hover:bg-[#c2c3c5] rounded-2xl text-[#00000c] text-xl font-medium cursor-pointer p-2 mt-[-0.2rem]`,
   currencySelectorIcon: `flex items-center`,
   currencySelectorTicker: `mx-2`,
   currencySelectorArrow: `text-lg`,
   confirmButton: `bg-[#e8006f] hover:bg-[#cf0063] my-2 rounded-2xl py-6 px-8 text-xl text-[white] font-semibold flex items-center justify-center cursor-pointer`,
 }

 const customStyles = {
   content: {
     top: '50%',
     left: '50%',
     right: 'auto',
     bottom: 'auto',
     transform: 'translate(-50%, -50%)',
     backgroundColor: '#0a0b0d',
     padding: 0,
     border: 'none',
   },
   overlay: {
     backgroundColor: 'rgba(10, 11, 13, 0.75)',
   },
 }

const Swap = () => {
   const router = useRouter()
   const [amountMatic, setAmountMatic] = useState()
   const [amountTHIRD, setAmountTHIRD] = useState()
   const [amountTHIRDplaceholder, setAmountTHIRDplaceholder] = useState(33)

   const handleChange = (event) => {
    setAmountMatic(event.target.value);
    console.log("cahnge", amountMatic)
  }

  const { getPrice } = useContext(TransactionContext)

  return (
   <div className={style.wrapper}>
      <div className={style.content}>
         <div className={style.formHeader}>
            <div>Swap Tokens </div>
            <div>
            <RiSettings3Fill />
            </div>
        </div>

        <div className={style.transferPropContainer}>
          <input
            type='text'
            className={style.transferPropInput}
            placeholder='1.0'
            pattern='^[0-9]*[.,]?[0-9]*$'
            onChange={e => handleChange(e)}
          />
          <div className={style.currencySelector}>
            <div className={style.currencySelectorContent}>
              <div className={style.currencySelectorIcon}>
                <Image src={maticLogo} alt='eth logo' height={27} width={27} />
              </div>
              <div className={style.currencySelectorTicker}>MATIC</div>
              <AiOutlineDown className={style.currencySelectorArrow} />
            </div>
          </div>
         </div>

        <div className={style.transferPropContainer}>
          <input
            type='text'
            className={style.transferPropInput}
            placeholder={`${amountTHIRDplaceholder}.0`}
            value={amountTHIRD}
            pattern='^[0-9]*[.,]?[0-9]*$'
            onChange={e => handleChange(e)}
          />
          <div className={style.currencySelector}>
            <div className={style.currencySelectorContent}>
              <div className={style.currencySelectorIcon}>
                <Image src={thirdLogo} alt='third logo' height={27} width={27} />
              </div>
              <div className={style.currencySelectorTicker}>THIRD</div>
              <AiOutlineDown className={style.currencySelectorArrow} />
            </div>
          </div>
         </div>

         
         <div onClick={e => getPrice() } className={style.confirmButton}>
          Confirm
        </div>
         

      </div>

      <Modal isOpen={!!router.query.loading} style={customStyles}>
        <TransactionLoader />
      </Modal>

   </div>      
  )
}

export default Swap