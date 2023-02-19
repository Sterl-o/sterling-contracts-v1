import {ethers, web3} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {Logger} from "tslog";
import logSettings from "../../log_settings";
import {BigNumber, Contract, ContractFactory, utils} from "ethers";
import {Libraries} from "hardhat-deploy/dist/types";
import {
  BribeFactory,
  Controller,
  Str,
  StrFactory,
  StrMinter,
  StrRouter01,
  StrVoter,
  GaugeFactory,
  GovernanceTreasury,
  Token,
  Ve
} from "../../typechain";
import {Misc} from "../Misc";
import {CoreAddresses} from "./CoreAddresses";
import { FantomAddresses } from "../addresses/FantomAddresses";

import ControllerAbi from "../../artifacts/contracts/Controller.sol/Controller.json"
import TokenAbi from "../../artifacts/contracts/base/token/Str.sol/Str.json"
import VeAbi from "../../artifacts/contracts/base/vote/Ve.sol/Ve.json"
import GaugesFactoryAbi from "../../artifacts/contracts/base/reward/GaugeFactory.sol/GaugeFactory.json"
import BribesFactoryAbi from "../../artifacts/contracts/base/reward/BribeFactory.sol/BribeFactory.json"
import VoterAbi from "../../artifacts/contracts/base/vote/StrVoter.sol/StrVoter.json"
import MinterAbi from "../../artifacts/contracts/base/token/StrMinter.sol/StrMinter.json"
const log: Logger = new Logger(logSettings);

const libraries = new Map<string, string>([
  ['', '']
]);

export class Deploy {

  // ************ CONTRACT CONNECTION **************************

  public static async deployContract<T extends ContractFactory>(
    signer: SignerWithAddress,
    name: string,
    // tslint:disable-next-line:no-any
    ...args: any[]
  ) {
    log.info(`Deploying ${name}`);
    log.info("Account balance: " + utils.formatUnits(await signer.getBalance(), 18));

    const gasPrice = await web3.eth.getGasPrice();
    log.info("Gas price: " + gasPrice);
    const lib: string | undefined = libraries.get(name);
    let _factory;
    if (lib) {
      log.info('DEPLOY LIBRARY', lib, 'for', name);
      const libAddress = (await Deploy.deployContract(signer, lib)).address;
      const librariesObj: Libraries = {};
      librariesObj[lib] = libAddress;
      _factory = (await ethers.getContractFactory(
        name,
        {
          signer,
          libraries: librariesObj
        }
      )) as T;
    } else {
      _factory = (await ethers.getContractFactory(
        name,
        signer
      )) as T;
    }
    const instance = await _factory.deploy(...args);
    log.info('Deploy tx:', instance.deployTransaction.hash);
    await instance.deployed();

    const receipt = await ethers.provider.getTransactionReceipt(instance.deployTransaction.hash);
    log.info('Receipt', receipt.contractAddress)
    return _factory.attach(receipt.contractAddress);
  }

  public static async deployStr(signer: SignerWithAddress) {
    return (await Deploy.deployContract(signer, 'Str')) as Str;
  }

  public static async deployToken(signer: SignerWithAddress, name: string, symbol: string, decimal: number) {
    return (await Deploy.deployContract(signer, 'Token', name, symbol, decimal, signer.address)) as Token;
  }

  public static async deployGaugeFactory(signer: SignerWithAddress) {
    return (await Deploy.deployContract(signer, 'GaugeFactory')) as GaugeFactory;
  }

  public static async deployBribeFactory(signer: SignerWithAddress) {
    return (await Deploy.deployContract(signer, 'BribeFactory')) as BribeFactory;
  }

  public static async deployStrFactory(signer: SignerWithAddress, treasury: string) {
    return (await Deploy.deployContract(signer, 'StrFactory', treasury)) as StrFactory;
  }

  public static async deployGovernanceTreasury(signer: SignerWithAddress) {
    return (await Deploy.deployContract(signer, 'GovernanceTreasury')) as GovernanceTreasury;
  }

  public static async deployStrRouter01(
    signer: SignerWithAddress,
    factory: string,
    networkToken: string,
  ) {
    return (await Deploy.deployContract(signer, 'StrRouter01', factory, networkToken)) as StrRouter01;
  }

  public static async deployVe(signer: SignerWithAddress, token: string, controller: string) {
    return (await Deploy.deployContract(signer, 'Ve', token, controller)) as Ve;
  }

  public static async deployStrVoter(
    signer: SignerWithAddress,
    ve: string,
    factory: string,
    gauges: string,
    bribes: string,
  ) {
    return (await Deploy.deployContract(
      signer,
      'StrVoter',
      ve,
      factory,
      gauges,
      bribes,
    )) as StrVoter;
  }

  public static async deployStrMinter(
    signer: SignerWithAddress,
    ve: string,
    controller: string,
    warmingUpPeriod: number
  ) {
    return (await Deploy.deployContract(
      signer,
      'StrMinter',
      ve,
      controller,
      warmingUpPeriod,
    )) as StrMinter;
  }

  public static async deployCore(
    signer: SignerWithAddress,
    networkToken: string,
    voterTokens: string[],
    minterClaimants: string[],
    minterClaimantsAmounts: BigNumber[],
    minterSum: BigNumber,
    warmingUpPeriod = 2
  ) {
    const [baseFactory, router
      // , treasury
    ] = await Deploy.deployDex(signer, networkToken);

    const [
      controller,
      token,
      gaugesFactory,
      bribesFactory,
      ve,
      voter,
      minter,
    ] = await Deploy.deployStrSystem(
      signer,
      networkToken,
      voterTokens,
      minterClaimants,
      minterClaimantsAmounts,
      minterSum,
      baseFactory.address,
      warmingUpPeriod,
    );

    return new CoreAddresses(
      token as Str,
      gaugesFactory as GaugeFactory,
      bribesFactory as BribeFactory,
      baseFactory as StrFactory,
      router as StrRouter01,
      ve as Ve,
      voter as StrVoter,
      minter as StrMinter,
      // treasury as GovernanceTreasury
    );
  }


  public static async deployDex(
    signer: SignerWithAddress,
    networkToken: string,
  ) {
    // const treasury = await Deploy.deployGovernanceTreasury(signer);
    const treasury = FantomAddresses.TreasuryWallet;
    const baseFactory = await Deploy.deployStrFactory(signer, treasury);
    // const baseFactory = await Deploy.deployStrFactory(signer, treasury.address);
    const router = await Deploy.deployStrRouter01(signer, baseFactory.address, networkToken);

    return [baseFactory, router
      // , treasury
    ];
  }

  public static async deployStrSystem(
    signer: SignerWithAddress,
    networkToken: string,
    voterTokens: string[],
    minterClaimants: string[],
    minterClaimantsAmounts: BigNumber[],
    minterSum: BigNumber,
    baseFactory: string,
    warmingUpPeriod: number,
  ) {
    const controller = await Deploy.deployContract(signer, 'Controller') as Controller;
    const token = await Deploy.deployStr(signer);
    const ve = await Deploy.deployVe(signer, token.address, controller.address);
    const gaugesFactory = await Deploy.deployGaugeFactory(signer);
    const bribesFactory = await Deploy.deployBribeFactory(signer);
    const voter = await Deploy.deployStrVoter(signer, ve.address, baseFactory, gaugesFactory.address, bribesFactory.address);
    const minter = await Deploy.deployStrMinter(signer, ve.address, controller.address, warmingUpPeriod);

    await Misc.runAndWait(() => token.initialMint(FantomAddresses.TreasuryWallet));
    await Misc.runAndWait(() => token.setMinter(minter.address));
    await Misc.runAndWait(() => controller.setVoter(voter.address));

    await Misc.runAndWait(() => voter.initialize(voterTokens, minter.address));
    await Misc.runAndWait(() => ve.setMinterContract(minter.address));
    await Misc.runAndWait(() => minter.initialize(
      minterClaimants,
      minterClaimantsAmounts,
      minterSum
    ));
    await Misc.runAndWait(() => minter.setTeam(
      FantomAddresses.TreasuryWallet
    ));

    return [
      controller,
      token,
      gaugesFactory,
      bribesFactory,
      ve,
      voter,
      minter,
    ];
  }

  public static async deployStrSystemOld(
    signer: SignerWithAddress,
    networkToken: string,
    voterTokens: string[],
    minterClaimants: string[],
    minterClaimantsAmounts: BigNumber[],
    minterSum: BigNumber,
    baseFactory: string,
    warmingUpPeriod: number,
  ) {
    const controller = new Contract("0x326e194c6184b95f71890de65BA61b9BCd288d11", ControllerAbi.abi, signer) as Controller;
    const token = new Contract("0x67910c8E12aE4743a6411ed07Bea78fA4a6859dc", TokenAbi.abi, signer);
    const ve = new Contract("0x78c1a83BE9D01C1D2af35544567eA92DBA9E89db", VeAbi.abi, signer);
    const gaugesFactory = new Contract("0xb410e2eFF9Ce59275376c23cFA51E7aA109a570C", GaugesFactoryAbi.abi, signer);
    const bribesFactory = new Contract("0x9AC8c8074886b1A91E5D0f268313760E1855b799", BribesFactoryAbi.abi, signer);
    const voter = new Contract("0x8FdF45f73f1Ce0acb228d51885e0Cdd1dCB68A73", VoterAbi.abi, signer);
    const minter = new Contract("0xE66a67BCcc74f6B0DAdA02408adA7064cf6657E0", MinterAbi.abi, signer);

    await Misc.runAndWait(() => minter.initialize(
      minterClaimants,
      minterClaimantsAmounts,
      minterSum
    ));
    await Misc.runAndWait(() => minter.setTeam(
      FantomAddresses.TreasuryWallet
    ));

    return [
      controller,
      token,
      gaugesFactory,
      bribesFactory,
      ve,
      voter,
      minter,
    ];
  }

}
