import React, {useState, useEffect} from 'react'
import { contractABI, contractAddress } from '../lib/constants'
import { ethers } from 'ethers'
import { client} from '../lib/sanityClient'
import { useRouter } from 'next/router'
export const TransactionContext = React.createContext()
const { AlphaRouter } = require('@uniswap/smart-order-router')
const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core')
const JSBI = require('jsbi')

const web3Provider =new ethers.providers.JsonRpcProvider("https://matic-mumbai.chainstacklabs.com")
const chainId = 80001
const router = new AlphaRouter({ chainId, provider: web3Provider })

const fMATIC = new Token(chainId, '0x514e44C30d8f1CC846bfFC2611d0eee1AcCaFc3a', 18, 'fMATIC', 'fMATIC')
const fMWP = new Token(chainId, '0xd2B2Ad7252AA2f633223c9863dd979772E7FB416', 18, 'fMWP', 'fMWP')


// const inputAmount = 1
const slippageAmount = 5
const deadline = Math.floor(Date.now()/1000 + (10 * 60))
const walletAddress = "0xd77534B4B6cFC1AeE365Bd7114a69179354AA7fd"

let eth

if (typeof window !== 'undefined') {
   eth = window.ethereum
}

const getEthereumContract = () => {
   const provider = new ethers.providers.Web3Provider(ethereum)
   const signer = provider.getSigner()
   const transactionContract = new ethers.Contract(
     contractAddress,
     contractABI,
     signer,
   )
 
   return transactionContract
 }


export const TransactionProvider = ({ children }) => {
   const [currentAccount, setCurrentAccount] = useState()
   const [isLoading, setIsLoading] = useState(false)
   const [formData, setFormData] = useState({
     addressTo: '',
     amount: '',
   })
   const routerx = useRouter()

   useEffect(()=>{
      checkIfWalletIsConnected()
   })

   useEffect(() => {
      if (!currentAccount) return
      ;(async () => {
        const userDoc = {
          _type: 'users',
          _id: currentAccount,
          userName: 'Unnamed',
          address: currentAccount,
        }
  
        await client.createIfNotExists(userDoc)
      })()
    }, [currentAccount])

    async function getPrice(amountIn) {
      const weiAmountIn = ethers.utils.parseUnits(amountIn.toString(), 18)
      const inputAmount = CurrencyAmount.fromRawAmount(fMATIC, JSBI.BigInt(weiAmountIn))

      const swapParams = {
        deadline: deadline,
        recipient: walletAddress,
        slippageTolerance: new Percent(slippageAmount, 100),
      }
  
      const route = await router.route(inputAmount, fMWP, TradeType.EXACT_INPUT, swapParams)
      const quoteAmountOut = route.quote.toFixed(3)
      // console.log(quoteAmountOut)
      console.log("getPrice", quoteAmountOut)
      return [
        quoteAmountOut
      ]
    }



   const connectWallet = async (metamask = eth) => {
      try {
        if (!metamask) return alert('Please install metamask ')
  
        const accounts = await metamask.request({ method: 'eth_requestAccounts' })
  
        setCurrentAccount(accounts[0])
      } catch (error) {
        console.error(error)
        throw new Error('No ethereum object.')
      }
   }

   const checkIfWalletIsConnected = async (metamask = eth) => {
      try {
        if (!metamask) return alert('Please install metamask ')
  
        const accounts = await metamask.request({ method: 'eth_accounts' })
  
        if (accounts.length) {
          setCurrentAccount(accounts[0])
          console.log('wallet already connected')
        }
      } catch (error) {
        console.error(error)
        throw new Error('No ethereum object.')
      }
   }

   const sendTransaction = async (
      metamask = eth,
      connectedAccount = currentAccount,
    ) => {
      try {
        if (!metamask) return alert('Please install metamask ')
        const { addressTo, amount } = formData
        const transactionContract = getEthereumContract()
  
        const parsedAmount = ethers.utils.parseEther(amount)
  
        await metamask.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: connectedAccount,
              to: addressTo,
              gas: '0x7EF40', // 520000 Gwei
              value: parsedAmount._hex,
            },
          ],
        })
  
        const transactionHash = await transactionContract.publishTransaction(
          addressTo,
          parsedAmount,
          `Transferring ETH ${parsedAmount} to ${addressTo}`,
          'TRANSFER',
        )
  
        setIsLoading(true)
  
        await transactionHash.wait()
  
        await saveTransaction(
          transactionHash.hash,
          amount,
          connectedAccount,
          addressTo,
        )
  
        setIsLoading(false)
      } catch (error) {
        console.log(error)
      }
    }

    const handleChange = (e, name) => {
      setFormData(prevState => ({ ...prevState, [name]: e.target.value }))
    }

    const saveTransaction = async (
      txHash,
      amount,
      fromAddress = currentAccount,
      toAddress,
    ) => {
      const txDoc = {
        _type: 'transactions',
        _id: txHash,
        fromAddress: fromAddress,
        toAddress: toAddress,
        timestamp: new Date(Date.now()).toISOString(),
        txHash: txHash,
        amount: parseFloat(amount),
      }
  
      await client.createIfNotExists(txDoc)
  
      await client
        .patch(currentAccount)
        .setIfMissing({ transactions: [] })
        .insert('after', 'transactions[-1]', [
          {
            _key: txHash,
            _ref: txHash,
            _type: 'reference',
          },
        ])
        .commit()
  
      return
    }

    useEffect(()=>{
       if (isLoading) {
          routerx.push(`/?loading=${currentAccount}`)
       } else {
          routerx.push(`/`)
       }
    }, [isLoading])


   return (
      <TransactionContext.Provider
         value={{
            currentAccount,
            connectWallet,
            sendTransaction,
            handleChange,
            formData,
            isLoading,
            getPrice,
         }}
      >
         {children}
      </TransactionContext.Provider>
   )

}

