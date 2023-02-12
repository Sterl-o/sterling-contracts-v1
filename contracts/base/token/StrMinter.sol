// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "../../lib/Math.sol";
import "../../lib/SafeERC20.sol";
import "../../interface/IUnderlying.sol";
import "../../interface/IVoter.sol";
import "../../interface/IVe.sol";
import "../../interface/IMinter.sol";
import "../../interface/IERC20.sol";
import "../../interface/IController.sol";

/// @title Codifies the minting rules as per ve(3,3),
///        abstracted from the token to support any token that allows minting
contract StrMinter is IMinter {
  using SafeERC20 for IERC20;

  /// @dev Allows minting once per week (reset every Thursday 00:00 UTC)
  uint internal constant _WEEK = 86400 * 7;
  uint internal constant _LOCK_PERIOD = 86400 * 7 * 8; // 8 weeks

  /// @dev Decrease base weekly emission by 1%
  uint internal constant _WEEKLY_EMISSION_DECREASE = 99;
  uint internal constant _WEEKLY_EMISSION_DECREASE_DENOMINATOR = 100;


  /// @dev Weekly emission threshold for the end game. 2% of circulation supply.
  uint internal constant _TAIL_EMISSION = 2;
  uint internal constant _TAIL_EMISSION_DENOMINATOR = 100;

  /// @dev Decrease weekly rewards for ve holders. 10% of the full amount.
  uint internal constant _GROWTH_DIVIDER = 10;

  /// @dev The core parameter for determinate the whole emission dynamic.
  ///       Will be decreased every week.
  uint internal constant _START_BASE_WEEKLY_EMISSION = 25_000e18;


  IUnderlying public immutable token;
  IVe public immutable ve;
  address public immutable controller;
  uint public baseWeeklyEmission = _START_BASE_WEEKLY_EMISSION;
  uint public activePeriod;

  address internal initializer;

  event Mint(
    address indexed sender,
    uint weekly,
    uint growth,
    uint circulatingSupply,
    uint circulatingEmission
  );

  constructor(
    address ve_, // the ve(3,3) system that will be locked into
    address controller_, // controller with veDist and voter addresses
    uint warmingUpPeriod // 2 by default
  ) {
    initializer = msg.sender;
    token = IUnderlying(IVe(ve_).token());
    ve = IVe(ve_);
    controller = controller_;
    activePeriod = (block.timestamp + (warmingUpPeriod * _WEEK)) / _WEEK * _WEEK;
  }

  /// @dev Mint initial supply to holders and lock it to ve token.
  function initialize(
    address[] memory claimants,
    uint[] memory amounts,
    uint totalAmount
  ) external {
    require(initializer == msg.sender, "Not initializer");
    token.mint(address(this), totalAmount);
    token.approve(address(ve), type(uint).max);
    uint sum;
    for (uint i = 0; i < claimants.length; i++) {
      ve.createLockFor(amounts[i], _LOCK_PERIOD, claimants[i]);
      sum += amounts[i];
    }
    require(sum == totalAmount, "Wrong totalAmount");
    initializer = address(0);
    activePeriod = (block.timestamp + _WEEK) / _WEEK * _WEEK;
  }

  function _voter() internal view returns (IVoter) {
    return IVoter(IController(controller).voter());
  }

  /// @dev Calculate circulating supply as total token supply - locked supply - veDist balance - minter balance
  function circulatingSupply() external view returns (uint) {
    return _circulatingSupply();
  }

  function _circulatingSupply() internal view returns (uint) {
    return token.totalSupply() - IUnderlying(address(ve)).totalSupply()
    // exclude balance on minter, it is obviously locked
    - token.balanceOf(address(this));
  }

  /// @dev Emission calculation is 2% of available supply to mint adjusted by circulating / total supply
  function calculateEmission() external view returns (uint) {
    return _calculateEmission();
  }

  function _calculateEmission() internal view returns (uint) {
    // use adjusted circulation supply for avoid first weeks gaps
    // baseWeeklyEmission should be decrease every week
    return baseWeeklyEmission * _circulatingSupply() / token.totalSupply();
  }

  /// @dev Weekly emission takes the max of calculated (aka target) emission versus circulating tail end emission
  function weeklyEmission() external view returns (uint) {
    return _weeklyEmission();
  }

  function _weeklyEmission() internal view returns (uint) {
    return Math.max(_calculateEmission(), _circulatingEmission());
  }

  /// @dev Calculates tail end (infinity) emissions as 0.2% of total supply
  function circulatingEmission() external view returns (uint) {
    return _circulatingEmission();
  }

  function _circulatingEmission() internal view returns (uint) {
    return _circulatingSupply() * _TAIL_EMISSION / _TAIL_EMISSION_DENOMINATOR;
  }

  /// @dev Calculate inflation and adjust ve balances accordingly
  function calculateGrowth(uint _minted) external view returns (uint) {
    return _calculateGrowth(_minted);
  }

  function _calculateGrowth(uint _minted) internal view returns (uint) {
    return IUnderlying(address(ve)).totalSupply() * _minted / token.totalSupply() / _GROWTH_DIVIDER;
  }

  /// @dev Update period can only be called once per cycle (1 week)
  function updatePeriod() external override returns (uint) {
    uint _period = activePeriod;
    // only trigger if new week
    if (block.timestamp >= _period + _WEEK && initializer == address(0)) {
      _period = block.timestamp / _WEEK * _WEEK;
      activePeriod = _period;
      uint _weekly = _weeklyEmission();
      // slightly decrease weekly emission
      baseWeeklyEmission = baseWeeklyEmission
      * _WEEKLY_EMISSION_DECREASE
      / _WEEKLY_EMISSION_DECREASE_DENOMINATOR;

      // REMOVE REBASE
      // uint _growth = _calculateGrowth(_weekly);
      // uint _required = _growth + _weekly;
      uint _teamEmissions = (teamRate * _weekly) / PRECISION;
      uint _required = _weekly + _teamEmissions;
      uint _balanceOf = token.balanceOf(address(this));
      if (_balanceOf < _required) {
        token.mint(address(this), _required - _balanceOf);
      }

      unchecked {
          ++numEpoch;
      }
      if (numEpoch == 208) emission = 999;

      require(token.transfer(team, _teamEmissions));

      // REMOVE REBASE
      // IERC20(address(token)).safeTransfer(address(_veDist()), _growth);
      // _veDist().checkpointToken();
      // _veDist().checkpointTotalSupply();

      token.approve(address(_voter()), _weekly);
      _voter().notifyRewardAmount(_weekly);

      emit Mint(msg.sender, _weekly, _growth, _circulatingSupply(), _circulatingEmission());
    }
    return _period;
  }

}
