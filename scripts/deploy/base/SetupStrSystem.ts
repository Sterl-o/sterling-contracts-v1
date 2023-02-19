import { Deploy } from "../Deploy";
import { ethers } from "hardhat";
import { Verify } from "../../Verify";
import { Misc } from "../../Misc";
import { BigNumber } from "ethers";
import { writeFileSync } from "fs";
import { parseUnits } from "ethers/lib/utils";
import { FantomAddresses } from "../../addresses/FantomAddresses";

const voterTokens = [
    // FantomAddresses.STR_TOKEN,
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1".toLowerCase(), // weth
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8".toLowerCase(), // usdc
    "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9".toLowerCase(), // usdt
    "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8".toLowerCase(), // balancer
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1".toLowerCase(), // dai
    "0x031d35296154279DC1984dCD93E392b1f946737b".toLowerCase(), // cap
    "0x354A6dA3fcde098F8389cad84b0182725c6C91dE".toLowerCase(), // compound
    "0x6FE14d3CC2f7bDdffBa5CdB3BBE7467dd81ea101".toLowerCase(), // coti
    "0xf4D48Ce3ee1Ac3651998971541bAdbb9A14D7234".toLowerCase(), // cream
    "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978".toLowerCase(), // curve
    "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55".toLowerCase(), // dopex
    "0x2338a5d62E9A766289934e8d2e83a443e8065b83".toLowerCase(), // flux
    "0x590020B1005b8b25f1a2C82c5f743c540dcfa24d".toLowerCase(), // gmx
    "0xa0b862F60edEf4452F25B4160F177db44DeB6Cf1".toLowerCase(), // gnosis
    "0x9623063377AD1B27544C965cCd7342f7EA7e88C7".toLowerCase(), // graph
    "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4".toLowerCase(), // chainlink
    "0x539bdE0d7Dbd336b79148AA742883198BBF60342".toLowerCase(), // magic
    "0x2e9a6Df78E42a30712c10a9Dc4b1C8656f8F2879".toLowerCase(), // maker
    "0x6E6a3D8F1AfFAc703B1aEF1F43B8D2321bE40043".toLowerCase(), // olympus
    "0x965772e0E9c84b6f359c8597C891108DcF1c5B1A".toLowerCase(), // pickle
    "0x3E6648C5a70A150A88bCE65F4aD4d506Fe15d2AF".toLowerCase(), // Spell
    "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A".toLowerCase(), // sushi
    "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0".toLowerCase(), // uniswap
    "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f".toLowerCase(), // wbtc
    "0x82e3A8F066a6989666b031d916c43672085b1582".toLowerCase(), // yearn
    "0x74ccbe53F77b08632ce0CB91D3A545bF6B8E0979".toLowerCase(), // fBOMB
    "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F".toLowerCase(), // frax
    "0x9d2F299715D94d8A7E6F5eaa8E654E8c74a988A7".toLowerCase(), // frax share
    "0x0C4681e6C0235179ec3D4F4fc4DF3d14FDD96017".toLowerCase(), // radiant
    "0x6694340fc020c5E6B96567843da2df01b2CE1eb6".toLowerCase(), // STG
    "0x10393c20975cF177a3513071bC110f7962CD67da".toLowerCase(), // Jones
    "0x1622bF67e6e5747b81866fE0b85178a93C7F86e3".toLowerCase(), // Unami
    "0x7F91531fC25DD262aebf57E8EBe9A6a6df372E96".toLowerCase(), // Woof
    "0xf6Ba0043c40Ab8a4AE8eB326E96179bd6089d517".toLowerCase(), // Arboge
    "0xDd8e557C8804D326c72074e987de02A23ae6Ef84".toLowerCase(), // Arbinu
    "0x51318B7D00db7ACc4026C88c3952B66278B6A67F".toLowerCase(), // PLS
    "0x32Eb7902D4134bf98A28b963D26de779AF92A212".toLowerCase(), // Rdpx
    "0x5575552988A3A80504bBaeB1311674fCFd40aD4B".toLowerCase(), // SPA
];

const claimants = [
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
    "0x3Bb9372989c81d56db64e8aaD38401E677b91244",
];

const claimantsAmounts = [
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("2000"),
    parseUnits("15000"),
    parseUnits("15000"),
    parseUnits("15000"),
    parseUnits("15000"),
    parseUnits("15000"),
    parseUnits("15000"),
    parseUnits("15000"),
    parseUnits("15000"),
    parseUnits("15000"),
    parseUnits("15000"),
];

const FACTORY = '0xF7A23B9A9dCB8d0aff67012565C5844C20C11AFC';

async function main() {
    const signer = (await ethers.getSigners())[0];

    let minterMax = BigNumber.from("0");

    for (const c of claimantsAmounts) {
        minterMax = minterMax.add(c);
    }

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
        FantomAddresses.WETH_TOKEN,
        voterTokens,
        claimants,
        claimantsAmounts,
        minterMax,
        FACTORY,
        1
    );

    const data = ''
        + 'controller: ' + controller.address + '\n'
        + 'token: ' + token.address + '\n'
        + 'gaugesFactory: ' + gaugesFactory.address + '\n'
        + 'bribesFactory: ' + bribesFactory.address + '\n'
        + 've: ' + ve.address + '\n'
        + 'voter: ' + voter.address + '\n'
        + 'minter: ' + minter.address + '\n'

    console.log(data);
    writeFileSync('tmp/core.txt', data);

    await Misc.wait(5);

    await Verify.verify(controller.address);
    await Verify.verify(token.address);
    await Verify.verify(gaugesFactory.address);
    await Verify.verify(bribesFactory.address);
    await Verify.verifyWithArgs(ve.address, [token.address, controller.address]);
    await Verify.verifyWithArgs(voter.address, [ve.address, FACTORY, gaugesFactory.address, bribesFactory.address]);
    await Verify.verifyWithArgs(minter.address, [ve.address, controller.address, 1]);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
