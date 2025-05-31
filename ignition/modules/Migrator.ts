import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zeroAddress } from "viem";

const MigratorModule = buildModule("MigratorModule", (m) => {
    const migrator = m.contract("Migrator", [zeroAddress, zeroAddress]);
  
    return { migrator };
  });
  
  export default MigratorModule;
  