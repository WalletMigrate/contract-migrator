import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { vars } from "hardhat/config";

const INFURA_API_KEY = vars.get("INFURA_API_KEY");
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");
const PRIVATE_KEY = vars.get("PRIVATE_KEY");
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    base: {
      url: `https://base.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    baseSepolia: {
      url: `https://base-sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    flow: {
      url: `https://mainnet.evm.nodes.onflow.org`,
      accounts: [PRIVATE_KEY],
    },
    flowTestnet: {
      url: `https://testnet.evm.nodes.onflow.org/`,
      accounts: [PRIVATE_KEY],
    },
    alfajores: {
      url: `https://alfajores-forno.celo-testnet.org`,
      accounts: [PRIVATE_KEY],
    },
    celo: {
      url: `https://celo-mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: {
      'evm-on-flow': ETHERSCAN_API_KEY,
      'celo-alfajores': ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "evm-on-flow",
        chainId: 747,
        urls: {
          apiURL: "https://evm.flowscan.io/api",
          browserURL: "https://evm.flowscan.io"
        }
      },
      {
        network: "celo-alfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://celo-alfajores.blockscout.com/api",
          browserURL: "https://celo-alfajores.blockscout.com"
        }
      }
    ]
  },
};

export default config;
