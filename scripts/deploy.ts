import { createPublicClient, http, createWalletClient, formatEther } from 'viem'
import { mainnet } from 'viem/chains'
import hre from 'hardhat'
import dotenv from 'dotenv'

dotenv.config()

async function checkBalance(client: any, address: string) {
  const balance = await client.getBalance({ address })
  console.log('Mainnet Balance:', formatEther(balance), 'ETH')
  return balance
}

async function main() {
  // Configuración del cliente para Mainnet
  const mainnetClient = createPublicClient({
    chain: mainnet,
    transport: http(process.env.MAINNET_RPC_URL)
  })

  const mainnetWallet = createWalletClient({
    chain: mainnet,
    transport: http(process.env.MAINNET_RPC_URL),
    account: process.env.PRIVATE_KEY as `0x${string}`
  })

  // Verificar balance
  const walletAddress = process.env.PRIVATE_KEY ? `0x${process.env.PRIVATE_KEY.slice(-40)}` : ''
  console.log('Verificando balance en Mainnet...')
  const mainnetBalance = await checkBalance(mainnetClient, walletAddress)

  if (mainnetBalance === 0n) {
    console.error('❌ No hay fondos en Mainnet. Necesitas ETH real para desplegar.')
    process.exit(1)
  }

  console.log('Desplegando contrato en Mainnet...')
  
  try {
    // Desplegar el contrato
    const contract = await hre.viem.deployContract('Migrator7702', [], {
      account: mainnetWallet.account,
    })

    console.log('✅ Contrato desplegado exitosamente en Mainnet')
    console.log('Dirección del contrato:', contract.address)
    
    // Verificar el contrato en Etherscan
    console.log('Esperando 5 bloques para verificar el contrato...')
    await contract.waitForDeployment()
    
    console.log('Verificando contrato en Etherscan...')
    await hre.run('verify:verify', {
      address: contract.address,
      constructorArguments: [],
    })
    
    console.log('✅ Contrato verificado en Etherscan')
  } catch (error) {
    console.error('❌ Error al desplegar el contrato:', error)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 