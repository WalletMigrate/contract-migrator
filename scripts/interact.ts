import { createPublicClient, http, createWalletClient, parseEther } from 'viem'
import { sepolia, mainnet } from 'viem/chains'
import hre from 'hardhat'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  // Configuración de clientes para Sepolia
  const sepoliaClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL)
  })

  const sepoliaWallet = createWalletClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
    account: process.env.PRIVATE_KEY as `0x${string}`
  })

  // Configuración de clientes para Mainnet
  const mainnetClient = createPublicClient({
    chain: mainnet,
    transport: http(process.env.MAINNET_RPC_URL)
  })

  const mainnetWallet = createWalletClient({
    chain: mainnet,
    transport: http(process.env.MAINNET_RPC_URL),
    account: process.env.PRIVATE_KEY as `0x${string}`
  })

  // Ejemplo de interacción con un contrato en Sepolia
  const sepoliaContract = await hre.viem.getContractAt(
    'Migrator7702',
    '0x1321137607f57a6524e5DefE416A452Ea47ac3F9' // Dirección del contrato en Sepolia
  )

  // Ejemplo de interacción con un contrato en Mainnet
  const mainnetContract = await hre.viem.getContractAt(
    'Migrator7702',
    '0x4648f1ce88DA239E1D004A8A3D2a24E3c0082Ee9' // Dirección del contrato en Mainnet
  )

  // Ejemplo de llamada a una función en Sepolia
  try {
    const sepoliaResult = await sepoliaContract.read.owner()
    console.log('Sepolia owner:', sepoliaResult)
  } catch (error) {
    console.error('Error en Sepolia:', error)
  }

  // Ejemplo de llamada a una función en Mainnet
  try {
    const mainnetResult = await mainnetContract.read.owner()
    console.log('Mainnet owner:', mainnetResult)
  } catch (error) {
    console.error('Error en Mainnet:', error)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 