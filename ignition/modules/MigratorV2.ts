import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zeroAddress } from "viem";

const MigratorModuleV2 = buildModule("MigratorModuleV2", (m) => {
    const migrator = m.contract("Migrator7702", []);
  
    return { migrator };
  });
  
  export default MigratorModuleV2;
  