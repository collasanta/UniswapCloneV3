import Header from '../components/Header'
import Swap from '../components/Swap'
import TransactionHistory from '../components/TransactionHistory'

const style = {
   wrapper: `h-screen max-h-screen h-min-screen w-screen bg-[#f3f6ff] text-white select-none flex flex-col justify-between`
}



export default function swap() {
  return (
   <div className={style.wrapper}> 
      <Swap />
      <TransactionHistory />
   </div>
  )
}
