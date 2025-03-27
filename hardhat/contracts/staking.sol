// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SpToken is ERC20 {
    address public stakingContract;

    constructor(address _stakingContract) ERC20("Staked ETH", "sETH") {
        stakingContract = _stakingContract;
    }

    modifier onlyStakingContract() {
        require(msg.sender == stakingContract, "Only staking contract");
        _;
    }

    function mint(address to, uint256 amount) external onlyStakingContract {
        _mint(to, amount);
    }

    function burnFrom(address account, uint256 amount) external onlyStakingContract {
        _burn(account, amount);
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        require(msg.sender == stakingContract, "Transfers disabled");
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(msg.sender == stakingContract, "Transfers disabled");
        return super.transferFrom(from, to, amount);
    }
}

contract NativeStakingSystem {
    using SafeMath for uint256;

    IERC20 public immutable rewardToken;
    SpToken public immutable spToken;
    uint256 public constant REWARD_PER_SECOND = 1157407407407407407; // 700000/(7*86400)
    uint256 public constant MAX_REWARD = 700_000 * 1e18;

    struct User {
        uint256 lastUpdate;
        uint256 rewardEarned;
    }

    mapping(address => User) public users;
    uint256 public totalRewardReleased;
    uint256 public startTime;
    uint256 public endTime;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _rewardToken) {
        rewardToken = IERC20(_rewardToken);
        spToken = new SpToken(address(this));
        startTime = 1742486400; // 2025-03-21 00:00:00 UTC
        endTime = 1743091200;   // 2025-03-28 00:00:00 UTC
    }

    function stake() external payable {
        require(block.timestamp >= startTime, "Staking not started");
        require(block.timestamp <= endTime, "Staking ended");
        require(msg.value > 0, "Cannot stake 0");
        _updateReward(msg.sender);

        spToken.mint(msg.sender, msg.value);
        emit Staked(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Cannot withdraw 0");
        _updateReward(msg.sender);

        require(spToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        spToken.burnFrom(msg.sender, amount);

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() external {
        _updateReward(msg.sender);
        User storage user = users[msg.sender];
        uint256 reward = user.rewardEarned;

        require(reward > 0, "No rewards");
        require(reward <= rewardToken.balanceOf(address(this)), "Insufficient reward tokens");

        user.rewardEarned = 0;
        totalRewardReleased = totalRewardReleased.add(reward);

        rewardToken.transfer(msg.sender, reward);
        emit RewardPaid(msg.sender, reward);
    }

    function earned(address account) public view returns (uint256) {
        User memory user = users[account];
        uint256 currentBalance = spToken.balanceOf(account);
        uint256 total = spToken.totalSupply();

        if (currentBalance == 0 || total == 0) return user.rewardEarned;

        uint256 currentTime = block.timestamp < endTime ? block.timestamp : endTime;
        uint256 elapsed = currentTime.sub(user.lastUpdate);

        return user.rewardEarned.add(
            elapsed.mul(REWARD_PER_SECOND).mul(currentBalance).div(total)
        );
    }

    function _updateReward(address account) internal {
        users[account].rewardEarned = earned(account);
        users[account].lastUpdate = block.timestamp < endTime ? block.timestamp : endTime;
    }

    function getStakedBalance(address user) external view returns (uint256) {
        return spToken.balanceOf(user);
    }

    function getRemainingReward() external view returns (uint256) {
        return MAX_REWARD.sub(totalRewardReleased);
    }

    receive() external payable {}
}
