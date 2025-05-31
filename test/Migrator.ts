import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { foundry } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { zeroAddress } from 'viem'
import { getContractAbi, deployContract } from './utils' // helper functions
import { assert } from 'chai'

const RPC_URL = 'https://eth-sepolia.public.blastapi.io'
const chain = foundry

describe('Migrator via Viem', function () {
  it('should transfer ERC20 tokens from user to recipient using transferFrom', async () => {
    const publicClient = createPublicClient({
      chain,
      transport: http(RPC_URL),
    })

    const walletClient = createWalletClient({
      chain,
      transport: http(RPC_URL),
    })

    const userAccount = privateKeyToAccount(
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' // wallet A (test)
    )

    const recipient = '0xc86A2B3eA295cD70bad34C7871a733e75356C014' // wallet B

    // 1. Deploy MockERC20
    const tokenAbi = getContractAbi('MockERC20')
    const token = await deployContract('MockERC20', ['MockToken', 'MTK', 18], userAccount, tokenAbi)

    // 2. Mint tokens to wallet A
    const mintHash = await walletClient.sendTransaction({
      account: userAccount,
      to: token.address,
      data: token.abi.encodeFunctionData('mint', [userAccount.address, parseEther('100')]),
    })
    await publicClient.waitForTransactionReceipt({ hash: mintHash })

    // 3. Deploy Migrator
    const migratorAbi = getContractAbi('Migrator')
    const migrator = await deployContract('Migrator', [zeroAddress, zeroAddress], userAccount, migratorAbi)

    // 4. Approve migrator
    const approveHash = await walletClient.sendTransaction({
      account: userAccount,
      to: token.address,
      data: token.abi.encodeFunctionData('approve', [migrator.address, parseEther('100')]),
    })
    await publicClient.waitForTransactionReceipt({ hash: approveHash })

    // 5. Execute migration
    const callData = migrator.abi.encodeFunctionData('executeMigration', [
      recipient,
      [token.address],
      [],
      [],
    ])

    const migrateHash = await walletClient.sendTransaction({
      account: userAccount,
      to: migrator.address,
      data: callData,
    })
    await publicClient.waitForTransactionReceipt({ hash: migrateHash })

    // 6. Check recipient balance
    const recipientBalance = await publicClient.readContract({
      address: token.address,
      abi: tokenAbi,
      functionName: 'balanceOf',
      args: [recipient],
    })

    assert.equal(recipientBalance.toString(), parseEther('100').toString())
  })
})
