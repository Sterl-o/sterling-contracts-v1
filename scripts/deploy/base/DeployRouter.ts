import {Deploy} from "../Deploy";
import {ethers} from "hardhat";
import {Verify} from "../../Verify";
import {Misc} from "../../Misc";
import {FantomAddresses} from "../../addresses/FantomAddresses";

async function main() {
  const signer = (await ethers.getSigners())[0];

  const FACTORY = '0xf7736500339d2a26B8D945F63E06d8a3E2F0B5cF';

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
