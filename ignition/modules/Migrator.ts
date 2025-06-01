import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zeroAddress } from "viem";

const MigratorModule = buildModule("MigratorModule", (m) => {
    const migrator = m.contract("Migrator7702", [], {
        from: "0x86300e0a857aab39a601e89b0e7f15e1488d9f0c"
    });
  
    return { migrator };
  });
  
  export default MigratorModule;
  