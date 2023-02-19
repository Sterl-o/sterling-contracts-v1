import {Deploy} from "../Deploy";
import {ethers} from "hardhat";
import {Verify} from "../../Verify";
import {Misc} from "../../Misc";
import {FantomAddresses} from "../../addresses/FantomAddresses";

async function main() {
  const signer = (await ethers.getSigners())[0];

  const FACTORY = '0xF7A23B9A9dCB8d0aff67012565C5844C20C11AFC';

  const router = await Deploy.deployStrRouter01(signer, FACTORY, FantomAddresses.WETH_TOKEN);

  await Misc.wait(5);
  await Verify.verifyWithArgs(router.address, [FACTORY, FantomAddresses.WETH_TOKEN]);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
