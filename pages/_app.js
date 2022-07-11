import '../styles/globals.css'
import { TransactionProvider } from '../context/TransactionContext'
import Header from '../components/Header'

const style = {
  wrapper: `h-screen max-h-screen h-min-screen w-screen bg-[#f3f6ff] text-white select-none flex flex-col justify-between`
}

function MyApp({ Component, pageProps }) {
  return (
    <div className={style.wrapper}> 
    <TransactionProvider>
      <Header/>
      <Component {...pageProps} />
    </TransactionProvider>
    </div>
  )
}

export default MyApp