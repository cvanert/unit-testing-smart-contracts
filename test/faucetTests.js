const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory('Faucet');
    const faucet = await Faucet.deploy();

    const [owner, otherAccount] = await ethers.getSigners();
    const provider = await ethers.getDefaultProvider();

    let withdrawAmount = ethers.parseUnits('1', 'ether');

    return { faucet, owner, otherAccount, provider, withdrawAmount };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it('should not allow withdrawals above .1 ETH at a time', async function () {
    const { faucet, withdrawAmount } = await loadFixture(deployContractAndSetVariables);
    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });

  it('should only allow owner to call destroyFaucet()', async function () {
    const { faucet, otherAccount } = await loadFixture(deployContractAndSetVariables);
    await expect(faucet.connect(otherAccount).destroyFaucet()).to.be.reverted;
  });

  it('should only allow owner to call withdrawAll()', async function () {
    const { faucet, otherAccount } = await loadFixture(deployContractAndSetVariables);
    await expect(faucet.connect(otherAccount).withdrawAll()).to.be.reverted;
  });

  it('should transfer entire balance when owner calls withdrawAll()', async function () {
    const { faucet, owner, provider } = await loadFixture(deployContractAndSetVariables);
    const faucetAddress = await faucet.getAddress();
    let faucetBalance = await ethers.provider.getBalance(faucetAddress);
    await expect(faucet.connect(owner).withdrawAll()).to.changeEtherBalances([faucetAddress, owner], [-faucetBalance, faucetBalance]);
  });
});