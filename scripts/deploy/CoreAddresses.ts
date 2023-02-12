import {
  Str,
  BribeFactory,
  StrFactory,
  GaugeFactory, StrMinter,
  StrRouter01, StrVoter, GovernanceTreasury, Ve, VeDist
} from "../../typechain";

export class CoreAddresses {

  readonly token: Str;
  readonly gaugesFactory: GaugeFactory;
  readonly bribesFactory: BribeFactory;
  readonly factory: StrFactory;
  readonly router: StrRouter01;
  readonly ve: Ve;
  readonly veDist: VeDist;
  readonly voter: StrVoter;
  readonly minter: StrMinter;
  readonly treasury: GovernanceTreasury;


  constructor(token: Str, gaugesFactory: GaugeFactory, bribesFactory: BribeFactory, factory: StrFactory, router: StrRouter01, ve: Ve, veDist: VeDist, voter: StrVoter, minter: StrMinter, treasury: GovernanceTreasury) {
    this.token = token;
    this.gaugesFactory = gaugesFactory;
    this.bribesFactory = bribesFactory;
    this.factory = factory;
    this.router = router;
    this.ve = ve;
    this.veDist = veDist;
    this.voter = voter;
    this.minter = minter;
    this.treasury = treasury;
  }
}
