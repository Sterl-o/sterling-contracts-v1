## Sterling
[![codecov](https://codecov.io/gh/dystopia-exchange/dystopia-contracts/branch/master/graph/badge.svg?token=U94WAFLRT7)](https://codecov.io/gh/dystopia-exchange/dystopia-contracts)


Sterling allows low cost, near 0 slippage trades on uncorrelated or tightly correlated assets. The protocol incentivizes fees instead of liquidity. Liquidity providers (LPs) are given incentives in the form of `token`, the amount received is calculated as follows;

* 100% of weekly distribution weighted on votes from ve-token holders

The above is distributed to the `gauge` (see below), however LPs will earn between 40% and 100% based on their own ve-token balance.

LPs with 0 ve* balance, will earn a maximum of 40%.

## AMM

What differentiates Sterling's AMM;

Sterling AMMs are compatible with all the standard features as popularized by Uniswap V2, these include;

* Lazy LP management
* Fungible LP positions
* Chained swaps to route between pairs
* priceCumulativeLast that can be used as external TWAP
* Flashloan proof TWAP
* Direct LP rewards via `skim`
* xy>=k

Sterling adds on the following features;

* 0 upkeep 30 minute TWAPs. This means no additional upkeep is required, you can quote directly from the pair
* Fee split. Fees do not auto accrue, this allows external protocols to be able to profit from the fee claim
* New curve: x3y+y3x, which allows efficient stable swaps
* Curve quoting: `y = (sqrt((27 a^3 b x^2 + 27 a b^3 x^2)^2 + 108 x^12) + 27 a^3 b x^2 + 27 a b^3 x^2)^(1/3)/(3 2^(1/3) x) - (2^(1/3) x^3)/(sqrt((27 a^3 b x^2 + 27 a b^3 x^2)^2 + 108 x^12) + 27 a^3 b x^2 + 27 a b^3 x^2)^(1/3)`
* Routing through both stable and volatile pairs
* Flashloan proof reserve quoting

## token

**TBD**

## ve-token

Vested Escrow (ve), this is the core voting mechanism of the system, used by `BaseV1Factory` for gauge rewards and gauge voting.

This is based off of ve(3,3)

* `deposit_for` deposits on behalf of
* `emit Transfer` to allow compatibility with third party explorers
* balance is moved to `tokenId` instead of `address`
* Locks are unique as NFTs, and not on a per `address` basis

```
function balanceOfNFT(uint) external returns (uint)
```

## BaseV1Pair

Base V1 pair is the base pair, referred to as a `pool`, it holds two (2) closely correlated assets (example MIM-UST) if a stable pool or two (2) uncorrelated assets (example FTM-SPELL) if not a stable pool, it uses the standard UniswapV2Pair interface for UI & analytics compatibility.

```
function mint(address to) external returns (uint liquidity)
function burn(address to) external returns (uint amount0, uint amount1)
function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external
```

Functions should not be referenced directly, should be interacted with via the BaseV1Router

Fees are not accrued in the base pair themselves, but are transfered to `BaseV1Fees` which has a 1:1 relationship with `BaseV1Pair`

### BaseV1Factory

Base V1 factory allows for the creation of `pools` via ```function createPair(address tokenA, address tokenB, bool stable) external returns (address pair)```

Base V1 factory uses an immutable pattern to create pairs, further reducing the gas costs involved in swaps

Anyone can create a pool permissionlessly.

### BaseV1Router

Base V1 router is a wrapper contract and the default entry point into Stable V1 pools.

```

function addLiquidity(
    address tokenA,
    address tokenB,
    bool stable,
    uint amountADesired,
    uint amountBDesired,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) external ensure(deadline) returns (uint amountA, uint amountB, uint liquidity)

function removeLiquidity(
    address tokenA,
    address tokenB,
    bool stable,
    uint liquidity,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) public ensure(deadline) returns (uint amountA, uint amountB)

function swapExactTokensForTokens(
    uint amountIn,
    uint amountOutMin,
    route[] calldata routes,
    address to,
    uint deadline
) external ensure(deadline) returns (uint[] memory amounts)

```

## Gauge

Gauges distribute arbitrary `token(s)` rewards to BaseV1Pair LPs based on voting weights as defined by `ve` voters.

Arbitrary rewards can be added permissionlessly via ```function notifyRewardAmount(address token, uint amount) external```

Gauges are completely overhauled to separate reward calculations from deposit and withdraw. This further protect LP while allowing for infinite token calculations.

Previous iterations would track rewardPerToken as a shift everytime either totalSupply, rewardRate, or time changed. Instead we track each individually as a checkpoint and then iterate and calculation.

## Bribe

Gauge bribes are natively supported by the protocol, Bribes inherit from Gauges and are automatically adjusted on votes.

Users that voted can claim their bribes via calling ```function getReward(address token) public```

Fees accrued by `Gauges` are distributed to `Bribes`

### BaseV1Voter

Gauge factory permissionlessly creates gauges for `pools` created by `BaseV1Factory`. Further it handles voting for 100% of the incentives to `pools`.

```
function vote(address[] calldata _poolVote, uint[] calldata _weights) external
function distribute(address token) external
```

### veSTR distribution recipients

| Name             | Address                                      | Qty           |
|:-----------------|:---------------------------------------------|:--------------|
| xxxxxxxxxx       | 0x0000000000000000000000000000000000000000   | 00,000,000.00 |
| xxxx             | 0x0000000000000000000000000000000000000000   | 0,000,000.00  |
| xxx              | 0x0000000000000000000000000000000000000000   | 0,000,000.00  |
| xxxxxxxxxx       | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxxxxxxx  | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxxxxx    | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxx         | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxxxxx    | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxxx      | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxxxxxxxx | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxx         | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxxxxxx   | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxx        | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxx         | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxx           | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxx        | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxx       | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxx         | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxxxx     | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxx             | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxx         | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxxxxxx   | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxx         | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxx          | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxx             | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxxxxx    | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxx            | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxxxxx     | 0x0000000000000000000000000000000000000000   | 000,000.00    |
| xxxxxxxxx        | 0x0000000000000000000000000000000000000000   | 000,000.00    |


### Goerli deployment

| Name   | Address                                                                                                                                |
|:-------|:---------------------------------------------------------------------------------------------------------------------------------------|
| wETH | [x](https://)   |
| USDT   | [x](https://)   |
| MIM    | [x](https://)   |
| DAI    | [x](https://)   |

| Name                 | Address                                                                                                                               |
|:---------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| StrFactory          | [x](https://)  |
| StrRouter01         | [x](https://)  |
| GovernanceTreasury   | [x](https://)  |
| BribeFactory         | [x](https://)  |
| GaugesFactory        | [x](https://)  |
| STR                 | [x](https://)  |
| StrMinter           | [x](https://)  |
| StrVoter            | [x](https://)  |
| Ve                   | [x](https://)  |
| Controller           | [x](https://)  |


### Arbitrum deployment

| Name                | Address                                                                                                                   |
|:--------------------|:--------------------------------------------------------------------------------------------------------------------------|
| StrFactory          | [0x53E270672a6F6ba16671d70A3FB11E19aE5cAf4f](https://arbiscan.io/address/0x53E270672a6F6ba16671d70A3FB11E19aE5cAf4f)  |
| StrRouter01         | [0xF10C960e5A35C11aA28575B3aC4FEd7a89dD03fF](https://arbiscan.io/address/0xF10C960e5A35C11aA28575B3aC4FEd7a89dD03fF)  |
| GovernanceTreasury  | [0x3cc6bd5c30278393F4f440fb5E9f3CB45e045C65](https://arbiscan.io/address/0x3cc6bd5c30278393F4f440fb5E9f3CB45e045C65)  |
| BribeFactory        | [0xbF4e6Cded720Fc901C1585a231180e1625F01DF7](https://arbiscan.io/address/0xbf4e6cded720fc901c1585a231180e1625f01df7)  |
| GaugesFactory       | [0xe1f1EBB33403292D3D20F5425C43232DDfBe8F85](https://arbiscan.io/address/0xe1f1ebb33403292d3d20f5425c43232ddfbe8f85)  |
| STR                 | [0x065F35BF534c47AEfa23BA71837778cE0a3CA9Ca](https://arbiscan.io/address/0x065f35bf534c47aefa23ba71837778ce0a3ca9ca)  |
| StrMinter           | [0x40C0950353A6141D6C5119fb4268946EE9277a5c](https://arbiscan.io/address/0x40C0950353A6141D6C5119fb4268946EE9277a5c)  |
| StrVoter            | [0xc913cc3c00c9a072dd16e0b7a0db6e7b46dd82d9](https://arbiscan.io/address/0xc913cc3c00c9a072dd16e0b7a0db6e7b46dd82d9)  |
| veSTR               | [0x877b1D69dfB4573b86F9290248950A580d00829B](https://arbiscan.io/address/0x877b1D69dfB4573b86F9290248950A580d00829B)  |
| sterlinglibrary     | [0x988d2829A76D2a2d39BfB4420b55Ba07c380853A](https://arbiscan.io/address/0x988d2829A76D2a2d39BfB4420b55Ba07c380853A)  |
